const BaseModel = require('./BaseModel')

class WhatsAppContactModel extends BaseModel {
  constructor() {
    super({
      table: 'whatsapp_contacts',
      numberFields: ['unread_count'],
    })
  }

  toRecord(data) {
    return {
      phone_number: data.phoneNumber,
      name: data.name || null,
      last_message: data.lastMessage || null,
      last_message_at: data.lastMessageAt || null,
      unread_count: data.unreadCount || 0,
    }
  }

  toUpdates(data) {
    const updates = {}
    if (data.name !== undefined) updates.name = data.name
    if (data.lastMessage !== undefined) updates.last_message = data.lastMessage
    if (data.lastMessageAt !== undefined) updates.last_message_at = data.lastMessageAt
    if (data.unreadCount !== undefined) updates.unread_count = data.unreadCount
    return updates
  }
}

module.exports = new WhatsAppContactModel()
