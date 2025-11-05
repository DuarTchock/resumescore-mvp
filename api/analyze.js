// api/analyze.js - Versión mejorada con análisis semántico
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PDFParser = require('pdf2json');
const mammoth = require('mammoth');

export const config = { api: { bodyParser: false } };

// Sinónimos y variaciones comunes para mejorar matching
const SYNONYMS = {
  'manager': ['gerente', 'director', 'jefe', 'lider', 'manager'],
  'leader': ['lider', 'gerente', 'director', 'manager'],
  'agile': ['scrum', 'kanban', 'sprint', 'agile'],
  'data': ['datos', 'analytics', 'business intelligence', 'bi'],
  'analytics': ['analisis', 'data', 'metricas', 'kpi'],
  'team': ['equipo', 'grupo', 'staff'],
  'experience': ['experiencia', 'años', 'years'],
  'software': ['programa', 'aplicacion', 'sistema'],
  'develop': ['desarrollar', 'crear', 'construir', 'implementar'],
  'manage': ['gestionar', 'administrar', 'dirigir', 'coordinar'],
  'budget': ['presupuesto', 'financiero', 'costos'],
  'revenue': ['ingresos', 'ventas', 'revenue'],
  'customer': ['cliente', 'usuario', 'consumidor'],
  'project': ['proyecto', 'iniciativa', 'programa'],
  'strategy': ['estrategia', 'plan', 'roadmap'],
  'operations': ['operaciones', 'procesos', 'procedimientos']
};

// Skills técnicos comunes para ponderación
const TECH_SKILLS = [
  'python', 'java', 'javascript', 'react', 'node', 'sql', 'aws', 'azure',
  'docker', 'kubernetes', 'git', 'api', 'rest', 'graphql', 'mongodb',
  'postgresql', 'redis', 'kafka', 'jenkins', 'ci/cd', 'agile', 'scrum',
  'jira', 'confluence', 'salesforce', 'tableau', 'powerbi', 'excel',
  'sap', 'oracle', 'workday', 'greenhouse', 'icims'
];

// Características conocidas de cada ATS
const ATS_CHARACTERISTICS = {
  'Workday': {
    prefersDates: true,
    prefersSimpleFormat: true,
    weightsKeywords: 0.4,
    weightsStructure: 0.3,
    weightsExperience: 0.3
  },
  'Greenhouse': {
    prefersDates: true,
    prefersSimpleFormat: true,
    weightsKeywords: 0.5,
    weightsStructure: 0.25,
    weightsExperience: 0.25
  },
  'iCIMS': {
    prefersDates: false,
    prefersSimpleFormat: false,
    weightsKeywords: 0.6,
    weightsStructure: 0.2,
    weightsExperience: 0.2
  },
  'Lever': {
    prefersDates: true,
    prefersSimpleFormat: true,
    weightsKeywords: 0.45,
    weightsStructure: 0.3,
    weightsExperience: 0.25
  },
  'SAP SuccessFactors': {
    prefersDates: true,
    prefersSimpleFormat: false,
    weightsKeywords: 0.35,
    weightsStructure: 0.35,
    weightsExperience: 0.3
  },
  'BambooHR': {
    prefersDates: true,
    prefersSimpleFormat: true,
    weightsKeywords: 0.5,
    weightsStructure: 0.25,
    weightsExperience: 0.25
  },
  'Taleo': {
    prefersDates: false,
    prefersSimpleFormat: true,
    weightsKeywords: 0.7,
    weightsStructure: 0.15,
    weightsExperience: 0.15
  },
  'Jobvite': {
    prefersDates: true,
    prefersSimpleFormat: true,
    weightsKeywords: 0.45,
    weightsStructure: 0.3,
    weightsExperience: 0.25
  },
  'Bullhorn': {
    prefersDates: true,
    prefersSimpleFormat: false,
    weightsKeywords: 0.5,
    weightsStructure: 0.25,
    weightsExperience: 0.25
  },
  'Workable': {
    prefersDates: true,
    prefersSimpleFormat: true,
    weightsKeywords: 0.5,
    weightsStructure: 0.25,
    weightsExperience: 0.25
  }
};

function expandWithSynonyms(word) {
  const normalized = word.toLowerCase();
  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    if (synonyms.includes(normalized)) {
      return synonyms;
    }
  }
  return [normalized];
}

function analyzeStructure(text) {
  const analysis = {
    hasDates: /\b(20\d{2}|19\d{2})\b/.test(text) || /\b\d{1,2}\/\d{4}\b/.test(text),
    hasBullets: /[•\-\*]/.test(text) || /^\s*[\-\*•]/m.test(text),
    hasHeaders: /\b(experience|education|skills|experiencia|educacion|habilidades)\b/i.test(text),
    hasMetrics: /\d+%|\$\d+|increased|decreased|improved|reduced/i.test(text),
    wordCount: text.split(/\s+/).length,
    hasComplexFormatting: /\t|\|/.test(text)
  };
  
  return analysis;
}

