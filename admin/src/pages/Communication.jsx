import { useState } from 'react'
import {
  Mail, MessageSquare, Send, Users, BarChart3, TrendingUp, Clock, CheckCircle,
  AlertCircle, UserPlus, Zap, Megaphone, Phone, Calendar, Star, ChevronRight,
  MoreHorizontal, Sparkles, Plus, Image as ImageIcon, Link as LinkIcon
} from 'lucide-react'

const Communication = () => {
  const [activeTab, setActiveTab] = useState('campaigns')
  const [campaignSubject, setCampaignSubject] = useState('')
  const [campaignMessage, setCampaignMessage] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('leads')
  const [sending, setSending] = useState(false)

  const handleSendCampaign = (e) => {
    e.preventDefault()
    if (!campaignSubject.trim() || !campaignMessage.trim()) return
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setCampaignSubject('')
      setCampaignMessage('')
    }, 1500)
  }

  const recentCampaigns = [
    { id: 1, title: '🎉 Diwali Special: Up to 15% Off', sent: 1240, opened: 558, openedRate: 45, date: 'Oct 28, 2025', status: 'sent' },
    { id: 2, title: '🏠 New Luxury Villas in Baner', sent: 850, opened: 323, openedRate: 38, date: 'Oct 15, 2025', status: 'sent' },
    { id: 3, title: '💰 Investment Webinar Invite', sent: 2100, opened: 1092, openedRate: 52, date: 'Oct 05, 2025', status: 'sent' },
    { id: 4, title: '🏡 Price Drop Alert: Wakad', sent: 620, opened: 279, openedRate: 45, date: 'Sep 28, 2025', status: 'draft' },
  ]

  const quickStats = [
    { label: 'Total Subscribers', value: '4,582', icon: Users, change: '+12%', color: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/20' },
    { label: 'Avg. Open Rate', value: '47%', icon: Mail, change: '+5%', color: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/20' },
    { label: 'Click-through Rate', value: '18.3%', icon: TrendingUp, change: '+2.1%', color: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/20' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 page-enter">
      {/* HEADER */}
      <div className="sticky top-0 z-20 glass-white border-b border-gray-200/60 px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E6761D] to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Megaphone size={18} className="text-white" />
              </div>
              Communication Center
            </h1>
            <p className="text-gray-500 text-sm mt-0.5 ml-12">Email campaigns, newsletters, and team messaging</p>
          </div>
          <div className="flex gap-2 p-1 bg-gray-100/80 rounded-2xl border border-gray-200">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === 'campaigns'
                  ? 'bg-white text-[#E6761D] shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <Mail size={16} /> Campaigns
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === 'team'
                  ? 'bg-white text-purple-600 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <MessageSquare size={16} /> Team Chat
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-8 max-w-[1600px] mx-auto">
        {activeTab === 'campaigns' ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Compose Campaign */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all duration-400">
                <div className="bg-gradient-to-r from-orange-50 to-white px-7 py-5 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Send className="text-[#E6761D]" size={20} /> Compose Campaign
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Design and send targeted email broadcasts</p>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-100 text-orange-600 text-xs font-bold hover:bg-orange-200 transition-colors">
                    <Sparkles size={12} /> AI Writer
                  </button>
                </div>
                <form onSubmit={handleSendCampaign} className="p-7 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                        <Users size={15} className="text-gray-400" /> Target Audience
                      </label>
                      <select
                        value={selectedSegment}
                        onChange={(e) => setSelectedSegment(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-[#E6761D] focus:shadow-[0_0_0_4px_rgba(230,118,29,0.1)] outline-none bg-white transition-all cursor-pointer hover:border-gray-300"
                      >
                        <option value="leads">🔥 Active Leads (2,340 contacts)</option>
                        <option value="customers">⭐ Previous Customers (1,120 contacts)</option>
                        <option value="newsletter">📧 Newsletter Subscribers (1,122 contacts)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Subject Line</label>
                      <input
                        type="text"
                        value={campaignSubject}
                        onChange={(e) => setCampaignSubject(e.target.value)}
                        placeholder="e.g., Exclusive Preview: New Luxury Villas in Pune"
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-[#E6761D] focus:shadow-[0_0_0_4px_rgba(230,118,29,0.1)] outline-none transition-all hover:border-gray-300"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold text-gray-700">Email Content</label>
                      <div className="flex gap-1">
                        <button type="button" className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"><ImageIcon size={15} /></button>
                        <button type="button" className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"><LinkIcon size={15} /></button>
                      </div>
                    </div>
                    <textarea
                      rows="8"
                      value={campaignMessage}
                      onChange={(e) => setCampaignMessage(e.target.value)}
                      placeholder="Write your email content here... Use HTML or plain text."
                      className="w-full rounded-2xl border border-gray-200 p-4 text-sm text-gray-700 focus:border-[#E6761D] focus:shadow-[0_0_0_4px_rgba(230,118,29,0.1)] outline-none transition-all resize-none hover:border-gray-300"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4 border-t border-gray-100">
                    <div className="flex gap-3 w-full sm:w-auto">
                      <button type="button" className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 hover:shadow-sm transition-all">Save Draft</button>
                      <button type="button" className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 hover:shadow-sm transition-all">Preview</button>
                    </div>
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#E6761D] to-orange-600 text-white font-bold shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/35 hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100 ripple"
                    >
                      {sending ? <Clock size={16} className="animate-spin" /> : <Send size={16} />}
                      {sending ? 'Sending Broadcast...' : 'Send Campaign'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4">
                {quickStats.map((stat) => (
                  <div key={stat.label} className={`bg-white rounded-2xl border border-gray-100 p-5 card-lift hover:shadow-lg ${stat.glow}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                        <stat.icon size={18} className="text-white" />
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full uppercase tracking-wider">
                        <TrendingUp size={11} /> {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-black text-gray-900 stat-value">{stat.value}</p>
                    <p className="text-sm font-semibold text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Campaigns List */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-400">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" /> Recent Activity
                  </h3>
                  <button className="text-xs font-bold text-[#E6761D] hover:underline">View All</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {recentCampaigns.map((camp) => (
                    <div key={camp.id} className="group p-5 hover:bg-orange-50/30 transition-all duration-250 cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-gray-800 text-sm group-hover:text-[#E6761D] transition-colors line-clamp-1 pr-2">{camp.title}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex-shrink-0 border ${camp.status === 'sent' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                          {camp.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
                        <span className="flex items-center gap-1"><Users size={12} className="text-gray-400" /> {camp.sent.toLocaleString()}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="flex items-center gap-1"><Calendar size={12} className="text-gray-400" /> {camp.date}</span>
                      </div>
                      {camp.status === 'sent' && (
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                            <span>Open Rate</span>
                            <span className="text-[#E6761D]">{camp.openedRate}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#E6761D] to-orange-400 rounded-full group-hover:shadow-[0_0_8px_rgba(230,118,29,0.6)] transition-all" style={{ width: `${camp.openedRate}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* TEAM CHAT TAB */
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 h-[calc(100vh-140px)] min-h-[600px]">
            {/* Online Members Sidebar */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Users size={16} className="text-purple-500" /> Team Members
                </h3>
                <div className="mt-3 relative">
                  <input type="text" placeholder="Search..." className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-400 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] transition-all" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 scrollbar-custom space-y-1">
                {[
                  { name: 'John Doe', role: 'Senior Agent', active: true, color: 'from-indigo-500 to-purple-600', selected: true },
                  { name: 'Priya Mehta', role: 'Sales Manager', active: true, color: 'from-emerald-500 to-teal-600' },
                  { name: 'Aarav Sharma', role: 'Marketing Lead', active: true, color: 'from-blue-500 to-indigo-600' },
                  { name: 'Rahul Verma', role: 'Content Writer', active: false, color: 'from-gray-400 to-gray-500' },
                ].map((member, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer ${member.selected ? 'bg-purple-50 border border-purple-100' : 'hover:bg-gray-50 border border-transparent'}`}>
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-sm font-black shadow-sm`}>
                        {member.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${member.active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${member.selected ? 'text-purple-700' : 'text-gray-800'}`}>{member.name}</p>
                      <p className="text-xs text-gray-500 truncate">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="xl:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              {/* Chat Header */}
              <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center z-10 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-md">JD</div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-white"></div>
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">John Doe</h3>
                    <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all"><Phone size={18} /></button>
                  <button className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"><MoreHorizontal size={18} /></button>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50/50">
                <div className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider my-4">Today, 10:42 AM</div>
                
                <div className="flex justify-start">
                  <div className="max-w-[70%] bg-white border border-gray-100 rounded-3xl rounded-tl-none px-5 py-3 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-800 leading-relaxed">Hey team, anyone available to review the new property listing for the Andheri project?</p>
                    <span className="text-[9px] font-bold text-gray-400 mt-1 block">10:42 AM</span>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <div className="max-w-[70%] bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-3xl rounded-tr-none px-5 py-3 shadow-md hover:shadow-lg transition-shadow">
                    <p className="text-sm leading-relaxed">I can take a look. Please share the link here.</p>
                    <span className="text-[9px] font-bold text-white/70 mt-1 block text-right">10:45 AM · Read</span>
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <div className="max-w-[70%] bg-white border border-gray-100 rounded-3xl rounded-tl-none px-5 py-3 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-sm text-gray-800 leading-relaxed">Thanks! Here it is: <a href="#" className="text-purple-600 font-bold hover:underline">hously.in/property/andheri-villa</a></p>
                    <span className="text-[9px] font-bold text-gray-400 mt-1 block">10:46 AM</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="max-w-[70%] bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-3xl rounded-tr-none px-5 py-3 shadow-md hover:shadow-lg transition-shadow">
                    <p className="text-sm leading-relaxed">Looks solid. Approved from my side. 👍</p>
                    <span className="text-[9px] font-bold text-white/70 mt-1 block text-right">10:50 AM · Read</span>
                  </div>
                </div>
              </div>
              
              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl border border-gray-200 p-2 focus-within:border-purple-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] transition-all">
                  <button className="p-2 text-gray-400 hover:text-purple-500 transition-colors"><Plus size={20} /></button>
                  <input type="text" placeholder="Type your message..." className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800" />
                  <button className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/30 transition-all ripple">
                    <Send size={16} className="-ml-0.5 mt-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Communication