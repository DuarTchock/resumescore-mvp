// api/extract-text.js - Endpoint para extraer texto de PDFs y DOCX
import PDFParser from 'pdf2json';
import mammoth from 'mammoth';

// Configuración para deshabilitar el bodyParser de Vercel
export const config = { 
  api: { 
    bodyParser: false 
  } 
};

/**
 * Extrae texto de un buffer PDF
 */
async function extractTextFromPDF(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    
    pdfParser.on('pdfParser_dataError', errData => {
      reject(new Error(errData.parserError || 'Error parsing PDF'));
    });
    
    pdfParser.on('pdfParser_dataReady', pdfData => {
      try {
        let text = '';
        pdfData.Pages.forEach(page => {
          page.Texts.forEach(textItem => {
            textItem.R.forEach(run => {
              text += decodeURIComponent(run.T) + ' ';
            });
          });
        });
        resolve(text.trim());
      } catch (err) {
        reject(new Error('Error processing PDF data: ' + err.message));
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}

/**
 * Extrae texto de un buffer DOCX
 */
async function extractTextFromDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  } catch (error) {
    throw new Error('Error extracting DOCX text: ' + error.message);
  }
}

/**
 * Handler principal de la API
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Solo POST.' });
  }

  try {
    // Leer el body completo
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Obtener boundary del multipart/form-data
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+?)(?:;|$)/);
    
    if (!boundaryMatch) {
      return res.status(400).json({ 
        error: 'Formato de solicitud inválido. Se requiere multipart/form-data.' 
      });
    }
    
    const boundary = boundaryMatch[1].trim();
    const parts = buffer.toString('binary').split(`--${boundary}`);
    
    let extractedText = '';
    let fileName = '';

    // Procesar cada parte del multipart
    for (const part of parts) {
      if (!part || part === '--\r\n' || part === '--') continue;

      const [header, ...bodyParts] = part.split('\r\n\r\n');
      if (!header) continue;

      const filenameMatch = header.match(/filename="([^"]+)"/);
      fileName = filenameMatch?.[1];

      if (!fileName) continue;

      const body = bodyParts.join('\r\n\r\n').replace(/\r\n--$/, '');
      const fileBuffer = Buffer.from(body, 'binary');

      try {
        if (fileName.toLowerCase().endsWith('.pdf')) {
          console.log('Procesando PDF:', fileName);
          extractedText = await extractTextFromPDF(fileBuffer);
        } else if (fileName.toLowerCase().endsWith('.docx')) {
          console.log('Procesando DOCX:', fileName);
          extractedText = await extractTextFromDOCX(fileBuffer);
        } else {
          return res.status(400).json({ 
            error: 'Formato no soportado. Solo se aceptan archivos PDF o DOCX.',
            fileName: fileName
          });
        }
      } catch (fileError) {
        console.error('Error procesando archivo:', fileError);
        return res.status(400).json({ 
          error: `Error al procesar el archivo: ${fileError.message}`,
          suggestion: 'Intenta con otro archivo o usa el modo de entrada de texto.',
          fileName: fileName
        });
      }
    }

    if (!extractedText) {
      return res.status(400).json({ 
        error: 'No se pudo extraer texto del archivo. El archivo puede estar vacío o dañado.' 
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      text: extractedText,
      length: extractedText.length,
      fileName: fileName
    });

  } catch (error) {
    console.error('Error del servidor:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message,
      suggestion: 'Por favor, intenta nuevamente o contacta al soporte.'
    });
  }
}