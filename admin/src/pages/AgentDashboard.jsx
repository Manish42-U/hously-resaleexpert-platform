import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, BarChart3, Bell, Building2, CalendarClock, CheckCircle2, ChevronRight,
  Clock3, Mail, MessageCircle, Phone, RefreshCw, Search, Sparkles, Target,
  TrendingUp, UserRoundCheck
} from 'lucide-react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts'
import { adminService, getErrorMessage, unwrap } from '../services/api'
import { formatCurrency, initials } from '../utils/dashboardData'

const cleanPhone = (phone) => String(phone || '').replace(/\D/g, '')

const priorityStyle = {
  hot: 'bg-red-50 text-red-700 border-red-100',
  high: 'bg-red-50 text-red-700 border-red-100',
  warm: 'bg-amber-50 text-amber-700 border-amber-100',
  medium: 'bg-blue-50 text-blue-700 border-blue-100',
  new: 'bg-slate-100 text-slate-700 border-slate-200',
}

const AgentDashboard = () => {
  const [workspace, setWorkspace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      setWorkspace(unwrap(await adminService.getWorkspace()))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadDashboard() }, [])

  const stats = workspace?.stats || {}
  const agent = workspace?.agent || {}
  const queue = useMemo(() => agent.queue || [], [agent.queue])
  const scripts = agent.scripts || []
  const goals = agent.goals || {}
  const nextAction = queue[0]

  const filteredQueue = useMemo(() => {
    const q = search.trim().toLowerCase()
    return queue.filter((item) => {
      const filterMatch = filter === 'all' || item.priority === filter || item.type.toLowerCase().includes(filter)
      const searchMatch = !q || [item.title, item.subtitle, item.context, item.type, item.phone, item.email].some((value) => String(value || '').toLowerCase().includes(q))
      return filterMatch && searchMatch
    })
  }, [filter, queue, search])

  const contactable = queue.filter((item) => item.phone || item.email).length
  const averageScore = queue.length ? Math.round(queue.reduce((sum, item) => sum + Number(item.score || 0), 0) / queue.length) : 0
  const queueChart = useMemo(() => {
    const counts = queue.reduce((acc, item) => {
      const key = item.priority || 'new'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    return ['hot', 'warm', 'medium', 'new'].map((name) => ({ name, tasks: counts[name] || 0 }))
  }, [queue])
  const scoreTrend = useMemo(() => filteredQueue.slice(0, 7).map((item, index) => ({
    name: `T${index + 1}`,
    score: Number(item.score || 0),
  })), [filteredQueue])
  const actionPlan = [
    { label: 'First 30 min', title: 'Hot lead calls', value: goals.hotLeads || 0, icon: Target },
    { label: 'Mid day', title: 'Listing verification', value: goals.reviews || 0, icon: Building2 },
    { label: 'Evening', title: 'CRM follow-up notes', value: filteredQueue.length, icon: CheckCircle2 },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb]">
        <RefreshCw className="animate-spin text-[#E6761D]" size={34} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] p-6">
        <div className="max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto text-red-500" size={36} />
          <h2 className="mt-4 text-xl font-black text-slate-900">Agent workspace unavailable</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">{error}</p>
          <button onClick={loadDashboard} className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-[#E6761D]">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] pb-12">
      <div className="px-6 py-8 lg:px-10">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-orange-700">
              <Sparkles size={13} /> Agent Desk
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              {currentUser?.name || 'Agent'}, your action queue is ready
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Work hot leads first, then listing verification and owner follow-ups.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks, leads, owners..." className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 sm:w-[320px]" />
            </div>
            <button onClick={loadDashboard} className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:text-orange-600 hover:shadow-lg">
              <RefreshCw size={18} />
            </button>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-lg">
              {initials(currentUser?.name || currentUser?.email || 'Agent')}
            </div>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Calls Today', value: goals.callsToday || 0, note: `${contactable} contactable records`, icon: Phone, color: 'from-orange-500 to-red-500' },
            { label: 'Hot Leads', value: goals.hotLeads || 0, note: 'Call within SLA', icon: Target, color: 'from-red-500 to-rose-600' },
            { label: 'Listings To Verify', value: goals.reviews || 0, note: 'Owner/document checks', icon: Building2, color: 'from-blue-500 to-indigo-600' },
            { label: 'Queue Quality', value: `${averageScore}/100`, note: `${queue.length} total tasks`, icon: TrendingUp, color: 'from-emerald-500 to-teal-600' },
          ].map((card) => (
            <div key={card.label} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <card.icon size={21} />
              </div>
              <p className="mt-4 text-3xl font-black text-slate-950">{card.value}</p>
              <p className="text-sm font-black text-slate-700">{card.label}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">{card.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.72fr]">
          <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-[#14213d] text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.55fr]">
              <div className="p-7 lg:p-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-orange-200">
                  <Clock3 size={13} /> Next Best Action
                </div>
                <h2 className="mt-5 text-3xl font-black leading-tight">{nextAction?.title || 'No pending action'}</h2>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/70">
                  {nextAction ? `${nextAction.type} · ${nextAction.subtitle} · ${nextAction.context}` : 'New leads and listings will appear here when backend receives them.'}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {nextAction?.phone && <a href={`tel:${nextAction.phone}`} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 hover:bg-orange-50"><Phone size={16} /> Call</a>}
                  {nextAction?.phone && <a href={`https://wa.me/${cleanPhone(nextAction.phone)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 text-sm font-black text-white hover:bg-green-600"><MessageCircle size={16} /> WhatsApp</a>}
                  {nextAction?.email && <a href={`mailto:${nextAction.email}`} className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white ring-1 ring-white/15 hover:bg-white/15"><Mail size={16} /> Email</a>}
                </div>
              </div>
              <div className="border-t border-white/10 bg-white/5 p-7 lg:border-l lg:border-t-0">
                <h3 className="font-black">Call Script</h3>
                <div className="mt-4 space-y-3">
                  {scripts.map((script) => (
                    <div key={script.title} className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-white/12 hover:ring-orange-300/40">
                      <p className="text-sm font-black text-white">{script.title}</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-white/60">{script.prompt}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">Today Timeline</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">A focused rhythm for field work.</p>
              </div>
              <CalendarClock className="text-orange-600" size={24} />
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: 'Morning', text: `${goals.hotLeads || 0} hot lead calls`, icon: Target },
                { label: 'Afternoon', text: `${goals.reviews || 0} listing verification tasks`, icon: Building2 },
                { label: 'Evening', text: 'Update CRM notes and next follow-up', icon: CheckCircle2 },
              ].map((item) => (
                <div key={item.label} className="group flex items-center gap-3 rounded-3xl border border-transparent bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-orange-100 hover:bg-white hover:shadow-lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-orange-600 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-orange-600 group-hover:text-white"><item.icon size={18} /></div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                    <p className="text-sm font-black text-slate-800">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-orange-600">Action Planner</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Touch-Friendly Work Plan</h2>
              </div>
              <CalendarClock className="text-orange-600" size={24} />
            </div>
            <div className="mt-5 space-y-3">
              {actionPlan.map((item) => (
                <div key={item.label} className="group rounded-3xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:bg-white hover:shadow-lg">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-orange-600 group-hover:text-white">
                        <item.icon size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                        <h3 className="font-black text-slate-950">{item.title}</h3>
                      </div>
                    </div>
                    <span className="rounded-2xl bg-white px-3 py-1 text-sm font-black text-slate-900 shadow-sm">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600">Performance Graph</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Priority Mix + Score Trend</h2>
              </div>
              <BarChart3 className="text-blue-600" size={24} />
            </div>
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="h-56 rounded-3xl bg-slate-50 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={queueChart}>
                    <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', fontWeight: 700 }} />
                    <Bar dataKey="tasks" fill="#f97316" radius={[9, 9, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-56 rounded-3xl bg-slate-50 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreTrend}>
                    <defs>
                      <linearGradient id="agentScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', fontWeight: 700 }} />
                    <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} fill="url(#agentScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">Work Queue</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Every card has real call, WhatsApp or email actions when data exists.</p>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {['all', 'hot', 'warm', 'buyer', 'listing'].map((item) => (
                  <button key={item} onClick={() => setFilter(item)} className={`whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-black capitalize ${filter === item ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-700'}`}>{item}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0 xl:grid-cols-3">
            {filteredQueue.map((item) => (
              <div key={item.id} className="p-5 transition-all duration-300 hover:bg-orange-50/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase text-slate-600">{item.type}</span>
                    <h3 className="mt-3 truncate font-black text-slate-950">{item.title}</h3>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-500">{item.subtitle}</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${priorityStyle[item.priority] || priorityStyle.new}`}>{item.priority}</span>
                </div>
                <p className="mt-4 line-clamp-2 text-sm font-semibold leading-6 text-slate-500">{item.context}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.due}</p>
                    <p className="text-sm font-black text-orange-600">{Number(item.score || 0)}/100 score</p>
                  </div>
                  <div className="flex gap-2">
                    {item.phone && <a href={`tel:${item.phone}`} className="rounded-xl bg-emerald-50 p-2 text-emerald-700"><Phone size={15} /></a>}
                    {item.phone && <a href={`https://wa.me/${cleanPhone(item.phone)}`} target="_blank" rel="noreferrer" className="rounded-xl bg-green-50 p-2 text-green-700"><MessageCircle size={15} /></a>}
                    {item.email && <a href={`mailto:${item.email}`} className="rounded-xl bg-blue-50 p-2 text-blue-700"><Mail size={15} /></a>}
                  </div>
                </div>
              </div>
            ))}
            {filteredQueue.length === 0 && (
              <div className="p-12 text-center lg:col-span-2 xl:col-span-3">
                <Bell className="mx-auto text-slate-300" size={36} />
                <p className="mt-3 text-sm font-bold text-slate-500">No tasks match your filter.</p>
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[
            { label: 'Portfolio In View', value: formatCurrency(stats.totalValue || 0), icon: Building2 },
            { label: 'Leads In System', value: stats.contacts || 0, icon: UserRoundCheck },
            { label: 'Daily Confidence', value: contactable ? 'Ready' : 'Waiting', icon: ChevronRight },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl">
              <item.icon className="text-orange-600" size={22} />
              <p className="mt-4 text-2xl font-black text-slate-950">{item.value}</p>
              <p className="text-sm font-bold text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AgentDashboard
