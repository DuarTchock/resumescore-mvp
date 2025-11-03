import { useState } from 'react'

function App() {
  const [cvFile, setCvFile] = useState(null)
  const [jdText, setJdText] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [selectedATS, setSelectedATS] = useState(null)
  const [showExportModal, setShowExportModal] = useState(false)

  const handleAnalyze = async () => {
    if (!cvFile || !jdText.trim()) {
      alert('Sube un CV y pega el JD');
      return;
    }

    setLoading(true);
    setError(null);
    
    const form = new FormData();
    form.append('cv', cvFile);
    form.append('jd', jdText);

    try {
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
        setHistory(prev => [newResult, ...prev.slice(0, 4)]);
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

  const handleReset = () => {
    setCvFile(null);
    setJdText('');
    setResults(null);
    setError(null);
    setSelectedATS(null);
  };

  const handleExportPDF = () => {
    // Simulación - en producción usarías jsPDF o similar
    const content = `
REPORTE DE ANÁLISIS DE CV
========================

Archivo: ${results.cvName}
Fecha: ${new Date(results.timestamp).toLocaleDateString()}

COINCIDENCIA GENERAL: ${results.matchRate}%
PROMEDIO ATS: ${results.average}%

SCORES POR ATS:
${Object.entries(results.scores).map(([ats, score]) => `- ${ats}: ${score}%`).join('\n')}

FORTALEZAS:
${results.strengths?.map((s, i) => `${i + 1}. ${s}`).join('\n')}

RECOMENDACIONES:
${results.recommendations?.map((r, i) => `${i + 1}. [${r.priority?.toUpperCase()}] ${r.text || r}`).join('\n')}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ResumeScore_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    setShowExportModal(false);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'important': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'critical': return '🔴';
      case 'important': return '🟡';
      default: return '🟢';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="pt-12 pb-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            ResumeScore
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Análisis inteligente de CV con IA • 10 ATS principales • Recomendaciones accionables
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pb-20">
        {!results ? (
          /* Upload Card */
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
                  placeholder="Pega aquí la descripción completa del trabajo..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="w-full h-48 p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 resize-none text-slate-700 placeholder-slate-400"
                />
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
                    <span>Analizando con IA...</span>
                  </>
                ) : (
                  <>
                    <span>Analizar con IA</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>

              {/* History */}
              {history.length > 0 && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">📊 Historial reciente</h3>
                  <div className="space-y-2">
                    {history.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setResults(item)}
                        className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{item.cvName}</p>
                            <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
                          </div>
                          <span className="ml-3 text-lg font-bold text-blue-600">{item.average}%</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Results */
          <div className="space-y-6 animate-fade-in">
            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-6 bg-white border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Analizar otro CV
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exportar Reporte
              </button>
            </div>

            {/* Match Rate Hero */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-2xl p-8 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
              <div className="relative z-10 grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-blue-100 font-medium mb-2">Coincidencia General</p>
                  <div className="text-6xl font-bold">{results.matchRate}%</div>
                </div>
                <div>
                  <p className="text-blue-100 font-medium mb-2">Promedio ATS</p>
                  <div className="text-6xl font-bold">{results.average}%</div>
                </div>
                <div>
                  <p className="text-blue-100 font-medium mb-2">Mejora Estimada</p>
                  <div className="text-6xl font-bold">+{results.estimatedImprovement || 0}%</div>
                </div>
              </div>
            </div>

            {/* Strengths */}
            {results.strengths && results.strengths.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Fortalezas Detectadas</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {results.strengths.map((strength, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                      <span className="text-2xl">✓</span>
                      <p className="text-slate-700 flex-1">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords Analysis */}
            {results.keywords && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Análisis de Keywords</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <span className="text-blue-600">💻</span> Skills Técnicos
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {results.keywords.technical?.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <span className="text-purple-600">🤝</span> Skills Blandos
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {results.keywords.soft?.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <span className="text-red-600">⚠️</span> Faltantes Críticos
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {results.keywords.missing?.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
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
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(results.scores).map(([ats, score]) => (
                  <button
                    key={ats}
                    onClick={() => setSelectedATS(ats)}
                    className="group relative"
                  >
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border-2 border-slate-200 hover:border-blue-400 transition-all duration-200 hover:shadow-lg cursor-pointer">
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
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-600 bg-opacity-0 group-hover:bg-opacity-90 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                        <span className="text-white font-semibold text-sm">Ver detalles</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Section Scores */}
            {results.sectionScores && Object.keys(results.sectionScores).length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Vista de Calor por Sección</h2>
                </div>
                <div className="space-y-4">
                  {Object.entries(results.sectionScores).map(([section, score]) => (
                    <div key={section}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700 capitalize">{section}</span>
                        <span className="text-sm font-bold text-slate-900">{score}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
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
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Recomendaciones Priorizadas</h2>
                </div>
                <div className="space-y-3">
                  {results.recommendations.map((rec, i) => {
                    const recText = typeof rec === 'string' ? rec : rec.text;
                    const priority = typeof rec === 'object' ? rec.priority : 'normal';
                    return (
                      <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${getPriorityColor(priority)}`}>
                        <span className="text-2xl flex-shrink-0">{getPriorityIcon(priority)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider">{priority}</span>
                            {typeof rec === 'object' && rec.impact && (
                              <span className="text-xs px-2 py-0.5 bg-white rounded-full">Impacto: {rec.impact}</span>
                            )}
                          </div>
                          <p className="text-slate-700 leading-relaxed">{recText}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ATS Detail Modal */}
        {selectedATS && results.atsBreakdown && results.atsBreakdown[selectedATS] && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedATS(null)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedATS}</h3>
                    <p className="text-blue-100 mt-1">Análisis detallado</p>
                  </div>
                  <button
                    onClick={() => setSelectedATS(null)}
                    className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-4 text-5xl font-bold">{results.scores[selectedATS]}%</div>
              </div>

              <div className="p-6 space-y-6">
                {/* Positives */}
                {results.atsBreakdown[selectedATS].positives && results.atsBreakdown[selectedATS].positives.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Aspectos Positivos
                    </h4>
                    <ul className="space-y-2">
                      {results.atsBreakdown[selectedATS].positives.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700">
                          <span className="text-green-600">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Negatives */}
                {results.atsBreakdown[selectedATS].negatives && results.atsBreakdown[selectedATS].negatives.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Áreas de Mejora
                    </h4>
                    <ul className="space-y-2">
                      {results.atsBreakdown[selectedATS].negatives.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700">
                          <span className="text-red-600">✗</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tips */}
                {results.atsBreakdown[selectedATS].tips && results.atsBreakdown[selectedATS].tips.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tips Específicos para {selectedATS}
                    </h4>
                    <ul className="space-y-2">
                      {results.atsBreakdown[selectedATS].tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <span className="text-blue-600">💡</span>
                          <span className="text-slate-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowExportModal(false)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Exportar Reporte</h3>
                <p className="text-slate-600">Descarga tu análisis completo</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Incluye:</span>
                  </div>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Scores por ATS
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Fortalezas y Recomendaciones
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Análisis de Keywords
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Desglose detallado
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 py-3 px-6 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
                >
                  Descargar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm">
        <p>ResumeScore © 2024 · Powered by Groq AI · Optimiza tu carrera profesional</p>
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