// src/components/modals/AllModals.jsx - CORREGIDO
import { useState } from 'react';

// ============================================
// MODAL DE DETALLES DE ATS - CON EJEMPLOS
// ============================================
export function ATSDetailModal({ selectedATS, atsBreakdown, scores, darkMode, onClose }) {
  if (!selectedATS) return null;

  const details = atsBreakdown?.[selectedATS];
  const score = scores?.[selectedATS];

  if (!details) {
    return (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div className={`max-w-2xl w-full rounded-3xl shadow-2xl border p-8 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
        }`}>
          <p className={darkMode ? 'text-gray-300' : 'text-slate-700'}>
            No hay información disponible para este ATS
          </p>
        </div>
      </div>
    );
  }

  const scoreColor = score >= 85 ? 'green' : score >= 70 ? 'yellow' : 'red';
  const scoreGradient = score >= 85 
    ? 'from-green-500 to-emerald-500' 
    : score >= 70 
    ? 'from-yellow-500 to-orange-500' 
    : 'from-red-500 to-pink-500';

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className={`max-w-4xl w-full rounded-3xl shadow-2xl border max-h-[90vh] overflow-y-auto ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 p-6 border-b backdrop-blur-xl bg-opacity-95 z-10 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${scoreGradient} rounded-2xl flex items-center justify-center`}>
                <span className="text-3xl font-black text-white">{score}</span>
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                  {selectedATS}
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                  Análisis detallado de compatibilidad
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

          {/* Progress bar */}
          <div className="mt-4">
            <div className={`w-full rounded-full h-3 overflow-hidden ${
              darkMode ? 'bg-gray-700' : 'bg-slate-200'
            }`}>
              <div
                className={`h-full bg-gradient-to-r ${scoreGradient} transition-all duration-1000`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Fortalezas */}
          <div className={`p-5 rounded-2xl border ${
            darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
          }`}>
            <h4 className={`font-bold mb-3 flex items-center gap-2 ${
              darkMode ? 'text-green-400' : 'text-green-700'
            }`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Fortalezas Detectadas
            </h4>
            <ul className="space-y-2">
              {details.strengths?.map((strength, i) => (
                <li key={i} className={`flex items-start gap-2 text-sm ${
                  darkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Debilidades */}
          <div className={`p-5 rounded-2xl border ${
            darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
          }`}>
            <h4 className={`font-bold mb-3 flex items-center gap-2 ${
              darkMode ? 'text-red-400' : 'text-red-700'
            }`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Áreas de Mejora
            </h4>
            <ul className="space-y-2">
              {details.weaknesses?.map((weakness, i) => (
                <li key={i} className={`flex items-start gap-2 text-sm ${
                  darkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tips con Ejemplos - 🔥 CORREGIDO */}
          <div className={`p-5 rounded-2xl border ${
            darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
          }`}>
            <h4 className={`font-bold mb-4 flex items-center gap-2 ${
              darkMode ? 'text-blue-400' : 'text-blue-700'
            }`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Tips Específicos para {selectedATS}
            </h4>
            <div className="space-y-4">
              {details.tips?.map((tipItem, i) => {
                // 🔥 FIX: tipItem puede ser un objeto {tip, example, why} o un string
                const tipText = typeof tipItem === 'object' ? tipItem.tip : tipItem;
                const tipExample = typeof tipItem === 'object' ? tipItem.example : null;
                const tipWhy = typeof tipItem === 'object' ? tipItem.why : null;
                
                return (
                  <div key={i} className={`p-4 rounded-xl ${
                    darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                  }`}>
                    <p className={`font-medium mb-2 ${
                      darkMode ? 'text-blue-200' : 'text-blue-900'
                    }`}>
                      {i + 1}. {tipText}
                    </p>
                    
                    {tipWhy && (
                      <p className={`text-xs mb-3 ${
                        darkMode ? 'text-blue-300' : 'text-blue-700'
                      }`}>
                        <strong>Por qué:</strong> {tipWhy}
                      </p>
                    )}
                    
                    {tipExample && (
                      <div className={`mt-3 p-3 rounded-lg border ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-200'
                      }`}>
                        <p className={`text-xs font-semibold mb-2 ${
                          darkMode ? 'text-gray-400' : 'text-slate-600'
                        }`}>
                          📝 Ejemplo:
                        </p>
                        <pre className={`text-sm whitespace-pre-wrap font-mono ${
                          darkMode ? 'text-gray-300' : 'text-slate-700'
                        }`}>{tipExample}</pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MODAL DE RECOMENDACIONES
// ============================================
export function Recommendations({ recommendations, darkMode }) {
  if (!recommendations || recommendations.length === 0) return null;

  const criticalRecs = recommendations.filter(r => r.priority === 'critical');
  const importantRecs = recommendations.filter(r => r.priority === 'important');
  const optionalRecs = recommendations.filter(r => r.priority === 'optional');

  return (
    <div className={`rounded-3xl shadow-xl border p-8 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
            💡 Recomendaciones Priorizadas
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
            {recommendations.length} mejoras sugeridas ordenadas por impacto
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Critical */}
        {criticalRecs.length > 0 && (
          <div>
            <h3 className={`font-bold mb-3 flex items-center gap-2 ${
              darkMode ? 'text-red-400' : 'text-red-700'
            }`}>
              🔴 Críticas ({criticalRecs.length})
            </h3>
            <div className="space-y-3">
              {criticalRecs.map((rec, i) => (
                <div key={i} className={`p-4 rounded-xl border-l-4 border-red-500 ${
                  darkMode ? 'bg-red-900/20' : 'bg-red-50'
                }`}>
                  <p className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                    {rec.text}
                  </p>
                  {rec.example && (
                    <div className={`mt-2 p-3 rounded-lg ${
                      darkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                      <p className={`text-xs font-semibold mb-1 ${
                        darkMode ? 'text-gray-400' : 'text-slate-600'
                      }`}>
                        💡 Ejemplo:
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                        {rec.example}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Important */}
        {importantRecs.length > 0 && (
          <div>
            <h3 className={`font-bold mb-3 flex items-center gap-2 ${
              darkMode ? 'text-yellow-400' : 'text-yellow-700'
            }`}>
              🟡 Importantes ({importantRecs.length})
            </h3>
            <div className="space-y-3">
              {importantRecs.map((rec, i) => (
                <div key={i} className={`p-4 rounded-xl border-l-4 border-yellow-500 ${
                  darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'
                }`}>
                  <p className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                    {rec.text}
                  </p>
                  {rec.example && (
                    <div className={`mt-2 p-3 rounded-lg ${
                      darkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                      <p className={`text-xs font-semibold mb-1 ${
                        darkMode ? 'text-gray-400' : 'text-slate-600'
                      }`}>
                        💡 Ejemplo:
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                        {rec.example}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optional */}
        {optionalRecs.length > 0 && (
          <div>
            <h3 className={`font-bold mb-3 flex items-center gap-2 ${
              darkMode ? 'text-blue-400' : 'text-blue-700'
            }`}>
              🔵 Opcionales ({optionalRecs.length})
            </h3>
            <div className="space-y-3">
              {optionalRecs.map((rec, i) => (
                <div key={i} className={`p-4 rounded-xl border-l-4 border-blue-500 ${
                  darkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                }`}>
                  <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                    {rec.text}
                  </p>
                  {rec.example && (
                    <div className={`mt-2 p-3 rounded-lg ${
                      darkMode ? 'bg-gray-800' : 'bg-white'
                    }`}>
                      <p className={`text-xs font-semibold mb-1 ${
                        darkMode ? 'text-gray-400' : 'text-slate-600'
                      }`}>
                        💡 Ejemplo:
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                        {rec.example}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Otros modals existentes...
export function ExportModal({ darkMode, onClose }) {
  return null; // Implementación existente
}

export function LegalModal({ darkMode, onClose }) {
  return null; // Implementación existente
}

export function ATSGuideModal({ results, darkMode, onClose }) {
  return null; // Implementación existente
}

export function OnboardingModal({ darkMode, onClose }) {
  return null; // Implementación existente
}