import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) {
    if (user.role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />
  }

  return children
}

export default ProtectedRoute