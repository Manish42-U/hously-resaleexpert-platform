const BaseRepository = require('./BaseRepository');
const BlogComment = require('../models/BlogComment');

class BlogCommentRepository extends BaseRepository {
  constructor() {
    super(BlogComment.table);
  }

  normalize(row) {
    return BlogComment.normalize(row);
  }

  async findByBlogId(blogId) {
    const rows = await this.executeCustom(
      'SELECT * FROM blog_comments WHERE blog_id = ? AND status = ? ORDER BY created_at DESC',
      [blogId, 'approved'],
    );
    return rows.map((row) => this.normalize(row));
  }

  async createForBlog(blogId, data) {
    return super.create(BlogComment.toRecord(blogId, data));
  }
}

module.exports = new BlogCommentRepository();
