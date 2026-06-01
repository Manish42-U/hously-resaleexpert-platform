import { useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, BarChart3, Bell, Building2, CheckCircle2, Database,
  Download, FileText, Globe2, KeyRound, Lock, Mail, MessageCircle, Phone,
  PieChart, RefreshCw, Search, Settings, ShieldCheck, SlidersHorizontal,
  Target, TrendingUp, UserCheck, Users, Workflow, Save, Plus, X, ServerCog,
  Clock3, HardDrive, Smartphone, UserPlus, Radio, Eye, CalendarClock,
  Trash2, MapPin
} from 'lucide-react'
import { adminService, contactService, getErrorMessage, unwrap } from '../services/api'
import { formatCurrency, formatDate, initials } from '../utils/dashboardData'

const MODULES = {
  leads: {
    title: 'Leads Management',
    subtitle: 'Website enquiries and buyer follow-ups from real contact submissions.',
    icon: Target,
    accent: 'orange',
  },
  crm: {
    title: 'CRM Workspace',
    subtitle: 'Relationship intelligence for buyers, sellers and property executives.',
    icon: Database,
    accent: 'blue',
  },
  communication: {
    title: 'Communication Hub',
    subtitle: 'Call, email and WhatsApp queue from real customer records.',
    icon: MessageCircle,
    accent: 'purple',
  },
  notifications: {
    title: 'Notifications',
    subtitle: 'Live alerts from new leads, pending listings and unread WhatsApp messages.',
    icon: Bell,
    accent: 'rose',
  },
  reports: {
    title: 'Reports Center',
    subtitle: 'Executive reporting generated from current backend data.',
    icon: BarChart3,
    accent: 'emerald',
  },
  administrator: {
    title: 'Administrator',
    subtitle: 'Real admin/user accounts and activity health.',
    icon: ShieldCheck,
    accent: 'slate',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Workspace configuration, integration status and data health.',
    icon: Settings,
    accent: 'slate',
  },
}

const accentClasses = {
  orange: 'bg-orange-50 text-orange-700 border-orange-100',
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  purple: 'bg-purple-50 text-purple-700 border-purple-100',
  rose: 'bg-rose-50 text-rose-700 border-rose-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
}

const priorityClasses = {
  hot: 'bg-red-50 text-red-700 border-red-100',
  high: 'bg-red-50 text-red-700 border-red-100',
  warm: 'bg-amber-50 text-amber-700 border-amber-100',
  medium: 'bg-blue-50 text-blue-700 border-blue-100',
  new: 'bg-slate-100 text-slate-700 border-slate-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  ready: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  empty: 'bg-slate-100 text-slate-700 border-slate-200',
}

const fieldIconClasses = {
  orange: 'bg-orange-50 text-orange-700',
  blue: 'bg-blue-50 text-blue-700',
  purple: 'bg-purple-50 text-purple-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  rose: 'bg-rose-50 text-rose-700',
  red: 'bg-red-50 text-red-700',
  slate: 'bg-slate-100 text-slate-700',
}

const cleanPhone = (phone) => String(phone || '').replace(/\D/g, '')

const defaultSettings = {
  companyName: 'Hously Finntech Realty',
  supportEmail: 'support@hously.com',
  supportPhone: '+91 98765 43210',
  timezone: 'Asia/Kolkata',
  maintenanceMode: false,
  maintenanceMessage: 'We are upgrading Hously. Please check back shortly.',
  allowRegistration: true,
  autoAssignLeads: true,
  publishApprovalRequired: true,
  whatsappEnabled: true,
  emailNotifications: true,
  weeklyReports: true,
  sessionTimeoutMinutes: 45,
  backupRetentionDays: 30,
}

const leadStatuses = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'closed', label: 'Closed' },
  { value: 'lost', label: 'Lost' },
]

const leadStatusClasses = {
  new: 'bg-slate-100 text-slate-700 border-slate-200',
  contacted: 'bg-blue-50 text-blue-700 border-blue-100',
  qualified: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  site_visit: 'bg-purple-50 text-purple-700 border-purple-100',
  closed: 'bg-teal-50 text-teal-700 border-teal-100',
  lost: 'bg-red-50 text-red-700 border-red-100',
}

const matchesText = (query, values) => {
  if (!query) return true
  return values.some((value) => String(value || '').toLowerCase().includes(query))
}

const FieldStat = ({ label, value, icon: Icon, tone = 'slate', note }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-2 truncate text-2xl font-black text-slate-900">{value}</p>
        {note && <p className="mt-1 truncate text-xs font-bold text-slate-400">{note}</p>}
      </div>
      <div className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center ${fieldIconClasses[tone] || fieldIconClasses.slate}`}>
        <Icon size={20} />
      </div>
    </div>
  </div>
)

const EmptyState = ({ label }) => (
  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
    <AlertTriangle className="mx-auto text-slate-300" size={34} />
    <p className="mt-3 text-sm font-bold text-slate-500">{label}</p>
  </div>
)

const ProgressBar = ({ label, value, max, tone = 'bg-[#E6761D]' }) => {
  const width = max ? Math.max(4, Math.round((Number(value || 0) / max) * 100)) : 0
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="truncate text-sm font-bold text-slate-700">{label}</span>
        <span className="text-xs font-black text-slate-400">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

const SwitchRow = ({ label, desc, icon: Icon, checked, disabled, danger, onChange }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`w-full rounded-3xl border p-4 text-left transition-all duration-300 ${
      checked
        ? danger
          ? 'border-red-200 bg-red-50 shadow-sm shadow-red-100'
          : 'border-emerald-200 bg-emerald-50 shadow-sm shadow-emerald-100'
        : 'border-slate-200 bg-white hover:border-slate-300'
    } ${disabled ? 'cursor-wait opacity-70' : ''}`}
  >
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${checked ? (danger ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white') : 'bg-slate-100 text-slate-600'}`}>
          <Icon size={19} />
        </div>
        <div className="min-w-0">
          <p className="font-black text-slate-900">{label}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{desc}</p>
        </div>
      </div>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? (danger ? 'bg-red-600' : 'bg-emerald-600') : 'bg-slate-300'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </span>
    </div>
  </button>
)

