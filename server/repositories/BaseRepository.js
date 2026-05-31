const db = require('../config/db');
const { 
  quoteIdentifier, 
  insertRecord, 
  updateRecord, 
  deleteRecord 
} = require('../models/dbHelpers');

class BaseRepository {
  constructor(table) {
    this.table = table;
    this.db = db;
  }

  async findAll(orderBy = 'created_at DESC') {
    const [rows] = await this.db.execute(
      `SELECT * FROM ${quoteIdentifier(this.table)} ORDER BY ${orderBy}`
    );
    return rows;
  }

  async findById(id) {
    const [rows] = await this.db.execute(
      `SELECT * FROM ${quoteIdentifier(this.table)} WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  async create(data) {
    return insertRecord(this.table, data);
  }

  async update(id, data) {
    return updateRecord(this.table, id, data);
  }

  async delete(id) {
    return deleteRecord(this.table, id);
  }

  async findOne(whereClause, values) {
    const [rows] = await this.db.execute(
      `SELECT * FROM ${quoteIdentifier(this.table)} WHERE ${whereClause} LIMIT 1`,
      values
    );
    return rows[0] || null;
  }

  async executeCustom(query, params = []) {
    const [rows] = await this.db.execute(query, params);
    return rows;
  }
}

module.exports = BaseRepository;
