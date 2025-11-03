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
      "impact": "high",
      "section": "experience",
      "example": "• Gestioné equipos multidisciplinarios de 15+ personas, mejorando productividad en 30%"
    },
    {
      "priority": "important",
      "text": "Incluye métricas cuantificables con porcentajes",
      "impact": "medium",
      "section": "experience",
      "example": "• Incrementé ventas en 45% ($2M → $2.9M) mediante estrategia de marketing digital"
    },
    {
      "priority": "important",
      "text": "Agrega certificaciones relevantes",
      "impact": "medium",
      "section": "education",
      "example": "• AWS Certified Solutions Architect (2023)\n• PMP - Project Management Professional (2022)"
    },
    {
      "priority": "normal",
      "text": "Reformatea fechas a MM/YYYY",
      "impact": "low",
      "section": "format",
      "example": "Correcto: 01/2020 - 12/2023\nIncorrecto: Enero 2020 - Diciembre 2023"
    },
    {
      "priority": "normal",
      "text": "Usa bullets en lugar de párrafos",
      "impact": "low",
      "section": "format",
      "example": "• Logro específico con métrica\n• Acción + Resultado cuantificable\n• Impacto en el negocio"
    }
  ],
  "strengths": [
    "Experiencia directa de 5+ años en el sector tecnológico",
    "Habilidades técnicas altamente alineadas: Python, SQL, AWS",
    "Historial comprobado de liderazgo de equipos (15+ personas)",
    "Formación académica sólida: MBA + Ingeniería",
    "Certificaciones relevantes para el puesto",
    "Métricas cuantificables en experiencia laboral",
    "Conocimiento de metodologías ágiles (Scrum, Kanban)"
  ],
  "keywords": {
    "technical": {
      "found": ["Python", "SQL", "AWS", "React", "Docker"],
      "missing": ["Kubernetes", "CI/CD", "Terraform"]
    },
    "soft": {
      "found": ["Liderazgo", "Comunicación", "Trabajo en equipo"],
      "missing": ["Negociación", "Pensamiento estratégico"]
    },
    "industry": {
      "found": ["Fintech", "SaaS", "API"],
      "missing": ["Blockchain", "Machine Learning"]
    }
  },
  "atsBreakdown": {
    "Workday": {
      "score": 87,
      "positives": [
        "Formato cronológico inverso correcto",
        "Fechas bien formateadas en MM/YYYY",
        "Secciones claramente definidas",
        "Uso adecuado de headers"
      ],
      "negatives": [
        "Falta sección de certificaciones",
        "Algunos bullets sin métricas"
      ],
      "tips": [
        "Agrega una sección 'Certifications' después de Education",
        "Incluye números y porcentajes en cada bullet point",
        "Usa verbos de acción al inicio de cada bullet"
      ]
    },
    "Greenhouse": {
      "score": 85,
      "positives": [
        "Keywords bien distribuidas",
        "Experiencia relevante destacada",
        "Formato limpio y legible"
      ],
      "negatives": [
        "Faltan skills específicos mencionados en JD",
        "Summary profesional muy genérico"
      ],
      "tips": [
        "Personaliza el summary para este puesto específico",
        "Agrega las keywords exactas del JD en tu sección de skills",
        "Menciona proyectos relevantes con resultados"
      ]
    },
    "iCIMS": {
      "score": 82,
      "positives": [
        "Texto plano sin formato complejo",
        "Keywords presentes en contexto",
        "Educación bien documentada"
      ],
      "negatives": [
        "Falta densidad de keywords en experiencia reciente",
        "Algunos títulos de trabajo no coinciden exactamente"
      ],
      "tips": [
        "Usa los títulos exactos del JD cuando sean aplicables",
        "Aumenta frecuencia de keywords en últimos 2 trabajos",
        "Incluye acrónimos y versiones completas (ej: 'AI' y 'Artificial Intelligence')"
      ]
    },
    "Lever": {
      "score": 88,
      "positives": [
        "Estructura clara y navegable",
        "Progresión de carrera evidente",
        "Skills técnicos bien detallados"
      ],
      "negatives": [
        "Faltan links a portfolio o LinkedIn",
        "Achievements podrían ser más específicos"
      ],
      "tips": [
        "Incluye URL de LinkedIn y portfolio profesional",
        "Transforma responsabilidades en logros medibles",
        "Usa formato STAR (Situation, Task, Action, Result)"
      ]
    },
    "SAP SuccessFactors": {
      "score": 80,
      "positives": [
        "Información completa y detallada",
        "Historial laboral sin gaps",
        "Educación formal verificable"
      ],
      "negatives": [
        "Demasiado texto, poca jerarquía visual",
        "Faltan soft skills explícitas"
      ],
      "tips": [
        "Acorta bullets a máximo 2 líneas cada uno",
        "Agrega sección de 'Core Competencies' con soft skills",
        "Usa sub-headers para mejor escaneabilidad"
      ]
    },
    "BambooHR": {
      "score": 90,
      "positives": [
        "Formato friendly y fácil de leer",
        "Balance perfecto de keywords",
        "Experiencia reciente muy relevante",
        "Achievements con impacto claro"
      ],
      "negatives": [
        "Pocos detalles en educación continua"
      ],
      "tips": [
        "Añade cursos online, workshops, o conferencias recientes",
        "Menciona libros o recursos de aprendizaje relevantes"
      ]
    },
    "Taleo": {
      "score": 78,
      "positives": [
        "Texto simple sin tablas",
        "Keywords frecuentes y bien ubicadas",
        "No usa gráficos o elementos visuales complejos"
      ],
      "negatives": [
        "Detectadas algunas columnas (evitar en Taleo)",
        "Formato podría ser más simple aún",
        "Algunos caracteres especiales detectados"
      ],
      "tips": [
        "Usa solo bullets simples (-, •, *)",
        "Evita totalmente tablas, columnas, text boxes",
        "Guarda como .docx en lugar de PDF si es posible",
        "Usa solo fuentes estándar (Arial, Calibri, Times)"
      ]
    },
    "Jobvite": {
      "score": 84,
      "positives": [
        "Social proof presente (menciones de empresas conocidas)",
        "Skills modernos y actualizados",
        "Experiencia en startups/tech bien destacada"
      ],
      "negatives": [
        "Falta presencia digital (GitHub, Medium, etc)",
        "Pocos detalles de proyectos específicos"
      ],
      "tips": [
        "Agrega links a proyectos open source",
        "Menciona presentaciones, blogs o contenido técnico",
        "Incluye contribuciones a comunidades tech"
      ]
    },
    "Bullhorn": {
      "score": 81,
      "positives": [
        "Información de contacto completa",
        "Experiencia bien documentada",
        "Skills variados y relevantes"
      ],
      "negatives": [
        "Faltan detalles de industria específica",
        "No hay mención de herramientas/software específicas"
      ],
      "tips": [
        "Especifica industria/vertical en cada puesto",
        "Lista herramientas exactas usadas (no solo lenguajes)",
        "Menciona tamaño de empresa y contexto del rol"
      ]
    },
    "Workable": {
      "score": 86,
      "positives": [
        "Presentación moderna y profesional",
        "Keywords estratégicamente ubicadas",
        "Balance entre técnico y narrativo",
        "Experiencia internacional visible"
      ],
      "negatives": [
        "Pocos idiomas listados",
        "Falta información sobre trabajo remoto"
      ],
      "tips": [
        "Agrega sección de idiomas con nivel de dominio",
        "Menciona experiencia con equipos distribuidos/remotos",
        "Especifica zonas horarias manejadas si aplica"
      ]
    }
  },
  "sectionScores": {
    "summary": 80,
    "experience": 90,
    "education": 85,
    "skills": 75,
    "certifications": 70,
    "projects": 88
  },
  "improvementPath": {
    "current": 82,
    "potential": 94,
    "steps": [
      {
        "action": "Agregar keywords faltantes críticos",
        "impact": "+4%",
        "timeframe": "10 minutos"
      },
      {
        "action": "Incluir métricas en todos los bullets",
        "impact": "+3%",
        "timeframe": "30 minutos"
      },
      {
        "action": "Agregar sección de certificaciones",
        "impact": "+2%",
        "timeframe": "5 minutos"
      },
      {
        "action": "Optimizar formato para Taleo",
        "impact": "+3%",
        "timeframe": "20 minutos"
      }
    ]
  },
  "atsDetectionGuide": {
    "signals": [
      "URL del portal de aplicación",
      "Formularios de aplicación requeridos",
      "Campos personalizados",
      "Diseño de la página de carreras"
    ],
    "commonSystems": {
      "Workday": "URL contiene 'myworkdayjobs.com'",
      "Greenhouse": "URL contiene 'greenhouse.io' o 'boards.greenhouse.io'",
      "Lever": "URL contiene 'lever.co' o 'jobs.lever.co'",
      "Taleo": "URL contiene 'taleo.net'",
      "iCIMS": "URL contiene 'icims.com'"
    }
  },
  "reasoning": "El CV muestra sólida experiencia técnica y de liderazgo. Los scores más bajos (Taleo, SAP) se deben principalmente a formato, no a contenido. Con ajustes menores de formato y keywords, este CV puede alcanzar 94% de match promedio."
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
