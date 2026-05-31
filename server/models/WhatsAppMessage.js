const BaseModel = require('./BaseModel')

class WhatsAppMessageModel extends BaseModel {
  constructor() {
    super({
      table: 'whatsapp_messages',
      numberFields: ['contact_id'],
    })
  }

  toRecord(data) {
    return {
      contact_id: data.contactId,
      wa_message_id: data.waMessageId,
      body: data.body,
      type: data.type || 'text',
      direction: data.direction,
      status: data.status || 'sent',
      timestamp: data.timestamp || new Date(),
    }
  }
}

module.exports = new WhatsAppMessageModel()
