import { useState, useEffect } from 'react'
import {
  TrendingUp, TrendingDown, IndianRupee, Home, Users, Star,
  BarChart3, ArrowUpRight, ArrowDownRight, Calendar, Filter,
  Download, RefreshCw, Activity, Target, Zap, Eye,
  MapPin, Clock, Award, Layers, PieChart, LineChart
} from 'lucide-react'

/* ── tiny inline bar chart ── */
const MiniBar = ({ data = [], color = '#E6761D' }) => {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-0.5 h-10">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all duration-500"
          style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: 0.6 + (i / data.length) * 0.4 }}
        />
      ))}
    </div>
  )
}

/* ── inline sparkline ── */
const Sparkline = ({ data = [], color = '#E6761D', width = 80 }) => {
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const h = 32
  const w = width
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} fillOpacity="0.12" stroke="none" />
    </svg>
  )
}

/* ── donut chart ── */
const DonutChart = ({ segments }) => {
  const total = segments.reduce((a, s) => a + s.value, 0)
  let cumulative = 0
  const r = 52, cx = 60, cy = 60, strokeW = 14
  const circumference = 2 * Math.PI * r
  const slices = segments.map(s => {
    const pct = s.value / total
    const dash = pct * circumference
    const gap = circumference - dash
    const offset = circumference - (cumulative / total) * circumference
    cumulative += s.value
    return { ...s, dash, gap, offset }
  })
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeW} />
      {slices.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={strokeW}
          strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={s.offset}
          strokeLinecap="round" className="transition-all duration-700" />
      ))}
    </svg>
  )
}

/* ═══════════════ DATA ═══════════════ */
const monthlyRevenue = [42, 58, 51, 76, 68, 89, 95, 84, 102, 118, 97, 134]
const monthlyLeads   = [28, 35, 30, 42, 38, 55, 60, 48, 65, 72, 58, 80]
const weeklyVisits   = [12, 18, 14, 22, 30, 25, 28]
const conversionData = [18, 22, 19, 25, 28, 24, 30, 26, 32, 35, 29, 38]
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const topProperties = [
  { name: 'Sky Residences, Andheri', type: '3 BHK', views: 1842, leads: 42, status: 'Available', change: +18 },
  { name: 'Ocean Pearl, Juhu', type: 'Penthouse', views: 1560, leads: 28, status: 'Under Review', change: +12 },
  { name: 'Green Valley, Powai', type: '2 BHK', views: 1320, leads: 35, status: 'Available', change: -5 },
  { name: 'Royal Palms, Bandra', type: 'Villa', views: 1100, leads: 22, status: 'Available', change: +9 },
  { name: 'Metro Heights, Thane', type: '1 BHK', views: 980, leads: 19, status: 'Sold Out', change: -2 },
]

const sourceData = [
  { label: 'WhatsApp', value: 38, color: '#25D366' },
  { label: 'Website', value: 27, color: '#E6761D' },
  { label: 'Referral', value: 18, color: '#6366f1' },
  { label: 'Social', value: 11, color: '#ec4899' },
  { label: 'Others', value: 6, color: '#94a3b8' },
]

const cityData = [
  { city: 'Mumbai', deals: 48, revenue: '₹24.5 Cr', pct: 100 },
  { city: 'Pune', deals: 35, revenue: '₹16.2 Cr', pct: 66 },
  { city: 'Thane', deals: 22, revenue: '₹9.8 Cr', pct: 46 },
  { city: 'Navi Mumbai', deals: 18, revenue: '₹7.4 Cr', pct: 30 },
  { city: 'Nashik', deals: 8, revenue: '₹2.9 Cr', pct: 12 },
]

