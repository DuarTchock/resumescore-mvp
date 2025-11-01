import { useState } from 'react'

function App() {
  const [cvFile, setCvFile] = useState(null)
  const [jdText, setJdText] = useState('')
  const [scores, setScores] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [matchRate, setMatchRate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [useAI, setUseAI] = useState(false)
  const [analysis, setAnalysis] = useState(null)

  const handleAnalyze = async () => {
    if (!cvFile || !jdText.trim()) {
      alert('Sube un CV y pega el JD');
      return;
    }

    setLoading(true);
    setError(null);
    const form = new FormData();
    form.append('cv', cvFile);
    form.append('jd', jdText);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: form
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Error del servidor');
      }

      if (data.success) {
        setScores(data.scores);
        setRecommendations(data.recommendations || []);
        setMatchRate(data.matchRate);
      } else {
        setError(data.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto bg-gray-50">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-700">ResumeScore</h1>
        <p className="text-gray-600 mt-2">Optimiza tu CV para 10 ATS en 15 segundos</p>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar archivo CV
          </label>
          <input
            type="file"
            accept=".docx,.pdf"
            onChange={(e) => setCvFile(e.target.files[0])}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-3 focus:outline-none"
          />
          {cvFile && (
            <p className="mt-2 text-sm text-green-600">
              ✓ {cvFile.name}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción del puesto (Job Description)
          </label>
          <textarea
            placeholder="Pega la descripción completa del empleo aquí...
            
Ejemplo:
Services & Support
- Gestión de equipos
- Análisis de datos
- Experiencia en ATS"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || !cvFile || !jdText}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Analizando...' : 'Analizar CV'}
        </button>
      </div>

      {scores && (
        <div className="mt-10 space-y-6">
          {/* Match Rate */}
          {matchRate !== null && (
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <h2 className="text-xl font-semibold mb-2">Coincidencia con el JD</h2>
              <div className="text-5xl font-bold text-blue-600">{matchRate}%</div>
            </div>
          )}

          {/* Scores */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Scores por ATS</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(scores).map(([ats, score]) => (
                <div key={ats} className="text-center p-3 bg-gray-50 rounded-lg border">
                  <div className="font-semibold text-sm mb-1">{ats}</div>
                  <div className={`text-2xl font-bold ${
                    score >= 85 ? 'text-green-600' : 
                    score >= 75 ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {score}%
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-lg">
                Promedio: <strong className="text-2xl text-blue-600">
                  {Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/10)}%
                </strong>
              </p>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-4">💡 Recomendaciones</h2>
              <ul className="space-y-2">
                {recommendations.map((tip, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App