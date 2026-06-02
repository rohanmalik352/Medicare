const router = require('express').Router()
const { verifyToken, requireRole } = require('../middleware/auth')
const DoctorProfile = require('../models/DoctorProfile')
const User = require('../models/User')
const bcrypt = require('bcryptjs')

// GET /api/doctors — admin only
router.get('/', verifyToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const doctors = await DoctorProfile.find().populate('user', 'name email')
    res.json(doctors)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/doctors/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const doctor = await DoctorProfile.findById(req.params.id).populate('user', 'name email')
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' })
    res.json(doctor)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/doctors — admin creates doctor
router.post('/', verifyToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, email, password, category, specialization, experience, phone, shiftHours, responseTime } = req.body
    if (!name || !email || !password || !category)
      return res.status(400).json({ error: 'Name, email, password and category are required' })

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ error: 'Email already registered' })

    const user = await User.create({ name, email, password, role: 'DOCTOR' })
    const profile = await DoctorProfile.create({
      user: user._id, category, specialization, experience, phone, shiftHours, responseTime
    })
    res.status(201).json({ user, profile })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/doctors/:id — admin updates doctor
router.patch('/:id', verifyToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const profile = await DoctorProfile.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user', 'name email')
    if (!profile) return res.status(404).json({ error: 'Doctor not found' })
    res.json(profile)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router