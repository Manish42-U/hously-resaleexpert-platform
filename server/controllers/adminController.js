const BlogRepository = require('../repositories/BlogRepository');
const ContactRepository = require('../repositories/ContactRepository');
const PropertyRepository = require('../repositories/PropertyRepository');
const UserRepository = require('../repositories/UserRepository');
const WhatsAppRepository = require('../repositories/WhatsAppRepository');
const PaymentRepository = require('../repositories/PaymentRepository');
const AppSettingsService = require('../services/AppSettingsService');
const crypto = require('crypto');

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
};

const normalizeRole = (role) => (
  ['admin', 'manager', 'agent', 'user'].includes(role) ? role : 'user'
);

const roleLabel = (role) => {
  if (role === 'admin') return 'Administrator';
  if (role === 'manager') return 'Manager';
  if (role === 'agent') return 'Agent';
  return 'User';
};

const safeNumber = (value) => {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
};

const currency = (value) => {
  const amount = safeNumber(value);
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(amount % 10000000 ? 2 : 0)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(amount % 100000 ? 1 : 0)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

const daysAgo = (date) => {
  if (!date) return 'Recently';
  const then = new Date(date).getTime();
  if (Number.isNaN(then)) return 'Recently';
  const diff = Math.max(0, Date.now() - then);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const propertyTitle = (property) => (
  property.title ||
  [property.unit_type, property.property_type, property.subtype].filter(Boolean).join(' ') ||
  'Property'
);

const propertyLocation = (property) => (
  [property.location, property.city].filter(Boolean).join(', ') || 'Location pending'
);

const leadScore = (lead) => {
  let score = 35;
  if (lead.phone) score += 18;
  if (lead.email) score += 12;
  if (lead.budget) score += 15;
  if (lead.property_type) score += 10;
  if (String(lead.message || '').length > 60) score += 10;
  return Math.min(score, 100);
};

const leadPriority = (score) => {
  if (score >= 75) return 'hot';
  if (score >= 55) return 'warm';
  return 'new';
};

const lifecycleStage = (status = '') => {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('sold') || normalized.includes('closed')) return 'Closed';
  if (normalized.includes('review') || normalized.includes('pending')) return 'Verification';
  if (normalized.includes('available') || normalized.includes('active')) return 'Live Inventory';
  return status || 'Intake';
};

const stageProbability = (stage = '') => {
  const normalized = String(stage).toLowerCase();
  if (normalized.includes('closed')) return 100;
  if (normalized.includes('verification')) return 68;
  if (normalized.includes('live')) return 52;
  if (normalized.includes('priority')) return 45;
  return 24;
};

const buildTeamPerformance = (users, properties) => {
  const team = new Map();

  users.forEach((user) => {
    if (!user.name) return;
    team.set(user.name, {
      id: `user-${user.id}`,
      name: user.name,
      email: user.email,
      role: roleLabel(user.role),
      territory: 'Unassigned',
      listings: 0,
      review: 0,
      live: 0,
      value: 0,
      avgScore: 0,
      scoreTotal: 0,
      phone: '',
    });
  });

  properties.forEach((property) => {
    const name = property.executive_name || property.full_name || 'Unassigned Executive';
    const current = team.get(name) || {
      id: `executive-${name}`,
      name,
      email: property.email || '',
      role: property.executive_role || 'Property Executive',
      territory: property.city || property.location || 'Pune',
      listings: 0,
      review: 0,
      live: 0,
      value: 0,
      avgScore: 0,
      scoreTotal: 0,
      phone: property.phone || '',
    };
    current.listings += 1;
    current.value += safeNumber(property.price);
    current.scoreTotal += safeNumber(property.ai_score);
    if (String(property.status || '').toLowerCase() === 'available') current.live += 1;
    else current.review += 1;
    if (!current.phone && property.phone) current.phone = property.phone;
    if (!current.email && property.email) current.email = property.email;
    if (property.location) current.territory = property.location.split(',')[0];
    team.set(name, current);
  });

  return Array.from(team.values())
    .map((member) => ({
      ...member,
      valueLabel: currency(member.value),
      avgScore: member.listings ? Math.round(member.scoreTotal / member.listings) : 0,
      workload: member.review > 3 ? 'Overloaded' : member.listings ? 'Active' : 'Available',
    }))
    .sort((a, b) => b.value - a.value || b.listings - a.listings);
};

exports.getSummary = async (req, res) => {
  try {
    const [properties, blogs, contacts, users, payments] = await Promise.all([
      PropertyRepository.findAll(),
      BlogRepository.findAll(),
      ContactRepository.findAll(),
      UserRepository.findAll(),
      PaymentRepository.findAll().catch(() => []),
    ]);
    const paymentRevenue = payments.reduce((sum, payment) => sum + safeNumber(payment.amount), 0);

    return res.json({
      success: true,
      stats: {
        properties: properties.length,
        blogs: blogs.length,
        contacts: contacts.length,
        users: users.length,
        payments: payments.length,
        subscriptions: payments.length,
        paymentRevenue,
        featuredProperties: properties.filter((property) => property.featured).length,
        availableProperties: properties.filter((property) => property.status !== 'Sold Out').length,
      },
      recent: {
        properties: properties.slice(0, 5),
        blogs: blogs.slice(0, 5),
        contacts: contacts.slice(0, 5),
        users: users.slice(0, 5),
        payments: payments.slice(0, 5),
      },
    });
  } catch (error) {
    console.error('admin summary error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load admin summary' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await UserRepository.findAll();
    return res.json({ success: true, data: users, count: users.length });
  } catch (error) {
    console.error('admin users error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load users' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await UserRepository.findByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const safeRole = normalizeRole(role);
    const result = await UserRepository.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashPassword(password),
      role: safeRole,
    });

    return res.status(201).json({
      success: true,
      message: `${roleLabel(safeRole)} created successfully`,
      data: {
        id: result.insertId,
        name: String(name).trim(),
        email: normalizedEmail,
        role: safeRole,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('admin create user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = String(name).trim();
    if (email !== undefined) {
      const normalizedEmail = String(email).toLowerCase().trim();
      const existing = await UserRepository.findByEmail(normalizedEmail);
      if (existing && String(existing.id) !== String(req.params.id)) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }
      updates.email = normalizedEmail;
    }
    if (password) updates.password = hashPassword(password);
    if (role !== undefined) updates.role = normalizeRole(role);

    const result = await UserRepository.update(req.params.id, updates);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updated = await UserRepository.findById(req.params.id);
    const { password: _, ...safeUser } = updated;
    return res.json({ success: true, message: 'User updated successfully', data: safeUser });
  } catch (error) {
    console.error('admin update user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const result = await UserRepository.delete(req.params.id);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('admin delete user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await AppSettingsService.getSettings();
    return res.json({ success: true, data: settings });
  } catch (error) {
    console.error('admin settings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = await AppSettingsService.updateSettings({
      ...req.body,
      updatedBy: req.body.updatedBy || 'Admin',
    });
    return res.json({ success: true, message: 'Settings saved successfully', data: settings });
  } catch (error) {
    console.error('admin update settings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save settings' });
  }
};

exports.getCounts = async (req, res) => {
  try {
    const [properties, blogs, contacts, users] = await Promise.all([
      PropertyRepository.findAll(),
      BlogRepository.findAll(),
      ContactRepository.findAll(),
      UserRepository.findAll(),
    ]);

    return res.json({
      success: true,
      data: {
        properties: properties.length,
        blogs: blogs.length,
        contacts: contacts.length,
        users: users.length,
      },
    });
  } catch (error) {
    console.error('admin counts error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load counts' });
  }
};

exports.getWorkspace = async (req, res) => {
  try {
    const [properties, blogs, contacts, users, whatsappContacts, settings, payments] = await Promise.all([
      PropertyRepository.findAll(),
      BlogRepository.findAll(),
      ContactRepository.findAll(),
      UserRepository.findAll(),
      WhatsAppRepository.getAllContactsWithMessages().catch(() => []),
      AppSettingsService.getSettings(),
      PaymentRepository.findAll().catch(() => []),
    ]);

    const totalValue = properties.reduce((sum, property) => sum + safeNumber(property.price), 0);
    const availableProperties = properties.filter((property) => String(property.status || '').toLowerCase() === 'available');
    const reviewProperties = properties.filter((property) => String(property.status || '').toLowerCase() !== 'available');
    const soldProperties = properties.filter((property) => String(property.status || '').toLowerCase().includes('sold'));
    const visibleWhatsappContacts = settings.whatsappEnabled ? whatsappContacts : [];
    const unreadMessages = visibleWhatsappContacts.reduce((sum, contact) => sum + safeNumber(contact.unread_count), 0);
    const paymentRevenue = payments.reduce((sum, payment) => sum + safeNumber(payment.amount), 0);
    const paidPayments = payments.filter((payment) => String(payment.status || '').toLowerCase().includes('paid'));
    const recentPayments = payments.slice(0, 8);
    const teamPerformance = buildTeamPerformance(users, properties);

    const leads = contacts.map((contact) => {
      const score = leadScore(contact);
      return {
        id: contact.id,
        name: contact.name || 'Unnamed lead',
        phone: contact.phone || '',
        email: contact.email || '',
        source: 'Website',
        budget: contact.budget || '',
        location: contact.subject || '',
        interest: contact.property_type || contact.subject || 'General enquiry',
        stage: contact.status || 'new',
        priority: leadPriority(score),
        score,
        notes: contact.message || '',
        admin_notes: contact.admin_notes || '',
        assigned_to: contact.assigned_to || '',
        last_contacted_at: contact.last_contacted_at,
        created_at: contact.created_at,
        lastContact: contact.last_contacted_at ? daysAgo(contact.last_contacted_at) : daysAgo(contact.created_at),
      };
    });

    const pipeline = [
      ...leads.map((lead) => ({
        id: `L-${lead.id}`,
        type: 'Lead',
        title: lead.name,
        subtitle: lead.interest,
        value: lead.budget || 'Budget pending',
        stage: lead.priority === 'hot' ? 'Priority Follow-up' : 'New Enquiry',
        owner: lead.assigned_to || 'Unassigned',
        phone: lead.phone,
        email: lead.email,
        created_at: lead.created_at,
        score: lead.score,
      })),
      ...properties.map((property) => ({
        id: property.property_code || `P-${property.id}`,
        type: 'Property',
        title: propertyTitle(property),
        subtitle: propertyLocation(property),
        value: currency(property.price),
        stage: lifecycleStage(property.status),
        rawStage: property.status || 'Under Review',
        owner: property.executive_name || property.full_name || 'Unassigned',
        phone: property.phone,
        email: property.email,
        created_at: property.created_at,
        score: property.ai_score || 0,
        probability: stageProbability(lifecycleStage(property.status)),
      })),
    ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    const manager = {
      team: teamPerformance,
      pipeline: pipeline.map((item) => ({
        ...item,
        probability: item.probability || stageProbability(item.stage) + Math.round(safeNumber(item.score) / 10),
        risk: item.type === 'Property' && String(item.rawStage || item.stage).toLowerCase() !== 'available' ? 'Needs verification' : item.score >= 85 ? 'High intent' : 'Normal',
      })),
      bottlenecks: [
        { label: 'Owner verification', value: reviewProperties.length, action: 'Call owners and verify documents' },
        { label: 'Hot lead follow-up', value: leads.filter((lead) => lead.priority === 'hot').length, action: 'Assign senior agent within 30 minutes' },
        { label: 'Unread WhatsApp', value: unreadMessages, action: 'Clear conversations before EOD' },
      ],
      territories: Object.entries(properties.reduce((acc, property) => {
        const key = property.location || property.city || 'Location pending';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 8),
    };

    const agentQueue = [
      ...leads.map((lead) => ({
        id: `lead-${lead.id}`,
        type: 'Buyer lead',
        title: lead.name,
        subtitle: lead.interest,
        context: lead.budget || lead.notes || 'Budget pending',
        priority: lead.priority,
        score: lead.score,
        phone: lead.phone,
        email: lead.email,
        stage: lead.stage,
        assigned_to: lead.assigned_to,
        due: lead.priority === 'hot' ? 'Call now' : 'Today',
        created_at: lead.created_at,
      })),
      ...reviewProperties.map((property) => ({
        id: `listing-${property.id}`,
        type: 'Listing verification',
        title: propertyTitle(property),
        subtitle: propertyLocation(property),
        context: property.full_name || property.email || 'Owner details pending',
        priority: 'medium',
        score: safeNumber(property.ai_score),
        phone: property.phone,
        email: property.email,
        due: 'Verify today',
        created_at: property.created_at,
      })),
    ].filter((item) => item.phone || item.email || item.type === 'Listing verification')
      .sort((a, b) => (safeNumber(b.score) - safeNumber(a.score)) || new Date(b.created_at || 0) - new Date(a.created_at || 0));

    const agent = {
      queue: agentQueue,
      scripts: [
        { title: 'Buyer qualification', prompt: 'Confirm location, budget, timeline and financing status.' },
        { title: 'Owner verification', prompt: 'Confirm ownership, expected price, possession and document readiness.' },
        { title: 'Site visit booking', prompt: 'Offer two visit slots and confirm WhatsApp location sharing.' },
      ],
      goals: {
        callsToday: agentQueue.filter((item) => item.phone).length,
        hotLeads: leads.filter((lead) => lead.priority === 'hot').length,
        reviews: reviewProperties.length,
      },
    };

    const crm = {
      segments: [
        { label: 'Hot buyers', count: leads.filter((lead) => lead.priority === 'hot').length, description: 'High-score website enquiries ready for immediate call' },
        { label: 'Active owners', count: properties.filter((property) => property.phone || property.email).length, description: 'Property owners with contact details' },
        { label: 'Review inventory', count: reviewProperties.length, description: 'Listings waiting for verification or admin action' },
        { label: 'WhatsApp contacts', count: visibleWhatsappContacts.length, description: settings.whatsappEnabled ? 'Conversation records available in WhatsApp CRM' : 'WhatsApp CRM is disabled in settings' },
      ],
      relationships: [
        ...leads.map((lead) => ({
          id: `lead-${lead.id}`,
          kind: 'Buyer',
          name: lead.name,
          headline: lead.interest,
          value: lead.budget || 'Budget pending',
          health: lead.score,
          owner: 'Unassigned',
          phone: lead.phone,
          email: lead.email,
          nextAction: lead.priority === 'hot' ? 'Call immediately' : 'Qualify requirement',
          created_at: lead.created_at,
        })),
        ...properties.map((property) => ({
          id: `owner-${property.id}`,
          kind: 'Owner',
          name: property.full_name || property.executive_name || 'Property owner',
          headline: propertyTitle(property),
          value: currency(property.price),
          health: safeNumber(property.ai_score),
          owner: property.executive_name || 'Unassigned',
          phone: property.phone,
          email: property.email,
          nextAction: String(property.status || '').toLowerCase() === 'available' ? 'Keep listing warm' : 'Verify listing',
          created_at: property.created_at,
        })),
      ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)),
    };

    const communication = {
      sla: {
        immediate: leads.filter((lead) => lead.priority === 'hot').length + unreadMessages,
        today: agentQueue.length,
        review: reviewProperties.length,
      },
      channels: [
        { label: 'Calls', count: agentQueue.filter((item) => item.phone).length, status: 'Ready' },
        { label: 'Email', count: agentQueue.filter((item) => item.email).length, status: 'Ready' },
        { label: 'WhatsApp', count: visibleWhatsappContacts.length, status: settings.whatsappEnabled ? 'Enabled' : 'Disabled' },
      ],
      queue: agentQueue.map((item) => ({
        ...item,
        channel: item.phone ? 'Call + WhatsApp' : 'Email',
        reason: item.priority === 'hot' ? `High lead score ${item.score}` : item.context,
      })),
    };

    const notifications = [
      ...contacts.slice(0, 6).map((lead) => ({
        id: `lead-${lead.id}`,
        category: 'Leads',
        type: 'lead',
        title: `New lead: ${lead.name || 'Unnamed lead'}`,
        desc: `${lead.property_type || 'Property enquiry'}${lead.budget ? ` · ${lead.budget}` : ''}`,
        priority: leadPriority(leadScore(lead)),
        unread: true,
        leadStatus: lead.status || 'new',
        time: daysAgo(lead.created_at),
        created_at: lead.created_at,
      })),
      ...reviewProperties.slice(0, 6).map((property) => ({
        id: `property-${property.id}`,
        category: 'Listings',
        type: 'property',
        title: `Review listing: ${propertyTitle(property)}`,
        desc: [property.location, property.city, property.status].filter(Boolean).join(' · '),
        priority: 'medium',
        unread: false,
        time: daysAgo(property.created_at),
        created_at: property.created_at,
      })),
      ...visibleWhatsappContacts.filter((contact) => safeNumber(contact.unread_count) > 0).slice(0, 6).map((contact) => ({
        id: `wa-${contact.id}`,
        category: 'WhatsApp',
        type: 'message',
        title: `WhatsApp: ${contact.name || contact.phone_number}`,
        desc: contact.last_message || 'Unread WhatsApp conversation',
        priority: 'high',
        unread: true,
        time: daysAgo(contact.last_message_at),
        created_at: contact.last_message_at,
      })),
      ...recentPayments.slice(0, 4).map((payment) => ({
        id: `payment-${payment.id}`,
        category: 'Payments',
        type: 'payment',
        title: `Payment created: ${payment.label || payment.plan}`,
        desc: `${currency(payment.amount)} · ${payment.status || 'created'}${payment.property_code ? ` · ${payment.property_code}` : ''}`,
        priority: 'medium',
        unread: true,
        time: daysAgo(payment.created_at),
        created_at: payment.created_at,
      })),
      ...(settings.maintenanceMode ? [{
        id: 'system-maintenance',
        category: 'System',
        type: 'system',
        title: 'Maintenance mode is enabled',
        desc: settings.maintenanceMessage,
        priority: 'high',
        unread: true,
        time: 'Now',
        created_at: new Date().toISOString(),
      }] : []),
    ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    const notificationCenter = {
      summary: [
        { label: 'Critical', count: notifications.filter((item) => ['high', 'hot'].includes(item.priority)).length },
        { label: 'Unread', count: notifications.filter((item) => item.unread).length },
        { label: 'Listings', count: notifications.filter((item) => item.category === 'Listings').length },
        { label: 'Leads', count: notifications.filter((item) => item.category === 'Leads').length },
      ],
      rules: [
        { label: 'Hot lead SLA', state: settings.emailNotifications ? 'Active' : 'Paused', detail: 'Alert manager when high-score lead arrives' },
        { label: 'Listing review', state: settings.emailNotifications ? 'Active' : 'Paused', detail: 'Notify admin until pending listing is verified' },
        { label: 'WhatsApp unread', state: settings.whatsappEnabled ? 'Active' : 'Paused', detail: 'Raise alert for unread customer messages' },
      ],
    };

    const reports = settings.weeklyReports ? [
      {
        id: 'property-inventory',
        name: 'Property Inventory',
        description: `${properties.length} listings, ${availableProperties.length} available, ${reviewProperties.length} pending/admin review`,
        metric: properties.length,
        value: currency(totalValue),
        status: properties.length ? 'ready' : 'empty',
      },
      {
        id: 'lead-pipeline',
        name: 'Lead Pipeline',
        description: `${contacts.length} website enquiries with ${leads.filter((lead) => lead.priority === 'hot').length} high-priority follow-ups`,
        metric: contacts.length,
        value: `${contacts.length} leads`,
        status: contacts.length ? 'ready' : 'empty',
      },
      {
        id: 'payment-history',
        name: 'Payment & Subscription History',
        description: `${payments.length} Razorpay payment records with ${currency(paymentRevenue)} total created value`,
        metric: payments.length,
        value: currency(paymentRevenue),
        status: payments.length ? 'ready' : 'empty',
      },
      {
        id: 'content-health',
        name: 'Content Health',
        description: `${blogs.length} blogs and ${properties.filter((property) => property.featured).length} featured listings live in CMS`,
        metric: blogs.length,
        value: `${blogs.length} posts`,
        status: blogs.length ? 'ready' : 'empty',
      },
    ] : [
      {
        id: 'weekly-reports-paused',
        name: 'Weekly Reports Paused',
        description: 'Weekly reports are disabled in platform settings.',
        metric: 0,
        value: 'Paused',
        status: 'paused',
      },
    ];

    return res.json({
      success: true,
      data: {
        stats: {
          properties: properties.length,
          availableProperties: availableProperties.length,
          reviewProperties: reviewProperties.length,
          soldProperties: soldProperties.length,
          blogs: blogs.length,
          contacts: contacts.length,
          users: users.length,
          whatsappContacts: visibleWhatsappContacts.length,
          unreadMessages,
          payments: payments.length,
          subscriptions: payments.length,
          paymentRevenue,
          paidPaymentRevenue: paidPayments.reduce((sum, payment) => sum + safeNumber(payment.amount), 0),
          totalValue,
          conversionRate: properties.length ? Math.round((soldProperties.length / properties.length) * 100) : 0,
        },
        properties,
        blogs,
        contacts,
        users: users.map(({ password, ...user }) => user),
        whatsappContacts: visibleWhatsappContacts,
        payments,
        subscriptions: payments,
        settings,
        manager,
        agent,
        crm,
        communication,
        notificationCenter,
        leads,
        pipeline,
        notifications,
        reports,
      },
    });
  } catch (error) {
    console.error('admin workspace error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load admin workspace' });
  }
};
