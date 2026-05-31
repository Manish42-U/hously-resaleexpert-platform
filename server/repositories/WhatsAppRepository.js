const BaseRepository = require('./BaseRepository');
const WhatsAppContact = require('../models/WhatsAppContact');
const WhatsAppMessage = require('../models/WhatsAppMessage');

class WhatsAppRepository extends BaseRepository {
  constructor() {
    super(WhatsAppContact.table);
  }

  async findContactByPhone(phoneNumber) {
    const [rows] = await this.db.execute(
      'SELECT * FROM whatsapp_contacts WHERE phone_number = ? LIMIT 1',
      [phoneNumber]
    );
    return WhatsAppContact.normalize(rows[0]);
  }

  async createContact(data) {
    const result = await super.create(WhatsAppContact.toRecord(data));
    return result.insertId;
  }

  async updateContact(id, data) {
    return super.update(id, WhatsAppContact.toUpdates(data));
  }

  async getMessagesByContactId(contactId) {
    const [rows] = await this.db.execute(
      'SELECT * FROM whatsapp_messages WHERE contact_id = ? ORDER BY timestamp ASC',
      [contactId]
    );
    return rows.map((row) => WhatsAppMessage.normalize(row));
  }

  async createMessage(data) {
    const record = WhatsAppMessage.toRecord(data);
    const [result] = await this.db.execute(
      'INSERT INTO whatsapp_messages (contact_id, wa_message_id, body, type, direction, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        record.contact_id,
        record.wa_message_id,
        record.body,
        record.type,
        record.direction,
        record.status,
        record.timestamp
      ]
    );
    return result.insertId;
  }

  async updateMessageStatus(waMessageId, status) {
    await this.db.execute(
      'UPDATE whatsapp_messages SET status = ? WHERE wa_message_id = ?',
      [status, waMessageId]
    );
  }

  async getAllContactsWithMessages() {
    const [rows] = await this.db.execute(
      'SELECT * FROM whatsapp_contacts ORDER BY last_message_at DESC'
    );
    return rows.map((row) => WhatsAppContact.normalize(row));
  }

  async deleteContact(id) {
    await this.db.execute('DELETE FROM whatsapp_messages WHERE contact_id = ?', [id]);
    await this.db.execute('DELETE FROM whatsapp_contacts WHERE id = ?', [id]);
  }
}

module.exports = new WhatsAppRepository();
