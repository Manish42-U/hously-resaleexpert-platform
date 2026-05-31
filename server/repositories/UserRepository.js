const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User.table);
  }

  async findByEmail(email) {
    return this.findOne('email = ?', [email]);
  }

  async create(data) {
    return super.create(User.toRecord(data));
  }

  async update(id, data) {
    return super.update(id, User.toUpdates(data));
  }
}

module.exports = new UserRepository();