const KPIS = [
  {
    label: 'Total Revenue',
    value: '₹60.8 Cr',
    sub: '+22.4% vs last year',
    positive: true,
    icon: IndianRupee,
    gradient: 'from-[#E6761D] to-orange-600',
    glow: 'shadow-orange-500/25',
    sparkData: monthlyRevenue,
    sparkColor: '#E6761D',
    bg: 'from-orange-50 to-amber-50',
    border: 'border-orange-100',
  },
  {
    label: 'Total Leads',
    value: '641',
    sub: '+18.7% vs last month',
    positive: true,
    icon: Users,
    gradient: 'from-blue-500 to-indigo-600',
    glow: 'shadow-blue-500/25',
    sparkData: monthlyLeads,
    sparkColor: '#6366f1',
    bg: 'from-blue-50 to-indigo-50',
    border: 'border-blue-100',
  },
  {
    label: 'Properties Listed',
    value: '284',
    sub: '+8 this month',
    positive: true,
    icon: Home,
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'shadow-emerald-500/25',
    sparkData: [18,22,20,25,23,28,26,30,27,32,29,35],
    sparkColor: '#10b981',
    bg: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-100',
  },
  {
    label: 'Conversion Rate',
    value: '34.2%',
    sub: '-2.1% vs last month',
    positive: false,
    icon: Target,
    gradient: 'from-purple-500 to-violet-600',
    glow: 'shadow-purple-500/25',
    sparkData: conversionData,
    sparkColor: '#8b5cf6',
    bg: 'from-purple-50 to-violet-50',
    border: 'border-purple-100',
  },
]

