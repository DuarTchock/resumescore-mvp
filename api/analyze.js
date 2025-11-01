// api/analyze.js
import { createRequire } from 'module';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const require = createRequire(import.meta.url);
const mammoth = require('mammoth');

export const config = { api: { bodyParser: false } };

async function extractTextFromPDF(buffer) {
  try {
    const data = new Uint8Array(buffer);
    const pdf = await getDocument({ data, useSystemFonts: true }).promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      text += pageText + '\n';
    }
    
    return text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Error al procesar PDF');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString();

    const boundaryMatch = req.headers['content-type']?.match(/boundary=([^;]+)/);
    if (!boundaryMatch) return res.status(400).json({ error: 'No boundary' });
    const boundary = boundaryMatch[1];
    const boundaryStr = `--${boundary}`;

    const parts = body.split(boundaryStr).slice(1, -1);
    let cvText = '';
    let jdText = '';

    for (const part of parts) {
      const lines = part.trim().split('\r\n');
      if (lines.length < 4) continue;

      const disposition = lines[0];
      const emptyLineIndex = lines.findIndex(l => l === '');
      if (emptyLineIndex === -1) continue;

      const content = lines.slice(emptyLineIndex + 1).join('\r\n').trim();
      const nameMatch = disposition.match(/name="([^"]+)"/);
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      const name = nameMatch?.[1];
      const filename = filenameMatch?.[1] || '';

      if (name === 'jd') jdText = content;
      else if (name === 'cv' && content) {
        const buffer = Buffer.from(content, 'binary');

        if (filename.endsWith('.pdf')) {
          cvText = await extractTextFromPDF(buffer);
        } else if (filename.endsWith('.docx')) {
          const result = await mammoth.extractRawText({ buffer });
          cvText = result.value;
        }
      }
    }

    if (!cvText || !jdText) return res.status(400).json({ error: 'Falta CV o JD' });

    const clean = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ');
    const cv = clean(cvText);
    const jd = clean(jdText);

    const jdWords = jd.match(/\b\w{4,}\b/g) || [];
    const cvWords = cv.match(/\b\w{4,}\b/g) || [];
    const matchRate = jdWords.length ? (jdWords.filter(w => cvWords.includes(w)).length / jdWords.length) * 100 : 0;

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

    const missing = jdWords.filter(w => !cvWords.includes(w)).slice(0, 3);
    const tips = [];
    if (missing.length) tips.push(`Añade: "${missing.join('", "')}"`);
    if (!cv.includes('gerente') && jd.includes('gerente')) tips.push('Incluye "Gerente" en título');
    if (!cv.match(/\d+%/g)) tips.push('Agrega métricas: "Aumenté X en Y%"');

    res.json({
      success: true,
      matchRate: Math.round(matchRate),
      scores,
      average: Math.round(Object.values(scores).reduce((a,b) => a+b, 0)/10),
      recommendations: tips.slice(0, 3)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error: ' + error.message });
  }
}