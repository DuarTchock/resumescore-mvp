// src/components/ResultsView.jsx - MEJORADO CON TOOLTIPS ATS
import { motion } from 'framer-motion';
import HeroStats from './sections/HeroStats';
import ImprovementPath from './sections/ImprovementPath';
import Strengths from './sections/Strengths';
import KeywordsAnalysis from './sections/KeywordsAnalysis';
import ATSScoresGrid from './sections/ATSScoresGrid';
import { Recommendations } from './modals/AllModals';
import SectionScores from './sections/SectionScores';
import { ATSTooltip, InfoIconWithTooltip } from './ui/ATSTooltip';

export default function ResultsView({ 
  results, 
  darkMode, 
  onReset, 
  setShowExportModal,
  setSelectedATS 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Info Banner con explicación de ATS */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`p-6 rounded-2xl border ${
          darkMode 
            ? 'bg-blue-900/20 border-blue-700' 
            : 'bg-blue-50 border-blue-200'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className={`font-bold mb-2 flex items-center gap-2 ${
              darkMode ? 'text-blue-200' : 'text-blue-900'
            }`}>
              📊 Análisis Completo de Compatibilidad con ATS
              <InfoIconWithTooltip term="ATS" darkMode={darkMode} />
            </h3>
            <p className={`text-sm ${darkMode ? 'text-blue-100' : 'text-blue-800'}`}>
              Tu CV ha sido evaluado contra los <strong>10 Sistemas de Seguimiento de Candidatos (ATS)</strong> más 
              utilizados por empresas. Cada score indica qué tan bien este sistema específico podrá leer y procesar 
              tu CV automáticamente.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-4"
      >
        <button
          onClick={onReset}
          className={`flex-1 min-w-[200px] py-4 px-6 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
            darkMode 
              ? 'bg-gray-800 border-2 border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
      </motion.div>

      {/* Hero Stats con tooltips */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <HeroStats results={results} darkMode={darkMode} />
      </motion.div>

      {/* Sección: Qué significan estos números */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`p-5 rounded-2xl border ${
          darkMode 
            ? 'bg-purple-900/20 border-purple-700' 
            : 'bg-purple-50 border-purple-200'
        }`}
      >
        <h4 className={`font-bold mb-3 flex items-center gap-2 ${
          darkMode ? 'text-purple-200' : 'text-purple-900'
        }`}>
          <span>💡</span> ¿Qué significan estos números?
        </h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎯</span>
              <ATSTooltip term="matchRate" darkMode={darkMode}>
                <span className={`font-semibold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                  Match Rate
                </span>
              </ATSTooltip>
            </div>
            <p className={darkMode ? 'text-gray-300' : 'text-slate-700'}>
              Compatibilidad general entre tu CV y el Job Description
            </p>
          </div>
          
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📊</span>
              <ATSTooltip term="score" darkMode={darkMode}>
                <span className={`font-semibold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                  ATS Scores
                </span>
              </ATSTooltip>
            </div>
            <p className={darkMode ? 'text-gray-300' : 'text-slate-700'}>
              Qué tan bien cada sistema específico puede procesar tu CV
            </p>
          </div>
          
          <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🚀</span>
              <ATSTooltip term="potential" darkMode={darkMode}>
                <span className={`font-semibold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                  Potencial
                </span>
              </ATSTooltip>
            </div>
            <p className={darkMode ? 'text-gray-300' : 'text-slate-700'}>
              Score máximo que puedes alcanzar con las mejoras sugeridas
            </p>
          </div>
        </div>
      </motion.div>

      {/* Improvement Path */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <ImprovementPath 
          improvementPath={results.improvementPath}
          keywords={results.keywords}
          darkMode={darkMode} 
        />
      </motion.div>

      {/* Strengths */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Strengths strengths={results.strengths} darkMode={darkMode} />
      </motion.div>

      {/* Keywords Analysis con tooltips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className={`rounded-3xl shadow-xl border p-8 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className={`text-2xl font-bold flex items-center gap-2 ${
                darkMode ? 'text-gray-200' : 'text-slate-800'
              }`}>
                🔍 Análisis de Keywords
                <InfoIconWithTooltip term="keywords" darkMode={darkMode} />
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                Palabras clave que los ATS buscan en tu CV
              </p>
            </div>
          </div>

          {/* Info sobre tipos de keywords */}
          <div className={`mb-6 p-4 rounded-xl border ${
            darkMode ? 'bg-indigo-900/20 border-indigo-700' : 'bg-indigo-50 border-indigo-200'
          }`}>
            <p className={`text-sm ${darkMode ? 'text-indigo-200' : 'text-indigo-800'}`}>
              <strong>💡 Importante:</strong> Los ATS priorizan diferentes tipos de keywords:
            </p>
            <div className="mt-3 grid md:grid-cols-3 gap-3 text-xs">
              <div className={`p-2 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <ATSTooltip term="technical" darkMode={darkMode}>
                  <span className="font-semibold">🔧 Técnicas:</span>
                </ATSTooltip>
                <span className={darkMode ? 'text-gray-400' : 'text-slate-600'}> Mayor peso</span>
              </div>
              <div className={`p-2 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <ATSTooltip term="industry" darkMode={darkMode}>
                  <span className="font-semibold">🏢 Industria:</span>
                </ATSTooltip>
                <span className={darkMode ? 'text-gray-400' : 'text-slate-600'}> Peso medio</span>
              </div>
              <div className={`p-2 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <ATSTooltip term="soft" darkMode={darkMode}>
                  <span className="font-semibold">💪 Soft Skills:</span>
                </ATSTooltip>
                <span className={darkMode ? 'text-gray-400' : 'text-slate-600'}> Menor peso</span>
              </div>
            </div>
          </div>

          <KeywordsAnalysis keywords={results.keywords} darkMode={darkMode} />
        </div>
      </motion.div>

      {/* ATS Scores Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <ATSScoresGrid 
          scores={results.scores} 
          average={results.average} 
          darkMode={darkMode}
          setSelectedATS={setSelectedATS}
        />
      </motion.div>

      {/* Section Scores con tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <div className={`rounded-3xl shadow-xl border p-8 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className={`text-2xl font-bold flex items-center gap-2 ${
                darkMode ? 'text-gray-200' : 'text-slate-800'
              }`}>
                🔥 Vista de Calor por Sección
                <InfoIconWithTooltip term="sections" darkMode={darkMode} />
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                Haz clic en cada sección para ver el análisis detallado con método socrático
              </p>
            </div>
          </div>

          <SectionScores sectionScores={results.sectionScores} darkMode={darkMode} />
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <Recommendations recommendations={results.recommendations} darkMode={darkMode} />
      </motion.div>

      {/* Tips finales */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className={`p-6 rounded-2xl border ${
          darkMode 
            ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700' 
            : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
        }`}
      >
        <h4 className={`font-bold mb-3 flex items-center gap-2 ${
          darkMode ? 'text-green-200' : 'text-green-900'
        }`}>
          <span>✨</span> Tips para Optimizar tu CV para ATS
        </h4>
        <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>
              <ATSTooltip term="format" darkMode={darkMode}>
                <strong>Formato simple:</strong>
              </ATSTooltip>
              {' '}Evita tablas, gráficos y columnas múltiples
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>
              <ATSTooltip term="bullets" darkMode={darkMode}>
                <strong>Usa bullets:</strong>
              </ATSTooltip>
              {' '}Comienza cada logro con • o - para mejor extracción
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>
              <ATSTooltip term="dates" darkMode={darkMode}>
                <strong>Fechas consistentes:</strong>
              </ATSTooltip>
              {' '}Usa formato MM/YYYY en toda tu experiencia
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>
              <strong>Keywords naturales:</strong> Incorpora las keywords faltantes de forma orgánica en tu experiencia
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>
              <strong>Cuantifica todo:</strong> Agrega números, porcentajes y métricas a cada logro
            </span>
          </li>
        </ul>
      </motion.div>
    </motion.div>
  );
}