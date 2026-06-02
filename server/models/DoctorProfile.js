const mongoose = require('mongoose')

const doctorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  category: {
    type: String,
    enum: ['General Physician', 'Cardiologist', 'Dermatologist', 'Orthopedic', 'Neurologist', 'Gynecologist', 'Pediatrician', 'ENT Specialist', 'Diabetologist'],
    required: true
  },
  specialization: { type: String },
  experience: { type: Number, default: 0 },
  phone: { type: String },
  availability: { type: Boolean, default: true },
  shiftHours: { type: String, default: '09:00 AM - 05:00 PM' },
  responseTime: { type: String, default: '< 5 mins' },
}, { timestamps: true })

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema)