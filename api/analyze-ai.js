// api/analyze-ai.js - CON PDF-PARSE COMO FALLBACK
import busboy from 'busboy';
import { createRequire } from 'module';
import Groq from 'groq-sdk';
import pdfParse from 'pdf-parse';

const require = createRequire(import.meta.url);
const PDFParser = require('pdf2json');
const mammoth = require('mammoth');

export const config = { 
  api: { 
    bodyParser: false,
    responseLimit: false
  },
  maxDuration: 60
};

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// === MÉTODO 1: PDF2JSON (más rápido, pero a veces falla) ===
async function extractTextWithPDF2JSON(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    let hasResolved = false;
    
    const timeout = setTimeout(() => {
      if (!hasResolved) {
        hasResolved = true;
        reject(new Error('Timeout'));
      }
    }, 8000);
    
    pdfParser.on('pdfParser_dataError', errData => {
      clearTimeout(timeout);
      if (!hasResolved) {
        hasResolved = true;
        reject(new Error(errData.parserError || 'PDF2JSON error'));
      }
    });
    
    pdfParser.on('pdfParser_dataReady', pdfData => {
      clearTimeout(timeout);
      if (hasResolved) return;
      hasResolved = true;
      
      try {
        let text = '';
        
        if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
          pdfData.Pages.forEach(page => {
            if (!page.Texts) return;
            
            page.Texts.forEach(textItem => {
              if (textItem.R && Array.isArray(textItem.R)) {
                textItem.R.forEach(run => {
                  if (run.T) {
                    try {
                      text += decodeURIComponent(run.T) + ' ';
                    } catch (e) {
                      text += run.T + ' ';
                    }
                  }
                });
              }
            });
          });
        }
        
        text = text.replace(/\s+/g, ' ').trim();
        
        if (text.length < 50) {
          reject(new Error('Insufficient text'));
        } else {
          console.log('[PDF2JSON] Success:', text.length, 'chars');
          resolve(text);
        }
        
      } catch (err) {
        reject(err);
      }
    });
    
    try {
      pdfParser.parseBuffer(buffer);
    } catch (err) {
      clearTimeout(timeout);
      hasResolved = true;
      reject(err);
    }
  });
}

// === MÉTODO 2: PDF-PARSE (fallback, más robusto) ===
async function extractTextWithPDFParse(buffer) {
  try {
    console.log('[PDF-PARSE] Attempting fallback extraction...');
    const data = await pdfParse(buffer);
    const text = data.text.trim();
    
    if (text.length < 50) {
      throw new Error('Insufficient text extracted');
    }
    
    console.log('[PDF-PARSE] Success:', text.length, 'chars');
    console.log('[PDF-PARSE] Pages:', data.numpages);
    return text;
    
  } catch (err) {
    console.error('[PDF-PARSE] Failed:', err.message);
    throw err;
  }
}

// === EXTRACCIÓN HÍBRIDA: PDF2JSON → PDF-PARSE ===
async function extractTextFromPDF(buffer, filename) {
  console.log(`[PDF] Extracting text from "${filename}", size: ${buffer.length} bytes`);
  
  // Método 1: Intentar con pdf2json primero (más rápido)
  try {
    const text = await extractTextWithPDF2JSON(buffer);
    console.log(`[PDF] ✓ Extracted with pdf2json: ${text.length} chars`);
    return text;
  } catch (pdf2jsonError) {
    console.warn(`[PDF] pdf2json failed: ${pdf2jsonError.message}`);
    console.log('[PDF] → Trying pdf-parse fallback...');
    
    // Método 2: Fallback a pdf-parse
    try {
      const text = await extractTextWithPDFParse(buffer);
      console.log(`[PDF] ✓ Extracted with pdf-parse: ${text.length} chars`);
      return text;
    } catch (pdfParseError) {
      console.error(`[PDF] pdf-parse also failed: ${pdfParseError.message}`);
      
      // Ambos métodos fallaron
      throw new Error(
        'No se pudo extraer texto del PDF con ningún método. ' +
        'El PDF podría estar protegido, ser una imagen escaneada, o tener codificación especial. ' +
        'Por favor, intenta con un archivo DOCX o regenera el PDF desde tu editor.'
      );
    }
  }
}

