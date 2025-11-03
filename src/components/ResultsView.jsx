// src/components/ResultsView.jsx
import HeroStats from './sections/HeroStats';
import ImprovementPath from './sections/ImprovementPath';
import Strengths from './sections/Strengths';
import KeywordsAnalysis from './sections/KeywordsAnalysis';
import ATSScoresGrid from './sections/ATSScoresGrid';
import { SectionScores, Recommendations } from './sections/SectionScores_and_Recommendations';

export default function ResultsView({ 
  results, 
  darkMode, 
  onReset, 
  setShowExportModal,
  setSelectedATS 
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={onReset}
          className={`flex-1 min-w-[200px] py-4 px-6 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
            darkMode 
              ? 'bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Analizar otro CV
        </button>
        <button
          onClick={() => setShowExportModal(true)}
          className="flex-1 min-w-[200px] py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar Reporte
        </button>
      </div>

      {/* Hero Stats */}
      <HeroStats results={results} darkMode={darkMode} />

      {/* Improvement Path */}
      <ImprovementPath improvementPath={results.improvementPath} darkMode={darkMode} />

      {/* Strengths */}
      <Strengths strengths={results.strengths} darkMode={darkMode} />

      {/* Keywords Analysis */}
      <KeywordsAnalysis keywords={results.keywords} darkMode={darkMode} />

      {/* ATS Scores Grid */}
      <ATSScoresGrid 
        scores={results.scores} 
        average={results.average} 
        darkMode={darkMode}
        setSelectedATS={setSelectedATS}
      />

      {/* Section Scores */}
      <SectionScores sectionScores={results.sectionScores} darkMode={darkMode} />

      {/* Recommendations */}
      <Recommendations recommendations={results.recommendations} darkMode={darkMode} />
    </div>
  );
}