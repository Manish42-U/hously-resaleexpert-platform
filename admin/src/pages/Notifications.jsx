import { useState } from 'react'
import {
  Bell, Flame, TrendingUp, MessageSquare, AlertTriangle, Info,
  Users, CheckCheck, X, Filter, Check, Clock, Trash2,
  Star, Home, BarChart3, Settings, Zap, ChevronRight,
  RefreshCw, Archive
} from 'lucide-react'

const ALL_NOTIFICATIONS = [
  { id: 1, type: 'lead', icon: Flame, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', category: 'Leads', title: 'Hot Lead Alert!', desc: 'Rajesh Khanna is actively enquiring about 3BHK in Andheri East. Follow up immediately.', time: '2 min ago', unread: true, priority: 'urgent' },
  { id: 2, type: 'deal', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', category: 'Deals', title: '🎉 Deal Closed!', desc: 'Karan Johar — Penthouse Worli deal closed at ₹8.2 Cr. Agent: Amit Patel.', time: '1 hr ago', unread: true, priority: 'high' },
  { id: 3, type: 'message', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', category: 'Messages', title: 'New WhatsApp Message', desc: 'Priya Mehta: "Can we reschedule the site visit to Sunday morning instead?"', time: '3 hr ago', unread: true, priority: 'high' },
  { id: 4, type: 'alert', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', category: 'Alerts', title: 'Property Pending Review', desc: 'Sky Residences, Andheri listing has been submitted and awaits admin approval.', time: '5 hr ago', unread: false, priority: 'medium' },
  { id: 5, type: 'lead', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', category: 'Leads', title: 'New Lead Assigned', desc: 'Deepa Krishnan (2BHK, Kharghar, ₹95L) has been assigned to Priya Sharma.', time: '8 hr ago', unread: false, priority: 'medium' },
  { id: 6, type: 'info', icon: Info, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', category: 'System', title: 'CRM Sync Completed', desc: 'WhatsApp CRM successfully synced. 24 new leads imported from MagicBricks.', time: '1 day ago', unread: false, priority: 'low' },
  { id: 7, type: 'deal', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100', category: 'Deals', title: 'Featured Listing Expiring', desc: 'Ocean Pearl Penthouse featured status expires in 3 days. Renew to maintain visibility.', time: '1 day ago', unread: false, priority: 'medium' },
  { id: 8, type: 'user', icon: Users, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100', category: 'Team', title: 'New Agent Joined', desc: 'Vikash Sharma has registered as a Junior Agent and is awaiting role approval.', time: '2 days ago', unread: false, priority: 'low' },
  { id: 9, type: 'property', icon: Home, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', category: 'Properties', title: 'Property View Milestone', desc: 'Sky Residences has crossed 1,800 views! This is your most viewed listing this month.', time: '2 days ago', unread: false, priority: 'low' },
  { id: 10, type: 'report', icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', category: 'Reports', title: 'Monthly Report Ready', desc: 'October 2025 analytics report is ready. Revenue ₹60.8 Cr. 52 deals closed.', time: '3 days ago', unread: false, priority: 'low' },
  { id: 11, type: 'system', icon: Settings, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100', category: 'System', title: 'System Maintenance', desc: 'Scheduled maintenance on Sunday 2 AM - 4 AM IST. No data loss expected.', time: '4 days ago', unread: false, priority: 'low' },
  { id: 12, type: 'lead', icon: Zap, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100', category: 'Leads', title: 'Lead Score Updated', desc: 'Suresh Kumar\'s lead score increased to 88. High intent buyer — call recommended.', time: '5 days ago', unread: false, priority: 'medium' },
]

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  high: { label: 'High', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  medium: { label: 'Medium', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  low: { label: 'Low', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
}

const CATEGORIES = ['All', 'Leads', 'Deals', 'Messages', 'Alerts', 'Properties', 'Team', 'Reports', 'System']

const Notifications = () => {
  const [notifications, setNotifications] = useState(ALL_NOTIFICATIONS)
  const [activeCategory, setActiveCategory] = useState('All')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const filtered = notifications.filter(n => {
    const catMatch = activeCategory === 'All' || n.category === activeCategory
    const unreadMatch = !showUnreadOnly || n.unread
    return catMatch && unreadMatch
  })

  const unreadCount = notifications.filter(n => n.unread).length
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
  const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id))
  const clearAll = () => setNotifications([])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pb-10">

      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
        <div className="px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E6761D] to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Bell size={20} className="text-white" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Notification Center</h1>
              <p className="text-gray-500 text-sm">{unreadCount} unread · {notifications.length} total</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${showUnreadOnly ? 'bg-[#E6761D] text-white border-[#E6761D] shadow-lg shadow-orange-500/25' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
            >
              <Filter size={14} /> {showUnreadOnly ? 'Showing Unread' : 'All'}
            </button>
            <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
              <CheckCheck size={15} className="text-emerald-600" /> Mark all read
            </button>
            <button onClick={clearAll} className="flex items-center gap-2 px-4 py-2.5 border border-red-100 bg-red-50 rounded-xl text-sm font-bold text-red-600 hover:bg-red-100 transition-all">
              <Trash2 size={15} /> Clear all
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="px-6 lg:px-8 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(cat => {
            const count = cat === 'All' ? notifications.length : notifications.filter(n => n.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${activeCategory === cat ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
              >
                {cat}
                {count > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeCategory === cat ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* NOTIFICATION LIST */}
      <div className="px-6 lg:px-8 py-6 max-w-4xl mx-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell size={28} className="text-gray-300" />
            </div>
            <p className="text-lg font-black text-gray-500">No notifications</p>
            <p className="text-sm text-gray-400 mt-1">You're all caught up! Check back later.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Unread section */}
            {filtered.some(n => n.unread) && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E6761D]" />
                  New & Unread
                </p>
                <div className="space-y-2">
                  {filtered.filter(n => n.unread).map(notif => (
                    <NotifCard key={notif.id} notif={notif} onMarkRead={markRead} onDismiss={dismiss} />
                  ))}
                </div>
              </div>
            )}

            {/* Read section */}
            {filtered.some(n => !n.unread) && (
              <div className={filtered.some(n => n.unread) ? 'mt-6' : ''}>
                {filtered.some(n => n.unread) && (
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                    <Archive size={11} className="text-gray-400" />
                    Earlier
                  </p>
                )}
                <div className="space-y-2">
                  {filtered.filter(n => !n.unread).map(notif => (
                    <NotifCard key={notif.id} notif={notif} onMarkRead={markRead} onDismiss={dismiss} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const NotifCard = ({ notif, onMarkRead, onDismiss }) => {
  const priority = PRIORITY_CONFIG[notif.priority]
  return (
    <div className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${notif.unread ? 'bg-orange-50/50 border-orange-100/80 hover:border-orange-200' : 'bg-white border-gray-200/60 hover:border-gray-300'}`}>
      {/* Unread indicator */}
      {notif.unread && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r-full bg-gradient-to-b from-[#E6761D] to-orange-500" />
      )}

      {/* Icon */}
      <div className={`w-11 h-11 rounded-2xl ${notif.bg} border ${notif.border} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
        <notif.icon size={18} className={notif.color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className={`text-sm font-black leading-tight ${notif.unread ? 'text-gray-900' : 'text-gray-700'}`}>
            {notif.title}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${priority.bg} ${priority.text} ${priority.border}`}>
              {priority.label}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{notif.desc}</p>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold">
            <Clock size={10} />
            {notif.time}
          </div>
          <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">{notif.category}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {notif.unread && (
          <button
            onClick={(e) => { e.stopPropagation(); onMarkRead(notif.id) }}
            className="p-1.5 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
            title="Mark as read"
          >
            <Check size={13} />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(notif.id) }}
          className="p-1.5 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
          title="Dismiss"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}

export default Notifications
