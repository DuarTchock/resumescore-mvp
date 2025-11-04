// api/analyze-ai.js - VERSIÓN FINAL MEJORADA CON EJEMPLOS ESPECÍFICOS Y MÉTODO SOCRÁTICO
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

// === ANÁLISIS CON GROQ - PROMPT MEJORADO FINAL ===
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
      "found": ["Python", "React", "Node.js", "AWS", "Docker"],
      "missing": ["Kubernetes", "CI/CD", "Terraform", "GraphQL", "TypeScript"]
    },
    "soft": {
      "found": ["liderazgo", "comunicación", "trabajo en equipo"],
      "missing": ["pensamiento crítico", "adaptabilidad", "resolución de problemas"]
    },
    "industry": {
      "found": ["fintech", "desarrollo ágil", "APIs RESTful"],
      "missing": ["DevOps", "microservicios", "arquitectura cloud"]
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
          "example": "ADAPTADO A TU JD QUE MENCIONA 'gestión de equipos':\\n\\nSi lideras equipos:\\n• Lideré equipo de 12 desarrolladores aumentando productividad 40% mediante implementación de Scrum\\n• Gestioné presupuesto de $500K optimizando recursos y reduciendo costos 25%\\n• Mentoré 5 junior developers acelerando su onboarding de 3 meses a 6 semanas\\n\\nSi colaboras en equipos:\\n• Colaboré con equipo de 8 personas en 15+ sprints ágiles, entregando features críticas a tiempo\\n• Coordiné con 3 equipos multifuncionales (design, QA, product) para lanzamientos exitosos",
          "why": "Workday ATS prioriza formato de bullets con • para extracción automática de logros y métricas"
        },
        {
          "tip": "Agrega sección 'Certifications' después de Education con año de obtención",
          "example": "CERTIFICATIONS\\n• AWS Solutions Architect Associate (2024)\\n• Scrum Master Certified - PSM I (2023)\\n• Google Cloud Professional Developer (2023)\\n• MongoDB Certified Developer (2022)",
          "why": "Workday busca específicamente esta sección para matching automático con requisitos"
        }
      ]
    },
    "Greenhouse": {
      "score": 82,
      "strengths": ["Experiencia bien estructurada cronológicamente", "Títulos de trabajo claros"],
      "weaknesses": ["Falta summary ejecutivo al inicio", "Algunas fechas sin formato MM/YYYY"],
      "tips": [
        {
          "tip": "Agrega summary profesional de 3-4 líneas al inicio del CV",
          "example": "BASADO EN TU EXPERIENCIA Y EL JD:\\n\\nSenior Full-Stack Developer con 8+ años optimizando aplicaciones web de alto tráfico para startups fintech. Experto en React, Node.js y arquitectura cloud (AWS/GCP). Historial comprobado liderando equipos de 12+ personas en ambientes ágiles, aumentando conversión 45% y reduciendo costos de infraestructura $200K/año.",
          "why": "Greenhouse ATS usa el summary ejecutivo para matching inicial de keywords y fit cultural"
        },
        {
          "tip": "Estandariza todas las fechas a formato MM/YYYY",
          "example": "ANTES: 'Enero 2020 - Presente' o '2020-actual'\\n\\nDESPUÉS: '01/2020 - Presente'\\n\\nEsto permite a Greenhouse calcular automáticamente años de experiencia total.",
          "why": "Greenhouse requiere formato consistente MM/YYYY para calcular experiencia automáticamente"
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
          {
            "q": "¿Cuántas personas se beneficiaron directamente de tu trabajo?",
            "hint": "Piensa en: usuarios finales, clientes, miembros del equipo, stakeholders internos"
          },
          {
            "q": "¿Qué métrica específica mejoró gracias a tu contribución?",
            "hint": "Ejemplos: velocidad (%), calidad (defectos), ingresos ($), satisfacción (NPS), retención (%)"
          },
          {
            "q": "¿Cuánto tiempo o dinero ahorraste a la empresa?",
            "hint": "Cuantifica: horas/día ahorradas, días/mes, % de reducción de costos, dinero ahorrado"
          },
          {
            "q": "¿Qué problema crítico resolviste y por qué era importante?",
            "hint": "Contexto: qué estaba fallando, impacto en el negocio, urgencia, stakeholders afectados"
          },
          {
            "q": "¿Cómo lo hiciste? ¿Qué herramientas/metodologías específicas usaste?",
            "hint": "Menciona: tecnologías del JD, frameworks, procesos, metodologías (Agile, Scrum, etc.)"
          }
        ],
        "transformation": {
          "bad": "Desarrollé features para el producto y trabajé con el equipo",
          "badReason": "Genérico, sin métricas, sin impacto, sin contexto, no menciona tecnologías",
          "good": "Desarrollé 15 features críticas usando React y TypeScript que aumentaron el engagement 34% y la retención de usuarios en 2.5 meses, impactando a 50K+ usuarios activos y generando $200K adicionales en revenue",
          "goodReason": "Específico (15 features), tecnologías relevantes (React, TypeScript), métricas cuantificables (34%, 2.5 meses), impacto en negocio ($200K revenue), alcance (50K usuarios)"
        },
        "templateSTAR": {
          "context": {
            "jdMentions": "El JD menciona: 'experiencia en desarrollo full-stack con JavaScript y gestión de equipos'",
            "cvShows": "Tu CV actual muestra: 'desarrollador con conocimientos en JavaScript'"
          },
          "situation": "Durante el rediseño completo de la plataforma de e-commerce, identificamos problemas críticos de rendimiento que afectaban las conversiones en 30%",
          "task": "Fui responsable de migrar el frontend a React, optimizar el backend Node.js y liderar un equipo de 3 developers junior",
          "action": "Implementé arquitectura de microservicios usando React, Redux y Node.js, optimizando rendimiento con lazy loading y code splitting. Coordiné con equipos de design, QA y product, realizando 50+ code reviews y mentoreando al equipo en best practices",
          "result": "Logré reducir tiempo de carga 60% (de 5s a 2s), aumentar conversiones 22% en 3 meses, impactando a 100K+ usuarios mensuales y generando $500K adicionales en revenue anual. El equipo junior mejoró velocidad de desarrollo 40%"
        },
        "checklist": [
          "✅ Empieza con verbo de acción fuerte (Desarrollé, Lideré, Optimicé, Implementé, Arquitecté)",
          "✅ Incluye número o métrica específica (15 features, 34%, 2.5 meses, 50K usuarios)",
          "✅ Menciona herramienta/tecnología relevante mencionada en el JD (React, Node.js, AWS)",
          "✅ Muestra el impacto/resultado cuantificable (engagement, retención, revenue, ahorro)",
          "✅ Indica tiempo o plazo específico (en 3 meses, durante 2 años, en 6 semanas)",
          "✅ Menciona a quién impactó (50K usuarios, equipo de 12, 100 clientes, toda la empresa)"
        ],
        "jdKeywords": ["desarrollo full-stack", "JavaScript", "React", "gestión de equipos", "metodología ágil"],
        "yourCurrentText": "Developer en empresa tech trabajando con JavaScript",
        "improvedVersion": "Senior Full-Stack Developer liderando equipo de 8 personas con metodología ágil, desarrollando aplicaciones React/Node.js que atienden 100K+ usuarios, optimizando arquitectura cloud y reduciendo tiempo de deployment 60%"
      }
    },
    "education": {
      "score": 75,
      "socraticGuide": {
        "intro": "Maximiza el valor de tu educación mostrando relevancia directa con el puesto y logros destacados.",
        "questions": [
          {
            "q": "¿Qué proyectos académicos son directamente relevantes para este puesto?",
            "hint": "Proyectos que usen tecnologías del JD o resuelvan problemas similares"
          },
          {
            "q": "¿Obtuviste algún reconocimiento académico o GPA notable (>3.5)?",
            "hint": "GPA, becas, premios, dean's list, publicaciones"
          },
          {
            "q": "¿Participaste en actividades extracurriculares relevantes?",
            "hint": "Clubs técnicos, hackathons, competencias de programación, proyectos open source"
          },
          {
            "q": "¿Tu formación incluye especialización relevante al JD?",
            "hint": "Especialización, minor, certificaciones académicas, tesis"
          }
        ],
        "transformation": {
          "bad": "Licenciatura en Ingeniería de Sistemas",
          "badReason": "Sin detalles, sin GPA, sin especialización, sin proyectos relevantes",
          "good": "Licenciatura en Ingeniería de Software (GPA 3.8/4.0) con especialización en Arquitectura Cloud y Desarrollo Web. Proyecto destacado: Sistema distribuido de e-commerce que soportó 100K usuarios concurrentes usando microservicios (Node.js, Docker, AWS)",
          "goodReason": "GPA destacado, especialización relevante, proyecto concreto con tecnologías del JD, métricas de escala"
        },
        "templateSTAR": {
          "context": {
            "jdMentions": "El JD requiere: 'formación en Computer Science o campo relacionado'",
            "cvShows": "Tu CV muestra: 'Licenciatura en Ingeniería'"
          },
          "situation": "El programa requería un proyecto final aplicando desarrollo full-stack y arquitectura escalable",
          "task": "Desarrollar una plataforma de e-learning que soporte 10K+ usuarios simultáneos",
          "action": "Diseñé arquitectura de microservicios con React frontend, Node.js backend, MongoDB base de datos y deployment en AWS usando Docker. Implementé autenticación JWT, pagos con Stripe y sistema de notificaciones en tiempo real",
          "result": "Logré calificación máxima (A+), el proyecto soportó carga de 15K usuarios en pruebas de stress y fue presentado en la conferencia estudiantil de tecnología"
        }
      }
    },
    "skills": {
      "score": 68,
      "socraticGuide": {
        "intro": "Organiza tus skills por categorías y demuestra profundidad de conocimiento.",
        "questions": [
          {
            "q": "¿En cuántos proyectos reales has usado cada skill del JD?",
            "hint": "Cantidad de proyectos, años de experiencia, contexto de uso"
          },
          {
            "q": "¿Cuál es tu nivel de dominio: básico, intermedio, avanzado o experto?",
            "hint": "Sé honesto: básico (<1 año), intermedio (1-3 años), avanzado (3-5 años), experto (5+ años)"
          },
          {
            "q": "¿Puedes cuantificar tu experiencia con cada tecnología?",
            "hint": "Líneas de código, proyectos completados, usuarios impactados, certificaciones"
          },
          {
            "q": "¿Qué skills del JD faltan en tu CV pero tienes experiencia?",
            "hint": "A veces sabemos cosas pero no las ponemos en el CV"
          }
        ],
        "transformation": {
          "bad": "JavaScript, React, Node.js, Python, AWS",
          "badReason": "Lista plana sin organización, sin niveles, sin contexto de uso",
          "good": "FRONTEND: React (avanzado, 5+ años), TypeScript (avanzado), Next.js (intermedio, 2 años)\\nBACKEND: Node.js (experto, 6 años), Python/Django (avanzado), GraphQL (intermedio)\\nCLOUD/DEVOPS: AWS (EC2, S3, Lambda - avanzado), Docker (avanzado), Kubernetes (intermedio)\\nDATA: PostgreSQL (avanzado), MongoDB (avanzado), Redis (intermedio)",
          "goodReason": "Organizado por categorías, niveles de dominio claros, años de experiencia, tecnologías específicas"
        }
      }
    }
  },
  "improvementPath": {
    "current": 85,
    "potential": 95,
    "timeToImprove": "2-3 horas",
    "steps": [
      {
        "action": "Agrega 5 keywords técnicas faltantes críticas que aparecen múltiples veces en el JD",
        "impact": "+5%",
        "timeframe": "15 minutos",
        "priority": "high",
        "detailedExamples": {
          "context": {
            "jdMentions": "El JD menciona 7 veces: 'Kubernetes', 'CI/CD', 'Terraform', 'GraphQL' y 'TypeScript'",
            "cvShows": "Tu CV muestra experiencia en: 'Docker', 'deployment automation', 'JavaScript'"
          },
          "direct": {
            "title": "Si has usado estas tecnologías directamente:",
            "bullets": [
              "Implementé Kubernetes para orquestar 50+ microservicios reduciendo downtime 90% y mejorando escalabilidad horizontal",
              "Configuré pipelines CI/CD con Jenkins y GitLab automatizando testing y deployments, reduciendo errores de producción 75%",
              "Desarrollé APIs GraphQL optimizadas procesando 1M+ queries/día con 40% mejor performance vs REST",
              "Migré codebase de 100K+ líneas de JavaScript a TypeScript mejorando type safety y reduciendo bugs en runtime 60%"
            ]
          },
          "indirect": {
            "title": "Si tienes experiencia relacionada pero no directa:",
            "bullets": [
              "Gestioné infraestructura de contenedores Docker en producción, actualmente capacitándome en Kubernetes para orquestación avanzada",
              "Automaticé procesos de testing y deployment usando scripts y GitHub Actions, reduciendo tiempo de release de 2 días a 4 horas",
              "Desarrollé APIs RESTful robustas, con conocimiento sólido en optimización de queries aplicable a GraphQL",
              "Amplia experiencia en JavaScript ES6+ y desarrollo tipado, en transición activa a TypeScript en proyectos actuales"
            ]
          },
          "noExperience": {
            "title": "Si no tienes experiencia directa (sé honesto pero destaca transferibles):",
            "bullets": [
              "Sólida experiencia en DevOps y automatización de infraestructura, familiarizado con conceptos de orquestación de contenedores (Kubernetes es objetivo de capacitación inmediata)",
              "Experiencia implementando automatización de procesos, entendimiento claro de principios CI/CD, capacidad de ramp-up rápido en herramientas específicas",
              "Fuerte background en diseño de APIs RESTful escalables, conocimiento teórico de GraphQL y ventajas para optimización de queries",
              "Experto en JavaScript moderno, en proceso de certificación TypeScript (completando curso oficial de Microsoft)"
            ]
          },
          "proTip": "Siempre incluye MÉTRICAS: números, porcentajes, tiempo. Fórmula ganadora: [Acción específica] + [Resultado cuantificable] + [Tiempo/Impacto en negocio]"
        },
        "keywords": ["Kubernetes", "CI/CD", "Terraform", "GraphQL", "TypeScript"]
      },
      {
        "action": "Cuantifica 10 logros actuales agregando métricas específicas (números, %, tiempo)",
        "impact": "+4%",
        "timeframe": "30 minutos",
        "priority": "high",
        "detailedExamples": {
          "context": {
            "jdMentions": "El JD busca evidencia cuantificable de: 'mejora de procesos', 'optimización de rendimiento', 'impacto en negocio'",
            "cvShows": "Tu CV tiene frases como: 'Mejoré la aplicación', 'Optimicé procesos', 'Lideré proyecto'"
          },
          "direct": {
            "title": "Si tienes métricas específicas:",
            "bullets": [
              "Optimicé 5 queries críticas en PostgreSQL reduciendo tiempo de respuesta de 3s a 200ms (93% mejora), impactando 100K+ usuarios diarios",
              "Refactoricé módulo de pagos aumentando tasa de éxito de 85% a 98.5% (15% mejora) y reduciendo chargebacks $50K/mes",
              "Implementé sistema de caching con Redis disminuyendo carga del servidor 70% y ahorrando $2K/mes en infraestructura AWS",
              "Lideré migración a microservicios reduciendo tiempo de deployment de 4 horas a 15 minutos (93% más rápido), mejorando frecuencia de releases de 1x/mes a 3x/semana"
            ]
          },
          "indirect": {
            "title": "Si necesitas estimar métricas (hazlo razonablemente):",
            "bullets": [
              "Mejoré rendimiento de la aplicación implementando lazy loading, logrando reducción estimada de 40% en tiempo de carga inicial",
              "Optimicé procesos de deployment mediante automatización, reduciendo tiempo de release de 2 horas a 30 minutos",
              "Refactoricé código legacy eliminando aproximadamente 30% de código duplicado y mejorando mantenibilidad del sistema",
              "Implementé mejores prácticas de testing aumentando cobertura de 45% a 80%, reduciendo bugs reportados en producción"
            ]
          },
          "noExperience": {
            "title": "Si no tienes datos exactos (enfócate en proceso y aprendizaje):",
            "bullets": [
              "Identifiqué 10+ oportunidades de optimización en el codebase actual usando herramientas de profiling, proponiendo mejoras basadas en best practices",
              "Documenté análisis de rendimiento completo usando Lighthouse y Chrome DevTools, identificando cuellos de botella y áreas de mejora prioritarias",
              "Implementé sistema de performance monitoring con herramientas como New Relic, estableciendo baseline para futuras optimizaciones",
              "Lideré iniciativa de code review incrementando calidad de código y estableciendo estándares de desarrollo en el equipo"
            ]
          },
          "proTip": "Si no tienes números exactos, usa estimaciones razonables. Palabras clave: 'aproximadamente', 'más de', 'hasta', 'cerca de'. Ejemplo: 'Optimicé queries reduciendo tiempo de respuesta en más de 50%'"
        },
        "keywords": ["métricas", "KPIs", "resultados cuantificables", "impacto en negocio"]
      }
    ]
  },
  "atsDetectionGuide": {
    "indicators": [
      "Portal de aplicación con campos estandarizados para skills y experiencia (no solo upload de CV)",
      "Subida de archivo PDF/DOCX seguida de formularios adicionales que replican info del CV",
      "Preguntas de screening automáticas con requisitos binarios (ej: '¿Tienes 5+ años de experiencia en X?')",
      "Sistema de 'match score' o porcentaje de compatibilidad visible al aplicar",
      "Portal pide parsear tu CV automáticamente para llenar campos del formulario"
    ],
    "commonSystems": {
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
  "reasoning": "El CV muestra experiencia técnica sólida con 5+ años en desarrollo full-stack. Las áreas prioritarias de mejora son: (1) agregar 5 keywords críticas del JD (Kubernetes, CI/CD, TypeScript) que aparecen múltiples veces pero faltan en el CV, (2) cuantificar 10 logros actuales con métricas específicas para demostrar impacto en negocio, (3) agregar summary ejecutivo de 3-4 líneas que capture propuesta de valor. Con estas mejoras, el score puede aumentar de 85% actual a 95% potencial en 2-3 horas de trabajo."
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Eres el experto #1 mundial en ATS (Applicant Tracking Systems - Sistemas de Seguimiento de Candidatos) y optimización de CVs para reclutamiento. SIEMPRE generas análisis COMPLETOS con TODOS los campos requeridos. CADA ejemplo DEBE ser ESPECÍFICO al Job Description y CV proporcionados, NO genérico. Incluyes MÉTRICAS cuantificables en todos los ejemplos. Los ejemplos deben ser COPIABLES por el candidato. Respondes SOLO con JSON válido sin markdown."
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

    // Validar que atsBreakdown tenga tips con ejemplos
    if (analysis.atsBreakdown) {
      Object.keys(analysis.atsBreakdown).forEach(ats => {
        if (!analysis.atsBreakdown[ats].tips || !Array.isArray(analysis.atsBreakdown[ats].tips)) {
          analysis.atsBreakdown[ats].tips = [];
        }
      });
    }

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