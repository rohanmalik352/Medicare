const router = require('express').Router()
const { verifyToken, requireRole } = require('../middleware/auth')
const PatientReport = require('../models/PatientReport')
const DoctorProfile = require('../models/DoctorProfile')

// GET /api/doctor/reports — doctor sees assigned reports
router.get('/reports', verifyToken, requireRole('DOCTOR'), async (req, res) => {
  try {
    const reports = await PatientReport.find({ assignedDoctor: req.user._id })
      .populate('patient', 'name email')
      .sort({ createdAt: -1 })
    res.json(reports)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/doctor/reports/:id
router.get('/reports/:id', verifyToken, requireRole('DOCTOR'), async (req, res) => {
  try {
    const report = await PatientReport.findOne({ _id: req.params.id, assignedDoctor: req.user._id })
      .populate('patient', 'name email')
    if (!report) return res.status(404).json({ error: 'Report not found or not assigned to you' })
    res.json(report)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/doctor/reports/:id/mark-reviewed
router.patch('/reports/:id/mark-reviewed', verifyToken, requireRole('DOCTOR'), async (req, res) => {
  try {
    const report = await PatientReport.findOneAndUpdate(
      { _id: req.params.id, assignedDoctor: req.user._id },
      { status: 'REVIEWED' },
      { new: true }
    ).populate('patient', 'name email')
    if (!report) return res.status(404).json({ error: 'Report not found' })
    res.json({ message: 'Report marked as reviewed', report })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/doctor/stats
router.get('/stats', verifyToken, requireRole('DOCTOR'), async (req, res) => {
  try {
    const total = await PatientReport.countDocuments({ assignedDoctor: req.user._id })
    const pending = await PatientReport.countDocuments({ assignedDoctor: req.user._id, status: 'ASSIGNED' })
    const reviewed = await PatientReport.countDocuments({ assignedDoctor: req.user._id, status: 'REVIEWED' })
    res.json({ total, pending, reviewed })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router