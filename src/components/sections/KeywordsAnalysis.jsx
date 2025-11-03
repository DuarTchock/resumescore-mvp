// src/components/sections/KeywordsAnalysis.jsx
import { Tooltip } from '../../utils/helpers';

export default function KeywordsAnalysis({ keywords, darkMode }) {
  if (!keywords) return null;

  return (
    <div className={`rounded-3xl shadow-xl border p-8 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
            🔍 Análisis de Keywords
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
            Keywords encontrados vs faltantes por categoría
          </p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Technical Skills */}
        <div>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${
            darkMode ? 'text-gray-300' : 'text-slate-700'
          }`}>
            <span className="text-2xl">💻</span> Skills Técnicos
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className={`text-xs font-semibold mb-2 ${
                darkMode ? 'text-green-400' : 'text-green-700'
              }`}>✅ ENCONTRADOS ({keywords.technical?.found?.length || 0})</p>
              <div className="flex flex-wrap gap-2">
                {keywords.technical?.found?.map((skill, i) => (
                  <Tooltip key={i} text="Este skill está en tu CV">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-help ${
                      darkMode 
                        ? 'bg-green-900 text-green-200 border border-green-700' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {skill}
                    </span>
                  </Tooltip>
                ))}
              </div>
            </div>
            <div>
              <p className={`text-xs font-semibold mb-2 ${
                darkMode ? 'text-red-400' : 'text-red-700'
              }`}>❌ FALTANTES ({keywords.technical?.missing?.length || 0})</p>
              <div className="flex flex-wrap gap-2">
                {keywords.technical?.missing?.map((skill, i) => (
                  <Tooltip key={i} text="Agrega este skill a tu CV">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-help ${
                      darkMode 
                        ? 'bg-red-900 text-red-200 border border-red-700' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {skill}
                    </span>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Soft Skills */}
        <div>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${
            darkMode ? 'text-gray-300' : 'text-slate-700'
          }`}>
            <span className="text-2xl">🤝</span> Soft Skills
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className={`text-xs font-semibold mb-2 ${
                darkMode ? 'text-green-400' : 'text-green-700'
              }`}>✅ ENCONTRADOS ({keywords.soft?.found?.length || 0})</p>
              <div className="flex flex-wrap gap-2">
                {keywords.soft?.found?.map((skill, i) => (
                  <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    darkMode 
                      ? 'bg-purple-900 text-purple-200 border border-purple-700' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className={`text-xs font-semibold mb-2 ${
                darkMode ? 'text-red-400' : 'text-red-700'
              }`}>❌ FALTANTES ({keywords.soft?.missing?.length || 0})</p>
              <div className="flex flex-wrap gap-2">
                {keywords.soft?.missing?.map((skill, i) => (
                  <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    darkMode 
                      ? 'bg-red-900 text-red-200 border border-red-700' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Industry Keywords */}
        {keywords.industry && (
          <div>
            <h3 className={`font-semibold mb-3 flex items-center gap-2 ${
              darkMode ? 'text-gray-300' : 'text-slate-700'
            }`}>
              <span className="text-2xl">🏢</span> Keywords de Industria
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className={`text-xs font-semibold mb-2 ${
                  darkMode ? 'text-green-400' : 'text-green-700'
                }`}>✅ ENCONTRADOS ({keywords.industry?.found?.length || 0})</p>
                <div className="flex flex-wrap gap-2">
                  {keywords.industry?.found?.map((skill, i) => (
                    <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      darkMode 
                        ? 'bg-blue-900 text-blue-200 border border-blue-700' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className={`text-xs font-semibold mb-2 ${
                  darkMode ? 'text-red-400' : 'text-red-700'
                }`}>❌ FALTANTES ({keywords.industry?.missing?.length || 0})</p>
                <div className="flex flex-wrap gap-2">
                  {keywords.industry?.missing?.map((skill, i) => (
                    <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      darkMode 
                        ? 'bg-red-900 text-red-200 border border-red-700' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}