import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import StatusBadge from '../../components/common/StatusBadge'
import api from '../../services/api'
import { LayoutDashboard, ClipboardList } from 'lucide-react'

const navLinks = [
  { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/doctor/assigned-reports', icon: ClipboardList, label: 'My Case Queue' },
]

const DoctorDashboard = () => {
  const [stats, setStats] = useState({})
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/doctor/stats'), api.get('/doctor/reports')])
      .then(([s, r]) => { setStats(s.data); setReports(r.data.slice(0, 5)) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex">
      <Sidebar links={navLinks} />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-500">Your assigned patient cases</p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <p className="text-3xl font-bold text-gray-900">{stats.total ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">Total Assigned Cases</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-yellow-500">{stats.pending ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">Pending Reviews</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-green-600">{stats.reviewed ?? 0}</p>
            <p className="text-sm text-gray-500 mt-1">Completed Reviews</p>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Assigned Cases</h3>
            <Link to="/doctor/assigned-reports" className="text-blue-600 text-sm hover:underline">View all</Link>
          </div>
          {loading ? <p className="text-center py-8 text-gray-400">Loading...</p> : reports.length === 0 ? (
            <p className="text-center py-8 text-gray-400">No cases assigned yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Patient</th><th className="pb-2">Category</th><th className="pb-2">Symptoms</th><th className="pb-2">Date</th><th className="pb-2">Status</th><th className="pb-2">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium">{r.patientName}</td>
                    <td className="py-3 text-blue-600">{r.aiResult?.suggestedCategory || '—'}</td>
                    <td className="py-3 text-gray-500 max-w-xs truncate">{r.symptoms}</td>
                    <td className="py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="py-3"><StatusBadge status={r.status} /></td>
                    <td className="py-3"><Link to={`/doctor/reports/${r._id}`} className="text-blue-600 hover:underline text-xs">Review</Link></td>
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

export default DoctorDashboard