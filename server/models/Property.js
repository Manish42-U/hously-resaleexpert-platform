const BaseModel = require('./BaseModel')
const { stringifyJsonField } = require('./dbHelpers')

const PRESENT_DEFAULT = 'Not specified'
const DEFAULT_CITY = 'Pune'
const DEFAULT_AMENITIES = ['CCTV', 'Elevator', 'Parking', 'Security']
const DEFAULT_FURNISHING_ITEMS = []
const DEFAULT_IMAGE =
  'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1200'
const PLACEHOLDER_VALUES = new Set([
  'owner',
  'property owner',
  'not specified',
  'not provided',
  'not-provided@resaleexpert.in',
  'owner@resaleexpert.in',
])

const cleanText = (value, fallback = PRESENT_DEFAULT) => {
  const text = String(value ?? '').trim()
  return text || fallback
}

const optionalText = (value) => {
  const text = String(value ?? '').trim()
  return text || undefined
}

const realText = (value) => {
  const text = String(value ?? '').trim()
  if (!text) return ''
  return PLACEHOLDER_VALUES.has(text.toLowerCase()) ? '' : text
}

const safeNumber = (value, fallback = 0) => {
  const number = Number(String(value ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(number) ? number : fallback
}

const cleanObject = (value = {}) => Object.fromEntries(
  Object.entries(value || {}).filter(([, item]) => {
    if (item === undefined || item === null) return false
    if (typeof item === 'string') return item.trim() !== ''
    if (Array.isArray(item)) return item.length > 0
    return true
  }),
)

const asArray = (value, fallback = []) => {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (value && typeof value === 'object') return [value].filter(Boolean)
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.filter(Boolean)
    } catch {
      return value.split(',').map(item => item.trim()).filter(Boolean)
    }
  }
  return fallback
}

const normalizeNearbyPlaces = (data) => {
  const source = data.nearbyPlaces || data.nearby_places || data.nearby || data.places
  return asArray(source, [])
    .map((place) => {
      if (typeof place === 'string') return { name: place }
      if (!place || typeof place !== 'object') return null
      return cleanObject({
        id: place.id,
        name: place.name || place.placeName || place.title,
        distance: place.distance,
        unit: place.unit,
        type: place.type || place.category,
      })
    })
    .filter((place) => place && Object.keys(place).length > 0 && place.name)
}

class PropertyModel extends BaseModel {
  constructor() {
    super({
      table: 'properties',
      jsonFields: [
        'amenities',
        'furnishing_items',
        'images',
        'owner_details',
        'location_details',
        'pricing_details',
        'timeline_details',
        'legal_details',
        'nearby_places',
      ],
      booleanFields: ['featured', 'negotiable'],
    })
  }

  normalize(row) {
    const property = super.normalize(row)
    if (!property) return null

    const imageUrl = property.image_url || property.imageUrl || property.image || null
    return {
      ...property,
      image_url: property.image_url || imageUrl,
      imageUrl,
      image: property.image || property.image_url || property.imageUrl || null,
    }
  }

