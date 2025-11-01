import { useState } from 'react'

function App() {
  const [cvFile, setCvFile] = useState(null)
  const [jdText, setJdText] = useState('')
  const [scores, setScores] = useState(null)
  const [loading, setLoading] = useState(false)

 const handleAnalyze = async () => {
  if (!cvFile || !jdText.trim()) {
    alert('Sube un CV y pega el JD');
    return;
  }

  setLoading(true);
  const formData = new FormData();
  formData.append('cv', cvFile);
  formData.append('jd', jdText);

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      setScores(data.scores);
      setRecommendations(data.recommendations);
    } else {
      alert('Error: ' + data.error);
    }
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-700">ResumeScore</h1>
        <p className="text-gray-600 mt-2">Optimiza tu CV para 10 ATS en 15 segundos</p>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <input
          type="file"
          accept=".docx,.pdf,.txt"
          onChange={(e) => setCvFile(e.target.files[0])}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-3"
        />
        <textarea
          placeholder="Pega la descripción del empleo (JD) aquí..."
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          className="mt-4 w-full h-32 p-3 border rounded-lg"
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !cvFile || !jdText}
          className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analizando...' : 'Analizar CV'}
        </button>
      </div>

      {scores && (
        <div className="mt-10 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Scores por ATS</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(scores).map(([ats, score]) => (
              <div key={ats} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold">{ats}</div>
                <div className="text-2xl font-bold text-blue-600">{score}%</div>
              </div>
            ))}
          </div>
          <p className="text-center mt-4 text-lg">
            Promedio: <strong>{Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/10)}%</strong>
          </p>
        </div>
      )}
    </div>
  )
}

export default App