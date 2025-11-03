// CHECKPOINT: FRONTEND_PREMIUM - Parte 1/5
// App.jsx - Versión Premium Completa
// Requiere: npm install canvas-confetti

import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'

function App() {
  // Estados principales
  const [cvFile, setCvFile] = useState(null)
  const [jdText, setJdText] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [error, setError] = useState(null)
  
  // Estados de UI
  const [history, setHistory] = useState([])
  const [selectedATS, setSelectedATS] = useState(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showLegal, setShowLegal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showATSGuide, setShowATSGuide] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [showTooltip, setShowTooltip] = useState(null)

  // Inicialización
  useEffect(() => {
    const isFirstVisit = !localStorage.getItem('resumescore_visited');
    if (isFirstVisit) {
      setShowOnboarding(true);
      localStorage.setItem('resumescore_visited', 'true');
    }

    const savedHistory = localStorage.getItem('resumescore_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }

    const savedDarkMode = localStorage.getItem('resumescore_darkmode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Función de análisis
  const handleAnalyze = async () => {
    if (!cvFile || !jdText.trim()) {
      alert('⚠️ Por favor sube un CV y pega la descripción del puesto');
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingStep('📄 Procesando archivo...');
    
    const form = new FormData();
    form.append('cv', cvFile);
    form.append('jd', jdText);

    try {
      setTimeout(() => setLoadingStep('📝 Extrayendo texto...'), 1000);
      setTimeout(() => setLoadingStep('🔍 Analizando keywords...'), 2000);
      setTimeout(() => setLoadingStep('🤖 Evaluando con IA...'), 3000);
      setTimeout(() => setLoadingStep('📊 Calculando scores...'), 4000);
      setTimeout(() => setLoadingStep('✨ Generando recomendaciones...'), 5000);

      const res = await fetch('/api/analyze-ai', {
        method: 'POST',
        body: form
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Error del servidor');
      }

      if (data.success) {
        const newResult = {
          ...data,
          timestamp: new Date().toISOString(),
          cvName: cvFile.name,
          jdPreview: jdText.substring(0, 100)
        };
        setResults(newResult);
        
        const updatedHistory = [newResult, ...history.slice(0, 4)];
        setHistory(updatedHistory);
        localStorage.setItem('resumescore_history', JSON.stringify(updatedHistory));

        // 🎉 Confetti si score >= 85%
        if (data.average >= 85) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }

        // Scroll suave a resultados
        setTimeout(() => {
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }, 500);
      } else {
        setError(data.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleReset = () => {
    setCvFile(null);
    setJdText('');
    setResults(null);
    setError(null);
    setSelectedATS(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('resumescore_darkmode', newMode.toString());
  };

  const handleExportReport = () => {
    const content = generateFullReport(results);
    const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ResumeScore_Analisis_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const generateFullReport = (data) => {
    if (!data) return '';
    
    return `
╔═══════════════════════════════════════════════════════════════╗
║          REPORTE DE ANÁLISIS DE CV - RESUMESCORE            ║
╚═══════════════════════════════════════════════════════════════╝

📁 Archivo: ${data.cvName}
📅 Fecha: ${new Date(data.timestamp).toLocaleString('es-ES')}
🤖 Powered by: Groq AI (Llama 3.3 70B)

╔═══════════════════════════════════════════════════════════════╗
║                     📊 RESUMEN EJECUTIVO                     ║
╚═══════════════════════════════════════════════════════════════╝

🎯 Coincidencia General:     ${data.matchRate}%
📈 Promedio ATS:              ${data.average}%
⚡ Mejora Potencial:          +${(data.improvementPath?.potential || data.average) - (data.improvementPath?.current || data.average)}%

${data.improvementPath ? `
┌───────────────────────────────────────────────────────────────┐
│                      RUTA DE MEJORA                          │
└───────────────────────────────────────────────────────────────┘

📍 Puntuación Actual:     ${data.improvementPath.current}%
🎯 Puntuación Potencial:  ${data.improvementPath.potential}%
📈 Ganancia Posible:      +${data.improvementPath.potential - data.improvementPath.current}%

PASOS RECOMENDADOS:
${data.improvementPath.steps?.map((step, i) => `
${i + 1}. ${step.action}
   💪 Impacto:        ${step.impact}
   ⏱️  Tiempo:        ${step.timeframe}
`).join('\n')}
` : ''}

╔═══════════════════════════════════════════════════════════════╗
║                  💪 FORTALEZAS DETECTADAS                    ║
╚═══════════════════════════════════════════════════════════════╝

${data.strengths?.map((s, i) => `✓ ${i + 1}. ${s}`).join('\n') || '• No hay fortalezas disponibles'}

╔═══════════════════════════════════════════════════════════════╗
║                    🏆 SCORES POR ATS                         ║
╚═══════════════════════════════════════════════════════════════╝

${Object.entries(data.scores).map(([ats, score]) => {
  const emoji = score >= 85 ? '🟢' : score >= 75 ? '🟡' : score >= 60 ? '🟠' : '🔴';
  return `${emoji} ${ats.padEnd(25)} ${score}%`;
}).join('\n')}

╔═══════════════════════════════════════════════════════════════╗
║                 🔍 ANÁLISIS DE KEYWORDS                      ║
╚═══════════════════════════════════════════════════════════════╝

┌─ SKILLS TÉCNICOS ─────────────────────────────────────────────┐
│ ✅ Encontrados:  ${data.keywords?.technical?.found?.join(', ') || 'N/A'}
│ ❌ Faltantes:    ${data.keywords?.technical?.missing?.join(', ') || 'N/A'}
└───────────────────────────────────────────────────────────────┘

┌─ SOFT SKILLS ─────────────────────────────────────────────────┐
│ ✅ Encontrados:  ${data.keywords?.soft?.found?.join(', ') || 'N/A'}
│ ❌ Faltantes:    ${data.keywords?.soft?.missing?.join(', ') || 'N/A'}
└───────────────────────────────────────────────────────────────┘

┌─ KEYWORDS DE INDUSTRIA ───────────────────────────────────────┐
│ ✅ Encontrados:  ${data.keywords?.industry?.found?.join(', ') || 'N/A'}
│ ❌ Faltantes:    ${data.keywords?.industry?.missing?.join(', ') || 'N/A'}
└───────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════╗
║                  📈 VISTA DE CALOR POR SECCIÓN               ║
╚═══════════════════════════════════════════════════════════════╝

${Object.entries(data.sectionScores || {}).map(([section, score]) => {
  const bar = '█'.repeat(Math.floor(score / 10)) + '░'.repeat(10 - Math.floor(score / 10));
  const emoji = score >= 85 ? '🔥' : score >= 70 ? '⚡' : '📝';
  return `${emoji} ${section.charAt(0).toUpperCase() + section.slice(1).padEnd(15)} ${bar} ${score}%`;
}).join('\n')}

╔═══════════════════════════════════════════════════════════════╗
║              💡 RECOMENDACIONES PRIORIZADAS                  ║
╚═══════════════════════════════════════════════════════════════╝

${data.recommendations?.map((rec, i) => {
  const text = typeof rec === 'string' ? rec : rec.text;
  const priority = typeof rec === 'object' ? rec.priority : 'normal';
  const section = typeof rec === 'object' && rec.section ? rec.section : '';
  const example = typeof rec === 'object' && rec.example ? rec.example : '';
  
  const priorityEmoji = priority === 'critical' ? '🔴' : priority === 'important' ? '🟡' : '🟢';
  
  return `
${priorityEmoji} ${i + 1}. [${priority.toUpperCase()}] ${text}
${section ? `   📂 Sección: ${section}` : ''}
${example ? `   📝 Ejemplo:\n   ${example.split('\n').join('\n   ')}` : ''}
`;
}).join('\n') || '• No hay recomendaciones disponibles'}

╔═══════════════════════════════════════════════════════════════╗
║              🎯 ANÁLISIS DETALLADO POR ATS                   ║
╚═══════════════════════════════════════════════════════════════╝

${Object.entries(data.atsBreakdown || {}).map(([ats, breakdown]) => `
${'═'.repeat(65)}
  ${ats} - ${breakdown.score}%
${'═'.repeat(65)}

✅ ASPECTOS POSITIVOS:
${breakdown.positives?.map((p, i) => `   ${i + 1}. ${p}`).join('\n') || '   • Ninguno identificado'}

❌ ÁREAS DE MEJORA:
${breakdown.negatives?.map((n, i) => `   ${i + 1}. ${n}`).join('\n') || '   • Ninguna identificada'}

💡 TIPS ESPECÍFICOS PARA ${ats}:
${breakdown.tips?.map((t, i) => `   ${i + 1}. ${t}`).join('\n') || '   • Ningún tip disponible'}
`).join('\n')}

╔═══════════════════════════════════════════════════════════════╗
║           🔍 GUÍA PARA IDENTIFICAR EL ATS USADO              ║
╚═══════════════════════════════════════════════════════════════╝

${data.atsDetectionGuide ? `
📌 SEÑALES PARA IDENTIFICAR EL ATS:
${data.atsDetectionGuide.signals?.map((s, i) => `   ${i + 1}. ${s}`).join('\n')}

🌐 SISTEMAS COMUNES (busca en la URL):
${Object.entries(data.atsDetectionGuide.commonSystems || {}).map(([ats, hint]) => 
  `   • ${ats}: ${hint}`
).join('\n')}
` : '• Información no disponible'}

╔═══════════════════════════════════════════════════════════════╗
║                📝 RAZONAMIENTO DEL ANÁLISIS                  ║
╚═══════════════════════════════════════════════════════════════╝

${data.reasoning || '• No disponible'}

${'═'.repeat(65)}
                        FIN DEL REPORTE
${'═'.repeat(65)}

Generado por ResumeScore © 2024
Powered by Groq AI - https://groq.com
Versión: 2.0 Premium

Para más información, visita: https://resumescore.com
Soporte: support@resumescore.com
    `.trim();
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: darkMode 
        ? 'bg-red-900 text-red-200 border-red-700' 
        : 'bg-red-50 text-red-800 border-red-300',
      important: darkMode 
        ? 'bg-yellow-900 text-yellow-200 border-yellow-700' 
        : 'bg-yellow-50 text-yellow-800 border-yellow-300',
      normal: darkMode 
        ? 'bg-green-900 text-green-200 border-green-700' 
        : 'bg-green-50 text-green-800 border-green-300'
    };
    return colors[priority] || colors.normal;
  };

  const getPriorityIcon = (priority) => {
    return priority === 'critical' ? '🔴' : priority === 'important' ? '🟡' : '🟢';
  };

  const Tooltip = ({ text, children }) => (
    <div className="relative inline-block group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );

  // JSX PRINCIPAL - PARTE 2/5
  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      
      {/* Header Premium */}
      <header className="relative pt-8 pb-6 px-6">
        {/* Dark Mode Toggle */}
        <div className="absolute top-6 right-6 z-50">
          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-full transition-all duration-300 ${
              darkMode 
                ? 'bg-yellow-400 hover:bg-yellow-300 text-gray-900' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            } shadow-lg hover:shadow-xl`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        <div className="max-w-6xl mx-auto text-center pt-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
              : 'bg-gradient-to-br from-blue-600 to-indigo-600'
          }`}>
            <svg className="w-11 h-11 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          
          <h1 className={`text-6xl md:text-7xl font-black mb-4 ${
            darkMode 
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400' 
              : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600'
          }`}>
            ResumeScore
          </h1>
          
          <p className={`text-xl md:text-2xl mb-6 ${
            darkMode ? 'text-gray-300' : 'text-slate-600'
          }`}>
            Análisis inteligente de CV con IA • 10 ATS principales
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <span className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-slate-600'
            } shadow-lg`}>
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Powered by Groq AI
            </span>
            <button
              onClick={() => setShowATSGuide(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                darkMode ? 'bg-indigo-900 text-indigo-300 hover:bg-indigo-800' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              } transition-colors`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ¿Qué ATS usa la empresa?
            </button>
            <button
              onClick={() => setShowLegal(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              } transition-colors`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Legal y Privacidad
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pb-20">
        {!results ? (
          /* Upload Form */
          <div className={`rounded-3xl shadow-2xl border overflow-hidden mb-8 ${
            darkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-slate-200'
          }`}>
            <div className="p-8">
              {/* File Upload */}
              <div className="mb-6">
                <label className={`block text-sm font-semibold mb-3 ${
                  darkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  📄 Tu CV
                </label>
                <input
                  type="file"
                  accept=".docx,.pdf"
                  onChange={(e) => setCvFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`flex items-center justify-center w-full px-6 py-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group ${
                    darkMode 
                      ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700/50' 
                      : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  {cvFile ? (
                    <div className="flex items-center gap-3 text-blue-600">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-left">
                        <span className="font-semibold block">{cvFile.name}</span>
                        <span className="text-xs text-gray-500">{(cvFile.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className={`w-12 h-12 mx-auto mb-3 transition-colors ${
                        darkMode ? 'text-gray-500 group-hover:text-blue-400' : 'text-slate-400 group-hover:text-blue-500'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className={`font-semibold block mb-1 ${
                        darkMode ? 'text-gray-300' : 'text-slate-600'
                      }`}>Haz clic para subir tu CV</span>
                      <span className={`text-xs block ${
                        darkMode ? 'text-gray-500' : 'text-slate-500'
                      }`}>PDF o DOCX • Máx. 5MB</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Job Description */}
              <div className="mb-6">
                <label className={`block text-sm font-semibold mb-3 ${
                  darkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  💼 Descripción del Puesto (Job Description)
                </label>
                <textarea
                  placeholder="Pega aquí la descripción completa del trabajo que te interesa...

Tip: Incluye toda la información posible (requisitos, responsabilidades, skills necesarios)"
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className={`w-full h-56 p-4 border-2 rounded-2xl outline-none transition-all duration-300 resize-none ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:bg-gray-600' 
                      : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                  }`}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${
                    darkMode ? 'text-gray-500' : 'text-slate-500'
                  }`}>
                    {jdText.length} caracteres
                  </span>
                  {jdText.length > 0 && (
                    <span className={`text-xs ${
                      jdText.length >= 200 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {jdText.length >= 200 ? '✓ Suficiente detalle' : '⚠️ Agrega más detalles para mejor análisis'}
                    </span>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className={`mb-6 p-4 rounded-2xl border-l-4 ${
                  darkMode 
                    ? 'bg-red-900/30 border-red-500' 
                    : 'bg-red-50 border-red-500'
                }`}>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-red-300' : 'text-red-800'}`}>Error</p>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={loading || !cvFile || !jdText}
                className={`w-full py-5 px-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl flex items-center justify-center gap-3 group relative overflow-hidden ${
                  loading || !cvFile || !jdText
                    ? darkMode 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : darkMode
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 hover:shadow-2xl hover:scale-[1.02]'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl hover:scale-[1.02]'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="text-left">
                      <span className="block">{loadingStep}</span>
                      <span className="text-xs opacity-75">Esto puede tardar 10-15 segundos...</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span>🤖 Analizar con IA</span>
                    <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>

              {/* History Section */}
              {history.length > 0 && (
                <div className={`mt-8 pt-8 border-t ${
                  darkMode ? 'border-gray-700' : 'border-slate-200'
                }`}>
                  <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Historial Reciente
                  </h3>
                  <div className="space-y-2">
                    {history.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setResults(item)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                          darkMode 
                            ? 'bg-gray-700 hover:bg-gray-600' 
                            : 'bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${
                              darkMode ? 'text-gray-200' : 'text-slate-800'
                            }`}>{item.cvName}</p>
                            <p className={`text-xs mt-1 ${
                              darkMode ? 'text-gray-400' : 'text-slate-500'
                            }`}>{new Date(item.timestamp).toLocaleString('es-ES')}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{item.average}%</div>
                            <span className="text-xs text-gray-500">promedio</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Results Section - PARTE 3/5 */
          <div className="space-y-6 animate-fade-in">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleReset}
                className={`flex-1 min-w-[200px] py-4 px-6 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                  darkMode 
                    ? 'bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Analizar otro CV
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex-1 min-w-[200px] py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exportar Reporte
              </button>
            </div>

            {/* Hero Stats */}
            <div className={`rounded-3xl shadow-2xl p-8 overflow-hidden relative ${
              darkMode 
                ? 'bg-gradient-to-br from-blue-900 to-indigo-900' 
                : 'bg-gradient-to-br from-blue-600 to-indigo-600'
            }`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
              <div className="relative z-10 grid md:grid-cols-3 gap-6 text-center text-white">
                <div>
                  <p className="text-blue-200 font-medium mb-2">Coincidencia General</p>
                  <div className="text-6xl font-black mb-2">{results.matchRate}%</div>
                  <p className="text-sm text-blue-200">
                    {results.matchRate >= 85 ? '🎉 Excelente!' : results.matchRate >= 70 ? '👍 Buen match' : '💪 Hay margen'}
                  </p>
                </div>
                <div>
                  <p className="text-blue-200 font-medium mb-2">Promedio ATS</p>
                  <div className="text-6xl font-black mb-2">{results.average}%</div>
                  <p className="text-sm text-blue-200">
                    {results.average >= 85 ? 'Top tier' : results.average >= 70 ? 'Competitivo' : 'Mejorable'}
                  </p>
                </div>
                <div>
                  <p className="text-blue-200 font-medium mb-2">Mejora Estimada</p>
                  <div className="text-6xl font-black mb-2">+{results.improvementPath?.potential - results.improvementPath?.current || 0}%</div>
                  <p className="text-sm text-blue-200">Con optimizaciones</p>
                </div>
              </div>
            </div>

            {/* Improvement Path */}
            {results.improvementPath && (
              <div className={`rounded-3xl shadow-xl border p-8 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                      Tu Ruta de Mejora
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                      De {results.improvementPath.current}% a {results.improvementPath.potential}% en 4 pasos
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {results.improvementPath.steps?.map((step, i) => (
                    <div key={i} className={`relative p-5 rounded-2xl border-2 transition-all hover:scale-105 cursor-pointer ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 hover:border-purple-500' 
                        : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:border-purple-400'
                    }`}>
                      <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : i === 2 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}>
                        {i + 1}
                      </div>
                      <div className={`text-3xl font-black mb-2 ${
                        darkMode ? 'text-purple-400' : 'text-purple-600'
                      }`}>
                        {step.impact}
                      </div>
                      <p className={`text-sm font-semibold mb-2 ${
                        darkMode ? 'text-gray-200' : 'text-slate-800'
                      }`}>
                        {step.action}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                        ⏱️ {step.timeframe}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {results.strengths && results.strengths.length > 0 && (
              <div className={`rounded-3xl shadow-xl border p-8 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                    💪 Fortalezas Detectadas
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {results.strengths.map((strength, i) => (
                    <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all hover:scale-105 ${
                      darkMode 
                        ? 'bg-green-900/20 border-green-700' 
                        : 'bg-green-50 border-green-200'
                    }`}>
                      <span className="text-3xl flex-shrink-0">✓</span>
                      <p className={`flex-1 ${darkMode ? 'text-gray-200' : 'text-slate-700'}`}>{strength}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords Analysis */}
            {results.keywords && (
              <div className={`rounded-3xl shadow-xl border p-8 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                      🔍 Análisis de Keywords
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                      Keywords encontrados vs faltantes por categoría
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Technical Skills */}
                  <div>
                    <h3 className={`font-semibold mb-3 flex items-center gap-2 ${
                      darkMode ? 'text-gray-300' : 'text-slate-700'
                    }`}>
                      <span className="text-2xl">💻</span> Skills Técnicos
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className={`text-xs font-semibold mb-2 ${
                          darkMode ? 'text-green-400' : 'text-green-700'
                        }`}>✅ ENCONTRADOS ({results.keywords.technical?.found?.length || 0})</p>
                        <div className="flex flex-wrap gap-2">
                          {results.keywords.technical?.found?.map((skill, i) => (
                            <Tooltip key={i} text="Este skill está en tu CV">
                              <span className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-help ${
                                darkMode 
                                  ? 'bg-green-900 text-green-200 border border-green-700' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {skill}
                              </span>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className={`text-xs font-semibold mb-2 ${
                          darkMode ? 'text-red-400' : 'text-red-700'
                        }`}>❌ FALTANTES ({results.keywords.technical?.missing?.length || 0})</p>
                        <div className="flex flex-wrap gap-2">
                          {results.keywords.technical?.missing?.map((skill, i) => (
                            <Tooltip key={i} text="Agrega este skill a tu CV">
                              <span className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-help ${
                                darkMode 
                                  ? 'bg-red-900 text-red-200 border border-red-700' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {skill}
                              </span>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Soft Skills */}
                  <div>
                    <h3 className={`font-semibold mb-3 flex items-center gap-2 ${
                      darkMode ? 'text-gray-300' : 'text-slate-700'
                    }`}>
                      <span className="text-2xl">🤝</span> Soft Skills
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className={`text-xs font-semibold mb-2 ${
                          darkMode ? 'text-green-400' : 'text-green-700'
                        }`}>✅ ENCONTRADOS ({results.keywords.soft?.found?.length || 0})</p>
                        <div className="flex flex-wrap gap-2">
                          {results.keywords.soft?.found?.map((skill, i) => (
                            <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                              darkMode 
                                ? 'bg-purple-900 text-purple-200 border border-purple-700' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className={`text-xs font-semibold mb-2 ${
                          darkMode ? 'text-red-400' : 'text-red-700'
                        }`}>❌ FALTANTES ({results.keywords.soft?.missing?.length || 0})</p>
                        <div className="flex flex-wrap gap-2">
                          {results.keywords.soft?.missing?.map((skill, i) => (
                            <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                              darkMode 
                                ? 'bg-red-900 text-red-200 border border-red-700' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Industry Keywords */}
                  {results.keywords.industry && (
                    <div>
                      <h3 className={`font-semibold mb-3 flex items-center gap-2 ${
                        darkMode ? 'text-gray-300' : 'text-slate-700'
                      }`}>
                        <span className="text-2xl">🏢</span> Keywords de Industria
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className={`text-xs font-semibold mb-2 ${
                            darkMode ? 'text-green-400' : 'text-green-700'
                          }`}>✅ ENCONTRADOS ({results.keywords.industry?.found?.length || 0})</p>
                          <div className="flex flex-wrap gap-2">
                            {results.keywords.industry?.found?.map((skill, i) => (
                              <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                darkMode 
                                  ? 'bg-blue-900 text-blue-200 border border-blue-700' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className={`text-xs font-semibold mb-2 ${
                            darkMode ? 'text-red-400' : 'text-red-700'
                          }`}>❌ FALTANTES ({results.keywords.industry?.missing?.length || 0})</p>
                          <div className="flex flex-wrap gap-2">
                            {results.keywords.industry?.missing?.map((skill, i) => (
                              <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                darkMode 
                                  ? 'bg-red-900 text-red-200 border border-red-700' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CONTINÚA EN PARTE 4 - ATS Scores y Section Scores */}

            {/* ATS Scores Grid */}
            <div className={`rounded-3xl shadow-xl border p-8 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                    🏆 Scores por ATS
                  </h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                    Click en cualquier ATS para ver detalles
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(results.scores).map(([ats, score]) => (
                  <button
                    key={ats}
                    onClick={() => setSelectedATS(ats)}
                    className="group relative"
                  >
                    <div className={`rounded-2xl p-5 border-2 transition-all duration-300 cursor-pointer ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 hover:border-blue-500 hover:bg-gray-600' 
                        : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 hover:border-blue-400 hover:shadow-lg'
                    }`}>
                      <div className={`text-xs font-bold mb-2 truncate ${
                        darkMode ? 'text-gray-400' : 'text-slate-600'
                      }`} title={ats}>
                        {ats}
                      </div>
                      <div className={`text-4xl font-black mb-2 ${
                        score >= 85 ? 'text-green-600' : 
                        score >= 75 ? 'text-yellow-600' : 
                        score >= 60 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {score}
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                              i < Math.floor(score / 20) ? 'bg-current opacity-100' : 'bg-slate-300 opacity-50'
                            }`}
                          ></div>
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-600 bg-opacity-0 group-hover:bg-opacity-95 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                        <div className="text-white text-center p-2">
                          <p className="font-bold text-sm mb-1">Ver análisis</p>
                          <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className={`mt-6 pt-6 border-t text-center ${
                darkMode ? 'border-gray-700' : 'border-slate-200'
              }`}>
                <p className={`text-lg mb-2 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                  Promedio Global:
                </p>
                <span className="text-5xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {results.average}%
                </span>
              </div>
            </div>

            {/* Section Scores - Heatmap */}
            {results.sectionScores && Object.keys(results.sectionScores).length > 0 && (
              <div className={`rounded-3xl shadow-xl border p-8 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                      🔥 Vista de Calor por Sección
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                      Qué tan bien está cada parte de tu CV
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {Object.entries(results.sectionScores).map(([section, score]) => (
                    <div key={section} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <Tooltip text={`Esta sección tiene un score de ${score}%`}>
                          <span className={`text-sm font-bold capitalize cursor-help ${
                            darkMode ? 'text-gray-300' : 'text-slate-700'
                          }`}>
                            {section === 'experience' ? '💼 Experiencia' :
                             section === 'education' ? '🎓 Educación' :
                             section === 'skills' ? '🛠️ Skills' :
                             section === 'summary' ? '📝 Resumen' :
                             section === 'certifications' ? '📜 Certificaciones' :
                             section === 'projects' ? '🚀 Proyectos' : section}
                          </span>
                        </Tooltip>
                        <span className={`text-sm font-black ${
                          score >= 85 ? 'text-green-600' : 
                          score >= 70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {score}%
                        </span>
                      </div>
                      <div className={`w-full rounded-full h-4 overflow-hidden ${
                        darkMode ? 'bg-gray-700' : 'bg-slate-200'
                      }`}>
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            score >= 85 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                            score >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-red-500 to-pink-500'
                          }`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <div className={`rounded-3xl shadow-xl border p-8 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                      💡 Recomendaciones Priorizadas
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                      {results.recommendations.length} acciones para mejorar tu CV
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {results.recommendations.map((rec, i) => {
                    const text = typeof rec === 'string' ? rec : rec.text;
                    const priority = typeof rec === 'object' ? rec.priority : 'normal';
                    const section = typeof rec === 'object' && rec.section ? rec.section : '';
                    const example = typeof rec === 'object' && rec.example ? rec.example : '';
                    
                    return (
                      <div key={i} className={`p-5 rounded-2xl border-2 transition-all hover:scale-[1.02] ${
                        getPriorityColor(priority)
                      }`}>
                        <div className="flex items-start gap-4">
                          <span className="text-3xl flex-shrink-0">{getPriorityIcon(priority)}</span>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`text-xs font-black uppercase tracking-wider px-2 py-1 rounded ${
                                    darkMode ? 'bg-black/30' : 'bg-white/50'
                                  }`}>
                                    {priority}
                                  </span>
                                  {section && (
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      darkMode ? 'bg-black/20' : 'bg-white/30'
                                    }`}>
                                      📂 {section}
                                    </span>
                                  )}
                                </div>
                                <p className={`font-medium leading-relaxed ${
                                  darkMode ? 'text-gray-200' : 'text-slate-800'
                                }`}>
                                  {text}
                                </p>
                              </div>
                            </div>
                            
                            {example && (
                              <div className={`p-4 rounded-xl border ${
                                darkMode 
                                  ? 'bg-black/20 border-gray-700' 
                                  : 'bg-white/50 border-slate-200'
                              }`}>
                                <p className={`text-xs font-semibold mb-2 flex items-center gap-2 ${
                                  darkMode ? 'text-gray-400' : 'text-slate-600'
                                }`}>
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Ejemplo para copiar:
                                </p>
                                <pre className={`text-sm whitespace-pre-wrap font-mono ${
                                  darkMode ? 'text-gray-300' : 'text-slate-700'
                                }`}>{example}</pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODALES Y COMPONENTES ADICIONALES - PARTE 5 FINAL */}
      
      {/* ATS Detail Modal */}
      {selectedATS && results.atsBreakdown && results.atsBreakdown[selectedATS] && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" 
          onClick={() => setSelectedATS(null)}
        >
          <div 
            className={`rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-t-3xl z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-3xl font-black mb-2">{selectedATS}</h3>
                  <p className="text-blue-100">Análisis detallado del sistema</p>
                </div>
                <button
                  onClick={() => setSelectedATS(null)}
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-all hover:rotate-90 transform duration-300"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-6">
                <div className="text-7xl font-black">{results.atsBreakdown[selectedATS].score}%</div>
                <div className="flex items-center gap-1 mt-3">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full ${
                        i < Math.floor(results.atsBreakdown[selectedATS].score / 10) 
                          ? 'bg-white' 
                          : 'bg-white/20'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Positives */}
              {results.atsBreakdown[selectedATS].positives && results.atsBreakdown[selectedATS].positives.length > 0 && (
                <div>
                  <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                    darkMode ? 'text-green-400' : 'text-green-700'
                  }`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ✅ Aspectos Positivos
                  </h4>
                  <ul className="space-y-3">
                    {results.atsBreakdown[selectedATS].positives.map((item, i) => (
                      <li key={i} className={`flex items-start gap-3 p-4 rounded-xl ${
                        darkMode ? 'bg-green-900/20' : 'bg-green-50'
                      }`}>
                        <span className="text-2xl text-green-600 flex-shrink-0">✓</span>
                        <span className={darkMode ? 'text-gray-200' : 'text-slate-700'}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Negatives */}
              {results.atsBreakdown[selectedATS].negatives && results.atsBreakdown[selectedATS].negatives.length > 0 && (
                <div>
                  <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                    darkMode ? 'text-red-400' : 'text-red-700'
                  }`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ❌ Áreas de Mejora
                  </h4>
                  <ul className="space-y-3">
                    {results.atsBreakdown[selectedATS].negatives.map((item, i) => (
                      <li key={i} className={`flex items-start gap-3 p-4 rounded-xl ${
                        darkMode ? 'bg-red-900/20' : 'bg-red-50'
                      }`}>
                        <span className="text-2xl text-red-600 flex-shrink-0">✗</span>
                        <span className={darkMode ? 'text-gray-200' : 'text-slate-700'}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tips */}
              {results.atsBreakdown[selectedATS].tips && results.atsBreakdown[selectedATS].tips.length > 0 && (
                <div>
                  <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                    darkMode ? 'text-blue-400' : 'text-blue-700'
                  }`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    💡 Tips Específicos para {selectedATS}
                  </h4>
                  <ul className="space-y-3">
                    {results.atsBreakdown[selectedATS].tips.map((tip, i) => (
                      <li key={i} className={`p-4 rounded-xl border-2 ${
                        darkMode 
                          ? 'bg-blue-900/20 border-blue-700' 
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold flex-shrink-0">{i + 1}.</span>
                          <span className={darkMode ? 'text-gray-200' : 'text-slate-700'}>{tip}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONTINÚA EN PARTE 5 FINAL - Modales restantes */}

      {/* Export Modal */}
      {showExportModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
          onClick={() => setShowExportModal(false)}
        >
          <div 
            className={`rounded-3xl shadow-2xl max-w-md w-full p-8 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl mx-auto mb-4 flex items-center justify-center transform hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                Exportar Reporte Completo
              </h3>
              <p className={darkMode ? 'text-gray-400' : 'text-slate-600'}>
                Descarga tu análisis detallado
              </p>
            </div>

            <div className={`p-5 rounded-2xl border mb-6 ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-slate-200'
            }`}>
              <p className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                📋 El reporte incluye:
              </p>
              <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Scores individuales por cada ATS
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Fortalezas y áreas de mejora
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Recomendaciones con ejemplos
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Análisis detallado de keywords
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Ruta de mejora paso a paso
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className={`flex-1 py-3 px-6 border-2 font-semibold rounded-xl transition-all ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleExportReport}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
              >
                📥 Descargar TXT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATS Detection Guide Modal */}
      {showATSGuide && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" 
          onClick={() => setShowATSGuide(false)}
        >
          <div 
            className={`rounded-3xl shadow-2xl max-w-4xl w-full my-8 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-t-3xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-3xl font-black mb-2">🔍 Guía de Identificación de ATS</h3>
                  <p className="text-indigo-100">Aprende a identificar qué sistema usa cada empresa</p>
                </div>
                <button
                  onClick={() => setShowATSGuide(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {results?.atsDetectionGuide ? (
                <>
                  <div>
                    <h4 className={`text-lg font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                      📌 Señales para identificar el ATS:
                    </h4>
                    <ul className="space-y-2">
                      {results.atsDetectionGuide.signals?.map((signal, i) => (
                        <li key={i} className={`flex items-start gap-3 p-3 rounded-xl ${
                          darkMode ? 'bg-gray-700' : 'bg-slate-50'
                        }`}>
                          <span className="text-indigo-600 font-bold">{i + 1}.</span>
                          <span className={darkMode ? 'text-gray-300' : 'text-slate-700'}>{signal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className={`text-lg font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                      🌐 Sistemas comunes y cómo identificarlos:
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(results.atsDetectionGuide.commonSystems || {}).map(([ats, hint]) => (
                        <div key={ats} className={`p-4 rounded-xl border-2 ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'
                        }`}>
                          <p className={`font-bold mb-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                            {ats}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                            {hint}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                    Analiza un CV primero para ver la guía de detección de ATS
                  </p>
                </div>
              )}

              <div className={`p-5 rounded-2xl border-l-4 border-blue-500 ${
                darkMode ? 'bg-blue-900/20' : 'bg-blue-50'
              }`}>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                  <strong>💡 Tip Pro:</strong> Antes de aplicar, inspecciona la URL de la página de carreras. 
                  La mayoría de ATS incluyen su nombre en la URL o en el código fuente de la página.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legal Modal */}
      {showLegal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" 
          onClick={() => setShowLegal(false)}
        >
          <div 
            className={`rounded-3xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-gray-900 text-white p-8 rounded-t-3xl z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-3xl font-black mb-2">⚖️ Legal y Privacidad</h3>
                  <p className="text-gray-300">Términos de uso y política de privacidad</p>
                </div>
                <button
                  onClick={() => setShowLegal(false)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={`p-8 space-y-8 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
              {/* Privacy Policy */}
              <section>
                <h4 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  🔒 Política de Privacidad
                </h4>
                <div className="space-y-4 text-sm leading-relaxed">
                  <p>
                    <strong>Última actualización:</strong> Noviembre 2024
                  </p>
                  <p>
                    En ResumeScore, tu privacidad es nuestra prioridad. Esta política explica cómo manejamos tu información.
                  </p>
                  <div>
                    <p className="font-semibold mb-2">✓ Lo que hacemos:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Analizamos tu CV y la descripción del puesto que proporciones</li>
                      <li>Generamos recomendaciones usando IA (Groq/Llama 3.3)</li>
                      <li>Guardamos tu historial localmente en tu navegador (localStorage)</li>
                      <li>Procesamos todo en tiempo real sin almacenar en servidores</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">✗ Lo que NO hacemos:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>NO guardamos tu CV en nuestros servidores</li>
                      <li>NO compartimos tu información con terceros</li>
                      <li>NO vendemos tus datos</li>
                      <li>NO usamos tu información para entrenar modelos de IA</li>
                      <li>NO enviamos spam ni emails no solicitados</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Terms of Service */}
              <section>
                <h4 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  📜 Términos de Uso
                </h4>
                <div className="space-y-4 text-sm leading-relaxed">
                  <p>
                    Al usar ResumeScore, aceptas los siguientes términos:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 ml-4">
                    <li><strong>Uso del servicio:</strong> ResumeScore es una herramienta de análisis. No garantizamos que serás contratado.</li>
                    <li><strong>Precisión:</strong> Los scores son estimaciones basadas en IA. Los ATS reales pueden variar.</li>
                    <li><strong>Responsabilidad:</strong> Eres responsable del contenido que subes y de cómo usas las recomendaciones.</li>
                    <li><strong>Propiedad intelectual:</strong> Mantienes todos los derechos sobre tu CV y contenido.</li>
                    <li><strong>Modificaciones:</strong> Podemos actualizar el servicio sin previo aviso.</li>
                  </ol>
                </div>
              </section>

              {/* Disclaimer */}
              <section>
                <h4 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  ⚠️ Deslinde de Responsabilidad
                </h4>
                <div className={`p-5 rounded-2xl border-2 ${
                  darkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-300'
                }`}>
                  <div className="space-y-3 text-sm">
                    <p>
                      <strong>IMPORTANTE:</strong> ResumeScore es una herramienta de asistencia, NO un servicio profesional de recursos humanos.
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Los análisis son generados por IA y pueden contener imprecisiones</li>
                      <li>No sustituye la revisión profesional de un recruiter o career coach</li>
                      <li>Los scores son estimaciones, no garantías de contratación</li>
                      <li>Cada empresa puede usar configuraciones únicas en sus ATS</li>
                      <li>Usa las recomendaciones como guía, no como mandato absoluto</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Data Processing */}
              <section>
                <h4 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  🔄 Procesamiento de Datos
                </h4>
                <div className="space-y-4 text-sm">
                  <p>
                    <strong>¿Cómo procesamos tu información?</strong>
                  </p>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
                    <ol className="space-y-2">
                      <li>1️⃣ Subes tu CV → Se procesa en tu navegador</li>
                      <li>2️⃣ Se envía a nuestra API → Análisis temporal en memoria</li>
                      <li>3️⃣ Se procesa con Groq AI → Sin almacenamiento</li>
                      <li>4️⃣ Recibes resultados → Se guardan solo en tu navegador</li>
                      <li>5️⃣ Cerramos la sesión → Todo se elimina de servidores</li>
                    </ol>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                    💡 Tu información solo existe mientras usas la herramienta. Una vez cerrada la pestaña, 
                    no queda rastro en nuestros servidores (solo en tu localStorage local).
                  </p>
                </div>
              </section>

              {/* Contact */}
              <section>
                <h4 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  📧 Contacto
                </h4>
                <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
                  <p className="mb-3">¿Preguntas sobre privacidad o términos?</p>
                  <p className="text-sm">
                    Email: <a href="mailto:privacy@resumescore.com" className="text-blue-600 hover:underline">privacy@resumescore.com</a><br/>
                    Web: <a href="https://resumescore.com" className="text-blue-600 hover:underline">resumescore.com</a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl shadow-2xl max-w-2xl w-full p-8 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center animate-bounce">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className={`text-4xl font-black mb-4 ${
                darkMode ? 'text-gray-200' : 'text-slate-800'
              }`}>
                ¡Bienvenido a ResumeScore! 🎉
              </h2>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                Tu asistente inteligente para optimizar CVs
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className={`flex items-start gap-4 p-4 rounded-2xl ${
                darkMode ? 'bg-gray-700' : 'bg-blue-50'
              }`}>
                <span className="text-3xl">📄</span>
                <div>
                  <p className={`font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                    1. Sube tu CV
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                    Formatos aceptados: PDF o DOCX
                  </p>
                </div>
              </div>

              <div className={`flex items-start gap-4 p-4 rounded-2xl ${
                darkMode ? 'bg-gray-700' : 'bg-indigo-50'
              }`}>
                <span className="text-3xl">💼</span>
                <div>
                  <p className={`font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                    2. Pega el Job Description
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                    Copia toda la descripción del puesto que te interesa
                  </p>
                </div>
              </div>

              <div className={`flex items-start gap-4 p-4 rounded-2xl ${
                darkMode ? 'bg-gray-700' : 'bg-purple-50'
              }`}>
                <span className="text-3xl">🤖</span>
                <div>
                  <p className={`font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                    3. Obtén análisis con IA
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                    Recibe scores, fortalezas y recomendaciones en 15 segundos
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowOnboarding(false)}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl"
            >
              ¡Empezar ahora! 🚀
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`py-12 px-6 border-t ${
        darkMode ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className={`font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                ResumeScore
              </h4>
              <p className="text-sm mb-4">
                Optimiza tu CV para ATS con inteligencia artificial. Aumenta tus posibilidades de ser contratado.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-green-500 text-white rounded">Powered by Groq AI</span>
              </div>
            </div>
            
            <div>
              <h4 className={`font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                Enlaces
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => setShowLegal(true)} className="hover:text-blue-600 transition-colors">
                    Privacidad y Legal
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowATSGuide(true)} className="hover:text-blue-600 transition-colors">
                    Guía de ATS
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowOnboarding(true)} className="hover:text-blue-600 transition-colors">
                    Tutorial
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className={`font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                Soporte
              </h4>
              <p className="text-sm mb-2">
                ¿Necesitas ayuda?
              </p>
              <a href="mailto:support@resumescore.com" className="text-sm text-blue-600 hover:underline">
                support@resumescore.com
              </a>
            </div>
          </div>
          
          <div className={`pt-8 border-t text-center text-sm ${
            darkMode ? 'border-gray-800' : 'border-slate-200'
          }`}>
            <p>© 2024 ResumeScore. Todos los derechos reservados.</p>
            <p className="mt-2">
              Hecho con ❤️ para ayudarte a conseguir el trabajo de tus sueños
            </p>
          </div>
        </div>
      </footer>

      {/* Global Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        /* Dark mode utilities */
        .dark {
          color-scheme: dark;
        }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        ::-webkit-scrollbar-track {
          background: ${darkMode ? '#1f2937' : '#f1f5f9'};
        }
        ::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#4b5563' : '#cbd5e1'};
          border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#6b7280' : '#94a3b8'};
        }
      `}</style>
    </div>
  );
}

export default App;

// ✅ CHECKPOINT COMPLETO: FRONTEND_PREMIUM - 100%
// 📦 Siguiente: Instalar dependencias y deploy
      </main>
    </div>
  );
}

export default App;

// 🔄 PARA CONTINUAR: "Continúa desde CHECKPOINT FRONTEND_PREMIUM"
// 📍 PRÓXIMO: JSX Principal (Header, Upload Form, Results)