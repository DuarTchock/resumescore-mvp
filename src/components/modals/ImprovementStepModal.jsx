// src/components/modals/ImprovementStepModal.jsx - MEJORADO CON EJEMPLOS COPIABLES
import { useState } from 'react';
import { motion } from 'framer-motion';

export function ImprovementStepModal({ step, keywords, darkMode, onClose }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  if (!step) return null;

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Determinar qué keywords mostrar según el paso
  const getRelevantKeywords = () => {
    if (!step.keywords || step.keywords.length === 0) {
      const stepText = step.action.toLowerCase();
      
      if (stepText.includes('keyword') || stepText.includes('técnica')) {
        return {
          title: '🎯 Keywords Técnicas Faltantes Críticas',
          items: keywords?.technical?.missing || []
        };
      } else if (stepText.includes('soft skill')) {
        return {
          title: '💪 Soft Skills Faltantes',
          items: keywords?.soft?.missing || []
        };
      } else if (stepText.includes('industria')) {
        return {
          title: '🏢 Keywords de Industria Faltantes',
          items: keywords?.industry?.missing || []
        };
      }
      return null;
    }
    
    return {
      title: '🎯 Keywords a Agregar',
      items: step.keywords
    };
  };

  const relevantKeywords = getRelevantKeywords();

  // Verificar si tiene detailedExamples
  const hasDetailedExamples = step.detailedExamples && (
    step.detailedExamples.direct || 
    step.detailedExamples.indirect || 
    step.detailedExamples.noExperience
  );

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
        <div className="sticky top-0 p-6 border-b backdrop-blur-xl bg-opacity-95 z-10 flex items-center justify-between"
             style={{ background: darkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                Detalles del Paso de Mejora
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                Impacto: {step.impact} • Tiempo: {step.timeframe}
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Acción */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-5 rounded-2xl border ${
              darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">🎯</span>
              <div>
                <h4 className={`font-bold mb-2 ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                  Acción Requerida
                </h4>
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                  {step.action}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Impacto y Tiempo */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">📈</span>
                <span className={`text-xs font-semibold uppercase ${
                  darkMode ? 'text-green-400' : 'text-green-700'
                }`}>
                  Impacto
                </span>
              </div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                {step.impact}
              </p>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">⏱️</span>
                <span className={`text-xs font-semibold uppercase ${
                  darkMode ? 'text-purple-400' : 'text-purple-700'
                }`}>
                  Tiempo Estimado
                </span>
              </div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                {step.timeframe}
              </p>
            </div>
          </motion.div>

          {/* EJEMPLOS DETALLADOS CON CONTEXTO */}
          {hasDetailedExamples && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Contexto */}
              {step.detailedExamples.context && (
                <div className={`p-5 rounded-2xl border ${
                  darkMode ? 'bg-indigo-900/20 border-indigo-700' : 'bg-indigo-50 border-indigo-200'
                }`}>
                  <h4 className={`font-bold mb-3 flex items-center gap-2 ${
                    darkMode ? 'text-indigo-200' : 'text-indigo-900'
                  }`}>
                    <span>💡</span> Ejemplo Adaptado a TU Job Description
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>
                        📌 El JD menciona:
                      </p>
                      <p className={`pl-4 italic mt-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                        "{step.detailedExamples.context.jdMentions}"
                      </p>
                    </div>
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>
                        🔍 Tu CV actual muestra:
                      </p>
                      <p className={`pl-4 italic mt-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                        "{step.detailedExamples.context.cvShows}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className={`p-5 rounded-2xl border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <h4 className={`font-bold mb-4 text-center ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                  📝 EJEMPLOS COPIABLES - Elige el que mejor se adapte a tu experiencia
                </h4>
                
                {/* Ejemplos con experiencia directa */}
                {step.detailedExamples.direct && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                        ✅ {step.detailedExamples.direct.title || "Si tienes experiencia directa:"}
                      </h5>
                    </div>
                    <div className={`space-y-3 p-4 rounded-xl ${
                      darkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                      {(Array.isArray(step.detailedExamples.direct.bullets) 
                        ? step.detailedExamples.direct.bullets 
                        : [step.detailedExamples.direct]
                      ).map((bullet, i) => {
                        const text = typeof bullet === 'string' ? bullet : bullet.text || bullet;
                        return (
                          <div key={i} className="group relative">
                            <div className={`flex items-start gap-2 p-3 rounded-lg transition-colors ${
                              darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                            }`}>
                              <span className="text-green-500 mt-1 flex-shrink-0">•</span>
                              <p className={`flex-1 text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                                {text}
                              </p>
                              <button
                                onClick={() => copyToClipboard(text, `direct-${i}`)}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  copiedIndex === `direct-${i}`
                                    ? 'bg-green-500 text-white'
                                    : darkMode 
                                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }`}
                              >
                                {copiedIndex === `direct-${i}` ? '✓ Copiado!' : '📋 Copiar'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Ejemplos con experiencia indirecta */}
                {step.detailedExamples.indirect && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className={`font-semibold ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        ⚡ {step.detailedExamples.indirect.title || "Si tienes experiencia indirecta:"}
                      </h5>
                    </div>
                    <div className={`space-y-3 p-4 rounded-xl ${
                      darkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                      {(Array.isArray(step.detailedExamples.indirect.bullets)
                        ? step.detailedExamples.indirect.bullets
                        : [step.detailedExamples.indirect]
                      ).map((bullet, i) => {
                        const text = typeof bullet === 'string' ? bullet : bullet.text || bullet;
                        return (
                          <div key={i} className="group relative">
                            <div className={`flex items-start gap-2 p-3 rounded-lg transition-colors ${
                              darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                            }`}>
                              <span className="text-yellow-500 mt-1 flex-shrink-0">•</span>
                              <p className={`flex-1 text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                                {text}
                              </p>
                              <button
                                onClick={() => copyToClipboard(text, `indirect-${i}`)}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  copiedIndex === `indirect-${i}`
                                    ? 'bg-green-500 text-white'
                                    : darkMode 
                                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }`}
                              >
                                {copiedIndex === `indirect-${i}` ? '✓ Copiado!' : '📋 Copiar'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sin experiencia */}
                {step.detailedExamples.noExperience && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                        🎓 {step.detailedExamples.noExperience.title || "Si no tienes experiencia directa:"}
                      </h5>
                    </div>
                    <div className={`space-y-3 p-4 rounded-xl ${
                      darkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                      {(Array.isArray(step.detailedExamples.noExperience.bullets)
                        ? step.detailedExamples.noExperience.bullets
                        : [step.detailedExamples.noExperience]
                      ).map((bullet, i) => {
                        const text = typeof bullet === 'string' ? bullet : bullet.text || bullet;
                        return (
                          <div key={i} className="group relative">
                            <div className={`flex items-start gap-2 p-3 rounded-lg transition-colors ${
                              darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                            }`}>
                              <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
                              <p className={`flex-1 text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                                {text}
                              </p>
                              <button
                                onClick={() => copyToClipboard(text, `noExp-${i}`)}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  copiedIndex === `noExp-${i}`
                                    ? 'bg-green-500 text-white'
                                    : darkMode 
                                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }`}
                              >
                                {copiedIndex === `noExp-${i}` ? '✓ Copiado!' : '📋 Copiar'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pro Tip */}
                {step.detailedExamples.proTip && (
                  <div className={`mt-4 p-4 rounded-xl border ${
                    darkMode ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'
                  }`}>
                    <h5 className={`font-semibold mb-2 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                      💡 TIP PRO
                    </h5>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                      {step.detailedExamples.proTip}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Keywords Específicas */}
          {relevantKeywords && relevantKeywords.items && relevantKeywords.items.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`p-5 rounded-2xl border ${
                darkMode ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200'
              }`}
            >
              <h4 className={`font-bold mb-4 flex items-center gap-2 ${
                darkMode ? 'text-orange-200' : 'text-orange-900'
              }`}>
                {relevantKeywords.title}
              </h4>
              <div className="flex flex-wrap gap-2">
                {relevantKeywords.items.map((keyword, i) => (
                  <span
                    key={i}
                    className={`px-4 py-2 rounded-full font-medium text-sm ${
                      darkMode 
                        ? 'bg-orange-800 text-orange-200 border border-orange-600' 
                        : 'bg-orange-100 text-orange-800 border border-orange-300'
                    }`}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              <p className={`text-sm mt-4 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                💡 <strong>Tip:</strong> Incorpora estas keywords de forma natural en tu CV, 
                especialmente en la sección de experiencia y skills.
              </p>
            </motion.div>
          )}

          {/* Cómo implementar */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`p-5 rounded-2xl border ${
              darkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <h4 className={`font-bold mb-3 flex items-center gap-2 ${
              darkMode ? 'text-gray-200' : 'text-slate-800'
            }`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cómo Implementar
            </h4>
            <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Revisa tu CV actual e identifica dónde puedes agregar estas mejoras</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Usa los ejemplos copiables como base y adáptalos a TU experiencia real</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Incluye métricas cuantificables: números, porcentajes, tiempo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Mantén un tono profesional y relevante para el puesto</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Verifica que el formato sea compatible con ATS (sin tablas complejas)</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${
          darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            onClick={onClose}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Entendido, aplicar mejora
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}