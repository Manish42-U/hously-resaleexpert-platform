const BaseRepository = require('./BaseRepository');
const CmsContent = require('../models/CmsContent');

class CmsRepository extends BaseRepository {
  constructor() {
    super(CmsContent.table);
  }

  normalize(row) {
    return CmsContent.normalize(row);
  }

  async findAllContent() {
    const rows = await super.findAll('content_key ASC');
    return rows.map((row) => this.normalize(row));
  }

  async findByKey(key) {
    const row = await this.findOne('content_key = ?', [key]);
    return this.normalize(row);
  }

  async upsert(key, data) {
    const record = CmsContent.toRecord(key, data);
    const existing = await this.findByKey(key);
    if (existing) {
      await this.db.execute(
        'UPDATE cms_content SET title = ?, content = ? WHERE content_key = ?',
        [record.title || existing.title, record.content, key],
      );
      return this.findByKey(key);
    }

    await this.db.execute(
      'INSERT INTO cms_content (content_key, title, content) VALUES (?, ?, ?)',
      [record.content_key, record.title, record.content],
    );
    return this.findByKey(key);
  }
}

module.exports = new CmsRepository();