  toRecord(data) {
    const propertyType = cleanText(data.propertyType || data.property_type, 'Residential')
    const unitType = cleanText(data.unitType || data.unit_type || data.bedrooms && `${data.bedrooms}BHK`, 'Property')
    const subtype = cleanText(data.subtype, propertyType)
    const city = cleanText(data.city, DEFAULT_CITY)
    const location = cleanText(data.location || data.locality || data.area || city, city)
    const price = safeNumber(data.price)
    const carpetArea = safeNumber(data.carpetAreaSqFt || data.carpetArea || data.carpet_area || data.area)
    const perSqFt = safeNumber(data.perSqFt || data.per_sq_ft) || (price && carpetArea ? Math.round(price / carpetArea) : 0)
    const bedrooms = safeNumber(data.bedrooms || String(unitType).match(/\d+/)?.[0])
    const bathrooms = safeNumber(data.bathrooms)
    const parking = safeNumber(data.parking)
    const balcony = safeNumber(data.balcony || data.balconies)
    const ownerName = realText(data.fullName || data.full_name || data.ownerFullName || data.owner_full_name)
    const email = realText(data.email)
    const phone = realText(data.phone)
    const whatsapp = realText(data.whatsapp || data.phone)
    const images = asArray(data.images, [])
    const imageUrl = optionalText(data.imageUrl || data.image_url) || images[0] || DEFAULT_IMAGE
    const amenities = asArray(data.amenities, DEFAULT_AMENITIES)
    const furnishingItems = asArray(data.furnishingItems || data.furnishing_items, DEFAULT_FURNISHING_ITEMS)
    const ownerDetails = cleanObject(data.ownerDetails || data.owner_details || {
      fullName: ownerName,
      email,
      phone,
      whatsapp: whatsapp || phone,
    })
    const locationDetails = cleanObject(data.locationDetails || data.location_details || {
      location,
      city,
    })
    const pricingDetails = cleanObject(data.pricingDetails || data.pricing_details || {
      price,
      carpetArea,
      perSqFt,
      negotiable: Boolean(data.negotiable),
    })
    const timelineDetails = cleanObject(data.timelineDetails || data.timeline_details || {})
    const legalDetails = cleanObject(data.legalDetails || data.legal_details || {})
    const nearbyPlaces = normalizeNearbyPlaces(data)
    const title = cleanText(
      data.title,
      [unitType, propertyType, subtype, location && `in ${location}`]
        .filter(Boolean)
        .join(' '),
    )

    return {
      property_code: data.propertyCode || data.property_code || null,
      title,
      property_type: propertyType,
      unit_type: unitType,
      subtype,
      city,
      location,
      price,
      carpet_area: carpetArea,
      per_sq_ft: perSqFt,
      bedrooms,
      bathrooms,
      parking,
      parking_type: cleanText(data.parkingType || data.parking_type, parking ? 'Available' : 'None'),
      floor: cleanText(data.floor),
      total_floors: cleanText(data.totalFloors || data.total_floors),
      furnishing: cleanText(data.furnishing),
      built_year: cleanText(data.builtYear || data.built_year),
      balcony,
      facing: cleanText(data.facing),
      negotiable: data.negotiable ? 1 : 0,
      status: data.status || 'Under Review',
      possession_date: cleanText(data.possessionDate || data.possession_date),
      description: this.buildDescription(data),
      image_url: imageUrl,
      images: stringifyJsonField(images.length ? images : [imageUrl]),
      amenities: stringifyJsonField(amenities.length ? amenities : DEFAULT_AMENITIES),
      furnishing_items: stringifyJsonField(furnishingItems),
      featured: data.featured ? 1 : 0,
      ai_score: safeNumber(data.aiScore || data.ai_score, 90),
      rating: safeNumber(data.rating, 4.8),
      views: safeNumber(data.views),
      growth: cleanText(data.growth, '+12.5%'),
      investment_grade: cleanText(data.investmentGrade || data.investment_grade, 'A'),
      roi_potential: cleanText(data.roiPotential || data.roi_potential, '18.2%'),
      executive_name: realText(data.executiveName || data.executive_name) || ownerName,
      executive_role: cleanText(data.executiveRole || data.executive_role, 'Property Owner'),
      full_name: ownerName,
      email,
      phone,
      whatsapp: whatsapp || phone,
      owner_details: stringifyJsonField(ownerDetails, {}),
      location_details: stringifyJsonField(locationDetails, {}),
      pricing_details: stringifyJsonField(pricingDetails, {}),
      timeline_details: stringifyJsonField(timelineDetails, {}),
      legal_details: stringifyJsonField(legalDetails, {}),
      nearby_places: stringifyJsonField(nearbyPlaces, []),
      ownership_document: cleanText(data.ownershipDocument || data.ownership_document),
    }
  }

