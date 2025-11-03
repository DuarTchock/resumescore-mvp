import { useState, useEffect } from 'react'

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

${data.strengths?.map((s, i) => `✓ ${i + 1}. ${s}`).join('\n') || '• No disponible'}

╔═══════════════════════════════════════════════════════════════╗
║                    🏆 SCORES POR ATS                         ║
╚═══════════════════════════════════════════════════════════════╝

${Object.entries(data.scores).map(([ats, score]) => {
  const emoji = score >= 85 ? '🟢' : score >= 75 ? '🟡' : score >= 60 ? '🟠' : '🔴';
  return `${emoji} ${ats.padEnd(25)} ${score}%`;
}).join('\n')}

═══════════════════════════════════════════════════════════════
                  FIN DEL REPORTE
═══════════════════════════════════════════════════════════════

Generado por ResumeScore © 2024
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

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      
      {/* Header con todos los componentes - Por brevedad, solo estructura básica */}
      <header className="relative pt-8 pb-6 px-6">
        <div className="absolute top-6 right-6 z-50">
          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-full transition-all duration-300 ${
              darkMode 
                ? 'bg-yellow-400 hover:bg-yellow-300 text-gray-900' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            } shadow-lg hover:shadow-xl`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="max-w-6xl mx-auto text-center pt-8">
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
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-20">
        {!results ? (
          /* Upload Form - versión simplificada para evitar errores */
          <div className={`rounded-3xl shadow-2xl border overflow-hidden mb-8 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
          }`}>
            <div className="p-8">
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
                  className="block w-full"
                />
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-semibold mb-3 ${
                  darkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  💼 Job Description
                </label>
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="w-full h-48 p-4 border-2 rounded-xl"
                  placeholder="Pega aquí la descripción del puesto..."
                />
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading || !cvFile || !jdText}
                className="w-full py-5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl disabled:opacity-50"
              >
                {loading ? loadingStep : '🤖 Analizar con IA'}
              </button>
            </div>
          </div>
        ) : (
          /* Results - mostrar resultados básicos */
          <div className="space-y-6">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-white border-2 border-slate-300 rounded-xl"
            >
              Analizar otro CV
            </button>
            
            <div className="bg-white p-8 rounded-3xl shadow-xl">
              <h2 className="text-2xl font-bold mb-4">Resultados</h2>
              <p>Match: {results.matchRate}%</p>
              <p>Promedio: {results.average}%</p>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default App;