import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, BarChart3, Building2, CheckCircle2, Clock3, Database,
  Mail, MapPin, Phone, RefreshCw, Search, ShieldCheck, Sparkles, Target, TrendingUp,
  Users, Workflow
} from 'lucide-react'
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts'
import { adminService, getErrorMessage, unwrap } from '../services/api'
import { formatCurrency, initials } from '../utils/dashboardData'

const cleanPhone = (phone) => String(phone || '').replace(/\D/g, '')

const toneClasses = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  orange: 'bg-orange-50 text-orange-700 border-orange-100',
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  red: 'bg-red-50 text-red-700 border-red-100',
}

const Stat = ({ label, value, note, icon: Icon, tone = 'slate' }) => (
  <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-100">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-2 truncate text-3xl font-black text-slate-950">{value}</p>
        <p className="mt-1 truncate text-xs font-bold text-slate-400">{note}</p>
      </div>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 ${toneClasses[tone]}`}>
        <Icon size={21} />
      </div>
    </div>
  </div>
)

const managerPalette = ['#0f766e', '#2563eb', '#f97316', '#dc2626', '#7c3aed']

const ActionPill = ({ icon: Icon, label, value, tone }) => {
  const toneMap = {
    teal: 'bg-teal-50 text-teal-700 border-teal-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  }

  return (
    <div className="group rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:bg-white hover:shadow-xl">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${toneMap[tone]}`}>
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
          <p className="truncate text-lg font-black text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  )
}