// === ANÁLISIS CON GROQ ===
async function analyzeWithAI(cvText, jdText) {
  const prompt = `Eres el experto #1 mundial en Sistemas de Seguimiento de Candidatos (ATS - Applicant Tracking Systems) y optimización de CVs. Analiza este CV contra el Job Description y genera un reporte COMPLETO, DETALLADO y 100% ACCIONABLE.

**JOB DESCRIPTION:**
${jdText.substring(0, 2500)}

**CURRICULUM VITAE:**
${cvText.substring(0, 3500)}

INSTRUCCIONES CRÍTICAS:

1. **KEYWORDS PRECISAS**: En la sección "keywords", SOLO incluye en "missing" aquellas keywords que aparecen EXPLÍCITAMENTE en el Job Description pero NO están en el CV. NO inventes keywords ni agregues sinónimos que no estén literalmente en el JD.

2. **EJEMPLOS ESPECÍFICOS**: CADA tip, recomendación y paso DEBE incluir ejemplos CONCRETOS basados en el JD y CV específicos del candidato

3. **MÉTODO SOCRÁTICO**: Para cada sección del CV, proporciona preguntas que guíen al candidato a descubrir sus fortalezas

4. **TEXTO COPIABLE**: Proporciona ejemplos que el candidato pueda copiar y pegar directamente en su CV

5. **ADAPTADO AL CANDIDATO**: Los ejemplos deben reflejar la experiencia actual mostrada en el CV

Responde SOLO con JSON válido (sin markdown). Formato EXACTO:

{
  "matchRate": 85,
  "scores": {
    "Workday": 88,
    "Greenhouse": 82,
    "iCIMS": 80,
    "Lever": 89,
    "SAP SuccessFactors": 78,
    "BambooHR": 90,
    "Taleo": 75,
    "Jobvite": 81,
    "Bullhorn": 79,
    "Workable": 86
  },
  "recommendations": [
    {
      "priority": "critical",
      "text": "Agrega la keyword 'gestión de proyectos ágiles' que aparece 4 veces en el JD pero 0 en tu CV",
      "impact": "high",
      "section": "experience",
      "example": "• Lideré 8 proyectos ágiles con equipos de 12+ personas usando Scrum, logrando entregas 25% más rápidas y reduciendo bugs en 40%"
    }
  ],
  "strengths": [
    "Experiencia sólida de 5+ años en desarrollo de software",
    "Dominio comprobado de Python, React y Node.js",
    "Historial de liderazgo de equipos multidisciplinarios"
  ],
  "keywords": {
    "technical": {
      "found": ["Python", "React", "Node.js", "AWS", "Docker"],
      "missing": ["Kubernetes", "CI/CD", "Terraform"]
    },
    "soft": {
      "found": ["liderazgo", "comunicación"],
      "missing": ["pensamiento crítico", "adaptabilidad"]
    },
    "industry": {
      "found": ["fintech", "desarrollo ágil"],
      "missing": ["DevOps", "microservicios"]
    }
  },
  "atsBreakdown": {
    "Workday": {
      "score": 88,
      "strengths": ["Formato compatible con estándares ATS", "Keywords bien distribuidas"],
      "weaknesses": ["Falta sección de certificaciones", "Algunos bullets sin métricas"],
      "tips": [
        {
          "tip": "Usa bullets con formato • al inicio de cada logro",
          "example": "BASADO EN TU JD QUE MENCIONA 'gestión de equipos':\\n\\n• Lideré equipo de 12 desarrolladores aumentando productividad 40%\\n• Gestioné presupuesto de $500K optimizando recursos 25%\\n• Mentoré 5 junior developers acelerando onboarding 50%",
          "why": "Workday ATS prioriza formato de bullets para extracción automática"
        }
      ]
    },
    "Greenhouse": {
      "score": 82,
      "strengths": ["Experiencia bien estructurada"],
      "weaknesses": ["Falta summary ejecutivo"],
      "tips": [
        {
          "tip": "Agrega summary de 3-4 líneas al inicio",
          "example": "Senior Full-Stack Developer con 8+ años optimizando aplicaciones web de alto tráfico. Experto en React, Node.js y arquitectura cloud (AWS). Historial comprobado aumentando conversión 45% y liderando equipos de 12+ personas en ambientes ágiles.",
          "why": "Greenhouse ATS usa el summary para matching inicial"
        }
      ]
    }
  },
  "sectionScores": {
    "experience": {
      "score": 82,
      "socraticGuide": {
        "questions": [
          "¿Cuántas personas se beneficiaron directamente de tu trabajo?",
          "¿Qué métrica específica mejoró gracias a tu contribución?",
          "¿Cuánto tiempo o dinero ahorraste a la empresa?",
          "¿Qué problema crítico resolviste y cómo?"
        ],
        "badExample": "Desarrollé features para el producto y trabajé con el equipo",
        "goodExample": "Desarrollé 15 features críticas que aumentaron engagement 34% y retención de usuarios en 2.5 meses, impactando a 50K+ usuarios activos",
        "templateSTAR": {
          "situacion": "El proyecto necesitaba [problema específico del JD]",
          "tarea": "Me asignaron [tu responsabilidad relacionada al JD]",
          "accion": "Implementé [solución usando skills del JD] liderando [equipo/proceso]",
          "resultado": "Logré [métrica cuantificable] en [timeframe], generando [impacto en negocio]"
        },
        "jdKeywords": ["gestión de equipos", "metodología ágil", "optimización"],
        "yourCurrentText": "Developer en empresa tech",
        "improvedVersion": "Senior Developer liderando equipo de 8 personas con metodología ágil, optimizando arquitectura y reduciendo tiempo de deployment 60%"
      }
    },
    "education": {
      "score": 75,
      "socraticGuide": {
        "questions": [
          "¿Qué proyectos académicos son relevantes para este puesto?",
          "¿Obtuviste algún reconocimiento o GPA notable?",
          "¿Participaste en actividades extracurriculares relevantes?"
        ],
        "badExample": "Licenciatura en Ingeniería",
        "goodExample": "Licenciatura en Ingeniería de Software (GPA 3.8/4.0) con especialización en Arquitectura Cloud. Proyecto destacado: Sistema distribuido que soportó 100K usuarios concurrentes.",
        "templateSTAR": {
          "situacion": "El JD requiere formación en [área específica]",
          "tarea": "Completé [grado/certificación] enfocándome en [especialización]",
          "accion": "Desarrollé [proyecto final/tesis] aplicando [tecnologías del JD]",
          "resultado": "Logré [GPA/reconocimiento] y [impacto del proyecto]"
        }
      }
    },
    "skills": {
      "score": 68,
      "socraticGuide": {
        "questions": [
          "¿En qué proyectos reales has usado cada skill?",
          "¿Cuál es tu nivel de dominio: básico, intermedio o avanzado?",
          "¿Puedes cuantificar tu experiencia con cada tecnología?"
        ],
        "badExample": "Python, React, AWS",
        "goodExample": "Python (5+ años): 20+ proyectos backend con Django/Flask | React (4+ años): 15+ apps SPA con 100K+ usuarios | AWS (3+ años): arquitectura cloud para 5M+ requests/día",
        "templateSTAR": {
          "situacion": "El JD requiere [skill específico]",
          "tarea": "Usé [skill] durante [tiempo] en [contexto]",
          "accion": "Desarrollé [proyectos/sistemas] aplicando [skill específico]",
          "resultado": "Logré [métrica de impacto] en [número] de proyectos"
        }
      }
    }
  },
  "improvementPath": {
    "current": 85,
    "potential": 95,
    "steps": [
      {
        "action": "Agrega 5 keywords técnicas faltantes críticas del JD",
        "impact": "+5%",
        "timeframe": "15 minutos",
        "detailedExamples": {
          "direct": "Si has usado estas tecnologías:\\n\\n• Implementé Kubernetes para orquestar 50+ microservicios, reduciendo downtime 90%\\n• Configuré pipelines CI/CD con Jenkins automatizando deployments y reduciendo errores 75%",
          "indirect": "Si tienes experiencia relacionada:\\n\\n• Gestioné infraestructura de contenedores Docker mejorando eficiencia de deployments 60%\\n• Automaticé procesos de testing y deployment reduciendo tiempo de release de 2 días a 4 horas",
          "noExperience": "Si no tienes experiencia directa (sé honesto pero destaca transferibles):\\n\\n• Experiencia sólida en DevOps y automatización, actualmente capacitándome en Kubernetes\\n• Familiarizado con conceptos de orquestación de contenedores y microservicios"
        },
        "keywords": ["Kubernetes", "CI/CD", "Terraform", "GraphQL", "Docker"]
      }
    ]
  },
  "atsDetectionGuide": {
    "indicators": [
      "Portal con campos estandarizados para skills y experiencia",
      "Subida de archivo seguida de formularios adicionales",
      "Preguntas de screening automáticas (ej: '¿Tienes 5+ años de experiencia?')",
      "Sistema de puntaje o match visible al aplicar"
    ],
    "commonSystems": {
      "startups": ["Greenhouse", "Lever", "Workable"],
      "enterprises": ["Workday", "SAP SuccessFactors", "Taleo"],
      "agencies": ["Bullhorn", "Jobvite"]
    },
    "detectionTips": [
      "Busca el nombre del ATS en el footer del portal de aplicación",
      "Revisa la URL: greenhouse.io, myworkday.com, etc.",
      "LinkedIn Jobs usa su propio sistema interno",
      "Indeed y otros agregadores NO usan ATS propio, redirigen a la empresa"
    ]
  },
  "reasoning": "El CV muestra experiencia técnica sólida con 5+ años en desarrollo. Las principales áreas de mejora son: (1) agregar keywords críticas faltantes como 'Kubernetes' y 'CI/CD' mencionadas 3+ veces en el JD, (2) cuantificar logros actuales con métricas específicas, (3) crear summary ejecutivo impactante de 3-4 líneas que capture propuesta de valor."
}

RECUERDA: En la sección "keywords.missing", SOLO incluye términos que aparecen LITERALMENTE en el Job Description. No agregues sinónimos o variaciones.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Eres el experto #1 mundial en ATS (Applicant Tracking Systems - Sistemas de Seguimiento de Candidatos) y optimización de CVs. SIEMPRE generas análisis COMPLETOS con TODOS los campos requeridos, incluyendo ejemplos ESPECÍFICOS y COPIABLES para cada recomendación. NUNCA dejes campos vacíos. Proporciona datos REALES adaptados al CV y JD específicos. En la sección 'keywords.missing', SOLO incluyes keywords que aparecen EXPLÍCITAMENTE en el Job Description. Respondes SOLO con JSON válido sin markdown."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 4096,
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
      console.error('[AI] JSON Parse Error:', parseErr);
      console.error('[AI] Raw response:', jsonText.substring(0, 500));
      throw new Error('Respuesta de AI no es JSON válido');
    }

    // VALIDACIÓN
    if (!analysis.keywords) {
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

    if (analysis.atsBreakdown) {
      Object.keys(analysis.atsBreakdown).forEach(ats => {
        if (!analysis.atsBreakdown[ats].tips || !Array.isArray(analysis.atsBreakdown[ats].tips)) {
          analysis.atsBreakdown[ats].tips = [];
        }
      });
    }

    return analysis;

  } catch (error) {
    console.error('[AI] Groq API Error:', error);
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
    const bb = busboy({ headers: req.headers });
    let cvText = '';
    let jdText = '';
    const processing = [];

    bb.on('file', (name, file, info) => {
      if (name !== 'cv') {
        file.resume();
        return;
      }

      const chunks = [];
      file.on('data', chunk => chunks.push(chunk));

      const filePromise = new Promise((resolve, reject) => {
        file.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);
            console.log(`[FILE] "${info.filename}" - ${buffer.length} bytes`);

            if (info.filename.toLowerCase().endsWith('.pdf')) {
              try {
                cvText = await extractTextFromPDF(buffer, info.filename);
                console.log(`[SUCCESS] PDF processed: ${cvText.length} chars`);
              } catch (pdfError) {
                console.error(`[ERROR] PDF failed:`, pdfError.message);
                reject(pdfError);
                return;
              }
            } else if (info.filename.toLowerCase().endsWith('.docx') || info.filename.toLowerCase().endsWith('.doc')) {
              try {
                const result = await mammoth.extractRawText({ buffer });
                cvText = result.value;
                console.log(`[SUCCESS] DOCX processed: ${cvText.length} chars`);
              } catch (docxError) {
                console.error(`[ERROR] DOCX failed:`, docxError.message);
                reject(docxError);
                return;
              }
            } else {
              reject(new Error('Formato no soportado. Use .pdf o .docx'));
              return;
            }
            
            resolve();
          } catch (err) {
            console.error('[ERROR] File processing:', err);
            reject(err);
          }
        });
      });

      processing.push(filePromise);
    });

    bb.on('field', (name, val) => {
      if (name === 'jd') {
        jdText = val;
        console.log('[JD] Received:', jdText.length, 'chars');
      }
    });

    bb.on('finish', async () => {
      try {
        await Promise.all(processing);

        if (!cvText || !jdText) {
          return res.status(400).json({ 
            error: 'Falta CV o Job Description',
            details: { 
              hasCv: !!cvText, 
              cvLength: cvText.length,
              hasJd: !!jdText,
              jdLength: jdText.length
            }
          });
        }

        console.log('[AI] Starting analysis...');
        const aiAnalysis = await analyzeWithAI(cvText, jdText);
        console.log('[AI] ✓ Completed');

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
        console.error('[ERROR] Analysis:', error);
        res.status(500).json({ 
          error: 'Error al procesar',
          message: error.message
        });
      }
    });

    bb.on('error', error => {
      console.error('[ERROR] Busboy:', error);
      res.status(500).json({
        error: 'Error al procesar formulario',
        message: error.message
      });
    });

    req.pipe(bb);

  } catch (error) {
    console.error('[ERROR] Handler:', error);
    res.status(500).json({ 
      error: 'Error del servidor',
      message: error.message 
    });
  }
}