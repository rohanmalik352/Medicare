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

const AssignedReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/doctor/reports').then(res => setReports(res.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex">
      <Sidebar links={navLinks} />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Case Queue</h1>
          <p className="text-gray-500">All reports assigned to you</p>
        </div>
        <div className="card">
          {loading ? <p className="text-center py-12 text-gray-400">Loading...</p> : reports.length === 0 ? (
            <p className="text-center py-12 text-gray-400">No cases assigned yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Patient</th><th className="pb-3">Category</th><th className="pb-3">Symptoms</th><th className="pb-3">Date</th><th className="pb-3">Status</th><th className="pb-3">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium">{r.patientName}</td>
                    <td className="py-3 text-blue-600">{r.aiResult?.suggestedCategory || '—'}</td>
                    <td className="py-3 text-gray-500 max-w-xs truncate">{r.symptoms}</td>
                    <td className="py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="py-3"><StatusBadge status={r.status} /></td>
                    <td className="py-3"><Link to={`/doctor/reports/${r._id}`} className="text-blue-600 hover:underline">Review</Link></td>
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

export default AssignedReports