const fetch = require('node-fetch')
const { classifyTranscript } = require('./classifierService')

const analyzeWithGemini = async (transcript) => {
  // Guard 1: Verify system settings before wasting execution time or throwing errors
  if (!process.env.GEMINI_API_KEY || process.env.USE_GEMINI !== 'true') {
    console.log('ℹ️ Gemini API deactivated or key missing. routing directly to fallback classifier.');
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

    // Added an AbortController timeout so your server doesn't get stuck hanging if the API goes down
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second max safety limit

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.1, 
            maxOutputTokens: 500,
            responseMimeType: "application/json" // Force the model engine to speak native JSON
          }
        }),
        signal: controller.signal
      }
    )

    // Clear timeout since the request finished successfully
    clearTimeout(timeoutId);

    // Guard 2: Catch server HTTP errors (e.g., status 429 rate limits or 503 overloads)
    if (!response.ok) {
      throw new Error(`Gemini Endpoint responded with status status ${response.status}`);
    }

    const data = await response.json()
    
    // Guard 3: Safe chaining parsing to avoid 'Cannot read properties of undefined' errors
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    if (!text) {
      throw new Error('Gemini API returned an empty structural payload response');
    }

    // Clean up Markdown backticks if the model ignores generation configs
    const clean = text.replace(/```json|```/g, '').trim()
    
    // Guard 4: Catch syntax errors during JSON string serialization securely
    try {
      const result = JSON.parse(clean)
      
      // Enforce presence of required structure fields to avoid breaking the frontend UI
      result.suggestedCategory = result.suggestedCategory || 'General Physician'
      result.confidence = result.confidence || 0.50
      result.urgency = result.urgency || 'MEDIUM'
      result.reason = result.reason || 'Automated rule processing'
      result.keywords = Array.isArray(result.keywords) ? result.keywords : []
      result.analysisSource = 'GEMINI'
      
      return result
    } catch (jsonParseError) {
      throw new Error(`Failed to parse AI markdown payload format: ${jsonParseError.message}`);
    }

  } catch (err) {
    // Ultimate safety wrapper catch block:
    // If anything fails above, catch it here, log it cleanly, and use your fallback classifier
    if (err.name === 'AbortError') {
      console.error('📡 Gemini API timed out after 12 seconds. Using fallback...');
    } else {
      console.error('⚠️ Gemini Pipeline Error caught:', err.message)
    }
    
    return classifyTranscript(transcript)
  }
}

module.exports = { analyzeWithGemini }