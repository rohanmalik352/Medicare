import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import StatusBadge from '../../components/common/StatusBadge'
import api from '../../services/api'
import { LayoutDashboard, FileText, Upload, ArrowLeft, User, Brain } from 'lucide-react'

const navLinks = [
  { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patient/reports', icon: FileText, label: 'My Reports' },
  { to: '/patient/upload-report', icon: Upload, label: 'Upload Report' },
]

const ReportDetail = () => {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/reports/${id}`).then(res => setReport(res.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex"><Sidebar links={navLinks} /><main className="ml-64 flex-1 p-8 text-center py-20">Loading...</main></div>
  if (!report) return <div className="flex"><Sidebar links={navLinks} /><main className="ml-64 flex-1 p-8">Report not found</main></div>

  return (
    <div className="flex">
      <Sidebar links={navLinks} />
      <main className="ml-64 flex-1 p-8">
        <Link to="/patient/reports" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <ArrowLeft size={16} /> Back to Reports
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report Details</h1>
            <p className="text-gray-500 text-sm font-mono">ID: {report._id}</p>
          </div>
          <StatusBadge status={report.status} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Patient Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><User size={16} />Patient Information</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd className="font-medium">{report.patientName}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Age</dt><dd>{report.age}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Gender</dt><dd>{report.gender}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Phone</dt><dd>{report.phone}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Uploaded</dt><dd>{new Date(report.createdAt).toLocaleDateString()}</dd></div>
            </dl>
          </div>

          {/* Assigned Doctor */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Assigned Doctor</h3>
            {report.assignedDoctor ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                  {report.assignedDoctor.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{report.assignedDoctor.name}</p>
                  <p className="text-gray-500 text-sm">{report.assignedDoctor.email}</p>
                  {report.aiResult?.suggestedCategory && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{report.aiResult.suggestedCategory}</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No doctor assigned yet</p>
            )}
          </div>

          {/* AI Analysis */}
          {report.aiResult?.suggestedCategory && (
            <div className="card col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Brain size={16} />AI Analysis Result</h3>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 font-medium">Suggested Category</p>
                  <p className="font-bold text-blue-900 mt-1">{report.aiResult.suggestedCategory}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600 font-medium">Confidence</p>
                  <p className="font-bold text-green-900 mt-1">{Math.round((report.aiResult.confidence || 0) * 100)}%</p>
                </div>
                <div className={`rounded-lg p-3 ${report.aiResult.urgency === 'HIGH' ? 'bg-red-50' : report.aiResult.urgency === 'MEDIUM' ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                  <p className="text-xs text-gray-600 font-medium">Urgency</p>
                  <p className="font-bold mt-1">{report.aiResult.urgency}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-purple-600 font-medium">Source</p>
                  <p className="font-bold text-purple-900 mt-1 text-xs">{report.aiResult.analysisSource}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3"><span className="font-medium">Reason:</span> {report.aiResult.reason}</p>
              {report.aiResult.keywords?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {report.aiResult.keywords.map(k => (
                    <span key={k} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{k}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Transcript */}
          {(report.reportTranscript || report.symptoms) && (
            <div className="card col-span-2">
              <h3 className="font-semibold text-gray-900 mb-3">Report Transcript</h3>
              <p className="text-xs text-gray-400 mb-2">Source: {report.transcriptSource}</p>
              <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                {report.reportTranscript || report.symptoms}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ReportDetail