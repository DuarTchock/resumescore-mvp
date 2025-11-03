// api/analyze-ai.js - VERSIÓN CORREGIDA - BUGS #1 Y #2 ARREGLADOS
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

// === ANÁLISIS CON GROQ - PROMPT CORREGIDO ===
async function analyzeWithAI(cvText, jdText) {
  const prompt = `Eres el experto #1 mundial en Sistemas de Seguimiento de Candidatos (ATS - Applicant Tracking Systems) y optimización de CVs para reclutamiento.

**TU MISIÓN CRÍTICA:**
Analizar este CV contra el Job Description específico y generar un reporte COMPLETO, DETALLADO, ESPECÍFICO y 100% ACCIONABLE con EJEMPLOS REALES Y COPIABLES basados en la experiencia ACTUAL del candidato.

**JOB DESCRIPTION:**
${jdText.substring(0, 2500)}

**CURRICULUM VITAE:**
${cvText.substring(0, 3500)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 INSTRUCCIONES CRÍTICAS - CUMPLE TODAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 **BUG FIX #1 - KEYWORDS FALTANTES (CRÍTICO):**

REGLA DE ORO PARA "keywords.*.missing":
- **SOLO** incluye keywords que:
  ✓ Están EXPLÍCITAMENTE mencionadas en el JOB DESCRIPTION
  ✓ NO están en el CV del candidato
  ✗ NUNCA incluyas keywords del CV que no están en el JD
  ✗ NUNCA inventes keywords genéricas que no están en el JD

**PROCESO CORRECTO:**
1. PRIMERO: Extrae TODAS las keywords explícitas del Job Description
2. SEGUNDO: Extrae TODAS las keywords del CV
3. TERCERO: missing = keywords que están en JD pero NO en CV
4. CUARTO: found = keywords que están TANTO en JD como en CV

**EJEMPLO CORRECTO:**
JD menciona: "Excel, PowerPoint, gestión de equipos, pensamiento crítico"
CV menciona: "Excel, PowerPoint, Workday, BambooHR"

✅ CORRECTO:
{
  "technical": {
    "found": ["Excel", "PowerPoint"],
    "missing": []  // Workday/BambooHR NO van aquí porque no están en JD
  },
  "soft": {
    "found": [],
    "missing": ["gestión de equipos", "pensamiento crítico"]  // Están en JD pero no en CV
  }
}

❌ INCORRECTO:
{
  "technical": {
    "found": ["Excel", "PowerPoint"],
    "missing": ["Workday", "BambooHR"]  // ¡ERROR! Estos NO están en el JD
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 **BUG FIX #2 - ATS BREAKDOWN COMPLETO (CRÍTICO):**

DEBES generar datos COMPLETOS para los 10 ATS en "atsBreakdown".
NUNCA dejes un ATS sin datos. TODOS deben tener:
- score
- strengths (al menos 2)
- weaknesses (al menos 2)
- tips (al menos 2, cada uno con tip, example, why)

Los 10 ATS OBLIGATORIOS son:
1. Workday
2. Greenhouse
3. iCIMS
4. Lever
5. SAP SuccessFactors
6. BambooHR
7. Taleo
8. Jobvite
9. Bullhorn
10. Workable

Si no tienes datos específicos para algún ATS, genera datos genéricos pero NUNCA lo dejes vacío.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **EJEMPLOS ESPECÍFICOS AL JD**: CADA tip, recomendación y paso DEBE incluir ejemplos CONCRETOS que:
   - Mencionen keywords ESPECÍFICAS del Job Description proporcionado
   - Reflejen la experiencia ACTUAL mostrada en el CV del candidato
   - Sean COPIABLES (el candidato debe poder copy/paste directamente)
   - Incluyan MÉTRICAS cuantificables (números, porcentajes, tiempo)

2. **MÉTODO SOCRÁTICO**: Para CADA sección del CV (experience, education, skills):
   - Proporciona 4-5 preguntas que guíen al candidato a reflexionar sobre SUS logros específicos
   - Muestra transformación ANTES/DESPUÉS usando frases del CV real
   - Crea template STAR adaptado al JD y experiencia actual del candidato

3. **TRES NIVELES DE EXPERIENCIA**: Para cada paso de mejora en improvementPath, genera 3 ejemplos:
   - "direct": Si el candidato TIENE experiencia directa con la keyword
   - "indirect": Si tiene experiencia relacionada pero no directa
   - "noExperience": Cómo destacar skills transferibles siendo honesto

4. **CONTEXTO JD vs CV**: En cada ejemplo, menciona:
   - "El JD menciona: [keyword específica del JD]"
   - "Tu CV muestra: [experiencia actual del candidato]"
   - Luego el ejemplo mejorado

5. **TIPS DE ATS CON EJEMPLOS**: CADA tip en atsBreakdown[sistema].tips DEBE tener:
   - "tip": Descripción clara del tip
   - "example": Ejemplo ESPECÍFICO usando keywords del JD + experiencia del CV
   - "why": Por qué este ATS específico requiere esto

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Responde SOLO con JSON válido (sin markdown, sin \`\`\`json). Formato EXACTO:

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
      "example": "BASADO EN TU PERFIL ACTUAL:\\n\\nEl JD menciona: 'gestión de proyectos ágiles con metodología Scrum'\\nTu CV muestra: 'desarrollador con 5 años de experiencia'\\n\\n📝 COPIA Y PEGA ESTO:\\n• Lideré 8 proyectos ágiles con equipos de 12+ personas usando Scrum, logrando entregas 25% más rápidas y reduciendo bugs en 40%\\n• Implementé ceremonias ágiles (daily standups, retrospectivas) mejorando comunicación del equipo en 60%"
    }
  ],
  "strengths": [
    "Experiencia sólida de 5+ años en desarrollo de software",
    "Dominio comprobado de Python, React y Node.js",
    "Historial de liderazgo de equipos multidisciplinarios"
  ],
  "keywords": {
    "technical": {
      "found": ["Excel", "PowerPoint"],
      "missing": ["Python", "SQL"]
    },
    "soft": {
      "found": ["comunicación efectiva", "trabajo en equipo"],
      "missing": ["liderazgo", "negociación"]
    },
    "industry": {
      "found": ["recursos humanos", "administración de personal"],
      "missing": ["gestión del cambio", "cultura organizacional"]
    }
  },
  "atsBreakdown": {
    "Workday": {
      "score": 88,
      "strengths": ["Formato compatible con estándares ATS", "Keywords bien distribuidas en secciones"],
      "weaknesses": ["Falta sección de certificaciones", "Algunos bullets sin métricas cuantificables"],
      "tips": [
        {
          "tip": "Usa bullets con formato • al inicio de cada logro para mejor extracción",
          "example": "ADAPTADO A TU JD QUE MENCIONA 'gestión de equipos':\\n\\nSi lideras equipos:\\n• Lideré equipo de 12 desarrolladores aumentando productividad 40% mediante implementación de Scrum\\n• Gestioné presupuesto de $500K optimizando recursos y reduciendo costos 25%",
          "why": "Workday ATS prioriza formato de bullets con • para extracción automática de logros y métricas"
        }
      ]
    },
    "Greenhouse": {
      "score": 82,
      "strengths": ["Experiencia bien estructurada", "Títulos claros"],
      "weaknesses": ["Falta summary ejecutivo", "Fechas inconsistentes"],
      "tips": [
        {
          "tip": "Agrega summary profesional de 3-4 líneas al inicio",
          "example": "Senior Full-Stack Developer con 8+ años optimizando aplicaciones web de alto tráfico.",
          "why": "Greenhouse usa el summary para matching inicial"
        }
      ]
    },
    "iCIMS": {
      "score": 80,
      "strengths": ["Estructura cronológica clara", "Experiencia cuantificada"],
      "weaknesses": ["Falta optimización de keywords", "Formato de fechas inconsistente"],
      "tips": [
        {
          "tip": "Incluye keywords del JD en primeras 3 líneas de cada experiencia",
          "example": "Coloca 'administración de personal' y 'reclutamiento' al inicio de tu descripción.",
          "why": "iCIMS prioriza keywords en las primeras líneas de cada sección"
        }
      ]
    },
    "Lever": {
      "score": 89,
      "strengths": ["Excelente uso de métricas", "Formato limpio"],
      "weaknesses": ["Podría agregar más contexto de industria", "Falta sección de proyectos"],
      "tips": [
        {
          "tip": "Agrega contexto de industria en cada bullet",
          "example": "En sector de servicios de RH: Lideré 120+ procesos de reclutamiento...",
          "why": "Lever valora contexto de industria para mejor matching"
        }
      ]
    },
    "SAP SuccessFactors": {
      "score": 78,
      "strengths": ["Experiencia relevante en RH", "Certificaciones presentes"],
      "weaknesses": ["Falta integración con sistemas SAP", "Necesita más keywords técnicas"],
      "tips": [
        {
          "tip": "Menciona experiencia con sistemas empresariales (ERP, HRIS)",
          "example": "Gestioné nómina en Workday integrado con sistema ERP corporativo.",
          "why": "SAP SuccessFactors busca experiencia con sistemas empresariales"
        }
      ]
    },
    "BambooHR": {
      "score": 90,
      "strengths": ["Perfil ideal para RH", "Experiencia completa en ciclo de vida del empleado"],
      "weaknesses": ["Podría enfatizar más cultura organizacional", "Falta mención de onboarding"],
      "tips": [
        {
          "tip": "Incluye experiencia en onboarding y cultura organizacional",
          "example": "Diseñé programa de onboarding que redujo rotación en primeros 90 días en 35%.",
          "why": "BambooHR enfatiza cultura y experiencia del empleado"
        }
      ]
    },
    "Taleo": {
      "score": 75,
      "strengths": ["Formato compatible", "Experiencia relevante"],
      "weaknesses": ["Necesita más keywords de compliance", "Falta énfasis en procesos"],
      "tips": [
        {
          "tip": "Enfatiza cumplimiento normativo (NOM-035, STPS, IMSS)",
          "example": "Aseguré 100% cumplimiento de NOM-035 y regulaciones STPS en auditorías.",
          "why": "Taleo prioriza compliance y procesos estructurados"
        }
      ]
    },
    "Jobvite": {
      "score": 81,
      "strengths": ["Experiencia en reclutamiento destacada", "Métricas de contratación"],
      "weaknesses": ["Falta énfasis en employer branding", "Necesita más social recruiting"],
      "tips": [
        {
          "tip": "Menciona experiencia con redes sociales y employer branding",
          "example": "Implementé estrategia de employer branding en LinkedIn aumentando aplicaciones 45%.",
          "why": "Jobvite valora experiencia en reclutamiento social y branding"
        }
      ]
    },
    "Bullhorn": {
      "score": 79,
      "strengths": ["Experiencia en staffing", "Manejo de múltiples clientes"],
      "weaknesses": ["Falta experiencia con agencias", "Necesita más énfasis en ventas"],
      "tips": [
        {
          "tip": "Destaca experiencia comercial y relación con clientes",
          "example": "Gestioné cartera de 15 clientes corporativos logrando 95% retención anual.",
          "why": "Bullhorn es usado por agencias de staffing que valoran skills comerciales"
        }
      ]
    },
    "Workable": {
      "score": 86,
      "strengths": ["Perfil completo", "Experiencia balanceada"],
      "weaknesses": ["Podría agregar más colaboración con hiring managers", "Falta énfasis en data"],
      "tips": [
        {
          "tip": "Menciona colaboración con hiring managers y uso de data",
          "example": "Colaboré con 8 hiring managers usando analytics para reducir tiempo de contratación 35%.",
          "why": "Workable valora colaboración y decisiones basadas en datos"
        }
      ]
    }
  },
  "sectionScores": {
    "experience": {
      "score": 82,
      "socraticGuide": {
        "intro": "En lugar de solo decir 'qué hiciste', muestra el IMPACTO cuantificable de tu trabajo.",
        "questions": [
          "¿Cuántas personas se beneficiaron de tu trabajo?",
          "¿Qué métrica mejoró gracias a tu contribución específica?",
          "¿Cuánto tiempo o dinero ahorraste a la empresa?",
          "¿Qué problema específico resolviste y cómo lo mediste?",
          "¿Cuál fue el ANTES y el DESPUÉS medible de tu intervención?"
        ],
        "transformation": {
          "bad": "Trabajé en reclutamiento de personal para la empresa",
          "badReason": "Es vago, sin métricas, no muestra impacto ni diferenciales",
          "good": "Lideré 120+ procesos de reclutamiento contratando 85 posiciones críticas en <18 días promedio, 62% más rápido que benchmark de industria (45 días)",
          "goodReason": "Específico, cuantificado, muestra velocidad y benchmarking, demuestra liderazgo"
        },
        "templateSTAR": {
          "context": {
            "jdMentions": "El JD menciona: 'reclutamiento y selección, administración de personal'",
            "cvShows": "Tu CV muestra: 'Especialista en RH con 3+ años en reclutamiento'"
          },
          "situacion": "En empresa de servicios con necesidad de reducir tiempo de contratación de 45 a <20 días",
          "tarea": "Liderar proceso completo de reclutamiento para 85 posiciones críticas en 18 meses",
          "accion": "Implementé sistema ATS, estandaricé entrevistas por competencias, capacité a 12 reclutadores",
          "resultado": "Reduje tiempo promedio de contratación de 45 a 18 días (-60%), completé 85 contrataciones con 96% de retención a 6 meses"
        },
        "checklist": [
          "✅ Incluye un verbo de acción fuerte (Lideré, Implementé, Optimicé, Reduje)",
          "✅ Menciona números específicos (cantidad de personas, porcentajes, tiempo)",
          "✅ Muestra el ANTES y DESPUÉS (de X a Y)",
          "✅ Incluye el contexto o scope (número de colaboradores, presupuesto, etc)",
          "✅ Demuestra el impacto en negocio (ahorro, eficiencia, retención)",
          "✅ Usa keywords del Job Description naturalmente"
        ]
      }
    },
    "education": {
      "score": 95,
      "socraticGuide": {
        "intro": "Tu educación es excelente y está bien presentada.",
        "questions": [
          "¿Tienes proyectos académicos relevantes para mencionar?",
          "¿Participaste en investigación o publicaciones?",
          "¿Obtuviste reconocimientos o becas?",
          "¿Hiciste prácticas profesionales relevantes?"
        ],
        "transformation": {
          "bad": "Licenciatura en Psicología - UNAM (2016-2020)",
          "good": "Licenciatura en Psicología Organizacional - UNAM (2016-2020) | Promedio: 9.2/10 | Mención Honorífica"
        },
        "templateSTAR": {
          "context": {
            "jdMentions": "El JD menciona: 'Licenciatura en Psicología, Administración o afines'",
            "cvShows": "Tu CV muestra: 'Lic. Psicología Organizacional - UNAM con Mención Honorífica'"
          },
          "situacion": "Formación especializada en psicología aplicada al ámbito organizacional",
          "tarea": "Completar licenciatura con enfoque en gestión de talento y comportamiento organizacional",
          "accion": "Mantuve promedio 9.2/10, me especialicé en RH, completé proyecto de investigación sobre rotación",
          "resultado": "Titulada con Mención Honorífica, certificada en competencias de RH aplicadas"
        },
        "checklist": [
          "✅ Incluye promedio si es >8.0",
          "✅ Menciona reconocimientos (Mención Honorífica, becas, etc)",
          "✅ Agrega especialización o enfoque si es relevante",
          "✅ Incluye año de egreso"
        ]
      }
    },
    "skills": {
      "score": 88,
      "socraticGuide": {
        "intro": "Tus skills están bien organizados, pero pueden tener más impacto.",
        "questions": [
          "¿En qué proyectos específicos usaste cada skill?",
          "¿Qué nivel de dominio tienes en cada herramienta?",
          "¿Cuánto tiempo llevas usando cada tecnología?",
          "¿Tienes certificaciones que respalden tus skills?"
        ],
        "transformation": {
          "bad": "Excel, PowerPoint, Workday",
          "good": "Excel Avanzado (macros, Power Query, tablas dinámicas - 3+ años) | Workday (nivel usuario avanzado - certificado) | PowerPoint (presentaciones ejecutivas para C-level)"
        },
        "templateSTAR": {
          "context": {
            "jdMentions": "El JD menciona: 'Dominio de Excel, PowerPoint'",
            "cvShows": "Tu CV muestra: 'Excel avanzado, PowerPoint'"
          },
          "situacion": "Necesidad de automatizar procesos de nómina y reporting ejecutivo",
          "tarea": "Dominar Excel avanzado y PowerPoint para análisis y presentaciones",
          "accion": "Completé certificación Excel Avanzado, creé macros VBA, diseñé dashboards en Power BI",
          "resultado": "Automaticé cálculo de bonos (ahorro 20hrs/mes), presenté reportes mensuales a Dirección"
        },
        "checklist": [
          "✅ Especifica nivel de dominio (básico, intermedio, avanzado)",
          "✅ Agrupa por categorías (Técnicas, Blandas, Sistemas)",
          "✅ Prioriza skills del Job Description al inicio",
          "✅ Incluye años de experiencia o certificaciones si tienes"
        ]
      }
    }
  },
  "improvementPath": {
    "current": 85,
    "potential": 95,
    "timeToImprove": "2-3 horas",
    "steps": [
      {
        "action": "Agrega 3 keywords técnicas críticas del JD: 'gestión de proyectos', 'análisis de datos', 'capacitación'",
        "impact": "+4%",
        "timeframe": "20 minutos",
        "detailedExamples": {
          "context": "El JD enfatiza 'gestión de proyectos' mencionándolo 3 veces, pero tu CV no lo menciona explícitamente aunque SÍ tienes experiencia relacionada.",
          "direct": {
            "title": "Si TIENES experiencia directa en gestión de proyectos:",
            "bullets": [
              "Gestioné proyecto de implementación de nuevo sistema HRIS impactando 220 colaboradores, completado en 3 meses bajo presupuesto",
              "Lideré 5 proyectos simultáneos de mejora de procesos RH con ROI promedio de 125%",
              "Coordiné proyecto cross-funcional (RH, IT, Finanzas) para automatización de nómina"
            ]
          },
          "indirect": {
            "title": "Si tienes experiencia RELACIONADA pero no directa:",
            "bullets": [
              "Lideré implementación de nuevo sistema de control de incidencias que impactó 220 colaboradores durante 4 meses",
              "Coordiné con 3 áreas (IT, Finanzas, Operaciones) para automatizar cálculo de bonos",
              "Planifiqué y ejecuté renovación de políticas de compensación en 6 fases durante 2 trimestres"
            ]
          },
          "noExperience": {
            "title": "Si NO tienes experiencia directa:",
            "bullets": [
              "Colaboré en 3 proyectos multidisciplinarios de RH aportando análisis de datos y seguimiento",
              "Participé activamente en planning y retrospectivas de proyectos de mejora continua",
              "Apoyé coordinación de proyecto de certificación NOM-035 gestionando documentación y timeline"
            ]
          },
          "proTip": "Usa un verbo de LIDERAZGO incluso en colaboración: 'Coordiné', 'Facilité', 'Impulse' tienen más peso que 'Apoyé' o 'Participé'."
        }
      },
      {
        "action": "Cuantifica 3 logros actuales agregando métricas de impacto (%, tiempo, $)",
        "impact": "+3%",
        "timeframe": "30 minutos",
        "detailedExamples": {
          "context": "Tienes bullets como 'Administré pre-nómina de colaboradores'. Agregar números específicos aumenta credibilidad.",
          "direct": {
            "title": "Transforma bullets vagos en específicos:",
            "bullets": [
              "ANTES: 'Resolví conflictos laborales' → DESPUÉS: 'Resolví 45 conflictos laborales mediante mediación, logrando acuerdos en 96% de casos (solo 2 llegaron a legal)'",
              "ANTES: 'Lideré procesos de reclutamiento' → DESPUÉS: 'Lideré 120+ procesos de reclutamiento contratando 85 posiciones en <18 días promedio, 62% más rápido que benchmark'",
              "ANTES: 'Reduje ausentismo' → DESPUÉS: 'Implementé sistema de control reduciendo ausentismo injustificado de 12% a 4.8% (-60%) en 6 meses'"
            ]
          },
          "proTip": "Fórmula ganadora: [Verbo de acción] + [qué hiciste] + [métrica numérica] + [impacto en negocio] + [tiempo]"
        }
      }
    ]
  },
  "atsDetectionGuide": {
    "commonByIndustry": {
      "tech": ["Greenhouse", "Lever", "Workable"],
      "startups": ["Greenhouse", "Lever", "Workable", "Ashby"],
      "enterprises": ["Workday", "SAP SuccessFactors", "Taleo", "Oracle HCM"],
      "agencies": ["Bullhorn", "Jobvite", "iCIMS"]
    },
    "detectionTips": [
      "Busca el nombre del ATS en el footer del portal de aplicación (usualmente en letra pequeña)",
      "Revisa la URL del portal: greenhouse.io, myworkday.com, jobs.lever.co, etc.",
      "LinkedIn Jobs usa su propio sistema de matching interno (no es ATS tradicional)",
      "Indeed, Monster y agregadores NO usan ATS propio, redirigen al portal de la empresa",
      "Si la aplicación es solo enviar email con CV adjunto → probablemente NO hay ATS"
    ]
  },
  "reasoning": "El CV muestra experiencia sólida de 3+ años en RH y administración de personal. Las áreas prioritarias de mejora son: (1) agregar keywords específicas del JD que faltan ('gestión de proyectos', 'capacitación', 'desarrollo organizacional'), (2) cuantificar logros existentes con métricas más específicas, (3) enfatizar experiencia comercial mencionada en el JD. Con estas mejoras, el score puede aumentar de 85% actual a 95% potencial en 2-3 horas de trabajo."
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Eres el experto #1 mundial en ATS (Applicant Tracking Systems - Sistemas de Seguimiento de Candidatos) y optimización de CVs para reclutamiento. CRÍTICO: En 'keywords.*.missing' SOLO incluye keywords que están en el JOB DESCRIPTION pero NO en el CV. NUNCA incluyas keywords del CV que no están en el JD. CRÍTICO: Genera datos COMPLETOS para los 10 ATS en atsBreakdown (Workday, Greenhouse, iCIMS, Lever, SAP SuccessFactors, BambooHR, Taleo, Jobvite, Bullhorn, Workable). NUNCA dejes un ATS vacío. Respondes SOLO con JSON válido sin markdown."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 8000,
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
      console.error('Raw response:', jsonText.substring(0, 500));
      throw new Error('Respuesta de AI no es JSON válido');
    }

    // VALIDACIÓN: Asegurar estructura completa
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
        timeToImprove: "2-3 horas",
        steps: []
      };
    }

    // 🔥 BUG FIX #2: Validar que TODOS los 10 ATS tengan datos completos
    const requiredATS = [
      'Workday', 'Greenhouse', 'iCIMS', 'Lever', 'SAP SuccessFactors',
      'BambooHR', 'Taleo', 'Jobvite', 'Bullhorn', 'Workable'
    ];

    if (!analysis.atsBreakdown) {
      analysis.atsBreakdown = {};
    }

    requiredATS.forEach(ats => {
      if (!analysis.atsBreakdown[ats]) {
        // Crear datos por defecto si faltan
        const score = analysis.scores?.[ats] || 75;
        analysis.atsBreakdown[ats] = {
          score: score,
          strengths: [
            "Formato compatible con estándares ATS",
            "Keywords relevantes presentes"
          ],
          weaknesses: [
            "Podría optimizar distribución de keywords",
            "Algunos bullets sin métricas cuantificables"
          ],
          tips: [
            {
              tip: "Agrega métricas cuantificables en cada bullet point",
              example: "En lugar de 'Gestioné personal', usa 'Gestioné equipo de 25 personas aumentando productividad 30%'",
              why: `${ats} prioriza logros medibles para mejor matching con requisitos`
            },
            {
              tip: "Incluye keywords del JD en primeras líneas de cada sección",
              example: "Coloca las palabras clave más importantes del puesto al inicio de tu experiencia",
              why: `${ats} da más peso a keywords encontradas en el primer tercio del documento`
            }
          ]
        };
      } else {
        // Validar que tenga todos los campos
        if (!analysis.atsBreakdown[ats].tips || !Array.isArray(analysis.atsBreakdown[ats].tips)) {
          analysis.atsBreakdown[ats].tips = [
            {
              tip: "Optimiza formato para mejor extracción automática",
              example: "Usa bullets con • y estructura clara en cada sección",
              why: `${ats} extrae mejor información con formato estructurado`
            }
          ];
        }
        if (!analysis.atsBreakdown[ats].strengths || analysis.atsBreakdown[ats].strengths.length === 0) {
          analysis.atsBreakdown[ats].strengths = ["Formato compatible", "Keywords presentes"];
        }
        if (!analysis.atsBreakdown[ats].weaknesses || analysis.atsBreakdown[ats].weaknesses.length === 0) {
          analysis.atsBreakdown[ats].weaknesses = ["Optimización de keywords", "Métricas en algunos bullets"];
        }
      }
    });

    // Validar que sectionScores tenga socraticGuide
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