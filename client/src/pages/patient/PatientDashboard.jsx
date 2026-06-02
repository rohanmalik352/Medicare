import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import StatusBadge from '../../components/common/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { LayoutDashboard, FileText, Upload, Plus } from 'lucide-react'

const navLinks = [
  { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patient/reports', icon: FileText, label: 'My Reports' },
  { to: '/patient/upload-report', icon: Upload, label: 'Upload Report' },
]

const PatientDashboard = () => {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reports/my').then(res => setReports(res.data)).finally(() => setLoading(false))
  }, [])

  const recent = reports.slice(0, 3)
  const assigned = reports.filter(r => r.status === 'ASSIGNED' || r.status === 'REVIEWED').length
  const pending = reports.filter(r => r.status === 'PENDING' || r.status === 'ANALYZING').length

  return (
    <div className="flex">
      <Sidebar links={navLinks} />
      <main className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500">Here's your health overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="card">
            <p className="text-sm text-gray-500">Total Reports</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{reports.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Assigned</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{assigned}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-3xl font-bold text-yellow-500 mt-1">{pending}</p>
          </div>
        </div>

        {/* Quick Upload */}
        <div className="card mb-8 border-dashed border-2 border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Upload a New Report</h3>
              <p className="text-blue-700 text-sm">Upload JPG, PNG, or PDF — AI will route you to the right doctor</p>
            </div>
            <Link to="/patient/upload-report" className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Upload Report
            </Link>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Reports</h3>
            <Link to="/patient/reports" className="text-blue-600 text-sm hover:underline">View all</Link>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FileText size={40} className="mx-auto mb-2 opacity-30" />
              <p>No reports yet. Upload your first report!</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Patient Name</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map(r => (
                  <tr key={r._id} className="py-2">
                    <td className="py-3 font-medium">{r.patientName}</td>
                    <td className="py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-blue-600">{r.aiResult?.suggestedCategory || '—'}</td>
                    <td className="py-3"><StatusBadge status={r.status} /></td>
                    <td className="py-3">
                      <Link to={`/patient/reports/${r._id}`} className="text-blue-600 hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}

export default PatientDashboard