// api/analyze.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PDFParser = require('pdf2json');
const mammoth = require('mammoth');

export const config = { api: { bodyParser: false } };

async function extractTextFromPDF(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataError', errData => {
      reject(new Error(errData.parserError));
    });
    
    pdfParser.on('pdfParser_dataReady', pdfData => {
      try {
        let text = '';
        pdfData.Pages.forEach(page => {
          page.Texts.forEach(textItem => {
            text += decodeURIComponent(textItem.R[0].T) + ' ';
          });
        });
        resolve(text);
      } catch (err) {
        reject(err);
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+?)(?:;|$)/);
    if (!boundaryMatch) return res.status(400).json({ error: 'No boundary found' });
    
    const boundary = boundaryMatch[1].trim();
    const parts = buffer.toString('binary').split(`--${boundary}`);
    
    let cvText = '';
    let jdText = '';

    for (const part of parts) {
      if (!part || part === '--\r\n' || part === '--') continue;

      const [header, ...bodyParts] = part.split('\r\n\r\n');
      if (!header) continue;

      const nameMatch = header.match(/name="([^"]+)"/);
      const filenameMatch = header.match(/filename="([^"]+)"/);
      const name = nameMatch?.[1];
      const filename = filenameMatch?.[1];

      if (!name) continue;

      const body = bodyParts.join('\r\n\r\n').replace(/\r\n--$/, '');

      if (name === 'jd') {
        jdText = body.trim();
      } else if (name === 'cv' && filename) {
        try {
          if (filename.endsWith('.pdf')) {
            const pdfBuffer = Buffer.from(body, 'binary');
            cvText = await extractTextFromPDF(pdfBuffer);
          } else if (filename.endsWith('.docx')) {
            const docxBuffer = Buffer.from(body, 'binary');
            const result = await mammoth.extractRawText({ buffer: docxBuffer });
            cvText = result.value;
          }
        } catch (fileError) {
          console.error('File processing error:', fileError);
          return res.status(400).json({ 
            error: `Error procesando archivo: ${fileError.message}` 
          });
        }
      }
    }

    if (!cvText || !jdText) {
      return res.status(400).json({ 
        error: 'Falta CV o descripción del puesto',
        details: { hasCv: !!cvText, hasJd: !!jdText }
      });
    }

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
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Error del servidor',
      message: error.message 
    });
  }
}
