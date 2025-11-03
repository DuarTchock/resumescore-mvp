// src/components/modals/AllModals.jsx - VERSIÓN MEJORADA
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

  // Generar ejemplos para cada tip
  const getTipWithExample = (tip) => {
    const examples = {
      'bullets': {
        tip: 'Usa bullets con formato • al inicio',
        example: '• Lideré equipo de 8 desarrolladores aumentando productividad 40%\n• Implementé arquitectura microservicios reduciendo costos 25%'
      },
      'certificaciones': {
        tip: 'Agrega sección de Certificaciones',
        example: 'CERTIFICATIONS\n• AWS Solutions Architect Associate (2024)\n• Google Cloud Professional (2023)'
      },
      'summary': {
        tip: 'Agrega summary de 3-4 líneas al inicio',
        example: 'Senior Full-Stack Developer con 8+ años optimizando aplicaciones web. Experto en React, Node.js y AWS. Historial comprobado aumentando conversión 45% y reduciendo tiempo de carga 60%.'
      },
      'fechas': {
        tip: 'Usa formato MM/YYYY consistente',
        example: 'Senior Developer | TechCorp\n01/2020 - Presente'
      },
      'linkedin': {
        tip: 'Agrega URL de LinkedIn y portfolio',
        example: 'linkedin.com/in/tu-nombre | github.com/tu-usuario'
      },
      'keywords': {
        tip: 'Repite keywords del JD naturalmente',
        example: 'Desarrollé soluciones de cloud computing usando AWS, implementando CI/CD pipelines con Jenkins y Docker para deployment automatizado.'
      },
      'métricas': {
        tip: 'Cuantifica logros con métricas',
        example: '• Aumenté conversión de ventas 34% implementando A/B testing\n• Reduje tiempo de respuesta 2.3s a 0.8s optimizando queries'
      }
    };

    // Buscar qué tipo de tip es
    const tipLower = tip.toLowerCase();
    for (const [key, data] of Object.entries(examples)) {
      if (tipLower.includes(key) || tipLower.includes(data.tip.toLowerCase().split(' ')[1])) {
        return { tip, example: data.example };
      }
    }

    return { tip, example: null };
  };

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
                  Análisis detallado del ATS
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

          {/* Tips con Ejemplos */}
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
              {details.tips?.map((tip, i) => {
                const tipData = getTipWithExample(tip);
                return (
                  <div key={i} className={`p-4 rounded-xl ${
                    darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                  }`}>
                    <p className={`font-medium mb-2 ${
                      darkMode ? 'text-blue-200' : 'text-blue-900'
                    }`}>
                      {i + 1}. {tipData.tip}
                    </p>
                    {tipData.example && (
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
                        }`}>{tipData.example}</pre>
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
// RECOMENDACIONES ORDENADAS Y AGRUPADAS
// ============================================
export function Recommendations({ recommendations, darkMode }) {
  if (!recommendations || recommendations.length === 0) return null;

  // Agrupar y ordenar recomendaciones por prioridad
  const groupedRecs = {
    critical: [],
    important: [],
    normal: []
  };

  recommendations.forEach(rec => {
    const priority = typeof rec === 'object' ? rec.priority : 'normal';
    if (groupedRecs[priority]) {
      groupedRecs[priority].push(rec);
    } else {
      groupedRecs.normal.push(rec);
    }
  });

  const priorityInfo = {
    critical: {
      label: 'CRÍTICAS',
      icon: '🔴',
      emoji: '🔴',
      bgClass: darkMode ? 'bg-red-900/10 border-red-800' : 'bg-red-50 border-red-200',
      textClass: darkMode ? 'text-red-400' : 'text-red-700'
    },
    important: {
      label: 'IMPORTANTES',
      icon: '🟡',
      emoji: '🟡',
      bgClass: darkMode ? 'bg-yellow-900/10 border-yellow-800' : 'bg-yellow-50 border-yellow-200',
      textClass: darkMode ? 'text-yellow-400' : 'text-yellow-700'
    },
    normal: {
      label: 'OPCIONALES',
      icon: '🟢',
      emoji: '🟢',
      bgClass: darkMode ? 'bg-green-900/10 border-green-800' : 'bg-green-50 border-green-200',
      textClass: darkMode ? 'text-green-400' : 'text-green-700'
    }
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

  return (
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
            {recommendations.length} acciones organizadas por impacto
          </p>
        </div>
      </div>
      
      {/* Render por prioridad */}
      <div className="space-y-8">
        {Object.entries(groupedRecs).map(([priority, recs]) => {
          if (recs.length === 0) return null;
          
          const info = priorityInfo[priority];
          
          return (
            <div key={priority} className={`p-5 rounded-2xl border ${info.bgClass}`}>
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${info.textClass}`}>
                <span className="text-2xl">{info.icon}</span>
                {info.label} ({recs.length})
              </h3>
              
              <div className="space-y-4">
                {recs.map((rec, i) => {
                  const text = typeof rec === 'string' ? rec : rec.text;
                  const section = typeof rec === 'object' && rec.section ? rec.section : '';
                  const example = typeof rec === 'object' && rec.example ? rec.example : '';
                  
                  return (
                    <div key={i} className={`p-5 rounded-2xl border-2 transition-all hover:scale-[1.01] ${
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
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// EXPORT, LEGAL, ATS GUIDE, ONBOARDING MODALS
// ============================================

export function ExportModal({ darkMode, onClose, onExport }) {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`max-w-md w-full rounded-3xl shadow-2xl border p-8 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
          📄 Exportar Reporte
        </h3>
        <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
          Descarga un reporte completo con todos los análisis y recomendaciones
        </p>
        <div className="space-y-3">
          <button
            onClick={onExport}
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Descargar Reporte TXT
          </button>
          <button
            onClick={onClose}
            className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-slate-100 hover:bg-slate-200'
            }`}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export function LegalModal({ darkMode, onClose }) {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`max-w-4xl w-full rounded-3xl shadow-2xl border max-h-[90vh] overflow-y-auto ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <h3 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
            ⚖️ Legal y Privacidad
          </h3>
          
          <div className="space-y-6">
            <section>
              <h4 className={`text-xl font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                Política de Privacidad
              </h4>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                Tu privacidad es importante. No almacenamos tu CV ni información personal. Todo el procesamiento se realiza en tiempo real y los datos se eliminan inmediatamente después del análisis.
              </p>
            </section>

            <section>
              <h4 className={`text-xl font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                Deslinde de Responsabilidad
              </h4>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                ResumeScore es una herramienta de asistencia. No garantizamos resultados de contratación específicos. El análisis es orientativo y debe complementarse con revisión manual y consultoría profesional.
              </p>
            </section>

            <section>
              <h4 className={`text-xl font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                Uso del Servicio
              </h4>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                Al usar ResumeScore, aceptas que el servicio es "tal cual" y te comprometes a usarlo de manera responsable y ética.
              </p>
            </section>
          </div>

          <button
            onClick={onClose}
            className="mt-8 w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

export function ATSGuideModal({ results, darkMode, onClose }) {
  const guide = results?.atsDetectionGuide;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`max-w-4xl w-full rounded-3xl shadow-2xl border max-h-[90vh] overflow-y-auto ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <h3 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
            🔍 Guía para Identificar ATS
          </h3>
          
          {guide ? (
            <div className="space-y-6">
              <section>
                <h4 className={`text-xl font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                  Indicadores de ATS
                </h4>
                <ul className="space-y-2">
                  {guide.indicators?.map((indicator, i) => (
                    <li key={i} className={`flex items-start gap-2 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                      <span className="text-blue-500">→</span>
                      <span>{indicator}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h4 className={`text-xl font-bold mb-3 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                  Tips de Detección
                </h4>
                <ul className="space-y-2">
                  {guide.detectionTips?.map((tip, i) => (
                    <li key={i} className={`flex items-start gap-2 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                      <span className="text-green-500">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          ) : (
            <p className={darkMode ? 'text-gray-400' : 'text-slate-600'}>
              No hay guía disponible. Realiza un análisis primero.
            </p>
          )}

          <button
            onClick={onClose}
            className="mt-8 w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export function OnboardingModal({ darkMode, onClose }) {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`max-w-2xl w-full rounded-3xl shadow-2xl border p-8 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
          👋 Bienvenido a ResumeScore
        </h3>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-4">
            <span className="text-3xl">1️⃣</span>
            <div>
              <h4 className={`font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                Sube tu CV
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                Formatos aceptados: PDF o DOCX
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="text-3xl">2️⃣</span>
            <div>
              <h4 className={`font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                Pega la descripción del trabajo
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                Copia el JD completo de la vacante
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="text-3xl">3️⃣</span>
            <div>
              <h4 className={`font-bold mb-1 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                Obtén tu análisis
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                Recibe recomendaciones personalizadas
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          ¡Comenzar!
        </button>
      </div>
    </div>
  );
}