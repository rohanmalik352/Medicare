import { useState, useEffect } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import api from '../../services/api'
import { LayoutDashboard, FileText, Users, UserCog } from 'lucide-react'

const navLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/reports', icon: FileText, label: 'Reports Queue' },
  { to: '/admin/patients', icon: Users, label: 'Patient Registry' },
  { to: '/admin/doctors', icon: UserCog, label: 'Physician Staff' },
]

const AdminPatients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/patients').then(res => setPatients(res.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex">
      <Sidebar links={navLinks} />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Patient Registry</h1>
          <p className="text-gray-500">{patients.length} registered patients</p>
        </div>
        <div className="card">
          {loading ? <p className="text-center py-12 text-gray-400">Loading...</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b">
                <th className="pb-3">Name</th><th className="pb-3">Email</th><th className="pb-3">Joined</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {patients.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">{p.name?.charAt(0)}</div>
                      {p.name}
                    </td>
                    <td className="py-3 text-gray-500">{p.email}</td>
                    <td className="py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
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

export default AdminPatients