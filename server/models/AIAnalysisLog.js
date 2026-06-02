const mongoose = require('mongoose')

const aiAnalysisLogSchema = new mongoose.Schema({
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'PatientReport', required: true },
  inputTranscript: { type: String },
  modelUsed: { type: String, enum: ['GEMINI', 'FALLBACK_RULE_ENGINE'] },
  responseJSON: { type: mongoose.Schema.Types.Mixed },
  success: { type: Boolean, default: true },
  errorMessage: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('AIAnalysisLog', aiAnalysisLogSchema)