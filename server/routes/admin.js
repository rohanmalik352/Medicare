const router = require('express').Router()
const { verifyToken, requireRole } = require('../middleware/auth')
const PatientReport = require('../models/PatientReport')
const User = require('../models/User')
const AIAnalysisLog = require('../models/AIAnalysisLog')
const { analyzeWithGemini } = require('../services/geminiService')
const { assignDoctor } = require('../services/assignmentService')

// GET /api/admin/reports
router.get('/reports', verifyToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const reports = await PatientReport.find()
      .populate('patient', 'name email')
      .populate('assignedDoctor', 'name email')
      .sort({ createdAt: -1 })
    res.json(reports)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/reports/:id
router.get('/reports/:id', verifyToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const report = await PatientReport.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('assignedDoctor', 'name email')
    if (!report) return res.status(404).json({ error: 'Report not found' })
    res.json(report)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/admin/reports/:id/assign-doctor — manual assignment
router.patch('/reports/:id/assign-doctor', verifyToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { doctorId } = req.body
    if (!doctorId) return res.status(400).json({ error: 'doctorId is required' })

    const doctor = await User.findOne({ _id: doctorId, role: 'DOCTOR' })
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' })

    const report = await PatientReport.findByIdAndUpdate(
      req.params.id,
      { assignedDoctor: doctorId, status: 'ASSIGNED' },
      { new: true }
    ).populate('patient', 'name email').populate('assignedDoctor', 'name email')

    if (!report) return res.status(404).json({ error: 'Report not found' })
    res.json({ message: 'Doctor assigned successfully', report })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/reports/:id/reanalyze
router.post('/reports/:id/reanalyze', verifyToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const report = await PatientReport.findById(req.params.id)
    if (!report) return res.status(404).json({ error: 'Report not found' })

    const transcript = report.reportTranscript || report.manualTranscript || report.symptoms
    const aiResult = await analyzeWithGemini(transcript)
    report.aiResult = aiResult

    const doctorId = await assignDoctor(aiResult.suggestedCategory)
    if (doctorId) { report.assignedDoctor = doctorId; report.status = 'ASSIGNED' }

    await report.save()
    await AIAnalysisLog.create({ report: report._id, inputTranscript: transcript, modelUsed: aiResult.analysisSource, responseJSON: aiResult, success: true })
    await report.populate('patient', 'name email')
    await report.populate('assignedDoctor', 'name email')
    res.json({ message: 'Reanalysis complete', report })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/patients
router.get('/patients', verifyToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const patients = await User.find({ role: 'PATIENT' }).select('-password')
    res.json(patients)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/stats
router.get('/stats', verifyToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'PATIENT' })
    const totalReports = await PatientReport.countDocuments()
    const pendingReports = await PatientReport.countDocuments({ status: 'PENDING' })
    const assignedReports = await PatientReport.countDocuments({ status: 'ASSIGNED' })
    const reviewedReports = await PatientReport.countDocuments({ status: 'REVIEWED' })
    const totalDoctors = await User.countDocuments({ role: 'DOCTOR' })
    res.json({ totalPatients, totalReports, pendingReports, assignedReports, reviewedReports, totalDoctors })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router