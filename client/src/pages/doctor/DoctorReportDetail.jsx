import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import StatusBadge from '../../components/common/StatusBadge'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { LayoutDashboard, ClipboardList, ArrowLeft, Brain, CheckCircle } from 'lucide-react'

const navLinks = [
  { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/doctor/assigned-reports', icon: ClipboardList, label: 'My Case Queue' },
]

const DoctorReportDetail = () => {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    api.get(`/doctor/reports/${id}`).then(res => setReport(res.data)).finally(() => setLoading(false))
  }, [id])

  const handleMarkReviewed = async () => {
    setMarking(true)
    try {
      const { data } = await api.patch(`/doctor/reports/${id}/mark-reviewed`)
      setReport(data.report)
      toast.success('Case marked as reviewed')
    } catch (err) {
      toast.error('Failed to update status')
    } finally { setMarking(false) }
  }

  if (loading) return <div className="flex"><Sidebar links={navLinks} /><main className="ml-64 p-8 text-gray-400">Loading...</main></div>
  if (!report) return <div className="flex"><Sidebar links={navLinks} /><main className="ml-64 p-8">Report not found</main></div>

  return (
    <div className="flex">
      <Sidebar links={navLinks} />
      <main className="ml-64 flex-1 p-8">
        <Link to="/doctor/assigned-reports" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <ArrowLeft size={16} /> Back to Queue
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Case Review</h1>
            <p className="text-sm text-gray-500">Patient: {report.patientName}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={report.status} />
            {report.status !== 'REVIEWED' && (
              <button onClick={handleMarkReviewed} disabled={marking}
                className="btn-primary flex items-center gap-2">
                <CheckCircle size={16} />
                {marking ? 'Updating...' : 'Mark as Reviewed'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Patient Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd className="font-medium">{report.patientName}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Age / Gender</dt><dd>{report.age} / {report.gender}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Phone</dt><dd>{report.phone}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Date</dt><dd>{new Date(report.createdAt).toLocaleDateString()}</dd></div>
            </dl>
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm font-medium text-gray-500">Symptoms</p>
              <p className="text-sm mt-1">{report.symptoms}</p>
            </div>
          </div>

          {report.aiResult?.suggestedCategory && (
            <div className="card">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Brain size={16} />AI Routing Reason</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Suggested Category</span>
                  <span className="font-semibold text-blue-600">{report.aiResult.suggestedCategory}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Confidence</span>
                  <span className="font-semibold">{Math.round((report.aiResult.confidence || 0) * 100)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Urgency</span>
                  <span className={`font-semibold ${report.aiResult.urgency === 'HIGH' ? 'text-red-600' : report.aiResult.urgency === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {report.aiResult.urgency}
                  </span>
                </div>
                <div className="pt-2 border-t text-sm">
                  <p className="text-gray-500 mb-1">Reason</p>
                  <p>{report.aiResult.reason}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {report.aiResult.keywords?.map(k => <span key={k} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{k}</span>)}
                </div>
              </div>
            </div>
          )}

          {report.reportTranscript && (
            <div className="card col-span-2">
              <h3 className="font-semibold mb-3">Report Transcript</h3>
              <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">
                {report.reportTranscript}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default DoctorReportDetail
