const whatsappService = require('../services/WhatsAppService');
const whatsappRepository = require('../repositories/WhatsAppRepository');
const AppSettingsService = require('../services/AppSettingsService');

const ensureWhatsAppEnabled = async (res) => {
  const settings = await AppSettingsService.getSettings();
  if (settings.whatsappEnabled) return true;
  res.status(403).json({
    success: false,
    message: 'WhatsApp CRM is disabled in platform settings.',
  });
  return false;
};

exports.getContacts = async (req, res) => {
  try {
    if (!await ensureWhatsAppEnabled(res)) return;
    const contacts = await whatsappRepository.getAllContactsWithMessages();
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    if (!await ensureWhatsAppEnabled(res)) return;
    const { contactId } = req.params;
    const messages = await whatsappRepository.getMessagesByContactId(contactId);
    
    // Reset unread count when messages are fetched
    await whatsappRepository.updateContact(contactId, { unreadCount: 0 });
    
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    if (!await ensureWhatsAppEnabled(res)) return;
    const { to, text } = req.body;
    if (!to || !text) {
      return res.status(400).json({ success: false, message: 'Recipient and text are required' });
    }
    const result = await whatsappService.sendMessage(to, text);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
};

exports.receiveWebhook = async (req, res) => {
  try {
    if (!await ensureWhatsAppEnabled(res)) return;
    console.log('Webhook received:', JSON.stringify(req.body, null, 2));
    await whatsappService.handleWebhook(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.sendStatus(500);
  }
};

exports.simulateIncomingMessage = async (req, res) => {
  try {
    if (!await ensureWhatsAppEnabled(res)) return;
    const { from, body } = req.body;
    const mockData = {
      object: 'whatsapp_business_account',
      entry: [{
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: { display_phone_number: '123456789', phone_number_id: '123' },
            contacts: [{ profile: { name: 'Simulator User' }, wa_id: from }],
            messages: [{
              from: from || '919876543210',
              id: `mock-${Date.now()}`,
              timestamp: Math.floor(Date.now() / 1000),
              text: { body: body || 'Hello, I am testing the CRM!' },
              type: 'text'
            }]
          },
          field: 'messages'
        }]
      }]
    };
    await whatsappService.handleWebhook(mockData);
    res.json({ success: true, message: 'Message simulated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    if (!await ensureWhatsAppEnabled(res)) return;
    const { contactId } = req.params;
    await whatsappRepository.deleteContact(contactId);
    res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
