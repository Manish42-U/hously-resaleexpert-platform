import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UserCog, Users, FileText,
  Database, Lightbulb, MessageCircle, Phone, Wrench,
  BarChart3, Settings, LogOut, Activity, Sun, Moon, Cloud, Sparkles,
  ChevronLeft, ChevronRight, Target, Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';

const Sidebar = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [time, setTime] = useState(new Date());

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.name || 'Admin User';
  const userRole = user.role || 'Administrator';

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: Sun, color: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/30' };
    if (hour < 18) return { text: 'Good Afternoon', icon: Cloud, color: 'from-sky-500 to-blue-600', glow: 'shadow-blue-500/30' };
    return { text: 'Good Evening', icon: Moon, color: 'from-indigo-500 to-purple-600', glow: 'shadow-purple-500/30' };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  const menuGroups = [
    {
      label: 'Dashboards',
      items: [
        { label: 'Overview', icon: LayoutDashboard, path: '/' },
        { label: 'Manager Dashboard', icon: UserCog, path: '/manager-dashboard' },
        { label: 'Agent Dashboard', icon: Users, path: '/agent-dashboard' },
      ]
    },
    {
      label: 'Management',
      items: [
        { label: 'Leads', icon: Target, path: '/leads', badge: 'Hot' },
        { label: 'CMS', icon: FileText, path: '/cms' },
        { label: 'CRM', icon: Database, path: '/crm' },
        { label: 'WhatsApp CRM', icon: Phone, path: '/whatsapp-crm' },
        { label: 'Communication', icon: MessageCircle, path: '/communication' },
      ]
    },
    {
      label: 'Tools & Reports',
      items: [
        { label: 'Notifications', icon: Bell, path: '/notifications' },
        { label: 'Financial Tools', icon: Wrench, path: '/tools' },
        { label: 'Reports', icon: BarChart3, path: '/reports' },
        { label: 'Administrator', icon: Lightbulb, path: '/administrator' },
        { label: 'Settings', icon: Settings, path: '/settings' },
      ]
    }
  ];

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const flatMenuItems = menuGroups.flatMap((group) => group.items);

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-white/10 bg-[#0f172a] shadow-xl shadow-slate-950/15 lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#E6761D]">{greeting.text}</p>
            <p className="truncate text-sm font-black capitalize text-white">{userName}</p>
          </div>
          <button
            onClick={logout}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white/8 text-slate-300 transition hover:bg-red-500/15 hover:text-red-300"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-3 scrollbar-custom">
          {flatMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex min-w-max items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black transition
                ${isActive
                  ? 'bg-[#E6761D] text-white shadow-lg shadow-[#E6761D]/25'
                  : 'bg-white/6 text-slate-300 hover:bg-white/12 hover:text-white'
                }
              `}
            >
              <item.icon size={15} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <aside
        className={`fixed left-0 top-0 z-50 hidden h-screen transition-all duration-500 ease-out lg:flex flex-col
          ${collapsed ? 'w-[72px]' : 'w-72'}
          bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#0f172a]
          border-r border-white/8 shadow-2xl shadow-black/50`}
      >
        {/* TOGGLE BUTTON */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-7 z-50 w-7 h-7 flex items-center justify-center rounded-full
            bg-gradient-to-r from-[#E6761D] to-orange-500 text-white shadow-lg shadow-orange-500/40
            hover:scale-110 hover:shadow-xl hover:shadow-orange-500/50 transition-all duration-300 border-2 border-[#0f172a]"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* HEADER */}
        <div className={`p-5 border-b border-white/8 bg-white/3 flex-shrink-0 ${collapsed ? 'px-3' : 'px-5'}`}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${greeting.color} flex items-center justify-center shadow-lg ${greeting.glow} hover:scale-105 transition-transform cursor-pointer`}>
                  <GreetingIcon size={22} className="text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0f172a] animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3.5">
              <div className="relative flex-shrink-0">
                <div className={`w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-gradient-to-br ${greeting.color} flex items-center justify-center shadow-xl ${greeting.glow} hover:scale-105 transition-transform cursor-pointer`}>
                  <GreetingIcon size={26} className="text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0f172a] animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#E6761D] truncate">{greeting.text}</p>
                <p className="text-base font-black text-white capitalize truncate">{userName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Sparkles size={11} className="text-amber-400" />
                  <p className="text-[11px] font-medium text-slate-400 truncate">{userRole}</p>
                </div>
              </div>
            </div>
          )}
          {!collapsed && (
            <div className="mt-4 px-3 py-2 bg-white/5 rounded-xl border border-white/8 text-center">
              <p className="text-[11px] font-mono text-slate-400 tracking-wider">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          )}
        </div>

        {/* SCROLLABLE MENU */}
        <div className={`flex-1 overflow-y-auto py-4 scrollbar-custom ${collapsed ? 'px-2' : 'px-3'}`}>
          {menuGroups.map((group, gi) => (
            <div key={gi} className="mb-5">
              {!collapsed && (
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 px-3 mb-2">{group.label}</p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                      group relative flex items-center gap-3 rounded-2xl py-2.5 text-sm font-semibold transition-all duration-300
                      ${collapsed ? 'justify-center px-2' : 'px-3'}
                      ${isActive
                        ? 'bg-gradient-to-r from-[#E6761D] to-orange-500 text-white shadow-lg shadow-[#E6761D]/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/8 hover:translate-x-0.5'
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          size={20}
                          className={`flex-shrink-0 transition-all duration-300 ${isActive
                            ? 'text-white'
                            : 'text-slate-500 group-hover:text-[#E6761D] group-hover:scale-110'}`}
                        />

                        {!collapsed && (
                          <span className="flex-1 truncate transition-transform duration-300 group-hover:translate-x-0.5">
                            {item.label}
                          </span>
                        )}

                        {!collapsed && item.badge && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#E6761D] text-white shadow-sm">
                            {item.badge}
                          </span>
                        )}

                        {isActive && !collapsed && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-white/70 shadow-sm" />
                        )}

                        {/* Tooltip in collapsed mode */}
                        {collapsed && (
                          <div className="absolute left-full ml-3 z-50 pointer-events-none hidden group-hover:flex items-center
                            rounded-xl bg-slate-800 px-3 py-2 shadow-2xl border border-white/10 whitespace-nowrap">
                            <span className="text-sm font-semibold text-white">{item.label}</span>
                            {item.badge && (
                              <span className="ml-2 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#E6761D] text-white">{item.badge}</span>
                            )}
                            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className={`flex-shrink-0 border-t border-white/8 p-4 bg-white/3 ${collapsed ? 'px-2' : 'px-4'}`}>
          {/* System Status */}
          <div className={`group relative overflow-hidden rounded-2xl bg-white/6 border border-white/10 p-3.5 mb-3
            hover:bg-white/10 hover:border-[#E6761D]/30 transition-all duration-300 cursor-default
            ${collapsed ? 'text-center' : ''}`}>
            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="relative flex-shrink-0">
                <Activity size={17} className="text-emerald-400" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              {!collapsed && (
                <div>
                  <p className="text-sm font-bold text-slate-200">System Online</p>
                  <p className="text-[10px] text-slate-500">99.98% uptime · 24/7</p>
                </div>
              )}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className={`group w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-400
              hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/20 transition-all duration-300
              ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} className="transition-all duration-300 group-hover:scale-110 group-hover:-translate-x-0.5 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
            {collapsed && (
              <div className="absolute left-full ml-3 z-50 pointer-events-none hidden group-hover:flex items-center rounded-xl bg-slate-800 px-3 py-2 shadow-2xl border border-white/10 whitespace-nowrap">
                <span className="text-sm font-semibold text-red-400">Sign Out</span>
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
              </div>
            )}
          </button>

          {!collapsed && (
            <p className="text-center text-[9px] text-slate-600 mt-3 tracking-wider uppercase">
              v3.0 Enterprise · Secure
            </p>
          )}
        </div>
      </aside>

      {/* CONTENT SPACER */}
      <div className={`hidden transition-all duration-500 ease-out lg:block ${collapsed ? 'ml-[72px]' : 'ml-72'}`} />
    </>
  );
};

export default Sidebar;
