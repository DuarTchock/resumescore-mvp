// api/analyze-ai.js - VERSIÓN SAFE - SIN JSON PARSE ERRORS
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

// === ANÁLISIS CON GROQ - PROMPT SAFE ===
async function analyzeWithAI(cvText, jdText) {
  const prompt = `Eres el experto #1 mundial en ATS (Applicant Tracking Systems) y optimización de CVs.

**TU MISIÓN:**
Analizar este CV contra el Job Description y generar un reporte COMPLETO y ACCIONABLE.

**JOB DESCRIPTION:**
${jdText.substring(0, 2500)}

**CURRICULUM VITAE:**
${cvText.substring(0, 3500)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCCIONES CRÍTICAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 REGLA #1 - KEYWORDS FALTANTES:
SOLO incluye en keywords.*.missing aquellas keywords que:
- Estan EXPLICITAMENTE escritas en el Job Description
- NO estan en el CV del candidato
- Si el CV cubre todas las keywords del JD → deja missing = []
- NUNCA inventes keywords que no estan en el JD
- NUNCA incluyas keywords del CV que no estan en el JD

🔥 REGLA #2 - RECOMENDACIONES:
Genera AL MENOS 3-8 recommendations.
Cada una debe tener: priority, text, section, example, impact.
Nunca dejes recommendations vacio.

🔥 REGLA #3 - RUTA DE MEJORA:
Los pasos en improvementPath.steps deben basarse SOLO en:
- Keywords que REALMENTE faltan del JD
- Mejoras de formato ATS
- Cuantificacion de logros
NUNCA menciones keywords que NO estan en el JD.

🔥 REGLA #4 - EJEMPLOS COMPLETOS:
En cada paso de improvementPath, el campo detailedExamples debe estar 100% completo.
NUNCA uses strings vacios "".
Todos los campos context, direct, indirect, noExperience deben tener contenido.

🔥 REGLA #5 - ATS BREAKDOWN:
Genera datos COMPLETOS para los 10 ATS: Workday, Greenhouse, iCIMS, Lever, 
SAP SuccessFactors, BambooHR, Taleo, Jobvite, Bullhorn, Workable.
Cada uno debe tener: score, strengths (2+), weaknesses (2+), tips (2+).

🔥 REGLA #6 - JSON VALIDO:
- USA COMILLAS SIMPLES ' dentro de strings, NUNCA dobles "
- Para saltos de linea usa \\n
- NO uses emojis, usa simbolos: ✓ ✗ → • - +
- Escapa correctamente caracteres especiales

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Responde SOLO con JSON valido, sin markdown, sin backticks.

Estructura requerida:
{
  "matchRate": 90,
  "scores": { 10 sistemas ATS con scores },
  "recommendations": [ array con 3-8 objetos ],
  "strengths": [ array de fortalezas ],
  "keywords": {
    "technical": { "found": [], "missing": [] },
    "soft": { "found": [], "missing": [] },
    "industry": { "found": [], "missing": [] }
  },
  "atsBreakdown": { 10 ATS con score, strengths, weaknesses, tips },
  "sectionScores": { con socraticGuide para cada seccion },
  "improvementPath": {
    "current": numero,
    "potential": numero,
    "timeToImprove": string,
    "steps": [ array con detailedExamples completos ]
  },
  "atsDetectionGuide": { guia de deteccion },
  "reasoning": "explicacion del analisis"
}

IMPORTANTE: Responde AHORA con el JSON completo. NO uses comillas dobles " dentro de strings.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Eres experto en ATS. CRITICO: (1) keywords.*.missing SOLO del JD que NO en CV, si CV cubre todo → missing = []. (2) AL MENOS 3-8 recommendations. (3) detailedExamples 100% completos, NUNCA vacios. (4) 10 ATS completos. (5) Ruta solo con keywords del JD. (6) USA COMILLAS SIMPLES ' dentro de strings JSON, NUNCA dobles. Respondes SOLO JSON valido sin markdown."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 8000,
      top_p: 0.9
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Limpiar markdown si viene
    let jsonText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    // Intentar arreglar comillas problemáticas comunes
    jsonText = jsonText
      .replace(/"\s*:\s*"([^"]*)"([^"]*)"([^"]*)"(\s*[,\}])/g, '": "$1\'$2\'$3"$4')  // Comillas internas
      .replace(/❌/g, 'X')
      .replace(/✅/g, 'V')
      .replace(/"/g, '"')  // Reemplazar comillas curvas

    let analysis;
    try {
      analysis = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error('JSON Parse Error:', parseErr);
      console.error('Raw response (first 1000 chars):', jsonText.substring(0, 1000));
      console.error('Error position:', parseErr.message);
      
      // Intentar una segunda vez con más limpieza
      try {
        jsonText = jsonText.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
        analysis = JSON.parse(jsonText);
      } catch (secondErr) {
        throw new Error('Respuesta de AI no es JSON valido: ' + secondErr.message);
      }
    }

    // VALIDACIONES
    if (!analysis.keywords) {
      analysis.keywords = {
        technical: { found: [], missing: [] },
        soft: { found: [], missing: [] },
        industry: { found: [], missing: [] }
      };
    }

    // Bug Fix #4: Asegurar 3+ recommendations
    if (!analysis.recommendations || analysis.recommendations.length === 0) {
      analysis.recommendations = [
        {
          priority: "important",
          text: "Cuantifica tus logros agregando metricas especificas",
          impact: "high",
          section: "experience",
          example: "En lugar de 'Gestione personal', usa 'Gestione equipo de 25 personas aumentando productividad 30%'"
        },
        {
          priority: "important",
          text: "Usa formato de bullets con simbolo • al inicio",
          impact: "medium",
          section: "format",
          example: "• Lidere 120+ procesos\\n• Implemente sistema\\n• Administre pre-nomina"
        },
        {
          priority: "optional",
          text: "Agrega summary profesional de 2-3 lineas",
          impact: "medium",
          section: "summary",
          example: "Especialista en RH con 3+ anos optimizando procesos de talento."
        }
      ];
    }

    if (!analysis.improvementPath || !analysis.improvementPath.steps) {
      analysis.improvementPath = {
        current: analysis.matchRate || 70,
        potential: Math.min((analysis.matchRate || 70) + 10, 98),
        timeToImprove: "1-2 horas",
        steps: []
      };
    }

    // Bug Fix #6: Validar detailedExamples
    if (analysis.improvementPath.steps) {
      analysis.improvementPath.steps.forEach((step, index) => {
        if (!step.detailedExamples) {
          step.detailedExamples = {
            context: {
              jdMentions: "El JD menciona esta mejora como importante",
              cvShows: "Tu CV puede mejorar en este aspecto"
            },
            direct: {
              title: "Implementacion directa:",
              bullets: [
                "Revisa tu CV e identifica donde aplicar esta mejora",
                "Usa ejemplos especificos de tu experiencia",
                "Incluye metricas cuantificables cuando sea posible"
              ]
            },
            indirect: {
              title: "Implementacion adaptada:",
              bullets: [
                "Adapta el ejemplo a tu experiencia especifica",
                "Manten el formato y estructura sugerida"
              ]
            },
            noExperience: {
              title: "Sin experiencia directa:",
              bullets: [
                "Enfocate en skills transferibles",
                "Menciona experiencia relacionada"
              ]
            },
            proTip: "Personaliza los ejemplos a tu experiencia real"
          };
        } else {
          // Validar strings no vacíos
          if (!step.detailedExamples.context) {
            step.detailedExamples.context = {
              jdMentions: "El JD requiere esta habilidad",
              cvShows: "Tu CV puede destacar mas esto"
            };
          }
          if (step.detailedExamples.context.jdMentions === "") {
            step.detailedExamples.context.jdMentions = "El JD requiere esta habilidad";
          }
          if (step.detailedExamples.context.cvShows === "") {
            step.detailedExamples.context.cvShows = "Tu CV puede destacar mas esto";
          }

          ['direct', 'indirect', 'noExperience'].forEach(level => {
            if (!step.detailedExamples[level]) {
              step.detailedExamples[level] = {
                title: `Opcion ${level}:`,
                bullets: ["Ejemplo 1", "Ejemplo 2"]
              };
            }
            if (!step.detailedExamples[level].bullets || step.detailedExamples[level].bullets.length === 0) {
              step.detailedExamples[level].bullets = [
                "Revisa tu experiencia y aplica esta mejora",
                "Personaliza el ejemplo a tu caso especifico"
              ];
            }
          });
        }
      });
    }

    // Bug Fix #2: Validar 10 ATS
    const requiredATS = [
      'Workday', 'Greenhouse', 'iCIMS', 'Lever', 'SAP SuccessFactors',
      'BambooHR', 'Taleo', 'Jobvite', 'Bullhorn', 'Workable'
    ];

    if (!analysis.atsBreakdown) {
      analysis.atsBreakdown = {};
    }

    requiredATS.forEach(ats => {
      if (!analysis.atsBreakdown[ats]) {
        const score = analysis.scores?.[ats] || 75;
        analysis.atsBreakdown[ats] = {
          score: score,
          strengths: [
            "Formato compatible con estandares ATS",
            "Keywords relevantes presentes"
          ],
          weaknesses: [
            "Podria optimizar distribucion de keywords",
            "Algunos bullets sin metricas cuantificables"
          ],
          tips: [
            {
              tip: "Agrega metricas cuantificables en cada bullet point",
              example: "En lugar de 'Gestione personal', usa 'Gestione equipo de 25 personas aumentando productividad 30%'",
              why: `${ats} prioriza logros medibles para mejor matching`
            },
            {
              tip: "Incluye keywords del JD en primeras lineas",
              example: "Coloca las palabras clave importantes al inicio de cada seccion",
              why: `${ats} da mas peso a keywords en primer tercio del documento`
            }
          ]
        };
      } else {
        if (!analysis.atsBreakdown[ats].tips || !Array.isArray(analysis.atsBreakdown[ats].tips) || analysis.atsBreakdown[ats].tips.length === 0) {
          analysis.atsBreakdown[ats].tips = [
            {
              tip: "Optimiza formato para mejor extraccion automatica",
              example: "Usa bullets con simbolo • y estructura clara",
              why: `${ats} extrae mejor con formato estructurado`
            }
          ];
        }
        if (!analysis.atsBreakdown[ats].strengths || analysis.atsBreakdown[ats].strengths.length === 0) {
          analysis.atsBreakdown[ats].strengths = ["Formato compatible", "Keywords presentes"];
        }
        if (!analysis.atsBreakdown[ats].weaknesses || analysis.atsBreakdown[ats].weaknesses.length === 0) {
          analysis.atsBreakdown[ats].weaknesses = ["Optimizacion de keywords", "Metricas en algunos bullets"];
        }
      }
    });

    // Validar sectionScores
    if (analysis.sectionScores) {
      Object.keys(analysis.sectionScores).forEach(section => {
        if (!analysis.sectionScores[section].socraticGuide) {
          analysis.sectionScores[section].socraticGuide = {
            questions: [],
            transformation: {},
            templateSTAR: {}
          };
        }
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
      suggestion: 'Configura GROQ_API_KEY en Vercel'
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
            return res.status(400).json({ error: 'Formato no soportado' });
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
        error: 'Falta CV o Job Description'
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