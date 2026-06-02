import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { LayoutDashboard, FileText, Upload, CloudUpload } from 'lucide-react'

const navLinks = [
  { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patient/reports', icon: FileText, label: 'My Reports' },
  { to: '/patient/upload-report', icon: Upload, label: 'Upload Report' },
]

const UploadReport = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ patientName: '', age: '', gender: 'Male', phone: '', symptoms: '', manualTranscript: '' })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showManual, setShowManual] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (file) fd.append('reportFile', file)

      const { data } = await api.post('/reports/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const reportId = data.report._id

      // Auto extract text
      if (file) {
        toast.loading('Extracting text from report...', { id: 'extract' })
        try {
          await api.post(`/reports/${reportId}/extract-text`)
          toast.success('Text extracted!', { id: 'extract' })
        } catch {
          toast.error('Extraction failed. Manual transcript used.', { id: 'extract' })
        }
      }

      // Auto analyze
      toast.loading('AI is analyzing your report...', { id: 'analyze' })
      await api.post(`/reports/${reportId}/analyze`)
      toast.success('Report analyzed & doctor assigned!', { id: 'analyze' })
      navigate(`/patient/reports/${reportId}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex">
      <Sidebar links={navLinks} />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Upload Medical Report</h1>
          <p className="text-gray-500">Our AI will analyze your report and assign the right doctor</p>
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Info */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Patient Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input name="patientName" className="input" placeholder="John Doe"
                    value={form.patientName} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                  <input name="age" type="number" className="input" placeholder="25"
                    value={form.age} onChange={handleChange} required min={1} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select name="gender" className="input" value={form.gender} onChange={handleChange}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input name="phone" className="input" placeholder="9876543210"
                    value={form.phone} onChange={handleChange} required />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms / Description *</label>
                  <textarea name="symptoms" className="input" rows={3}
                    placeholder="Describe your symptoms briefly..."
                    value={form.symptoms} onChange={handleChange} required />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Report File</h3>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                <CloudUpload size={36} className="text-gray-400 mb-2" />
                <p className="text-gray-600 font-medium">{file ? file.name : 'Drag & drop or click to browse'}</p>
                <p className="text-gray-400 text-sm mt-1">Supports PDF, JPG, PNG — Max 10MB</p>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => setFile(e.target.files[0])} />
              </label>
              <button type="button" onClick={() => setShowManual(!showManual)}
                className="text-sm text-blue-600 hover:underline mt-3">
                {showManual ? 'Hide' : '+ Add'} manual transcript (if file is not available)
              </button>
              {showManual && (
                <textarea name="manualTranscript" className="input mt-3" rows={4}
                  placeholder="Paste your report text here..."
                  value={form.manualTranscript} onChange={handleChange} />
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Processing...' : 'Upload & Analyze Report'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default UploadReport