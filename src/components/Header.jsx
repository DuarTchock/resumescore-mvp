// src/components/Header.jsx - MEJORADO CON EXPLICACIÓN DE ATS
export default function Header({ darkMode, toggleDarkMode, setShowATSGuide, setShowLegal }) {
  return (
    <header className="relative pt-8 pb-6 px-6">
      {/* Dark Mode Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleDarkMode}
          className={`p-3 rounded-full transition-all duration-300 ${
            darkMode 
              ? 'bg-yellow-400 hover:bg-yellow-300 text-gray-900' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          } shadow-lg hover:shadow-xl`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      <div className="max-w-6xl mx-auto text-center pt-8">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300 ${
          darkMode 
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
            : 'bg-gradient-to-br from-blue-600 to-indigo-600'
        }`}>
          <svg className="w-11 h-11 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        <h1 className={`text-6xl md:text-7xl font-black mb-4 ${
          darkMode 
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400' 
            : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600'
        }`}>
          ResumeScore
        </h1>
        
        {/* 🔥 EXPLICACIÓN CLARA DE ATS - PRIMERA MENCIÓN */}
        <p className={`text-xl md:text-2xl mb-4 ${
          darkMode ? 'text-gray-300' : 'text-slate-600'
        }`}>
          Optimiza tu CV para los <span className="font-bold text-blue-600 dark:text-blue-400">Sistemas de Seguimiento de Candidatos (ATS)</span>
        </p>
        
        <p className={`text-base md:text-lg mb-6 max-w-3xl mx-auto ${
          darkMode ? 'text-gray-400' : 'text-slate-500'
        }`}>
          Los <strong>ATS (Applicant Tracking Systems)</strong> son sistemas automatizados que las empresas 
          utilizan para filtrar CVs antes de que lleguen a un reclutador humano. Analizamos tu CV contra 
          los 10 sistemas ATS más populares del mercado.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <span className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-slate-600'
          } shadow-lg`}>
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Powered by Groq AI
          </span>
          <button
            onClick={() => setShowATSGuide(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              darkMode ? 'bg-indigo-900 text-indigo-300 hover:bg-indigo-800' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            } transition-colors`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ¿Qué ATS usa la empresa?
          </button>
          <button
            onClick={() => setShowLegal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            } transition-colors`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Legal y Privacidad
          </button>
        </div>
      </div>
    </header>
  );
}