  toUpdates(data) {
    const updates = {}
    const fieldMapping = {
      propertyCode: 'property_code',
      property_code: 'property_code',
      title: 'title',
      fullName: 'full_name',
      full_name: 'full_name',
      email: 'email',
      phone: 'phone',
      whatsapp: 'whatsapp',
      propertyType: 'property_type',
      property_type: 'property_type',
      unitType: 'unit_type',
      unit_type: 'unit_type',
      subtype: 'subtype',
      city: 'city',
      location: 'location',
      price: 'price',
      carpetArea: 'carpet_area',
      carpet_area: 'carpet_area',
      perSqFt: 'per_sq_ft',
      per_sq_ft: 'per_sq_ft',
      bedrooms: 'bedrooms',
      bathrooms: 'bathrooms',
      parking: 'parking',
      parkingType: 'parking_type',
      parking_type: 'parking_type',
      floor: 'floor',
      totalFloors: 'total_floors',
      total_floors: 'total_floors',
      furnishing: 'furnishing',
      builtYear: 'built_year',
      built_year: 'built_year',
      balcony: 'balcony',
      facing: 'facing',
      status: 'status',
      possessionDate: 'possession_date',
      possession_date: 'possession_date',
      imageUrl: 'image_url',
      image_url: 'image_url',
      aiScore: 'ai_score',
      ai_score: 'ai_score',
      rating: 'rating',
      views: 'views',
      growth: 'growth',
      investmentGrade: 'investment_grade',
      investment_grade: 'investment_grade',
      roiPotential: 'roi_potential',
      roi_potential: 'roi_potential',
      executiveName: 'executive_name',
      executive_name: 'executive_name',
      executiveRole: 'executive_role',
      executive_role: 'executive_role',
      description: 'description',
      ownershipDocument: 'ownership_document',
      ownership_document: 'ownership_document',
    }

    Object.entries(fieldMapping).forEach(([key, dbField]) => {
      if (data[key] !== undefined) updates[dbField] = data[key]
    })

    if (data.negotiable !== undefined) updates.negotiable = data.negotiable ? 1 : 0
    if (data.featured !== undefined) updates.featured = data.featured ? 1 : 0
    if (data.images !== undefined) updates.images = stringifyJsonField(data.images)
    if (data.amenities !== undefined) updates.amenities = stringifyJsonField(data.amenities)
    if (data.furnishingItems !== undefined) updates.furnishing_items = stringifyJsonField(data.furnishingItems)
    if (data.furnishing_items !== undefined) updates.furnishing_items = stringifyJsonField(data.furnishing_items)
    if (data.ownerDetails !== undefined) updates.owner_details = stringifyJsonField(data.ownerDetails)
    if (data.owner_details !== undefined) updates.owner_details = stringifyJsonField(data.owner_details)
    if (data.locationDetails !== undefined) updates.location_details = stringifyJsonField(data.locationDetails)
    if (data.location_details !== undefined) updates.location_details = stringifyJsonField(data.location_details)
    if (data.pricingDetails !== undefined) updates.pricing_details = stringifyJsonField(data.pricingDetails)
    if (data.pricing_details !== undefined) updates.pricing_details = stringifyJsonField(data.pricing_details)
    if (data.timelineDetails !== undefined) updates.timeline_details = stringifyJsonField(data.timelineDetails)
    if (data.timeline_details !== undefined) updates.timeline_details = stringifyJsonField(data.timeline_details)
    if (data.legalDetails !== undefined) updates.legal_details = stringifyJsonField(data.legalDetails)
    if (data.legal_details !== undefined) updates.legal_details = stringifyJsonField(data.legal_details)
    if (data.nearbyPlaces !== undefined || data.nearby_places !== undefined || data.nearby !== undefined || data.places !== undefined) {
      updates.nearby_places = stringifyJsonField(normalizeNearbyPlaces(data), [])
    }

    return updates
  }

  buildDescription(data) {
    let description = data.description || ''
    if (data.wingUnit) description += `${description ? '\n' : ''}Wing/Unit: ${data.wingUnit}`
    if (data.builtupArea) description += `${description ? '\n' : ''}Builtup Area: ${data.builtupArea} sq.ft`
    if (data.sellingRights) description += `${description ? '\n' : ''}Selling Rights: ${data.sellingRights}`
    return description || 'Property details submitted for admin verification.'
  }
}

module.exports = new PropertyModel()
