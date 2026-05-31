export const toArray = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

export const initials = (name = '') => {
  const clean = String(name || '').trim()
  if (!clean) return 'NA'
  return clean
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export const formatCurrency = (value) => {
  if (value === undefined || value === null || value === '') return 'Not set'
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return String(value)
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(amount % 10000000 ? 2 : 0)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(amount % 100000 ? 1 : 0)} L`
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

export const formatDate = (date) => {
  if (!date) return 'No date'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'No date'
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export const formatTime = (date) => {
  if (!date) return 'Today'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'Today'
  return parsed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export const getPropertyTitle = (property) => (
  property?.title ||
  [property?.unit_type || property?.unitType, property?.property_type || property?.propertyType, property?.subtype]
    .filter(Boolean)
    .join(' ') ||
  'Property'
)

export const getPropertyLocation = (property) => (
  [property?.location, property?.city].filter(Boolean).join(', ') || 'Location pending'
)

export const leadScore = (lead) => {
  let score = 35
  if (lead?.phone) score += 18
  if (lead?.email) score += 12
  if (lead?.budget) score += 15
  if (lead?.property_type) score += 10
  if (String(lead?.message || '').length > 60) score += 10
  return Math.min(score, 100)
}

export const leadInterest = (score) => {
  if (score >= 75) return 'High'
  if (score >= 55) return 'Medium'
  return 'Low'
}

export const statusToStage = (status = '') => {
  const normalized = String(status).toLowerCase()
  if (normalized.includes('sold') || normalized.includes('closed')) return 'Closed Won'
  if (normalized.includes('review') || normalized.includes('pending')) return 'Documentation'
  if (normalized.includes('available') || normalized.includes('active')) return 'Active'
  return status || 'Lead'
}

export const stageProbability = (stage = '') => {
  const normalized = String(stage).toLowerCase()
  if (normalized.includes('closed')) return 100
  if (normalized.includes('documentation')) return 75
  if (normalized.includes('active')) return 55
  if (normalized.includes('visit')) return 45
  return 25
}

export const buildTeamFromRealData = (users = [], properties = []) => {
  const map = new Map()

  users.forEach((user) => {
    if (!user?.name) return
    map.set(user.name, {
      id: `user-${user.id}`,
      name: user.name,
      role: user.role === 'admin' ? 'Administrator' : 'User',
      deals: 0,
      revenueValue: 0,
      avatar: initials(user.name),
      email: user.email,
    })
  })

  properties.forEach((property) => {
    const name = property.executive_name || property.executiveName || property.full_name || property.fullName
    if (!name) return
    const current = map.get(name) || {
      id: `executive-${name}`,
      name,
      role: property.executive_role || property.executiveRole || 'Property Executive',
      deals: 0,
      revenueValue: 0,
      avatar: initials(name),
      email: property.email || '',
    }
    current.deals += 1
    current.revenueValue += Number(property.price || 0)
    map.set(name, current)
  })

  return Array.from(map.values())
    .map((member) => ({ ...member, revenue: formatCurrency(member.revenueValue), rating: member.deals ? 4.5 + Math.min(member.deals, 5) / 10 : null }))
    .sort((a, b) => b.deals - a.deals || b.revenueValue - a.revenueValue)
}

export const buildPipelineFromRealData = (contacts = [], properties = []) => {
  const contactRows = contacts.map((contact) => {
    const score = leadScore(contact)
    return {
      id: `L-${contact.id}`,
      client: contact.name || 'Unnamed lead',
      property: [contact.property_type, contact.subject].filter(Boolean).join(' · ') || contact.message || 'General enquiry',
      agent: 'Unassigned',
      amount: contact.budget || 'Not set',
      stage: 'Lead',
      probability: stageProbability('Lead') + Math.round(score / 8),
      date: formatDate(contact.created_at),
      phone: contact.phone,
      email: contact.email,
      source: 'Contact form',
    }
  })

  const propertyRows = properties.map((property) => {
    const stage = statusToStage(property.status)
    return {
      id: property.property_code || property.propertyCode || `P-${property.id}`,
      client: property.full_name || property.fullName || property.email || 'Owner not added',
      property: `${getPropertyTitle(property)} · ${getPropertyLocation(property)}`,
      agent: property.executive_name || property.executiveName || 'Unassigned',
      amount: formatCurrency(property.price),
      stage,
      probability: stageProbability(stage),
      date: formatDate(property.created_at),
      phone: property.phone,
      email: property.email,
      source: 'Property listing',
    }
  })

  const unique = new Map()
  ;[...contactRows, ...propertyRows].forEach((row) => unique.set(row.id, row))
  return Array.from(unique.values())
}
