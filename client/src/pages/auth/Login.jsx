import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Activity, AlertCircle, Eye, EyeOff } from 'lucide-react'

const ROLES = ['PATIENT', 'DOCTOR', 'ADMIN']

const Login = () => {
  const [role, setRole] = useState('PATIENT')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apiError, setApiError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const validateForm = () => {
    setError('')
    
    if (!email.trim()) {
      setError('Email is required')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email')
      return false
    }
    if (!password) {
      setError('Password is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setApiError('')

    if (!validateForm()) return

    setLoading(true)
    try {
      const user = await login(email, password, role)
      toast.success(`Welcome back, ${user.name}!`)
      
      if (user.role === 'PATIENT') navigate('/patient/dashboard')
      else if (user.role === 'ADMIN') navigate('/admin/dashboard')
      else navigate('/doctor/dashboard')
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Login failed'
      
      console.error('Login error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: errorMessage
      })

      setApiError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Activity size={22} className="text-white" />
          </div>
          <span className="text-white text-xl font-bold">MediCare AI</span>
        </div>
        <div>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Intelligent Doctor<br />Assignment System
          </h1>
          <p className="text-slate-400 text-lg">
            AI-powered routing connects patients with the right specialist automatically.
          </p>
        </div>
        <div className="flex gap-8 text-slate-400 text-sm">
          <div><div className="text-white text-2xl font-bold">9</div>Doctor Categories</div>
          <div><div className="text-white text-2xl font-bold">AI</div>Powered Routing</div>
          <div><div className="text-white text-2xl font-bold">3</div>User Roles</div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign In to Portal</h2>
            <p className="text-gray-500">Access your medical reports and clinical queues</p>
          </div>

          {/* Role tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            {ROLES.map(r => (
              <button
                key={r}
                onClick={() => { 
                  setRole(r)
                  setError('')
                  setApiError('')
                }}
                type="button"
                className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                  role === r ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Validation Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* API Error Alert */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700 font-medium">Login Failed</p>
                <p className="text-sm text-red-600 mt-1">{apiError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input 
                type="email" 
                className={`input ${error || apiError ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g. naman@gmail.com"
                value={email} 
                onChange={e => { 
                  setEmail(e.target.value)
                  if (error || apiError) {
                    setError('')
                    setApiError('')
                  }
                }}
                disabled={loading}
                required 
              />
              {error && error.includes('Email') && (
                <p className="text-red-600 text-xs mt-1">{error}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  className={`input pr-10 ${error || apiError ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="••••••••"
                  value={password} 
                  onChange={e => { 
                    setPassword(e.target.value)
                    if (error || apiError) {
                      setError('')
                      setApiError('')
                    }
                  }}
                  disabled={loading}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && error.includes('Password') && (
                <p className="text-red-600 text-xs mt-1">{error}</p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : (
                `Sign In as ${role.charAt(0) + role.slice(1).toLowerCase()}`
              )}
            </button>
          </form>

          {role === 'PATIENT' && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">Sign Up</Link>
            </p>
          )}

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-xs text-blue-700 space-y-1.5">
            <p className="font-semibold">Demo Credentials:</p>
            <div className="space-y-1">
              <p className="flex items-center gap-2">
                <span className="text-blue-600">👤</span>
                <span>Patient: <code className="bg-blue-100 px-1 rounded">naman@gmail.com</code> / <code className="bg-blue-100 px-1 rounded">patient123</code></span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-600">👨‍⚕️</span>
                <span>Doctor: <code className="bg-blue-100 px-1 rounded">drrohan@medicare.com</code> / <code className="bg-blue-100 px-1 rounded">doctor123</code></span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-blue-600">⚙️</span>
                <span>Admin: <code className="bg-blue-100 px-1 rounded">admin@medicare.com</code> / <code className="bg-blue-100 px-1 rounded">admin123</code></span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login