import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  // 1. If not logged in at all, boot to login portal
  if (!user) return <Navigate to="/login" replace />

  // 2. If roles are limited and the user doesn't match, send them to their native dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute