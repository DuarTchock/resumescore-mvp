// api/analyze-ai.js - Análisis completo mejorado
import { createRequire } from 'module';
import Groq from 'groq-sdk';

const require = createRequire(import.meta.url);
const PDFParser = require('pdf2json');
const mammoth = require('mammoth');

export const config = { api: { bodyParser: false } };

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// === FUNCIÓN SEGURA PARA DECODIFICAR TEXTO DE PDF ===
function safeDecode(encoded) {
  if (!encoded) return '';

  let decoded = encoded;

  // 1. %uXXXX → Unicode (ej: %u00E1 → á)
  decoded = decoded.replace(/%u([0-9A-F]{4})/gi, (_, code) => {
    try {
      return String.fromCharCode(parseInt(code, 16));
    } catch {
      return '';
    }
  });

  // 2. %XX → Carácter (ej: %20 → espacio)
  decoded = decoded.replace(/%([0-9A-F]{2})/gi, (_, code) => {
    try {
      return String.fromCharCode(parseInt(code, 16));
    } catch {
      return '';
    }
  });

  // 3. Elimina % malformados (%, %G, %1, etc.)
  decoded = decoded.replace(/%[0-9A-F]?/gi, '');

  // 4. Elimina caracteres de control
  return decoded.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

// === EXTRACCIÓN DE TEXTO DE PDF ===
async function extractTextFromPDF(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', errData => {
      console.error('PDF Parser Error:', errData.parserError);
      reject(new Error('Error al parsear el PDF'));
    });

    pdfParser.on('pdfParser_dataReady', pdfData => {
      try {
        let text = '';

        pdfData.Pages.forEach(page => {
          if (!page.Texts) return;

          page.Texts.forEach(textItem => {
            if (textItem.R && textItem.R[0] && textItem.R[0].T) {
              text += safeDecode(textItem.R[0].T) + ' ';
            }
          });
        });

        // Limpieza final
        text = text
          .replace(/\s+/g, ' ')
          .trim();

        resolve(text);
      } catch (err) {
        console.error('Error en dataReady:', err);
        reject(err);
      }
    });

    try {
      pdfParser.parseBuffer(buffer);
    } catch (err) {
      reject(new Error('Buffer inválido para PDF'));
    }
  });
}

// === ANÁLISIS CON GROQ ===
async function analyzeWithAI(cvText, jdText) {
  const prompt = `Eres el mejor experto mundial en ATS (Applicant Tracking Systems) y optimización de CVs. Analiza profundamente el CV y genera un reporte detallado y accionable.

**Job Description:**
${jdText.substring(0, 2500)}

**CV:**
${cvText.substring(0, 3500)}

Responde SOLO con un JSON válido en este formato exacto (sin markdown, sin explicaciones adicionales):
{
  "matchRate": 85,
  "scores": {
    "Workday": 87,
    "Greenhouse": 85,
    "iCIMS": 82,
    "Lever": 88,
    "SAP SuccessFactors": 80,
    "BambooHR": 90,
    "Taleo": 78,
    "Jobvite": 84,
    "Bullhorn": 81,
    "Workable": 86
  },
  "recommendations": [
    {
      "priority": "critical",
      "text": "Agrega la palabra clave 'gestión de equipos' que aparece 5 veces en el JD",
      \n"impact": "high",
      "section": "experience",
      "example": "• Gestioné equipos multidisciplinarios de 15+ personas, mejorando productividad en 30%"
    },
    ...
  ],
  "strengths": [...],
  "keywords": { ... },
  "atsBreakdown": { ... },
  "sectionScores": { ... },
  "improvementPath": { ... },
  "atsDetectionGuide": { ... },
  "reasoning": "El CV muestra sólida experiencia técnica..."
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Eres el experto #1 mundial en ATS y optimización de CVs. Das análisis profundos, detallados y 100% accionables. SIEMPRE proporcionas ejemplos concretos en cada recomendación. Respondes SOLO con JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 3000
    });

    const responseText = completion.choices[0].message.content.trim();
    const jsonText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let analysis;
    try {
      analysis = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error('JSON Parse Error:', parseErr);
      console.error('Raw response:', jsonText);
      throw new Error('Respuesta de AI no es JSON válido');
    }

    return analysis;

  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('Error al analizar con AI: ' + error.message);
  }
}

// === HANDLER PRINCIPAL ===
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ 
      error: 'Groq API key no configurada',
      suggestion: 'Configura GROQ_API_KEY en las variables de entorno de Vercel'
    });
  }

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

      const body = bodyParts.join('\r\n\r\n').replace(/\r\n--$/, '').trim();

      if (name === 'jd') {
        jdText = body;
      } else if (name === 'cv' && filename) {
        try {
          const fileBuffer = Buffer.from(body, 'binary');

          if (filename.endsWith('.pdf')) {
            cvText = await extractTextFromPDF(fileBuffer);
          } else if (filename.endsWith('.docx')) {
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            cvText = result.value;
          } else {
            return res.status(400).json({ error: 'Formato no soportado. Usa PDF o DOCX' });
          }
        } catch (fileError) {
          console.error('File processing error:', fileError);
          return res.status(400).json({ 
            error: `Error procesando archivo: ${fileError.message}`,
            suggestion: 'Verifica que el archivo no esté corrupto o protegido'
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

    const aiAnalysis = await analyzeWithAI(cvText, jdText);
    
    const average = Math.round(
      Object.values(aiAnalysis.scores).reduce((a, b) => a + b, 0) / 
      Object.keys(aiAnalysis.scores).length
    );

    res.json({
      success: true,
      matchRate: aiAnalysis.matchRate,
      scores: aiAnalysis.scores,
      average,
      recommendations: aiAnalysis.recommendations,
      strengths: aiAnalysis.strengths || [],
      keywords: aiAnalysis.keywords || {},
      atsBreakdown: aiAnalysis.atsBreakdown || {},
      sectionScores: aiAnalysis.sectionScores || {},
      improvementPath: aiAnalysis.improvementPath || {},
      atsDetectionGuide: aiAnalysis.atsDetectionGuide || {},
      reasoning: aiAnalysis.reasoning,
      poweredBy: 'Groq Llama 3.3 70B'
    });

  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Error del servidor',
      message: error.message 
    });
  }
}