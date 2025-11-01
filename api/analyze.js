// api/analyze.js
import pdf from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Leer raw body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const body = Buffer.concat(chunks);

    // Parsear multipart manualmente
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    if (!boundary) throw new Error('No boundary');

    const parts = body.toString().split(`--${boundary}`).slice(1, -1);
    let cvText = '';
    let jdText = '';

    for (const part of parts) {
      const [header, content] = part.split('\r\n\r\n', 2);
      if (!content) continue;

      const nameMatch = header.match(/name="([^"]+)"/);
      const filenameMatch = header.match(/filename="([^"]+)"/);
      const name = nameMatch?.[1];
      const filename = filenameMatch?.[1] || '';

      if (name === 'jd') {
        jdText = content.trim();
      } else if (name === 'cv' && content) {
        const fileBuffer = Buffer.from(content, 'binary');

        if (filename.endsWith('.pdf')) {
          const data = await pdf(fileBuffer);
          cvText = data.text;
        } else if (filename.endsWith('.docx')) {
          // .docx → extraer texto plano (fallback)
          const text = fileBuffer.toString('latin1');
          cvText = text.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ');
        }
      }
    }

    if (!cvText || !jdText) {
      return res.status(400).json({ error: 'Falta CV o JD' });
    }

    // Normalizar
    const clean = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ');
    const cv = clean(cvText);
    const jd = clean(jdText);

    // Keywords
    const jdWords = jd.match(/\b\w{4,}\b/g) || [];
    const cvWords = cv.match(/\b\w{4,}\b/g) || [];
    const matched = jdWords.filter(w => cvWords.includes(w));
    const matchRate = jdWords.length ? (matched.length / jdWords.length) * 100 : 0;

    // 10 ATS Scores
    const scores = {
      Workday: Math.round(85 + matchRate * 0.15 + (cv.includes('mm/yyyy') ? 5 : 0)),
      Greenhouse: Math.round(82 + matchRate * 0.18),
      iCIMS: Math.round(80 + matchRate * 0.20),
      Lever: Math.round(83 + matchRate * 0.17),
      'SAP SuccessFactors': Math.round(78 + matchRate * 0.22),
      BambooHR: Math.round(86 + matchRate * 0.14),
      Taleo: Math.round(75 + matchRate * 0.25 + (!cv.includes('table') ? 6 : -5)),
      Jobvite: Math.round(81 + matchRate * 0.19),
      Bullhorn: Math.round(79 + matchRate * 0.21),
      Workable: Math.round(84 + matchRate * 0.16),
    };

    // IA: Recomendaciones
    const missing = jdWords.filter(w => !cvWords.includes(w)).slice(0, 3);
    const tips = [];
    if (missing.length) tips.push(`Añade: "${missing.join('", "')}"`);
    if (!cv.includes('gerente') && jd.includes('gerente')) tips.push('Incluye "Gerente" en título');
    if (!cv.match(/\d+%/g)) tips.push('Agrega métricas: "Aumenté X en Y%"');
    if (cv.includes('table')) tips.push('Elimina tablas');

    res.status(200).json({
      success: true,
      matchRate: Math.round(matchRate),
      scores,
      average: Math.round(Object.values(scores).reduce((a,b) => a+b, 0)/10),
      recommendations: tips.slice(0, 3)
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Error procesando archivo: ' + error.message });
  }
}