const fetch = require('node-fetch')
const { classifyTranscript } = require('./classifierService')

const analyzeWithGemini = async (transcript) => {
  if (!process.env.GEMINI_API_KEY || process.env.USE_GEMINI !== 'true') {
    return classifyTranscript(transcript)
  }

  try {
    const prompt = `You are a medical report classifier. Analyze the following medical report transcript and classify it into the most suitable doctor category.

Categories: General Physician, Cardiologist, Dermatologist, Orthopedic, Neurologist, Gynecologist, Pediatrician, ENT Specialist, Diabetologist

IMPORTANT: You must NOT diagnose the patient, recommend medicine, or provide treatment. Only classify which doctor category is most suitable.

Transcript:
${transcript}

Respond ONLY with valid JSON in this exact format:
{
  "suggestedCategory": "Cardiologist",
  "confidence": 0.86,
  "urgency": "MEDIUM",
  "reason": "Brief reason for this category selection",
  "keywords": ["keyword1", "keyword2"],
  "manualReviewRequired": false,
  "analysisSource": "GEMINI"
}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 500 }
        })
      }
    )

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)
    result.analysisSource = 'GEMINI'
    return result
  } catch (err) {
    console.error('Gemini failed, using fallback:', err.message)
    return classifyTranscript(transcript)
  }
}

module.exports = { analyzeWithGemini }