// src/components/sections/ImprovementPath.jsx
export default function ImprovementPath({ improvementPath, darkMode }) {
  if (!improvementPath) return null;

  return (
    <div className={`rounded-3xl shadow-xl border p-8 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
            Tu Ruta de Mejora
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
            De {improvementPath.current}% a {improvementPath.potential}% en {improvementPath.steps?.length || 0} pasos
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {improvementPath.steps?.map((step, i) => (
          <div key={i} className={`relative p-5 rounded-2xl border-2 transition-all hover:scale-105 cursor-pointer ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 hover:border-purple-500' 
              : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:border-purple-400'
          }`}>
            <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
              i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : i === 2 ? 'bg-yellow-500' : 'bg-green-500'
            }`}>
              {i + 1}
            </div>
            <div className={`text-3xl font-black mb-2 ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>
              {step.impact}
            </div>
            <p className={`text-sm font-semibold mb-2 ${
              darkMode ? 'text-gray-200' : 'text-slate-800'
            }`}>
              {step.action}
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
              ⏱️ {step.timeframe}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}