// src/components/modals/AllModals.jsx - TODOS LOS MODALES EN UN ARCHIVO

// ATSDetailModal
export function ATSDetailModal({ selectedATS, atsBreakdown, scores, darkMode, onClose }) {
  if (!selectedATS || !atsBreakdown || !atsBreakdown[selectedATS]) return null;

  const breakdown = atsBreakdown[selectedATS];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" 
      onClick={onClose}
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
              onClick={onClose}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-all hover:rotate-90 transform duration-300"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-6">
            <div className="text-7xl font-black">{breakdown.score}%</div>
            <div className="flex items-center gap-1 mt-3">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i < Math.floor(breakdown.score / 10) ? 'bg-white' : 'bg-white/20'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {breakdown.positives && breakdown.positives.length > 0 && (
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
                {breakdown.positives.map((item, i) => (
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

          {breakdown.negatives && breakdown.negatives.length > 0 && (
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
                {breakdown.negatives.map((item, i) => (
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

          {breakdown.tips && breakdown.tips.length > 0 && (
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
                {breakdown.tips.map((tip, i) => (
                  <li key={i} className={`p-4 rounded-xl border-2 ${
                    darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
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
  );
}

// ExportModal
export function ExportModal({ darkMode, onClose, onExport }) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
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
            {['Scores individuales por cada ATS', 'Fortalezas y áreas de mejora', 'Recomendaciones con ejemplos', 'Análisis detallado de keywords', 'Ruta de mejora paso a paso'].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 py-3 px-6 border-2 font-semibold rounded-xl transition-all ${
              darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={onExport}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            📥 Descargar TXT
          </button>
        </div>
      </div>
    </div>
  );
}

// CONTINÚA: LegalModal, ATSGuideModal, OnboardingModal en siguiente mensaje por espacio
// CHECKPOINT: MODALS - 50% completado

// LegalModal
export function LegalModal({ darkMode, onClose }) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" 
      onClick={onClose}
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
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`p-8 space-y-8 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
          <section>
            <h4 className="text-2xl font-bold mb-4">🔒 Política de Privacidad</h4>
            <div className="space-y-4 text-sm leading-relaxed">
              <p><strong>Última actualización:</strong> Noviembre 2024</p>
              <p>En ResumeScore, tu privacidad es nuestra prioridad.</p>
              <div>
                <p className="font-semibold mb-2">✓ Lo que hacemos:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Analizamos tu CV y JD que proporciones</li>
                  <li>Generamos recomendaciones usando IA (Groq/Llama 3.3)</li>
                  <li>Guardamos historial localmente en tu navegador</li>
                  <li>Procesamos todo en tiempo real sin almacenar en servidores</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">✗ Lo que NO hacemos:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>NO guardamos tu CV en nuestros servidores</li>
                  <li>NO compartimos tu información con terceros</li>
                  <li>NO vendemos tus datos</li>
                  <li>NO usamos tu información para entrenar modelos</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-2xl font-bold mb-4">📜 Términos de Uso</h4>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>Al usar ResumeScore, aceptas:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li><strong>Uso:</strong> Herramienta de análisis. No garantizamos contratación.</li>
                <li><strong>Precisión:</strong> Scores son estimaciones basadas en IA.</li>
                <li><strong>Responsabilidad:</strong> Eres responsable del contenido que subes.</li>
              </ol>
            </div>
          </section>

          <section>
            <h4 className="text-2xl font-bold mb-4">⚠️ Deslinde de Responsabilidad</h4>
            <div className={`p-5 rounded-2xl border-2 ${
              darkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-300'
            }`}>
              <div className="space-y-3 text-sm">
                <p><strong>IMPORTANTE:</strong> ResumeScore es asistencia, NO servicio profesional de RRHH.</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Análisis generados por IA pueden contener imprecisiones</li>
                  <li>No sustituye revisión profesional de recruiter</li>
                  <li>Scores son estimaciones, no garantías</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-2xl font-bold mb-4">📧 Contacto</h4>
            <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-slate-100'}`}>
              <p className="mb-3">¿Preguntas sobre privacidad?</p>
              <p className="text-sm">
                Email: <a href="mailto:privacy@resumescore.com" className="text-blue-600 hover:underline">privacy@resumescore.com</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ATSGuideModal
export function ATSGuideModal({ results, darkMode, onClose }) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" 
      onClick={onClose}
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
              onClick={onClose}
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
                  🌐 Sistemas comunes:
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(results.atsDetectionGuide.commonSystems || {}).map(([ats, hint]) => (
                    <div key={ats} className={`p-4 rounded-xl border-2 ${
                      darkMode ? 'bg-gray-700 border-gray-600' : 'bg-indigo-50 border-indigo-200'
                    }`}>
                      <p className={`font-bold mb-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>{ats}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>{hint}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                Analiza un CV primero para ver la guía
              </p>
            </div>
          )}

          <div className={`p-5 rounded-2xl border-l-4 border-blue-500 ${
            darkMode ? 'bg-blue-900/20' : 'bg-blue-50'
          }`}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
              <strong>💡 Tip Pro:</strong> Inspecciona la URL de la página de carreras antes de aplicar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// OnboardingModal
export function OnboardingModal({ darkMode, onClose }) {
  return (
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
          <h2 className={`text-4xl font-black mb-4 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
            ¡Bienvenido a ResumeScore! 🎉
          </h2>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
            Tu asistente inteligente para optimizar CVs
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {[
            { emoji: '📄', title: '1. Sube tu CV', desc: 'PDF o DOCX' },
            { emoji: '💼', title: '2. Pega el Job Description', desc: 'Texto o archivo PDF/DOCX' },
            { emoji: '🤖', title: '3. Obtén análisis con IA', desc: 'Scores y recomendaciones en 15 segundos' }
          ].map((step, i) => (
            <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl ${
              darkMode ? 'bg-gray-700' : `bg-${['blue', 'indigo', 'purple'][i]}-50`
            }`}>
              <span className="text-3xl">{step.emoji}</span>
              <div>
                <p className={`font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>{step.title}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl"
        >
          ¡Empezar ahora! 🚀
        </button>
      </div>
    </div>
  );
}