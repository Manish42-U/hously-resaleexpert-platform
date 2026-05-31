const BaseModel = require('./BaseModel')

class ContactModel extends BaseModel {
  constructor() {
    super({ table: 'contacts' })
  }

  toRecord(data) {
    return {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      property_type: data.property_type || null,
      budget: data.budget || null,
      subject: data.subject || null,
      message: data.message,
      status: data.status || 'new',
      assigned_to: data.assigned_to || null,
      admin_notes: data.admin_notes || null,
      last_contacted_at: data.last_contacted_at || null,
    }
  }

  toUpdates(data) {
    const updates = {}
    ;[
      'name',
      'email',
      'phone',
      'property_type',
      'budget',
      'subject',
      'message',
      'status',
      'assigned_to',
      'admin_notes',
      'last_contacted_at',
    ].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        updates[key] = data[key] || null
      }
    })
    return updates
  }
}

module.exports = new ContactModel()
