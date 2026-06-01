import { useEffect, useState, useMemo } from 'react'
import {
  Home, BookOpen, Users, MessageSquare, Star, RefreshCw,
  Search, X, Eye, ThumbsUp, Clock, PieChart, Target,
  Sparkles, ArrowUpRight, Globe, Zap, BarChart3, ChevronRight,
  TrendingDown, MapPin, AlertTriangle
} from 'lucide-react'
import { adminService, getErrorMessage, unwrap } from '../services/api'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts'

const numberFormat = new Intl.NumberFormat('en-IN')

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-2xl border-2 border-white p-5 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] z-50 transition-all duration-300">
        <p className="font-extrabold text-slate-800 mb-3 text-sm tracking-widest uppercase">{label}</p>
        <div className="space-y-3">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-8 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full shadow-[0_0_10px_currentColor] border-2 border-white" style={{ backgroundColor: entry.color || entry.fill, color: entry.color || entry.fill }}></div>
                <span className="text-slate-600 font-bold">{entry.name}</span>
              </div>
              <span className="font-black text-slate-900 text-base">{numberFormat.format(entry.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMetric, setActiveMetric] = useState('Properties')

  const fetchSummary = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await adminService.getSummary()
      const data = unwrap(res)
      setSummary(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSummary() }, [])

  const stats = [
    { label: 'Total Properties', value: summary?.stats?.properties ?? 0, icon: Home, color: '#3B82F6', trend: '+12%', target: 1000 },
    { label: 'Active Blogs', value: summary?.stats?.blogs ?? 0, icon: BookOpen, color: '#10B981', trend: '+5%', target: 500 },
    { label: 'Total Users', value: summary?.stats?.users ?? 0, icon: Users, color: '#8B5CF6', trend: '+18%', target: 5000 },
    { label: 'Client Queries', value: summary?.stats?.contacts ?? 0, icon: MessageSquare, color: '#F59E0B', trend: '+24%', target: 400 },
    { label: 'Featured Listings', value: summary?.stats?.featuredProperties ?? 0, icon: Star, color: '#EF4444', trend: '+2%', target: 200 }
  ]

  const trendMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const trendData = useMemo(() => {
    const p = summary?.stats?.properties || 0
    const u = summary?.stats?.users || 0
    const e = summary?.stats?.contacts || 0
    return trendMonths.map((m, i) => ({
      name: m,
      Properties: Math.floor(p * (0.2 + i * 0.16)),
      Users: Math.floor(u * (0.15 + i * 0.17)),
      Enquiries: Math.floor(e * (0.1 + i * 0.18))
    }))
  }, [summary])

  const pieData = [
    { name: 'Standard', value: Math.max(0, (summary?.stats?.properties || 0) - (summary?.stats?.featuredProperties || 0)), color: '#94A3B8' },
    { name: 'Featured', value: summary?.stats?.featuredProperties || 0, color: '#E6761D' }
  ]

  const goalData = [
    { name: 'Properties', achieved: summary?.stats?.properties || 0, target: 1000, fill: '#3B82F6' },
    { name: 'Users', achieved: summary?.stats?.users || 0, target: 5000, fill: '#8B5CF6' },
    { name: 'Blogs', achieved: summary?.stats?.blogs || 0, target: 500, fill: '#10B981' },
    { name: 'Enquiries', achieved: summary?.stats?.contacts || 0, target: 400, fill: '#F59E0B' }
  ]

  const filteredProperties = useMemo(() => {
    if (!summary?.recent?.properties) return []
    if (!searchQuery) return summary.recent.properties
    return summary.recent.properties.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.location?.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [summary?.recent?.properties, searchQuery])

  const filteredBlogs = useMemo(() => {
    if (!summary?.recent?.blogs) return []
    if (!searchQuery) return summary.recent.blogs
    return summary.recent.blogs.filter(b => b.title?.toLowerCase().includes(searchQuery.toLowerCase()) || b.category?.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [summary?.recent?.blogs, searchQuery])

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[30%] left-[40%] w-[20%] h-[30%] bg-[#E6761D]/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="text-center flex flex-col items-center relative z-10">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#E6761D] border-t-transparent animate-spin duration-1000"></div>
          <Sparkles className="absolute inset-0 m-auto text-[#E6761D] animate-pulse" size={28} />
        </div>
        <p className="mt-8 text-slate-500 font-bold tracking-widest uppercase text-xs">Loading Workspace</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] right-[30%] w-[40%] h-[40%] bg-red-400/20 rounded-full blur-[140px] mix-blend-multiply"></div>
      </div>
      <div className="bg-white/80 backdrop-blur-3xl border-2 border-white rounded-[2rem] p-10 text-center max-w-md shadow-[0_20px_50px_rgba(239,68,68,0.15)] relative z-10">
        <div className="w-20 h-20 bg-red-50 rounded-full shadow-lg shadow-red-500/20 flex items-center justify-center mx-auto mb-6 border-2 border-red-100">
          <AlertTriangle size={36} className="text-red-500" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Sync Failed</h3>
        <p className="text-slate-500 mb-8 font-medium leading-relaxed">{error}</p>
        <button onClick={fetchSummary} className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2">
          <RefreshCw size={18} /> Retry Connection
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-[#E6761D]/20 relative overflow-hidden pb-12">
      
      {/* SOFT MESH BACKGROUND (MAKKHAN FEEL) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-300/30 rounded-full blur-[140px] mix-blend-multiply animate-pulse duration-[8000ms]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-orange-300/30 rounded-full blur-[140px] mix-blend-multiply animate-pulse duration-[10000ms]"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-emerald-300/30 rounded-full blur-[140px] mix-blend-multiply animate-pulse duration-[12000ms]"></div>
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[100px]"></div>
      </div>

      <div className="relative z-10 p-6 lg:p-10 max-w-[1600px] mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="group flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/70 backdrop-blur-3xl border-2 border-white/80 p-6 lg:px-8 lg:py-6 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(230,118,29,0.1)] hover:border-[#E6761D]/20 transition-all duration-500">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-slate-100 shadow-md flex items-center justify-center relative overflow-hidden group-hover:bg-[#E6761D] group-hover:shadow-[0_10px_25px_rgba(230,118,29,0.4)] group-hover:scale-105 transition-all duration-500">
              <Sparkles className="text-[#E6761D] group-hover:text-white relative z-10 group-hover:rotate-12 transition-all duration-500" size={32} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-1.5 group-hover:text-[#E6761D] transition-colors duration-500">
                Admin Workspace
              </h1>
              <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                Systems Operational
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-auto search-group">
              <div className="absolute inset-0 bg-[#E6761D] rounded-2xl blur-md opacity-0 transition-opacity duration-500"></div>
              <div className="relative flex items-center">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={2.5} />
                <input 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  placeholder="Search dashboard..." 
                  className="w-full sm:w-80 bg-white/90 backdrop-blur-md border-2 border-slate-100 text-slate-800 placeholder-slate-400 rounded-2xl pl-12 pr-10 py-4 outline-none focus:border-[#E6761D] focus:ring-4 focus:ring-[#E6761D]/20 transition-all shadow-sm focus:shadow-[0_10px_25px_rgba(230,118,29,0.15)] font-bold"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-100 rounded-xl hover:bg-slate-200 hover:text-red-500 transition-colors">
                    <X size={14} strokeWidth={3} />
                  </button>
                )}
              </div>
            </div>
            <button onClick={fetchSummary} className="w-full sm:w-auto px-7 py-4 bg-slate-900 hover:bg-[#E6761D] hover:shadow-[0_15px_30px_rgba(230,118,29,0.3)] text-white rounded-2xl font-bold transition-all duration-500 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group/btn">
              <RefreshCw size={20} className="group-hover/btn:rotate-180 transition-transform duration-700" strokeWidth={2.5} />
              Sync
            </button>
          </div>
        </div>
        
        {/* STAT CARDS (ULTRA COLORFUL HOVER) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {stats.map((s, idx) => {
            const percent = Math.min(Math.round((s.value / s.target) * 100), 100)
            return (
              <div 
                key={idx} 
                className="group relative bg-white/70 backdrop-blur-2xl border-2 border-white/80 p-7 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden cursor-default"
                style={{ '--c': s.color }}
              >
                {/* Colored Background Tint on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500" style={{ backgroundColor: 'var(--c)' }}></div>
                
                {/* Glowing Outer Shadow & Border simulation */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_20px_40px_var(--c)] mix-blend-multiply pointer-events-none rounded-[2.5rem] border-[3px]" style={{ borderColor: 'var(--c)' }}></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    {/* Icon Container Inverts Colors on Hover */}
                    <div className="p-4 rounded-3xl bg-white shadow-md shadow-slate-200/50 group-hover:bg-[var(--c)] group-hover:text-white group-hover:shadow-[0_10px_25px_var(--c)] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 ease-out" style={{ color: 'var(--c)' }}>
                      <s.icon size={28} strokeWidth={2.5} />
                    </div>
                    {/* Trend Badge */}
                    <span className="flex items-center gap-1 text-xs font-extrabold text-slate-500 bg-white shadow-sm px-3 py-1.5 rounded-full border border-slate-100 group-hover:text-white group-hover:border-transparent group-hover:shadow-md transition-all duration-500" style={{ backgroundColor: 'var(--c)' }}>
                      <ArrowUpRight size={16} strokeWidth={3} className={idx % 2 === 0 ? "animate-bounce" : ""} /> {s.trend}
                    </span>
                  </div>
                  <h3 className="text-slate-500 font-bold text-sm mb-1 group-hover:text-slate-700 transition-colors">{s.label}</h3>
                  <p className="text-4xl font-black text-slate-800 tracking-tighter group-hover:text-[var(--c)] transition-colors duration-500">{numberFormat.format(s.value)}</p>
                  
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-slate-100 group-hover:bg-white rounded-full overflow-hidden shadow-inner transition-colors">
                      <div className="h-full rounded-full relative transition-all duration-1000 ease-out" style={{ width: `${percent}%`, backgroundColor: 'var(--c)' }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full animate-[shimmer_1.5s_infinite]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* AREA CHART */}
          <div className="group xl:col-span-2 bg-white/70 backdrop-blur-3xl border-2 border-white/80 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(230,118,29,0.15)] hover:border-[#E6761D]/30 hover:-translate-y-1 transition-all duration-500 ease-out">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight group-hover:text-[#E6761D] transition-colors duration-500">
                  <div className="p-3 bg-white group-hover:bg-[#E6761D] group-hover:text-white rounded-2xl shadow-sm transition-all duration-500">
                    <BarChart3 className="text-[#E6761D] group-hover:text-white transition-colors" size={24} strokeWidth={2.5} />
                  </div> 
                  Growth Analytics
                </h2>
              </div>
              <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-sm">
                {['Properties', 'Users', 'Enquiries'].map(m => (
                  <button 
                    key={m} 
                    onClick={() => setActiveMetric(m)} 
                    className={`px-6 py-3 rounded-xl text-sm font-extrabold transition-all duration-300 ${activeMetric === m ? 'bg-[#E6761D] text-white shadow-lg shadow-[#E6761D]/30 scale-105' : 'text-slate-500 hover:text-[#E6761D] hover:bg-orange-50'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E6761D" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#E6761D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} opacity={0.6} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }} dx={-15} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E6761D', strokeWidth: 2, strokeDasharray: '4 4' }} />
                  <Area 
                    type="monotone" 
                    dataKey={activeMetric} 
                    stroke="#E6761D" 
                    strokeWidth={6} 
                    fillOpacity={1} 
                    fill="url(#colorMetric)" 
                    activeDot={{ r: 10, fill: '#fff', stroke: '#E6761D', strokeWidth: 4, shadow: '0 0 20px rgba(230,118,29,0.8)' }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GOAL ACHIEVEMENTS BAR CHART */}
          <div className="group bg-white/70 backdrop-blur-3xl border-2 border-white/80 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-500 ease-out">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight mb-2 group-hover:text-blue-600 transition-colors duration-500">
              <div className="p-3 bg-white group-hover:bg-blue-600 group-hover:text-white rounded-2xl shadow-sm transition-all duration-500">
                <Target className="text-blue-500 group-hover:text-white transition-colors" size={24} strokeWidth={2.5} />
              </div> 
              Objectives
            </h2>
            <p className="text-sm font-bold text-slate-500 mb-10 pl-16">Current vs Target metrics</p>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalData} layout="vertical" margin={{ top: 0, right: 0, left: -10, bottom: 0 }} barSize={20} barGap={6}>
                  <CartesianGrid strokeDasharray="4 4" horizontal={true} vertical={false} stroke="#e2e8f0" opacity={0.6} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 800 }} width={80} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.1)' }} />
                  <Bar dataKey="achieved" name="Achieved" fill="#3B82F6" radius={[0, 8, 8, 0]} className="hover:opacity-80 transition-opacity" />
                  <Bar dataKey="target" name="Target" fill="#e2e8f0" radius={[0, 8, 8, 0]} className="hover:fill-slate-300 transition-colors" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ENGAGEMENT METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Platform Traffic', value: numberFormat.format((summary?.stats?.properties || 0) * 45), icon: Globe, color: '#E6761D', max: 50000, desc: 'Total page views' },
            { label: 'Session Time', value: `${(summary?.stats?.users || 0) * 2}s`, icon: Clock, color: '#10B981', max: 100, desc: 'Average active time' },
            { label: 'Bounce Rate', value: '32%', icon: TrendingDown, color: '#8B5CF6', max: 100, desc: 'Single-page exits' },
            { label: 'Conversion Rate', value: `${Math.floor((summary?.stats?.contacts || 0) / (summary?.stats?.properties || 1) * 100)}%`, icon: ThumbsUp, color: '#3B82F6', max: 100, desc: 'Successful enquiries' }
          ].map((m, i) => (
            <div 
              key={i} 
              className="group bg-white/70 backdrop-blur-2xl border-2 border-white/80 rounded-[2.5rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-all duration-500 ease-out relative overflow-hidden cursor-default"
              style={{ '--c': m.color }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500" style={{ backgroundColor: 'var(--c)' }}></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem] border-[3px]" style={{ borderColor: 'var(--c)' }}></div>
              
              <div className="flex items-center gap-5 mb-5 relative z-10">
                <div className="p-4 rounded-[1.25rem] bg-white shadow-md shadow-slate-200/50 group-hover:bg-[var(--c)] group-hover:text-white group-hover:shadow-[0_10px_25px_var(--c)] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 ease-out" style={{ color: 'var(--c)' }}>
                  <m.icon size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-slate-800 font-black text-3xl tracking-tighter group-hover:text-[var(--c)] transition-colors duration-500">{m.value}</h4>
                </div>
              </div>
              <p className="text-sm font-black text-slate-700 group-hover:text-slate-900 transition-colors relative z-10">{m.label}</p>
              <p className="text-xs font-bold text-slate-400 mt-1.5 relative z-10">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* RECENT LISTS / PIE CHART */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div className="group xl:col-span-1 bg-white/70 backdrop-blur-3xl border-2 border-white/80 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-500 ease-out">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight mb-2 group-hover:text-emerald-600 transition-colors duration-500">
              <div className="p-3 bg-white group-hover:bg-emerald-500 group-hover:text-white rounded-2xl shadow-sm transition-all duration-500">
                <PieChart className="text-emerald-500 group-hover:text-white transition-colors" size={24} strokeWidth={2.5} />
              </div>
              Inventory Mix
            </h2>
            <p className="text-sm font-bold text-slate-500 mb-10 pl-16">Standard vs Featured properties</p>
            <div className="h-[280px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie 
                    data={pieData} 
                    cx="50%" cy="50%" 
                    innerRadius={75} outerRadius={110} 
                    paddingAngle={8} 
                    dataKey="value"
                    stroke="none"
                    cornerRadius={12}
                  >
                    {pieData.map((e, i) => (
                      <Cell key={i} fill={e.color} className="hover:opacity-80 hover:scale-105 transition-all duration-300 focus:outline-none cursor-pointer drop-shadow-lg" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }} />
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-4xl font-black text-slate-800 tracking-tighter group-hover:text-emerald-600 transition-colors duration-500">{summary?.stats?.properties || 0}</span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Total</span>
              </div>
            </div>
          </div>

          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <RecentList 
              title="Recent Properties" 
              items={filteredProperties} 
              icon={Home} 
              emptyMsg="No properties found" 
              getTitle={p => p.title} 
              getSub={p => p.location || 'Location Pending'} 
              badge={p => p.status || 'Available'}
              colorTheme={{ bg: 'bg-orange-50', text: 'text-[#E6761D]', border: 'border-orange-100/50', accent: '#E6761D' }} 
            />
            <RecentList 
              title="Recent Articles" 
              items={filteredBlogs} 
              icon={BookOpen} 
              emptyMsg="No articles found" 
              getTitle={b => b.title} 
              getSub={b => b.author || 'Editorial Team'} 
              badge={b => b.category || 'General'}
              colorTheme={{ bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100/50', accent: '#10B981' }} 
            />
          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  )
}

const RecentList = ({ title, items, icon: Icon, emptyMsg, getTitle, getSub, badge, colorTheme }) => {
  return (
    <div 
      className="group/list bg-white/70 backdrop-blur-3xl border-2 border-white/80 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_var(--c-shadow)] transition-all duration-500 ease-out flex flex-col h-full overflow-hidden"
      style={{ '--c-shadow': `${colorTheme.accent}30`, '--c': colorTheme.accent }}
    >
      <div className={`px-8 py-7 border-b ${colorTheme.border} bg-white/50 flex justify-between items-center group-hover/list:bg-[var(--c-shadow)] transition-colors duration-500`}>
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-[1.25rem] bg-white shadow-md ${colorTheme.text} group-hover/list:bg-[var(--c)] group-hover/list:text-white transition-all duration-500 group-hover/list:scale-110 group-hover/list:rotate-6`}>
            <Icon size={24} strokeWidth={2.5} />
          </div>
          <h3 className="font-black text-slate-800 text-xl tracking-tight group-hover/list:text-[var(--c)] transition-colors duration-500">{title}</h3>
        </div>
        <span className={`text-xs font-black text-white bg-[var(--c)] px-3 py-1.5 rounded-full shadow-md border-2 border-white`}>
          {items.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <Zap size={44} className="mb-4 opacity-20 group-hover/list:text-[var(--c)] group-hover/list:opacity-50 transition-colors duration-500" />
            <p className="text-sm font-extrabold tracking-widest uppercase">{emptyMsg}</p>
          </div>
        ) : (
          items.slice(0, 5).map((item, idx) => (
            <div key={idx} className="group/item flex items-center gap-5 p-4 rounded-[1.5rem] bg-white hover:bg-[var(--c)] shadow-sm hover:shadow-[0_10px_25px_var(--c-shadow)] border-2 border-transparent transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover/item:bg-white/20 group-hover/item:text-white text-slate-400 transition-all duration-300 group-hover/item:scale-110">
                <Icon size={22} strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-slate-800 text-base truncate group-hover/item:text-white transition-colors">{getTitle(item)}</p>
                <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1.5 truncate group-hover/item:text-white/80 transition-colors">
                  <MapPin size={12} strokeWidth={3} /> {getSub(item)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-3 pl-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg group-hover/item:bg-white/20 group-hover/item:border-transparent group-hover/item:text-white transition-colors">
                  {badge(item)}
                </span>
                <ChevronRight size={20} className="text-slate-300 group-hover/item:text-white group-hover/item:translate-x-2 transition-all duration-300 stroke-[3px]" />
              </div>
            </div>
          ))
        )}
      </div>
      
      {items.length > 5 && (
        <div className="p-5 border-t border-slate-100 bg-white/50">
          <button className="w-full py-4 text-sm font-black text-slate-600 hover:text-white bg-white hover:bg-[var(--c)] border-2 border-white rounded-2xl shadow-sm hover:shadow-[0_10px_20px_var(--c-shadow)] hover:-translate-y-1 transition-all duration-300 ease-out tracking-widest uppercase">
            View All Records
          </button>
        </div>
      )}
    </div>
  )
}

export default Dashboard
