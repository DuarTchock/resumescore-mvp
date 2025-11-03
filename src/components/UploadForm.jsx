// src/components/UploadForm.jsx
import { useState } from 'react';

export default function UploadForm({ 
  cvFile, 
  setCvFile, 
  jdText, 
  setJdText, 
  loading, 
  loadingStep, 
  error, 
  darkMode, 
  history,
  setResults,
  onAnalyze 
}) {
  const [jdFile, setJdFile] = useState(null);
  const [jdInputMode, setJdInputMode] = useState('text'); // 'text' o 'file'
  const [processingJD, setProcessingJD] = useState(false);

  const handleJDFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setJdFile(file);
    setProcessingJD(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Llamar a endpoint para extraer texto del JD
      const res = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        setJdText(data.text);
        setJdInputMode('text'); // Cambiar a modo texto para edición
      } else {
        alert('Error al procesar el archivo: ' + data.error);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error al procesar el archivo del JD');
    } finally {
      setProcessingJD(false);
    }
  };

  return (
    <div className={`rounded-3xl shadow-2xl border overflow-hidden mb-8 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
    }`}>
      <div className="p-8">
        {/* File Upload - CV */}
        <div className="mb-6">
          <label className={`block text-sm font-semibold mb-3 ${
            darkMode ? 'text-gray-300' : 'text-slate-700'
          }`}>
            📄 Tu CV
          </label>
          <input
            type="file"
            accept=".docx,.pdf"
            onChange={(e) => setCvFile(e.target.files[0])}
            className="hidden"
            id="cv-upload"
          />
          <label
            htmlFor="cv-upload"
            className={`flex items-center justify-center w-full px-6 py-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group ${
              darkMode 
                ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700/50' 
                : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'
            }`}
          >
            {cvFile ? (
              <div className="flex items-center gap-3 text-blue-600">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <span className="font-semibold block">{cvFile.name}</span>
                  <span className="text-xs text-gray-500">{(cvFile.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <svg className={`w-12 h-12 mx-auto mb-3 transition-colors ${
                  darkMode ? 'text-gray-500 group-hover:text-blue-400' : 'text-slate-400 group-hover:text-blue-500'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className={`font-semibold block mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-slate-600'
                }`}>Haz clic para subir tu CV</span>
                <span className={`text-xs block ${
                  darkMode ? 'text-gray-500' : 'text-slate-500'
                }`}>PDF o DOCX • Máx. 5MB</span>
              </div>
            )}
          </label>
        </div>

        {/* Job Description - Text or File */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className={`text-sm font-semibold ${
              darkMode ? 'text-gray-300' : 'text-slate-700'
            }`}>
              💼 Descripción del Puesto (Job Description)
            </label>
            
            {/* Toggle between text and file */}
            <div className={`flex gap-2 p-1 rounded-lg ${
              darkMode ? 'bg-gray-700' : 'bg-slate-100'
            }`}>
              <button
                onClick={() => setJdInputMode('text')}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                  jdInputMode === 'text'
                    ? darkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-600 text-white'
                    : darkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📝 Texto
              </button>
              <button
                onClick={() => setJdInputMode('file')}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                  jdInputMode === 'file'
                    ? darkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-600 text-white'
                    : darkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📄 Archivo
              </button>
            </div>
          </div>

          {jdInputMode === 'text' ? (
            <div>
              <textarea
                placeholder="Pega aquí la descripción completa del trabajo...

Tip: Incluye toda la información posible (requisitos, responsabilidades, skills necesarios)"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className={`w-full h-56 p-4 border-2 rounded-2xl outline-none transition-all duration-300 resize-none ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:bg-gray-600' 
                    : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                }`}
              />
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>
                  {jdText.length} caracteres
                </span>
                {jdText.length > 0 && (
                  <span className={`text-xs ${
                    jdText.length >= 200 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {jdText.length >= 200 ? '✓ Suficiente detalle' : '⚠️ Agrega más detalles para mejor análisis'}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept=".docx,.pdf"
                onChange={handleJDFileChange}
                className="hidden"
                id="jd-upload"
                disabled={processingJD}
              />
              <label
                htmlFor="jd-upload"
                className={`flex items-center justify-center w-full px-6 py-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group ${
                  processingJD ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  darkMode 
                    ? 'border-gray-600 hover:border-purple-500 hover:bg-gray-700/50' 
                    : 'border-slate-300 hover:border-purple-500 hover:bg-purple-50'
                }`}
              >
                {processingJD ? (
                  <div className="flex items-center gap-3 text-blue-600">
                    <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-semibold">Procesando archivo...</span>
                  </div>
                ) : jdFile || jdText ? (
                  <div className="flex items-center gap-3 text-purple-600">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-left">
                      <span className="font-semibold block">
                        {jdFile ? jdFile.name : 'Job Description cargado'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {jdText.length} caracteres extraídos
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className={`w-12 h-12 mx-auto mb-3 transition-colors ${
                      darkMode ? 'text-gray-500 group-hover:text-purple-400' : 'text-slate-400 group-hover:text-purple-500'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className={`font-semibold block mb-1 ${
                      darkMode ? 'text-gray-300' : 'text-slate-600'
                    }`}>Sube el archivo del Job Description</span>
                    <span className={`text-xs block ${
                      darkMode ? 'text-gray-500' : 'text-slate-500'
                    }`}>PDF o DOCX • Se extraerá el texto automáticamente</span>
                  </div>
                )}
              </label>
              
              {jdText && (
                <div className={`mt-3 p-3 rounded-xl ${
                  darkMode ? 'bg-gray-700' : 'bg-slate-50'
                }`}>
                  <p className={`text-xs font-semibold mb-2 ${
                    darkMode ? 'text-gray-400' : 'text-slate-600'
                  }`}>Vista previa del texto extraído:</p>
                  <p className={`text-sm line-clamp-3 ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>
                    {jdText.substring(0, 200)}...
                  </p>
                  <button
                    onClick={() => setJdInputMode('text')}
                    className="text-xs text-blue-600 hover:underline mt-2"
                  >
                    Editar texto →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-6 p-4 rounded-2xl border-l-4 ${
            darkMode ? 'bg-red-900/30 border-red-500' : 'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-red-300' : 'text-red-800'}`}>Error</p>
                <p className={`text-sm mt-1 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Analyze Button */}
        <button
          onClick={onAnalyze}
          disabled={loading || !cvFile || !jdText}
          className={`w-full py-5 px-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl flex items-center justify-center gap-3 group relative overflow-hidden ${
            loading || !cvFile || !jdText
              ? darkMode 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : darkMode
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 hover:shadow-2xl hover:scale-[1.02]'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl hover:scale-[1.02]'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="text-left">
                <span className="block">{loadingStep}</span>
                <span className="text-xs opacity-75">Esto puede tardar 10-15 segundos...</span>
              </div>
            </>
          ) : (
            <>
              <span>🤖 Analizar con IA</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>

        {/* History Section */}
        {history.length > 0 && (
          <div className={`mt-8 pt-8 border-t ${
            darkMode ? 'border-gray-700' : 'border-slate-200'
          }`}>
            <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${
              darkMode ? 'text-gray-300' : 'text-slate-700'
            }`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Historial Reciente
            </h3>
            <div className="space-y-2">
              {history.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setResults(item)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${
                        darkMode ? 'text-gray-200' : 'text-slate-800'
                      }`}>{item.cvName}</p>
                      <p className={`text-xs mt-1 ${
                        darkMode ? 'text-gray-400' : 'text-slate-500'
                      }`}>{new Date(item.timestamp).toLocaleString('es-ES')}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{item.average}%</div>
                      <span className="text-xs text-gray-500">promedio</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}