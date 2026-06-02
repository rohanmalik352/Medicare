import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Activity } from 'lucide-react'

const Register = () => {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    age: '', 
    gender: 'Male', 
    phone: '' 
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Formulate payload parameters with clear sanitization guards
      const signupPayload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        age: form.age ? parseInt(form.age, 10) : undefined,
        gender: form.gender.toUpperCase(), // Match uppercase backend schema enums securely
        phone: form.phone.trim(),
        role: 'PATIENT'
      }

      // Fire off context registration that handles network/server errors internally
      const result = await register(signupPayload)

      // Handle server duplicate key warnings or validation rejects gracefully
      if (!result.success) {
        toast.error(result.error || 'Registration failed')
        return
      }

      // Verify that user state context updated accurately before executing side effects
      if (result.user) {
        toast.success('Account created successfully!')
        navigate('/patient/dashboard')
      } else {
        throw new Error('Server registered user profile but data payload is corrupted.')
      }

    } catch (err) {
      console.error('❌ Registration UI Interface Intercept Failure:', err.message)
      toast.error('An unexpected interface error occurred during registration. Please check inputs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Activity size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">MediCare AI</span>
        </div>

        {/* Card Container Layout Wrapper */}
        <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Create Patient Account</h2>
          <p className="text-gray-500 text-sm mb-6">Register to upload reports and get doctor assignments</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                name="name" 
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="John Doe"
                value={form.name} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                name="email" 
                type="email" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="john@example.com"
                value={form.email} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                name="password" 
                type="password" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Min 6 characters"
                value={form.password} 
                onChange={handleChange} 
                required 
                minLength={6} 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input 
                  name="age" 
                  type="number" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="25"
                  value={form.age} 
                  onChange={handleChange} 
                  min={1} 
                  max={120} 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select 
                  name="gender" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={form.gender} 
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input 
                name="phone" 
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="9876543210"
                value={form.phone} 
                onChange={handleChange} 
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition text-sm shadow-sm"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register