// api/analyze-ai.js - VERSIÓN ULTRA-ROBUSTA - BUGS #1-6 ARREGLADOS
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

// === ANÁLISIS CON GROQ - PROMPT ULTRA-ROBUSTO ===
async function analyzeWithAI(cvText, jdText) {
  const prompt = `Eres el experto #1 mundial en Sistemas de Seguimiento de Candidatos (ATS - Applicant Tracking Systems) y optimización de CVs para reclutamiento.

**TU MISIÓN CRÍTICA:**
Analizar este CV contra el Job Description específico y generar un reporte COMPLETO, DETALLADO, ESPECÍFICO y 100% ACCIONABLE con EJEMPLOS REALES Y COPIABLES basados en la experiencia ACTUAL del candidato.

**JOB DESCRIPTION:**
${jdText.substring(0, 2500)}

**CURRICULUM VITAE:**
${cvText.substring(0, 3500)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 INSTRUCCIONES CRÍTICAS - CUMPLE TODAS O FALLAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 **BUG FIX #1 Y #3 - KEYWORDS FALTANTES (ULTRA CRÍTICO):**

**PASO 1 - EXTRACCIÓN DE KEYWORDS DEL JD:**
Lee CUIDADOSAMENTE el Job Description proporcionado arriba.
Extrae SOLO keywords que están EXPLÍCITAMENTE ESCRITAS en el texto del JD.

Ejemplos de lo que SÍ cuenta como keyword del JD:
✓ "Excel" → si el JD dice literalmente "Excel"
✓ "comunicación efectiva" → si el JD dice "comunicación efectiva" o "habilidades de comunicación"
✓ "trabajo en equipo" → si el JD dice "trabajo en equipo"
✓ "administración de personal" → si el JD dice "administración de personal"

Ejemplos de lo que NO cuenta:
✗ "gestión de proyectos" → si el JD NO menciona esto explícitamente
✗ "análisis de datos" → si el JD NO menciona esto explícitamente
✗ "pensamiento crítico" → si el JD NO menciona esto explícitamente
✗ "liderazgo" → si el JD NO menciona esta palabra exacta

**PASO 2 - EXTRACCIÓN DE KEYWORDS DEL CV:**
Lee CUIDADOSAMENTE el CV proporcionado arriba.
Extrae keywords que están presentes en el CV.

**PASO 3 - CALCULAR MISSING:**
REGLA DE ORO ABSOLUTA:
- keywords.*.missing = SOLO keywords que cumplen AMBAS condiciones:
  1. Están EXPLÍCITAMENTE en el Job Description
  2. NO están en el CV

**PASO 4 - SI NO HAY FALTANTES:**
Si una categoría NO tiene keywords faltantes (porque el CV cubre todo el JD):
- Deja el array "missing" VACÍO: []
- NO inventes keywords
- NO agregues sinónimos
- NO agregues "recomendaciones"

**EJEMPLO CORRECTO:**

Job Description dice:
"Requisitos: Licenciatura en Psicología. Experiencia de 2 años en administración de personal. 
Conocimiento en Excel, PowerPoint. Habilidades de comunicación efectiva y trabajo en equipo. 
Proactividad, responsabilidad. Conocimiento en Reclutamiento y selección."

CV dice:
"Psicóloga con 3 años en RH. Excel avanzado, PowerPoint. Comunicación efectiva, trabajo en equipo.
Reclutamiento y selección. Workday, BambooHR."

✅ CORRECTO:
{
  "keywords": {
    "technical": {
      "found": ["Excel", "PowerPoint"],
      "missing": []  // ✓ No hay más técnicas en JD
    },
    "soft": {
      "found": ["comunicación efectiva", "trabajo en equipo", "proactividad", "responsabilidad"],
      "missing": []  // ✓ CV cubre todo el JD
    },
    "industry": {
      "found": ["administración de personal", "reclutamiento y selección"],
      "missing": []  // ✓ CV cubre todo el JD
    }
  }
}

❌ INCORRECTO:
{
  "keywords": {
    "technical": {
      "found": ["Excel", "PowerPoint"],
      "missing": ["gestión de proyectos", "análisis de datos"]  // ✗ NO están en JD!
    },
    "soft": {
      "found": ["comunicación efectiva", "trabajo en equipo"],
      "missing": ["liderazgo", "negociación"]  // ✗ NO están en JD!
    }
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 **BUG FIX #2 - ATS BREAKDOWN COMPLETO:**

DEBES generar datos COMPLETOS para los 10 ATS en "atsBreakdown".
NUNCA dejes un ATS sin datos. TODOS deben tener:
- score
- strengths (al menos 2)
- weaknesses (al menos 2)
- tips (al menos 2, cada uno con tip, example, why)

Los 10 ATS OBLIGATORIOS:
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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 **BUG FIX #4 - RECOMENDACIONES PRIORIZADAS (CRÍTICO):**

DEBES generar AL MENOS 3-8 recomendaciones en el array "recommendations".

CADA recomendación DEBE tener:
- priority: "critical" | "important" | "optional"
- text: Descripción clara de la mejora
- section: "experience" | "education" | "skills" | "summary" | "format"
- example: Ejemplo ESPECÍFICO y COPIABLE (NUNCA vacío)
- impact: "high" | "medium" | "low"

Las recomendaciones deben estar basadas en:
1. Keywords del JD que faltan en el CV
2. Formato ATS (bullets, fechas, métricas)
3. Secciones faltantes (summary, certificaciones)
4. Oportunidades de cuantificar logros

**NUNCA dejes recommendations vacío o con solo 1 elemento.**

Distribución sugerida:
- 1-3 críticas (keywords faltantes más importantes)
- 2-4 importantes (formato, métricas, secciones)
- 1-2 opcionales (mejoras nice-to-have)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 **BUG FIX #5 - RUTA DE MEJORA RELEVANTE (CRÍTICO):**

Los pasos en "improvementPath.steps" DEBEN estar basados SOLO en:
1. Keywords que REALMENTE faltan del JD (identificadas en paso anterior)
2. Mejoras de formato ATS
3. Cuantificación de logros existentes

NUNCA menciones keywords que NO están en el Job Description.

**VALIDACIÓN antes de generar cada paso:**
- ¿Esta keyword está EXPLÍCITAMENTE en el JD? → SÍ: incluir, NO: omitir
- ¿Esta mejora ayuda con los 10 ATS? → SÍ: incluir
- ¿Está basada en el análisis real del CV? → SÍ: incluir

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 **BUG FIX #6 - EJEMPLOS DETALLADOS NUNCA VACÍOS (CRÍTICO):**

En CADA paso de "improvementPath.steps", el campo "detailedExamples" DEBE estar 100% completo:

NUNCA uses "" (strings vacíos) en:
- detailedExamples.context.jdMentions
- detailedExamples.context.cvShows
- detailedExamples.direct.title
- detailedExamples.direct.bullets (array NUNCA vacío)
- detailedExamples.indirect.title
- detailedExamples.indirect.bullets (array NUNCA vacío)
- detailedExamples.noExperience.title
- detailedExamples.noExperience.bullets (array NUNCA vacío)

**FORMATO OBLIGATORIO para detailedExamples:**

{
  "context": {
    "jdMentions": "El JD menciona: '[keyword específica del JD]'",
    "cvShows": "Tu CV muestra: '[experiencia relevante del CV]'"
  },
  "direct": {
    "title": "Si TIENES experiencia directa en [keyword]:",
    "bullets": [
      "Bullet 1 copiable con métricas",
      "Bullet 2 copiable con métricas",
      "Bullet 3 copiable con métricas"
    ]
  },
  "indirect": {
    "title": "Si tienes experiencia RELACIONADA pero no directa:",
    "bullets": [
      "Bullet 1 copiable",
      "Bullet 2 copiable",
      "Bullet 3 copiable"
    ]
  },
  "noExperience": {
    "title": "Si NO tienes experiencia directa:",
    "bullets": [
      "Bullet 1 copiable",
      "Bullet 2 copiable"
    ]
  },
  "proTip": "Consejo profesional relevante"
}

**TODOS los bullets deben ser específicos, copiables y con métricas cuando sea posible.**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**RESUMEN DE PRIORIDADES:**
1. ✅ Keywords missing = SOLO del JD que NO están en CV
2. ✅ Si no faltan keywords → missing = []
3. ✅ Generar 3-8 recommendations con ejemplos
4. ✅ Ruta de mejora SOLO con keywords del JD
5. ✅ detailedExamples SIEMPRE completos, NUNCA ""
6. ✅ Todos los 10 ATS con datos completos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Responde SOLO con JSON válido (sin markdown, sin \`\`\`json). Formato EXACTO:

{
  "matchRate": 90,
  "scores": {
    "Workday": 90,
    "Greenhouse": 88,
    "iCIMS": 85,
    "Lever": 91,
    "SAP SuccessFactors": 82,
    "BambooHR": 92,
    "Taleo": 86,
    "Jobvite": 88,
    "Bullhorn": 84,
    "Workable": 90
  },
  "recommendations": [
    {
      "priority": "critical",
      "text": "Agrega summary profesional de 3-4 líneas al inicio del CV para captar atención de ATS y reclutadores",
      "impact": "high",
      "section": "summary",
      "example": "BASADO EN TU PERFIL:\\n\\nPsicóloga Organizacional con 3+ años liderando reclutamiento y administración de personal en empresas de servicios. Especialista en reducir tiempos de contratación (-62%) y resolver conflictos laborales (96% éxito). Dominio de Excel avanzado, Workday, y cumplimiento normativo (NOM-035, STPS)."
    },
    {
      "priority": "important",
      "text": "Cuantifica 3-5 logros actuales agregando métricas específicas (números, %, tiempo, $)",
      "impact": "high",
      "section": "experience",
      "example": "TRANSFORMA:\\n❌ 'Resolví conflictos laborales'\\n\\nEN:\\n✅ 'Resolví 45 conflictos laborales mediante mediación, logrando acuerdos en 96% de casos (solo 2 llegaron a instancia legal)'"
    },
    {
      "priority": "important",
      "text": "Usa formato de bullets con • al inicio de cada logro para mejor extracción por ATS",
      "impact": "medium",
      "section": "format",
      "example": "FORMATO CORRECTO:\\n• Lideré 120+ procesos de reclutamiento...\\n• Implementé sistema de control...\\n• Administré pre-nómina de 220 colaboradores..."
    },
    {
      "priority": "optional",
      "text": "Estandariza fechas a formato MM/YYYY en toda la experiencia laboral",
      "impact": "low",
      "section": "format",
      "example": "CAMBIAR:\\n'Enero 2022 - Presente' o '2022-actual'\\n\\nA:\\n'01/2022 - Presente'\\n\\nEsto permite a los ATS calcular años de experiencia automáticamente."
    }
  ],
  "strengths": [
    "3+ años de experiencia en administración de personal y reclutamiento",
    "Dominio de Excel avanzado y sistemas HRIS (Workday, BambooHR, SAP SuccessFactors)",
    "Experiencia cuantificada con métricas de impacto (reducción de ausentismo 60%, contrataciones <18 días)",
    "Certificaciones relevantes (SHRM, IMCP, Excel Avanzado)",
    "Experiencia en cumplimiento normativo (NOM-035, STPS, IMSS)"
  ],
  "keywords": {
    "technical": {
      "found": ["Excel", "PowerPoint", "Google Workspace"],
      "missing": []
    },
    "soft": {
      "found": ["comunicación efectiva", "trabajo en equipo", "proactividad", "responsabilidad", "orientación a resultados"],
      "missing": []
    },
    "industry": {
      "found": ["administración de personal", "reclutamiento y selección", "recursos humanos", "pre nómina"],
      "missing": []
    }
  },
  "atsBreakdown": {
    "Workday": {
      "score": 90,
      "strengths": [
        "Experiencia usando Workday mencionada en CV aumenta compatibilidad",
        "Formato limpio y organizado compatible con parseo de Workday"
      ],
      "weaknesses": [
        "Falta summary ejecutivo al inicio",
        "Algunos bullets podrían tener más métricas cuantificables"
      ],
      "tips": [
        {
          "tip": "Agrega summary profesional de 3-4 líneas al inicio del CV",
          "example": "Psicóloga Organizacional con 3+ años liderando procesos de RH en servicios. Especialista en reducir tiempos de contratación 62% y resolver conflictos con 96% éxito. Dominio de Workday, Excel avanzado y normativa laboral.",
          "why": "Workday ATS usa el summary ejecutivo para matching inicial de keywords y scoring rápido"
        },
        {
          "tip": "Usa bullets con • al inicio de cada logro",
          "example": "• Lideré 120+ procesos de reclutamiento contratando 85 posiciones en <18 días\\n• Implementé sistema de control reduciendo ausentismo de 12% a 4.8%\\n• Administré pre-nómina de 220 colaboradores con 0 errores",
          "why": "Workday extrae mejor información con formato de bullets estandarizado"
        }
      ]
    },
    "Greenhouse": {
      "score": 88,
      "strengths": [
        "Experiencia en reclutamiento bien detallada",
        "Métricas de contratación claramente especificadas"
      ],
      "weaknesses": [
        "Falta summary ejecutivo",
        "Podría enfatizar más experiencia con herramientas de tracking"
      ],
      "tips": [
        {
          "tip": "Incluye summary profesional que capture tu propuesta de valor",
          "example": "Especialista en Administración de Personal & Reclutamiento con 3+ años reduciendo tiempos de contratación 62% y costos operativos. Experta en Workday, Excel avanzado (macros, Power BI) y cumplimiento 100% normativo.",
          "why": "Greenhouse valora un summary claro que facilite el screening inicial"
        },
        {
          "tip": "Menciona experiencia con procesos de reclutamiento end-to-end",
          "example": "• Gestioné ciclo completo de reclutamiento: sourcing, screening, entrevistas, negociación y onboarding para 85 posiciones\\n• Reduje time-to-hire de 45 a 18 días implementando pipeline estructurado",
          "why": "Greenhouse busca experiencia en proceso completo de reclutamiento"
        }
      ]
    },
    "iCIMS": {
      "score": 85,
      "strengths": [
        "Estructura cronológica clara",
        "Experiencia relevante en administración de personal"
      ],
      "weaknesses": [
        "Keywords podrían estar más distribuidas en primeras líneas",
        "Falta mención de compliance y auditorías"
      ],
      "tips": [
        {
          "tip": "Coloca keywords más importantes en primeras 3 líneas de cada experiencia",
          "example": "Especialista en Recursos Humanos enfocada en reclutamiento, administración de personal y cumplimiento normativo.\\n• Lideré 120+ procesos...\\n• Administré pre-nómina...",
          "why": "iCIMS da más peso a keywords en el primer tercio de cada sección"
        },
        {
          "tip": "Enfatiza experiencia en compliance y normativa laboral",
          "example": "• Aseguré 100% cumplimiento de normativa laboral (NOM-035, STPS, IMSS, INFONAVIT) en auditorías\\n• Implementé políticas internas alineadas a regulaciones vigentes",
          "why": "iCIMS valora experiencia en compliance para roles de RH"
        }
      ]
    },
    "Lever": {
      "score": 91,
      "strengths": [
        "Métricas de impacto muy bien cuantificadas",
        "Experiencia en reclutamiento claramente destacada"
      ],
      "weaknesses": [
        "Podría agregar más contexto de industria",
        "Falta mención de employer branding"
      ],
      "tips": [
        {
          "tip": "Agrega contexto de industria en cada bullet principal",
          "example": "En sector de servicios de RH (220 empleados, 15 clientes corporativos):\\n• Lideré 120+ procesos de reclutamiento...\\n• Reduje ausentismo 60% mediante...",
          "why": "Lever valora contexto de industria y tamaño de organización para mejor matching"
        },
        {
          "tip": "Menciona cualquier experiencia con branding o atracción de talento",
          "example": "• Diseñé estrategia de employer branding en LinkedIn aumentando aplicaciones calificadas 40%\\n• Representé empresa en 3 ferias de empleo atrayendo 150+ candidatos",
          "why": "Lever enfatiza experiencia en atracción y branding de talento"
        }
      ]
    },
    "SAP SuccessFactors": {
      "score": 82,
      "strengths": [
        "Experiencia usando SAP SuccessFactors mencionada",
        "Conocimiento de procesos de nómina y administración"
      ],
      "weaknesses": [
        "Podría enfatizar más integración con sistemas empresariales",
        "Falta mención de reporting y analytics"
      ],
      "tips": [
        {
          "tip": "Destaca experiencia con sistemas integrados y ERP",
          "example": "• Administré pre-nómina de 220 colaboradores en SAP SuccessFactors integrado con sistema contable\\n• Generé reportes ejecutivos de headcount y costos laborales en Power BI",
          "why": "SAP SuccessFactors busca experiencia con ecosistemas empresariales integrados"
        },
        {
          "tip": "Menciona experiencia con reporting y análisis de datos de RH",
          "example": "• Elaboré dashboards en Excel/Power BI para tracking de KPIs de RH (rotación, ausentismo, time-to-hire)\\n• Presenté análisis mensual de métricas a dirección con insights accionables",
          "why": "SAP SuccessFactors valora habilidades analíticas y de reporting"
        }
      ]
    },
    "BambooHR": {
      "score": 92,
      "strengths": [
        "Experiencia usando BambooHR mencionada",
        "Perfil ideal para empresas medianas que usan BambooHR"
      ],
      "weaknesses": [
        "Podría enfatizar más experiencia del empleado",
        "Falta mención de onboarding estructurado"
      ],
      "tips": [
        {
          "tip": "Destaca experiencia en employee experience y ciclo de vida",
          "example": "• Diseñé proceso de onboarding estructurado que redujo rotación en primeros 90 días en 35%\\n• Implementé programa de reconocimiento aumentando engagement 25%",
          "why": "BambooHR enfatiza experiencia del empleado y cultura organizacional"
        },
        {
          "tip": "Menciona experiencia coordinando con múltiples stakeholders",
          "example": "• Coordiné con 8 hiring managers y 3 áreas (IT, Finanzas, Legal) para optimizar procesos\\n• Facilité sesiones de feedback 360° con líderes de equipo",
          "why": "BambooHR valora colaboración cross-funcional"
        }
      ]
    },
    "Taleo": {
      "score": 86,
      "strengths": [
        "Experiencia en compliance y normativa",
        "Procesos estructurados y documentados"
      ],
      "weaknesses": [
        "Podría enfatizar más automatización de procesos",
        "Falta mención de workflows y aprobaciones"
      ],
      "tips": [
        {
          "tip": "Enfatiza cumplimiento normativo y auditorías",
          "example": "• Aseguré 100% cumplimiento en auditorías STPS, IMSS e INFONAVIT durante 3 años consecutivos\\n• Implementé políticas internas alineadas a NOM-035 y regulaciones vigentes",
          "why": "Taleo (Oracle) prioriza compliance y procesos estructurados"
        },
        {
          "tip": "Menciona experiencia automatizando procesos repetitivos",
          "example": "• Automaticé cálculo de bonos por desempeño usando Excel VBA ahorrando 20 horas/mes\\n• Creé workflows de aprobación para solicitudes de vacaciones y permisos",
          "why": "Taleo valora eficiencia operacional y automatización"
        }
      ]
    },
    "Jobvite": {
      "score": 88,
      "strengths": [
        "Experiencia sólida en reclutamiento",
        "Métricas de contratación bien definidas"
      ],
      "weaknesses": [
        "Falta mención de social recruiting",
        "Podría agregar experiencia con referrals"
      ],
      "tips": [
        {
          "tip": "Destaca experiencia con reclutamiento social y referrals",
          "example": "• Implementé programa de referidos que generó 25% de contrataciones con 90% retención a 1 año\\n• Utilicé LinkedIn Recruiter para sourcing activo de candidatos pasivos",
          "why": "Jobvite enfatiza social recruiting y referral programs"
        },
        {
          "tip": "Menciona métricas de candidate experience y pipeline",
          "example": "• Mantuve pipeline activo de 150+ candidatos calificados reduciendo time-to-fill 40%\\n• Logré 4.5/5 en encuestas de candidate experience",
          "why": "Jobvite valora métricas de experiencia del candidato"
        }
      ]
    },
    "Bullhorn": {
      "score": 84,
      "strengths": [
        "Experiencia en servicios (consultoría)",
        "Manejo de múltiples clientes y proyectos"
      ],
      "weaknesses": [
        "Falta énfasis en ventas y desarrollo de negocio",
        "Podría destacar más experiencia con agencias"
      ],
      "tips": [
        {
          "tip": "Enfatiza experiencia comercial y manejo de clientes",
          "example": "• Apoyé área comercial elaborando 12 propuestas técnicas que generaron 3 contratos (valor $450K)\\n• Gestioné relación con 8 clientes corporativos logrando 95% renovación anual",
          "why": "Bullhorn es usado por agencias de staffing que valoran skills comerciales"
        },
        {
          "tip": "Menciona experiencia con staffing temporal o proyectos",
          "example": "• Coordiné asignación de 50+ recursos temporales a proyectos de clientes\\n• Gestioné ciclo completo desde sourcing hasta placement y seguimiento",
          "why": "Bullhorn está optimizado para agencias y staffing temporal"
        }
      ]
    },
    "Workable": {
      "score": 90,
      "strengths": [
        "Perfil completo y bien balanceado",
        "Experiencia colaborativa con stakeholders"
      ],
      "weaknesses": [
        "Podría agregar más colaboración con hiring managers",
        "Falta énfasis en uso de datos para decisiones"
      ],
      "tips": [
        {
          "tip": "Destaca colaboración con hiring managers y equipos",
          "example": "• Colaboré con 12 hiring managers para definir perfiles, realizar entrevistas y seleccionar candidatos\\n• Facilité 30+ sesiones de calibración para alinear criterios de evaluación",
          "why": "Workable valora colaboración efectiva entre RH y hiring managers"
        },
        {
          "tip": "Menciona uso de analytics y data para mejorar procesos",
          "example": "• Analicé métricas de funnel de reclutamiento identificando 3 cuellos de botella\\n• Implementé cambios basados en datos que redujeron time-to-hire 35%",
          "why": "Workable enfatiza decisiones basadas en datos y mejora continua"
        }
      ]
    }
  },
  "sectionScores": {
    "experience": {
      "score": 90,
      "socraticGuide": {
        "intro": "Tu experiencia es sólida, pero puede brillar más mostrando el IMPACTO cuantificable.",
        "questions": [
          "¿Cuántas personas se beneficiaron directamente de tu trabajo?",
          "¿Qué métrica específica mejoró gracias a tu intervención? (tiempo, costo, eficiencia, satisfacción)",
          "¿Cuánto tiempo o dinero ahorraste a la empresa con tus iniciativas?",
          "¿Cuál fue el ANTES y el DESPUÉS medible de tu mejor logro?",
          "¿Qué problema crítico resolviste y cómo lo mediste?"
        ],
        "transformation": {
          "bad": "Resolví conflictos laborales en la empresa",
          "badReason": "Es vago, no muestra cantidad, método ni resultados",
          "good": "Resolví 45 conflictos laborales mediante mediación, logrando acuerdos en 96% de casos (solo 2 llegaron a instancia legal), ahorrando $80K en costos legales",
          "goodReason": "Específico, cuantificado (45 casos, 96%), muestra método (mediación), impacto en negocio ($80K)"
        },
        "templateSTAR": {
          "context": {
            "jdMentions": "El JD menciona: 'manejo de relaciones laborales y resolución de conflictos'",
            "cvShows": "Tu CV muestra: 'Resolví 45 conflictos laborales mediante mediación'"
          },
          "situacion": "Empresa de servicios RH con 220 colaboradores enfrentando incremento de 40% en conflictos laborales vs año anterior",
          "tarea": "Reducir conflictos y resolver casos existentes sin llegar a instancias legales costosas",
          "accion": "Implementé protocolo de mediación estructurado, capacité a 5 líderes en resolución de conflictos, establecí sesiones de escucha activa semanales",
          "resultado": "Resolví 45 casos con 96% éxito (solo 2 a legal), reduje nuevos conflictos 60%, ahorré $80K en costos legales, mejoré clima laboral (encuesta +35 pts)"
        },
        "checklist": [
          "✅ Verbo de acción fuerte al inicio (Lideré, Implementé, Reduje, Optimicé)",
          "✅ Números específicos (cantidad, porcentajes, tiempo, $)",
          "✅ ANTES y DESPUÉS claro (de X a Y)",
          "✅ Contexto o scope (número de personas, presupuesto, clientes)",
          "✅ Impacto en el negocio (ahorro, eficiencia, retención, satisfacción)",
          "✅ Keywords del JD integradas naturalmente",
          "✅ Método o herramienta usada (cuando sea relevante)"
        ]
      }
    },
    "education": {
      "score": 95,
      "socraticGuide": {
        "intro": "Tu educación está excelente y bien presentada con Mención Honorífica.",
        "questions": [
          "¿Tienes tesis o proyecto final relevante para mencionar?",
          "¿Participaste en investigación académica relacionada a RH?",
          "¿Obtuviste otros reconocimientos, becas o premios?",
          "¿Realizaste prácticas profesionales destacadas?"
        ],
        "transformation": {
          "bad": "Licenciatura en Psicología - UNAM (2016-2020)",
          "good": "Licenciatura en Psicología Organizacional - UNAM (2016-2020) | Promedio: 9.2/10 | Mención Honorífica | Tesis: Impacto del clima laboral en rotación de personal"
        },
        "templateSTAR": {
          "context": {
            "jdMentions": "El JD solicita: 'Licenciatura en Psicología, Administración o afines'",
            "cvShows": "Tu CV muestra: 'Lic. Psicología Organizacional - UNAM con Mención Honorífica'"
          },
          "situacion": "Formación académica especializada en comportamiento organizacional y gestión de talento",
          "tarea": "Completar licenciatura con enfoque aplicado en Recursos Humanos",
          "accion": "Mantuve promedio 9.2, me especialicé en psicología aplicada al trabajo, desarrollé tesis sobre rotación de personal",
          "resultado": "Titulada con Mención Honorífica, apliqué conocimientos directamente en primer trabajo RH"
        },
        "checklist": [
          "✅ Incluye promedio si es >8.5",
          "✅ Menciona reconocimientos (Mención Honorífica, becas)",
          "✅ Agrega especialización o enfoque relevante al puesto",
          "✅ Incluye año de egreso y titulación"
        ]
      }
    },
    "skills": {
      "score": 92,
      "socraticGuide": {
        "intro": "Tus skills están muy bien organizados y son relevantes.",
        "questions": [
          "¿En qué proyectos específicos aplicaste cada skill?",
          "¿Qué nivel de dominio tienes? (básico, intermedio, avanzado, experto)",
          "¿Cuántos años llevas usando cada herramienta?",
          "¿Tienes certificaciones que validen tus skills?"
        ],
        "transformation": {
          "bad": "Excel, PowerPoint, Workday",
          "good": "Excel Avanzado (macros VBA, Power Query, tablas dinámicas - 3+ años) | Workday (usuario avanzado - certificado) | PowerPoint (presentaciones ejecutivas C-level)"
        },
        "templateSTAR": {
          "context": {
            "jdMentions": "El JD requiere: 'Dominio de Excel, PowerPoint'",
            "cvShows": "Tu CV muestra: 'Excel Avanzado, PowerPoint'"
          },
          "situacion": "Necesidad de automatizar procesos manuales de nómina y crear reportes ejecutivos",
          "tarea": "Dominar Excel avanzado para eficiencia y PowerPoint para comunicación a dirección",
          "accion": "Completé Diplomado Excel Avanzado (LinkedIn Learning), practiqué macros VBA, diseñé templates de presentaciones",
          "resultado": "Automaticé cálculo de bonos (ahorro 20hrs/mes), creé dashboards en Power BI, presenté 12 reportes mensuales a CEO"
        },
        "checklist": [
          "✅ Especifica nivel de dominio (Básico, Intermedio, Avanzado, Experto)",
          "✅ Agrupa por categorías (Técnicas, Blandas, Sistemas)",
          "✅ Prioriza skills del JD al inicio de cada categoría",
          "✅ Incluye años de experiencia o certificaciones",
          "✅ Menciona herramientas específicas en lugar de categorías genéricas"
        ]
      }
    }
  },
  "improvementPath": {
    "current": 90,
    "potential": 96,
    "timeToImprove": "1-2 horas",
    "steps": [
      {
        "action": "Agrega summary profesional de 3-4 líneas al inicio del CV",
        "impact": "+3%",
        "timeframe": "15 minutos",
        "detailedExamples": {
          "context": {
            "jdMentions": "El JD busca: 'Experiencia en administración de personal, reclutamiento, pre-nómina'",
            "cvShows": "Tu CV muestra: Experiencia sólida de 3+ años en todas estas áreas"
          },
          "direct": {
            "title": "Opción 1 - Enfoque en Resultados:",
            "bullets": [
              "Psicóloga Organizacional con 3+ años liderando reclutamiento y administración de personal en empresas de servicios. Especialista en reducir tiempos de contratación (-62%, de 45 a 18 días) y resolver conflictos laborales (96% éxito). Dominio de Excel avanzado, Workday, BambooHR y cumplimiento 100% normativo (NOM-035, STPS, IMSS).",
              "Especialista en Recursos Humanos con track record reduciendo ausentismo 60% e implementando sistemas de control para 220+ colaboradores. Experta en pre-nómina (0 errores), reclutamiento por competencias (85 contrataciones exitosas) y relaciones laborales. Certificada en SHRM y dominio avanzado de HRIS.",
              "Professional de RH con 3+ años optimizando procesos de talento para empresas de servicios. Logros: 120+ contrataciones <18 días, reducción incidencias 60%, gestión de pre-nómina de 220 colaboradores sin errores. Excel avanzado (macros), Workday, cumplimiento normativo 100%."
            ]
          },
          "indirect": {
            "title": "Opción 2 - Enfoque en Habilidades:",
            "bullets": [
              "Psicóloga Organizacional especializada en administración integral de personal: reclutamiento, pre-nómina, relaciones laborales y compensaciones. 3+ años en empresas de servicios con dominio de Excel avanzado, sistemas HRIS y cumplimiento normativo. Perfil orientado a resultados y eficiencia operacional.",
              "Especialista en Administración de Personal con sólida experiencia en ciclo completo de talento: desde reclutamiento hasta gestión de nómina y resolución de conflictos. Competencias en herramientas analíticas (Excel, Power BI), sistemas empresariales (Workday, BambooHR, SAP) y cumplimiento legal.",
              "Professional de RH con expertise en administración de personal, reclutamiento por competencias y gestión de pre-nómina. Habilidades técnicas avanzadas (Excel, HRIS), conocimiento profundo de normativa laboral (IMSS, STPS, NOM-035) y enfoque en mejora continua de procesos."
            ]
          },
          "noExperience": {
            "title": "Opción 3 - Enfoque Balanceado:",
            "bullets": [
              "Psicóloga Organizacional con 3+ años en Recursos Humanos, combinando expertise técnico (Excel avanzado, Workday, BambooHR) con resultados medibles (reducción time-to-hire 62%, ausentismo -60%). Especialista en administración de personal, reclutamiento y cumplimiento normativo.",
              "Especialista en RH enfocada en optimización de procesos de talento y cumplimiento. Track record: 120+ contrataciones exitosas, gestión de pre-nómina sin errores para 220 colaboradores, 96% resolución de conflictos. Dominio de herramientas analíticas y sistemas empresariales."
            ]
          },
          "proTip": "El summary debe capturar tu propuesta de valor en 3-4 líneas máximo. Usa la fórmula: [Título profesional] + [años experiencia] + [especialidad] + [2-3 logros cuantificados] + [skills técnicas clave]. Colócalo justo debajo de tu información de contacto."
        }
      },
      {
        "action": "Cuantifica 3 logros actuales agregando métricas específicas",
        "impact": "+2%",
        "timeframe": "20 minutos",
        "detailedExamples": {
          "context": {
            "jdMentions": "El JD valora: 'Orientación a resultados'",
            "cvShows": "Tu CV tiene logros pero algunos pueden ser más específicos"
          },
          "direct": {
            "title": "Transforma bullets vagos en específicos y cuantificados:",
            "bullets": [
              "ANTES: 'Capacitación a reclutadores'\\nDESPUÉS: 'Capacité mensualmente a 12 reclutadores en técnicas de entrevista por competencias, aumentando tasa de aprobación de candidatos de 65% a 89% (+24 pts) y reduciendo rechazos de hiring managers 45%'",
              "ANTES: 'Elaboré reportes ejecutivos'\\nDESPUÉS: 'Elaboré 12 reportes ejecutivos mensuales en PowerPoint para Consejo Directivo, incluyendo análisis de KPIs de RH (rotación, ausentismo, time-to-hire) con 95% aprobación sin revisiones'",
              "ANTES: 'Apoyo en área comercial'\\nDESPUÉS: 'Apoyé área comercial elaborando 12 propuestas técnicas de servicios RH que generaron 3 contratos ganados (tasa conversión 25%) con valor total de $450K en nuevos ingresos'"
            ]
          },
          "indirect": {
            "title": "Si no tienes métricas exactas, usa estimaciones razonables:",
            "bullets": [
              "ANTES: 'Implementé política de compensaciones'\\nDESPUÉS: 'Diseñé e implementé política de compensaciones y beneficios alineada a mercado, contribuyendo a aumentar retención anual aproximadamente +15% y reducir rotación voluntaria'",
              "ANTES: 'Automatización de cálculo de bonos'\\nDESPUÉS: 'Automaticé cálculo de bonos por desempeño usando macros Excel VBA, reduciendo tiempo de proceso de ~25 horas mensuales a ~5 horas (-80%), liberando capacidad para actividades estratégicas'",
              "ANTES: 'Controlé vacaciones y permisos'\\nDESPUÉS: 'Gestioné control de vacaciones, permisos y licencias de 150 colaboradores con sistema automatizado, logrando 100% cumplimiento de políticas internas y 0 quejas o disputas'"
            ]
          },
          "noExperience": {
            "title": "Fórmula para cuantificar cuando no tienes números exactos:",
            "bullets": [
              "Usa rangos aproximados: '~120 procesos', '150+ colaboradores', '8-10 proyectos'",
              "Calcula impacto indirecto: 'contribuí a reducir...', 'apoyé en lograr...'",
              "Usa porcentajes de mejora estimados: 'aumentando aproximadamente 30%'",
              "Menciona frecuencia: 'mensualmente', 'semanalmente', 'en 12 meses'",
              "Incluye scope: 'para equipo de 25 personas', 'en 3 ubicaciones', 'con presupuesto de $X'"
            ]
          },
          "proTip": "Fórmula STAR con números: [Verbo acción] + [qué hiciste específicamente] + [método/herramienta] + [resultado numérico] + [impacto en negocio] + [timeframe]. Ejemplo: 'Implementé (verbo) sistema de control de asistencia (qué) usando Excel VBA (método) reduciendo ausentismo de 12% a 4.8% (-60%, resultado) en 220 colaboradores (scope) durante 6 meses (tiempo)'"
        }
      },
      {
        "action": "Usa formato de bullets • al inicio de cada logro para mejor extracción ATS",
        "impact": "+1%",
        "timeframe": "10 minutos",
        "detailedExamples": {
          "context": {
            "jdMentions": "Los ATS priorizan formato de bullets para mejor parseo",
            "cvShows": "Tu CV puede optimizar formato para todos los ATS"
          },
          "direct": {
            "title": "Formato correcto de bullets para ATS:",
            "bullets": [
              "✅ CORRECTO:\\n• Lideré 120+ procesos de reclutamiento y selección\\n• Implementé sistema de control de incidencias\\n• Administré pre-nómina de 220 colaboradores\\n• Resolví 45 conflictos laborales mediante mediación",
              "❌ INCORRECTO (sin bullets):\\nLideré 120+ procesos de reclutamiento. Implementé sistema de control. Administré pre-nómina. Resolví conflictos.\\n\\n❌ INCORRECTO (formato inconsistente):\\n- Lideré procesos...\\n* Implementé sistema...\\no Administré nómina...\\n> Resolví conflictos...",
              "💡 BEST PRACTICE:\\nUsa siempre el mismo símbolo (•) en TODO el CV. Inicia cada bullet con verbo de acción en pasado (Lideré, Implementé, Reduje, Optimicé, Gestioné). Una línea por bullet. Mantén consistencia en todo el documento."
            ]
          },
          "indirect": {
            "title": "Cómo convertir tu CV actual a formato ATS-friendly:",
            "bullets": [
              "PASO 1: Revisa cada experiencia laboral y convierte párrafos en bullets individuales",
              "PASO 2: Asegúrate que CADA bullet inicie con símbolo • seguido de espacio",
              "PASO 3: Cada bullet debe ser una sola línea (máximo 2 si es muy largo)",
              "PASO 4: Usa verbos de acción fuertes al inicio: Lideré, Implementé, Reduje, Optimicé, Gestioné, Coordiné, Desarrollé, Capacité",
              "PASO 5: Revisa que todos los bullets en TODO el CV usen el mismo formato"
            ]
          },
          "noExperience": {
            "title": "Checklist de formato ATS-friendly:",
            "bullets": [
              "✅ Todos los logros usan bullets • (no -, *, o, >)",
              "✅ Cada bullet inicia con verbo de acción en pasado",
              "✅ Una idea = un bullet (no agrupar múltiples logros)",
              "✅ Bullets de 1-2 líneas máximo (no más de 150 caracteres)",
              "✅ Formato consistente en TODO el CV",
              "✅ Sin negritas ni MAYÚSCULAS excesivas dentro de bullets",
              "✅ Fechas en formato MM/YYYY"
            ]
          },
          "proTip": "Los ATS (Workday, Greenhouse, Taleo, etc.) están optimizados para extraer información de bullets que inician con •. Este formato simple pero consistente puede aumentar tu score ATS 10-15% vs formato de párrafos o bullets inconsistentes."
        }
      }
    ]
  },
  "atsDetectionGuide": {
    "commonByIndustry": {
      "tech": ["Greenhouse", "Lever", "Workable"],
      "startups": ["Greenhouse", "Lever", "Workable", "Ashby"],
      "enterprises": ["Workday", "SAP SuccessFactors", "Taleo", "Oracle HCM"],
      "agencies": ["Bullhorn", "Jobvite", "iCIMS"],
      "services": ["BambooHR", "Workday", "Greenhouse"]
    },
    "detectionTips": [
      "Busca el nombre del ATS en el footer del portal de aplicación (letra pequeña al final)",
      "Revisa la URL del portal: greenhouse.io, myworkday.com, jobs.lever.co, etc.",
      "LinkedIn Jobs usa su propio sistema de matching (no es ATS tradicional)",
      "Indeed y agregadores redirigen al portal de la empresa (no usan ATS propio)",
      "Si es solo email con CV adjunto → probablemente NO hay ATS",
      "Pregunta directamente al reclutador en la entrevista: '¿Qué sistema ATS utilizan?'"
    ]
  },
  "reasoning": "El CV muestra experiencia sólida de 3+ años en administración de personal y reclutamiento con métricas cuantificadas. Score actual de 90% es alto. Para llegar a 96% potencial en 1-2 horas: (1) agregar summary ejecutivo de 3-4 líneas para captar atención inmediata de ATS y reclutadores, (2) cuantificar 2-3 logros adicionales con métricas específicas, (3) estandarizar formato de bullets con • en todo el documento. El CV cubre muy bien los requisitos del JD (Excel, PowerPoint, administración de personal, reclutamiento, pre-nómina, trabajo en equipo, comunicación efectiva). No se requieren keywords adicionales ya que el CV coincide excelentemente con el JD."
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Eres el experto #1 mundial en ATS y optimización de CVs. CRÍTICO: (1) En keywords.*.missing SOLO incluye keywords que están EXPLÍCITAMENTE en el JOB DESCRIPTION pero NO en el CV - si el CV cubre todo el JD, deja missing = []. (2) Genera AL MENOS 3-8 recommendations con ejemplos completos. (3) Todos los pasos de improvementPath deben tener detailedExamples 100% completos, NUNCA vacíos. (4) Genera datos COMPLETOS para los 10 ATS. (5) Ruta de mejora solo con keywords REALES del JD. Respondes SOLO con JSON válido sin markdown."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 8000,
      top_p: 0.9
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

    // VALIDACIÓN ULTRA-ROBUSTA
    if (!analysis.keywords) {
      analysis.keywords = {
        technical: { found: [], missing: [] },
        soft: { found: [], missing: [] },
        industry: { found: [], missing: [] }
      };
    }

    // Bug Fix #4: Asegurar al menos 3 recommendations
    if (!analysis.recommendations || analysis.recommendations.length === 0) {
      analysis.recommendations = [
        {
          priority: "important",
          text: "Cuantifica tus logros agregando métricas específicas (números, porcentajes, tiempo)",
          impact: "high",
          section: "experience",
          example: "En lugar de 'Gestioné personal', usa 'Gestioné equipo de 25 personas aumentando productividad 30% en 6 meses'"
        },
        {
          priority: "important",
          text: "Usa formato de bullets con • al inicio de cada logro",
          impact: "medium",
          section: "format",
          example: "• Lideré 120+ procesos de reclutamiento\\n• Implementé sistema de control\\n• Administré pre-nómina de 220 colaboradores"
        },
        {
          priority: "optional",
          text: "Agrega summary profesional de 2-3 líneas al inicio",
          impact: "medium",
          section: "summary",
          example: "Especialista en RH con 3+ años optimizando procesos de talento. Experto en reclutamiento, administración y cumplimiento normativo."
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

    // Bug Fix #6: Validar que detailedExamples NUNCA estén vacíos
    if (analysis.improvementPath.steps) {
      analysis.improvementPath.steps.forEach((step, index) => {
        if (!step.detailedExamples) {
          step.detailedExamples = {
            context: {
              jdMentions: "El JD menciona esta mejora como importante",
              cvShows: "Tu CV puede mejorar en este aspecto"
            },
            direct: {
              title: "Implementación directa:",
              bullets: [
                "Revisa tu CV e identifica dónde aplicar esta mejora",
                "Usa ejemplos específicos de tu experiencia",
                "Incluye métricas cuantificables cuando sea posible"
              ]
            },
            indirect: {
              title: "Implementación adaptada:",
              bullets: [
                "Adapta el ejemplo a tu experiencia específica",
                "Mantén el formato y estructura sugerida",
                "Personaliza con tus propios logros"
              ]
            },
            noExperience: {
              title: "Sin experiencia directa:",
              bullets: [
                "Enfócate en skills transferibles",
                "Menciona experiencia relacionada",
                "Sé honesto pero positivo"
              ]
            },
            proTip: "Recuerda personalizar los ejemplos a tu experiencia real"
          };
        } else {
          // Validar que no haya strings vacíos
          if (!step.detailedExamples.context) {
            step.detailedExamples.context = {
              jdMentions: "El JD requiere esta habilidad",
              cvShows: "Tu CV puede destacar más esto"
            };
          }
          if (step.detailedExamples.context.jdMentions === "") {
            step.detailedExamples.context.jdMentions = "El JD requiere esta habilidad";
          }
          if (step.detailedExamples.context.cvShows === "") {
            step.detailedExamples.context.cvShows = "Tu CV puede destacar más esto";
          }

          ['direct', 'indirect', 'noExperience'].forEach(level => {
            if (!step.detailedExamples[level]) {
              step.detailedExamples[level] = {
                title: `Opción ${level}:`,
                bullets: ["Ejemplo 1", "Ejemplo 2"]
              };
            }
            if (!step.detailedExamples[level].bullets || step.detailedExamples[level].bullets.length === 0) {
              step.detailedExamples[level].bullets = [
                "Revisa tu experiencia y aplica esta mejora",
                "Personaliza el ejemplo a tu caso específico"
              ];
            }
          });
        }
      });
    }

    // Bug Fix #2: Validar todos los 10 ATS
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
              why: `${ats} prioriza logros medibles para mejor matching`
            },
            {
              tip: "Incluye keywords del JD en primeras líneas",
              example: "Coloca las palabras clave importantes al inicio de cada sección",
              why: `${ats} da más peso a keywords en primer tercio del documento`
            }
          ]
        };
      } else {
        if (!analysis.atsBreakdown[ats].tips || !Array.isArray(analysis.atsBreakdown[ats].tips) || analysis.atsBreakdown[ats].tips.length === 0) {
          analysis.atsBreakdown[ats].tips = [
            {
              tip: "Optimiza formato para mejor extracción automática",
              example: "Usa bullets con • y estructura clara",
              why: `${ats} extrae mejor con formato estructurado`
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