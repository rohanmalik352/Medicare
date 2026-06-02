const mongoose = require('mongoose')

const patientReportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  phone: { type: String, required: true },
  symptoms: { type: String, required: true },
  fileName: { type: String },
  filePath: { type: String },
  fileType: { type: String },
  reportTranscript: { type: String, default: '' },
  manualTranscript: { type: String, default: '' },
  transcriptSource: { type: String, enum: ['OCR', 'PDF_PARSE', 'MANUAL', 'NONE'], default: 'NONE' },
  aiResult: {
    suggestedCategory: { type: String },
    confidence: { type: Number },
    urgency: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] },
    reason: { type: String },
    keywords: [{ type: String }],
    manualReviewRequired: { type: Boolean, default: false },
    analysisSource: { type: String, enum: ['GEMINI', 'FALLBACK_RULE_ENGINE'], default: 'FALLBACK_RULE_ENGINE' },
  },
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: {
    type: String,
    enum: ['PENDING', 'ANALYZING', 'ASSIGNED', 'REVIEWED'],
    default: 'PENDING'
  },
}, { timestamps: true })

module.exports = mongoose.model('PatientReport', patientReportSchema)