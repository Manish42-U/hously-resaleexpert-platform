const BaseModel = require('./BaseModel')

class UserModel extends BaseModel {
  constructor() {
    super({ table: 'users' })
  }

  toRecord(data) {
    return {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'user',
    }
  }

  toUpdates(data) {
    const updates = {}
    if (data.name !== undefined) updates.name = data.name
    if (data.email !== undefined) updates.email = data.email
    if (data.password !== undefined) updates.password = data.password
    if (data.role !== undefined) updates.role = data.role
    return updates
  }
}

module.exports = new UserModel()
