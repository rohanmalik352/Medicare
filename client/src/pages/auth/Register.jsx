import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Activity } from 'lucide-react'

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', gender: 'Male', phone: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register({ ...form, role: 'PATIENT' })
      toast.success('Account created successfully!')
      navigate('/patient/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input name="name" className="input" placeholder="John Doe"
                value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" type="email" className="input" placeholder="john@example.com"
                value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input name="password" type="password" className="input" placeholder="Min 6 characters"
                value={form.password} onChange={handleChange} required minLength={6} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input name="age" type="number" className="input" placeholder="25"
                  value={form.age} onChange={handleChange} min={1} max={120} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select name="gender" className="input" value={form.gender} onChange={handleChange}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input name="phone" className="input" placeholder="9876543210"
                value={form.phone} onChange={handleChange} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
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