import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell, Search, ChevronDown, Settings, LogOut, Users, X, Check,
  Clock, Flame, MessageSquare, AlertTriangle, Info, Building2
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { adminService, unwrap } from '../services/api'

const PAGE_TITLES = {
  '/': 'Overview Dashboard',
  '/manager-dashboard': 'Manager Dashboard',
  '/agent-dashboard': 'Agent Dashboard',
  '/leads': 'Queries & Leads',
  '/cms': 'Content Management',
  '/crm': 'Customer Relations',
  '/whatsapp-crm': 'WhatsApp CRM',
  '/communication': 'Communication Hub',
  '/tools': 'Financial Tools',
  '/reports': 'Reports Center',
  '/administrator': 'Administration',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
}

const iconFor = {
  lead: Flame,
  message: MessageSquare,
  property: AlertTriangle,
  info: Info,
}

const colorsFor = {
  lead: 'text-red-500 bg-red-50',
  message: 'text-blue-600 bg-blue-50',
  property: 'text-amber-600 bg-amber-50',
  info: 'text-purple-600 bg-purple-50',
}

const quickActions = [
  { label: 'Properties', icon: Building2, to: '/cms', color: 'from-[#E6761D] to-orange-500' },
  { label: 'Leads', icon: Users, to: '/leads', color: 'from-blue-500 to-indigo-600' },
  { label: 'Settings', icon: Settings, to: '/settings', color: 'from-slate-600 to-slate-700' },
]

const AdminHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showNotif, setShowNotif] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [workspace, setWorkspace] = useState(null)
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adminNotificationRead') || '[]')
    } catch {
      return []
    }
  })
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adminNotificationDismissed') || '[]')
    } catch {
      return []
    }
  })
  const [searchQuery, setSearchQuery] = useState('')
  const notifRef = useRef(null)
  const profileRef = useRef(null)
  const searchRef = useRef(null)

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])
  const userName = user.name || 'Super Admin'
  const userRole = user.role || 'Administrator'
  const userInitials = userName.split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase()

  useEffect(() => {
    const handler = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotif(false)
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfile(false)
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearch(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    let active = true
    adminService.getWorkspace()
      .then((response) => { if (active) setWorkspace(unwrap(response)) })
      .catch(() => { if (active) setWorkspace(null) })
    return () => { active = false }
  }, [location.pathname])

  useEffect(() => {
    localStorage.setItem('adminNotificationRead', JSON.stringify(readIds))
  }, [readIds])

  useEffect(() => {
    localStorage.setItem('adminNotificationDismissed', JSON.stringify(dismissedIds))
  }, [dismissedIds])

  const notifications = useMemo(
    () => (workspace?.notifications || [])
      .filter((item) => !dismissedIds.includes(item.id))
      .map((item) => ({ ...item, unread: item.unread && !readIds.includes(item.id) })),
    [dismissedIds, readIds, workspace?.notifications]
  )

  const unreadCount = notifications.filter((item) => item.unread).length

  const searchItems = useMemo(() => {
    const pages = Object.entries(PAGE_TITLES).map(([to, label]) => ({ label, type: 'Page', to, icon: Settings }))
    const properties = (workspace?.properties || []).slice(0, 8).map((property) => ({
      label: property.title || property.property_code || 'Property',
      type: 'Property',
      to: '/cms',
      icon: Building2,
    }))
    const leads = (workspace?.leads || []).slice(0, 8).map((lead) => ({
      label: lead.name,
      type: 'Lead',
      to: '/leads',
      icon: Users,
    }))
    return [...properties, ...leads, ...pages]
  }, [workspace])

  const filteredSearch = searchQuery.trim()
    ? searchItems.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchItems.slice(0, 8)

  const markAllRead = () => setReadIds(notifications.map((item) => item.id))
  const dismiss = (id) => {
    setReadIds((current) => Array.from(new Set([...current, id])))
    setDismissedIds((current) => Array.from(new Set([...current, id])))
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <div className="flex h-16 items-center justify-between gap-3 px-3 sm:h-20 sm:px-5 lg:px-8 lg:gap-5">
        <div className="flex items-center gap-4">
          <NavLink to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src="https://resaleexpert.in/uploads/system/company_logo-1759471014698-84089067-Resale-Expert-Logo.png"
              alt="ResaleExpert"
              className="h-11 w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg"
            />
          </NavLink>
          <div className="hidden md:flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 transition-all hover:border-orange-200 hover:bg-orange-50">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-300" />
            <span className="text-sm font-black text-slate-700 truncate max-w-[240px]">{PAGE_TITLES[location.pathname] || 'Dashboard'}</span>
          </div>
        </div>

        <div className="flex-1 max-w-lg hidden md:block" ref={searchRef}>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm font-bold text-gray-700 outline-none transition-all placeholder:text-gray-400 hover:border-orange-200 hover:bg-white focus:border-[#E6761D] focus:bg-white focus:shadow-[0_0_0_4px_rgba(230,118,29,0.12)]"
              placeholder="Search real properties, leads, pages..."
              value={searchQuery}
              onChange={(event) => { setSearchQuery(event.target.value); setShowSearch(true) }}
              onFocus={() => setShowSearch(true)}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowSearch(false) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                <X size={14} />
              </button>
            )}

            {showSearch && (
              <div className="absolute top-full mt-3 left-0 right-0 bg-white rounded-3xl border border-gray-200/70 shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">{searchQuery ? 'Live Results' : 'Quick Access'}</span>
                </div>
                <div className="py-1 max-h-72 overflow-y-auto">
                  {filteredSearch.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-400 font-semibold">No backend record found</div>
                  ) : filteredSearch.map((item, index) => (
                    <NavLink
                      key={`${item.type}-${item.label}-${index}`}
                      to={item.to}
                      onClick={() => { setShowSearch(false); setSearchQuery('') }}
                      className="flex items-center gap-3 px-4 py-3 transition-all group hover:bg-orange-50"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-[#E6761D] flex items-center justify-center transition-all group-hover:scale-105 flex-shrink-0">
                        <item.icon size={14} className="text-gray-500 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{item.label}</p>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{item.type}</p>
                      </div>
                    </NavLink>
                  ))}
                </div>
                <div className="border-t border-gray-100 px-4 py-3">
                  <div className="flex gap-2 flex-wrap">
                    {quickActions.map((action) => (
                      <NavLink key={action.label} to={action.to} onClick={() => setShowSearch(false)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r ${action.color} text-white text-xs font-bold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg`}>
                        <action.icon size={11} /> {action.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotif(!showNotif); setShowProfile(false) }}
              className={`relative rounded-2xl p-2.5 transition-all duration-300 sm:p-3 ${showNotif ? 'bg-[#E6761D] text-white shadow-lg shadow-orange-200' : 'text-gray-500 hover:-translate-y-0.5 hover:bg-orange-50 hover:text-[#E6761D] hover:shadow-lg hover:shadow-orange-100'}`}
            >
              <Bell size={19} />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">{unreadCount}</span>}
            </button>

            {showNotif && (
              <div className="absolute right-0 top-full z-50 mt-3 w-[calc(100vw-1.5rem)] max-w-96 overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-2xl">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                  <div>
                    <h3 className="font-black text-gray-900">Live Notifications</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{unreadCount} unread from backend data</p>
                  </div>
                  <button onClick={markAllRead} className="text-xs font-bold text-[#E6761D] hover:text-orange-600 flex items-center gap-1">
                    <Check size={12} /> Mark read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm font-semibold text-gray-400">No live notifications yet</div>
                  ) : notifications.map((notif) => {
                    const NotifIcon = iconFor[notif.type] || Info
                    const color = colorsFor[notif.type] || colorsFor.info
                    const [textColor, bgColor] = color.split(' ')
                    return (
                      <div key={notif.id} className={`flex items-start gap-3.5 px-5 py-4 transition-all group hover:bg-orange-50/70 ${notif.unread ? 'bg-orange-50/40' : ''}`}>
                        <div className={`w-9 h-9 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <NotifIcon size={16} className={textColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-black text-gray-900 leading-tight">{notif.title}</p>
                            <button onClick={() => dismiss(notif.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-gray-600 transition-all flex-shrink-0">
                              <X size={13} />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{notif.desc}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock size={10} className="text-gray-300" />
                            <span className="text-[10px] text-gray-400 font-semibold">{notif.time}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                  <NavLink to="/notifications" onClick={() => setShowNotif(false)} className="w-full text-center text-sm font-bold text-[#E6761D] hover:text-orange-600 transition-colors flex items-center justify-center gap-2">
                    View all notifications
                  </NavLink>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button onClick={() => { setShowProfile(!showProfile); setShowNotif(false) }} className="flex items-center gap-2 rounded-2xl p-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-50 hover:shadow-lg hover:shadow-orange-100 sm:p-2 sm:pl-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E6761D] to-orange-500 text-sm font-black text-white shadow-lg shadow-orange-200 sm:h-11 sm:w-11">{userInitials}</div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-black text-gray-900 leading-tight">{userName}</p>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{userRole}</p>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full z-50 mt-3 w-[calc(100vw-1.5rem)] max-w-72 overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-2xl">
                <div className="p-4 border-b border-gray-100 bg-gray-50/80">
                  <p className="font-black text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user.email || 'No email'}</p>
                </div>
                <div className="p-2">
                  <NavLink to="/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-bold text-gray-700 transition-all hover:bg-orange-50 hover:text-[#E6761D]">
                    <Settings size={16} /> Settings
                  </NavLink>
                  <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-bold text-red-600 transition-all hover:bg-red-50">
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
