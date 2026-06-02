import { useState, useEffect } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { LayoutDashboard, FileText, Users, UserCog, X } from 'lucide-react'

const navLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/reports', icon: FileText, label: 'Reports Queue' },
  { to: '/admin/patients', icon: Users, label: 'Patient Registry' },
  { to: '/admin/doctors', icon: UserCog, label: 'Physician Staff' },
]

const CATEGORIES = ['General Physician', 'Cardiologist', 'Dermatologist', 'Orthopedic', 'Neurologist', 'Gynecologist', 'Pediatrician', 'ENT Specialist', 'Diabetologist']

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: 'doctor123', category: 'General Physician', specialization: '', experience: '', shiftHours: '09:00 AM - 05:00 PM', responseTime: '< 5 mins' })
  const [saving, setSaving] = useState(false)

  const fetchDoctors = () => api.get('/doctors').then(res => setDoctors(res.data)).finally(() => setLoading(false))
  useEffect(() => { fetchDoctors() }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/doctors', form)
      toast.success('Doctor added successfully')
      setShowModal(false)
      setForm({ name: '', email: '', password: 'doctor123', category: 'General Physician', specialization: '', experience: '', shiftHours: '09:00 AM - 05:00 PM', responseTime: '< 5 mins' })
      fetchDoctors()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add doctor')
    } finally { setSaving(false) }
  }

  return (
    <div className="flex">
      <Sidebar links={navLinks} />
      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Physician Staff</h1>
            <p className="text-gray-500">{doctors.length} doctors registered</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Doctor</button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {loading ? <p className="col-span-3 text-center py-12 text-gray-400">Loading...</p> :
            doctors.map(d => (
              <div key={d._id} className="card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {d.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{d.user?.name}</p>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{d.category}</span>
                  </div>
                  <div className={`ml-auto w-2 h-2 rounded-full ${d.availability ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
                <dl className="text-xs space-y-1 text-gray-500">
                  <div className="flex justify-between"><dt>Email</dt><dd className="text-gray-700">{d.user?.email}</dd></div>
                  <div className="flex justify-between"><dt>Experience</dt><dd>{d.experience} yrs</dd></div>
                  <div className="flex justify-between"><dt>Shift</dt><dd>{d.shiftHours}</dd></div>
                  <div className="flex justify-between"><dt>Response</dt><dd>{d.responseTime}</dd></div>
                </dl>
              </div>
            ))
          }
        </div>

        {/* Add Doctor Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Add Physician Staff Member</h3>
                <button onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Doctor Name</label>
                  <input name="name" className="input" placeholder="Dr. Jennifer Thorne" value={form.name} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" type="email" className="input" value={form.email} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                  <input name="password" className="input" value={form.password} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Specialty Division</label>
                  <select name="category" className="input" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Specialization</label>
                  <input name="specialization" className="input" placeholder="e.g. Interventional Cardiology" value={form.specialization} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Est. Response Speed</label>
                    <input name="responseTime" className="input" value={form.responseTime} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Experience (yrs)</label>
                    <input name="experience" type="number" className="input" value={form.experience} onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Shift Hours</label>
                  <input name="shiftHours" className="input" value={form.shiftHours} onChange={handleChange} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Physician'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminDoctors