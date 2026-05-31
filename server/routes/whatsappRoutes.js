const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

// Webhook routes (called by Meta)
router.get('/webhook', whatsappController.verifyWebhook);
router.post('/webhook', whatsappController.receiveWebhook);

// Admin routes
router.get('/contacts', whatsappController.getContacts);
router.get('/messages/:contactId', whatsappController.getMessages);
router.post('/send', whatsappController.sendMessage);
router.post('/simulate', whatsappController.simulateIncomingMessage);
router.delete('/contacts/:contactId', whatsappController.deleteContact);

module.exports = router;
