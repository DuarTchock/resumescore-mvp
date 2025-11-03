// src/components/sections/SectionScores.jsx
import { getScoreGradient } from '../../utils/helpers';
import { Tooltip } from '../ui/Tooltip';

export function SectionScores({ sectionScores, darkMode }) {
  if (!sectionScores || Object.keys(sectionScores).length === 0) return null;

  const getSectionName = (section) => {
    const names = {
      experience: '💼 Experiencia',
      education: '🎓 Educación',
      skills: '🛠️ Skills',
      summary: '📝 Resumen',
      certifications: '📜 Certificaciones',
      projects: '🚀 Proyectos'
    };
    return names[section] || section;
  };

  return (
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
        {Object.entries(sectionScores).map(([section, score]) => (
          <div key={section} className="group">
            <div className="flex items-center justify-between mb-2">
              <Tooltip text={`Esta sección tiene un score de ${score}%`}>
                <span className={`text-sm font-bold capitalize cursor-help ${
                  darkMode ? 'text-gray-300' : 'text-slate-700'
                }`}>
                  {getSectionName(section)}
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
                className={`h-full rounded-full transition-all duration-1000 ${getScoreGradient(score)}`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// src/components/sections/Recommendations.jsx
import { getPriorityColor, getPriorityIcon } from '../../utils/helpers';

export function Recommendations({ recommendations, darkMode }) {
  if (!recommendations || recommendations.length === 0) return null;

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
            {recommendations.length} acciones para mejorar tu CV
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {recommendations.map((rec, i) => {
          const text = typeof rec === 'string' ? rec : rec.text;
          const priority = typeof rec === 'object' ? rec.priority : 'normal';
          const section = typeof rec === 'object' && rec.section ? rec.section : '';
          const example = typeof rec === 'object' && rec.example ? rec.example : '';
          
          return (
            <div key={i} className={`p-5 rounded-2xl border-2 transition-all hover:scale-[1.02] ${
              getPriorityColor(priority, darkMode)
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
}