function calculateEnhancedMatchRate(cvText, jdText) {
  const clean = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ');
  const cv = clean(cvText);
  const jd = clean(jdText);

  // Extraer palabras significativas (4+ caracteres)
  const jdWords = jd.match(/\b\w{4,}\b/g) || [];
  const cvWords = cv.match(/\b\w{4,}\b/g) || [];

  // Remover duplicados y crear sets
  const uniqueJdWords = [...new Set(jdWords)];
  const cvWordSet = new Set(cvWords);

  let matchedCount = 0;
  let techSkillsMatched = 0;
  let techSkillsTotal = 0;
  const missingWords = [];

  // Análisis con sinónimos y ponderación
  uniqueJdWords.forEach(jdWord => {
    const synonyms = expandWithSynonyms(jdWord);
    const isTechSkill = TECH_SKILLS.includes(jdWord);
    
    if (isTechSkill) techSkillsTotal++;

    // Verificar si algún sinónimo está en el CV
    const hasMatch = synonyms.some(syn => cvWordSet.has(syn));
    
    if (hasMatch) {
      matchedCount++;
      if (isTechSkill) techSkillsMatched++;
    } else {
      missingWords.push(jdWord);
    }
  });

  const basicMatchRate = uniqueJdWords.length > 0 
    ? (matchedCount / uniqueJdWords.length) * 100 
    : 0;

  const techSkillRate = techSkillsTotal > 0 
    ? (techSkillsMatched / techSkillsTotal) * 100 
    : 100;

  // Match rate ponderado (70% general, 30% tech skills)
  const weightedMatchRate = (basicMatchRate * 0.7) + (techSkillRate * 0.3);

  return {
    matchRate: Math.round(weightedMatchRate),
    basicMatchRate: Math.round(basicMatchRate),
    techSkillRate: Math.round(techSkillRate),
    missingWords: missingWords.slice(0, 5),
    totalKeywords: uniqueJdWords.length,
    matchedKeywords: matchedCount
  };
}

function calculateATSScores(cvText, jdText, matchData) {
  const cvStructure = analyzeStructure(cvText);
  const scores = {};

  Object.entries(ATS_CHARACTERISTICS).forEach(([atsName, characteristics]) => {
    let score = 0;

    // Component 1: Keyword matching (weighted by ATS preference)
    score += matchData.matchRate * characteristics.weightsKeywords;

    // Component 2: Structure score (0-100)
    let structureScore = 0;
    if (cvStructure.hasDates && characteristics.prefersDates) structureScore += 25;
    if (cvStructure.hasBullets) structureScore += 25;
    if (cvStructure.hasHeaders) structureScore += 25;
    if (!cvStructure.hasComplexFormatting && characteristics.prefersSimpleFormat) structureScore += 25;
    score += structureScore * characteristics.weightsStructure;

    // Component 3: Experience indicators (0-100)
    let experienceScore = 0;
    if (cvStructure.hasDates) experienceScore += 50;
    if (cvStructure.hasMetrics) experienceScore += 50;
    score += experienceScore * characteristics.weightsExperience;

    scores[atsName] = Math.min(100, Math.max(0, Math.round(score)));
  });

  return scores;
}

