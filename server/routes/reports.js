const router = require('express').Router()
const { verifyToken, requireRole } = require('../middleware/auth')
const upload = require('../middleware/upload')
const PatientReport = require('../models/PatientReport')
const AIAnalysisLog = require('../models/AIAnalysisLog')
const { extractText } = require('../services/ocrService')
const { analyzeWithGemini } = require('../services/geminiService')
const { assignDoctor } = require('../services/assignmentService')
const path = require('path')

// POST /api/reports/upload — patient uploads report
router.post('/upload', verifyToken, requireRole('PATIENT'), upload.single('reportFile'), async (req, res) => {
  try {
    const { patientName, age, gender, phone, symptoms, manualTranscript } = req.body
    if (!patientName || !age || !gender || !phone || !symptoms)
      return res.status(400).json({ error: 'All fields are required' })

    const reportData = {
      patient: req.user._id,
      patientName, age, gender, phone, symptoms,
      status: 'PENDING'
    }

    if (req.file) {
      reportData.fileName = req.file.originalname
      reportData.filePath = req.file.path
      reportData.fileType = req.file.mimetype
    }

    if (manualTranscript) {
      reportData.manualTranscript = manualTranscript
      reportData.reportTranscript = manualTranscript
      reportData.transcriptSource = 'MANUAL'
    }

    const report = await PatientReport.create(reportData)
    res.status(201).json({ message: 'Report uploaded successfully', report })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/reports/:id/extract-text
router.post('/:id/extract-text', verifyToken, requireRole('PATIENT'), async (req, res) => {
  try {
    const report = await PatientReport.findOne({ _id: req.params.id, patient: req.user._id })
    if (!report) return res.status(404).json({ error: 'Report not found' })

    if (!report.filePath) {
      return res.status(400).json({ error: 'No file uploaded. Please provide manual transcript.' })
    }

    report.status = 'ANALYZING'
    await report.save()

    const { text, source, error } = await extractText(report.filePath, report.fileType)

    if (!text || text.length < 10) {
      return res.status(200).json({
        message: 'Text extraction failed. Please enter transcript manually.',
        extracted: false,
        report
      })
    }

    report.reportTranscript = text
    report.transcriptSource = source
    await report.save()

    res.json({ message: 'Text extracted successfully', extracted: true, transcript: text, report })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/reports/:id/analyze
router.post('/:id/analyze', verifyToken, requireRole('PATIENT'), async (req, res) => {
  try {
    const report = await PatientReport.findOne({ _id: req.params.id, patient: req.user._id })
    if (!report) return res.status(404).json({ error: 'Report not found' })

    const transcript = report.reportTranscript || report.manualTranscript || report.symptoms
    if (!transcript) return res.status(400).json({ error: 'No transcript available for analysis' })

    const aiResult = await analyzeWithGemini(transcript)
    report.aiResult = aiResult

    // Auto assign doctor
    const doctorId = await assignDoctor(aiResult.suggestedCategory)
    if (doctorId) {
      report.assignedDoctor = doctorId
      report.status = 'ASSIGNED'
    } else {
      report.status = 'PENDING'
    }

    await report.save()

    // Log AI analysis
    await AIAnalysisLog.create({
      report: report._id,
      inputTranscript: transcript,
      modelUsed: aiResult.analysisSource,
      responseJSON: aiResult,
      success: true
    })

    await report.populate('assignedDoctor', 'name email')
    res.json({ message: 'Analysis complete', report })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/reports/my — patient's own reports
router.get('/my', verifyToken, requireRole('PATIENT'), async (req, res) => {
  try {
    const reports = await PatientReport.find({ patient: req.user._id })
      .populate('assignedDoctor', 'name email')
      .sort({ createdAt: -1 })
    res.json(reports)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/reports/:id — patient views single report
router.get('/:id', verifyToken, requireRole('PATIENT'), async (req, res) => {
  try {
    const report = await PatientReport.findOne({ _id: req.params.id, patient: req.user._id })
      .populate('assignedDoctor', 'name email')
    if (!report) return res.status(404).json({ error: 'Report not found' })
    res.json(report)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router