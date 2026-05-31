const BaseModel = require('./BaseModel')
const { stringifyJsonField } = require('./dbHelpers')

class BlogModel extends BaseModel {
  constructor() {
    super({
      table: 'blogs',
      jsonFields: ['tags'],
      booleanFields: ['featured'],
    })
  }

  normalize(row) {
    const blog = super.normalize(row)
    if (!blog) return null

    return {
      ...blog,
      imageUrl: blog.image_url || blog.imageUrl || blog.image || null,
      image: blog.image || blog.image_url || blog.imageUrl || null,
    }
  }

  toRecord(data) {
    return {
      title: data.title,
      excerpt: data.excerpt || null,
      content: data.content || null,
      author: String(data.author || '').trim(),
      read_time: data.readTime || '5 min read',
      category: data.category || 'Real Estate',
      tags: stringifyJsonField(data.tags),
      image_url: data.imageUrl || data.image_url || null,
      featured: data.featured ? 1 : 0,
    }
  }

  toUpdates(data) {
    const updates = {}
    if (data.title !== undefined) updates.title = data.title
    if (data.excerpt !== undefined) updates.excerpt = data.excerpt
    if (data.content !== undefined) updates.content = data.content
    if (data.author !== undefined) updates.author = data.author
    if (data.readTime !== undefined) updates.read_time = data.readTime
    if (data.category !== undefined) updates.category = data.category
    if (data.tags !== undefined) updates.tags = stringifyJsonField(data.tags)
    if (data.imageUrl !== undefined) updates.image_url = data.imageUrl
    if (data.image_url !== undefined) updates.image_url = data.image_url
    if (data.featured !== undefined) updates.featured = data.featured ? 1 : 0
    return updates
  }
}

module.exports = new BlogModel()
