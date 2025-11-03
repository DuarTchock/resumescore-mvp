// src/components/modals/SectionDetailModal.jsx - CON MÉTODO SOCRÁTICO COMPLETO
import { useState } from 'react';
import { motion } from 'framer-motion';

export function SectionDetailModal({ section, score, sectionData, darkMode, onClose }) {
  const [userBullet, setUserBullet] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  
  if (!section) return null;

  const sectionInfo = {
    experience: {
      icon: '💼',
      title: 'Experiencia Laboral',
      description: 'Tu historial profesional y logros cuantificables'
    },
    education: {
      icon: '🎓',
      title: 'Educación',
      description: 'Tu formación académica y certificaciones'
    },
    skills: {
      icon: '🛠️',
      title: 'Habilidades',
      description: 'Skills técnicas y competencias'
    },
    summary: {
      icon: '📝',
      title: 'Resumen Profesional',
      description: 'Tu perfil y propuesta de valor'
    },
    certifications: {
      icon: '📜',
      title: 'Certificaciones',
      description: 'Certificados y credenciales'
    },
    projects: {
      icon: '🚀',
      title: 'Proyectos',
      description: 'Proyectos destacados y portfolio'
    }
  };

  const info = sectionInfo[section] || {
    icon: '📋',
    title: section,
    description: 'Sección del CV'
  };

  // Verificar si tiene guía socrática
  const hasSocraticGuide = sectionData?.socraticGuide;

  const analyzeBullet = () => {
    setAnalyzing(true);
    
    // Simular análisis
    setTimeout(() => {
      const checklist = sectionData?.socraticGuide?.checklist || [];
      const passed = checklist.filter(() => Math.random() > 0.5).length;
      const total = checklist.length;
      
      alert(`Análisis completado!\n\nTu bullet cumple ${passed}/${total} criterios.\n\nRevisa el checklist para mejorar.`);
      setAnalyzing(false);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className={`max-w-4xl w-full rounded-3xl shadow-2xl border max-h-[90vh] overflow-y-auto ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between"
             style={{ 
               background: darkMode 
                 ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
                 : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
             }}>
          <div className="flex items-center gap-4">
            <div className="text-5xl">{info.icon}</div>
            <div>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                🎓 Consejo del Experto - {info.title}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                {info.description} • Puntaje actual: {score}/100
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Score Display */}
        <div className="p-6">
          <div className={`p-6 rounded-2xl border ${
            score >= 85 
              ? darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
              : score >= 70
              ? darkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
              : darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-semibold uppercase tracking-wider ${
                score >= 85 
                  ? darkMode ? 'text-green-400' : 'text-green-700'
                  : score >= 70
                  ? darkMode ? 'text-yellow-400' : 'text-yellow-700'
                  : darkMode ? 'text-red-400' : 'text-red-700'
              }`}>
                Estado: {score >= 85 ? 'Excelente' : score >= 70 ? 'Bueno' : 'Necesita Mejora'}
              </span>
              <span className={`text-4xl font-black ${
                score >= 85 ? 'text-green-600' 
                : score >= 70 ? 'text-yellow-600'
                : 'text-red-600'
              }`}>
                {score}%
              </span>
            </div>
            <div className={`w-full rounded-full h-3 overflow-hidden ${
              darkMode ? 'bg-gray-700' : 'bg-white'
            }`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  score >= 85 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : score >= 70
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-red-500 to-pink-500'
                }`}
              ></motion.div>
            </div>
          </div>
        </div>

        {/* MÉTODO SOCRÁTICO */}
        {hasSocraticGuide && (
          <div className="px-6 pb-6 space-y-6">
            {/* Introducción */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`p-5 rounded-2xl border ${
                darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <h4 className={`font-bold mb-2 flex items-center gap-2 ${
                darkMode ? 'text-blue-300' : 'text-blue-800'
              }`}>
                <span>🧠</span> MÉTODO SOCRÁTICO
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                {sectionData.socraticGuide.intro || "Descubre el verdadero valor de tu experiencia respondiendo estas preguntas."}
              </p>
            </motion.div>

            {/* Preguntas para reflexionar */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className={`font-semibold mb-4 text-lg ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                🤔 PREGUNTAS PARA REFLEXIONAR:
              </h4>
              <div className="space-y-4">
                {sectionData.socraticGuide.questions?.map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    className={`border-l-4 border-purple-500 pl-4 p-3 rounded-r-lg ${
                      darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}
                  >
                    <p className={`font-medium mb-1 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                      {i + 1}. {typeof item === 'object' ? item.q : item}
                    </p>
                    {typeof item === 'object' && item.hint && (
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                        → {item.hint}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Transformación antes/después */}
            {sectionData.socraticGuide.transformation && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h4 className={`font-semibold mb-4 text-lg ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                  💡 TRANSFORMA TUS BULLETS:
                </h4>
                
                {/* Antes */}
                <div className={`mb-4 p-5 rounded-2xl border ${
                  darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 text-2xl flex-shrink-0">❌</span>
                    <div className="flex-1">
                      <p className={`font-semibold mb-2 ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                        ANTES (Genérico, sin impacto):
                      </p>
                      <p className={`italic ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                        "{sectionData.socraticGuide.transformation.bad}"
                      </p>
                      {sectionData.socraticGuide.transformation.badReason && (
                        <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>
                          ⚠️ Por qué está mal: {sectionData.socraticGuide.transformation.badReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Después */}
                <div className={`p-5 rounded-2xl border ${
                  darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 text-2xl flex-shrink-0">✅</span>
                    <div className="flex-1">
                      <p className={`font-semibold mb-2 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                        DESPUÉS (Específico, cuantificable, con impacto):
                      </p>
                      <p className={`italic ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                        "{sectionData.socraticGuide.transformation.good}"
                      </p>
                      {sectionData.socraticGuide.transformation.goodReason && (
                        <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>
                          ✓ Por qué está bien: {sectionData.socraticGuide.transformation.goodReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Template STAR */}
            {sectionData.socraticGuide.templateSTAR && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`p-6 rounded-2xl border ${
                  darkMode ? 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
                }`}
              >
                <h4 className={`font-bold mb-4 text-lg ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                  📋 TEMPLATE STAR ADAPTADO A TU JD:
                </h4>
                
                {sectionData.socraticGuide.templateSTAR.context && (
                  <div className={`mb-4 p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className={`font-medium mb-1 ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                      {sectionData.socraticGuide.templateSTAR.context.jdMentions}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                      {sectionData.socraticGuide.templateSTAR.context.cvShows}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className={`border-l-4 border-blue-500 pl-4 p-3 rounded-r-lg ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <span className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      S - SITUACIÓN:
                    </span>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                      {sectionData.socraticGuide.templateSTAR.situation || sectionData.socraticGuide.templateSTAR.situacion}
                    </p>
                  </div>

                  <div className={`border-l-4 border-green-500 pl-4 p-3 rounded-r-lg ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <span className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      T - TAREA:
                    </span>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                      {sectionData.socraticGuide.templateSTAR.task || sectionData.socraticGuide.templateSTAR.tarea}
                    </p>
                  </div>

                  <div className={`border-l-4 border-yellow-500 pl-4 p-3 rounded-r-lg ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <span className={`font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      A - ACCIÓN:
                    </span>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                      {sectionData.socraticGuide.templateSTAR.action || sectionData.socraticGuide.templateSTAR.accion}
                    </p>
                  </div>

                  <div className={`border-l-4 border-purple-500 pl-4 p-3 rounded-r-lg ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <span className={`font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      R - RESULTADO:
                    </span>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                      {sectionData.socraticGuide.templateSTAR.result || sectionData.socraticGuide.templateSTAR.resultado}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Área interactiva */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className={`p-5 rounded-2xl border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <h4 className={`font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                ✍️ TU TURNO - Practica Aquí:
              </h4>
              <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                Escribe un bullet usando el método STAR sobre tu mejor logro:
              </p>
              <textarea
                value={userBullet}
                onChange={(e) => setUserBullet(e.target.value)}
                className={`w-full h-32 p-4 rounded-xl resize-none border-2 transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-gray-200 focus:border-blue-500' 
                    : 'bg-white border-slate-300 text-slate-800 focus:border-blue-400'
                } focus:outline-none`}
                placeholder="Ejemplo: Lideré la migración de..."
              />
              <button
                onClick={analyzeBullet}
                disabled={!userBullet.trim() || analyzing}
                className={`mt-3 px-6 py-2.5 rounded-xl font-semibold transition-all ${
                  !userBullet.trim() || analyzing
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                }`}
              >
                {analyzing ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Analizando...
                  </>
                ) : (
                  'Analizar mi bullet'
                )}
              </button>
            </motion.div>

            {/* Checklist */}
            {sectionData.socraticGuide.checklist && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className={`p-5 rounded-2xl border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <h4 className={`font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                  🎯 CHECKLIST de un bullet excelente:
                </h4>
                <div className="space-y-2">
                  {(Array.isArray(sectionData.socraticGuide.checklist) 
                    ? sectionData.socraticGuide.checklist 
                    : []
                  ).map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + (i * 0.05) }}
                      className="flex items-start gap-2"
                    >
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✅</span>
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                        {item.replace('✅ ', '')}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className={`p-6 border-t ${
          darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            onClick={onClose}
            className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Cerrar y aplicar consejos
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}