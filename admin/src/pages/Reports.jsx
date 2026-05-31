import { useState } from 'react';
import {
  Download, FileText, PieChart, TrendingUp, DollarSign, Home, Users,
  Calendar, Filter, BarChart3, Activity, Eye, ChevronDown,
  Printer, Mail, AlertCircle, CheckCircle, Clock, Zap, ArrowUpRight,
  RefreshCw, Search, Sparkles, ChevronRight, Star
} from 'lucide-react';
import { LineChart as LineChartIcon } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend, RadialBarChart, RadialBar, PieChart as RePieChart, Pie
} from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 42, deals: 18, target: 40 },
  { month: 'Feb', revenue: 48, deals: 22, target: 45 },
  { month: 'Mar', revenue: 55, deals: 28, target: 52 },
  { month: 'Apr', revenue: 62, deals: 32, target: 58 },
  { month: 'May', revenue: 71, deals: 36, target: 68 },
  { month: 'Jun', revenue: 68, deals: 34, target: 70 },
  { month: 'Jul', revenue: 85, deals: 42, target: 80 },
  { month: 'Aug', revenue: 92, deals: 45, target: 88 },
  { month: 'Sep', revenue: 101, deals: 48, target: 95 },
  { month: 'Oct', revenue: 112, deals: 52, target: 105 },
  { month: 'Nov', revenue: 125, deals: 58, target: 118 },
  { month: 'Dec', revenue: 148, deals: 64, target: 140 },
];

const categoryData = [
  { name: 'Residential', value: 45, color: '#E6761D' },
  { name: 'Commercial', value: 30, color: '#3b82f6' },
  { name: 'Industrial', value: 15, color: '#8b5cf6' },
  { name: 'Plots', value: 10, color: '#10b981' },
];

const CustomAreaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur border border-gray-100 rounded-2xl p-4 shadow-2xl">
        <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-semibold mb-1" style={{ color: p.color }}>
            {p.name}: {p.name === 'Deals Closed' ? p.value : `₹${p.value}L`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Reports = () => {
  const [dateRange, setDateRange] = useState('monthly');
  const [activeReport, setActiveReport] = useState('performance');
  const [hoveredStat, setHoveredStat] = useState(null);

  const stats = [
    {
      label: 'Total Revenue', value: '₹24.8 Cr', change: '+18.2%', up: true,
      icon: DollarSign, gradient: 'from-emerald-500 to-teal-600',
      glow: 'hover:shadow-[0_8px_40px_rgba(16,185,129,0.35)]',
      border: 'hover:border-emerald-400/40',
      bg: 'from-emerald-50 to-teal-50', textColor: 'text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-700'
    },
    {
      label: 'Properties Sold', value: '647', change: '+12%', up: true,
      icon: Home, gradient: 'from-blue-500 to-indigo-600',
      glow: 'hover:shadow-[0_8px_40px_rgba(59,130,246,0.35)]',
      border: 'hover:border-blue-400/40',
      bg: 'from-blue-50 to-indigo-50', textColor: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700'
    },
    {
      label: 'Active Agents', value: '64', change: '+8 this month', up: true,
      icon: Users, gradient: 'from-violet-500 to-purple-600',
      glow: 'hover:shadow-[0_8px_40px_rgba(139,92,246,0.35)]',
      border: 'hover:border-violet-400/40',
      bg: 'from-violet-50 to-purple-50', textColor: 'text-violet-600',
      badge: 'bg-violet-100 text-violet-700'
    },
    {
      label: 'Conversion Rate', value: '24.8%', change: '+3.2%', up: true,
      icon: TrendingUp, gradient: 'from-[#E6761D] to-orange-600',
      glow: 'hover:shadow-[0_8px_40px_rgba(230,118,29,0.35)]',
      border: 'hover:border-orange-400/40',
      bg: 'from-amber-50 to-orange-50', textColor: 'text-orange-600',
      badge: 'bg-orange-100 text-orange-700'
    },
  ];

  const reports = [
    { id: 1, name: 'Monthly Sales Performance', description: 'Complete breakdown of all properties sold with agent commission details', date: 'Apr 15, 2025', status: 'ready', type: 'pdf', downloads: 124, size: '2.4 MB', rating: 4.9 },
    { id: 2, name: 'Agent Leaderboard & KPIs', description: 'Ranking based on revenue, leads, and customer satisfaction scores', date: 'Apr 14, 2025', status: 'ready', type: 'pdf', downloads: 89, size: '1.8 MB', rating: 4.7 },
    { id: 3, name: 'Lead Source Analytics', description: 'Traffic sources, conversion funnels, and ROI by marketing channel', date: 'Apr 12, 2025', status: 'ready', type: 'excel', downloads: 56, size: '4.1 MB', rating: 4.5 },
    { id: 4, name: 'Financial Overview Q1 2025', description: 'Revenue, expenses, profit margins, and financial forecasts', date: 'Apr 5, 2025', status: 'ready', type: 'pdf', downloads: 203, size: '3.2 MB', rating: 4.8 },
    { id: 5, name: 'Property Inventory Summary', description: 'Current listings by type, location, and price range analysis', date: 'Apr 1, 2025', status: 'processing', type: 'excel', downloads: 0, size: '—', rating: null },
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 page-enter">

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-20 glass-white border-b border-gray-200/60 px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E6761D] to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <BarChart3 size={18} className="text-white" />
              </div>
              Analytics & Reports
            </h1>
            <p className="text-gray-500 text-sm mt-0.5 ml-12">Comprehensive insights and downloadable performance reports</p>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Date Range Toggle */}
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-1 border border-gray-200">
              {['daily', 'weekly', 'monthly', 'yearly'].map(r => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-250 capitalize
                    ${dateRange === r
                      ? 'bg-white text-[#E6761D] shadow-md border border-gray-200'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'}`}
                >
                  {r}
                </button>
              ))}
            </div>

            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-medium
              hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-250">
              <Calendar size={15} className="text-gray-400" />
              <span>Jan–Mar 2025</span>
              <ChevronDown size={13} className="text-gray-400" />
            </button>

            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E6761D] to-orange-600 text-white text-sm font-semibold
              shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/35 hover:scale-105 transition-all duration-250 ripple">
              <Download size={15} />
              Export All
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8 max-w-[1600px] mx-auto">

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoveredStat(idx)}
              onMouseLeave={() => setHoveredStat(null)}
              className={`group relative bg-white rounded-2xl p-5 border border-gray-100 cursor-pointer overflow-hidden card-lift
                ${stat.glow} ${stat.border} transition-all duration-350`}
            >
              {/* Subtle gradient bg on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-0 group-hover:opacity-60 transition-opacity duration-400 rounded-2xl`} />

              <div className="relative z-10 flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-350`}>
                  <stat.icon size={20} className="text-white" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${stat.badge}`}>
                  <ArrowUpRight size={12} />
                  {stat.change}
                </span>
              </div>
              <p className="text-3xl font-black text-gray-900 stat-value relative z-10 group-hover:scale-105 origin-left transition-transform duration-300">{stat.value}</p>
              <p className={`text-sm font-medium mt-1 relative z-10 ${stat.textColor} group-hover:font-semibold transition-all`}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CHART + BREAKDOWN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">

          {/* MAIN CHART - takes 2 cols */}
          <div className="xl:col-span-2 group bg-white rounded-3xl shadow-sm border border-gray-100 p-6
            hover:shadow-xl hover:shadow-orange-500/8 hover:border-orange-200/60 transition-all duration-400">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <LineChartIcon size={20} className="text-[#E6761D]" />
                  Revenue & Deals Overview
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">Monthly performance vs target for {dateRange === 'monthly' ? '2025' : dateRange}</p>
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-[#E6761D]" /> Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-blue-400" /> Deals</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm border-2 border-dashed border-gray-400" /> Target</span>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E6761D" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#E6761D" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dealsGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}L`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomAreaTooltip />} />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (₹L)" stroke="#E6761D" strokeWidth={2.5} fill="url(#revenueGrad2)"
                    activeDot={{ r: 7, fill: '#E6761D', stroke: 'white', strokeWidth: 2, filter: 'drop-shadow(0 0 6px rgba(230,118,29,0.6))' }} />
                  <Area yAxisId="right" type="monotone" dataKey="deals" name="Deals Closed" stroke="#3B82F6" strokeWidth={2.5} fill="url(#dealsGrad2)"
                    activeDot={{ r: 7, fill: '#3B82F6', stroke: 'white', strokeWidth: 2 }} />
                  <Area yAxisId="left" type="monotone" dataKey="target" name="Target" stroke="#d1d5db" strokeWidth={1.5} fill="none" strokeDasharray="5 5" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PIE CHART */}
          <div className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-6
            hover:shadow-xl hover:shadow-purple-500/8 hover:border-purple-200/40 transition-all duration-400">
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <PieChart size={20} className="text-violet-500" />
              Property Mix
            </h2>
            <p className="text-sm text-gray-500 mb-4">Revenue by category</p>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                    dataKey="value" labelLine={false} label={renderCustomizedLabel} paddingAngle={3}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2}
                        style={{ filter: `drop-shadow(0 4px 8px ${entry.color}40)`, cursor: 'pointer' }} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {categoryData.map((item, i) => (
                <div key={i} className="flex items-center justify-between hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-colors group/cat cursor-default">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}60` }} />
                    <span className="text-sm text-gray-600 group-hover/cat:text-gray-900 transition-colors">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* REPORTS TABLE */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText size={20} className="text-[#E6761D]" /> Available Reports
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Download ready-to-use analytics and financial summaries</p>
            </div>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#E6761D] to-orange-600 text-white text-sm font-semibold
              shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/35 hover:scale-105 transition-all duration-250 ripple">
              <Sparkles size={16} /> Generate Custom Report
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {reports.map((report, idx) => (
              <div key={report.id}
                className="group p-5 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-transparent transition-all duration-300 cursor-pointer"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start gap-4">
                    {/* File Icon */}
                    <div className={`relative h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:rotate-2
                      ${report.type === 'pdf'
                        ? 'bg-gradient-to-br from-red-100 to-rose-100 text-red-600 group-hover:shadow-lg group-hover:shadow-red-500/20'
                        : 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 group-hover:shadow-lg group-hover:shadow-green-500/20'}`}
                    >
                      {report.type === 'pdf' ? <FileText size={24} /> : <BarChart3 size={24} />}
                      <span className="absolute -bottom-1 -right-1 text-[8px] font-black uppercase bg-white border border-gray-200 px-1 rounded shadow-sm">
                        {report.type}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-base group-hover:text-[#E6761D] transition-colors">{report.name}</h3>
                        {report.status === 'processing' ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-semibold border border-amber-200">
                            <Clock size={11} /> Processing
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                            <CheckCircle size={11} /> Ready
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                        <span className="flex items-center gap-1"><Calendar size={11} /> {report.date}</span>
                        <span className="flex items-center gap-1"><Download size={11} /> {report.downloads} downloads</span>
                        <span>Size: {report.size}</span>
                        {report.rating && (
                          <span className="flex items-center gap-1 text-amber-500">
                            <Star size={11} fill="currentColor" /> {report.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 shrink-0">
                    <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E6761D]/10 text-[#E6761D] font-semibold text-sm
                      hover:bg-[#E6761D]/20 hover:shadow-md transition-all duration-200 group/btn">
                      <Eye size={14} className="group-hover/btn:scale-110 transition-transform" /> Preview
                    </button>
                    <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm
                      hover:bg-gray-800 hover:text-white hover:shadow-md transition-all duration-200 group/btn">
                      <Download size={14} className="group-hover/btn:scale-110 transition-transform" />
                      {report.type.toUpperCase()}
                    </button>
                    <button className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200" title="Email report">
                      <Mail size={15} />
                    </button>
                    <button className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200" title="Print">
                      <Printer size={15} />
                    </button>
                  </div>
                </div>

                {/* Processing Bar */}
                {report.status === 'processing' && (
                  <div className="mt-4 ml-18">
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 rounded-full animate-pulse" style={{ background: 'linear-gradient(90deg, #E6761D, #f9a257)' }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                      <RefreshCw size={10} className="animate-spin" /> Generating report... 67% complete
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 text-center">
            <button className="text-sm font-semibold text-[#E6761D] hover:text-orange-700 flex items-center justify-center gap-1 mx-auto
              hover:gap-2 transition-all duration-200">
              View All Reports <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: Activity, title: 'Live Metrics Export', desc: 'Export real-time dashboard metrics as CSV instantly',
              btn: 'Export CSV', color: 'blue',
              gradient: 'from-blue-500 to-indigo-600', bg: 'from-blue-50 to-indigo-50',
              border: 'border-blue-100 hover:border-blue-300', glow: 'hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)]',
              btnStyle: 'bg-blue-600 text-white hover:bg-blue-700', btnIcon: Download
            },
            {
              icon: Zap, title: 'Scheduled Reports', desc: 'Set up automated email reports sent weekly or monthly',
              btn: 'Schedule', color: 'emerald',
              gradient: 'from-emerald-500 to-teal-600', bg: 'from-emerald-50 to-teal-50',
              border: 'border-emerald-100 hover:border-emerald-300', glow: 'hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)]',
              btnStyle: 'bg-emerald-600 text-white hover:bg-emerald-700', btnIcon: Calendar
            },
            {
              icon: AlertCircle, title: 'API Access', desc: 'Fetch live report data via REST API with secure auth',
              btn: 'Get API Key', color: 'amber',
              gradient: 'from-amber-500 to-orange-600', bg: 'from-amber-50 to-orange-50',
              border: 'border-amber-100 hover:border-amber-300', glow: 'hover:shadow-[0_8px_30px_rgba(245,158,11,0.2)]',
              btnStyle: 'bg-amber-600 text-white hover:bg-amber-700', btnIcon: BarChart3
            }
          ].map((card, i) => (
            <div key={i} className={`group bg-gradient-to-br ${card.bg} rounded-2xl p-6 border ${card.border} ${card.glow} transition-all duration-350 card-lift`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-800">{card.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{card.desc}</p>
              <button className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm ${card.btnStyle}
                hover:shadow-lg transition-all duration-250 ripple`}>
                <card.btnIcon size={14} /> {card.btn}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Reports;