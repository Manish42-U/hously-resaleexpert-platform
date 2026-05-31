import { useState, useEffect, useRef } from 'react'
import {
  MessageSquare, Send, Search, Info,
  PhoneCall, Video, Trash2, Clock3, Users,
  ChevronLeft, Plus, Zap, MessageCircle, CheckCheck, AlertCircle, X
} from 'lucide-react'
import { whatsappService, unwrap, getErrorMessage } from '../services/api'
import { format, isToday, isYesterday } from 'date-fns'

const WhatsAppCRM = () => {
  const [contacts, setContacts] = useState([])
  const [activeContact, setActiveContact] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState(null)
  const [showInfo, setShowInfo] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Greeting')
  
  const messagesEndRef = useRef(null)

  const suggestionFlow = {
    'Greeting': [
      "Hello! Welcome to Hously Realty. How can I assist you today?",
      "Hi there! Are you looking for a property to buy or rent?",
      "Good morning! Thank you for reaching out. How may I help you?"
    ],
    'Discovery': [
      "What is your preferred location in Pune?",
      "Could you please share your budget range for this property?",
      "Are you looking for a 2BHK, 3BHK, or a Villa?",
      "Is this for self-use or investment purposes?"
    ],
    'Site Visit': [
      "Would you like to schedule a site visit for this weekend?",
      "Can we have a quick call to discuss the property details?",
      "I can share the exact location and brochure. Should I send it here?",
      "We have some exclusive offers for site visits this week. Interested?"
    ],
    'Closing': [
      "Thank you for your time. I'll get back to you with more options.",
      "Great! I've noted your requirements. Our expert will call you shortly.",
      "Have a great day! Feel free to reach out if you have more questions."
    ]
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }

  // Initial fetch
  useEffect(() => {
    fetchContacts()
    const interval = setInterval(fetchContacts, 10000)
    return () => clearInterval(interval)
  }, [])

  // Handle contact change
  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact.id)
    } else {
      setMessages([])
    }
  }, [activeContact])

  // Update suggestions when messages change (avoiding loop)
  useEffect(() => {
    if (messages.length < 2) setActiveCategory('Greeting')
    else if (messages.length < 6) setActiveCategory('Discovery')
    else setActiveCategory('Site Visit')
    
    scrollToBottom()
  }, [messages])

  const fetchContacts = async () => {
    try {
      const data = await unwrap(await whatsappService.getContacts())
      setContacts(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching contacts:', err)
      setError(getErrorMessage(err))
    }
  }

  const fetchMessages = async (contactId) => {
    try {
      const data = await unwrap(await whatsappService.getMessages(contactId))
      setMessages(data)
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  const handleSendMessage = async (text) => {
    const messageText = typeof text === 'string' ? text : newMessage
    if (!messageText.trim() || !activeContact) return

    if (typeof text !== 'string') setNewMessage('')
    
    try {
      await whatsappService.send({
        to: activeContact.phone_number,
        text: messageText
      })
      fetchMessages(activeContact.id)
      fetchContacts()
    } catch (err) {
      setError(getErrorMessage(err))
      if (typeof text !== 'string') setNewMessage(messageText)
    }
  }

  const handleDeleteConversation = async () => {
    if (!activeContact) return
    if (!window.confirm('Are you sure you want to delete this conversation? This will delete all messages.')) return

    try {
      setLoading(true)
      setError(null)
      await whatsappService.delete(activeContact.id)
      setActiveContact(null)
      await fetchContacts()
      setLoading(false)
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to delete conversation. Please try again.')
      setLoading(false)
    }
  }

  const handleNewChat = async () => {
    const phone = prompt('Enter phone number (with country code):')
    if (!phone) return
    
    try {
      setLoading(true)
      await whatsappService.send({
        to: phone,
        text: "Hello! This is Hously Realty. How can I help you?"
      })
      await fetchContacts()
      setLoading(false)
    } catch (err) {
      setError(getErrorMessage(err))
      setLoading(false)
    }
  }

  const formatMessageTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isToday(d)) return format(d, 'p')
    if (isYesterday(d)) return 'Yesterday'
    return format(d, 'dd/MM/yy')
  }

  const filteredContacts = contacts.filter(c => 
    (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (c.phone_number && c.phone_number.includes(searchQuery))
  )
  const unreadTotal = contacts.reduce((sum, contact) => sum + Number(contact.unread_count || 0), 0)
  const latestContact = contacts
    .filter((contact) => contact.last_message_at)
    .sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at))[0]
  const crmDisabled = error && error.toLowerCase().includes('disabled')

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white overflow-hidden rounded-xl border border-gray-200 mx-2 my-2 shadow-sm relative">
      {/* Error Toast */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-red-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-red-500">
            <AlertCircle size={20} />
            <p className="text-sm font-bold">{error}</p>
            <button onClick={() => setError(null)} className="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {crmDisabled && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/95 px-6 backdrop-blur-sm">
          <div className="max-w-md rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <MessageCircle size={30} />
            </div>
            <h2 className="mt-5 text-2xl font-black text-slate-900">WhatsApp CRM is disabled</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
              Admin settings mein WhatsApp Integration on karte hi conversations, smart replies aur lead follow-up queue yahan live ho jayegi.
            </p>
            <button onClick={fetchContacts} className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white">
              Check Status
            </button>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <div className={`${activeContact ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-gray-100`}>
        <div className="p-5 border-b border-gray-50 bg-gray-50/30">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="text-blue-600" size={24} />
              WhatsApp CRM
            </h1>
            <button 
              onClick={handleNewChat}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3">
              <Users className="text-blue-600" size={16} />
              <p className="mt-2 text-lg font-black text-slate-900">{contacts.length}</p>
              <p className="text-[10px] font-bold uppercase text-slate-500">Leads</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
              <MessageSquare className="text-emerald-600" size={16} />
              <p className="mt-2 text-lg font-black text-slate-900">{unreadTotal}</p>
              <p className="text-[10px] font-bold uppercase text-slate-500">Unread</p>
            </div>
            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-3">
              <Clock3 className="text-orange-600" size={16} />
              <p className="mt-2 text-xs font-black text-slate-900">{latestContact ? formatMessageTime(latestContact.last_message_at) : '--'}</p>
              <p className="text-[10px] font-bold uppercase text-slate-500">Latest</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          {filteredContacts.length === 0 ? (
            <div className="py-20 text-center px-6">
              <p className="text-gray-400 text-sm">No conversations found</p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div 
                key={contact.id} 
                onClick={() => setActiveContact(contact)}
                className={`p-4 cursor-pointer transition-all flex items-center gap-4 border-b border-gray-50 ${activeContact?.id === contact.id ? 'bg-blue-50 border-r-4 border-r-blue-600' : 'hover:bg-gray-50'}`}
              >
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0 shadow-sm">
                  {(contact.name || contact.phone_number || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">
                      {contact.name || contact.phone_number}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {formatMessageTime(contact.last_message_at)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 truncate pr-2">
                      {contact.last_message || 'No messages'}
                    </p>
                    {contact.unread_count > 0 && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                        {contact.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${!activeContact ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-[#F8FAFC]`}>
        {activeContact ? (
          <>
            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-100 px-4 flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveContact(null)} className="md:hidden p-2 text-gray-500">
                  <ChevronLeft size={20} />
                </button>
                <div className="h-10 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                  {(activeContact.name || activeContact.phone_number || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-sm text-gray-900">{activeContact.name || activeContact.phone_number}</h2>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span>
                    <p className="text-[10px] text-gray-500 font-medium">Active Lead</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a href={`tel:${activeContact.phone_number}`} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                  <PhoneCall size={18} />
                </a>
                <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Video size={18} /></button>
                <button onClick={() => setShowInfo(!showInfo)} className={`p-2.5 rounded-lg transition-all ${showInfo ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-100'}`}><Info size={18} /></button>
                <div className="h-4 w-px bg-gray-200 mx-2"></div>
                <button onClick={handleDeleteConversation} disabled={loading} className={`p-2.5 rounded-lg transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}><Trash2 size={18} /></button>
              </div>
            </header>
            
            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
              {messages.map((msg) => {
                const isOutgoing = msg.direction === 'outgoing'
                return (
                  <div key={msg.id} className={`${isOutgoing ? 'self-end' : 'self-start'} max-w-[75%]`}>
                    <div className={`${isOutgoing ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-800 shadow-sm border border-gray-100'} p-3.5 rounded-2xl ${isOutgoing ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                      <p className="text-[13.5px] leading-relaxed">{msg.body}</p>
                      <div className="flex items-center justify-end gap-1.5 mt-1.5">
                        <p className={`text-[9px] font-medium ${isOutgoing ? 'text-blue-100' : 'text-gray-400'}`}>
                          {msg.timestamp ? format(new Date(msg.timestamp), 'p') : ''}
                        </p>
                        {isOutgoing && (
                          <CheckCheck size={12} className={msg.status === 'read' ? 'text-blue-200' : 'text-blue-100/40'} />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Smart Suggestions & Input */}
            <div className="p-4 bg-white border-t border-gray-100 space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              {/* Category Tabs */}
              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl w-fit border border-gray-100">
                {Object.keys(suggestionFlow).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${activeCategory === cat ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap gap-2">
                {suggestionFlow[activeCategory].map((reply, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSendMessage(reply)}
                    className="px-4 py-2 bg-white text-gray-700 text-[11.5px] font-medium rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all border border-gray-200 shadow-sm flex items-center gap-2 group"
                  >
                    <Zap size={12} className="text-yellow-500 group-hover:text-white" />
                    {reply}
                  </button>
                ))}
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Type a custom response..." 
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="h-12 w-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-100 disabled:opacity-50 active:scale-95"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 text-center">
            <div className="h-20 w-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 border border-gray-50">
              <MessageSquare className="text-blue-600" size={36} />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">Hously Smart CRM</h3>
            <p className="max-w-xs text-sm leading-relaxed">Select a conversation to start chatting. Our smart flow will suggest the best next steps for your lead.</p>
          </div>
        )}
      </div>

      {/* Info Sidebar */}
      {activeContact && showInfo && (
        <div className="hidden lg:flex w-80 bg-white border-l border-gray-100 flex-col overflow-y-auto">
          <div className="p-8 text-center border-b border-gray-50 bg-gray-50/30">
            <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-xl shadow-blue-100">
              {(activeContact.name || activeContact.phone_number || '?').charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-1">{activeContact.name || activeContact.phone_number}</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{activeContact.phone_number}</p>
          </div>

          <div className="p-6 space-y-8">
            <section>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <a href={`tel:${activeContact.phone_number}`} className="flex flex-col items-center gap-2 py-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm">
                  <PhoneCall size={20} />
                  <span className="text-[10px] font-bold">Call Now</span>
                </a>
                <button onClick={handleDeleteConversation} disabled={loading} className={`flex flex-col items-center gap-2 py-4 bg-red-50 rounded-2xl transition-all shadow-sm ${loading ? 'opacity-50 cursor-not-allowed' : 'text-red-500 hover:bg-red-600 hover:text-white'}`}>
                  <Trash2 size={20} />
                  <span className="text-[10px] font-bold">Delete Chat</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

export default WhatsAppCRM