const ManagerDashboard = () => {
  const [workspace, setWorkspace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState('All')

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
  const manager = workspace?.manager || {}
  const team = useMemo(() => manager.team || [], [manager.team])
  const pipeline = useMemo(() => manager.pipeline || workspace?.pipeline || [], [manager.pipeline, workspace?.pipeline])
  const bottlenecks = manager.bottlenecks || []
  const territories = manager.territories || []
  const stages = useMemo(() => ['All', ...Array.from(new Set(pipeline.map((item) => item.stage).filter(Boolean)))], [pipeline])
  const filteredTeam = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return team
    return team.filter((member) => [member.name, member.role, member.territory, member.email].some((value) => String(value || '').toLowerCase().includes(q)))
  }, [search, team])
  const stageChart = useMemo(() => stages.filter((item) => item !== 'All').map((label, index) => ({
    name: label,
    value: pipeline.filter((item) => item.stage === label).length,
    fill: managerPalette[index % managerPalette.length],
  })), [pipeline, stages])
  const teamChart = useMemo(() => filteredTeam.slice(0, 6).map((member) => ({
    name: String(member.name || 'Team').split(' ')[0],
    listings: Number(member.listings || 0),
    review: Number(member.review || 0),
  })), [filteredTeam])
  const weeklyPlan = [
    { label: 'Mon', title: 'Review Sprint', note: `${stats.reviewProperties || 0} listings`, icon: AlertTriangle },
    { label: 'Tue', title: 'Lead Push', note: `${(workspace?.leads || []).length} enquiries`, icon: Target },
    { label: 'Wed', title: 'Team Audit', note: `${team.length} members`, icon: Users },
    { label: 'Thu', title: 'Inventory Check', note: `${stats.availableProperties || 0} active`, icon: Building2 },
  ]
  const urgentTasks = [
    { label: 'Review properties', value: stats.reviewProperties || 0, icon: AlertTriangle, tone: 'orange' },
    { label: 'Hot lead SLA', value: (workspace?.leads || []).filter((lead) => lead.priority === 'hot').length, icon: Target, tone: 'red' },
    { label: 'Available inventory', value: stats.availableProperties || 0, icon: Building2, tone: 'teal' },
    { label: 'Contact records', value: stats.contacts || 0, icon: Phone, tone: 'blue' },
  ]
  const topTerritory = territories[0]
  const overloadedCount = team.filter((member) => member.workload === 'Overloaded').length

  const filteredPipeline = useMemo(() => {
    const q = search.trim().toLowerCase()
    return pipeline.filter((item) => {
      const stageMatch = stage === 'All' || item.stage === stage
      const searchMatch = !q || [item.title, item.subtitle, item.owner, item.value, item.stage, item.risk].some((value) => String(value || '').toLowerCase().includes(q))
      return stageMatch && searchMatch
    })
  }, [pipeline, search, stage])

  const maxTerritory = Math.max(...territories.map((item) => item.value), 1)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <RefreshCw className="animate-spin text-[#E6761D]" size={34} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto text-red-500" size={36} />
          <h2 className="mt-4 text-xl font-black text-slate-900">Manager data unavailable</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">{error}</p>
          <button onClick={loadDashboard} className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-[#E6761D]">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-12">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/92 backdrop-blur-xl">
        <div className="px-6 py-5 lg:px-10">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-700 shadow-sm">
                <ShieldCheck size={25} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950">Manager Command Center</h1>
                <p className="text-sm font-semibold text-slate-500">Daily control for team load, listing review, lead SLA and territory performance.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search team, pipeline, territory..." className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-bold outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-100 sm:w-[344px]" />
              </div>
              <button onClick={loadDashboard} className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-white transition-all hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg">
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 lg:px-10">
        <section className="overflow-hidden rounded-[2.25rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_390px]">
            <div className="relative overflow-hidden bg-slate-950 p-7 text-white lg:p-8">
              <div className="absolute right-[-90px] top-[-90px] h-72 w-72 rounded-full border border-white/10" />
              <div className="absolute bottom-[-120px] right-20 h-72 w-72 rounded-full border border-teal-300/20" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-teal-200">
                  <Sparkles size={13} /> Live Operations
                </div>
                <h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight lg:text-4xl">
                  Aaj ka focus: reviews close karo, hot leads assign karo, aur team load balance rakho.
                </h2>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/65">
                  Dashboard live backend data se chal raha hai, isliye manager ko same screen par inventory, team aur pipeline ka clear picture milta hai.
                </p>
                <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl bg-white/8 p-4 ring-1 ring-white/10">
                    <p className="text-xs font-black uppercase tracking-widest text-white/45">Top Territory</p>
                    <p className="mt-2 truncate text-2xl font-black">{topTerritory?.label || 'No data'}</p>
                  </div>
                  <div className="rounded-3xl bg-white/8 p-4 ring-1 ring-white/10">
                    <p className="text-xs font-black uppercase tracking-widest text-white/45">Team Load Risk</p>
                    <p className="mt-2 text-2xl font-black">{overloadedCount}</p>
                  </div>
                  <div className="rounded-3xl bg-white/8 p-4 ring-1 ring-white/10">
                    <p className="text-xs font-black uppercase tracking-widest text-white/45">Pipeline Items</p>
                    <p className="mt-2 text-2xl font-black">{pipeline.length}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 lg:p-7">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-950">Action Snapshot</h3>
                  <p className="mt-1 text-xs font-bold text-slate-500">High priority work for manager</p>
                </div>
                <CheckCircle2 className="text-teal-600" size={23} />
              </div>
              <div className="mt-5 grid grid-cols-1 gap-3">
                {urgentTasks.map((item) => (
                  <ActionPill key={item.label} {...item} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Portfolio Value" value={formatCurrency(stats.totalValue || 0)} note={`${stats.properties || 0} listings`} icon={BarChart3} tone="green" />
          <Stat label="Review Queue" value={stats.reviewProperties || 0} note="Needs verification" icon={AlertTriangle} tone="orange" />
          <Stat label="Hot Leads" value={(workspace?.leads || []).filter((lead) => lead.priority === 'hot').length} note={`${stats.contacts || 0} total enquiries`} icon={Target} tone="red" />
          <Stat label="Team Capacity" value={team.length} note="Users + property executives" icon={Users} tone="blue" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-slate-800 bg-slate-950 p-6 text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-300">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-orange-300">Operational Bottlenecks</p>
                <h2 className="mt-2 text-2xl font-black">What needs manager attention</h2>
              </div>
              <Database className="text-white/40" size={30} />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              {bottlenecks.map((item) => (
                <div key={item.label} className="rounded-3xl bg-white/8 p-4 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-white/12 hover:ring-orange-300/40">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black">{item.label}</p>
                    <span className="rounded-2xl bg-white px-3 py-1 text-sm font-black text-slate-950">{item.value}</span>
                  </div>
                  <p className="mt-3 text-xs font-semibold leading-5 text-white/60">{item.action}</p>
                </div>
              ))}
              {bottlenecks.length === 0 && (
                <div className="rounded-3xl bg-white/8 p-5 ring-1 ring-white/10 md:col-span-3">
                  <p className="text-sm font-black">No operational bottlenecks right now.</p>
                  <p className="mt-1 text-xs font-semibold text-white/55">New review, lead or data-health items will appear here.</p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950">Territory Heatmap</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Top inventory clusters by location.</p>
              </div>
              <MapPin className="text-teal-600" size={24} />
            </div>
            <div className="mt-5 space-y-4">
              {territories.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-black text-slate-700">{item.label}</span>
                    <span className="text-xs font-black text-slate-400">{item.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-teal-600" style={{ width: `${Math.max(5, (item.value / maxTerritory) * 100)}%` }} />
                  </div>
                </div>
              ))}
              {territories.length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">
                  Territory data will show when listings have locality/city values.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-teal-600">Planning Board</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Weekly Manager Plan</h2>
              </div>
              <Clock3 className="text-teal-600" size={24} />
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {weeklyPlan.map((item) => (
                <div key={item.label} className="group rounded-3xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:bg-white hover:shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-teal-600 group-hover:text-white">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                      <h3 className="mt-1 font-black text-slate-950">{item.title}</h3>
                      <p className="mt-1 text-xs font-bold text-slate-500">{item.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600">Graph View</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Pipeline + Team Load</h2>
              </div>
              <BarChart3 className="text-blue-600" size={24} />
            </div>
            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[0.62fr_1fr]">
              <div className="h-56 rounded-3xl bg-slate-50 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stageChart} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={4}>
                      {stageChart.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {stageChart.length === 0 && (
                  <div className="-mt-32 text-center text-sm font-bold text-slate-400">No stage data</div>
                )}
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-wider">
                  <span className="inline-flex items-center gap-1.5 text-teal-700"><span className="h-2.5 w-2.5 rounded-full bg-teal-700" /> Listings</span>
                  <span className="inline-flex items-center gap-1.5 text-orange-700"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Review</span>
                </div>
                <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamChart}>
                    <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', fontWeight: 700 }} />
                    <Bar dataKey="listings" fill="#0f766e" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="review" fill="#f97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {stageChart.map((entry) => (
                <span key={entry.name} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.fill }} /> {entry.name}: {entry.value}
                </span>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">Team Leaderboard</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Capacity and verification pressure.</p>
              </div>
              <Users className="text-blue-600" size={24} />
            </div>
            <div className="space-y-3">
              {filteredTeam.map((member, index) => (
                <div key={member.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-400">#{index + 1}</span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white">{initials(member.name)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-black text-slate-900">{member.name}</p>
                      <p className="truncate text-xs font-bold text-slate-500">{member.role} · {member.territory}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${member.workload === 'Overloaded' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{member.workload}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-white p-3"><p className="text-[10px] font-bold text-slate-400">Listings</p><p className="font-black text-slate-900">{member.listings}</p></div>
                    <div className="rounded-2xl bg-white p-3"><p className="text-[10px] font-bold text-slate-400">Review</p><p className="font-black text-orange-600">{member.review}</p></div>
                    <div className="rounded-2xl bg-white p-3"><p className="text-[10px] font-bold text-slate-400">Value</p><p className="truncate font-black text-teal-700">{member.valueLabel}</p></div>
                  </div>
                </div>
              ))}
              {filteredTeam.length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <Users className="mx-auto text-slate-300" size={34} />
                  <p className="mt-3 text-sm font-bold text-slate-500">No team member matches this search.</p>
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
            <div className="border-b border-slate-100 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950">Pipeline Board</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Lead intake, listing verification and live inventory in one place.</p>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {stages.map((item) => (
                    <button key={item} onClick={() => setStage(item)} className={`whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-black ${stage === item ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700'}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="max-h-[760px] overflow-y-auto divide-y divide-slate-100">
              {filteredPipeline.map((item) => (
                <div key={`${item.type}-${item.id}`} className="p-5 transition-all duration-300 hover:bg-teal-50/35">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase text-slate-600">{item.type}</span>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase text-blue-700">{item.stage}</span>
                      </div>
                      <p className="mt-2 font-black text-slate-950">{item.title}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{item.subtitle}</p>
                      <p className="mt-1 text-xs font-bold text-slate-400">Owner: {item.owner || 'Unassigned'} · {item.risk}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="w-36 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <div className="mb-1 flex justify-between text-[10px] font-black text-slate-400">
                          <span>Probability</span><span>{Math.min(item.probability || 0, 100)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600" style={{ width: `${Math.min(item.probability || 0, 100)}%` }} /></div>
                      </div>
                      {item.phone && <a href={`tel:${item.phone}`} className="rounded-xl border border-emerald-100 bg-emerald-50 p-2 text-emerald-700 transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:text-white"><Phone size={15} /></a>}
                      {item.phone && <a href={`https://wa.me/${cleanPhone(item.phone)}`} target="_blank" rel="noreferrer" className="rounded-xl border border-green-100 bg-green-50 p-2 text-green-700 transition-all hover:-translate-y-0.5 hover:bg-green-600 hover:text-white"><Workflow size={15} /></a>}
                      {item.email && <a href={`mailto:${item.email}`} className="rounded-xl border border-blue-100 bg-blue-50 p-2 text-blue-700 transition-all hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white"><Mail size={15} /></a>}
                    </div>
                  </div>
                </div>
              ))}
              {filteredPipeline.length === 0 && (
                <div className="p-12 text-center">
                  <Clock3 className="mx-auto text-slate-300" size={34} />
                  <p className="mt-3 text-sm font-bold text-slate-500">No pipeline records match this filter.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[
            { label: 'Available Inventory', value: stats.availableProperties || 0, icon: Building2 },
            { label: 'Conversion Rate', value: `${stats.conversionRate || 0}%`, icon: TrendingUp },
            { label: 'Data Sources Online', value: '5/5', icon: CheckCircle2 },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl">
              <item.icon className="text-teal-600" size={22} />
              <p className="mt-4 text-2xl font-black text-slate-950">{item.value}</p>
              <p className="text-sm font-bold text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard
