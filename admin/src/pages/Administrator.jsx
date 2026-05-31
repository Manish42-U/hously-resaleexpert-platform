import { useEffect, useState } from 'react';
import {
  Shield,
  Users,
  Key,
  Plus,
  Search,
  RefreshCw,
  UserPlus,
  Clock,
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  UserCheck,
  Crown,
  BriefcaseBusiness,
  Headset,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getErrorMessage, unwrap, userService } from '../services/api';

const loginTrendData = [
  { name: 'Mon', logins: 24, sessions: 18 },
  { name: 'Tue', logins: 32, sessions: 26 },
  { name: 'Wed', logins: 28, sessions: 22 },
  { name: 'Thu', logins: 41, sessions: 35 },
  { name: 'Fri', logins: 37, sessions: 30 },
  { name: 'Sat', logins: 19, sessions: 14 },
  { name: 'Sun', logins: 22, sessions: 18 },
];

const Administrator = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const loadAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userService.getAll();
      const users = unwrap(response);
      setAdmins(
        (Array.isArray(users) ? users : []).filter(user =>
          ['admin', 'manager', 'agent'].includes(user.role),
        ),
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const filteredAdmins = admins.filter(admin =>
    (admin.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (admin.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    const label = role === 'admin' ? 'Admin' : role === 'manager' ? 'Manager' : role === 'agent' ? 'Agent' : 'User';
    const colors = { 
      admin: 'bg-purple-50 text-purple-700 border-purple-200', 
      manager: 'bg-blue-50 text-blue-700 border-blue-200', 
      agent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      user: 'bg-emerald-50 text-emerald-700 border-emerald-200' 
    };
    return <span className={`inline-flex items-center rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-wider ${colors[role] || colors.user}`}>{label}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 page-enter pb-12">
      {/* HEADER */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-6 lg:px-8 py-5 backdrop-blur">
        <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
                <Shield size={20} className="text-white" />
              </div>
              Team Access Console
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-13">Register admins, managers and agents from one place</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search administrators..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white w-64 focus:border-gray-900 focus:shadow-[0_0_0_3px_rgba(17,24,39,0.1)] outline-none transition-all text-sm font-medium text-gray-700" />
            </div>
            <button onClick={loadAdmins} className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all shadow-sm">
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-xl bg-[#E6761D] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 hover:bg-orange-600"
            >
              <Plus size={17} /> Add Team Member
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 ml-1">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#E6761D] to-orange-600 flex items-center justify-center text-white font-black shadow-md border-2 border-white ring-2 ring-orange-100">{initials(currentUser.name || 'User')}</div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-gray-900 leading-tight">{currentUser.name || 'Signed-in User'}</p>
                <p className="text-[10px] font-black text-[#E6761D] uppercase tracking-widest">{currentUser.role || 'admin'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8 max-w-[1500px] mx-auto">
        
        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard icon={Users} label="Total Team" value={String(admins.length)} change="Live database" color="blue" />
          <StatCard icon={Shield} label="Admins" value={String(admins.filter(user => user.role === 'admin').length)} change="Full access" color="slate" />
          <StatCard icon={BriefcaseBusiness} label="Managers" value={String(admins.filter(user => user.role === 'manager').length)} change="Operations" color="orange" />
          <StatCard icon={Headset} label="Agents" value={String(admins.filter(user => user.role === 'agent').length)} change="Lead handling" color="emerald" />
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
          
          {/* LEFT COL: ADMINS & CHART */}
          <div className="space-y-8">
            
            {/* ADMINS LIST */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-7 py-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Registered Team</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Single source for admin, manager and agent accounts</p>
                </div>
                <button onClick={() => setShowAddModal(true)} 
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-black shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all ripple">
                  <Plus size={16} /> Add Team Member
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-5">
                {loading ? (
                  <div className="col-span-full p-10 text-center text-sm font-bold text-gray-500">Loading team accounts...</div>
                ) : filteredAdmins.length === 0 ? (
                  <div className="col-span-full p-10 text-center text-sm font-bold text-gray-500">No admins, managers or agents found. Add the first account.</div>
                ) : filteredAdmins.map((admin) => (
                  <div key={admin.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10 group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="h-13 w-13 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-700 text-lg border border-slate-200 group-hover:scale-105 transition-transform">{initials(admin.name)}</div>
                          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-[3px] border-white shadow-sm" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <p className="font-black text-gray-900 text-base truncate">{admin.name}</p>
                            {getRoleBadge(admin.role)}
                          </div>
                          <div className="space-y-1.5 text-xs text-gray-500 font-medium">
                            <span className="flex items-center gap-1.5 truncate"><Mail size={13} className="text-gray-400 shrink-0" /> {admin.email}</span>
                            <span className="flex items-center gap-1.5"><Clock size={13} className="text-gray-400" /> Created {formatDate(admin.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                        Active
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CHART */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-7">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2"><UserCheck size={18} className="text-blue-500" /> Access Overview</h3>
                  <p className="text-sm text-gray-500 mt-1">Team account activity snapshot</p>
                </div>
                <select className="bg-gray-50 border border-gray-200 text-sm font-bold text-gray-700 rounded-xl px-3 py-1.5 outline-none cursor-pointer hover:border-gray-300">
                  <option>Last 7 Days</option>
                  <option>This Month</option>
                </select>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={loginTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="logGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#111827" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 6" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 700 }} />
                    <Area type="monotone" dataKey="logins" stroke="#111827" strokeWidth={3} fill="url(#logGrad)" name="Total Logins" activeDot={{ r: 6, fill: '#111827', stroke: 'white', strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="sessions" stroke="#E6761D" strokeWidth={2} fill="none" strokeDasharray="5 5" name="Active Sessions" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* RIGHT COL */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black">Create Account</h3>
                  <p className="text-sm text-slate-400">One form for every dashboard role</p>
                </div>
                <UserPlus className="text-orange-400" size={22} />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full rounded-2xl bg-white py-3 text-sm font-black text-slate-900 transition-all hover:-translate-y-0.5 hover:bg-orange-50"
              >
                Add Admin / Manager / Agent
              </button>
            </div>

            {/* Recent Logins */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black text-gray-900">Recent Accounts</h3>
                <Crown size={18} className="text-gray-400" />
              </div>
              <div className="space-y-4">
                {[
                  ...admins.slice(0, 3).map(user => ({ user: user.name, loc: 'Authorized console', dev: 'Web session', time: formatDate(user.created_at), ip: 'Protected', status: 'success' })),
                  ...(admins.length ? [] : [{ user: 'No admin yet', loc: 'Setup pending', dev: 'Admin console', time: 'Now', ip: '-', status: 'failed' }]),
                ].map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-default">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <p className="text-sm font-bold text-gray-900 truncate">{log.user}</p>
                        <span className="text-[10px] font-bold text-gray-400">{log.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{log.dev} • {log.loc}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">IP: {log.ip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && <AddAdminModal onClose={() => setShowAddModal(false)} onCreated={loadAdmins} />}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, change, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    orange: 'bg-orange-50 text-[#E6761D] border-orange-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };
  const c = colorMap[color];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm card-lift cursor-default group relative overflow-hidden">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${c}`}>
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200">
          {change}
        </span>
      </div>
      <p className="text-3xl font-black text-gray-900 stat-value relative z-10">{value}</p>
      <p className="text-sm font-bold text-gray-500 mt-1 relative z-10">{label}</p>
    </div>
  );
};

const AddAdminModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'manager' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await userService.create(form);
      await onCreated?.();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <form className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-2xl bg-[#E6761D] flex items-center justify-center text-white mb-5 shadow-lg shadow-orange-500/20"><UserPlus size={20} /></div>
        <h3 className="text-2xl font-black text-gray-900">Add Admin / Manager / Agent</h3>
        <p className="text-sm font-medium text-gray-500 mt-1 mb-6">Create a real dashboard account. Nothing is hardcoded here.</p>

        {error && <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} type="text" placeholder="e.g. Rahul Sharma" className="w-full bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:bg-white focus:border-gray-900 focus:shadow-[0_0_0_3px_rgba(17,24,39,0.1)] outline-none transition-all font-medium text-gray-900" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
            <input required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="team@resaleexpert.in" className="w-full bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:bg-white focus:border-gray-900 focus:shadow-[0_0_0_3px_rgba(17,24,39,0.1)] outline-none transition-all font-medium text-gray-900" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Temporary Password</label>
            <input required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" minLength={6} placeholder="Min. 6 characters" className="w-full bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:bg-white focus:border-gray-900 focus:shadow-[0_0_0_3px_rgba(17,24,39,0.1)] outline-none transition-all font-medium text-gray-900" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Role Level</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:bg-white focus:border-gray-900 focus:shadow-[0_0_0_3px_rgba(17,24,39,0.1)] outline-none transition-all font-medium text-gray-900 cursor-pointer">
              <option value="manager">Manager</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
          <button disabled={saving} className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black shadow-lg shadow-gray-900/20 transition-all disabled:opacity-60">{saving ? 'Creating...' : 'Create Account'}</button>
        </div>
      </form>
    </div>
  );
};

const initials = (name = '') => (
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'U'
);

const formatDate = (value) => {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default Administrator;
