const axios = require('axios');
const whatsappRepository = require('../repositories/WhatsAppRepository');

class WhatsAppService {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.baseUrl = 'https://graph.facebook.com/v20.0';
  }

  async sendMessage(to, text) {
    try {
      // 1. Ensure contact exists in our DB first (Lead tracking)
      let contact = await whatsappRepository.findContactByPhone(to);
      if (!contact) {
        const contactId = await whatsappRepository.createContact({ phoneNumber: to });
        contact = { id: contactId };
      }

      // 2. Try to send via Meta API
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'text',
          text: { body: text },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const waMessageId = response.data.messages[0].id;

      // 3. Log the outgoing message
      await whatsappRepository.createMessage({
        contactId: contact.id,
        waMessageId: waMessageId,
        body: text,
        direction: 'outgoing',
        status: 'sent',
      });

      await whatsappRepository.updateContact(contact.id, {
        lastMessage: text,
        lastMessageAt: new Date(),
      });

      return response.data;
    } catch (error) {
      const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
      console.error('WhatsApp Send Error:', errorMsg);
      
      // Still log a "failed" message in our DB for visibility if we have a contact
      let contact = await whatsappRepository.findContactByPhone(to);
      if (contact) {
        await whatsappRepository.createMessage({
          contactId: contact.id,
          waMessageId: `error-${Date.now()}`,
          body: `[FAILED TO SEND]: ${text} (Error: ${errorMsg})`,
          direction: 'outgoing',
          status: 'failed',
        });
      }
      
      throw new Error(`WhatsApp API Error: ${errorMsg}`);
    }
  }

  async handleWebhook(data) {
    if (!data.object) return;

    for (const entry of data.entry) {
      for (const change of entry.changes) {
        if (change.field !== 'messages') continue;

        const value = change.value;
        if (!value.messages) {
          if (value.statuses) {
            for (const status of value.statuses) {
              await whatsappRepository.updateMessageStatus(status.id, status.status);
            }
          }
          continue;
        }

        for (const message of value.messages) {
          const from = message.from;
          const body = message.text ? message.text.body : '[Media Message]';
          const waMessageId = message.id;
          const timestamp = new Date(parseInt(message.timestamp) * 1000);

          let contact = await whatsappRepository.findContactByPhone(from);
          if (!contact) {
            const contactId = await whatsappRepository.createContact({ 
              phoneNumber: from,
              name: value.contacts ? value.contacts[0].profile.name : null
            });
            contact = { id: contactId };
          }

          await whatsappRepository.createMessage({
            contactId: contact.id,
            waMessageId: waMessageId,
            body: body,
            type: message.type,
            direction: 'incoming',
            timestamp: timestamp,
          });

          await whatsappRepository.updateContact(contact.id, {
            lastMessage: body,
            lastMessageAt: timestamp,
            unreadCount: (contact.unread_count || 0) + 1
          });

          // --- Auto-Responder Logic ---
          const lowerBody = body.toLowerCase();
          let autoReply = "";

          if (lowerBody.includes('interested in property')) {
            autoReply = "Thank you for your interest! A property expert will contact you shortly with more details and to schedule a visit. Do you have any specific questions about this property?";
          } else if (lowerBody.includes('hi') || lowerBody.includes('hello')) {
            autoReply = `Hello! Welcome to Hously Finntech Realty. How can we help you today? \n\n1. Search Properties\n2. Sell Property\n3. Talk to Agent`;
          }

          if (autoReply) {
            setTimeout(async () => {
              try {
                await this.sendMessage(from, autoReply);
              } catch (err) {
                console.error('Auto-reply failed:', err.message);
              }
            }, 2000);
          }
        }
      }
    }
  }
}

module.exports = new WhatsAppService();
