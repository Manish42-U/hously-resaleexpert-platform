import { useState, useEffect } from 'react'
import Users from './Users'
import { contactService, unwrap } from '../services/api'
import {
  Users as UsersIcon, Database, Phone, MessageSquare, Briefcase,
  Plus, Search, Star, Calendar,
  Mail, Eye, Clock, Loader2, Trash2,
  ChevronRight, MapPin, Building
} from 'lucide-react'

const CRM = () => {
  const [activeTab, setActiveTab] = useState('users')
  const [searchQuery, setSearchQuery] = useState('')
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(false)

  const tabs = [
    { id: 'users', label: 'Registered Users', icon: UsersIcon, color: 'from-blue-500 to-indigo-600' },
    { id: 'agents', label: 'Agent Directory', icon: Briefcase, color: 'from-emerald-500 to-teal-600' },
    { id: 'enquiries', label: 'General Enquiries', icon: MessageSquare, color: 'from-purple-500 to-pink-600' },
  ]

  useEffect(() => {
    if (activeTab === 'enquiries') {
      fetchEnquiries()
    }
  }, [activeTab])

  const fetchEnquiries = async () => {
    setLoading(true)
    try {
      const data = await unwrap(await contactService.getAll())
      setEnquiries(data)
    } catch (error) {
      console.error('Error fetching enquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEnquiry = async (id) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      try {
        await contactService.delete(id)
        fetchEnquiries()
      } catch (error) {
        alert('Error deleting enquiry')
      }
    }
  }

  const agents = [
    { id: 1, name: 'Aarav Sharma', role: 'Senior Agent', phone: '+91 98234 56789', email: 'aarav@hously.com', territory: 'Pune West', deals: 24, rating: 4.8, avatar: 'AS', color: 'from-orange-400 to-red-500' },
    { id: 2, name: 'Ishita Verma', role: 'Property Specialist', phone: '+91 98765 43210', email: 'ishita@hously.com', territory: 'Mumbai Central', deals: 31, rating: 4.9, avatar: 'IV', color: 'from-blue-500 to-indigo-600' },
    { id: 3, name: 'Rohan Mehta', role: 'Field Agent', phone: '+91 99887 66554', email: 'rohan@hously.com', territory: 'Bangalore North', deals: 18, rating: 4.6, avatar: 'RM', color: 'from-emerald-500 to-teal-600' },
  ]

  const getPriorityBadge = (priority) => {
    const colors = { High: 'bg-red-50 text-red-600 border-red-200', Medium: 'bg-amber-50 text-amber-600 border-amber-200', Low: 'bg-emerald-50 text-emerald-600 border-emerald-200' }
    return <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border ${colors[priority]}`}>{priority}</span>
  }

  const getStatusBadge = (status) => {
    const config = { New: { color: 'bg-blue-50 text-blue-600 border-blue-200' }, Replied: { color: 'bg-purple-50 text-purple-600 border-purple-200' }, Closed: { color: 'bg-emerald-50 text-emerald-600 border-emerald-200' } }
    const { color } = config[status] || config.New
    return <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${color}`}>{status}</span>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 page-enter">
      {/* HEADER */}
      <div className="sticky top-0 z-30 glass-white border-b border-gray-200/60 pt-5">
        <div className="px-6 lg:px-8 mb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E6761D] to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Database size={18} className="text-white" />
                </div>
                CRM Dashboard
              </h1>
              <p className="text-gray-500 text-sm mt-0.5 ml-12">Manage leads, users, agents, and customer enquiries</p>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="px-6 lg:px-8 flex gap-2 overflow-x-auto scrollbar-custom">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all duration-300 rounded-t-2xl whitespace-nowrap overflow-hidden group
                  ${isActive ? 'text-gray-900 bg-white border-x border-t border-gray-200/60' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-transparent'}`}
              >
                {isActive && (
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${tab.color}`} />
                )}
                <div className={`p-1.5 rounded-lg transition-all ${isActive ? `bg-gradient-to-br ${tab.color} text-white shadow-md` : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                  <tab.icon size={14} />
                </div>
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-6 lg:p-8 max-w-[1600px] mx-auto bg-white min-h-[calc(100vh-160px)] border-x border-b border-gray-200/60 rounded-b-3xl shadow-sm -mt-px relative z-10">
        
        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="-mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Users />
          </div>
        )}

        {/* AGENTS TAB */}
        {activeTab === 'agents' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Agent Directory</h2>
                <p className="text-sm text-gray-500">Manage real estate agents and their performance metrics</p>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all">
                <Plus size={16} /> Invite Agent
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {agents.map((agent) => (
                <div key={agent.id} className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 card-lift">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-110 transition-transform`}>
                      {agent.avatar}
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                      <Star size={13} className="text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-amber-700">{agent.rating}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg group-hover:text-[#E6761D] transition-colors">{agent.name}</h3>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5">{agent.role}</p>
                  </div>
                  <div className="mt-5 space-y-2.5">
                    <div className="flex items-center gap-2.5 text-sm text-gray-600 bg-gray-50 p-2 rounded-xl">
                      <MapPin size={14} className="text-gray-400" /> <span className="font-medium truncate">{agent.territory}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-gray-600 bg-gray-50 p-2 rounded-xl">
                      <Phone size={14} className="text-gray-400" /> <span className="font-mono text-xs">{agent.phone}</span>
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Deals Closed</p>
                      <p className="text-lg font-black text-gray-900">{agent.deals}</p>
                    </div>
                    <button className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all shadow-sm">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ENQUIRIES TAB */}
        {activeTab === 'enquiries' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">General Enquiries</h2>
                <p className="text-sm text-gray-500">Contact form submissions and support requests</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Search enquiries..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm w-64 bg-gray-50 focus:bg-white focus:border-[#E6761D] focus:shadow-[0_0_0_3px_rgba(230,118,29,0.1)] outline-none transition-all" />
              </div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-500">Contact Info</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-500">Subject / Message</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-500">Status</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-500">Date</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-gray-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center">
                          <Loader2 className="w-8 h-8 text-[#E6761D] animate-spin mx-auto mb-3" />
                          <p className="text-sm font-bold text-gray-500">Loading enquiries...</p>
                        </td>
                      </tr>
                    ) : enquiries.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                          <MessageSquare size={32} className="mx-auto mb-3 opacity-20" />
                          <p className="text-sm font-bold">No enquiries found</p>
                        </td>
                      </tr>
                    ) : (
                      enquiries
                        .filter(enq => 
                          enq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          enq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          enq.message.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((enq) => (
                          <tr key={enq.id} className="group hover:bg-orange-50/20 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-gray-900">{enq.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{enq.email}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{enq.phone || 'No phone'}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#E6761D] bg-[#E6761D]/10 px-2 py-0.5 rounded-md uppercase tracking-wider mb-1.5">
                                {enq.property_type || 'General'}
                              </span>
                              <p className="text-sm text-gray-600 max-w-md line-clamp-2 leading-relaxed">{enq.message}</p>
                            </td>
                            <td className="px-6 py-4">{getStatusBadge(enq.status || 'New')}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-500">
                              {new Date(enq.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <button className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="View"><Eye size={16} /></button>
                                <button className="p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Reply"><Mail size={16} /></button>
                                <button onClick={() => handleDeleteEnquiry(enq.id)} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CRM