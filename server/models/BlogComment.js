const BaseModel = require('./BaseModel')

class BlogCommentModel extends BaseModel {
  constructor() {
    super({
      table: 'blog_comments',
      numberFields: ['blog_id'],
    })
  }

  toRecord(blogId, data) {
    return {
      blog_id: blogId,
      name: data.name,
      email: data.email || null,
      comment: data.comment,
      status: data.status || 'approved',
    }
  }
}

module.exports = new BlogCommentModel()
