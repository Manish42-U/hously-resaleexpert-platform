import { useEffect, useMemo, useState } from 'react'
import Properties from './Properties'
import Blogs from './Blogs'
import { FileText, Home, BookOpen, Settings, LayoutDashboard, Shield, Search, Loader2, Save, AlertCircle, Trash2, ListPlus, Type, Link as LinkIcon, Hash, ToggleLeft, ChevronRight, Image, Eye, Smartphone, Palette, Phone, Award, Globe2, RefreshCw } from 'lucide-react'
import { adminService, cmsService, getErrorMessage, unwrap, uploadService } from '../services/api'

const pageMeta = {
  home: { label: 'Home', desc: 'Hero, featured copy, sell section', icon: Home, tone: 'from-orange-500 to-red-500' },
  footer: { label: 'Footer & Brand', desc: 'Logo, links, locations, social', icon: Globe2, tone: 'from-slate-800 to-slate-950' },
  about: { label: 'About', desc: 'Mission, values, team, impact', icon: Award, tone: 'from-blue-500 to-indigo-600' },
  contact: { label: 'Contact', desc: 'Phones, office, FAQs, WhatsApp', icon: Phone, tone: 'from-emerald-500 to-teal-600' },
  services: { label: 'Services', desc: 'Core services, pricing, FAQs', icon: Shield, tone: 'from-purple-500 to-pink-600' },
  'market-intelligence': { label: 'Market', desc: 'Plans, stats, market cards', icon: Palette, tone: 'from-amber-500 to-orange-600' },
}

const priorityKeys = {
  home: ['heroImage', 'heroTitle', 'heroSubtitle', 'featuredTitle', 'featuredSubtitle', 'sellTitle', 'sellSubtitle', 'sellImage', 'soldValue', 'soldLabel'],
  footer: ['logoUrl', 'coloredLogoUrl', 'faviconUrl', 'trustBadges', 'quickLinks', 'services', 'contact', 'popularLocations', 'social', 'copyright'],
  about: ['heroTitle', 'heroSubtitle', 'heroStats', 'missionTitle', 'missionText', 'missionPoints', 'missionImage', 'impactStats', 'values', 'team'],
  contact: ['heroTitle', 'heroSubtitle', 'stats', 'phones', 'email', 'urgentEmail', 'whatsapp', 'addressLines', 'officeLocations', 'faqs'],
  services: ['heroTitle', 'heroSubtitle', 'ctaText', 'coreServices', 'additionalServices', 'testimonials', 'faqs'],
  'market-intelligence': ['stats', 'plans', 'whyItems'],
}

const titleCase = (value = '') => String(value)
  .replace(/([A-Z])/g, ' $1')
  .replace(/[-_]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/^./, (letter) => letter.toUpperCase())

const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value)

const cloneValue = (value) => {
  if (Array.isArray(value)) return value.map(cloneValue)
  if (isPlainObject(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneValue(item)]))
  return value
}

const emptyFromSample = (sample) => {
  if (Array.isArray(sample)) return []
  if (isPlainObject(sample)) return Object.fromEntries(Object.entries(sample).map(([key, value]) => [key, emptyFromSample(value)]))
  if (typeof sample === 'number') return 0
  if (typeof sample === 'boolean') return false
  return ''
}

const getAtPath = (source, path) => path.reduce((current, key) => current?.[key], source)

const setAtPath = (source, path, value) => {
  if (path.length === 0) return value
  const [head, ...rest] = path
  const next = Array.isArray(source) ? [...source] : { ...(source || {}) }
  next[head] = setAtPath(next[head], rest, value)
  return next
}

const removeAtPath = (source, path, index) => {
  const target = getAtPath(source, path) || []
  return setAtPath(source, path, target.filter((_, itemIndex) => itemIndex !== index))
}

const FieldIcon = ({ value, fieldKey }) => {
  if (typeof value === 'boolean') return <ToggleLeft size={14} />
  if (typeof value === 'number') return <Hash size={14} />
  if (String(fieldKey).toLowerCase().includes('url') || String(value).startsWith('http')) return <LinkIcon size={14} />
  return <Type size={14} />
}

