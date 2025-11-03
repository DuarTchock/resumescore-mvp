// src/components/modals/SectionDetailModal.jsx
export function SectionDetailModal({ section, score, analysis, darkMode, onClose }) {
  if (!section) return null;

  const sectionInfo = {
    experience: {
      icon: '💼',
      title: 'Experiencia Laboral',
      description: 'Tu historial profesional y logros'
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

  // Generar análisis específico basado en el score
  const getAnalysis = () => {
    if (score >= 85) {
      return {
        status: 'Excelente',
        color: 'green',
        strengths: [
          'Contenido bien estructurado y completo',
          'Información relevante para el puesto',
          'Formato compatible con ATS'
        ],
        improvements: [
          'Considera agregar métricas adicionales',
          'Verifica que las fechas estén actualizadas'
        ]
      };
    } else if (score >= 70) {
      return {
        status: 'Bueno',
        color: 'yellow',
        strengths: [
          'Base sólida de información',
          'Estructura adecuada'
        ],
        improvements: [
          'Agrega más detalles específicos',
          'Incluye logros cuantificables',
          'Optimiza keywords para esta sección'
        ]
      };
    } else {
      return {
        status: 'Necesita Mejora',
        color: 'red',
        strengths: [
          'Información básica presente'
        ],
        improvements: [
          'Expande el contenido significativamente',
          'Agrega ejemplos concretos y métricas',
          'Revisa el formato y estructura',
          'Incluye keywords críticas del JD'
        ]
      };
    }
  };

  const sectionAnalysis = getAnalysis();

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`max-w-2xl w-full rounded-3xl shadow-2xl border max-h-[90vh] overflow-y-auto ${
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
                {info.title}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                {info.description}
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
            sectionAnalysis.color === 'green' 
              ? darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
              : sectionAnalysis.color === 'yellow'
              ? darkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
              : darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm font-semibold uppercase tracking-wider ${
                sectionAnalysis.color === 'green' 
                  ? darkMode ? 'text-green-400' : 'text-green-700'
                  : sectionAnalysis.color === 'yellow'
                  ? darkMode ? 'text-yellow-400' : 'text-yellow-700'
                  : darkMode ? 'text-red-400' : 'text-red-700'
              }`}>
                Estado: {sectionAnalysis.status}
              </span>
              <span className={`text-4xl font-black ${
                sectionAnalysis.color === 'green' ? 'text-green-600' 
                : sectionAnalysis.color === 'yellow' ? 'text-yellow-600'
                : 'text-red-600'
              }`}>
                {score}%
              </span>
            </div>
            <div className={`w-full rounded-full h-3 overflow-hidden ${
              darkMode ? 'bg-gray-700' : 'bg-white'
            }`}>
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  sectionAnalysis.color === 'green' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : sectionAnalysis.color === 'yellow'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-red-500 to-pink-500'
                }`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Análisis */}
        <div className="px-6 pb-6 space-y-6">
          {/* Fortalezas */}
          <div className={`p-5 rounded-2xl border ${
            darkMode ? 'bg-green-900/10 border-green-800' : 'bg-green-50 border-green-200'
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
              {sectionAnalysis.strengths.map((strength, i) => (
                <li key={i} className={`flex items-start gap-2 text-sm ${
                  darkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Áreas de Mejora */}
          <div className={`p-5 rounded-2xl border ${
            darkMode ? 'bg-orange-900/10 border-orange-800' : 'bg-orange-50 border-orange-200'
          }`}>
            <h4 className={`font-bold mb-3 flex items-center gap-2 ${
              darkMode ? 'text-orange-400' : 'text-orange-700'
            }`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Áreas de Mejora
            </h4>
            <ul className="space-y-2">
              {sectionAnalysis.improvements.map((improvement, i) => (
                <li key={i} className={`flex items-start gap-2 text-sm ${
                  darkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  <span className="text-orange-500 mt-0.5">→</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recomendación Específica */}
          <div className={`p-5 rounded-2xl border ${
            darkMode ? 'bg-blue-900/10 border-blue-800' : 'bg-blue-50 border-blue-200'
          }`}>
            <h4 className={`font-bold mb-3 flex items-center gap-2 ${
              darkMode ? 'text-blue-400' : 'text-blue-700'
            }`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Consejo del Experto
            </h4>
            <p className={`text-sm leading-relaxed ${
              darkMode ? 'text-gray-300' : 'text-slate-700'
            }`}>
              {section === 'experience' && 
                'Usa el método STAR (Situación, Tarea, Acción, Resultado) para describir tus logros. Incluye números y porcentajes siempre que sea posible.'}
              {section === 'education' && 
                'Menciona tu GPA si es >3.5, incluye cursos relevantes y proyectos académicos destacados. Las certificaciones recientes son muy valoradas.'}
              {section === 'skills' && 
                'Organiza tus skills por categorías (Frontend, Backend, Tools, etc.) y nivel de dominio. Prioriza las mencionadas en el JD.'}
              {section === 'summary' && 
                'Crea un elevator pitch de 3-4 líneas que capture tu propuesta única de valor. Debe responder: quién eres, qué haces mejor, y qué buscas.'}
              {!['experience', 'education', 'skills', 'summary'].includes(section) &&
                'Asegúrate de que esta sección agregue valor real al CV y esté optimizada con keywords relevantes del Job Description.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${
          darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            onClick={onClose}
            className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Cerrar y aplicar mejoras
          </button>
        </div>
      </div>
    </div>
  );
}