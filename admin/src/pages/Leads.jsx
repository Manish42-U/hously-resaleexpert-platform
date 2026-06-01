import { useEffect, useState, useMemo } from 'react'
import {
  Users, Phone, Mail, MapPin, Calendar, Clock, ChevronRight,
  Plus, Search, Filter, MoreVertical, Star, TrendingUp,
  MessageCircle, PhoneCall, Eye, Edit3, Trash2, X, User,
  Flame, Target, Zap, CheckCircle, Circle, AlertCircle,
  ArrowUpRight, Building, IndianRupee, RefreshCw, Download,
  SlidersHorizontal, Tag
} from 'lucide-react'
import { contactService, getErrorMessage, unwrap } from '../services/api'

const STAGES = [
  { id: 'new', label: 'New Lead', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', count: 0 },
  { id: 'contacted', label: 'Contacted', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', count: 0 },
  { id: 'site_visit', label: 'Site Visit', color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500', count: 0 },
  { id: 'negotiation', label: 'Negotiation', color: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500', count: 0 },
  { id: 'closed', label: 'Closed Won', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', count: 0 },
]

const SAMPLE_LEADS = [
  { id: 1, name: 'Rajesh Shah', phone: '+91 96370 09639', email: 'rajesh@email.com', source: 'WhatsApp', budget: '1.2 Cr', location: 'Kharadi', interest: '3 BHK Apartment', stage: 'negotiation', priority: 'hot', score: 92, agent: 'Miss Soniya Singh', avatar: 'RS', color: 'from-rose-400 to-pink-500', date: '2025-10-12', lastContact: '2 hours ago', notes: 'Very interested, needs loan assistance' },
  { id: 2, name: 'Priya Joshi', phone: '+91 91460 09176', email: 'priya@email.com', source: 'Website', budget: '85 Lakhs', location: 'Baner', interest: '2 BHK', stage: 'site_visit', priority: 'warm', score: 78, agent: 'Mr. Rahul Deshmukh', avatar: 'PJ', color: 'from-violet-400 to-purple-500', date: '2025-10-14', lastContact: '1 day ago', notes: 'Site visit scheduled for Saturday' },
  { id: 3, name: 'Suresh Patil', phone: '+91 96370 09639', email: 'suresh@email.com', source: 'Referral', budget: '4.5 Cr', location: 'Kothrud', interest: 'Luxury Villa', stage: 'contacted', priority: 'hot', score: 88, agent: 'Laxman Vhadade', avatar: 'SP', color: 'from-amber-400 to-orange-500', date: '2025-10-15', lastContact: '3 hours ago', notes: 'Looking for premium society property' },
  { id: 4, name: 'Anita Deshpande', phone: '+91 91460 09176', email: 'anita@email.com', source: 'Google Ads', budget: '55 Lakhs', location: 'Wakad', interest: '1 BHK Flat', stage: 'new', priority: 'cold', score: 45, agent: 'Mr. Amit Patil', avatar: 'AD', color: 'from-blue-400 to-cyan-500', date: '2025-10-18', lastContact: '5 days ago', notes: 'First-time buyer, needs guidance' },
  { id: 5, name: 'Karan Malhotra', phone: '+91 96370 09639', email: 'karan@email.com', source: 'Facebook', budget: '8.5 Cr', location: 'Viman Nagar', interest: 'Penthouse', stage: 'closed', priority: 'hot', score: 100, agent: 'Miss Soniya Singh', avatar: 'KM', color: 'from-emerald-400 to-teal-500', date: '2025-10-20', lastContact: 'Closed', notes: 'Deal closed at 8.2 Cr. Happy customer!' },
  { id: 6, name: 'Meera Nair', phone: '+91 91460 09176', email: 'meera@email.com', source: 'Instagram', budget: '1.8 Cr', location: 'Hadapsar', interest: '3 BHK Premium', stage: 'contacted', priority: 'warm', score: 65, agent: 'Miss Prerna Shinde', avatar: 'MN', color: 'from-pink-400 to-rose-500', date: '2025-10-21', lastContact: '6 hours ago', notes: 'Prefers vastu-compliant property' },
  { id: 7, name: 'Vikash Sharma', phone: '+91 96370 09639', email: 'vikash@email.com', source: 'Walk-in', budget: '2.2 Cr', location: 'Balewadi', interest: 'Row House', stage: 'site_visit', priority: 'warm', score: 72, agent: 'Mr. Rahul Deshmukh', avatar: 'VS', color: 'from-indigo-400 to-blue-500', date: '2025-10-22', lastContact: '4 hours ago', notes: 'Wants large garden area' },
  { id: 8, name: 'Deepa Krishnan', phone: '+91 91460 09176', email: 'deepa@email.com', source: 'MagicBricks', budget: '95 Lakhs', location: 'Ravet', interest: '2 BHK', stage: 'new', priority: 'cold', score: 38, agent: 'Mr. Amit Patil', avatar: 'DK', color: 'from-teal-400 to-emerald-500', date: '2025-10-23', lastContact: '8 days ago', notes: 'Looking for ready possession' },
];

const PRIORITY_CONFIG = {
  hot: { label: 'Hot', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', icon: Flame },
  warm: { label: 'Warm', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: Zap },
  cold: { label: 'Cold', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: Circle },
}

const SOURCE_COLORS = {
  'WhatsApp': 'bg-green-100 text-green-700',
  'Website': 'bg-blue-100 text-blue-700',
  'Referral': 'bg-purple-100 text-purple-700',
  'Google Ads': 'bg-orange-100 text-orange-700',
  'Facebook': 'bg-indigo-100 text-indigo-700',
  'Instagram': 'bg-pink-100 text-pink-700',
  'Walk-in': 'bg-teal-100 text-teal-700',
  'MagicBricks': 'bg-red-100 text-red-700',
}

const emptyLead = {
  name: '', phone: '', email: '', source: 'Website', budget: '',
  location: '', interest: '', stage: 'new', priority: 'warm',
  agent: '', notes: ''
}

const priorityFromScore = (score) => {
  if (score >= 75) return 'hot'
  if (score >= 55) return 'warm'
  return 'cold'
}

const scoreLead = (lead) => {
  let score = 35
  if (lead.phone) score += 18
  if (lead.email && !lead.email.includes('@lead.resaleexpert.in')) score += 12
  if (lead.budget) score += 15
  if (lead.interest) score += 10
  if (String(lead.notes || '').length > 40) score += 10
  return Math.min(score, 100)
}

const parseLeadMeta = (value) => {
  try {
    return typeof value === 'string' && value.trim().startsWith('{')
      ? JSON.parse(value)
      : { notes: value || '' }
  } catch {
    return { notes: value || '' }
  }
}

const mapContactToLead = (contact) => {
  const meta = parseLeadMeta(contact.admin_notes)
  const score = scoreLead({
    phone: contact.phone,
    email: contact.email,
    budget: contact.budget,
    interest: contact.property_type,
    notes: meta.notes || contact.message,
  })
  return {
    id: contact.id,
    name: contact.name || 'Unnamed Lead',
    phone: contact.phone || '',
    email: contact.email || '',
    source: meta.source || contact.subject || 'Website',
    budget: contact.budget || '',
    location: meta.location || contact.subject || '',
    interest: contact.property_type || 'General enquiry',
    stage: contact.status || 'new',
    priority: meta.priority || priorityFromScore(score),
    score,
    agent: contact.assigned_to || meta.agent || 'Unassigned',
    avatar: (contact.name || 'UL').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    color: 'from-slate-400 to-slate-500',
    date: contact.created_at ? String(contact.created_at).slice(0, 10) : '',
    lastContact: contact.last_contacted_at ? 'Recently contacted' : 'New query',
    notes: meta.notes || contact.message || '',
  }
}

const Leads = () => {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState('kanban') // 'kanban' | 'list'
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [formData, setFormData] = useState(emptyLead)
  const [selectedLead, setSelectedLead] = useState(null)
  const [dragOver, setDragOver] = useState(null)

  const fetchLeads = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await contactService.getAll()
      const data = unwrap(response)
      setLeads((Array.isArray(data) ? data : []).map(mapContactToLead))
    } catch (err) {
      setError(getErrorMessage(err))
      setLeads([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchSearch = !search || 
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.phone.includes(search) ||
        lead.location.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase()) ||
        lead.interest.toLowerCase().includes(search.toLowerCase()) ||
        lead.notes.toLowerCase().includes(search.toLowerCase())
      const matchStage = filterStage === 'all' || lead.stage === filterStage
      const matchPriority = filterPriority === 'all' || lead.priority === filterPriority
      return matchSearch && matchStage && matchPriority
    })
  }, [leads, search, filterStage, filterPriority])

  const getLeadsByStage = (stageId) => filteredLeads.filter(l => l.stage === stageId)

  const stats = useMemo(() => ({
    total: leads.length,
    hot: leads.filter(l => l.priority === 'hot').length,
    closed: leads.filter(l => l.stage === 'closed').length,
    conversion: leads.length ? Math.round((leads.filter(l => l.stage === 'closed').length / leads.length) * 100) : 0,
  }), [leads])

  const openAddModal = () => {
    setEditingLead(null)
    setFormData(emptyLead)
    setShowModal(true)
  }

  const openEditModal = (lead) => {
    setEditingLead(lead)
    setFormData({ ...lead })
    setShowModal(true)
    setSelectedLead(null)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.phone) return
    const meta = {
      source: formData.source,
      location: formData.location,
      priority: formData.priority,
      agent: formData.agent,
      notes: formData.notes,
    }
    const payload = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || `${String(formData.phone).replace(/\D/g, '') || Date.now()}@lead.resaleexpert.in`,
      property_type: formData.interest || 'General enquiry',
      budget: formData.budget,
      subject: formData.source,
      message: formData.notes || `Manual lead for ${formData.interest || 'property enquiry'}`,
      status: formData.stage,
      assigned_to: formData.agent || null,
      admin_notes: JSON.stringify(meta),
      last_contacted_at: formData.stage === 'contacted' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null,
    }
    try {
      if (editingLead) {
        await contactService.update(editingLead.id, payload)
      } else {
        await contactService.create(payload)
      }
      setShowModal(false)
      await fetchLeads()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleDelete = async (id) => {
    try {
      await contactService.delete(id)
      setLeads(prev => prev.filter(l => l.id !== id))
      setSelectedLead(null)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleStageChange = async (leadId, newStage) => {
    const lead = leads.find(item => item.id === leadId)
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l))
    try {
      await contactService.update(leadId, {
        status: newStage,
        assigned_to: lead?.agent === 'Unassigned' ? null : lead?.agent,
        admin_notes: JSON.stringify({
          source: lead?.source,
          location: lead?.location,
          priority: lead?.priority,
          agent: lead?.agent,
          notes: lead?.notes,
        }),
      })
    } catch (err) {
      setError(getErrorMessage(err))
      await fetchLeads()
    }
  }

  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('leadId', leadId)
  }

  const handleDrop = (e, stageId) => {
    e.preventDefault()
    const leadId = parseInt(e.dataTransfer.getData('leadId'))
    handleStageChange(leadId, stageId)
    setDragOver(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pb-10">
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E6761D] to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Queries & Leads</h1>
                <p className="text-gray-500 text-sm">Every client contact form, property message and enquiry appears here</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search queries..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm outline-none transition-all focus:border-[#E6761D] focus:bg-white focus:shadow-[0_0_0_3px_rgba(230,118,29,0.1)] sm:w-56"
                />
              </div>

              {/* View toggle */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                <button onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                  Kanban
                </button>
                <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                  List
                </button>
              </div>

              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                <Download size={15} /> Export
              </button>

              <button onClick={openAddModal} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#E6761D] to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm">
                <Plus size={16} /> Add Lead
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex gap-3 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8">
          {[
            { label: 'Total Queries', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Hot Leads', value: stats.hot, icon: Flame, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Deals Closed', value: stats.closed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Conversion Rate', value: `${stats.conversion}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200/60 rounded-xl shadow-sm whitespace-nowrap flex-shrink-0">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={15} className={stat.color} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">{stat.label}</p>
                <p className="text-base font-black text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2 ml-auto">
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none cursor-pointer">
              <option value="all">All Priority</option>
              <option value="hot">🔥 Hot</option>
              <option value="warm">⚡ Warm</option>
              <option value="cold">❄️ Cold</option>
            </select>
          </div>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {view === 'kanban' && (
        <div className="px-4 lg:px-6 py-6 overflow-x-auto">
          <div className="flex gap-4 min-w-max">
            {STAGES.map(stage => {
              const stageLeads = getLeadsByStage(stage.id)
              const isDragTarget = dragOver === stage.id

              return (
                <div
                  key={stage.id}
                  className={`w-72 flex flex-col rounded-2xl transition-all duration-200 ${isDragTarget ? 'scale-[1.02] ring-2 ring-[#E6761D]/50' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(stage.id) }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={e => handleDrop(e, stage.id)}
                >
                  {/* Column Header */}
                  <div className={`flex items-center justify-between px-4 py-3 rounded-t-2xl bg-gradient-to-r ${stage.color}`}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white/70" />
                      <span className="text-sm font-black text-white">{stage.label}</span>
                    </div>
                    <span className="bg-white/20 text-white text-xs font-black px-2.5 py-1 rounded-full">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className={`flex-1 p-3 space-y-3 min-h-[300px] rounded-b-2xl border-x border-b transition-colors ${isDragTarget ? 'bg-orange-50 border-orange-200' : 'bg-slate-50/80 border-slate-200/60'}`}>
                    {stageLeads.map(lead => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onClick={() => setSelectedLead(lead)}
                        onDragStart={handleDragStart}
                      />
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-24 text-gray-400 text-xs font-semibold">
                        <Circle size={20} className="mb-2 opacity-30" />
                        Drop leads here
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="overflow-x-auto rounded-3xl border border-gray-200/60 bg-white shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  {['Lead', 'Contact', 'Interest & Budget', 'Stage', 'Priority', 'Score', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLeads.map(lead => {
                  const PriorityIcon = PRIORITY_CONFIG[lead.priority]?.icon || Circle
                  return (
                    <tr key={lead.id} className="hover:bg-orange-50/40 transition-colors group cursor-pointer" onClick={() => setSelectedLead(lead)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${lead.color} flex items-center justify-center text-white text-xs font-black shadow-sm flex-shrink-0`}>
                            {lead.avatar}
                          </div>
                          <div>
                            <p className="font-black text-gray-900 text-sm">{lead.name}</p>
                            <p className="text-xs text-gray-500">{lead.source}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-700">{lead.phone}</p>
                        <p className="text-xs text-gray-400">{lead.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-800">{lead.interest}</p>
                        <p className="text-xs text-[#E6761D] font-bold">{lead.budget}</p>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const s = STAGES.find(s => s.id === lead.stage)
                          return s ? (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${s.bg} ${s.text} border ${s.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                              {s.label}
                            </span>
                          ) : null
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black border ${PRIORITY_CONFIG[lead.priority]?.bg} ${PRIORITY_CONFIG[lead.priority]?.text} ${PRIORITY_CONFIG[lead.priority]?.border}`}>
                          <PriorityIcon size={11} />
                          {PRIORITY_CONFIG[lead.priority]?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${lead.score >= 80 ? 'bg-emerald-500' : lead.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${lead.score}%` }} />
                          </div>
                          <span className="text-xs font-black text-gray-700">{lead.score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <a href={`tel:${lead.phone}`} className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                            <PhoneCall size={14} />
                          </a>
                          <button onClick={() => openEditModal(lead)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleDelete(lead.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LEAD DETAIL PANEL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelectedLead(null)}>
          <div className="flex-1 bg-black/40 backdrop-blur-sm" />
          <div 
            className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className={`bg-gradient-to-br ${selectedLead.color} p-6 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <button onClick={() => setSelectedLead(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
                    <X size={16} className="text-white" />
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(selectedLead)} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
                      <Edit3 size={16} className="text-white" />
                    </button>
                    <button onClick={() => handleDelete(selectedLead.id)} className="p-2 bg-white/20 hover:bg-red-500/60 rounded-xl transition-colors">
                      <Trash2 size={16} className="text-white" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black text-white border border-white/30">
                    {selectedLead.avatar}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">{selectedLead.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-white/80 bg-white/20 px-2 py-0.5 rounded-full">{selectedLead.source}</span>
                      <span className="text-xs font-bold text-white/80">{selectedLead.lastContact}</span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="mt-4 bg-white/10 rounded-2xl p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-white/80">Lead Score</span>
                    <span className="text-sm font-black text-white">{selectedLead.score}/100</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all" style={{ width: `${selectedLead.score}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Panel Body */}
            <div className="flex-1 p-6 space-y-6">
              {/* Stage Changer */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Pipeline Stage</p>
                <div className="grid grid-cols-1 gap-2">
                  {STAGES.map(stage => (
                    <button
                      key={stage.id}
                      onClick={() => {
                        handleStageChange(selectedLead.id, stage.id)
                        setSelectedLead(prev => ({ ...prev, stage: stage.id }))
                      }}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${selectedLead.stage === stage.id ? `${stage.bg} ${stage.text} ${stage.border} shadow-sm` : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                      {stage.label}
                      {selectedLead.stage === stage.id && <CheckCircle size={14} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Contact Details</p>
                <div className="space-y-2">
                  {[
                    { icon: Phone, label: selectedLead.phone, href: `tel:${selectedLead.phone}` },
                    { icon: Mail, label: selectedLead.email, href: `mailto:${selectedLead.email}` },
                    { icon: MapPin, label: selectedLead.location },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                        <item.icon size={14} className="text-gray-500" />
                      </div>
                      {item.href ? (
                        <a href={item.href} className="text-sm font-semibold text-gray-700 hover:text-[#E6761D] transition-colors">{item.label}</a>
                      ) : (
                        <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Property Interest */}
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <p className="text-xs font-black uppercase tracking-widest text-orange-500 mb-2">Property Interest</p>
                <p className="font-black text-gray-900">{selectedLead.interest}</p>
                <p className="text-sm font-bold text-[#E6761D] mt-1 flex items-center gap-1">
                  <IndianRupee size={13} /> Budget: {selectedLead.budget}
                </p>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Notes</p>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed">{selectedLead.notes}</p>
              </div>

              {/* Agent */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-sm">
                  {selectedLead.agent?.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Assigned Agent</p>
                  <p className="font-black text-gray-900 text-sm">{selectedLead.agent}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <a href={`tel:${selectedLead.phone}`} className="flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 border border-green-200 rounded-2xl font-bold text-sm hover:bg-green-600 hover:text-white transition-all">
                  <PhoneCall size={16} /> Call
                </a>
                <a href={`https://wa.me/${selectedLead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-2xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all">
                  <MessageCircle size={16} /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-7 py-5 flex justify-between items-center">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-[#E6761D] rounded-xl flex items-center justify-center">
                  {editingLead ? <Edit3 size={16} /> : <Plus size={16} />}
                </div>
                {editingLead ? 'Edit Lead' : 'Add New Lead'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-7 grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[70vh] overflow-y-auto">
              {[
                { label: 'Full Name', key: 'name', type: 'text', required: true },
                { label: 'Phone Number', key: 'phone', type: 'tel', required: true },
                { label: 'Email Address', key: 'email', type: 'email' },
                { label: 'Location', key: 'location', type: 'text' },
                { label: 'Budget', key: 'budget', type: 'text', placeholder: 'e.g. 1.5 Cr' },
                { label: 'Property Interest', key: 'interest', type: 'text', placeholder: 'e.g. 3 BHK Apartment' },
                { label: 'Assigned Agent', key: 'agent', type: 'text' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.key] || ''}
                    onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-[#E6761D] focus:shadow-[0_0_0_3px_rgba(230,118,29,0.1)] outline-none transition-all font-medium text-gray-900"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Source</label>
                <select value={formData.source} onChange={e => setFormData(prev => ({ ...prev, source: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-[#E6761D] outline-none transition-all font-medium text-gray-900 cursor-pointer">
                  {['Website', 'WhatsApp', 'Referral', 'Google Ads', 'Facebook', 'Instagram', 'Walk-in', 'MagicBricks'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Priority</label>
                <select value={formData.priority} onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-[#E6761D] outline-none transition-all font-medium text-gray-900 cursor-pointer">
                  <option value="hot">🔥 Hot</option>
                  <option value="warm">⚡ Warm</option>
                  <option value="cold">❄️ Cold</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Stage</label>
                <select value={formData.stage} onChange={e => setFormData(prev => ({ ...prev, stage: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-[#E6761D] outline-none transition-all font-medium text-gray-900 cursor-pointer">
                  {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Notes</label>
                <textarea rows={3} value={formData.notes || ''} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-[#E6761D] outline-none transition-all resize-none font-medium text-gray-900" placeholder="Add any notes about this lead..." />
              </div>
            </div>

            <div className="px-7 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button onClick={() => setShowModal(false)} className="px-6 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                Cancel
              </button>
              <button onClick={handleSave} className="px-8 py-2.5 bg-gradient-to-r from-[#E6761D] to-orange-500 text-white font-black rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm">
                {editingLead ? 'Save Changes' : 'Add Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const LeadCard = ({ lead, onClick, onDragStart }) => {
  const PriorityIcon = PRIORITY_CONFIG[lead.priority]?.icon || Circle
  const stage = STAGES.find(s => s.id === lead.stage)

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, lead.id)}
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-lg hover:border-[#E6761D]/20 transition-all duration-300 cursor-pointer group p-4 select-none"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${lead.color} flex items-center justify-center text-white text-xs font-black shadow-sm flex-shrink-0`}>
            {lead.avatar}
          </div>
          <div>
            <p className="font-black text-gray-900 text-sm leading-tight">{lead.name}</p>
            <p className="text-[10px] text-gray-400 font-semibold">{lead.lastContact}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${PRIORITY_CONFIG[lead.priority]?.bg} ${PRIORITY_CONFIG[lead.priority]?.text} ${PRIORITY_CONFIG[lead.priority]?.border}`}>
          <PriorityIcon size={9} />
          {PRIORITY_CONFIG[lead.priority]?.label}
        </span>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Building size={11} className="text-gray-400 flex-shrink-0" />
          <span className="truncate font-medium">{lead.interest}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#E6761D] font-bold">
          <IndianRupee size={11} className="flex-shrink-0" />
          {lead.budget}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin size={11} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{lead.location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${SOURCE_COLORS[lead.source] || 'bg-gray-100 text-gray-600'}`}>
          {lead.source}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="h-1 w-12 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${lead.score >= 80 ? 'bg-emerald-500' : lead.score >= 60 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${lead.score}%` }} />
          </div>
          <span className="text-[9px] font-black text-gray-500">{lead.score}</span>
        </div>
      </div>
    </div>
  )
}

export default Leads
