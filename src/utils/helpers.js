// api/extract-text.js - Endpoint para extraer texto de PDFs y DOCX
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+?)(?:;|$)/);
    
    if (!boundaryMatch) {
      return res.status(400).json({ error: 'No boundary found' });
    }
    
    const boundary = boundaryMatch[1].trim();
    const parts = buffer.toString('binary').split(`--${boundary}`);
    
    let extractedText = '';

    for (const part of parts) {
      if (!part || part === '--\r\n' || part === '--') continue;

      const [header, ...bodyParts] = part.split('\r\n\r\n');
      if (!header) continue;

      const filenameMatch = header.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1];

      if (!filename) continue;

      const body = bodyParts.join('\r\n\r\n').replace(/\r\n--$/, '');
      const fileBuffer = Buffer.from(body, 'binary');

      try {
        if (filename.endsWith('.pdf')) {
          extractedText = await extractTextFromPDF(fileBuffer);
        } else if (filename.endsWith('.docx')) {
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          extractedText = result.value;
        } else {
          return res.status(400).json({ 
            error: 'Formato no soportado. Usa PDF o DOCX' 
          });
        }
      } catch (fileError) {
        console.error('File processing error:', fileError);
        return res.status(400).json({ 
          error: `Error procesando archivo: ${fileError.message}`,
          suggestion: 'Intenta con otro archivo o usa el modo texto'
        });
      }
    }

    if (!extractedText) {
      return res.status(400).json({ 
        error: 'No se pudo extraer texto del archivo' 
      });
    }

    res.json({
      success: true,
      text: extractedText.trim(),
      length: extractedText.length
    });

  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Error del servidor',
      message: error.message 
    });
  }
}