/* ═══════════════ COMPONENT ═══════════════ */
const Analytics = () => {
  const [period, setPeriod] = useState('yearly')
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    setAnimKey(k => k + 1)
  }, [period])

  const revenueData = period === 'weekly' ? weeklyVisits : monthlyRevenue
  const revenueLabels = period === 'weekly' ? DAYS : MONTHS
  const maxRev = Math.max(...revenueData, 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pb-12">

      {/* ─── HEADER ─── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
        <div className="px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Analytics & Insights</h1>
              <p className="text-gray-500 text-sm">Real-time performance metrics and business intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Period selector */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
              {['weekly', 'monthly', 'yearly'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
              <Download size={15} /> Export
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8 space-y-8 max-w-[1600px] mx-auto">

        {/* ─── KPI CARDS ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {KPIS.map((kpi, i) => (
            <div key={i} className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${kpi.bg} border ${kpi.border} shadow-sm hover:shadow-xl hover:shadow-gray-200/80 hover:-translate-y-1 transition-all duration-300 p-5`}>
              {/* icon */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center shadow-lg ${kpi.glow}`}>
                  <kpi.icon size={20} className="text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${kpi.positive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                  {kpi.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {kpi.sub.split(' ')[0]}
                </div>
              </div>
              <p className="text-3xl font-black text-gray-900 mb-0.5">{kpi.value}</p>
              <p className="text-xs font-bold text-gray-500 mb-3">{kpi.label}</p>
              <div className="opacity-70">
                <Sparkline data={kpi.sparkData} color={kpi.sparkColor} width={140} />
              </div>
            </div>
          ))}
        </div>

        {/* ─── REVENUE BAR CHART + DONUT ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Bar chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-black text-gray-900">Revenue Overview</h2>
                <p className="text-sm text-gray-500">Total income across {period === 'weekly' ? 'this week' : 'this year'}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                  <span className="w-3 h-3 rounded-sm bg-gradient-to-br from-[#E6761D] to-orange-500" />
                  Revenue (₹ Lakhs)
                </div>
              </div>
            </div>

            {/* Custom bar chart */}
            <div key={animKey} className="flex items-end gap-2 h-52 mt-2">
              {revenueData.map((v, i) => {
                const heightPct = (v / maxRev) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
                    <div className="w-full flex flex-col justify-end" style={{ height: '180px' }}>
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-[#E6761D] to-orange-400 group-hover/bar:from-orange-500 group-hover/bar:to-amber-400 transition-all duration-500 relative cursor-pointer"
                        style={{ height: `${heightPct}%`, animationDelay: `${i * 50}ms` }}
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                          ₹{v}L
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-gray-400">{revenueLabels[i]}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Donut – Lead Sources */}
          <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6">
            <h2 className="text-lg font-black text-gray-900 mb-1">Lead Sources</h2>
            <p className="text-sm text-gray-500 mb-6">Where your leads come from</p>
            <div className="flex items-center justify-center mb-6 relative">
              <DonutChart segments={sourceData} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-gray-900">641</span>
                <span className="text-[10px] font-bold text-gray-400">Total</span>
              </div>
            </div>
            <div className="space-y-3">
              {sourceData.map((s, i) => (
                <div key={i} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-sm font-bold text-gray-700">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.value}%`, backgroundColor: s.color }} />
                    </div>
                    <span className="text-xs font-black text-gray-700 w-8 text-right">{s.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── TOP PROPERTIES + CITY PERFORMANCE ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Top Properties */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-900">Top Performing Properties</h2>
                <p className="text-sm text-gray-500">Ranked by views & lead generation</p>
              </div>
              <span className="text-xs font-black text-[#E6761D] bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-xl">This Month</span>
            </div>
            <div className="divide-y divide-gray-50">
              {topProperties.map((prop, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group cursor-pointer">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-black text-gray-600 flex-shrink-0 group-hover:from-[#E6761D] group-hover:to-orange-500 group-hover:text-white transition-all">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 text-sm truncate">{prop.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-gray-400">{prop.type}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${prop.status === 'Available' ? 'bg-emerald-50 text-emerald-600' : prop.status === 'Sold Out' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                        {prop.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 text-right flex-shrink-0">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">Views</p>
                      <p className="text-sm font-black text-gray-900">{prop.views.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">Leads</p>
                      <p className="text-sm font-black text-gray-900">{prop.leads}</p>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-black ${prop.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {prop.change >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      {Math.abs(prop.change)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* City Performance */}
          <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6">
            <h2 className="text-lg font-black text-gray-900 mb-1">City Performance</h2>
            <p className="text-sm text-gray-500 mb-6">Revenue by location</p>
            <div className="space-y-5">
              {cityData.map((city, i) => (
                <div key={i} className="group cursor-default">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-[#E6761D]" />
                      <span className="text-sm font-black text-gray-800">{city.city}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-gray-900">{city.revenue}</span>
                      <span className="text-[9px] text-gray-400 ml-1">· {city.deals} deals</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#E6761D] to-orange-400 transition-all duration-700 group-hover:from-orange-500 group-hover:to-amber-400"
                      style={{ width: `${city.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Summary box */}
            <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Award size={14} className="text-[#E6761D]" />
                <span className="text-xs font-black text-[#E6761D] uppercase tracking-wider">Top Market</span>
              </div>
              <p className="text-base font-black text-gray-900">Mumbai</p>
              <p className="text-sm text-gray-600">48 deals · ₹24.5 Cr revenue</p>
            </div>
          </div>
        </div>

        {/* ─── ACTIVITY METRICS ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[
            { label: 'Avg. Response Time', value: '4.2 min', icon: Clock, change: '-12%', positive: true, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
            { label: 'Site Visits Booked', value: '128', icon: Calendar, change: '+24%', positive: true, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
            { label: 'Featured Listings', value: '38', icon: Star, change: '+5', positive: true, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
            { label: 'Active Agents', value: '24', icon: Zap, change: '+3', positive: true, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
          ].map((metric, i) => (
            <div key={i} className={`flex items-center gap-4 p-5 bg-white rounded-2xl border ${metric.border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default`}>
              <div className={`w-12 h-12 rounded-2xl ${metric.bg} flex items-center justify-center flex-shrink-0`}>
                <metric.icon size={22} className={metric.color} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold mb-0.5">{metric.label}</p>
                <p className="text-2xl font-black text-gray-900">{metric.value}</p>
                <span className={`text-[10px] font-black ${metric.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {metric.change} this month
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ─── CONVERSION FUNNEL ─── */}
        <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-gray-900">Sales Conversion Funnel</h2>
              <p className="text-sm text-gray-500">Lead journey from inquiry to closure</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { stage: 'New Leads', count: 641, pct: 100, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' },
              { stage: 'Contacted', count: 482, pct: 75, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700' },
              { stage: 'Site Visit', count: 280, pct: 44, color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50', text: 'text-purple-700' },
              { stage: 'Negotiation', count: 145, pct: 23, color: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', text: 'text-rose-700' },
              { stage: 'Closed Won', count: 52, pct: 8, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-700' },
            ].map((f, i, arr) => (
              <div key={i} className="flex flex-col items-center gap-2 group cursor-default">
                {/* funnel bar */}
                <div className="w-full flex flex-col items-center">
                  <div
                    className={`w-full rounded-2xl bg-gradient-to-b ${f.color} flex flex-col items-center justify-center py-4 shadow-sm group-hover:-translate-y-1 transition-all duration-300`}
                    style={{ opacity: 0.4 + (f.pct / 100) * 0.6 }}
                  >
                    <span className="text-2xl font-black text-white drop-shadow-sm">{f.count}</span>
                    <span className="text-[10px] font-bold text-white/80">{f.pct}%</span>
                  </div>
                </div>
                <p className="text-xs font-black text-gray-700 text-center">{f.stage}</p>
                {i < arr.length - 1 && (
                  <div className="hidden md:flex items-center justify-center absolute">
                    {/* connector arrow would go here, skipped for layout simplicity */}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Analytics
