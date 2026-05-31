import { useEffect, useState } from 'react'
import { AlertCircle, Loader2, Mail, RefreshCw, Shield, User, Calendar, Plus, X, Activity } from 'lucide-react'
import { getErrorMessage, unwrap, userService } from '../services/api'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'agent' })

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await userService.getAll()
      const data = unwrap(response)
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  )

  const handleCreateUser = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await userService.create(formData)
      setShowModal(false)
      setFormData({ name: '', email: '', password: '', role: 'agent' })
      await fetchUsers()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <User className="text-blue-500" size={24} />
            User Management
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1">View and manage registered users and access roles</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm text-sm w-64 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all outline-none"
            />
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin text-blue-500' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} />
            Add User
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 text-red-700 border border-red-100 shadow-sm">
          <AlertCircle size={20} className="text-red-500" /> <span className="font-semibold">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 text-gray-500">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
            <p className="font-bold">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-gray-500">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <User size={24} className="text-gray-400" />
            </div>
            <p className="font-bold text-gray-800">No users found</p>
            <p className="text-sm mt-1">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">User Profile</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">System Role</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Join Date</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Status</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm font-black text-gray-700 text-lg group-hover:scale-105 transition-transform">
                            {user.name ? user.name.charAt(0).toUpperCase() : <User size={20} className="text-gray-400" />}
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div>
                          <div className="font-black text-gray-900 text-[15px]">{user.name || 'Unnamed User'}</div>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mt-0.5">
                            <Mail size={12} className="text-gray-400" />
                            {user.email || 'No email provided'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : user.role === 'manager' ? 'bg-orange-50 text-orange-700 border-orange-200' : user.role === 'agent' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {['admin', 'manager', 'agent'].includes(user.role) ? <Shield size={12} /> : <User size={12} />}
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                        <Activity size={10} className="animate-pulse" /> Active
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-xs font-bold text-gray-400">Registered</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateUser} className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-gray-900">Register Team Member</h3>
                <p className="text-sm text-gray-500">Create manager, agent, admin or user account.</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl bg-gray-100 p-2 text-gray-500 hover:bg-gray-200">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <Input label="Full Name" value={formData.name} onChange={value => setFormData({ ...formData, name: value })} required />
              <Input label="Email" type="email" value={formData.email} onChange={value => setFormData({ ...formData, email: value })} required />
              <Input label="Temporary Password" type="password" value={formData.password} onChange={value => setFormData({ ...formData, password: value })} required />
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">Role</span>
                <select value={formData.role} onChange={event => setFormData({ ...formData, role: event.target.value })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500">
                  <option value="agent">Agent</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </label>
            </div>
            <button disabled={saving} className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-black text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Creating...' : 'Register Account'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

const Input = ({ label, value, onChange, type = 'text', required }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-black uppercase tracking-wider text-gray-500">{label}</span>
    <input
      type={type}
      value={value}
      onChange={event => onChange(event.target.value)}
      required={required}
      minLength={type === 'password' ? 6 : undefined}
      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500"
    />
  </label>
)

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default Users
