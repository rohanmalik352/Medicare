const mongoose = require('mongoose')

const patientProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  phone: { type: String },
  bloodGroup: { type: String },
  address: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('PatientProfile', patientProfileSchema)