const WorkspacePage = ({ module = 'leads' }) => {
  const meta = MODULES[module] || MODULES.leads
  const Icon = meta.icon
  const [workspace, setWorkspace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [settingsDraft, setSettingsDraft] = useState(defaultSettings)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', password: '', role: 'admin' })
  const [inviteSaving, setInviteSaving] = useState(false)
  const [inviteMessage, setInviteMessage] = useState('')
  const [leadSavingId, setLeadSavingId] = useState(null)
  const [dismissedNotifIds, setDismissedNotifIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adminNotificationDismissed') || '[]')
    } catch {
      return []
    }
  })
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adminNotificationRead') || '[]')
    } catch {
      return []
    }
  })

  const loadWorkspace = async () => {
    setLoading(true)
    setError('')
    try {
      const data = unwrap(await adminService.getWorkspace())
      setWorkspace(data)
      setSettingsDraft({ ...defaultSettings, ...(data.settings || {}) })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadWorkspace() }, [])

  useEffect(() => {
    localStorage.setItem('adminNotificationDismissed', JSON.stringify(dismissedNotifIds))
  }, [dismissedNotifIds])

  useEffect(() => {
    localStorage.setItem('adminNotificationRead', JSON.stringify(readNotifIds))
  }, [readNotifIds])

  const q = search.trim().toLowerCase()
  const stats = workspace?.stats || {}
  const leads = useMemo(() => workspace?.leads || [], [workspace?.leads])
  const pipeline = useMemo(() => workspace?.pipeline || [], [workspace?.pipeline])
  const notifications = useMemo(
    () => (workspace?.notifications || [])
      .filter((item) => !dismissedNotifIds.includes(item.id))
      .map((item) => ({ ...item, unread: item.unread && !readNotifIds.includes(item.id) })),
    [dismissedNotifIds, readNotifIds, workspace?.notifications]
  )
  const reports = useMemo(() => workspace?.reports || [], [workspace?.reports])
  const payments = useMemo(() => workspace?.payments || workspace?.subscriptions || [], [workspace?.payments, workspace?.subscriptions])
  const users = useMemo(() => workspace?.users || [], [workspace?.users])
  const properties = useMemo(() => workspace?.properties || [], [workspace?.properties])
  const blogs = useMemo(() => workspace?.blogs || [], [workspace?.blogs])
  const whatsappContacts = useMemo(() => workspace?.whatsappContacts || [], [workspace?.whatsappContacts])
  const settings = useMemo(() => ({ ...defaultSettings, ...(workspace?.settings || settingsDraft) }), [settingsDraft, workspace?.settings])
  const crmIntel = workspace?.crm || {}
  const communicationIntel = workspace?.communication || {}
  const notificationIntel = workspace?.notificationCenter || {}

  const filteredLeads = useMemo(
    () => leads.filter((lead) => matchesText(q, [lead.name, lead.phone, lead.email, lead.interest, lead.budget, lead.location])),
    [leads, q]
  )

  const filteredNotifications = useMemo(
    () => notifications.filter((item) => matchesText(q, [item.title, item.desc, item.category, item.priority])),
    [notifications, q]
  )

  const filteredUsers = useMemo(
    () => users.filter((user) => matchesText(q, [user.name, user.email, user.role])),
    [users, q]
  )

  const averageLeadScore = useMemo(() => {
    if (!leads.length) return 0
    return Math.round(leads.reduce((sum, lead) => sum + Number(lead.score || 0), 0) / leads.length)
  }, [leads])

  const contactableLeads = useMemo(
    () => leads.filter((lead) => lead.phone || lead.email),
    [leads]
  )

  const crmRelationships = useMemo(() => {
    const ownerCards = properties
      .filter((property) => property.full_name || property.name || property.email || property.phone || property.executive_name)
      .map((property) => ({
        id: `owner-${property.id}`,
        type: 'Owner',
        name: property.full_name || property.name || property.executive_name || 'Property owner',
        subtitle: [property.property_code, property.location || property.city].filter(Boolean).join(' · ') || 'Listing owner',
        value: formatCurrency(Number(property.price || 0)),
        status: property.status || 'Under Review',
        phone: property.phone,
        email: property.email,
        score: Number(property.ai_score || 0),
        created_at: property.created_at,
      }))

    const leadCards = leads.map((lead) => ({
      id: `lead-${lead.id}`,
      type: 'Buyer Lead',
      name: lead.name,
      subtitle: lead.interest,
      value: lead.budget || 'Budget pending',
      status: lead.priority === 'hot' ? 'Priority Follow-up' : 'New Enquiry',
      phone: lead.phone,
      email: lead.email,
      score: lead.score,
      created_at: lead.created_at,
    }))

    return [...leadCards, ...ownerCards]
      .filter((item) => matchesText(q, [item.name, item.subtitle, item.value, item.status, item.phone, item.email, item.type]))
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  }, [leads, properties, q])

  const communicationQueue = useMemo(() => {
    const leadActions = leads.map((lead) => ({
      id: `lead-${lead.id}`,
      channel: lead.phone ? 'Call + WhatsApp' : 'Email',
      name: lead.name,
      subject: lead.interest,
      priority: lead.priority,
      phone: lead.phone,
      email: lead.email,
      reason: lead.priority === 'hot' ? `High score ${lead.score}/100` : lead.lastContact,
      created_at: lead.created_at,
    }))

    const listingActions = properties
      .filter((property) => String(property.status || '').toLowerCase() !== 'available')
      .map((property) => ({
        id: `property-${property.id}`,
        channel: property.phone ? 'Owner Call' : 'Email',
        name: property.full_name || property.executive_name || 'Listing owner',
        subject: [property.property_code, property.status || 'Review'].filter(Boolean).join(' · '),
        priority: 'medium',
        phone: property.phone,
        email: property.email,
        reason: 'Listing needs admin review',
        created_at: property.created_at,
      }))

    return [...leadActions, ...listingActions]
      .filter((item) => item.phone || item.email)
      .filter((item) => matchesText(q, [item.name, item.subject, item.channel, item.reason, item.phone, item.email]))
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  }, [leads, properties, q])

  const filteredWhatsapp = useMemo(
    () => whatsappContacts.filter((contact) => matchesText(q, [contact.name, contact.phone_number, contact.last_message])),
    [q, whatsappContacts]
  )

  const statusBreakdown = useMemo(() => {
    const map = properties.reduce((acc, property) => {
      const status = property.status || 'Unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})
    return Object.entries(map).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
  }, [properties])

  const localityBreakdown = useMemo(() => {
    const map = properties.reduce((acc, property) => {
      const location = property.location || property.city || 'Location pending'
      acc[location] = (acc[location] || 0) + 1
      return acc
    }, {})
    return Object.entries(map).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 8)
  }, [properties])

  const propertyExecutives = useMemo(
    () => Array.from(new Set(properties.map((property) => property.executive_name).filter(Boolean))),
    [properties]
  )

  const downloadReport = (report) => {
    const payload = {
      exportedAt: new Date().toISOString(),
      report,
      stats,
      properties,
      leads,
      users,
      blogs,
      whatsappContacts,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${report.id || 'workspace-report'}.json`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const downloadReportCsv = (report) => {
    const rows = [
      ['Report', report.name],
      ['Generated At', new Date().toLocaleString()],
      ['Portfolio Value', stats.totalValue || 0],
      ['Properties', stats.properties || 0],
      ['Available Properties', stats.availableProperties || 0],
      ['Review Properties', stats.reviewProperties || 0],
      ['Leads', stats.contacts || 0],
      ['Users', stats.users || 0],
      ['WhatsApp Contacts', stats.whatsappContacts || 0],
    ]
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${report.id || 'workspace-report'}.csv`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  const patchSettingsDraft = (patch) => {
    setSettingsSaved('')
    setSettingsDraft((current) => ({ ...current, ...patch }))
  }

  const saveSettings = async (patch = settingsDraft) => {
    setSavingSettings(true)
    setSettingsSaved('')
    try {
      const nextSettings = unwrap(await adminService.updateSettings(patch))
      setSettingsDraft({ ...defaultSettings, ...nextSettings })
      setWorkspace((current) => current ? { ...current, settings: nextSettings } : current)
      setSettingsSaved('Saved')
    } catch (err) {
      setSettingsSaved(getErrorMessage(err))
    } finally {
      setSavingSettings(false)
    }
  }

  const toggleSetting = async (key, value) => {
    const next = { ...settingsDraft, [key]: value }
    await saveSettings(next)
  }

  const createAdminUser = async (event) => {
    event.preventDefault()
    setInviteSaving(true)
    setInviteMessage('')
    try {
      const created = unwrap(await adminService.createUser(inviteForm))
      setWorkspace((current) => current ? { ...current, users: [created, ...(current.users || [])], stats: { ...(current.stats || {}), users: (current.stats?.users || 0) + 1 } } : current)
      setInviteForm({ name: '', email: '', password: '', role: 'admin' })
      setInviteMessage('Administrator created')
      setInviteOpen(false)
    } catch (err) {
      setInviteMessage(getErrorMessage(err))
    } finally {
      setInviteSaving(false)
    }
  }

  const changeUserRole = async (user) => {
    setInviteMessage('')
    try {
      const nextRole = user.role === 'admin' ? 'user' : 'admin'
      const updated = unwrap(await adminService.updateUser(user.id, { role: nextRole }))
      setWorkspace((current) => current ? {
        ...current,
        users: (current.users || []).map((item) => item.id === user.id ? updated : item),
      } : current)
      setInviteMessage(`${updated.name} is now ${updated.role === 'admin' ? 'an administrator' : 'a user'}`)
    } catch (err) {
      setInviteMessage(getErrorMessage(err))
    }
  }

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name}? This removes their backend account.`)) return
    setInviteMessage('')
    try {
      await adminService.deleteUser(user.id)
      setWorkspace((current) => current ? {
        ...current,
        users: (current.users || []).filter((item) => item.id !== user.id),
        stats: { ...(current.stats || {}), users: Math.max(0, (current.stats?.users || 1) - 1) },
      } : current)
      setInviteMessage(`${user.name} deleted`)
    } catch (err) {
      setInviteMessage(getErrorMessage(err))
    }
  }

  const updateLead = async (lead, patch) => {
    setLeadSavingId(lead.id)
    try {
      const updated = unwrap(await contactService.update(lead.id, patch))
      setWorkspace((current) => {
        if (!current) return current
        const contacts = (current.contacts || []).map((contact) => contact.id === lead.id ? { ...contact, ...updated } : contact)
        const leads = (current.leads || []).map((item) => item.id === lead.id ? {
          ...item,
          stage: updated.status || item.stage,
          assigned_to: updated.assigned_to || item.assigned_to,
          admin_notes: updated.admin_notes || item.admin_notes,
          last_contacted_at: updated.last_contacted_at || item.last_contacted_at,
          lastContact: updated.last_contacted_at ? 'Just now' : item.lastContact,
        } : item)
        return { ...current, contacts, leads }
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLeadSavingId(null)
    }
  }

  const markLeadContacted = (lead) => updateLead(lead, {
    status: lead.stage === 'new' ? 'contacted' : lead.stage,
    last_contacted_at: new Date().toISOString(),
  })

  const markNotificationRead = (id) => {
    setReadNotifIds((current) => Array.from(new Set([...current, id])))
  }

  const dismissNotification = (id) => {
    setDismissedNotifIds((current) => Array.from(new Set([...current, id])))
    markNotificationRead(id)
  }

  const markAllNotificationsRead = () => {
    setReadNotifIds((current) => Array.from(new Set([...current, ...notifications.map((item) => item.id)])))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="animate-spin text-[#E6761D]" size={34} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="rounded-3xl bg-white border border-red-100 p-8 text-center max-w-md">
          <AlertTriangle className="mx-auto text-red-500" size={36} />
          <h2 className="mt-4 text-xl font-black text-slate-900">Backend data unavailable</h2>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <button onClick={loadWorkspace} className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-[#E6761D]">Retry</button>
        </div>
      </div>
    )
  }

  const renderModuleStats = () => {
    const highPriority = leads.filter((lead) => ['hot', 'high'].includes(lead.priority)).length
    const emailReady = leads.filter((lead) => lead.email).length
    const modules = {
      leads: [
        { label: 'Real Leads', value: leads.length, icon: Target, tone: 'orange', note: `${highPriority} priority` },
        { label: 'Avg Lead Score', value: `${averageLeadScore}/100`, icon: TrendingUp, tone: 'emerald', note: 'From contact completeness' },
        { label: 'Contactable', value: contactableLeads.length, icon: Phone, tone: 'blue', note: 'Phone or email available' },
        { label: 'Pipeline Value', value: formatCurrency(stats.totalValue || 0), icon: CheckCircle2, tone: 'slate', note: 'Listed inventory value' },
      ],
      crm: [
        { label: 'Relationships', value: crmRelationships.length, icon: Users, tone: 'blue', note: 'Owners + buyers' },
        { label: 'Owners', value: properties.length, icon: Building2, tone: 'emerald', note: `${stats.availableProperties || 0} available` },
        { label: 'Users', value: users.length, icon: UserCheck, tone: 'purple', note: `${propertyExecutives.length} executives in listings` },
        { label: 'Active Pipeline', value: pipeline.length, icon: Workflow, tone: 'orange', note: 'Leads + properties' },
      ],
      communication: [
        { label: 'Action Queue', value: communicationQueue.length, icon: Phone, tone: 'purple', note: 'Call/email tasks' },
        { label: 'WhatsApp Contacts', value: stats.whatsappContacts || 0, icon: MessageCircle, tone: 'emerald', note: `${stats.unreadMessages || 0} unread` },
        { label: 'Email Ready', value: emailReady, icon: Mail, tone: 'blue', note: 'Can send follow-up' },
        { label: 'Review Calls', value: stats.reviewProperties || 0, icon: Bell, tone: 'rose', note: 'Owner verification' },
      ],
      notifications: [
        { label: 'Live Alerts', value: notifications.length, icon: Bell, tone: 'rose', note: 'Backend generated' },
        { label: 'Unread WhatsApp', value: stats.unreadMessages || 0, icon: MessageCircle, tone: 'emerald', note: 'Inbox count' },
        { label: 'Review Listings', value: stats.reviewProperties || 0, icon: Building2, tone: 'orange', note: 'Need action' },
        { label: 'Priority Leads', value: highPriority, icon: Target, tone: 'blue', note: 'Hot/high' },
      ],
      reports: [
        { label: 'Portfolio Value', value: formatCurrency(stats.totalValue || 0), icon: PieChart, tone: 'emerald', note: `${stats.properties || 0} listings` },
        { label: 'Available Stock', value: stats.availableProperties || 0, icon: Building2, tone: 'blue', note: 'Ready to publish/sell' },
        { label: 'Conversion', value: `${stats.conversionRate || 0}%`, icon: TrendingUp, tone: 'orange', note: 'Sold/listed' },
        { label: 'Reports Ready', value: reports.length, icon: FileText, tone: 'slate', note: 'JSON export enabled' },
      ],
      administrator: [
        { label: 'Admin Users', value: users.length, icon: ShieldCheck, tone: 'slate', note: 'Real accounts' },
        { label: 'Executives', value: propertyExecutives.length, icon: UserCheck, tone: 'blue', note: 'From listings' },
        { label: 'Data Sources', value: 5, icon: Database, tone: 'emerald', note: 'Properties, leads, CMS, users, WA' },
        { label: 'Security Status', value: 'Live', icon: Lock, tone: 'orange', note: 'Token protected routes' },
      ],
      settings: [
        { label: 'Platform Mode', value: settings.maintenanceMode ? 'Maintenance' : 'Live', icon: ServerCog, tone: settings.maintenanceMode ? 'rose' : 'emerald', note: settings.maintenanceMode ? 'Public APIs paused' : 'Public APIs active' },
        { label: 'Data Rows', value: (stats.properties || 0) + (stats.contacts || 0) + (stats.users || 0), icon: Database, tone: 'blue', note: 'Backend records' },
        { label: 'Session Timeout', value: `${settings.sessionTimeoutMinutes}m`, icon: Clock3, tone: 'orange', note: settings.timezone },
        { label: 'Access Mode', value: 'Admin', icon: KeyRound, tone: 'slate', note: `${users.length} users protected` },
      ],
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {(modules[module] || modules.leads).map((card) => <FieldStat key={card.label} {...card} />)}
      </div>
    )
  }

  const renderLeads = () => {
    const stageCounts = leadStatuses.map((status) => ({
      ...status,
      count: leads.filter((lead) => (lead.stage || 'new') === status.value).length,
    }))

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          {stageCounts.map((status) => (
            <div key={status.value} className="group rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/60">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-orange-500">{status.label}</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{status.count}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_0.42fr]">
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-100/70">
                <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 font-black text-white transition-transform duration-300 group-hover:scale-105">{initials(lead.name)}</div>
                      <div className="min-w-0">
                        <h3 className="truncate font-black text-slate-950">{lead.name}</h3>
                        <p className="truncate text-xs font-semibold text-slate-500">{lead.interest}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${priorityClasses[lead.priority] || priorityClasses.new}`}>{lead.priority}</span>
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${leadStatusClasses[lead.stage] || leadStatusClasses.new}`}>{leadStatuses.find((item) => item.value === lead.stage)?.label || 'New'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3 transition-colors group-hover:bg-orange-50">
                      <p className="text-[10px] font-black uppercase text-slate-400">Budget</p>
                      <p className="mt-1 truncate text-sm font-black text-slate-950">{lead.budget || 'Pending'}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 transition-colors group-hover:bg-emerald-50">
                      <p className="text-[10px] font-black uppercase text-slate-400">Lead Score</p>
                      <p className="mt-1 text-sm font-black text-orange-600">{lead.score}/100</p>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-emerald-500" style={{ width: `${Math.max(8, Math.min(lead.score || 0, 100))}%` }} />
                  </div>

                  <div className="mt-4 space-y-2 text-xs font-semibold text-slate-500">
                    <p className="line-clamp-2">{lead.notes || 'No message added.'}</p>
                    <p className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-400" /> {lead.location || 'Location pending'}</p>
                    <p className="flex items-center gap-1.5"><CalendarClock size={13} className="text-slate-400" /> Last contact: {lead.lastContact || 'Not contacted'}</p>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
                    <select
                      value={lead.stage || 'new'}
                      disabled={leadSavingId === lead.id}
                      onChange={(event) => updateLead(lead, { status: event.target.value })}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 outline-none transition-all hover:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
                    >
                      {leadStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                    </select>
                    <button
                      onClick={() => markLeadContacted(lead)}
                      disabled={leadSavingId === lead.id}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition-all hover:bg-[#E6761D] hover:shadow-lg hover:shadow-orange-200 disabled:opacity-60"
                    >
                      {leadSavingId === lead.id ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Followed Up
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {lead.phone && <a onClick={() => markLeadContacted(lead)} href={`tel:${lead.phone}`} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:text-white"><Phone size={14} /> Call</a>}
                    {lead.email && <a onClick={() => markLeadContacted(lead)} href={`mailto:${lead.email}`} className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition-all hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white"><Mail size={14} /> Email</a>}
                    {lead.phone && <a onClick={() => markLeadContacted(lead)} href={`https://wa.me/${cleanPhone(lead.phone)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-green-50 px-3 py-2 text-xs font-black text-green-700 transition-all hover:-translate-y-0.5 hover:bg-green-600 hover:text-white"><MessageCircle size={14} /> WhatsApp</a>}
                  </div>
                </div>
              </div>
            ))}
            {filteredLeads.length === 0 && <div className="lg:col-span-2"><EmptyState label="No real leads found. New contact form enquiries will appear here." /></div>}
          </section>

          <aside className="space-y-5">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
              <Target className="text-orange-300" size={25} />
              <h2 className="mt-4 text-xl font-black">Lead Playbook</h2>
              <div className="mt-5 space-y-3">
                {[
                  'Hot leads: call first, WhatsApp second, then assign site visit.',
                  'Qualified leads should have budget, location and timeline confirmed.',
                  'Closed/lost status is saved to backend contact records.',
                ].map((item) => (
                  <div key={item} className="rounded-2xl bg-white/8 p-3 text-sm font-bold leading-6 text-white/80 ring-1 ring-white/10">{item}</div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">Quality Mix</h2>
              <div className="mt-5 space-y-5">
                <ProgressBar label="Hot leads" value={leads.filter((lead) => lead.priority === 'hot').length} max={Math.max(leads.length, 1)} tone="bg-red-500" />
                <ProgressBar label="Contactable" value={leads.filter((lead) => lead.phone || lead.email).length} max={Math.max(leads.length, 1)} tone="bg-emerald-500" />
                <ProgressBar label="Followed up" value={leads.filter((lead) => lead.stage && lead.stage !== 'new').length} max={Math.max(leads.length, 1)} tone="bg-blue-500" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    )
  }

  const renderCrm = () => {
    const relationships = crmIntel.relationships || crmRelationships
    const filtered = relationships.filter((item) => matchesText(q, [item.name, item.headline, item.value, item.owner, item.nextAction, item.kind]))

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {(crmIntel.segments || []).map((segment) => (
            <div key={segment.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">{segment.label}</p>
              <p className="mt-3 text-3xl font-black text-slate-950">{segment.count}</p>
              <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{segment.description}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-xl font-black text-slate-950">Relationship Intelligence</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Buyers and owners with next action, owner and health score.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
              {filtered.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 font-black text-white">{initials(item.name)}</div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.kind || item.type}</p>
                        <h3 className="truncate font-black text-slate-950">{item.name}</h3>
                        <p className="truncate text-xs font-semibold text-slate-500">{item.headline || item.subtitle}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-600">{item.health || item.score || 0}/100</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-[10px] font-black uppercase text-slate-400">Value</p>
                      <p className="mt-1 truncate font-black text-slate-900">{item.value}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-[10px] font-black uppercase text-slate-400">Owner</p>
                      <p className="mt-1 truncate font-black text-slate-900">{item.owner || 'Unassigned'}</p>
                    </div>
                  </div>
                  <p className="mt-4 rounded-2xl bg-orange-50 px-3 py-2 text-xs font-black text-orange-700">{item.nextAction || item.status}</p>
                  <div className="mt-4 flex gap-2">
                    {item.phone && <a href={`tel:${item.phone}`} className="rounded-xl bg-emerald-50 p-2 text-emerald-700"><Phone size={15} /></a>}
                    {item.email && <a href={`mailto:${item.email}`} className="rounded-xl bg-blue-50 p-2 text-blue-700"><Mail size={15} /></a>}
                    {item.phone && <a href={`https://wa.me/${cleanPhone(item.phone)}`} target="_blank" rel="noreferrer" className="rounded-xl bg-green-50 p-2 text-green-700"><MessageCircle size={15} /></a>}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="lg:col-span-2"><EmptyState label="No CRM relationships found from current backend data." /></div>}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
              <Activity className="text-orange-300" size={24} />
              <h3 className="mt-4 text-xl font-black">CRM Operating Rhythm</h3>
              <div className="mt-5 space-y-3">
                {[
                  `${contactableLeads.length} leads can be contacted immediately`,
                  `${stats.reviewProperties || 0} owners need listing verification`,
                  `${propertyExecutives.length || users.length} team owners visible in CRM`,
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/8 p-3 text-sm font-bold">
                    <CheckCircle2 size={16} className="text-emerald-300" /> {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-950">Health Mix</h3>
              <div className="mt-5 space-y-5">
                <ProgressBar label="Hot buyers" value={leads.filter((lead) => lead.priority === 'hot').length} max={Math.max(leads.length, 1)} tone="bg-red-500" />
                <ProgressBar label="Contactable records" value={filtered.filter((item) => item.phone || item.email).length} max={Math.max(filtered.length, 1)} tone="bg-emerald-500" />
                <ProgressBar label="Review inventory" value={stats.reviewProperties || 0} max={Math.max(stats.properties || 0, 1)} tone="bg-orange-500" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    )
  }

  const renderCommunication = () => {
    const queue = (communicationIntel.queue || communicationQueue).filter((item) => matchesText(q, [item.title, item.name, item.subtitle, item.subject, item.context, item.channel, item.reason, item.phone, item.email]))
    const contactableCount = queue.filter((item) => item.phone || item.email).length
    const channelTotal = Math.max(...(communicationIntel.channels || []).map((item) => item.count || 0), 1)

    return (
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 text-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.48fr]">
            <div className="p-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-purple-200">
                <Radio size={13} /> Live Communication Desk
              </div>
              <h2 className="mt-5 text-3xl font-black">SLA command center</h2>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/65">
                Calls, WhatsApp and email actions stay connected to the same customer and listing records.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: 'Visible Queue', value: queue.length },
                  { label: 'Contactable', value: contactableCount },
                  { label: 'WhatsApp Threads', value: filteredWhatsapp.length },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl bg-white/8 p-4 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-white/12 hover:ring-purple-300/40">
                    <p className="text-2xl font-black">{item.value}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-white/50">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-white/10 bg-white/5 p-7 lg:border-l lg:border-t-0">
              <h3 className="font-black">Channel Load</h3>
              <div className="mt-5 space-y-4">
                {(communicationIntel.channels || []).map((channel) => (
                  <div key={channel.label}>
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="text-sm font-black">{channel.label}</span>
                      <span className="text-xs font-black text-white/50">{channel.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-purple-300" style={{ width: `${Math.max(8, ((channel.count || 0) / channelTotal) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { label: 'Immediate SLA', value: communicationIntel.sla?.immediate || 0, icon: AlertTriangle, tone: 'bg-red-50 text-red-700' },
            { label: 'Today Queue', value: communicationIntel.sla?.today || queue.length, icon: Phone, tone: 'bg-emerald-50 text-emerald-700' },
            { label: 'Review Calls', value: communicationIntel.sla?.review || 0, icon: Bell, tone: 'bg-orange-50 text-orange-700' },
          ].map((item) => (
            <div key={item.label} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 ${item.tone}`}><item.icon size={20} /></div>
              <p className="mt-4 text-3xl font-black text-slate-950">{item.value}</p>
              <p className="text-sm font-black text-slate-600">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
            <div className="border-b border-slate-100 p-6">
              <h2 className="text-xl font-black text-slate-950">Contact Center Queue</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Prioritized by lead score, review status and available contact channel.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {queue.map((item) => {
                const title = item.title || item.name
                const subtitle = item.subtitle || item.subject
                return (
                  <div key={item.id} className="p-5 transition-all duration-300 hover:bg-purple-50/40">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black text-slate-950">{title}</h3>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${priorityClasses[item.priority] || priorityClasses.medium}`}>{item.priority}</span>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>
                        <p className="mt-1 text-xs font-bold text-slate-400">{item.channel} · {item.reason || item.context}</p>
                      </div>
                      <div className="flex gap-2">
                        {item.phone && <a href={`tel:${item.phone}`} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700"><Phone size={14} /> Call</a>}
                        {item.email && <a href={`mailto:${item.email}`} className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700"><Mail size={14} /> Email</a>}
                        {item.phone && <a href={`https://wa.me/${cleanPhone(item.phone)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-green-50 px-3 py-2 text-xs font-black text-green-700"><MessageCircle size={14} /> WA</a>}
                      </div>
                    </div>
                  </div>
                )
              })}
              {queue.length === 0 && <div className="p-6"><EmptyState label="No contactable communication tasks from current data." /></div>}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-950 p-6 text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <h2 className="text-xl font-black">Channel Readiness</h2>
              <div className="mt-5 grid grid-cols-1 gap-3">
                {(communicationIntel.channels || []).map((channel) => (
                  <div key={channel.label} className="flex items-center justify-between rounded-2xl bg-white/8 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white/12">
                    <div>
                      <p className="font-black">{channel.label}</p>
                      <p className="text-xs font-semibold text-white/50">{channel.status}</p>
                    </div>
                    <span className="rounded-2xl bg-white px-3 py-1 text-sm font-black text-slate-950">{channel.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl">
              <h2 className="text-xl font-black text-slate-950">WhatsApp Inbox</h2>
              <div className="mt-5 space-y-3">
                {filteredWhatsapp.map((contact) => (
                  <div key={contact.id || contact.phone_number} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:bg-white hover:shadow-lg">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-black text-slate-900">{contact.name || contact.phone_number}</p>
                        <p className="truncate text-xs font-semibold text-slate-500">{contact.last_message || 'Conversation ready'}</p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-black text-slate-600">{contact.unread_count || 0}</span>
                    </div>
                  </div>
                ))}
                {filteredWhatsapp.length === 0 && <EmptyState label="No WhatsApp CRM conversations found." />}
              </div>
            </div>
          </aside>
        </div>
      </div>
    )
  }

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {(notificationIntel.summary || []).map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">{item.label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{item.count}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.75fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">Alert Triage</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Real alerts generated from leads, listings, WhatsApp and system state.</p>
              </div>
              <button onClick={markAllNotificationsRead} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition-all hover:bg-[#E6761D] hover:shadow-lg hover:shadow-orange-200">
                <CheckCircle2 size={14} /> Mark All Read
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((item) => (
              <div key={item.id} className={`p-5 transition-all hover:bg-slate-50 ${item.unread ? 'bg-orange-50/35' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">{item.category} · {item.time}</p>
                      {item.unread && <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-black uppercase text-orange-700">Unread</span>}
                    </div>
                    <h3 className="mt-2 font-black text-slate-950">{item.title}</h3>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{item.desc}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.unread && (
                        <button onClick={() => markNotificationRead(item.id)} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:text-white">
                          <CheckCircle2 size={14} /> Read
                        </button>
                      )}
                      <button onClick={() => dismissNotification(item.id)} className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition-all hover:-translate-y-0.5 hover:bg-red-600 hover:text-white">
                        <Trash2 size={14} /> Dismiss
                      </button>
                      {item.type === 'lead' && <a href="/leads" className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition-all hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white"><Target size={14} /> Open Leads</a>}
                    </div>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${priorityClasses[item.priority] || priorityClasses.new}`}>{item.priority}</span>
                </div>
              </div>
            ))}
            {filteredNotifications.length === 0 && <div className="p-6"><EmptyState label="No live notifications yet." /></div>}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <Bell className="text-orange-300" size={25} />
            <h2 className="mt-4 text-xl font-black">Live Alert Sources</h2>
            <div className="mt-5 space-y-3">
              {[
                { label: 'Lead alerts', value: notifications.filter((item) => item.category === 'Leads').length },
                { label: 'Listing review alerts', value: notifications.filter((item) => item.category === 'Listings').length },
                { label: 'WhatsApp alerts', value: notifications.filter((item) => item.category === 'WhatsApp').length },
                { label: 'System alerts', value: notifications.filter((item) => item.category === 'System').length },
              ].map((source) => (
                <div key={source.label} className="flex items-center justify-between rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                  <p className="font-black">{source.label}</p>
                  <span className="rounded-2xl bg-white px-3 py-1 text-sm font-black text-slate-950">{source.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-950">Notification State</h3>
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="text-sm font-black text-slate-700">Unread visible</span>
                <span className="text-sm font-black text-orange-600">{notifications.filter((item) => item.unread).length}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="text-sm font-black text-slate-700">Dismissed saved</span>
                <span className="text-sm font-black text-slate-950">{dismissedNotifIds.length}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )

  const renderReports = () => {
    const maxStatus = Math.max(...statusBreakdown.map((item) => item.value), 1)
    const maxLocation = Math.max(...localityBreakdown.map((item) => item.value), 1)
    const reportSummary = [
      { label: 'Reports Ready', value: reports.filter((report) => report.status === 'ready').length, icon: FileText, tone: 'emerald' },
      { label: 'Inventory Rows', value: stats.properties || 0, icon: Building2, tone: 'blue' },
      { label: 'Lead Records', value: stats.contacts || 0, icon: Target, tone: 'orange' },
      { label: 'Payments', value: stats.payments || payments.length, icon: Database, tone: 'slate' },
    ]

    return (
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-7 shadow-sm">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-700">
                <BarChart3 size={13} /> Executive Reporting Studio
              </div>
              <h2 className="mt-5 text-3xl font-black text-slate-950">Downloadable business intelligence</h2>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                Reports, inventory mix and locality insights are generated from the current backend data.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {reportSummary.map((item) => (
                <div key={item.label} className="group rounded-3xl border border-white bg-white/80 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-2xl font-black text-slate-950">{item.value}</p>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500">{item.label}</p>
                    </div>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${fieldIconClasses[item.tone]}`}>
                      <item.icon size={19} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div key={report.id} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100">
              <div className="flex items-start justify-between gap-4">
                <FileText className="text-emerald-600 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3" size={24} />
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${priorityClasses[report.status] || priorityClasses.ready}`}>{report.status}</span>
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900">{report.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{report.description}</p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-xl font-black text-slate-900">{report.value}</span>
                <div className="flex gap-2">
                  <button onClick={() => downloadReportCsv(report)} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-200">
                    CSV
                  </button>
                  <button onClick={() => downloadReport(report)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-[#E6761D]">
                    <Download size={14} /> JSON
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Payment & Subscription History</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Razorpay links and subscription purchases created from the client.
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Created Value</p>
              <p className="text-lg font-black text-emerald-900">{formatCurrency(stats.paymentRevenue || 0)}</p>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
            <div className="hidden grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_1fr] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 md:grid">
              <span>Plan</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Source</span>
              <span>Created</span>
            </div>
            <div className="divide-y divide-slate-100">
              {payments.slice(0, 12).map((payment) => (
                <div key={payment.id} className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_1fr] md:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">{payment.label || payment.plan || 'Subscription'}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-500">{payment.property_code || payment.provider_payment_link_id || payment.provider_order_id || 'General payment'}</p>
                  </div>
                  <p className="text-sm font-black text-slate-900">{formatCurrency(payment.amount || 0)}</p>
                  <span className="w-max rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase text-blue-700">{payment.status || 'created'}</span>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{payment.source || payment.provider || 'client'}</p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-500">{formatDate(payment.created_at)}</p>
                    {payment.payment_url && (
                      <a href={payment.payment_url} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-[#E6761D]">
                        Open
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {payments.length === 0 && <div className="p-8"><EmptyState label="No payment records yet. New Razorpay links will appear here." /></div>}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
            <h2 className="text-xl font-black text-slate-900">Inventory Status</h2>
            <div className="mt-6 space-y-5">
              {statusBreakdown.map((item) => <ProgressBar key={item.label} label={item.label} value={item.value} max={maxStatus} tone="bg-blue-500" />)}
              {statusBreakdown.length === 0 && <EmptyState label="No property status data available." />}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl">
            <h2 className="text-xl font-black text-slate-900">Top Localities</h2>
            <div className="mt-6 space-y-5">
              {localityBreakdown.map((item) => <ProgressBar key={item.label} label={item.label} value={item.value} max={maxLocation} tone="bg-orange-500" />)}
              {localityBreakdown.length === 0 && <EmptyState label="No locality data available." />}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            { label: 'Weekly Owner Summary', desc: `${settings.weeklyReports ? 'Enabled' : 'Disabled'} for ${settings.supportEmail}`, icon: Mail },
            { label: 'Review Queue Report', desc: `${stats.reviewProperties || 0} listings currently need admin review`, icon: Eye },
            { label: 'Backup Retention', desc: `${settings.backupRetentionDays} days configured for exports`, icon: HardDrive },
          ].map((item) => (
            <div key={item.label} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
              <item.icon size={22} className="text-slate-700 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" />
              <h3 className="mt-4 font-black text-slate-900">{item.label}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderAdministrator = () => (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.7fr] gap-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Administrators & Users</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Accounts are loaded from the backend users table.</p>
          </div>
          <button onClick={() => setInviteOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-[#E6761D]">
            <UserPlus size={17} /> Add Administrator
          </button>
        </div>

        {inviteMessage && <p className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600">{inviteMessage}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black">{initials(user.name)}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-black text-slate-900">{user.name}</h3>
                  <p className="truncate text-xs font-semibold text-slate-500">{user.email}</p>
                </div>
                <button onClick={() => deleteUser(user)} className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100" title="Delete account">
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${user.role === 'admin' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>{user.role}</span>
                <span className="text-xs font-bold text-slate-400">Joined {formatDate(user.created_at)}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => changeUserRole(user)} className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-[#E6761D]">
                  Make {user.role === 'admin' ? 'User' : 'Admin'}
                </button>
                <a href={`mailto:${user.email}`} className="rounded-2xl border border-slate-200 px-3 py-2 text-center text-xs font-black text-slate-700 hover:bg-slate-50">
                  Email
                </a>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && <div className="lg:col-span-2"><EmptyState label="No backend users found." /></div>}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">Access & Ownership</h2>
        <div className="mt-5 space-y-4">
          {[
            { label: 'Protected admin routes', value: 'Enabled', icon: Lock },
            { label: 'Property executives in data', value: propertyExecutives.length, icon: UserCheck },
            { label: 'Backend workspace endpoint', value: '/api/admin/workspace', icon: Database },
            { label: 'CMS records', value: `${blogs.length} blogs`, icon: FileText },
            { label: 'Public registration', value: settings.allowRegistration ? 'Allowed' : 'Closed', icon: ShieldCheck },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <item.icon className="text-slate-700" size={18} />
                <span className="text-sm font-black text-slate-700">{item.label}</span>
              </div>
              <span className="text-sm font-black text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <div className={`overflow-hidden rounded-[2rem] border shadow-sm ${settingsDraft.maintenanceMode ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.85fr]">
            <div className="p-6 lg:p-8">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white ${settingsDraft.maintenanceMode ? 'bg-red-600' : 'bg-emerald-600'}`}>
                  <ServerCog size={23} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Platform Control</p>
                  <h2 className="text-2xl font-black text-slate-900">{settingsDraft.maintenanceMode ? 'Maintenance Mode On' : 'Platform Live'}</h2>
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                Maintenance toggle is persisted in the backend. When it is on, admin and auth APIs stay available while public APIs return maintenance response.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => toggleSetting('maintenanceMode', !settingsDraft.maintenanceMode)}
                  disabled={savingSettings}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white shadow-sm ${settingsDraft.maintenanceMode ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  <Radio size={17} /> {settingsDraft.maintenanceMode ? 'Turn Maintenance Off' : 'Turn Maintenance On'}
                </button>
                {settingsSaved && <span className="inline-flex items-center rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-700">{settingsSaved}</span>}
              </div>
            </div>
            <div className="border-t border-white/80 bg-white/70 p-6 lg:border-l lg:border-t-0">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Maintenance Message</label>
              <textarea
                rows={4}
                value={settingsDraft.maintenanceMessage}
                onChange={(event) => patchSettingsDraft({ maintenanceMessage: event.target.value })}
                className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#E6761D] focus:ring-4 focus:ring-orange-100"
              />
              <button onClick={() => saveSettings()} disabled={savingSettings} className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-[#E6761D] disabled:opacity-60">
                <Save size={16} /> Save Message
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.75fr] gap-6">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Company Profile</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Displayed across support, reports and operational metadata.</p>
                </div>
                <button onClick={() => saveSettings()} disabled={savingSettings} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-[#E6761D] disabled:opacity-60">
                  <Save size={16} /> Save
                </button>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['companyName', 'Company Name', Building2],
                  ['supportEmail', 'Support Email', Mail],
                  ['supportPhone', 'Support Phone', Phone],
                  ['timezone', 'Timezone', Globe2],
                ].map(([key, label, InputIcon]) => (
                  <label key={key} className="block">
                    <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400"><InputIcon size={14} /> {label}</span>
                    <input
                      value={settingsDraft[key] || ''}
                      onChange={(event) => patchSettingsDraft({ [key]: event.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-[#E6761D] focus:bg-white focus:ring-4 focus:ring-orange-100"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SwitchRow label="Auto Assign Leads" desc="New enquiries enter the active CRM queue automatically." icon={Target} checked={settingsDraft.autoAssignLeads} disabled={savingSettings} onChange={(value) => toggleSetting('autoAssignLeads', value)} />
              <SwitchRow label="Approval Before Publish" desc="Listings stay in admin review until approved." icon={SlidersHorizontal} checked={settingsDraft.publishApprovalRequired} disabled={savingSettings} onChange={(value) => toggleSetting('publishApprovalRequired', value)} />
              <SwitchRow label="WhatsApp CRM" desc="Enable WhatsApp contacts and unread queue in admin." icon={Smartphone} checked={settingsDraft.whatsappEnabled} disabled={savingSettings} onChange={(value) => toggleSetting('whatsappEnabled', value)} />
              <SwitchRow label="Email Notifications" desc="Send operational alerts to support/admin mailbox." icon={Bell} checked={settingsDraft.emailNotifications} disabled={savingSettings} onChange={(value) => toggleSetting('emailNotifications', value)} />
              <SwitchRow label="Weekly Reports" desc="Reports center shows scheduled weekly summaries." icon={BarChart3} checked={settingsDraft.weeklyReports} disabled={savingSettings} onChange={(value) => toggleSetting('weeklyReports', value)} />
              <SwitchRow label="Public Registration" desc="Allow new user registration from auth screens." icon={UserCheck} checked={settingsDraft.allowRegistration} disabled={savingSettings} onChange={(value) => toggleSetting('allowRegistration', value)} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
              <Database className="text-orange-300" size={26} />
              <h2 className="mt-4 text-xl font-black">Data Health Checklist</h2>
              <div className="mt-6 space-y-3">
                {[
                  { label: 'Properties synced', ok: stats.properties >= 0 },
                  { label: 'Lead source connected', ok: stats.contacts >= 0 },
                  { label: 'User payload sanitized', ok: users.every((user) => !user.password) },
                  { label: 'WhatsApp CRM readable', ok: Array.isArray(whatsappContacts) },
                  { label: 'Report export available', ok: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white/8 p-3">
                    <span className="text-sm font-bold">{item.label}</span>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${item.ok ? 'bg-emerald-400/15 text-emerald-200' : 'bg-red-400/15 text-red-200'}`}>
                      {item.ok ? 'OK' : 'Check'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">Operational Limits</h2>
              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400"><Clock3 size={14} /> Session Timeout</span>
                  <input type="number" min="10" max="240" value={settingsDraft.sessionTimeoutMinutes} onChange={(event) => patchSettingsDraft({ sessionTimeoutMinutes: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-[#E6761D] focus:bg-white focus:ring-4 focus:ring-orange-100" />
                </label>
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400"><HardDrive size={14} /> Backup Retention Days</span>
                  <input type="number" min="7" max="365" value={settingsDraft.backupRetentionDays} onChange={(event) => patchSettingsDraft({ backupRetentionDays: event.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-[#E6761D] focus:bg-white focus:ring-4 focus:ring-orange-100" />
                </label>
                <button onClick={() => saveSettings()} disabled={savingSettings} className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-[#E6761D] disabled:opacity-60">
                  {savingSettings ? 'Saving...' : 'Save Operational Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderModule = () => {
    if (module === 'leads') return renderLeads()
    if (module === 'crm') return renderCrm()
    if (module === 'communication') return renderCommunication()
    if (module === 'notifications') return renderNotifications()
    if (module === 'reports') return renderReports()
    if (module === 'administrator') return renderAdministrator()
    if (module === 'settings') return renderSettings()
    return renderLeads()
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur-xl sticky top-0 z-30">
        <div className="px-6 lg:px-10 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center ${accentClasses[meta.accent]}`}>
                <Icon size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">{meta.title}</h1>
                <p className="text-sm font-semibold text-slate-500">{meta.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`Search ${meta.title.toLowerCase()}...`}
                  className="w-full md:w-80 rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:border-[#E6761D] focus:ring-4 focus:ring-orange-100"
                />
              </div>
              <button onClick={loadWorkspace} className="rounded-2xl bg-slate-900 px-4 py-3 text-white hover:bg-[#E6761D]">
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-10 py-8 space-y-7">
        {renderModuleStats()}
        {renderModule()}
      </div>

      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <form onSubmit={createAdminUser} className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
                  <UserPlus size={23} />
                </div>
                <h2 className="mt-4 text-2xl font-black text-slate-900">Create Administrator</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Creates a real backend user account.</p>
              </div>
              <button type="button" onClick={() => setInviteOpen(false)} className="rounded-2xl bg-slate-100 p-3 text-slate-600 hover:bg-slate-200">
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <input required value={inviteForm.name} onChange={(event) => setInviteForm((current) => ({ ...current, name: event.target.value }))} placeholder="Full name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-[#E6761D] focus:bg-white focus:ring-4 focus:ring-orange-100" />
              <input required type="email" value={inviteForm.email} onChange={(event) => setInviteForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email address" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-[#E6761D] focus:bg-white focus:ring-4 focus:ring-orange-100" />
              <input required type="password" minLength={6} value={inviteForm.password} onChange={(event) => setInviteForm((current) => ({ ...current, password: event.target.value }))} placeholder="Temporary password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-[#E6761D] focus:bg-white focus:ring-4 focus:ring-orange-100" />
              <select value={inviteForm.role} onChange={(event) => setInviteForm((current) => ({ ...current, role: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-[#E6761D] focus:bg-white focus:ring-4 focus:ring-orange-100">
                <option value="admin">Administrator</option>
                <option value="user">User</option>
              </select>
            </div>

            <div className="mt-6 flex gap-3">
              <button type="submit" disabled={inviteSaving} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-[#E6761D] disabled:opacity-60">
                {inviteSaving ? <RefreshCw size={17} className="animate-spin" /> : <Plus size={17} />} Create Account
              </button>
              <button type="button" onClick={() => setInviteOpen(false)} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default WorkspacePage
