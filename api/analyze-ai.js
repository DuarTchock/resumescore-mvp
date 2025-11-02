// api/analyze-ai.js - Análisis con Groq (GRATIS)
import { createRequire } from 'module';
import Groq from 'groq-sdk';

const require = createRequire(import.meta.url);
const PDFParser = require('pdf2json');
const mammoth = require('mammoth');

export const config = { api: { bodyParser: false } };

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

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

async function analyzeWithAI(cvText, jdText) {
  const prompt = `Eres un experto en sistemas ATS (Applicant Tracking Systems) y optimización de CVs.

Analiza el siguiente CV contra la descripción del puesto (Job Description) y proporciona:

1. Un porcentaje de coincidencia general (0-100)
2. Scores específicos para estos 10 ATS: Workday, Greenhouse, iCIMS, Lever, SAP SuccessFactors, BambooHR, Taleo, Jobvite, Bullhorn, Workable
3. 3-5 recomendaciones específicas y accionables para mejorar el CV

**Job Description:**
${jdText.substring(0, 2000)}

**CV:**
${cvText.substring(0, 3000)}

Responde SOLO con un JSON válido en este formato exacto (sin markdown, sin texto adicional):
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
    "Agrega la palabra clave 'gestión de equipos' que aparece 3 veces en el JD",
    "Incluye métricas cuantificables con porcentajes",
    "Reformatea las fechas a MM/YYYY para mejor parsing"
  ],
  "reasoning": "Explicación breve del análisis"
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Modelo gratis y potente
      messages: [
        {
          role: "system",
          content: "Eres un experto en ATS y optimización de CVs. Respondes SOLO con JSON válido, sin markdown ni texto adicional."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Limpiar markdown si viene con ```json
    const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const analysis = JSON.parse(jsonText);
    return analysis;
    
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new Error('Error al analizar con AI: ' + error.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // Verificar API key
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ 
      error: 'Groq API key no configurada',
      suggestion: 'Configura GROQ_API_KEY en las variables de entorno de Vercel (gratis en console.groq.com)'
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
            error: `Error procesando archivo: ${fileError.message}`,
            suggestion: 'Intenta con un archivo DOCX'
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

    // Análisis con AI
    console.log('Iniciando análisis con Groq AI...');
    const aiAnalysis = await analyzeWithAI(cvText, jdText);
    
    const average = Math.round(
      Object.values(aiAnalysis.scores).reduce((a,b) => a+b, 0) / 
      Object.keys(aiAnalysis.scores).length
    );

    res.json({
      success: true,
      matchRate: aiAnalysis.matchRate,
      scores: aiAnalysis.scores,
      average,
      recommendations: aiAnalysis.recommendations,
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