const orderedEntries = (key, content) => {
  const order = priorityKeys[key] || Object.keys(content || {})
  const seen = new Set(order)
  return [
    ...order.filter((item) => Object.prototype.hasOwnProperty.call(content || {}, item)).map((item) => [item, content[item]]),
    ...Object.entries(content || {}).filter(([item]) => !seen.has(item)),
  ]
}

const contentStats = (value) => {
  const stats = { fields: 0, lists: 0, media: 0 }
  const walk = (item, key = '') => {
    if (Array.isArray(item)) {
      stats.lists += 1
      item.forEach((child) => walk(child, key))
      return
    }
    if (isPlainObject(item)) {
      Object.entries(item).forEach(([childKey, child]) => walk(child, childKey))
      return
    }
    stats.fields += 1
    if (String(key).toLowerCase().includes('image') || String(key).toLowerCase().includes('logo') || String(key).toLowerCase().includes('favicon') || isMediaUrl(item)) {
      stats.media += 1
    }
  }
  walk(value)
  return stats
}

const isMediaUrl = (value) => String(value || '').match(/\.(png|jpe?g|webp|gif|svg)(\?|$)/i) || String(value || '').includes('/image/upload/') || String(value || '').includes('/uploads/')

const resolveMediaUrl = (value) => {
  const url = String(value || '').trim()
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/uploads/')) return `https://resaleexpert.in${url}`
  return url
}

const collectMediaUrls = (value, key = '') => {
  const urls = []
  const walk = (item, itemKey = '') => {
    if (Array.isArray(item)) {
      item.forEach((child) => walk(child, itemKey))
      return
    }
    if (isPlainObject(item)) {
      Object.entries(item).forEach(([childKey, child]) => walk(child, childKey))
      return
    }
    const looksLikeMedia = String(itemKey).toLowerCase().includes('image') ||
      String(itemKey).toLowerCase().includes('logo') ||
      String(itemKey).toLowerCase().includes('favicon') ||
      isMediaUrl(item)
    if (looksLikeMedia && item) urls.push(resolveMediaUrl(item))
  }
  walk(value, key)
  return Array.from(new Set(urls.filter(Boolean)))
}

const getPreviewMedia = (sectionKey, content) => {
  const media = collectMediaUrls(content)
  const explicit = [
    content.heroImage,
    content.sellImage,
    content.missionImage,
    content.logoUrl,
    content.coloredLogoUrl,
    content.faviconUrl,
  ].map(resolveMediaUrl).filter(Boolean)

  const ordered = Array.from(new Set([...explicit, ...media]))
  const primary = sectionKey === 'footer'
    ? resolveMediaUrl(content.logoUrl || content.coloredLogoUrl || ordered[0])
    : ordered[0]

  return { primary, media: ordered }
}

