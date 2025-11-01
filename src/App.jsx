import { useState } from 'react'

function App() {
  const [cvFile, setCvFile] = useState(null)
  const [jdText, setJdText] = useState('')
  const [scores, setScores] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [matchRate, setMatchRate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [useAI, setUseAI] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [average, setAverage] = useState(null)

  const handleAnalyze = async () => {
    if (!cvFile || !jdText.trim()) {
      alert('Sube un CV y pega el JD');
      return;
    }

    setLoading(true);
    setError(null);
    setScores(null);
    setRecommendations([]);
    setMatchRate(null);
    setAnalysis(null);
    
    const form = new FormData();
    form.append('cv', cvFile);
    form.append('jd', jdText);

    try {
      const endpoint = useAI ? '/api/analyze-ai' : '/api/analyze';
      const res = await fetch(endpoint, {
        method: 'POST',
        body: form
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Error del servidor');
      }

      if (data.success) {
        setScores(data.scores);
        setRecommendations(data.recommendations || []);
        setMatchRate(data.matchRate);
        setAnalysis(data.analysis || null);
        setAverage(data.average);
      } else {
        setError(data.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="pt-12 pb-8 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            ResumeScore
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Optimiza tu CV para los 10 principales ATS del mercado en segundos
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 pb-20">
        {/* Upload Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-8">
          <div className="p-8">
            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                📄 Tu CV
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".docx,.pdf"
                  onChange={(e) => setCvFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-full px-6 py-4 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                >
                  {cvFile ? (
                    <div className="flex items-center gap-3 text-blue-600">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{cvFile.name}</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="w-10 h-10 mx-auto mb-2 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-slate-600 font-medium">Haz clic para subir tu CV</span>
                      <span className="block text-xs text-slate-500 mt-1">PDF o DOCX (máx. 5MB)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Job Description */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                💼 Descripción del Puesto
              </label>
              <textarea
                placeholder="Pega aquí la descripción completa del trabajo...

Ejemplo:
• Gestión de equipos multidisciplinarios
• Análisis de datos y métricas de negocio
• Experiencia con sistemas ATS y herramientas de reclutamiento
• Dominio de metodologías ágiles (Scrum, Kanban)"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="w-full h-48 p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 resize-none text-slate-700 placeholder-slate-400"
              />
            </div>

            {/* AI Toggle */}
            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-800">
                      Análisis con Inteligencia Artificial
                    </span>
                    <span className="block text-xs text-slate-600">
                      Análisis más profundo y preciso con GPT-4
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                    className="sr-only peer"
                    id="ai-toggle"
                  />
                  <label
                    htmlFor="ai-toggle"
                    className="block w-14 h-8 bg-slate-300 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-indigo-600 cursor-pointer transition-all duration-300 shadow-inner"
                  ></label>
                  <label
                    htmlFor="ai-toggle"
                    className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 cursor-pointer peer-checked:translate-x-6 shadow-md"
                  ></label>
                </div>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-red-800">Error</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading || !cvFile || !jdText}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Analizando tu CV...</span>
                </>
              ) : (
                <>
                  <span>Analizar CV</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {scores && (
          <div className="space-y-6 animate-fade-in">
            {/* Match Rate Hero */}
            {matchRate !== null && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-8 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
                <div className="relative z-10 text-center">
                  <p className="text-blue-100 font-medium mb-2">Coincidencia General</p>
                  <div className="text-7xl font-bold mb-2">{matchRate}%</div>
                  <p className="text-blue-100">
                    {matchRate >= 80 ? '🎉 Excelente match!' : matchRate >= 60 ? '👍 Buen comienzo' : '💪 Hay margen de mejora'}
                  </p>
                </div>
              </div>
            )}

            {/* ATS Scores Grid */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Scores por ATS</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {Object.entries(scores).map(([ats, score]) => (
                  <div key={ats} className="group relative">
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border-2 border-slate-200 hover:border-blue-400 transition-all duration-200 hover:shadow-lg">
                      <div className="text-xs font-semibold text-slate-600 mb-2 truncate" title={ats}>
                        {ats}
                      </div>
                      <div className={`text-3xl font-bold ${
                        score >= 85 ? 'text-green-600' : 
                        score >= 75 ? 'text-yellow-600' : 
                        score >= 60 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {score}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full ${
                              i < Math.floor(score / 20) ? 'bg-current opacity-100' : 'bg-slate-300'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Average */}
              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-slate-600 font-medium">Promedio Global:</span>
                  <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {average || Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/10)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Recomendaciones</h2>
                </div>
                <div className="space-y-3">
                  {recommendations.map((tip, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </div>
                      <p className="text-slate-700 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Details */}
            {analysis && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Análisis Detallado</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                    <div className="text-sm font-medium text-blue-600 mb-2">Keywords Totales</div>
                    <div className="text-4xl font-bold text-blue-700">{analysis.totalKeywords}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <div className="text-sm font-medium text-green-600 mb-2">Keywords Encontrados</div>
                    <div className="text-4xl font-bold text-green-700">{analysis.matchedKeywords}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                    <div className="text-sm font-medium text-purple-600 mb-2">Tech Skills Match</div>
                    <div className="text-4xl font-bold text-purple-700">{analysis.techSkillRate}%</div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <h3 className="font-semibold text-slate-700 mb-4">Estructura del CV:</h3>
                  <div className="flex flex-wrap gap-3">
                    {analysis.structure.hasDates && (
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Fechas incluidas
                      </span>
                    )}
                    {analysis.structure.hasBullets && (
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Bullet points
                      </span>
                    )}
                    {analysis.structure.hasMetrics && (
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Métricas cuantificables
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm">
        <p>ResumeScore © 2024 · Optimiza tu carrera profesional</p>
      </footer>

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
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

export default App