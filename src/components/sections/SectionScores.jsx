// src/components/sections/SectionScores.jsx - CORREGIDO
import { useState } from 'react';
import { SectionDetailModal } from '../modals/SectionDetailModal';

export default function SectionScores({ sectionScores, darkMode }) {
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
      <div className="space-y-4">
        {Object.entries(sectionScores).map(([section, sectionData]) => {
          // 🔥 FIX: sectionData es un objeto {score, socraticGuide}, no solo un número
          const score = typeof sectionData === 'object' ? sectionData.score : sectionData;
          
          return (
            <button
              key={section}
              onClick={() => setSelectedSection({ section, score, sectionData })}
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
          );
        })}
      </div>

      {/* Modal */}
      {selectedSection && (
        <SectionDetailModal
          section={selectedSection.section}
          score={selectedSection.score}
          sectionData={selectedSection.sectionData}
          darkMode={darkMode}
          onClose={() => setSelectedSection(null)}
        />
      )}
    </>
  );
}