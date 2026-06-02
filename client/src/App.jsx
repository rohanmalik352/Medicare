import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()

  // 1. If context is actively communicating with the backend, freeze routing evaluation
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  // 2. If the validation state complete and no valid user exists, return to login portal
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // 3. If user role doesn't match the required route role, safely cross-route them to their correct home base
  if (role && user.role !== role) {
    if (user.role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute