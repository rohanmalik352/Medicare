import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import StatusBadge from '../../components/common/StatusBadge'
import api from '../../services/api'
import { LayoutDashboard, FileText, Users, UserCog } from 'lucide-react'

const navLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/reports', icon: FileText, label: 'Reports Queue' },
  { to: '/admin/patients', icon: Users, label: 'Patient Registry' },
  { to: '/admin/doctors', icon: UserCog, label: 'Physician Staff' },
]

const AdminDashboard = () => {
  const [stats, setStats] = useState({})
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/reports')])
      .then(([s, r]) => { setStats(s.data); setReports(r.data.slice(0, 5)) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex">
      <Sidebar links={navLinks} />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
          <p className="text-gray-500">System metrics and routing activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Patients', value: stats.totalPatients, color: 'text-gray-900' },
            { label: 'Total Reports', value: stats.totalReports, color: 'text-gray-900' },
            { label: 'Pending', value: stats.pendingReports, color: 'text-yellow-600' },
            { label: 'Assigned', value: stats.assignedReports, color: 'text-blue-600' },
            { label: 'Reviewed', value: stats.reviewedReports, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value ?? '—'}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Reports */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Reports Queue</h3>
            <Link to="/admin/reports" className="text-blue-600 text-sm hover:underline">View all</Link>
          </div>
          {loading ? <p className="text-gray-400 text-center py-8">Loading...</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Report ID</th>
                <th className="pb-2">Patient</th>
                <th className="pb-2">AI Category</th>
                <th className="pb-2">Confidence</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="py-3 text-xs font-mono text-gray-400">{r._id.slice(-6).toUpperCase()}</td>
                    <td className="py-3 font-medium">{r.patient?.name}</td>
                    <td className="py-3 text-blue-600">{r.aiResult?.suggestedCategory || '—'}</td>
                    <td className="py-3">{r.aiResult?.confidence ? `${Math.round(r.aiResult.confidence * 100)}%` : '—'}</td>
                    <td className="py-3"><StatusBadge status={r.status} /></td>
                    <td className="py-3 flex gap-2">
                      <Link to={`/admin/reports/${r._id}`} className="text-blue-600 text-xs hover:underline">Review</Link>
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

export default AdminDashboard