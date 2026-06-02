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

const AdminReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    api.get('/admin/reports').then(res => setReports(res.data)).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'ALL' ? reports : reports.filter(r => r.status === filter)

  return (
    <div className="flex">
      <Sidebar links={navLinks} />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reports Queue</h1>
          <p className="text-gray-500">All patient reports with AI routing results</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {['ALL', 'PENDING', 'ASSIGNED', 'REVIEWED'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="card">
          {loading ? <p className="text-center py-12 text-gray-400">Loading...</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Report ID</th>
                <th className="pb-3">Patient</th>
                <th className="pb-3">AI Category</th>
                <th className="pb-3">Confidence</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="py-3 text-xs font-mono text-gray-400">{r._id.slice(-6).toUpperCase()}</td>
                    <td className="py-3 font-medium">{r.patient?.name}</td>
                    <td className="py-3 text-blue-600">{r.aiResult?.suggestedCategory || '—'}</td>
                    <td className="py-3">{r.aiResult?.confidence ? `${Math.round(r.aiResult.confidence * 100)}%` : '—'}</td>
                    <td className="py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="py-3"><StatusBadge status={r.status} /></td>
                    <td className="py-3 flex gap-3">
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

export default AdminReports