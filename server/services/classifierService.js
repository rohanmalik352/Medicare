// Rule-based fallback classifier — no API needed
const RULES = [
  {
    category: 'Cardiologist',
    keywords: ['ecg', 'ekg', 'chest pain', 'chest discomfort', 'heart', 'cardiac', 'blood pressure', 'hypertension',
      'palpitation', 'arrhythmia', 'cholesterol', 'triglyceride', 'troponin', 'bp', 'heart rate', 'tachycardia', 'bradycardia'],
  },
  {
    category: 'Dermatologist',
    keywords: ['skin', 'rash', 'allergy', 'eczema', 'psoriasis', 'acne', 'dermatitis', 'itching', 'hives',
      'hair loss', 'nail', 'fungal', 'infection', 'lesion', 'wound', 'burn'],
  },
  {
    category: 'Orthopedic',
    keywords: ['bone', 'fracture', 'joint', 'x-ray', 'xray', 'spine', 'back pain', 'knee', 'shoulder',
      'arthritis', 'osteoporosis', 'mri', 'ligament', 'tendon', 'cartilage', 'hip', 'ankle', 'wrist'],
  },
  {
    category: 'Neurologist',
    keywords: ['headache', 'migraine', 'seizure', 'epilepsy', 'nerve', 'brain', 'stroke', 'paralysis',
      'tremor', 'parkinson', 'alzheimer', 'dementia', 'vertigo', 'dizziness', 'numbness'],
  },
  {
    category: 'Diabetologist',
    keywords: ['diabetes', 'blood sugar', 'glucose', 'insulin', 'hba1c', 'fasting sugar', 'hyperglycemia',
      'hypoglycemia', 'diabetic', 'sugar level'],
  },
  {
    category: 'Gynecologist',
    keywords: ['pregnancy', 'menstrual', 'uterus', 'ovary', 'cervix', 'gynec', 'pcos', 'pcod',
      'period', 'vaginal', 'breast', 'hormone', 'estrogen', 'progesterone'],
  },
  {
    category: 'Pediatrician',
    keywords: ['child', 'infant', 'baby', 'pediatric', 'newborn', 'vaccination', 'immunization',
      'growth', 'developmental', 'toddler'],
  },
  {
    category: 'ENT Specialist',
    keywords: ['ear', 'nose', 'throat', 'ent', 'hearing', 'tonsil', 'sinus', 'nasal', 'larynx',
      'tinnitus', 'hearing loss', 'adenoid'],
  },
  {
    category: 'General Physician',
    keywords: ['fever', 'cold', 'cough', 'flu', 'weakness', 'fatigue', 'vomiting', 'nausea', 'diarrhea',
      'general', 'body pain', 'headache', 'infection', 'viral', 'bacterial'],
  },
]

const classifyTranscript = (transcript) => {
  const text = transcript.toLowerCase()
  const scores = {}

  for (const rule of RULES) {
    const matched = rule.keywords.filter(kw => text.includes(kw))
    if (matched.length > 0) scores[rule.category] = { count: matched.length, keywords: matched }
  }

  if (Object.keys(scores).length === 0) {
    return {
      suggestedCategory: 'General Physician',
      confidence: 0.4,
      urgency: 'LOW',
      reason: 'No specific medical keywords found. Routed to General Physician.',
      keywords: [],
      manualReviewRequired: true,
      analysisSource: 'FALLBACK_RULE_ENGINE',
    }
  }

  const best = Object.entries(scores).sort((a, b) => b[1].count - a[1].count)[0]
  const totalMatches = Object.values(scores).reduce((sum, s) => sum + s.count, 0)
  const confidence = Math.min(0.95, 0.5 + (best[1].count / totalMatches) * 0.45)

  const urgencyKeywords = ['chest pain', 'stroke', 'fracture', 'seizure', 'paralysis', 'heart attack', 'severe']
  const urgency = urgencyKeywords.some(kw => text.includes(kw)) ? 'HIGH'
    : confidence > 0.75 ? 'MEDIUM' : 'LOW'

  return {
    suggestedCategory: best[0],
    confidence: parseFloat(confidence.toFixed(2)),
    urgency,
    reason: `Transcript matched ${best[1].count} keyword(s) for ${best[0]}: ${best[1].keywords.join(', ')}.`,
    keywords: best[1].keywords,
    manualReviewRequired: confidence < 0.6,
    analysisSource: 'FALLBACK_RULE_ENGINE',
  }
}

module.exports = { classifyTranscript }