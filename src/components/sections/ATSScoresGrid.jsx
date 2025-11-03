// src/components/sections/ATSScoresGrid.jsx
import { getScoreColor } from '../../utils/helpers';

export default function ATSScoresGrid({ scores, average, darkMode, setSelectedATS }) {
  return (
    <div className={`rounded-3xl shadow-xl border p-8 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
            🏆 Scores por ATS
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
            Click en cualquier ATS para ver detalles
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(scores).map(([ats, score]) => (
          <button
            key={ats}
            onClick={() => setSelectedATS(ats)}
            className="group relative"
          >
            <div className={`rounded-2xl p-5 border-2 transition-all duration-300 cursor-pointer ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 hover:border-blue-500 hover:bg-gray-600' 
                : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 hover:border-blue-400 hover:shadow-lg'
            }`}>
              <div className={`text-xs font-bold mb-2 truncate ${
                darkMode ? 'text-gray-400' : 'text-slate-600'
              }`} title={ats}>
                {ats}
              </div>
              <div className={`text-4xl font-black mb-2 ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      i < Math.floor(score / 20) ? 'bg-current opacity-100' : 'bg-slate-300 opacity-50'
                    }`}
                  ></div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-blue-600 bg-opacity-0 group-hover:bg-opacity-95 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                <div className="text-white text-center p-2">
                  <p className="font-bold text-sm mb-1">Ver análisis</p>
                  <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className={`mt-6 pt-6 border-t text-center ${
        darkMode ? 'border-gray-700' : 'border-slate-200'
      }`}>
        <p className={`text-lg mb-2 ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
          Promedio Global:
        </p>
        <span className="text-5xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {average}%
        </span>
      </div>
    </div>
  );
}