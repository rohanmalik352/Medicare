import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Activity } from 'lucide-react'

const ROLES = ['PATIENT', 'DOCTOR', 'ADMIN']

const Login = ({ defaultRole = 'PATIENT' }) => {
  const [role, setRole] = useState(defaultRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(email, password, role)
      toast.success(`Welcome back, ${user.name}!`)
      if (user.role === 'PATIENT') navigate('/patient/dashboard')
      else if (user.role === 'ADMIN') navigate('/admin/dashboard')
      else navigate('/doctor/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
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
          <div><div className="text-white text-2xl font-bold">4+</div>Doctor Categories</div>
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
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                  role === r ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" className="input" placeholder="e.g. doctor@medicare.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" className="input" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Signing in...' : `Sign In as ${role.charAt(0) + role.slice(1).toLowerCase()}`}
            </button>
          </form>

          {role === 'PATIENT' && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">Sign Up</Link>
            </p>
          )}

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-xs text-blue-700">
            <p className="font-semibold mb-1">Demo Credentials:</p>
            <p>Patient: naman@gmail.com / patient123</p>
            <p>Doctor: drrohan@medicare.com / doctor123</p>
            <p>Admin: admin@medicare.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login