import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Activity, AlertCircle } from 'lucide-react'

const Register = () => {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    age: '', 
    gender: 'Male', 
    phone: '' 
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = e => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!form.name.trim()) {
      newErrors.name = 'Full name is required'
    } else if (form.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (form.age && (form.age < 1 || form.age > 150)) {
      newErrors.age = 'Please enter a valid age'
    }

    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number (10 digits)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      await register({ ...form, role: 'PATIENT' })
      toast.success('Account created successfully!')
      navigate('/patient/dashboard')
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Registration failed'
      toast.error(message)
      console.error('Registration error:', err)
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

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Create Patient Account</h2>
          <p className="text-gray-500 text-sm mb-6">Register to upload reports and get doctor assignments</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input 
                name="name" 
                className={`input ${errors.name ? 'border-red-500' : ''}`}
                placeholder="John Doe"
                value={form.name} 
                onChange={handleChange} 
                disabled={loading}
              />
              {errors.name && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input 
                name="email" 
                type="email" 
                className={`input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="john@example.com"
                value={form.email} 
                onChange={handleChange} 
                disabled={loading}
              />
              {errors.email && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input 
                name="password" 
                type="password" 
                className={`input ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Min 6 characters"
                value={form.password} 
                onChange={handleChange} 
                disabled={loading}
              />
              {errors.password && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <input 
                name="confirmPassword" 
                type="password" 
                className={`input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="Re-enter password"
                value={form.confirmPassword} 
                onChange={handleChange} 
                disabled={loading}
              />
              {errors.confirmPassword && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.confirmPassword}</p>}
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input 
                  name="age" 
                  type="number" 
                  className={`input ${errors.age ? 'border-red-500' : ''}`}
                  placeholder="25"
                  value={form.age} 
                  onChange={handleChange} 
                  min={1} 
                  max={120}
                  disabled={loading}
                />
                {errors.age && <p className="text-red-600 text-xs mt-1">{errors.age}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select 
                  name="gender" 
                  className="input" 
                  value={form.gender} 
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input 
                name="phone" 
                className={`input ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="9876543210"
                value={form.phone} 
                onChange={handleChange}
                disabled={loading}
              />
              {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full py-2.5 disabled:opacity-60"
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