// api/analyze-ai.js - Análisis completo mejorado con prompt detallado
import PDFParser from 'pdf2json';
import mammoth from 'mammoth';
import Groq from 'groq-sdk';

export const config = { api: { bodyParser: false } };

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// === FUNCIÓN SEGURA PARA DECODIFICAR TEXTO DE PDF ===
function safeDecode(encoded) {
  if (!encoded) return '';
  let decoded = encoded;
  decoded = decoded.replace(/%u([0-9A-F]{4})/gi, (_, code) => {
    try {
      return String.fromCharCode(parseInt(code, 16));
    } catch {
      return '';
    }
  });
  decoded = decoded.replace(/%([0-9A-F]{2})/gi, (_, code) => {
    try {
      return String.fromCharCode(parseInt(code, 16));
    } catch {
      return '';
    }
  });
  decoded = decoded.replace(/%[0-9A-F]?/gi, '');
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
        text = text.replace(/\s+/g, ' ').trim();
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

// === ANÁLISIS CON GROQ - PROMPT MEJORADO Y DETALLADO ===
async function analyzeWithAI(cvText, jdText) {
  const prompt = `Eres el experto #1 mundial en ATS y optimización de CVs. Analiza este CV contra la Job Description y genera un reporte COMPLETO y DETALLADO.

**JOB DESCRIPTION:**
${jdText.substring(0, 2500)}

**CURRICULUM VITAE:**
${cvText.substring(0, 3500)}

INSTRUCCIONES CRÍTICAS:
1. Analiza TODOS los aspectos: keywords, experiencia, educación, skills técnicos y blandos
2. Genera AL MENOS 10-15 recomendaciones específicas y accionables con EJEMPLOS concretos
3. Identifica MÍNIMO 5 fortalezas del candidato
4. Lista keywords encontrados Y faltantes para cada categoría
5. Proporciona scores realistas para TODOS los 10 ATS
6. Crea una ruta de mejora con pasos específicos
7. Genera breakdown detallado para cada ATS

Responde SOLO con JSON válido (sin markdown). Formato EXACTO:

{
  "matchRate": 78,
  "scores": {
    "Workday": 82,
    "Greenhouse": 79,
    "iCIMS": 75,
    "Lever": 81,
    "SAP SuccessFactors": 73,
    "BambooHR": 85,
    "Taleo": 71,
    "Jobvite": 77,
    "Bullhorn": 74,
    "Workable": 80
  },
  "recommendations": [
    {
      "priority": "critical",
      "text": "Agrega la keyword 'gestión de proyectos ágiles' que aparece 4 veces en el JD pero 0 en tu CV",
      "impact": "high",
      "section": "experience",
      "example": "• Lideré 8 proyectos ágiles con equipos de 12+ personas, logrando entregas 25% más rápidas usando metodología Scrum"
    },
    {
      "priority": "important",
      "text": "Incluye métricas cuantificables en tu experiencia actual",
      "impact": "medium",
      "section": "experience",
      "example": "• Aumenté conversión de ventas en 34% implementando estrategia de email marketing automatizado"
    },
    {
      "priority": "critical",
      "text": "Agrega certificación en [tecnología del JD] para aumentar credibilidad",
      "impact": "high",
      "section": "education",
      "example": "Certificación profesional en AWS Solutions Architect (2024)"
    }
  ],
  "strengths": [
    "Experiencia sólida de 5+ años en desarrollo de software",
    "Dominio comprobado de Python, React y Node.js",
    "Historial de liderazgo de equipos multidisciplinarios",
    "Certificaciones relevantes en tecnologías cloud",
    "Experiencia internacional en empresas Fortune 500"
  ],
  "keywords": {
    "technical": {
      "found": ["Python", "React", "Node.js", "AWS", "Docker"],
      "missing": ["Kubernetes", "CI/CD", "Terraform", "GraphQL"]
    },
    "soft": {
      "found": ["liderazgo", "comunicación", "resolución de problemas"],
      "missing": ["pensamiento crítico", "adaptabilidad", "trabajo en equipo"]
    },
    "industry": {
      "found": ["fintech", "desarrollo ágil", "arquitectura de software"],
      "missing": ["DevOps", "microservicios", "seguridad informática"]
    }
  },
  "atsBreakdown": {
    "Workday": {
      "score": 82,
      "strengths": ["Formato compatible", "Keywords bien distribuidas"],
      "weaknesses": ["Falta sección de certificaciones", "Bullets sin métricas"],
      "tips": ["Usa bullets con formato • al inicio", "Agrega sección 'Certifications'"]
    },
    "Greenhouse": {
      "score": 79,
      "strengths": ["Experiencia bien estructurada", "Educación completa"],
      "weaknesses": ["Falta summary ejecutivo", "Skills desorganizados"],
      "tips": ["Agrega summary de 3-4 líneas al inicio", "Categoriza skills por nivel"]
    },
    "iCIMS": {
      "score": 75,
      "strengths": ["Títulos de trabajo claros"],
      "weaknesses": ["Formato de fechas inconsistente", "Gaps laborales sin explicar"],
      "tips": ["Usa formato MM/YYYY consistente", "Explica gaps > 3 meses"]
    },
    "Lever": {
      "score": 81,
      "strengths": ["Keywords relevantes presentes", "Experiencia cuantificada"],
      "weaknesses": ["Falta enlace a portfolio/LinkedIn"],
      "tips": ["Agrega URL de LinkedIn y portfolio", "Incluye proyectos destacados"]
    },
    "SAP SuccessFactors": {
      "score": 73,
      "strengths": ["Educación formal sólida"],
      "weaknesses": ["Falta desarrollo profesional reciente", "Sin soft skills"],
      "tips": ["Agrega cursos/certificaciones 2023-2024", "Menciona soft skills en bullets"]
    },
    "BambooHR": {
      "score": 85,
      "strengths": ["Cultura fit evidente", "Valores alineados"],
      "weaknesses": ["Podría mejorar storytelling"],
      "tips": ["Cuenta historia de carrera", "Muestra pasión por la industria"]
    },
    "Taleo": {
      "score": 71,
      "strengths": ["Estructura básica correcta"],
      "weaknesses": ["Falta keywords críticas", "Formato muy simple"],
      "tips": ["Repite keywords del JD naturalmente", "Usa secciones adicionales"]
    },
    "Jobvite": {
      "score": 77,
      "strengths": ["Experiencia relevante clara"],
      "weaknesses": ["Falta social proof", "Sin referencias"],
      "tips": ["Agrega testimonios/logros reconocidos", "Incluye 'References available'"]
    },
    "Bullhorn": {
      "score": 74,
      "strengths": ["Experiencia técnica sólida"],
      "weaknesses": ["Falta soft skills", "Sin actividades extracurriculares"],
      "tips": ["Menciona voluntariados/hobbies relevantes", "Incluye idiomas"]
    },
    "Workable": {
      "score": 80,
      "strengths": ["CV conciso y directo", "Fácil de escanear"],
      "weaknesses": ["Podría tener más detalle en logros"],
      "tips": ["Expande logros clave con contexto", "Usa método STAR"]
    }
  },
  "sectionScores": {
    "experience": 82,
    "education": 75,
    "skills": 68,
    "summary": 60
  },
  "improvementPath": {
    "current": 78,
    "potential": 91,
    "steps": [
      {
        "action": "Agrega 5 keywords técnicas faltantes críticas",
        "impact": "+5%",
        "timeframe": "15 minutos"
      },
      {
        "action": "Cuantifica logros con métricas en 3 experiencias",
        "impact": "+4%",
        "timeframe": "30 minutos"
      },
      {
        "action": "Crea summary ejecutivo de 4 líneas",
        "impact": "+3%",
        "timeframe": "20 minutos"
      },
      {
        "action": "Agrega certificaciones recientes",
        "impact": "+1%",
        "timeframe": "10 minutos"
      }
    ]
  },
  "atsDetectionGuide": {
    "indicators": [
      "Portal con campos estandarizados para skills",
      "Subida de archivo + formularios adicionales",
      "Preguntas de screening automáticas",
      "Sistema de puntaje visible al aplicar"
    ],
    "commonSystems": {
      "startups": ["Greenhouse", "Lever", "Workable"],
      "enterprises": ["Workday", "SAP SuccessFactors", "Taleo"],
      "agencies": ["Bullhorn", "Jobvite"]
    },
    "detectionTips": [
      "Busca el nombre del ATS en el footer del portal",
      "Revisa la URL (greenhouse.io, myworkday.com, etc.)",
      "LinkedIn Jobs suele usar su propio ATS",
      "Indeed y otros agregadores no usan ATS propio"
    ]
  },
  "reasoning": "El CV muestra experiencia técnica sólida pero necesita optimización para ATS. Las principales áreas de mejora son: agregar keywords críticas faltantes, cuantificar logros con métricas específicas, y crear un summary ejecutivo impactante."
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Eres el experto #1 mundial en ATS y optimización de CVs. SIEMPRE generas análisis COMPLETOS con TODOS los campos requeridos. NUNCA dejes campos vacíos o con valores 0. Proporciona datos REALES y ESPECÍFICOS basados en el CV y JD. Respondes SOLO con JSON válido sin markdown."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 4000,
      top_p: 0.95
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

    // VALIDACIÓN: Asegurar que todos los campos existen
    if (!analysis.keywords || !analysis.keywords.technical) {
      analysis.keywords = {
        technical: { found: [], missing: [] },
        soft: { found: [], missing: [] },
        industry: { found: [], missing: [] }
      };
    }

    if (!analysis.improvementPath || !analysis.improvementPath.steps) {
      analysis.improvementPath = {
        current: analysis.matchRate || 70,
        potential: (analysis.matchRate || 70) + 15,
        steps: []
      };
    }

    if (!analysis.atsBreakdown || Object.keys(analysis.atsBreakdown).length === 0) {
      // Crear breakdown mínimo para todos los ATS
      const atsNames = Object.keys(analysis.scores || {});
      analysis.atsBreakdown = {};
      atsNames.forEach(ats => {
        analysis.atsBreakdown[ats] = {
          score: analysis.scores[ats],
          strengths: ["Análisis en proceso"],
          weaknesses: ["Requiere optimización"],
          tips: ["Revisa formato y keywords"]
        };
      });
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