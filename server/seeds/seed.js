const mongoose = require('mongoose')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.join(__dirname, '../.env') })

const User = require('../models/User')
const DoctorProfile = require('../models/DoctorProfile')
const PatientProfile = require('../models/PatientProfile')

const connectDB = require('../config/db')

const seed = async () => {
  await connectDB()
  console.log('🌱 Seeding database...')

  await User.deleteMany({})
  await DoctorProfile.deleteMany({})
  await PatientProfile.deleteMany({})

  // Admin
  const admin = await User.create({ name: 'Admin User', email: 'admin@medicare.com', password: 'admin123', role: 'ADMIN' })
  console.log('✅ Admin created:', admin.email)

  // Doctors
  const doctorData = [
    { name: 'Dr. Rohan Malik', email: 'drrohan@medicare.com', category: 'Cardiologist', specialization: 'Interventional Cardiology', experience: 10 },
    { name: 'Dr. Priya Singh', email: 'drpriya@medicare.com', category: 'Dermatologist', specialization: 'Cosmetic Dermatology', experience: 7 },
    { name: 'Dr. Amit Kumar', email: 'dramit@medicare.com', category: 'Orthopedic', specialization: 'Joint Replacement', experience: 12 },
    { name: 'Dr. Neha Gupta', email: 'drneha@medicare.com', category: 'General Physician', specialization: 'Family Medicine', experience: 5 },
    { name: 'Dr. Vikram Patel', email: 'drvikram@medicare.com', category: 'Neurologist', specialization: 'Stroke & Epilepsy', experience: 9 },
    { name: 'Dr. Sunita Rao', email: 'drsunita@medicare.com', category: 'Diabetologist', specialization: 'Endocrinology', experience: 8 },
  ]

  for (const d of doctorData) {
    const user = await User.create({ name: d.name, email: d.email, password: 'doctor123', role: 'DOCTOR' })
    await DoctorProfile.create({ user: user._id, category: d.category, specialization: d.specialization, experience: d.experience, availability: true })
    console.log(`✅ Doctor created: ${d.email}`)
  }

  // Patients
  const patientData = [
    { name: 'Naman Chaudhary', email: 'naman@gmail.com', age: 25, gender: 'Male', phone: '9876543210' },
    { name: 'Aditya Chandra', email: 'aditya@gmail.com', age: 30, gender: 'Male', phone: '9876543211' },
  ]

  for (const p of patientData) {
    const user = await User.create({ name: p.name, email: p.email, password: 'patient123', role: 'PATIENT' })
    await PatientProfile.create({ user: user._id, age: p.age, gender: p.gender, phone: p.phone })
    console.log(`✅ Patient created: ${p.email}`)
  }

  console.log('\n🎉 Seeding complete!')
  console.log('\n📋 Test Credentials:')
  console.log('Admin:   admin@medicare.com / admin123')
  console.log('Doctor:  drrohan@medicare.com / doctor123')
  console.log('Patient: naman@gmail.com / patient123')
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })