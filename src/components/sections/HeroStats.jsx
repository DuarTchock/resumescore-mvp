// src/components/sections/HeroStats.jsx
export default function HeroStats({ results, darkMode }) {
  return (
    <div className={`rounded-3xl shadow-2xl p-8 overflow-hidden relative ${
      darkMode 
        ? 'bg-gradient-to-br from-blue-900 to-indigo-900' 
        : 'bg-gradient-to-br from-blue-600 to-indigo-600'
    }`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
      <div className="relative z-10 grid md:grid-cols-3 gap-6 text-center text-white">
        <div>
          <p className="text-blue-200 font-medium mb-2">Coincidencia General</p>
          <div className="text-6xl font-black mb-2">{results.matchRate}%</div>
          <p className="text-sm text-blue-200">
            {results.matchRate >= 85 ? '🎉 Excelente!' : results.matchRate >= 70 ? '👍 Buen match' : '💪 Hay margen'}
          </p>
        </div>
        <div>
          <p className="text-blue-200 font-medium mb-2">Promedio ATS</p>
          <div className="text-6xl font-black mb-2">{results.average}%</div>
          <p className="text-sm text-blue-200">
            {results.average >= 85 ? 'Top tier' : results.average >= 70 ? 'Competitivo' : 'Mejorable'}
          </p>
        </div>
        <div>
          <p className="text-blue-200 font-medium mb-2">Mejora Estimada</p>
          <div className="text-6xl font-black mb-2">
            +{(results.improvementPath?.potential || results.average) - (results.improvementPath?.current || results.average)}%
          </div>
          <p className="text-sm text-blue-200">Con optimizaciones</p>
        </div>
      </div>
    </div>
  );
}