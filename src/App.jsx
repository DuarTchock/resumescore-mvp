// src/App.jsx - VERSIÓN FINAL CON PDF EXPORT Y MODALS MEJORADOS
import { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadForm from './components/UploadForm';
import ResultsView from './components/ResultsView';
import { ATSDetailModal, ExportModal, LegalModal, ATSGuideModal, OnboardingModal } from './components/modals/AllModals';
import { generateFullReport } from './utils/reportGenerator';
import { generatePDFReport } from './utils/pdfGenerator';

function App() {
  // Estados principales
  const [cvFile, setCvFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState(null);
  
  // Estados de UI
  const [history, setHistory] = useState([]);
  const [selectedATS, setSelectedATS] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showATSGuide, setShowATSGuide] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Inicialización
  useEffect(() => {
    const isFirstVisit = !localStorage.getItem('resumescore_visited');
    if (isFirstVisit) {
      setShowOnboarding(true);
      localStorage.setItem('resumescore_visited', 'true');
    }

    const savedHistory = localStorage.getItem('resumescore_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }

    const savedDarkMode = localStorage.getItem('resumescore_darkmode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleAnalyze = async () => {
    if (!cvFile || !jdText.trim()) {
      alert('⚠️ Por favor sube un CV y pega/sube la descripción del puesto');
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingStep('📄 Procesando archivo...');
    
    const form = new FormData();
    form.append('cv', cvFile);
    form.append('jd', jdText);

    try {
      setTimeout(() => setLoadingStep('🔍 Extrayendo texto...'), 1000);
      setTimeout(() => setLoadingStep('🏷️ Analizando keywords...'), 2000);
      setTimeout(() => setLoadingStep('🤖 Evaluando con IA...'), 3000);
      setTimeout(() => setLoadingStep('📊 Calculando scores...'), 4000);
      setTimeout(() => setLoadingStep('✨ Generando recomendaciones...'), 5000);

      const res = await fetch('/api/analyze-ai', {
        method: 'POST',
        body: form
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Error del servidor');
      }

      if (data.success) {
        const newResult = {
          ...data,
          timestamp: new Date().toISOString(),
          cvName: cvFile.name,
          jdPreview: jdText.substring(0, 100)
        };
        setResults(newResult);
        
        const updatedHistory = [newResult, ...history.slice(0, 4)];
        setHistory(updatedHistory);
        localStorage.setItem('resumescore_history', JSON.stringify(updatedHistory));

        setTimeout(() => {
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }, 500);
      } else {
        setError(data.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleReset = () => {
    setCvFile(null);
    setJdText('');
    setResults(null);
    setError(null);
    setSelectedATS(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('resumescore_darkmode', newMode.toString());
  };

  // NUEVO: Export a PDF
  const handleExportPDF = () => {
    generatePDFReport(results);
    setShowExportModal(false);
  };

  // Export a TXT (legacy)
  const handleExportTXT = () => {
    const content = generateFullReport(results);
    const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ResumeScore_Analisis_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      
      {/* Header */}
      <Header 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        setShowATSGuide={setShowATSGuide}
        setShowLegal={setShowLegal}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pb-20">
        {!results ? (
          <UploadForm
            cvFile={cvFile}
            setCvFile={setCvFile}
            jdText={jdText}
            setJdText={setJdText}
            loading={loading}
            loadingStep={loadingStep}
            error={error}
            darkMode={darkMode}
            history={history}
            setResults={setResults}
            onAnalyze={handleAnalyze}
          />
        ) : (
          <ResultsView
            results={results}
            darkMode={darkMode}
            onReset={handleReset}
            setShowExportModal={setShowExportModal}
            setSelectedATS={setSelectedATS}
          />
        )}
      </main>

      {/* Modals */}
      {selectedATS && (
        <ATSDetailModal
          selectedATS={selectedATS}
          atsBreakdown={results.atsBreakdown}
          scores={results.scores}
          darkMode={darkMode}
          onClose={() => setSelectedATS(null)}
        />
      )}

      {showExportModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowExportModal(false)}
        >
          <div 
            className={`max-w-md w-full rounded-3xl shadow-2xl border p-8 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
              📄 Exportar Reporte
            </h3>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
              Elige el formato para descargar tu análisis completo
            </p>
            <div className="space-y-3">
              <button
                onClick={handleExportPDF}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Descargar PDF (Recomendado)
              </button>
              <button
                onClick={handleExportTXT}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Descargar TXT
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showLegal && (
        <LegalModal
          darkMode={darkMode}
          onClose={() => setShowLegal(false)}
        />
      )}

      {showATSGuide && (
        <ATSGuideModal
          results={results}
          darkMode={darkMode}
          onClose={() => setShowATSGuide(false)}
        />
      )}

      {showOnboarding && (
        <OnboardingModal
          darkMode={darkMode}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {/* Footer */}
      <footer className={`py-12 px-6 border-t ${
        darkMode ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className={`font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                ResumeScore
              </h4>
              <p className="text-sm mb-4">
                Optimiza tu CV para ATS con IA. Aumenta tus posibilidades de ser contratado.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-green-500 text-white rounded">Powered by Groq AI</span>
              </div>
            </div>
            
            <div>
              <h4 className={`font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                Enlaces
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => setShowLegal(true)} className="hover:text-blue-600 transition-colors">
                    Privacidad y Legal
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowATSGuide(true)} className="hover:text-blue-600 transition-colors">
                    Guía de ATS
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowOnboarding(true)} className="hover:text-blue-600 transition-colors">
                    Tutorial
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className={`font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                Soporte
              </h4>
              <p className="text-sm mb-2">¿Necesitas ayuda?</p>
              <a href="mailto:support@resumescore.com" className="text-sm text-blue-600 hover:underline">
                support@resumescore.com
              </a>
            </div>
          </div>
          
          <div className={`pt-8 border-t text-center text-sm ${
            darkMode ? 'border-gray-800' : 'border-slate-200'
          }`}>
            <p>© 2024 ResumeScore. Todos los derechos reservados.</p>
            <p className="mt-2">Hecho con ❤️ para ayudarte a conseguir el trabajo de tus sueños</p>
          </div>
        </div>
      </footer>

      {/* Styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .dark { color-scheme: dark; }
      `}</style>
    </div>
  );
}

export default App;