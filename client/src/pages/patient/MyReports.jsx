import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import StatusBadge from '../../components/common/StatusBadge'
import api from '../../services/api'
import { LayoutDashboard, FileText, Upload } from 'lucide-react'

const navLinks = [
  { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patient/reports', icon: FileText, label: 'My Reports' },
  { to: '/patient/upload-report', icon: Upload, label: 'Upload Report' },
]

const MyReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reports/my').then(res => setReports(res.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex">
      <Sidebar links={navLinks} />
      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
            <p className="text-gray-500">All your uploaded medical reports</p>
          </div>
          <Link to="/patient/upload-report" className="btn-primary">+ New Report</Link>
        </div>

        <div className="card">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No reports uploaded yet</p>
              <Link to="/patient/upload-report" className="btn-primary mt-4 inline-block">Upload First Report</Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Report ID</th>
                <th className="pb-3">Patient</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Assigned Doctor</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="py-3 text-gray-400 text-xs font-mono">{r._id.slice(-6).toUpperCase()}</td>
                    <td className="py-3 font-medium">{r.patientName}</td>
                    <td className="py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 text-blue-600">{r.aiResult?.suggestedCategory || '—'}</td>
                    <td className="py-3">{r.assignedDoctor?.name || <span className="text-gray-400">Not assigned</span>}</td>
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

export default MyReports