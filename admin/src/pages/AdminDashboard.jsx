import { useState, useMemo, useEffect } from 'react';
import {
  Home, DollarSign, Users, Building2, TrendingUp, Activity,
  Download, Filter, Bell, Search, ThumbsUp, Plus,
  Star, ArrowUpRight, ArrowDownRight, MessageSquare, Zap,
  Shield, Server, Globe, RefreshCw, Command, Cpu, HardDrive, Wifi,
  MoreVertical, Eye, ChevronUp, ChevronDown, Sparkles
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 42, compute: 38 },
  { month: 'Feb', revenue: 48, compute: 42 },
  { month: 'Mar', revenue: 55, compute: 50 },
  { month: 'Apr', revenue: 62, compute: 58 },
  { month: 'May', revenue: 71, compute: 65 },
  { month: 'Jun', revenue: 68, compute: 72 },
  { month: 'Jul', revenue: 85, compute: 78 },
  { month: 'Aug', revenue: 92, compute: 85 },
  { month: 'Sep', revenue: 101, compute: 92 },
  { month: 'Oct', revenue: 112, compute: 100 },
  { month: 'Nov', revenue: 125, compute: 115 },
  { month: 'Dec', revenue: 148, compute: 135 },
];

const trafficData = [
  { name: '00:00', users: 1200 }, { name: '04:00', users: 800 },
  { name: '08:00', users: 3200 }, { name: '12:00', users: 4500 },
  { name: '16:00', users: 5100 }, { name: '20:00', users: 3800 },
];

const recentDeals = [
  { id: 1, property: 'Luxury Villa, Juhu', amount: '₹4.5 Cr', agent: 'Amit Patel', status: 'completed', time: '14:23:05', avatar: 'AP' },
  { id: 2, property: 'Commercial Space, BKC', amount: '₹2.8 Cr', agent: 'Priya Sharma', status: 'pending', time: '12:45:11', avatar: 'PS' },
  { id: 3, property: '3 BHK, Andheri', amount: '₹1.2 Cr', agent: 'Rohan Gupta', status: 'completed', time: '09:12:44', avatar: 'RG' },
  { id: 4, property: 'Penthouse, Worli', amount: '₹6.7 Cr', agent: 'Neha Singh', status: 'processing', time: '08:55:01', avatar: 'NS' },
  { id: 5, property: 'Studio Apt, Bandra', amount: '₹85 L', agent: 'Amit Patel', status: 'completed', time: '08:30:22', avatar: 'AP' },
  { id: 6, property: 'Retail Shop, Dadar', amount: '₹1.5 Cr', agent: 'Rohan Gupta', status: 'pending', time: '07:15:10', avatar: 'RG' },
];

