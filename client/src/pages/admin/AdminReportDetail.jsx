import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import StatusBadge from '../../components/common/StatusBadge'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { LayoutDashboard, FileText, Users, UserCog, ArrowLeft, Brain, RefreshCw } from 'lucide-react'

const navLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/reports', icon: FileText, label: 'Reports Queue' },
  { to: '/admin/patients', icon: Users, label: 'Patient Registry' },
  { to: '/admin/doctors', icon: UserCog, label: 'Physician Staff' },
]

const AdminReportDetail = () => {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [reanalyzing, setReanalyzing] = useState(false)

  useEffect(() => {
    Promise.all([api.get(`/admin/reports/${id}`), api.get('/doctors')])
      .then(([r, d]) => { setReport(r.data); setDoctors(d.data); setSelectedDoctor(r.data.assignedDoctor?._id || '') })
      .finally(() => setLoading(false))
  }, [id])

  const handleAssign = async () => {
    if (!selectedDoctor) return toast.error('Select a doctor')
    setAssigning(true)
    try {
      const { data } = await api.patch(`/admin/reports/${id}/assign-doctor`, { doctorId: selectedDoctor })
      setReport(data.report)
      toast.success('Doctor assigned successfully')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Assignment failed')
    } finally { setAssigning(false) }
  }

  const handleReanalyze = async () => {
    setReanalyzing(true)
    try {
      const { data } = await api.post(`/admin/reports/${id}/reanalyze`)
      setReport(data.report)
      toast.success('Reanalysis complete')
    } catch (err) {
      toast.error('Reanalysis failed')
    } finally { setReanalyzing(false) }
  }

  if (loading) return <div className="flex"><Sidebar links={navLinks} /><main className="ml-64 flex-1 p-8 text-center py-20 text-gray-400">Loading...</main></div>

  return (
    <div className="flex">
      <Sidebar links={navLinks} />
      <main className="ml-64 flex-1 p-8">
        <Link to="/admin/reports" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <ArrowLeft size={16} /> Back to Reports
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report Review</h1>
            <p className="text-sm text-gray-500 font-mono">ID: {report._id}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={report.status} />
            <button onClick={handleReanalyze} disabled={reanalyzing}
              className="btn-secondary flex items-center gap-2 text-sm">
              <RefreshCw size={14} className={reanalyzing ? 'animate-spin' : ''} />
              {reanalyzing ? 'Reanalyzing...' : 'Reanalyze'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Patient Info */}
          <div className="card">
            <h3 className="font-semibold mb-4">Patient Information</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd className="font-medium">{report.patientName}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Age / Gender</dt><dd>{report.age} / {report.gender}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Phone</dt><dd>{report.phone}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Uploaded</dt><dd>{new Date(report.createdAt).toLocaleString()}</dd></div>
            </dl>
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-gray-500 font-medium">Symptoms</p>
              <p className="text-sm mt-1">{report.symptoms}</p>
            </div>
          </div>

          {/* Manual Assignment */}
          <div className="card">
            <h3 className="font-semibold mb-4">Assign Doctor</h3>
            <select className="input mb-3" value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
              <option value="">Select a doctor...</option>
              {doctors.map(d => (
                <option key={d._id} value={d.user?._id}>{d.user?.name} — {d.category}</option>
              ))}
            </select>
            <button onClick={handleAssign} disabled={assigning} className="btn-primary w-full">
              {assigning ? 'Assigning...' : 'Assign Doctor'}
            </button>
            {report.assignedDoctor && (
              <p className="text-sm text-green-600 mt-2">Currently: {report.assignedDoctor.name}</p>
            )}
          </div>

          {/* AI Result */}
          {report.aiResult?.suggestedCategory && (
            <div className="card col-span-2">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Brain size={16} />AI Routing Result</h3>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600">Suggested Category</p>
                  <p className="font-bold text-blue-900 mt-1">{report.aiResult.suggestedCategory}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600">Confidence</p>
                  <p className="font-bold text-green-900 mt-1">{Math.round((report.aiResult.confidence || 0) * 100)}%</p>
                </div>
                <div className={`rounded-lg p-3 ${report.aiResult.urgency === 'HIGH' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                  <p className="text-xs text-gray-600">Urgency</p>
                  <p className="font-bold mt-1">{report.aiResult.urgency}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-purple-600">Source</p>
                  <p className="font-bold text-purple-900 text-xs mt-1">{report.aiResult.analysisSource}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2"><strong>Reason:</strong> {report.aiResult.reason}</p>
              <div className="flex gap-2 flex-wrap">
                {report.aiResult.keywords?.map(k => <span key={k} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{k}</span>)}
              </div>
            </div>
          )}

          {/* Transcript */}
          {report.reportTranscript && (
            <div className="card col-span-2">
              <h3 className="font-semibold mb-3">Report Transcript <span className="text-xs text-gray-400">({report.transcriptSource})</span></h3>
              <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">{report.reportTranscript}</pre>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminReportDetail