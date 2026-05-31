const ContactRepository = require('../repositories/ContactRepository');
const AppSettingsService = require('../services/AppSettingsService');
const WhatsAppService = require('../services/WhatsAppService');

exports.submitContact = async (req, res) => {
  try {
    const settings = await AppSettingsService.getSettings();
    await ContactRepository.create({
      ...req.body,
      assigned_to: req.body.assigned_to || (settings.autoAssignLeads ? 'Admin Team' : null),
    });

    // Send WhatsApp confirmation if phone is provided
    if (settings.whatsappEnabled && req.body.phone) {
      const cleanPhone = req.body.phone.replace(/\D/g, '');
      const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      
      const message = `Hello ${req.body.name || 'there'}! Thank you for contacting Hously Finntech Realty regarding ${req.body.property_type || 'property'}. Our team will get back to you shortly.`;
      
      // Send in background
      WhatsAppService.sendMessage(phoneWithCode, message).catch(err => console.error('Auto-WhatsApp failed:', err.message));
    }

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await ContactRepository.findAll();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts' });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    await ContactRepository.delete(req.params.id);
    res.status(200).json({ message: 'Enquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting enquiry' });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const allowedStatus = ['new', 'contacted', 'qualified', 'site_visit', 'negotiation', 'closed', 'lost'];
    const payload = { ...req.body };
    if (payload.status && !allowedStatus.includes(payload.status)) {
      return res.status(400).json({ message: 'Invalid lead status' });
    }
    await ContactRepository.update(req.params.id, payload);
    const updated = await ContactRepository.findById(req.params.id);
    return res.status(200).json(updated);
  } catch (error) {
    console.error('update contact error:', error);
    return res.status(500).json({ message: 'Error updating enquiry' });
  }
};
