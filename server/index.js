const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const connectDB = require('./config/db')

dotenv.config()
connectDB()

const app = express()

app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost:5173',
      'https://medicare-azure-six.vercel.app',
      'https://medicare-git-main-rohanmalik801-8636s-projects.vercel.app'
    ]
    if (!origin || allowed.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/doctors', require('./routes/doctors'))
app.use('/api/reports', require('./routes/reports'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/doctor', require('./routes/doctorRoutes'))

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'MediCare API running' }))

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }))

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`MediCare server running on port ${PORT}`))