import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertCircle,
  Edit,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  Home,
  MapPin,
  IndianRupee,
  BedDouble,
  Bath,
  Car,
  TrendingUp,
  Star,
  Image as ImageIcon,
  FileText,
  User,
  ShieldAlert,
  Percent,
  Activity,
  Layers,
  Map,
  Calendar,
  Compass,
  CheckCircle,
  Share2,
  Upload
} from 'lucide-react'
import { getErrorMessage, propertyService, unwrap, uploadService } from '../services/api'

const emptyForm = {
  title: '', location: '', city: 'Pune', price: '', property_type: 'Apartment',
  unit_type: '', subtype: 'Apartment', bedrooms: '', bathrooms: '', parking: '',
  parking_type: 'Covered', floor: '', total_floors: '', carpet_area: '',
  furnishing: 'Semi-Furnished', built_year: '', possession_date: '', balcony: '',
  facing: 'East', status: 'Available', image_url: '', images: '',
  amenities: 'CCTV, Elevator, Parking, Security',
  furnishing_items: '',
  executive_name: '', executive_role: 'Property Owner',
  ai_score: '94', growth: '+12.5%', investment_grade: 'A+', roi_potential: '18.2%',
  description: '', featured: false, negotiable: true,
  owner_title: 'Mr', owner_full_name: '', owner_email: '', owner_phone: '', owner_whatsapp: '',
  society: '', landmark: '', pincode: '', full_address: '',
  builtup_area: '', rent_expected: '', deposit: '', maintenance: '', fixed_price: false,
  purchase_year: '', purchase_month: '', selling_rights: '', urgency: '',
  ownership_status: '', loan_status: '', document_ready: false, interested_in_support: false,
  nearby_places: [], nearby_name: '', nearby_distance: '', nearby_unit: 'km', nearby_type: '',
  ownership_document: '',
}

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

const getPrimaryImage = (property) => {
  if (property.image_url) return property.image_url
  if (Array.isArray(property.images) && property.images.length > 0) return property.images[0]
  return ''
}

const getPropertyImages = (property) => {
  const images = [
    property.image_url,
    ...(Array.isArray(property.images) ? property.images : []),
  ]
    .map(image => String(image || '').trim())
    .filter(Boolean)
  return Array.from(new Set(images))
}

const getPublicPropertyUrl = (property) => {
  const code = property.property_code || property.propertyCode || property.id
  const publicSite = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://resaleexpert.in'
  return `${publicSite}/properties/${code}`
}

