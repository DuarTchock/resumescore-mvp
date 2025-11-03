// src/components/sections/Strengths.jsx
export default function Strengths({ strengths, darkMode }) {
  if (!strengths || strengths.length === 0) return null;

  return (
    <div className={`rounded-3xl shadow-xl border p-8 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
          💪 Fortalezas Detectadas
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {strengths.map((strength, i) => (
          <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all hover:scale-105 ${
            darkMode 
              ? 'bg-green-900/20 border-green-700' 
              : 'bg-green-50 border-green-200'
          }`}>
            <span className="text-3xl flex-shrink-0">✓</span>
            <p className={`flex-1 ${darkMode ? 'text-gray-200' : 'text-slate-700'}`}>{strength}</p>
          </div>
        ))}
      </div>
    </div>
  );
}