const servers = [
  { region: 'ap-south-1 (Mumbai)', status: 'Optimal', load: 42, latency: '12ms', uptime: '99.99%' },
  { region: 'ap-southeast-1 (Singapore)', status: 'Warning', load: 85, latency: '45ms', uptime: '97.5%' },
  { region: 'eu-central-1 (Frankfurt)', status: 'Optimal', load: 28, latency: '115ms', uptime: '99.8%' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15,23,42,0.95)',
        border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: 12,
        padding: '10px 16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
      }}>
        <p style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6, fontWeight: 600 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 700, margin: '2px 0' }}>
            {p.name}: ₹{p.value}L
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pulse, setPulse] = useState(false);
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredDeals = useMemo(() => {
    if (!searchQuery) return recentDeals;
    const lowerQuery = searchQuery.toLowerCase();
    return recentDeals.filter(deal =>
      deal.property.toLowerCase().includes(lowerQuery) ||
      deal.agent.toLowerCase().includes(lowerQuery) ||
      deal.amount.toLowerCase().includes(lowerQuery) ||
      deal.status.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery]);

  const stats = [
    {
      label: 'System Revenue', value: '₹24.8 Cr', change: '+18.2%', up: true,
      icon: DollarSign, color: '#3b82f6', bg: 'from-blue-500/10 to-indigo-500/10',
      border: 'hover:border-blue-500/60', glow: 'hover:shadow-[0_8px_40px_rgba(59,130,246,0.35)]',
      iconBg: 'bg-blue-500/20 text-blue-400', iconHover: 'group-hover:bg-blue-500 group-hover:text-white',
      sub: 'vs last period'
    },
    {
      label: 'Active Nodes', value: '1,847', change: '+156', up: true,
      icon: Server, color: '#8b5cf6', bg: 'from-purple-500/10 to-violet-500/10',
      border: 'hover:border-purple-500/60', glow: 'hover:shadow-[0_8px_40px_rgba(139,92,246,0.35)]',
      iconBg: 'bg-purple-500/20 text-purple-400', iconHover: 'group-hover:bg-purple-500 group-hover:text-white',
      sub: 'servers online'
    },
    {
      label: 'Bandwidth', value: '24.5 TB', change: '+12.5%', up: true,
      icon: Wifi, color: '#10b981', bg: 'from-emerald-500/10 to-teal-500/10',
      border: 'hover:border-emerald-500/60', glow: 'hover:shadow-[0_8px_40px_rgba(16,185,129,0.35)]',
      iconBg: 'bg-emerald-500/20 text-emerald-400', iconHover: 'group-hover:bg-emerald-500 group-hover:text-white',
      sub: 'data transferred'
    },
    {
      label: 'Compute Load', value: '64%', change: '-8%', up: false,
      icon: Cpu, color: '#f59e0b', bg: 'from-amber-500/10 to-orange-500/10',
      border: 'hover:border-amber-500/60', glow: 'hover:shadow-[0_8px_40px_rgba(245,158,11,0.35)]',
      iconBg: 'bg-amber-500/20 text-amber-400', iconHover: 'group-hover:bg-amber-500 group-hover:text-white',
      sub: 'avg across nodes'
    },
  ];

  const statusColors = {
    completed: { dot: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    pending: { dot: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    processing: { dot: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  };

  const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500'];

  return (
    <div className="min-h-screen bg-[#060b18] font-['Inter'] text-slate-300 relative pb-16 overflow-hidden">

      {/* ANIMATED MESH BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 20% 0%, rgba(59,130,246,0.08) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 80% 10%, rgba(139,92,246,0.06) 0%, transparent 50%),
          radial-gradient(ellipse 50% 50% at 50% 100%, rgba(230,118,29,0.05) 0%, transparent 60%),
          linear-gradient(rgba(30,41,59,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(30,41,59,0.3) 1px, transparent 1px)
        `,
        backgroundSize: 'cover, cover, cover, 48px 48px, 48px 48px',
      }} />

      <div className="relative z-10 p-6 lg:p-8 max-w-[1900px] mx-auto space-y-6 page-enter">

        {/* ── HEADER ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 border border-slate-700/50 p-5 rounded-2xl backdrop-blur-xl
          hover:border-blue-500/40 hover:bg-slate-900/80 hover:shadow-[0_0_60px_rgba(59,130,246,0.12)] transition-all duration-500">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-all">
                <Command className="text-white" size={26} />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#060b18] animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Admin<span className="text-blue-400">_</span>Terminal
                <span className="ml-3 text-xs font-mono text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">v3.0</span>
              </h1>
              <div className="flex items-center gap-3 text-slate-500 text-xs mt-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                  System Secure
                </span>
                <span className="text-slate-700">|</span>
                <span className="text-slate-500">ROOT Access Granted</span>
                <span className="text-slate-700">|</span>
                <span className="text-slate-500 font-mono">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group/search w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-blue-400 transition-colors" size={16} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search transactions, agents..."
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl text-blue-300 placeholder-slate-600 pl-10 pr-4 py-2.5 outline-none text-sm
                  focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.25)] focus:bg-slate-950 transition-all duration-300"
              />
              {searchQuery && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-blue-400 font-bold animate-pulse">FILTERING</span>
              )}
            </div>

            <button
              onClick={() => setNotifications(0)}
              className="relative p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-400
                hover:text-white hover:bg-blue-600/20 hover:border-blue-500/60 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]
                transition-all duration-300"
            >
              <Bell size={18} />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.6)]">
                  {notifications}
                </span>
              )}
            </button>

            <button className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-400
              hover:text-emerald-400 hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300">
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* ── STATS STRIP ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className={`group relative bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 cursor-pointer overflow-hidden backdrop-blur-xl
                hover:-translate-y-1.5 transition-all duration-400 ${s.border} ${s.glow}`}
            >
              {/* Animated background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${s.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />

              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }} />

              <div className="relative z-10 flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold group-hover:text-slate-300 transition-colors duration-300">{s.label}</p>
                  <p className="text-3xl font-bold text-white mt-1.5 stat-value group-hover:scale-105 origin-left transition-transform duration-300"
                    style={{ textShadow: `0 0 20px ${s.color}60` }}>{s.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${s.iconBg} ${s.iconHover} transition-all duration-400 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg`}>
                  <s.icon size={20} />
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-2">
                <span className={`flex items-center gap-1 text-xs font-bold ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {s.up ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {s.change}
                </span>
                <span className="text-slate-600 text-xs group-hover:text-slate-400 transition-colors">{s.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* LEFT 3 COLS */}
          <div className="xl:col-span-3 space-y-6">

            {/* BIG REVENUE CHART */}
            <div className="group bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl
              hover:border-blue-500/40 hover:shadow-[0_8px_50px_rgba(59,130,246,0.15)] transition-all duration-500">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2.5">
                    <Activity size={18} className="text-blue-400 group-hover:animate-pulse" />
                    Revenue & Compute Telemetry
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Real-time financial performance overview</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-[11px] uppercase border border-blue-500/40 text-blue-400 bg-blue-500/10 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.2)] font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />Live
                  </span>
                  <span className="px-3 py-1 text-[11px] uppercase border border-slate-700 text-slate-500 rounded-full hover:border-slate-500 hover:text-slate-300 cursor-pointer transition-all">History</span>
                  <div className="flex items-center gap-4 ml-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-400 rounded" />Revenue</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-purple-400 rounded" />Compute</span>
                  </div>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCompAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}L`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevAdmin)"
                      activeDot={{ r: 7, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2, filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.8))' }} />
                    <Area type="monotone" dataKey="compute" name="Compute" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCompAdmin)"
                      activeDot={{ r: 7, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2, filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.8))' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* BOTTOM TWO PANELS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* SERVER STATUS */}
              <div className="group bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl
                hover:border-purple-500/40 hover:shadow-[0_8px_40px_rgba(139,92,246,0.18)] transition-all duration-500">
                <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2.5 group-hover:text-purple-300 transition-colors">
                  <HardDrive size={16} className="text-purple-400" /> Infrastructure Nodes
                  <span className="ml-auto text-[10px] px-2 py-0.5 bg-purple-500/15 text-purple-400 border border-purple-500/25 rounded-full">Live</span>
                </h3>
                <div className="space-y-3">
                  {servers.map((server, idx) => (
                    <div key={idx}
                      className="p-4 rounded-xl border border-slate-700/50 bg-slate-950/40 cursor-pointer
                        hover:bg-purple-900/20 hover:border-purple-500/50 hover:-translate-y-0.5
                        hover:shadow-[0_6px_20px_rgba(139,92,246,0.2)] transition-all duration-300 group/srv"
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <p className="text-xs text-slate-300 font-bold group-hover/srv:text-purple-200 transition-colors">{server.region}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border
                          ${server.status === 'Optimal'
                            ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25'
                            : 'text-amber-400 bg-amber-400/10 border-amber-400/25'}`}>
                          {server.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-2">
                        <span>Load: <span className="text-slate-300 font-semibold">{server.load}%</span></span>
                        <span>Latency: <span className="text-slate-300 font-semibold">{server.latency}</span></span>
                        <span>Uptime: <span className="text-emerald-400 font-semibold">{server.uptime}</span></span>
                      </div>
                      {/* Load bar */}
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${server.load > 70 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                          style={{ width: `${server.load}%`, boxShadow: server.load > 70 ? '0 0 8px rgba(245,158,11,0.5)' : '0 0 8px rgba(16,185,129,0.5)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TRAFFIC CHART */}
              <div className="group bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl
                hover:border-emerald-500/40 hover:shadow-[0_8px_40px_rgba(16,185,129,0.18)] transition-all duration-500">
                <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2.5 group-hover:text-emerald-300 transition-colors">
                  <Users size={16} className="text-emerald-400" /> Active Users (24h)
                  <span className="ml-auto text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-full">
                    <span className="inline-block w-1 h-1 bg-emerald-400 rounded-full animate-ping mr-1" />
                    Live
                  </span>
                </h3>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trafficData} barSize={22}>
                      <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: 'rgba(16,185,129,0.08)' }}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#10b981', fontSize: '12px', borderRadius: 10, boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}
                      />
                      <Bar dataKey="users" radius={[6, 6, 0, 0]}>
                        {trafficData.map((_, i) => (
                          <Cell key={i} fill={i === 4 ? '#10b981' : '#134e4a'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Peak: <span className="text-emerald-400 font-bold">5,100</span> at 16:00</span>
                  <span>Avg: <span className="text-slate-300 font-bold">3,100</span>/hr</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: TRANSACTION LOG */}
          <div className="xl:col-span-1 bg-slate-900/60 border border-slate-700/50 rounded-2xl flex flex-col h-[calc(100vh-10rem)] min-h-[600px] backdrop-blur-xl
            hover:border-blue-500/30 hover:shadow-[0_8px_40px_rgba(59,130,246,0.1)] transition-all duration-500 overflow-hidden">

            {/* Panel Header */}
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-950/40">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={12} className="text-blue-400" /> Transaction_Log
                </h3>
                <p className="text-[10px] text-slate-600 mt-0.5">Real-time feed</p>
              </div>
              <div className="flex items-center gap-2">
                {searchQuery && <span className="text-[10px] text-blue-400 font-bold animate-pulse">FILTERING</span>}
                <button className="p-1.5 rounded-lg border border-slate-700 text-slate-500 hover:text-blue-400 hover:border-blue-500/50 transition-all">
                  <Filter size={12} />
                </button>
              </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-custom">
              {filteredDeals.length > 0 ? (
                filteredDeals.map((deal, idx) => (
                  <div key={deal.id}
                    className="p-3.5 rounded-xl border border-slate-700/40 bg-slate-950/30 cursor-pointer group/deal
                      hover:bg-blue-900/20 hover:border-blue-500/40 hover:-translate-y-0.5
                      hover:shadow-[0_6px_20px_rgba(59,130,246,0.18)] transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-[9px] font-bold text-white`}>
                          {deal.avatar}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono group-hover/deal:text-blue-400 transition-colors">[{deal.time}]</span>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border ${statusColors[deal.status].bg} ${statusColors[deal.status].text}`}>
                        {deal.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-semibold group-hover/deal:text-white transition-colors leading-tight">{deal.property}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-slate-500 group-hover/deal:text-slate-400 transition-colors">by {deal.agent}</span>
                      <span className="text-xs text-blue-400 font-black group-hover/deal:text-blue-300 transition-colors" style={{ textShadow: '0 0 10px rgba(59,130,246,0.5)' }}>
                        {deal.amount}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Search size={24} className="text-slate-700 mb-2" />
                  <p className="text-slate-600 text-xs uppercase tracking-wider">No results for "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-700/50 bg-slate-950/40 flex justify-between items-center text-[10px] text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_6px_#10b981] animate-pulse" />
                SYSTEM.LOGGING.ACTIVE
              </span>
              <span className="text-slate-700">{filteredDeals.length} records</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;