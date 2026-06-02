const DoctorProfile = require('../models/DoctorProfile')
const User = require('../models/User')

const assignDoctor = async (suggestedCategory) => {
  try {
    // Find available doctor in suggested category
    const doctorProfile = await DoctorProfile.findOne({
      category: suggestedCategory,
      availability: true
    }).populate('user')

    if (doctorProfile) return doctorProfile.user._id

    // Fallback: find any available doctor
    const anyDoctor = await DoctorProfile.findOne({ availability: true }).populate('user')
    if (anyDoctor) return anyDoctor.user._id

    return null
  } catch (err) {
    console.error('Assignment error:', err.message)
    return null
  }
}

module.exports = { assignDoctor }