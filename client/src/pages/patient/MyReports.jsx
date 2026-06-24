import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import StatusBadge from '../../components/common/StatusBadge'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { LayoutDashboard, FileText, Upload, AlertCircle, RefreshCw } from 'lucide-react'

const navLinks = [
  { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patient/reports', icon: FileText, label: 'My Reports' },
  { to: '/patient/upload-report', icon: Upload, label: 'Upload Report' },
]

const MyReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retrying, setRetrying] = useState(false)

  const fetchReports = async (showRetry = false) => {
    try {
      setError('')
      if (showRetry) setRetrying(true)
      else setLoading(true)
      
      const { data } = await api.get('/reports/my')
      setReports(Array.isArray(data) ? data : [])
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to load reports'
      setError(errorMsg)
      console.error('Fetch reports error:', err)
      if (!showRetry) toast.error(errorMsg)
    } finally {
      setLoading(false)
      setRetrying(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleRetry = () => {
    fetchReports(true)
  }

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

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium">Unable to load reports</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button 
              onClick={handleRetry}
              disabled={retrying}
              className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1 disabled:opacity-60"
            >
              <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} />
              {retrying ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        )}

        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-400 mt-3">Loading your reports...</p>
            </div>
          ) : error && reports.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle size={48} className="mx-auto mb-3 text-red-400" />
              <p className="text-gray-600 font-medium mb-2">Failed to load reports</p>
              <p className="text-gray-400 text-sm mb-4">{error}</p>
              <button 
                onClick={handleRetry}
                disabled={retrying}
                className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
              >
                <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} />
                {retrying ? 'Retrying...' : 'Try Again'}
              </button>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No reports uploaded yet</p>
              <Link to="/patient/upload-report" className="btn-primary mt-4 inline-block">Upload First Report</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500 border-b">
                  <th className="pb-3 px-2">Report ID</th>
                  <th className="pb-3 px-2">Patient</th>
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2">Category</th>
                  <th className="pb-3 px-2">Doctor</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2">Action</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {reports.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-2 text-gray-400 text-xs font-mono">{r._id?.slice(-6).toUpperCase() || '—'}</td>
                      <td className="py-3 px-2 font-medium">{r.patientName || '—'}</td>
                      <td className="py-3 px-2 text-gray-500">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                      <td className="py-3 px-2 text-blue-600">{r.aiResult?.suggestedCategory || '—'}</td>
                      <td className="py-3 px-2">{r.assignedDoctor?.name || <span className="text-gray-400 text-xs">Not assigned</span>}</td>
                      <td className="py-3 px-2"><StatusBadge status={r.status} /></td>
                      <td className="py-3 px-2">
                        <Link to={`/patient/reports/${r._id}`} className="text-blue-600 hover:underline text-xs font-medium">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default MyReports