const ClientPreview = ({ sectionKey, title, content }) => {
  const { primary: heroImage, media } = getPreviewMedia(sectionKey, content)
  const heroTitle = content.heroTitle || content.featuredTitle || content.missionTitle || title
  const heroSubtitle = content.heroSubtitle || content.featuredSubtitle || content.missionText || content.copyright || 'Client app content preview'
  const chips = [
    ...(content.trustBadges || []),
    ...(content.quickLinks || []),
    ...(content.missionPoints || []),
    ...(content.popularLocations || []),
  ].slice(0, 6)

  return (
    <div className="sticky top-28 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center gap-2">
          <Eye size={17} className="text-[#E6761D]" />
          <h3 className="font-black text-slate-950">Client Preview</h3>
        </div>
        <p className="mt-1 text-xs font-semibold text-slate-500">Approx preview of what this CMS block controls.</p>
      </div>
      <div className="bg-slate-950 p-4">
        <div className="overflow-hidden rounded-3xl bg-white">
          <div className="relative min-h-48 bg-slate-900">
            {heroImage ? (
              sectionKey === 'footer' ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
                  <img src={heroImage} alt="" className="max-h-28 max-w-[82%] object-contain drop-shadow-2xl" />
                </div>
              ) : (
                <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75" />
              )
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900" />
            )}
            <div className="relative z-10 flex min-h-48 flex-col justify-end p-5 text-white">
              <span className="mb-2 w-fit rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur">{sectionKey}</span>
              <h4 className="text-xl font-black leading-tight">{heroTitle}</h4>
              <p className="mt-2 line-clamp-3 text-xs font-semibold leading-5 text-white/80">{heroSubtitle}</p>
            </div>
          </div>
          <div className="p-4">
            {media.length > 0 && (
              <div className="mb-4 grid grid-cols-3 gap-2">
                {media.slice(0, 6).map((url, index) => (
                  <div key={`${url}-${index}`} className="flex h-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-950">
                    <img src={url} alt="" className="h-full w-full object-contain p-1" />
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {chips.length ? chips.map((chip) => (
                <span key={String(chip)} className="rounded-xl bg-orange-50 px-3 py-1.5 text-[10px] font-black text-orange-700">{String(chip)}</span>
              )) : (
                <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-500">Edit fields to update client content</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 p-4">
        <div className="rounded-2xl bg-slate-50 p-3 text-center">
          <Smartphone className="mx-auto text-slate-500" size={17} />
          <p className="mt-1 text-[10px] font-black uppercase text-slate-400">Mobile</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3 text-center">
          <Image className="mx-auto text-slate-500" size={17} />
          <p className="mt-1 text-[10px] font-black uppercase text-slate-400">Media</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3 text-center">
          <Save className="mx-auto text-slate-500" size={17} />
          <p className="mt-1 text-[10px] font-black uppercase text-slate-400">Live CMS</p>
        </div>
      </div>
    </div>
  )
}

const CmsField = ({ fieldKey, value, path, onChange, onRemove, canRemove, root, onUpload, uploadingPath }) => {
  const label = titleCase(fieldKey)
  const pathKey = path.join('.')

  if (Array.isArray(value)) {
    const sample = value[0] ?? ''
    const addItem = () => onChange(path, [...value, emptyFromSample(sample)])

    return (
      <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-white to-orange-50/35 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/60">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{value.length} item{value.length === 1 ? '' : 's'}</p>
          </div>
          <button onClick={addItem} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-3 py-2 text-xs font-black text-white transition-all hover:-translate-y-0.5 hover:bg-[#E6761D] hover:shadow-lg hover:shadow-orange-200">
            <ListPlus size={14} /> Add
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {value.map((item, index) => (
            <div key={`${path.join('.')}-${index}`} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-orange-100 hover:shadow-lg">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Item {index + 1}</span>
                <button onClick={() => onChange([], removeAtPath(root, path, index))} className="rounded-xl bg-red-50 p-2 text-red-600 transition-all hover:bg-red-600 hover:text-white">
                  <Trash2 size={14} />
                </button>
              </div>
              <CmsField fieldKey={`${fieldKey} ${index + 1}`} value={item} path={[...path, index]} onChange={onChange} root={root} onUpload={onUpload} uploadingPath={uploadingPath} />
            </div>
          ))}
          {value.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-bold text-slate-400">
              No items yet
            </div>
          )}
        </div>
      </div>
    )
  }

  if (isPlainObject(value)) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/60">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ChevronRight size={15} className="text-orange-500" />
            <p className="font-black text-slate-950">{label}</p>
          </div>
          {canRemove && (
            <button onClick={onRemove} className="rounded-xl bg-red-50 p-2 text-red-600 transition-all hover:bg-red-600 hover:text-white">
              <Trash2 size={14} />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
          {Object.entries(value).map(([key, item]) => (
            <CmsField key={[...path, key].join('.')} fieldKey={key} value={item} path={[...path, key]} onChange={onChange} root={root} onUpload={onUpload} uploadingPath={uploadingPath} />
          ))}
        </div>
      </div>
    )
  }

  if (typeof value === 'boolean') {
    return (
      <button onClick={() => onChange(path, !value)} className={`flex min-h-[76px] items-center justify-between rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${value ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
        <span>
          <span className="block text-xs font-black uppercase tracking-widest opacity-70">{label}</span>
          <span className="mt-1 block text-sm font-black">{value ? 'Enabled' : 'Disabled'}</span>
        </span>
        <span className={`relative h-7 w-12 rounded-full ${value ? 'bg-emerald-600' : 'bg-slate-300'}`}>
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
        </span>
      </button>
    )
  }

  const isLong = String(value || '').length > 90 || ['description', 'subtitle', 'text', 'content', 'message', 'copyright'].some((key) => String(fieldKey).toLowerCase().includes(key))
  const isColor = String(fieldKey).toLowerCase().includes('color')
  const isNumber = typeof value === 'number'
  const isImageUrl = String(fieldKey).toLowerCase().includes('image') || String(fieldKey).toLowerCase().includes('logo') || String(fieldKey).toLowerCase().includes('favicon') || isMediaUrl(value)
  const mediaValue = resolveMediaUrl(value)

  return (
    <div className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:bg-white hover:shadow-lg hover:shadow-orange-100/50">
      <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
        <FieldIcon value={value} fieldKey={fieldKey} /> {label}
      </span>
      {isImageUrl && value && (
        <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <img src={mediaValue} alt="" className="h-36 w-full object-contain bg-slate-950 p-2" />
        </div>
      )}
      {isImageUrl && (
        <div className="mb-3 flex flex-col gap-2 rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black text-orange-800">Upload from device</p>
            <p className="mt-0.5 text-[11px] font-semibold text-orange-700/75">PNG, JPG, WEBP, GIF or SVG upload hoke URL field me set ho jayega.</p>
          </div>
          <label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-black text-white shadow-sm transition-all ${uploadingPath === pathKey ? 'bg-slate-400' : 'bg-[#E6761D] hover:bg-orange-700'}`}>
            {uploadingPath === pathKey ? <Loader2 className="animate-spin" size={14} /> : <Image size={14} />}
            {uploadingPath === pathKey ? 'Uploading...' : 'Choose Image'}
            <input
              type="file"
              accept="image/*"
              disabled={uploadingPath === pathKey}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) onUpload(path, file)
                event.target.value = ''
              }}
            />
          </label>
        </div>
      )}
      {isColor ? (
        <div className="flex gap-3">
          <input type="color" value={value || '#E6761D'} onChange={(event) => onChange(path, event.target.value)} className="h-11 w-14 rounded-xl border border-slate-200 bg-white p-1" />
          <input value={value || ''} onChange={(event) => onChange(path, event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-[#E6761D] focus:ring-4 focus:ring-orange-100" />
        </div>
      ) : isLong ? (
        <textarea value={value || ''} rows={4} onChange={(event) => onChange(path, event.target.value)} className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-slate-800 outline-none focus:border-[#E6761D] focus:ring-4 focus:ring-orange-100" />
      ) : (
        <input type={isNumber ? 'number' : 'text'} value={value ?? ''} onChange={(event) => onChange(path, isNumber ? Number(event.target.value) : event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-[#E6761D] focus:ring-4 focus:ring-orange-100" />
      )}
    </div>
  )
}

const NumberSetting = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
    <input
      type="number"
      min="0"
      value={value ?? 0}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-900 outline-none transition-all focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.1)]"
    />
  </div>
)

const CMS = () => {
  const [activeTab, setActiveTab] = useState('properties')
  const [cmsRows, setCmsRows] = useState([])
  const [selectedKey, setSelectedKey] = useState('home')
  const [editorContent, setEditorContent] = useState({})
  const [editorTitle, setEditorTitle] = useState('')
  const [cmsLoading, setCmsLoading] = useState(false)
  const [cmsSaving, setCmsSaving] = useState(false)
  const [cmsError, setCmsError] = useState('')
  const [uploadingPath, setUploadingPath] = useState('')
  const [settingsDraft, setSettingsDraft] = useState(null)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)

  const selectedContent = useMemo(
    () => cmsRows.find((row) => row.content_key === selectedKey),
    [cmsRows, selectedKey],
  )
  const selectedMeta = pageMeta[selectedKey] || { label: selectedContent?.title || selectedKey, desc: 'Client CMS section', icon: FileText, tone: 'from-slate-700 to-slate-950' }
  const SelectedIcon = selectedMeta.icon

  const tabs = [
    { id: 'properties', label: 'Property Listings', icon: Home, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/30' },
    { id: 'blogs', label: 'Blog Posts', icon: BookOpen, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/30' },
    { id: 'pages', label: 'Static Pages', icon: FileText, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/30' },
    { id: 'settings', label: 'CMS Settings', icon: Settings, color: 'from-purple-500 to-pink-600', shadow: 'shadow-purple-500/30' },
  ]

  const fetchCmsRows = async () => {
    setCmsLoading(true)
    setCmsError('')
    try {
      const response = await cmsService.getAll()
      const rows = unwrap(response)
      setCmsRows(Array.isArray(rows) ? rows : [])
    } catch (error) {
      setCmsError(getErrorMessage(error))
    } finally {
      setCmsLoading(false)
    }
  }

  const fetchCmsSettings = async () => {
    setSettingsLoading(true)
    setCmsError('')
    try {
      const response = await adminService.getSettings()
      setSettingsDraft(unwrap(response))
    } catch (error) {
      setCmsError(getErrorMessage(error))
    } finally {
      setSettingsLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCmsRows()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCmsSettings()
  }, [])

  useEffect(() => {
    if (selectedContent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditorContent(cloneValue(selectedContent.content || {}))
      setEditorTitle(selectedContent.title || selectedContent.content_key || selectedKey)
    }
  }, [selectedContent, selectedKey])

  const handleFieldChange = (path, value) => {
    setEditorContent((current) => path.length === 0 ? value : setAtPath(current, path, value))
  }

  const handleCmsImageUpload = async (path, file) => {
    const pathKey = path.join('.')
    setUploadingPath(pathKey)
    setCmsError('')
    try {
      const response = await uploadService.uploadImage(file, `hously/cms/${selectedKey}`)
      const uploaded = unwrap(response)
      if (!uploaded?.url) throw new Error('Upload completed but image URL was not returned')
      handleFieldChange(path, uploaded.url)
    } catch (error) {
      setCmsError(getErrorMessage(error))
    } finally {
      setUploadingPath('')
    }
  }

  const handleSaveCms = async () => {
    setCmsSaving(true)
    setCmsError('')
    try {
      const response = await cmsService.update(selectedKey, {
        title: editorTitle || selectedContent?.title || selectedKey,
        content: editorContent,
      })
      const saved = unwrap(response)
      setCmsRows((current) => current.map((row) => (row.content_key === selectedKey ? saved : row)))
    } catch (error) {
      setCmsError(getErrorMessage(error))
    } finally {
      setCmsSaving(false)
    }
  }

  const updateSettingsDraft = (key, value) => {
    setSettingsDraft((current) => ({ ...(current || {}), [key]: value }))
  }

  const handleSaveCmsSettings = async () => {
    setSettingsSaving(true)
    setCmsError('')
    try {
      const response = await adminService.updateSettings(settingsDraft || {})
      setSettingsDraft(unwrap(response))
    } catch (error) {
      setCmsError(getErrorMessage(error))
    } finally {
      setSettingsSaving(false)
    }
  }

  const storagePercent = settingsDraft?.mediaStorageLimitGb
    ? Math.min(100, Math.round((Number(settingsDraft.mediaStorageUsedGb || 0) / Number(settingsDraft.mediaStorageLimitGb || 1)) * 100))
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 page-enter pb-12">
      {/* HEADER */}
      <div className="sticky top-0 z-30 glass-white border-b border-gray-200/60 pt-5">
        <div className="px-6 lg:px-8 mb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E6761D] to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <LayoutDashboard size={18} className="text-white" />
                </div>
                Content Management
              </h1>
              <p className="text-gray-500 text-sm mt-0.5 ml-12">Manage properties, blogs, and platform settings</p>
            </div>
            
            {/* Contextual Actions based on tab */}
            {activeTab !== 'settings' && (
              <div className="flex gap-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search content..." className="pl-9 pr-4 py-2 bg-gray-100 border-transparent rounded-xl text-sm focus:bg-white focus:border-[#E6761D] focus:shadow-[0_0_0_3px_rgba(230,118,29,0.1)] transition-all outline-none" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TABS */}
        <div className="px-6 lg:px-8 flex gap-2 overflow-x-auto scrollbar-custom">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all duration-300 rounded-t-2xl whitespace-nowrap overflow-hidden group
                  ${isActive ? 'text-gray-900 bg-white border-x border-t border-gray-200/60' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-transparent'}`}
              >
                {isActive && (
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${tab.color}`} />
                )}
                <div className={`p-1.5 rounded-lg transition-all ${isActive ? `bg-gradient-to-br ${tab.color} text-white shadow-md ${tab.shadow}` : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                  <tab.icon size={14} />
                </div>
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="p-6 lg:p-8 max-w-[1600px] mx-auto bg-white min-h-[calc(100vh-160px)] border-x border-b border-gray-200/60 rounded-b-3xl shadow-sm -mt-px relative z-10">
        
        {activeTab === 'properties' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Properties />
          </div>
        )}
        
        {activeTab === 'blogs' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Blogs />
          </div>
        )}
        
        {activeTab === 'pages' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-7 overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px]">
                <div className="p-7 lg:p-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-orange-200">
                    <LayoutDashboard size={14} /> Client Site Studio
                  </div>
                  <h2 className="mt-5 text-3xl font-black tracking-tight text-white">Static Pages Composer</h2>
                  <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/65">
                    Client app ke hero, logo, footer, contact, services, about aur market content yahi se update hoga. JSON nahi, direct UI controls.
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {[
                      { label: 'Sections', value: cmsRows.length || 0 },
                      { label: 'Fields', value: contentStats(editorContent).fields },
                      { label: 'Media', value: contentStats(editorContent).media },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{item.label}</p>
                        <p className="mt-1 text-2xl font-black text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`relative min-h-64 bg-gradient-to-br ${selectedMeta.tone} p-7 text-white`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.22),transparent_30%)]" />
                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/18 text-white backdrop-blur">
                        <SelectedIcon size={26} />
                      </div>
                      <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur">{selectedKey}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">{selectedMeta.label}</h3>
                      <p className="mt-1 text-sm font-semibold text-white/75">{selectedMeta.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {cmsError && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
                <AlertCircle size={18} /> <span className="font-semibold">{cmsError}</span>
              </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
              {cmsRows.map((row) => {
                const meta = pageMeta[row.content_key] || { label: row.title, desc: row.content_key, icon: FileText, tone: 'from-slate-700 to-slate-950' }
                const Icon = meta.icon
                const active = selectedKey === row.content_key
                return (
                  <button
                    key={row.content_key}
                    onClick={() => setSelectedKey(row.content_key)}
                    className={`group relative overflow-hidden rounded-3xl border p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${active ? 'border-orange-200 bg-orange-50 shadow-orange-100' : 'border-slate-200 bg-white hover:border-orange-200 hover:shadow-orange-100/60'}`}
                  >
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.tone} text-white shadow-sm transition-transform group-hover:scale-105`}>
                      <Icon size={20} />
                    </div>
                    <p className="mt-4 font-black text-slate-950">{meta.label}</p>
                    <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{meta.desc}</p>
                    {active && <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-[#E6761D] shadow-lg shadow-orange-300" />}
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_390px]">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-6 py-5 backdrop-blur-xl">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Section Title</label>
                    <input
                      value={editorTitle}
                      onChange={(event) => setEditorTitle(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3 text-lg font-black text-gray-900 outline-none transition-all hover:bg-white focus:border-[#E6761D] focus:bg-white focus:ring-4 focus:ring-orange-100 xl:w-[520px]"
                    />
                    <p className="mt-2 text-xs text-gray-500">Client app reads this section from `/api/cms/{selectedKey}`. Changes appear in app after save/refresh.</p>
                  </div>
                    <button
                      onClick={handleSaveCms}
                      disabled={cmsSaving || !selectedContent}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#E6761D] hover:shadow-xl hover:shadow-orange-200 disabled:opacity-60"
                    >
                      {cmsSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      Save Changes
                    </button>
                    <button onClick={fetchCmsRows} disabled={cmsLoading} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:text-[#E6761D] disabled:opacity-60">
                      {cmsLoading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                      Refresh
                    </button>
                  </div>
                </div>
                <div className="max-h-[calc(100vh-240px)] overflow-y-auto bg-slate-50 p-5">
                  {Object.keys(editorContent || {}).length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                      <FileText className="mx-auto text-slate-300" size={38} />
                      <p className="mt-3 text-sm font-bold text-slate-500">No editable content found for this section.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5">
                      {orderedEntries(selectedKey, editorContent).map(([key, value]) => (
                        <CmsField key={key} fieldKey={key} value={value} path={[key]} onChange={handleFieldChange} root={editorContent} onUpload={handleCmsImageUpload} uploadingPath={uploadingPath} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <ClientPreview sectionKey={selectedKey} title={editorTitle} content={editorContent || {}} />
                <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-black text-slate-950">Section Map</h3>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {orderedEntries(selectedKey, editorContent).slice(0, 8).map(([key, value]) => (
                      <div key={key} className="rounded-2xl bg-slate-50 p-3 transition-all hover:-translate-y-0.5 hover:bg-orange-50">
                        <p className="truncate text-xs font-black uppercase tracking-widest text-slate-400">{titleCase(key)}</p>
                        <p className="mt-1 text-sm font-black text-slate-950">{Array.isArray(value) ? `${value.length} items` : isPlainObject(value) ? `${Object.keys(value).length} fields` : 'Field'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">CMS Configuration</h2>
              <p className="text-gray-500">Global settings, media defaults, and SEO preferences</p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <Shield size={18} className="text-purple-600" />
                <h3 className="font-bold text-gray-800">Global Preferences</h3>
              </div>
              {settingsLoading || !settingsDraft ? (
                <div className="flex items-center justify-center p-14">
                  <Loader2 className="animate-spin text-purple-600" size={28} />
                </div>
              ) : (
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Default Meta Description</label>
                  <textarea rows="3" value={settingsDraft.defaultMetaDescription || ''} onChange={(event) => updateSettingsDraft('defaultMetaDescription', event.target.value)} className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] outline-none transition-all resize-none" placeholder="Your site's default SEO description..." />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Robots Policy</label>
                  <textarea rows="2" value={settingsDraft.robotsPolicy || ''} onChange={(event) => updateSettingsDraft('robotsPolicy', event.target.value)} className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] outline-none transition-all resize-none" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">Media Library Storage</h4>
                    <p className="text-xs text-gray-500 mt-1">{settingsDraft.mediaStorageUsedGb || 0} GB of {settingsDraft.mediaStorageLimitGb || 0} GB used</p>
                  </div>
                  <div className="flex flex-col items-end w-48">
                    <span className="text-xs font-bold text-orange-500 mb-1">{storagePercent}%</span>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: `${storagePercent}%` }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Items Per Page</label>
                    <select value={settingsDraft.cmsItemsPerPage || 20} onChange={(event) => updateSettingsDraft('cmsItemsPerPage', Number(event.target.value))} className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] outline-none transition-all cursor-pointer">
                      <option value={10}>10 Items</option>
                      <option value={20}>20 Items</option>
                      <option value={50}>50 Items</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Default Image Quality</label>
                    <select value={settingsDraft.imageQuality || 'high'} onChange={(event) => updateSettingsDraft('imageQuality', event.target.value)} className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] outline-none transition-all cursor-pointer">
                      <option value="high">High (80%)</option>
                      <option value="medium">Medium (60%)</option>
                      <option value="low">Low (40%)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <NumberSetting label="Media Used (GB)" value={settingsDraft.mediaStorageUsedGb} onChange={(value) => updateSettingsDraft('mediaStorageUsedGb', value)} />
                  <NumberSetting label="Media Limit (GB)" value={settingsDraft.mediaStorageLimitGb} onChange={(value) => updateSettingsDraft('mediaStorageLimitGb', value)} />
                  <NumberSetting label="Session Timeout (Minutes)" value={settingsDraft.sessionTimeoutMinutes} onChange={(value) => updateSettingsDraft('sessionTimeoutMinutes', value)} />
                  <NumberSetting label="Backup Retention (Days)" value={settingsDraft.backupRetentionDays} onChange={(value) => updateSettingsDraft('backupRetentionDays', value)} />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {[
                    ['maintenanceMode', 'Maintenance Mode'],
                    ['allowRegistration', 'Allow Registration'],
                    ['publishApprovalRequired', 'Approval Before Publish'],
                    ['weeklyReports', 'Weekly Reports'],
                  ].map(([key, label]) => (
                    <button key={key} onClick={() => updateSettingsDraft(key, !settingsDraft[key])} className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${settingsDraft[key] ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                      <span className="text-sm font-black">{label}</span>
                      <span className={`h-6 w-11 rounded-full p-1 transition-colors ${settingsDraft[key] ? 'bg-emerald-600' : 'bg-gray-300'}`}>
                        <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${settingsDraft[key] ? 'translate-x-5' : ''}`} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              )}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button onClick={handleSaveCmsSettings} disabled={settingsSaving || settingsLoading || !settingsDraft} className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-black transition-colors shadow-md disabled:opacity-60">
                  {settingsSaving && <Loader2 className="animate-spin" size={15} />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CMS