const toCsv = (value) => Array.isArray(value) ? value.join(', ') : value || ''
const normalizeNearbyPlaces = (value) => {
  if (Array.isArray(value)) return value.filter(place => place?.name)
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value || '[]')
      return Array.isArray(parsed) ? parsed.filter(place => place?.name) : []
    } catch {
      return []
    }
  }
  return []
}
const nonPlaceholder = (value) => {
  const text = String(value || '').trim()
  return ['owner', 'property owner', 'not specified', 'not provided', 'owner@resaleexpert.in', 'not-provided@resaleexpert.in'].includes(text.toLowerCase()) ? '' : text
}
const Properties = () => {
  const [properties, setProperties] = useState([])
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [query, setQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [error, setError] = useState('')
  const [activeStatusTab, setActiveStatusTab] = useState('All')
  const [previewProperty, setPreviewProperty] = useState(null)

  const addNearbyPlace = () => {
    const name = formData.nearby_name.trim()
    const distance = formData.nearby_distance.trim()
    if (!name || !distance || !formData.nearby_type) {
      setError('Nearby place me name, distance aur type required hai.')
      return
    }

    setError('')
    setFormData(prev => ({
      ...prev,
      nearby_places: [
        ...normalizeNearbyPlaces(prev.nearby_places),
        {
          id: String(Date.now()),
          name,
          distance,
          unit: prev.nearby_unit || 'km',
          type: prev.nearby_type,
        },
      ],
      nearby_name: '',
      nearby_distance: '',
      nearby_unit: 'km',
      nearby_type: '',
    }))
  }

  const removeNearbyPlace = (index) => {
    setFormData(prev => ({
      ...prev,
      nearby_places: normalizeNearbyPlaces(prev.nearby_places).filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const handlePublishQuickly = async (property) => {
    setError('')
    try {
      await propertyService.update(property.id, {
        ...property,
        status: 'Available',
      })
      await fetchProperties()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const fetchProperties = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await propertyService.getAll({ all: true })
      const data = unwrap(response)
      setProperties(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const filteredProperties = useMemo(() => {
    const search = query.trim().toLowerCase()
    
    // First, filter by status tab
    let list = properties
    if (activeStatusTab !== 'All') {
      list = properties.filter(p => p.status === activeStatusTab)
    }
    
    if (!search) return list
    return list.filter(p =>
      [p.title, p.location, p.city, p.property_type].filter(Boolean).some(val => val.toLowerCase().includes(search))
    )
  }, [properties, query, activeStatusTab])

  const openCreateModal = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setShowModal(true)
  }

  const openEditModal = (property) => {
    setEditingId(property.id)
    const owner = property.owner_details || {}
    const locationDetails = property.location_details || {}
    const pricing = property.pricing_details || {}
    const timeline = property.timeline_details || {}
    const legal = property.legal_details || {}
    setFormData({
      title: property.title || '', location: property.location || '', city: property.city || 'Pune',
      price: property.price || '', property_type: property.property_type || 'Apartment',
      unit_type: property.unit_type || '', subtype: property.subtype || 'Apartment',
      bedrooms: property.bedrooms || '', bathrooms: property.bathrooms || '', parking: property.parking || '',
      parking_type: property.parking_type || 'Covered', floor: property.floor || '', total_floors: property.total_floors || '',
      carpet_area: property.carpet_area || '', furnishing: property.furnishing || 'Semi-Furnished',
      built_year: property.built_year || '', possession_date: property.possession_date || '', balcony: property.balcony || '',
      facing: property.facing || 'East', status: property.status || 'Available', image_url: property.image_url || '',
      images: toCsv(property.images),
      amenities: toCsv(property.amenities),
      furnishing_items: toCsv(property.furnishing_items),
      executive_name: property.executive_name || property.full_name || '',
      executive_role: property.executive_role || 'Property Owner', ai_score: property.ai_score || '94',
      growth: property.growth || '+12.5%', investment_grade: property.investment_grade || 'A+',
      roi_potential: property.roi_potential || '18.2%', description: property.description || '',
      featured: Boolean(property.featured), negotiable: property.negotiable !== undefined ? Boolean(property.negotiable) : true,
      owner_title: owner.title || 'Mr',
      owner_full_name: owner.fullName || property.full_name || property.executive_name || '',
      owner_email: owner.email || property.email || '',
      owner_phone: owner.phone || property.phone || '',
      owner_whatsapp: owner.whatsapp || property.whatsapp || '',
      society: locationDetails.society || '',
      landmark: locationDetails.landmark || '',
      pincode: locationDetails.pincode || '',
      full_address: locationDetails.fullAddress || '',
      builtup_area: pricing.builtupArea || '',
      rent_expected: pricing.rentExpected || '',
      deposit: pricing.deposit || '',
      maintenance: pricing.maintenance || '',
      fixed_price: Boolean(pricing.fixedPrice),
      purchase_year: timeline.purchaseYear || '',
      purchase_month: timeline.purchaseMonth || '',
      selling_rights: timeline.sellingRights || '',
      urgency: timeline.urgency || '',
      ownership_status: legal.ownershipStatus || '',
      loan_status: legal.loanStatus || '',
      document_ready: Boolean(legal.documentReady),
      interested_in_support: Boolean(legal.interestedInSupport),
      nearby_places: normalizeNearbyPlaces(property.nearby_places),
      nearby_name: '',
      nearby_distance: '',
      nearby_unit: 'km',
      nearby_type: '',
      ownership_document: property.ownership_document || '',
    })
    setShowModal(true)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handlePrimaryImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadingImages(true)
    setError('')
    try {
      const response = await uploadService.uploadImage(file, 'hously/properties')
      const url = unwrap(response)?.url
      if (url) {
        setFormData(prev => ({ ...prev, image_url: url }))
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setUploadingImages(false)
      event.target.value = ''
    }
  }

  const handleGalleryUpload = async (event) => {
    const files = event.target.files
    if (!files?.length) return
    setUploadingImages(true)
    setError('')
    try {
      const response = await uploadService.uploadImages(files, 'hously/properties')
      const urls = unwrap(response)?.urls || []
      if (urls.length) {
        setFormData(prev => {
          const current = prev.images.split(',').map(s => s.trim()).filter(Boolean)
          return {
            ...prev,
            image_url: prev.image_url || urls[0],
            images: [...current, ...urls].join(', '),
          }
        })
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setUploadingImages(false)
      event.target.value = ''
    }
  }

  const buildPayload = () => {
    const price = Number(formData.price) || 0
    const carpetArea = Number(formData.carpet_area) || 0
    const ownerName = nonPlaceholder(formData.owner_full_name)
    const ownerDetails = {
      title: formData.owner_title,
      fullName: ownerName,
      email: formData.owner_email,
      phone: formData.owner_phone,
      whatsapp: formData.owner_whatsapp,
    }
    const locationDetails = {
      society: formData.society,
      location: formData.location,
      city: formData.city,
      landmark: formData.landmark,
      pincode: formData.pincode,
      fullAddress: formData.full_address,
    }
    const pricingDetails = {
      carpetArea: formData.carpet_area,
      builtupArea: formData.builtup_area,
      price: formData.price,
      rentExpected: formData.rent_expected,
      deposit: formData.deposit,
      maintenance: formData.maintenance,
      fixedPrice: formData.fixed_price,
      negotiable: formData.negotiable,
    }
    const timelineDetails = {
      purchaseYear: formData.purchase_year,
      purchaseMonth: formData.purchase_month,
      possessionYear: String(formData.possession_date || '').split(' ')[1] || '',
      possessionMonth: String(formData.possession_date || '').split(' ')[0] || '',
      sellingRights: formData.selling_rights,
      urgency: formData.urgency,
    }
    const legalDetails = {
      ownershipStatus: formData.ownership_status,
      loanStatus: formData.loan_status,
      documentReady: formData.document_ready,
      interestedInSupport: formData.interested_in_support,
    }

    return {
      ...formData,
      price,
      bedrooms: Number(formData.bedrooms) || 0,
      bathrooms: Number(formData.bathrooms) || 0,
      parking: Number(formData.parking) || 0,
      carpet_area: carpetArea,
      per_sq_ft: price && carpetArea ? Math.round(price / carpetArea) : 0,
      balcony: Number(formData.balcony) || 0,
      ai_score: Number(formData.ai_score) || 0,
      fullName: ownerName ? [formData.owner_title, ownerName].filter(Boolean).join('. ') : '',
      email: formData.owner_email,
      phone: formData.owner_phone,
      whatsapp: formData.owner_whatsapp,
      executive_name: nonPlaceholder(formData.executive_name) || ownerName,
      executive_role: formData.executive_role || 'Property Owner',
      images: formData.images.split(',').map(s => s.trim()).filter(Boolean),
      amenities: formData.amenities.split(',').map(s => s.trim()).filter(Boolean),
      furnishing_items: formData.furnishing_items.split(',').map(s => s.trim()).filter(Boolean),
      ownerDetails,
      locationDetails,
      pricingDetails,
      timelineDetails,
      legalDetails,
      nearbyPlaces: normalizeNearbyPlaces(formData.nearby_places),
      nearby_places: normalizeNearbyPlaces(formData.nearby_places),
      ownershipDocument: formData.ownership_document,
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId) await propertyService.update(editingId, buildPayload())
      else await propertyService.create(buildPayload())
      setShowModal(false)
      await fetchProperties()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property permanently?')) return
    setError('')
    try {
      await propertyService.delete(id)
      setProperties(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleViewProperty = (property) => {
    setPreviewProperty(property)
  }

  const handleShareProperty = async (property) => {
    const url = getPublicPropertyUrl(property)
    const text = `${property.title || 'Property'} - ${url}`
    try {
      if (navigator.share) {
        await navigator.share({ title: property.title || 'Property', text, url })
      } else {
        await navigator.clipboard.writeText(text)
        setError('Property share link copied.')
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setError('Share link copy nahi ho paya.')
      }
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Home className="text-[#E6761D]" size={24} />
            Property Inventory
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage and curate real estate listings</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm text-sm w-64 focus:border-[#E6761D] focus:shadow-[0_0_0_3px_rgba(230,118,29,0.1)] transition-all outline-none"
              placeholder="Search by title, location..."
            />
          </div>
          <button onClick={fetchProperties} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:text-[#E6761D] transition-all shadow-sm">
            <RefreshCw size={18} className={loading ? 'animate-spin text-[#E6761D]' : 'text-gray-500'} />
          </button>
          <button onClick={openCreateModal} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E6761D] to-orange-500 text-white font-bold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all ripple">
            <Plus size={18} /> Add Property
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex border-b border-gray-200 pb-px gap-6 mb-2 overflow-x-auto scrollbar-none">
        {['All', 'Under Review', 'Available', 'Sold Out'].map((tab) => {
          const count = tab === 'All' 
            ? properties.length 
            : properties.filter(p => p.status === tab).length;
          
          const isActive = activeStatusTab === tab;
          
          return (
            <button
              key={tab}
              onClick={() => setActiveStatusTab(tab)}
              className={`relative pb-4 text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap outline-none ${
                isActive ? 'text-[#E6761D]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
              {count > 0 && (
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  isActive 
                    ? 'bg-orange-100 text-[#E6761D]' 
                    : tab === 'Under Review' 
                      ? 'bg-amber-100 text-amber-700 font-extrabold animate-pulse' 
                      : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#E6761D] to-orange-500 rounded-full animate-in slide-in-from-left duration-300"></span>
              )}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 text-red-700 border border-red-100 shadow-sm">
          <AlertCircle size={20} className="text-red-500" /> <span className="font-semibold">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 rounded-3xl bg-gray-100 animate-pulse border border-gray-200"></div>
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4"><Home className="text-gray-300 w-10 h-10" /></div>
          <p className="text-lg font-bold text-gray-500">No properties found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or add a new property.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProperties.map(property => {
            const propertyImages = getPropertyImages(property)
            const extraImages = Math.max(0, propertyImages.length - 4)

            return (
            <div key={property.id} className="group bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-200 transition-all duration-400 card-lift overflow-hidden flex flex-col">
              <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {getPrimaryImage(property) ? (
                  <img src={getPrimaryImage(property)} alt={property.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300 group-hover:scale-110 transition-transform duration-700"><Home size={64} /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-4 group-hover:translate-x-0">
                  <button onClick={() => handleViewProperty(property)} className="p-2 rounded-xl bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-blue-600 hover:text-white shadow-lg transition-colors" title="View property"><Eye size={16} /></button>
                  <button onClick={() => handleShareProperty(property)} className="p-2 rounded-xl bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-emerald-600 hover:text-white shadow-lg transition-colors" title="Share property"><Share2 size={16} /></button>
                  <button onClick={() => openEditModal(property)} className="p-2 rounded-xl bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-[#E6761D] hover:text-white shadow-lg transition-colors"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(property.id)} className="p-2 rounded-xl bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-red-500 hover:text-white shadow-lg transition-colors"><Trash2 size={16} /></button>
                </div>

                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md backdrop-blur-md ${property.status === 'Available' ? 'bg-emerald-500/90 text-white' : property.status === 'Sold Out' ? 'bg-red-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>
                    {property.status || 'Available'}
                  </span>
                  {property.featured && (
                    <span className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                      <Star size={12} fill="white" /> Featured
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-black text-xl text-white line-clamp-1 drop-shadow-md">{property.title}</h3>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-white/90 mt-1 drop-shadow-md">
                    <MapPin size={14} className="text-[#E6761D]" /> {property.location || property.city}
                  </div>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Gallery</p>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-black text-gray-500">{propertyImages.length} images</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {propertyImages.slice(0, 4).map((image, index) => (
                      <button
                        type="button"
                        key={`${image}-${index}`}
                        onClick={() => window.open(image, '_blank', 'noopener,noreferrer')}
                        className="relative h-16 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
                        title="Open image"
                      >
                        <img src={image} alt={`${property.title || 'Property'} ${index + 1}`} className="h-full w-full object-cover" />
                        {index === 3 && extraImages > 0 && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-xs font-black text-white">+{extraImages}</span>
                        )}
                      </button>
                    ))}
                    {propertyImages.length === 0 && (
                      <div className="col-span-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-xs font-bold text-gray-400">
                        No images uploaded
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Listed Price</p>
                    <span className="text-2xl font-black text-[#E6761D] leading-none">{currency.format(Number(property.price) || 0)}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Type</p>
                    <span className="text-sm font-bold text-gray-700">{property.property_type}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 border border-gray-100 group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors">
                    <BedDouble size={18} className="text-gray-400 group-hover:text-orange-500 mb-1 transition-colors" />
                    <span className="text-xs font-bold text-gray-700">{property.bedrooms || '-'} Bed</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                    <Bath size={18} className="text-gray-400 group-hover:text-blue-500 mb-1 transition-colors" />
                    <span className="text-xs font-bold text-gray-700">{property.bathrooms || '-'} Bath</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 border border-gray-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                    <Car size={18} className="text-gray-400 group-hover:text-emerald-500 mb-1 transition-colors" />
                    <span className="text-xs font-bold text-gray-700">{property.parking || '-'} Park</span>
                  </div>
                </div>

                {property.status === 'Under Review' && (
                  <button 
                    onClick={() => handlePublishQuickly(property)}
                    className="w-full mb-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98] outline-none"
                  >
                    <CheckCircle size={14} /> Approve & Publish
                  </button>
                )}

                <div className="mb-4 grid grid-cols-2 gap-2">
                  <button onClick={() => handleViewProperty(property)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs font-black text-blue-700 transition-all hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white">
                    <Eye size={14} /> View
                  </button>
                  <button onClick={() => handleShareProperty(property)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs font-black text-emerald-700 transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:text-white">
                    <Share2 size={14} /> Share
                  </button>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {(property.executive_name || 'A').charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 line-clamp-1">{property.executive_name || property.full_name || 'Property Owner'}</p>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{property.executive_role || 'Agent'}</p>
                    </div>
                  </div>
                  {property.ai_score && (
                    <div className="flex items-center gap-1 text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                      <TrendingUp size={12} /> AI: {property.ai_score}
                    </div>
                  )}
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}

      {/* Beautiful Multi-Column Modal — rendered via Portal to avoid z-index/stacking context issues */}
      {showModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
          style={{ overflowY: 'auto', padding: '16px' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="relative w-full max-w-5xl my-auto rounded-3xl bg-white shadow-2xl flex flex-col animate-in zoom-in-95 duration-300" style={{ maxHeight: 'calc(100vh - 32px)' }}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-5 flex justify-between items-center shrink-0 rounded-t-3xl">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  {editingId ? <Edit size={18} className="text-[#E6761D]" /> : <Plus size={18} className="text-[#E6761D]" />}
                </div>
                {editingId ? 'Edit Property Details' : 'List New Property'}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 rounded-full bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable form body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-custom bg-slate-50/50" style={{ minHeight: 0 }}>
              <div className="p-6 space-y-6">
                {/* Owner Details Section */}
                <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10">
                  <h3 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3"><User size={18} className="text-[#E6761D]" /> Owner Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                    <SelectField label="Title" name="owner_title" value={formData.owner_title} onChange={handleInputChange} options={['Mr', 'Ms', 'Mrs', 'Dr']} />
                    <InputField label="Full Name" name="owner_full_name" value={formData.owner_full_name} onChange={handleInputChange} />
                    <InputField label="Email" name="owner_email" value={formData.owner_email} onChange={handleInputChange} type="email" />
                    <InputField label="Phone" name="owner_phone" value={formData.owner_phone} onChange={handleInputChange} />
                    <InputField label="WhatsApp" name="owner_whatsapp" value={formData.owner_whatsapp} onChange={handleInputChange} />
                  </div>
                </div>
                
                {/* Basic Details Section */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10">
                  <h3 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3"><Home size={18} className="text-blue-500" /> Basic Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <InputField label="Property Title" name="title" value={formData.title} onChange={handleInputChange} required />
                    <InputField label="Location" name="location" value={formData.location} onChange={handleInputChange} required />
                    <InputField label="City" name="city" value={formData.city} onChange={handleInputChange} />
                    <InputField label="Price (₹)" name="price" type="number" value={formData.price} onChange={handleInputChange} required icon={<IndianRupee size={14} className="text-gray-400" />} />
                    <SelectField label="Property Type" name="property_type" value={formData.property_type} onChange={handleInputChange} options={['Apartment', 'House', 'Villa', 'Commercial', 'Plot']} />
                    <InputField label="Subtype" name="subtype" value={formData.subtype} onChange={handleInputChange} />
                    <InputField label="Unit Type (e.g., 2BHK)" name="unit_type" value={formData.unit_type} onChange={handleInputChange} placeholder="2BHK" />
                    <SelectField label="Status" name="status" value={formData.status} onChange={handleInputChange} options={['Available', 'Under Review', 'Sold Out']} />
                  </div>
                </div>

                {/* Location & Pricing Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10">
                    <h3 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3"><MapPin size={18} className="text-rose-500" /> Location Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InputField label="Society" name="society" value={formData.society} onChange={handleInputChange} />
                      <InputField label="Landmark" name="landmark" value={formData.landmark} onChange={handleInputChange} />
                      <InputField label="Pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} />
                      <InputField label="Builtup Area" name="builtup_area" value={formData.builtup_area} onChange={handleInputChange} />
                    </div>
                    <div className="mt-5">
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Full Address</label>
                      <textarea name="full_address" rows="3" value={formData.full_address} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-rose-500 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.1)] transition-all outline-none resize-none bg-gray-50 hover:border-orange-300 hover:bg-white focus:bg-white"></textarea>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10">
                    <h3 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3"><IndianRupee size={18} className="text-emerald-500" /> Pricing & Timeline</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InputField label="Expected Rent" name="rent_expected" value={formData.rent_expected} onChange={handleInputChange} />
                      <InputField label="Deposit" name="deposit" value={formData.deposit} onChange={handleInputChange} />
                      <InputField label="Maintenance" name="maintenance" value={formData.maintenance} onChange={handleInputChange} />
                      <InputField label="Purchase Month" name="purchase_month" value={formData.purchase_month} onChange={handleInputChange} />
                      <InputField label="Purchase Year" name="purchase_year" value={formData.purchase_year} onChange={handleInputChange} />
                      <InputField label="Selling Timeline" name="urgency" value={formData.urgency} onChange={handleInputChange} />
                      <InputField label="Selling Rights" name="selling_rights" value={formData.selling_rights} onChange={handleInputChange} />
                    </div>
                    <label className="mt-5 flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" name="fixed_price" checked={formData.fixed_price} onChange={handleInputChange} className="h-4 w-4 accent-[#E6761D]" />
                      <span className="font-bold text-gray-700 group-hover:text-gray-900">Fixed Price</span>
                    </label>
                  </div>
                </div>

                {/* Features & Amenities Section */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10">
                  <h3 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3"><Layers size={18} className="text-emerald-500" /> Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <InputField label="Bedrooms" name="bedrooms" type="number" value={formData.bedrooms} onChange={handleInputChange} icon={<BedDouble size={14} className="text-gray-400" />} />
                    <InputField label="Bathrooms" name="bathrooms" type="number" value={formData.bathrooms} onChange={handleInputChange} icon={<Bath size={14} className="text-gray-400" />} />
                    <InputField label="Balcony" name="balcony" type="number" value={formData.balcony} onChange={handleInputChange} />
                    <InputField label="Carpet Area (sq.ft)" name="carpet_area" type="number" value={formData.carpet_area} onChange={handleInputChange} />
                    
                    <InputField label="Parking Slots" name="parking" type="number" value={formData.parking} onChange={handleInputChange} icon={<Car size={14} className="text-gray-400" />} />
                    <SelectField label="Parking Type" name="parking_type" value={formData.parking_type} onChange={handleInputChange} options={['Covered', 'Open', 'Basement', 'None']} />
                    <InputField label="Floor No." name="floor" value={formData.floor} onChange={handleInputChange} />
                    <InputField label="Total Floors" name="total_floors" value={formData.total_floors} onChange={handleInputChange} />
                    
                    <SelectField label="Furnishing" name="furnishing" value={formData.furnishing} onChange={handleInputChange} options={['Unfurnished', 'Semi-Furnished', 'Fully Furnished']} />
                    <InputField label="Facing" name="facing" value={formData.facing} onChange={handleInputChange} icon={<Compass size={14} className="text-gray-400" />} />
                    <InputField label="Built Year" name="built_year" value={formData.built_year} onChange={handleInputChange} />
                    <InputField label="Possession Date" name="possession_date" value={formData.possession_date} onChange={handleInputChange} icon={<Calendar size={14} className="text-gray-400" />} />
                  </div>
                </div>

                {/* Media & Descriptive Section */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10">
                  <h3 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3"><ImageIcon size={18} className="text-purple-500" /> Media & Descriptions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <InputField label="Primary Cloudinary Image URL" name="image_url" value={formData.image_url} onChange={handleInputChange} />
                      <UploadButton label="Upload Primary Image" onChange={handlePrimaryImageUpload} disabled={uploadingImages} />
                    </div>
                    <div>
                      <InputField label="Gallery Cloudinary Images" name="images" value={formData.images} onChange={handleInputChange} placeholder="url1.jpg, url2.jpg" />
                      <UploadButton label="Upload Gallery Images" onChange={handleGalleryUpload} disabled={uploadingImages} multiple />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Amenities</label>
                        <textarea name="amenities" rows="2" value={formData.amenities} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] transition-all outline-none resize-none bg-gray-50 hover:border-orange-300 hover:bg-white focus:bg-white" placeholder="Pool, Gym, Security..."></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Furnishing Items</label>
                        <textarea name="furnishing_items" rows="2" value={formData.furnishing_items} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] transition-all outline-none resize-none bg-gray-50 hover:border-orange-300 hover:bg-white focus:bg-white" placeholder="Sofa, TV, Wardrobe..."></textarea>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Full Description</label>
                      <textarea name="description" rows="4" value={formData.description} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] transition-all outline-none resize-none bg-gray-50 hover:border-orange-300 hover:bg-white focus:bg-white"></textarea>
                    </div>
                  </div>
                </div>

                {/* Legal, Nearby & Documents Section */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10">
                  <h3 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3"><ShieldAlert size={18} className="text-amber-500" /> Legal, Nearby & Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
                    <InputField label="Ownership Status" name="ownership_status" value={formData.ownership_status} onChange={handleInputChange} />
                    <InputField label="Loan Status" name="loan_status" value={formData.loan_status} onChange={handleInputChange} />
                    <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 mt-6 cursor-pointer">
                      <input type="checkbox" name="document_ready" checked={formData.document_ready} onChange={handleInputChange} className="h-4 w-4 accent-[#E6761D]" />
                      <span className="text-sm font-bold text-gray-700">Documents Ready</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 mt-6 cursor-pointer">
                      <input type="checkbox" name="interested_in_support" checked={formData.interested_in_support} onChange={handleInputChange} className="h-4 w-4 accent-[#E6761D]" />
                      <span className="text-sm font-bold text-gray-700">Need Expert Support</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider text-gray-500">Nearby Places</label>
                          <p className="mt-1 text-xs font-semibold text-gray-500">Proper rows me save hoga, JSON nahi dikhaya jayega.</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-amber-700 shadow-sm">
                          {normalizeNearbyPlaces(formData.nearby_places).length}
                        </span>
                      </div>

                      <div className="mb-4 space-y-2">
                        {normalizeNearbyPlaces(formData.nearby_places).map((place, index) => (
                          <div key={`${place.name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-amber-100 bg-white p-3 shadow-sm">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-gray-900">{place.name}</p>
                              <p className="mt-0.5 text-xs font-semibold text-gray-500">
                                {place.distance}{place.unit || 'km'} • {place.type || 'Nearby'}
                              </p>
                            </div>
                            <button type="button" onClick={() => removeNearbyPlace(index)} className="rounded-lg bg-red-50 p-2 text-red-600 transition-all hover:bg-red-600 hover:text-white">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        {normalizeNearbyPlaces(formData.nearby_places).length === 0 && (
                          <div className="rounded-xl border border-dashed border-amber-200 bg-white/70 p-4 text-center text-xs font-bold text-gray-400">
                            No nearby places added yet.
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_0.75fr_0.6fr_0.85fr_auto]">
                        <input name="nearby_name" value={formData.nearby_name} onChange={handleInputChange} placeholder="Place name" className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none transition-all focus:border-[#E6761D] focus:ring-4 focus:ring-orange-100" />
                        <input name="nearby_distance" value={formData.nearby_distance} onChange={handleInputChange} placeholder="Distance" className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none transition-all focus:border-[#E6761D] focus:ring-4 focus:ring-orange-100" />
                        <select name="nearby_unit" value={formData.nearby_unit} onChange={handleInputChange} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-black outline-none transition-all focus:border-[#E6761D] focus:ring-4 focus:ring-orange-100">
                          <option value="km">km</option>
                          <option value="m">m</option>
                          <option value="min">min</option>
                        </select>
                        <select name="nearby_type" value={formData.nearby_type} onChange={handleInputChange} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-black outline-none transition-all focus:border-[#E6761D] focus:ring-4 focus:ring-orange-100">
                          <option value="">Type</option>
                          {['School', 'Hospital', 'Mall', 'Metro', 'Airport', 'Bus Stop', 'Railway Station', 'IT Park', 'Market'].map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <button type="button" onClick={addNearbyPlace} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E6761D] px-4 py-2.5 text-sm font-black text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-orange-600">
                          <Plus size={15} /> Add
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Ownership Document</label>
                      <textarea name="ownership_document" rows="5" value={formData.ownership_document} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono focus:border-amber-500 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.1)] transition-all outline-none resize-none bg-gray-50 hover:border-orange-300 hover:bg-white focus:bg-white" placeholder="Cloudinary URL or saved document reference"></textarea>
                    </div>
                  </div>
                </div>

                {/* Analytics & Agent Info */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10">
                  <h3 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3"><Activity size={18} className="text-amber-500" /> Executive & Analytics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <InputField label="Executive Name" name="executive_name" value={formData.executive_name} onChange={handleInputChange} icon={<User size={14} className="text-gray-400" />} />
                    <InputField label="Executive Role" name="executive_role" value={formData.executive_role} onChange={handleInputChange} />
                    <InputField label="AI Score" name="ai_score" type="number" value={formData.ai_score} onChange={handleInputChange} />
                    <InputField label="Growth Projection" name="growth" value={formData.growth} onChange={handleInputChange} icon={<TrendingUp size={14} className="text-gray-400" />} />
                    <InputField label="Investment Grade" name="investment_grade" value={formData.investment_grade} onChange={handleInputChange} />
                    <InputField label="ROI Potential" name="roi_potential" value={formData.roi_potential} onChange={handleInputChange} icon={<Percent size={14} className="text-gray-400" />} />
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl flex flex-col sm:flex-row gap-6 items-center">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input type="checkbox" name="featured" checked={formData.featured} onChange={handleInputChange} className="peer sr-only" />
                      <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#E6761D] transition-colors"></div>
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4 shadow-sm"></div>
                    </div>
                    <span className="font-bold text-gray-700 group-hover:text-gray-900">Featured Property</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input type="checkbox" name="negotiable" checked={formData.negotiable} onChange={handleInputChange} className="peer sr-only" />
                      <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#E6761D] transition-colors"></div>
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4 shadow-sm"></div>
                    </div>
                    <span className="font-bold text-gray-700 group-hover:text-gray-900">Negotiable Price</span>
                  </label>
                </div>

              </div>
            </form>

            {/* Sticky footer — always visible */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-between items-center shrink-0 rounded-b-3xl">
              <p className="text-xs text-gray-400 font-semibold">
                {editingId ? `Editing property #${editingId}` : 'New listing will be saved as Draft'}
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                <button type="button" onClick={handleSubmit} disabled={saving || uploadingImages} className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#E6761D] to-orange-500 text-white font-black shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 flex items-center gap-2 text-sm">
                  {(saving || uploadingImages) && <Loader2 className="animate-spin" size={16} />}
                  {editingId ? '✓ Save Changes' : '🚀 Publish Property'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {previewProperty && createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(event) => { if (event.target === event.currentTarget) setPreviewProperty(null) }}
        >
          <div className="max-h-[calc(100vh-32px)] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-slate-950 px-6 py-4 text-white">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-orange-300">Property Preview</p>
                <h3 className="mt-1 text-lg font-black">{previewProperty.title}</h3>
              </div>
              <button onClick={() => setPreviewProperty(null)} className="rounded-full bg-white/10 p-2 text-white transition-all hover:bg-white/20">
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[calc(100vh-105px)] overflow-y-auto bg-slate-50 p-6">
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                  <div className="h-80 bg-gray-100">
                    {getPrimaryImage(previewProperty) ? (
                      <img src={getPrimaryImage(previewProperty)} alt={previewProperty.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300"><Home size={72} /></div>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-3 p-4">
                    {getPropertyImages(previewProperty).map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        onClick={() => window.open(image, '_blank', 'noopener,noreferrer')}
                        className="h-20 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
                      >
                        <img src={image} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </section>

                <aside className="space-y-4">
                  <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Listed Price</p>
                        <p className="mt-2 text-3xl font-black text-[#E6761D]">{currency.format(Number(previewProperty.price) || 0)}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase text-emerald-700">{previewProperty.status}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm font-bold text-gray-600">
                      <MapPin size={16} className="text-[#E6761D]" /> {previewProperty.location || previewProperty.city}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Beds', value: previewProperty.bedrooms || '-', icon: BedDouble },
                      { label: 'Baths', value: previewProperty.bathrooms || '-', icon: Bath },
                      { label: 'Parking', value: previewProperty.parking || '-', icon: Car },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm">
                        <item.icon className="mx-auto text-[#E6761D]" size={20} />
                        <p className="mt-2 text-lg font-black text-gray-900">{item.value}</p>
                        <p className="text-xs font-bold text-gray-500">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h4 className="font-black text-gray-900">Details</h4>
                    <div className="mt-4 space-y-2">
                      {[
                        ['Code', previewProperty.property_code || previewProperty.id],
                        ['Type', previewProperty.property_type],
                        ['Unit', previewProperty.unit_type],
                        ['Carpet Area', `${previewProperty.carpet_area || '-'} sq.ft`],
                        ['Executive', previewProperty.executive_name || previewProperty.full_name || '-'],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-4 rounded-xl bg-gray-50 px-3 py-2">
                          <span className="text-xs font-bold text-gray-500">{label}</span>
                          <span className="text-xs font-black text-gray-900">{value || '-'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleShareProperty(previewProperty)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-700">
                      <Share2 size={16} /> Share
                    </button>
                    <button onClick={() => openEditModal(previewProperty)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E6761D] px-4 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-orange-600">
                      <Edit size={16} /> Edit
                    </button>
                  </div>
                </aside>
              </div>

              {previewProperty.description && (
                <section className="mt-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h4 className="font-black text-gray-900">Description</h4>
                  <p className="mt-3 whitespace-pre-line text-sm font-medium leading-6 text-gray-600">{previewProperty.description}</p>
                </section>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

const InputField = ({ label, icon, ...props }) => (
  <div>
    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
      <input {...props} className={`w-full rounded-xl border border-gray-200 py-3 text-sm hover:border-orange-300 hover:bg-white focus:border-[#E6761D] focus:shadow-[0_0_0_3px_rgba(230,118,29,0.12)] transition-all outline-none bg-gray-50 focus:bg-white font-medium text-gray-900 ${icon ? 'pl-9 pr-4' : 'px-4'}`} />
    </div>
  </div>
)

const UploadButton = ({ label, onChange, disabled, multiple = false }) => (
  <label className={`mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-orange-200 bg-orange-50 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#E6761D] transition-colors hover:bg-orange-100 ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
    <Upload size={14} />
    {disabled ? 'Uploading...' : label}
    <input type="file" accept="image/*" multiple={multiple} onChange={onChange} className="hidden" />
  </label>
)

const SelectField = ({ label, options, ...props }) => (
  <div>
    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">{label}</label>
    <select {...props} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm hover:border-orange-300 hover:bg-white focus:border-[#E6761D] focus:shadow-[0_0_0_3px_rgba(230,118,29,0.12)] transition-all outline-none bg-gray-50 focus:bg-white font-medium text-gray-900 cursor-pointer appearance-none">
      {options.map(opt => <option key={opt}>{opt}</option>)}
    </select>
  </div>
)

export default Properties
