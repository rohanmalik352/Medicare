import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { LayoutDashboard, FileText, Upload, CloudUpload, AlertCircle } from 'lucide-react'

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
  const [errors, setErrors] = useState({})

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']

  const handleChange = e => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setErrors({ ...errors, file: '' })

    if (!selectedFile) {
      setFile(null)
      return
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setErrors({ ...errors, file: 'Only PDF, JPG, and PNG files are allowed' })
      return
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrors({ ...errors, file: 'File size exceeds 10MB limit' })
      return
    }

    setFile(selectedFile)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!form.patientName.trim()) newErrors.patientName = 'Patient name is required'
    if (!form.age) newErrors.age = 'Age is required'
    else if (form.age < 1 || form.age > 150) newErrors.age = 'Please enter a valid age'
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) newErrors.phone = 'Phone must be 10 digits'
    if (!form.symptoms.trim()) newErrors.symptoms = 'Please describe symptoms'
    if (!file && !form.manualTranscript.trim()) newErrors.uploadError = 'Upload a file or provide manual transcript'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors below')
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (file) fd.append('reportFile', file)

      // Step 1: Upload report
      toast.loading('Uploading report...', { id: 'upload' })
      const { data } = await api.post('/reports/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Report uploaded!', { id: 'upload' })
      const reportId = data.report._id

      // Step 2: Extract text (if file exists)
      if (file) {
        toast.loading('Extracting text from report...', { id: 'extract' })
        try {
          await api.post(`/reports/${reportId}/extract-text`)
          toast.success('Text extracted!', { id: 'extract' })
        } catch (extractErr) {
          console.warn('Extraction failed:', extractErr)
          toast.error('Text extraction failed. Using manual transcript.', { id: 'extract' })
        }
      }

      // Step 3: Analyze
      toast.loading('AI is analyzing your report...', { id: 'analyze' })
      try {
        await api.post(`/reports/${reportId}/analyze`)
        toast.success('Analysis complete! Doctor assigned.', { id: 'analyze' })
      } catch (analyzeErr) {
        console.error('Analysis failed:', analyzeErr)
        toast.error('Analysis failed. Please try again.', { id: 'analyze' })
        navigate(`/patient/reports/${reportId}`)
        return
      }

      navigate(`/patient/reports/${reportId}`)
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Upload failed'
      toast.error(message)
      console.error('Upload error:', err)
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
                  <input 
                    name="patientName" 
                    className={`input ${errors.patientName ? 'border-red-500' : ''}`}
                    placeholder="John Doe"
                    value={form.patientName} 
                    onChange={handleChange} 
                    disabled={loading}
                  />
                  {errors.patientName && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.patientName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                  <input 
                    name="age" 
                    type="number" 
                    className={`input ${errors.age ? 'border-red-500' : ''}`}
                    placeholder="25"
                    value={form.age} 
                    onChange={handleChange} 
                    disabled={loading}
                    min={1}
                  />
                  {errors.age && <p className="text-red-600 text-xs mt-1">{errors.age}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select 
                    name="gender" 
                    className="input" 
                    value={form.gender} 
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input 
                    name="phone" 
                    className={`input ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="9876543210"
                    value={form.phone} 
                    onChange={handleChange} 
                    disabled={loading}
                  />
                  {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms / Description *</label>
                  <textarea 
                    name="symptoms" 
                    className={`input ${errors.symptoms ? 'border-red-500' : ''}`}
                    rows={3}
                    placeholder="Describe your symptoms briefly..."
                    value={form.symptoms} 
                    onChange={handleChange} 
                    disabled={loading}
                  />
                  {errors.symptoms && <p className="text-red-600 text-xs mt-1">{errors.symptoms}</p>}
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Report File</h3>
              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition ${
                errors.file ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}>
                <CloudUpload size={36} className={errors.file ? 'text-red-400 mb-2' : 'text-gray-400 mb-2'} />
                <p className="text-gray-600 font-medium">
                  {file ? `✓ ${file.name}` : 'Drag & drop or click to browse'}
                </p>
                <p className="text-gray-400 text-sm mt-1">Supports PDF, JPG, PNG — Max 10MB</p>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </label>
              {errors.file && <p className="text-red-600 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} />{errors.file}</p>}
              
              <button 
                type="button" 
                onClick={() => setShowManual(!showManual)}
                className="text-sm text-blue-600 hover:underline mt-3"
              >
                {showManual ? '✕ Hide' : '+ Add'} manual transcript (if file is unavailable)
              </button>

              {showManual && (
                <textarea 
                  name="manualTranscript" 
                  className="input mt-3" 
                  rows={4}
                  placeholder="Paste your report text here..."
                  value={form.manualTranscript} 
                  onChange={handleChange}
                  disabled={loading}
                />
              )}
            </div>

            {errors.uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errors.uploadError}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full py-3 text-base disabled:opacity-60"
            >
              {loading ? 'Processing...' : 'Upload & Analyze Report'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default UploadReport