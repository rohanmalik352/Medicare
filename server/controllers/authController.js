const jwt = require('jsonwebtoken')
const User = require('../models/User')
const PatientProfile = require('../models/PatientProfile')
const DoctorProfile = require('../models/DoctorProfile')

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, age, gender, phone } = req.body
    if (!name || !email || !password || !role)
      return res.status(400).json({ error: 'Name, email, password and role are required' })

    if (!['PATIENT', 'ADMIN', 'DOCTOR'].includes(role))
      return res.status(400).json({ error: 'Invalid role' })

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ error: 'Email already registered' })

    const user = await User.create({ name, email, password, role })

    if (role === 'PATIENT') {
      await PatientProfile.create({ user: user._id, age, gender, phone })
    }

    const token = generateToken(user)
    res.status(201).json({ token, user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const user = await User.findOne({ email }).select('+password')
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    if (role && user.role !== role)
      return res.status(401).json({ error: `This account is not a ${role}` })

    const match = await user.comparePassword(password)
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })

    const token = generateToken(user)
    res.json({ token, user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    let profile = null
    if (user.role === 'PATIENT') profile = await PatientProfile.findOne({ user: user._id })
    if (user.role === 'DOCTOR') profile = await DoctorProfile.findOne({ user: user._id })
    res.json({ user, profile })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { register, login, getMe }