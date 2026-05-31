const BaseRepository = require('./BaseRepository');
const Contact = require('../models/Contact');

class ContactRepository extends BaseRepository {
  constructor() {
    super(Contact.table);
  }

  async create(data) {
    return super.create(Contact.toRecord(data));
  }

  async update(id, data) {
    return super.update(id, Contact.toUpdates(data));
  }
}

module.exports = new ContactRepository();