function generateATSBreakdown(scores, cvStructure, matchData) {
  const breakdown = {};

  Object.entries(scores).forEach(([atsName, score]) => {
    const characteristics = ATS_CHARACTERISTICS[atsName];
    
    const strengths = [];
    if (cvStructure.hasDates && characteristics.prefersDates) strengths.push('Incluye fechas en formato estándar');
    if (cvStructure.hasBullets) strengths.push('Usa viñetas para mejor legibilidad');
    if (cvStructure.hasHeaders) strengths.push('Secciones claramente identificadas');
    if (cvStructure.hasMetrics) strengths.push('Incluye métricas cuantificables');
    if (matchData.matchRate >= 70) strengths.push(`Buena coincidencia de keywords (${matchData.matchRate}%)`);
    if (strengths.length === 0) strengths.push('CV procesable por el sistema');

    const weaknesses = [];
    if (!cvStructure.hasDates && characteristics.prefersDates) weaknesses.push('Falta formato de fechas consistente (MM/YYYY)');
    if (!cvStructure.hasBullets) weaknesses.push('No utiliza viñetas para listar logros');
    if (!cvStructure.hasMetrics) weaknesses.push('Faltan métricas y resultados cuantificables');
    if (cvStructure.hasComplexFormatting && characteristics.prefersSimpleFormat) weaknesses.push('Formato complejo (tablas/columnas) dificulta parsing');
    if (matchData.matchRate < 70) weaknesses.push(`Bajo matching de keywords (${matchData.matchRate}%)`);
    if (weaknesses.length === 0) weaknesses.push('Considerar agregar más keywords del Job Description');

    const tips = [];
    
    if (characteristics.weightsKeywords >= 0.5) {
      tips.push({
        tip: `${atsName} prioriza keywords - usa términos exactos del JD`,
        example: matchData.missingWords.length > 0 ? `Agregar: ${matchData.missingWords.slice(0, 3).join(', ')}` : 'Usa terminología específica de la industria',
        why: 'Este ATS asigna 50%+ del score a coincidencia de palabras clave'
      });
    }
    
    if (characteristics.prefersDates) {
      tips.push({
        tip: 'Usa formato de fechas consistente',
        example: 'Enero 2020 - Presente (o 01/2020 - Presente)',
        why: `${atsName} extrae automáticamente tu historial laboral usando fechas`
      });
    }
    
    if (characteristics.prefersSimpleFormat) {
      tips.push({
        tip: 'Evita tablas, columnas múltiples y gráficos',
        example: 'Usa formato lineal simple con secciones claras',
        why: 'Formatos complejos confunden el parser del ATS'
      });
    } else {
      tips.push({
        tip: 'Este ATS maneja formatos más complejos',
        example: 'Puedes usar tablas simples para skills o certificaciones',
        why: `${atsName} tiene parser avanzado que puede procesar layouts más elaborados`
      });
    }

    breakdown[atsName] = {
      tips: tips.slice(0, 3),
      strengths: strengths.slice(0, 4),
      weaknesses: weaknesses.slice(0, 4)
    };
  });

  return breakdown;
}

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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+?)(?:;|$)/);
    if (!boundaryMatch) return res.status(400).json({ error: 'No boundary found' });
    
    const boundary = boundaryMatch[1].trim();
    const parts = buffer.toString('binary').split(`--${boundary}`);
    
    console.log('[DEBUG] Boundary:', boundary);
    console.log('[DEBUG] Parts found:', parts.length);
    
    let cvText = '';
    let jdText = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part || part === '--\r\n' || part === '--') continue;

      const headerEndIndex = part.indexOf('\r\n\r\n');
      if (headerEndIndex === -1) continue;

      const header = part.substring(0, headerEndIndex);
      const body = part.substring(headerEndIndex + 4).replace(/\r\n--$/, '');

      console.log(`[DEBUG] Part ${i} - header length:`, header.length);
      console.log(`[DEBUG] Part ${i} - body length:`, body.length);
      console.log(`[DEBUG] Part ${i} - header preview:`, header.substring(0, 200));

      const nameMatch = header.match(/name="([^"]+)"/);
      const filenameMatch = header.match(/filename="([^"]+)"/);
      const name = nameMatch?.[1];
      const filename = filenameMatch?.[1];

      console.log(`[DEBUG] Part ${i} - name:`, name, 'filename:', filename);

      if (!name) continue;

      if (name === 'jd') {
        jdText = body.trim();
        console.log('[DEBUG] JD text length:', jdText.length);
      } else if (name === 'cv' && filename) {
        try {
          const fileBuffer = Buffer.from(body, 'binary');
          console.log('[DEBUG] File buffer size:', fileBuffer.length);
          
          if (filename.endsWith('.pdf')) {
            cvText = await extractTextFromPDF(fileBuffer);
            console.log('[DEBUG] PDF text extracted, length:', cvText.length);
          } else if (filename.endsWith('.docx')) {
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            cvText = result.value;
            console.log('[DEBUG] DOCX text extracted, length:', cvText.length);
          }
        } catch (fileError) {
          console.error('File processing error:', fileError);
          return res.status(400).json({ 
            error: `Error procesando archivo: ${fileError.message}`,
            suggestion: 'Intenta con un archivo DOCX o PDF diferente'
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

    // Análisis mejorado
    const matchData = calculateEnhancedMatchRate(cvText, jdText);
    const scores = calculateATSScores(cvText, jdText, matchData);
    const cvStructure = analyzeStructure(cvText);
    const atsBreakdown = generateATSBreakdown(scores, cvStructure, matchData);

    // Generar recomendaciones inteligentes
    const tips = [];
    
    if (matchData.missingWords.length > 0) {
      tips.push(`Palabras clave faltantes: "${matchData.missingWords.slice(0, 3).join('", "')}"`);
    }
    
    if (!cvStructure.hasDates) {
      tips.push('Agrega fechas en formato MM/YYYY para mejorar parsing');
    }
    
    if (!cvStructure.hasMetrics) {
      tips.push('Incluye métricas cuantificables: "Aumenté ventas en 25%"');
    }
    
    if (!cvStructure.hasBullets) {
      tips.push('Usa bullet points para mejorar legibilidad');
    }

    if (cvStructure.hasComplexFormatting) {
      tips.push('Evita tablas y formatos complejos - usa texto simple');
    }

    const average = Math.round(Object.values(scores).reduce((a,b) => a+b, 0) / Object.keys(scores).length);

    res.json({
      success: true,
      matchRate: matchData.matchRate,
      scores,
      average,
      recommendations: tips.slice(0, 4),
      atsBreakdown,
      analysis: {
        totalKeywords: matchData.totalKeywords,
        matchedKeywords: matchData.matchedKeywords,
        techSkillRate: matchData.techSkillRate,
        structure: {
          hasDates: cvStructure.hasDates,
          hasBullets: cvStructure.hasBullets,
          hasMetrics: cvStructure.hasMetrics
        }
      }
    });

  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Error del servidor',
      message: error.message 
    });
  }
}