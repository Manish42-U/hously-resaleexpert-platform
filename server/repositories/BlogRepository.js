const BaseRepository = require('./BaseRepository');
const Blog = require('../models/Blog');

class BlogRepository extends BaseRepository {
  constructor() {
    super(Blog.table);
  }

  normalize(row) {
    return Blog.normalize(row);
  }

  async findAll({ category, search } = {}) {
    const where = [];
    const values = [];

    if (category && category !== 'All') {
      where.push('category = ?');
      values.push(category);
    }

    if (search) {
      where.push('(LOWER(title) LIKE ? OR LOWER(COALESCE(excerpt, "")) LIKE ?)');
      const searchValue = `%${String(search).toLowerCase()}%`;
      values.push(searchValue, searchValue);
    }

    const query = `SELECT * FROM blogs${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC`;
    const rows = await this.executeCustom(query, values);
    return rows.map(row => this.normalize(row));
  }

  async findById(id) {
    const row = await super.findById(id);
    return this.normalize(row);
  }

  async create(data) {
    return super.create(Blog.toRecord(data));
  }

  async update(id, data) {
    return super.update(id, Blog.toUpdates(data));
  }
}

module.exports = new BlogRepository();
