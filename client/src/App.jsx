import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard'
import UploadReport from './pages/patient/UploadReport'
import MyReports from './pages/patient/MyReports'
import ReportDetail from './pages/patient/ReportDetail'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminReports from './pages/admin/AdminReports'
import AdminReportDetail from './pages/admin/AdminReportDetail'
import AdminPatients from './pages/admin/AdminPatients'
import AdminDoctors from './pages/admin/AdminDoctors'

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import AssignedReports from './pages/doctor/AssignedReports'
import DoctorReportDetail from './pages/doctor/DoctorReportDetail'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<Login defaultRole="ADMIN" />} />
          <Route path="/doctor/login" element={<Login defaultRole="DOCTOR" />} />
          <Route path="/register" element={<Register />} />

          {/* Patient */}
          <Route path="/patient/dashboard" element={<ProtectedRoute role="PATIENT"><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/upload-report" element={<ProtectedRoute role="PATIENT"><UploadReport /></ProtectedRoute>} />
          <Route path="/patient/reports" element={<ProtectedRoute role="PATIENT"><MyReports /></ProtectedRoute>} />
          <Route path="/patient/reports/:id" element={<ProtectedRoute role="PATIENT"><ReportDetail /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute role="ADMIN"><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/reports/:id" element={<ProtectedRoute role="ADMIN"><AdminReportDetail /></ProtectedRoute>} />
          <Route path="/admin/patients" element={<ProtectedRoute role="ADMIN"><AdminPatients /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute role="ADMIN"><AdminDoctors /></ProtectedRoute>} />

          {/* Doctor */}
          <Route path="/doctor/dashboard" element={<ProtectedRoute role="DOCTOR"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/assigned-reports" element={<ProtectedRoute role="DOCTOR"><AssignedReports /></ProtectedRoute>} />
          <Route path="/doctor/reports/:id" element={<ProtectedRoute role="DOCTOR"><DoctorReportDetail /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App