// api/analyze-ai.js - Análisis completo con Groq
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

Analiza el siguiente CV contra la descripción del puesto (Job Description) y proporciona un análisis DETALLADO.

**Job Description:**
${jdText.substring(0, 2500)}

**CV:**
${cvText.substring(0, 3500)}

Responde SOLO con un JSON válido en este formato exacto (sin markdown):
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
      "impact": "high"
    },
    {
      "priority": "important",
      "text": "Incluye métricas cuantificables con porcentajes",
      "impact": "medium"
    }
  ],
  "strengths": [
    "Experiencia relevante en el sector",
    "Habilidades técnicas alineadas",
    "Formación académica adecuada"
  ],
  "keywords": {
    "technical": ["Python", "SQL", "AWS"],
    "soft": ["Liderazgo", "Comunicación"],
    "missing": ["Docker", "Kubernetes", "CI/CD"]
  },
  "atsBreakdown": {
    "Workday": {
      "positives": ["Formato cronológico correcto", "Fechas bien formateadas"],
      "negatives": ["Falta sección de certificaciones"],
      "tips": ["Usa formato MM/YYYY para fechas"]
    },
    "Taleo": {
      "positives": ["Texto plano sin tablas"],
      "negatives": ["Muchas columnas detectadas", "Formato complejo"],
      "tips": ["Simplifica el diseño", "Evita tablas"]
    }
  },
  "sectionScores": {
    "experience": 90,
    "education": 85,
    "skills": 75,
    "summary": 80
  },
  "estimatedImprovement": 12,
  "reasoning": "Explicación del análisis"
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Eres un experto en ATS y optimización de CVs. Respondes SOLO con JSON válido, sin markdown ni texto adicional. Proporciona análisis detallados y accionables."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const responseText = completion.choices[0].message.content.trim();
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
      strengths: aiAnalysis.strengths || [],
      keywords: aiAnalysis.keywords || {},
      atsBreakdown: aiAnalysis.atsBreakdown || {},
      sectionScores: aiAnalysis.sectionScores || {},
      estimatedImprovement: aiAnalysis.estimatedImprovement || 0,
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
