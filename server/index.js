const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const connectDB = require('./config/db')

// =========================================================================
// 1. TOP-LEVEL PROCESS GUARDS (Anti-Crash Emergency Net)
// Must be declared at the absolute top before executing any connections
// =========================================================================
process.on('uncaughtException', (err) => {
  console.error('🔥 CRITICAL ABORT PREVENTED (Uncaught Exception):', err.message)
  console.error(err.stack)
  // Process is kept alive safely. 
  // Keeps server from crashing if a connection drops out unexpectedly.
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ UNHANDLED PROMISE REJECTION AT:', promise, 'REASON:', reason)
})

// Initialize configs and DB
dotenv.config()
connectDB()

const app = express()

// =========================================================================
// 2. CORS & MIDDLEWARE CONFIGURATION
// =========================================================================
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost:5173',
      'https://medicare-azure-six.vercel.app',
      'https://medicare-git-main-rohanmalik801-8636s-projects.vercel.app'
    ]
    // If request has no origin (like mobile apps, curl, or server-to-server), or is allowed
    if (!origin || allowed.includes(origin)) {
      callback(null, true)
    } else {
      // Instead of letting an unhandled error bubble up natively, pass clean rejection details
      callback(new Error('CORS Policy Blocked: Origin unauthorized.'))
    }
  },
  credentials: true
}))

app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// =========================================================================
// 3. ROUTE REGISTRATIONS
// =========================================================================
app.use('/api/auth', require('./routes/auth'))
app.use('/api/doctors', require('./routes/doctors'))
app.use('/api/reports', require('./routes/reports'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/doctor', require('./routes/doctorRoutes'))

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'MediCare API running', timestamp: new Date() }))

// 4. 404 Route handler
app.use((req, res) => {
  res.status(404).json({ error: `Route endpoint not found: ${req.originalUrl}` })
})

// =========================================================================
// 5. ENHANCED CENTRALIZED ERROR HANDLING MIDDLEWARE
// =========================================================================
app.use((err, req, res, next) => {
  // Always log the comprehensive trace internally for debugging
  console.error('❌ Centralized Error Interceptor Stack:')
  console.error(err.stack || err)

  // A. Guard against customized CORS rule blockages
  if (err.message && err.message.includes('CORS Policy Blocked')) {
    return res.status(403).json({
      success: false,
      error: 'CORS Rejection',
      message: err.message
    })
  }

  // B. Guard against Multer file limitations (e.g. upload file breaches 10MB limit)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'Payload Size Limit Exceeded',
      message: 'File size too large! The maximum acceptable threshold is 10MB.'
    })
  }

  // C. Guard against Database Model schema validation breaks
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Database Schema Validation Failure',
      message: err.message
    })
  }

  // D. Guard against broken Object ID params parsing formats (CastError)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Resource Identifier Formatting Error',
      message: `Invalid format values detected for parameter resource properties: ${err.path}`
    })
  }

  // E. Final structural fallback to catch generic exceptions safely
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    success: false,
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected operation tracking variance occurred on our backend services.',
    // Only output full stack trace context details inside a development workspace environment
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`MediCare server running on port ${PORT}`))