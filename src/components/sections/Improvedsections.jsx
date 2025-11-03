// src/components/sections/ImprovementPath.jsx - MEJORADO CON MODALS
import { useState } from 'react';
import { ImprovementStepModal } from '../modals/ImprovementStepModal';

export function ImprovementPath({ improvementPath, keywords, darkMode }) {
  const [selectedStep, setSelectedStep] = useState(null);
  
  if (!improvementPath || !improvementPath.steps || improvementPath.steps.length === 0) {
    return null;
  }

  const { current, potential, steps } = improvementPath;
  const gain = potential - current;

  return (
    <>
      <div className={`rounded-3xl shadow-xl border p-8 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
              🎯 Tu Ruta de Mejora
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
              {steps.length} pasos para maximizar tu score
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
              Score Actual
            </span>
            <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
              Potencial con Optimizaciones
            </span>
          </div>
          
          <div className={`relative w-full rounded-full h-6 overflow-hidden ${
            darkMode ? 'bg-gray-700' : 'bg-slate-200'
          }`}>
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-1000 flex items-center justify-end pr-3"
              style={{ width: `${current}%` }}
            >
              <span className="text-xs font-bold text-white">{current}%</span>
            </div>
            <div
              className="absolute top-0 h-full border-r-4 border-green-500 flex items-center"
              style={{ left: `${potential}%` }}
            >
              <span className="absolute -top-8 -right-8 text-sm font-bold text-green-600">
                {potential}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-center mt-4">
            <div className={`px-4 py-2 rounded-full ${
              darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
            }`}>
              <span className="text-sm font-bold">
                +{gain}% de mejora potencial
              </span>
            </div>
          </div>
        </div>

        {/* Steps - Clickeable */}
        <div className="space-y-3">
          <p className={`text-sm font-semibold mb-4 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
            💡 Haz clic en cada paso para ver los detalles y ejemplos
          </p>
          
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => setSelectedStep({ ...step, index: i })}
              className={`w-full p-5 rounded-2xl border-2 transition-all hover:scale-[1.02] hover:shadow-lg text-left ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 hover:border-blue-500' 
                  : 'bg-white border-slate-200 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                    darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium leading-relaxed ${
                      darkMode ? 'text-gray-200' : 'text-slate-800'
                    }`}>
                      {step.action}
                    </p>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                      ⏱️ {step.timeframe}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold ${
                    darkMode ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {step.impact}
                  </span>
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedStep && (
        <ImprovementStepModal
          step={selectedStep}
          keywords={keywords}
          darkMode={darkMode}
          onClose={() => setSelectedStep(null)}
        />
      )}
    </>
  );
}

// ============================================
// SECTION SCORES - MEJORADO CON MODALS
// ============================================
import { SectionDetailModal } from '../modals/SectionDetailModal';

export function SectionScores({ sectionScores, darkMode }) {
  const [selectedSection, setSelectedSection] = useState(null);
  
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

  const getScoreGradient = (score) => {
    if (score >= 85) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (score >= 70) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-pink-500';
  };

  return (
    <>
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
              Haz clic en cada sección para ver el análisis detallado
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {Object.entries(sectionScores).map(([section, score]) => (
            <button
              key={section}
              onClick={() => setSelectedSection({ section, score })}
              className="w-full group text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-bold capitalize cursor-pointer transition-colors ${
                  darkMode ? 'text-gray-300 group-hover:text-blue-400' : 'text-slate-700 group-hover:text-blue-600'
                }`}>
                  {getSectionName(section)}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black ${
                    score >= 85 ? 'text-green-600' : 
                    score >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {score}%
                  </span>
                  <svg className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className={`w-full rounded-full h-4 overflow-hidden transition-all group-hover:h-5 ${
                darkMode ? 'bg-gray-700' : 'bg-slate-200'
              }`}>
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${getScoreGradient(score)}`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedSection && (
        <SectionDetailModal
          section={selectedSection.section}
          score={selectedSection.score}
          darkMode={darkMode}
          onClose={() => setSelectedSection(null)}
        />
      )}
    </>
  );
}