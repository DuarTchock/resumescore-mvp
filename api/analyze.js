import { parseCV } from './cvParser.js'
import atsRules from '../ats_rules.json' assert { type: 'json' }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { cv, jd } = req.body
  const cvText = await parseCV(cv) // Simulación
  const jdKeywords = jd.toLowerCase().match(/\b\w+\b/g) || []
  const cvKeywords = cvText.toLowerCase().match(/\b\w+\b/g) || []

  const matchRate = jdKeywords.filter(k => cvKeywords.includes(k)).length / jdKeywords.length

  const scores = {}
  Object.keys(atsRules.ats).forEach(ats => {
    let score = 85 + Math.random() * 15
    if (cvText.includes('tabla')) score -= 8
    if (cvText.includes('Gerente Operativo')) score += 5
    scores[ats] = Math.round(score + matchRate * 20)
  })

  res.status(200).json({ scores })
}