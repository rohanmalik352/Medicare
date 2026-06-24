import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import StatusBadge from '../../components/common/StatusBadge'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { LayoutDashboard, FileText, Upload, ArrowLeft, User, Brain, AlertCircle, RefreshCw, Download } from 'lucide-react'

const navLinks = [
  { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patient/reports', icon: FileText, label: 'My Reports' },
  { to: '/patient/upload-report', icon: Upload, label: 'Upload Report' },
]

const ReportDetail = () => {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retrying, setRetrying] = useState(false)

  const fetchReport = async (showRetry = false) => {
    try {
      setError('')
      if (showRetry) setRetrying(true)
      else setLoading(true)

      const { data } = await api.get(`/reports/${id}`)
      setReport(data)
    } catch (err) {
      const errorMsg = 
        err.response?.status === 404 ? 'Report not found' :
        err.response?.data?.error || 'Failed to load report'
      
      setError(errorMsg)
      console.error('Fetch report error:', err)
      if (!showRetry) toast.error(errorMsg)
    } finally {
      setLoading(false)
      setRetrying(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [id])

  const handleRetry = () => {
    fetchReport(true)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex">
        <Sidebar links={navLinks} />
        <main className="ml-64 flex-1 p-8">
          <Link to="/patient/reports" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm">
            <ArrowLeft size={16} /> Back to Reports
          </Link>
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-400 mt-3">Loading report details...</p>
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (error && !report) {
    return (
      <div className="flex">
        <Sidebar links={navLinks} />
        <main className="ml-64 flex-1 p-8">
          <Link to="/patient/reports" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm">
            <ArrowLeft size={16} /> Back to Reports
          </Link>
          <div className="card text-center py-12">
            <AlertCircle size={48} className="mx-auto mb-3 text-red-400" />
            <p className="text-gray-900 font-medium mb-1">{error}</p>
            <p className="text-gray-500 text-sm mb-4">Unable to load this report</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={handleRetry}
                disabled={retrying}
                className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
              >
                <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} />
                {retrying ? 'Retrying...' : 'Try Again'}
              </button>
              <Link to="/patient/reports" className="btn-secondary py-2 px-4">Go Back</Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Report not found
  if (!report) {
    return (
      <div className="flex">
        <Sidebar links={navLinks} />
        <main className="ml-64 flex-1 p-8">
          <Link to="/patient/reports" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm">
            <ArrowLeft size={16} /> Back to Reports
          </Link>
          <div className="card text-center py-12">
            <FileText size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600 font-medium">Report not found</p>
            <Link to="/patient/reports" className="btn-primary mt-4 inline-block">Go Back</Link>
          </div>
        </main>
      </div>
    )
  }

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
          <div className="flex items-center gap-3">
            {report.reportFile && (
              <a 
                href={report.reportFile} 
                download 
                className="btn-secondary flex items-center gap-2"
                title="Download original report"
              >
                <Download size={16} /> Download
              </a>
            )}
            <StatusBadge status={report.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Patient Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><User size={16} />Patient Information</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Name</dt>
                <dd className="font-medium">{report.patientName || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Age</dt>
                <dd>{report.age || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Gender</dt>
                <dd>{report.gender || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Phone</dt>
                <dd>{report.phone || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Uploaded</dt>
                <dd>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '—'}</dd>
              </div>
            </dl>
          </div>

          {/* Assigned Doctor */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Assigned Doctor</h3>
            {report.assignedDoctor ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                  {report.assignedDoctor.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-semibold">{report.assignedDoctor.name || 'Unknown'}</p>
                  <p className="text-gray-500 text-sm">{report.assignedDoctor.email || '—'}</p>
                  {report.aiResult?.suggestedCategory && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">{report.aiResult.suggestedCategory}</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm">No doctor assigned yet</p>
                <p className="text-gray-300 text-xs mt-1">Waiting for AI analysis</p>
              </div>
            )}
          </div>

          {/* AI Analysis */}
          {report.aiResult?.suggestedCategory ? (
            <div className="card col-span-2">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Brain size={16} />AI Analysis Result</h3>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 font-medium">Suggested Category</p>
                  <p className="font-bold text-blue-900 mt-1">{report.aiResult.suggestedCategory || '—'}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600 font-medium">Confidence</p>
                  <p className="font-bold text-green-900 mt-1">{report.aiResult.confidence ? Math.round(report.aiResult.confidence * 100) : 0}%</p>
                </div>
                <div className={`rounded-lg p-3 ${
                  report.aiResult.urgency === 'HIGH' ? 'bg-red-50' : 
                  report.aiResult.urgency === 'MEDIUM' ? 'bg-yellow-50' : 
                  'bg-gray-50'
                }`}>
                  <p className="text-xs text-gray-600 font-medium">Urgency</p>
                  <p className="font-bold mt-1">{report.aiResult.urgency || 'LOW'}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-purple-600 font-medium">Source</p>
                  <p className="font-bold text-purple-900 mt-1 text-xs">{report.aiResult.analysisSource || 'Unknown'}</p>
                </div>
              </div>
              {report.aiResult.reason && (
                <p className="text-sm text-gray-600 mb-3"><span className="font-medium">Reason:</span> {report.aiResult.reason}</p>
              )}
              {report.aiResult.keywords?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {report.aiResult.keywords.map(k => (
                    <span key={k} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{k}</span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card col-span-2 text-center py-6">
              <Brain size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">AI analysis pending...</p>
            </div>
          )}

          {/* Transcript */}
          {(report.reportTranscript || report.symptoms) && (
            <div className="card col-span-2">
              <h3 className="font-semibold text-gray-900 mb-3">Report Content</h3>
              {report.transcriptSource && (
                <p className="text-xs text-gray-400 mb-2">Source: {report.transcriptSource}</p>
              )}
              <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto border border-gray-200">
                {report.reportTranscript || report.symptoms || 'No content available'}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ReportDetail