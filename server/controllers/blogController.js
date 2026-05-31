const BlogRepository = require('../repositories/BlogRepository');
const BlogCommentRepository = require('../repositories/BlogCommentRepository');
const { cloudinaryUrlFromImage } = require('../services/cloudinaryService');

const withCloudinaryImage = async (payload) => {
  const data = { ...payload };
  const image = data.imageUrl || data.image_url;
  if (!image) return data;

  const cloudinaryUrl = await cloudinaryUrlFromImage(image, 'hously/blogs');
  data.imageUrl = cloudinaryUrl;
  data.image_url = cloudinaryUrl;
  return data;
};

// GET /api/blogs  (supports ?category=Legal&search=mutation)
const getAllBlogs = async (req, res) => {
  try {
    const { category, search } = req.query;
    const blogs = await BlogRepository.findAll({ category, search });
    res.json({ success: true, data: blogs, count: blogs.length, source: 'database' });
  } catch (err) {
    console.error('getAllBlogs error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch blogs from database' });
  }
};

// GET /api/blogs/:id
const getBlogById = async (req, res) => {
  try {
    const blog = await BlogRepository.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.json({ success: true, data: blog });
  } catch (err) {
    console.error('getBlogById error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch blog' });
  }
};

const getBlogComments = async (req, res) => {
  try {
    const blog = await BlogRepository.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    const comments = await BlogCommentRepository.findByBlogId(req.params.id);
    return res.json({ success: true, data: comments, count: comments.length });
  } catch (err) {
    console.error('getBlogComments error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
};

const createBlogComment = async (req, res) => {
  try {
    const blog = await BlogRepository.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();
    const comment = String(req.body.comment || '').trim();

    if (!name || !comment) {
      return res.status(400).json({ success: false, message: 'Name and comment are required' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    const result = await BlogCommentRepository.createForBlog(req.params.id, { name, email, comment });
    const created = await BlogCommentRepository.findById(result.insertId);
    return res.status(201).json({
      success: true,
      message: 'Comment posted successfully',
      data: BlogCommentRepository.normalize(created),
    });
  } catch (err) {
    console.error('createBlogComment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to post comment' });
  }
};

// POST /api/blogs
const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, author, readTime, category, tags, imageUrl, image_url, featured } = req.body;

    if (!title || !author) {
      return res.status(400).json({ success: false, message: 'Title and author are required' });
    }

    const payload = await withCloudinaryImage({ title, excerpt, content, author, readTime, category, tags, imageUrl, image_url, featured });
    const result = await BlogRepository.create(payload);
    res.status(201).json({ success: true, message: 'Blog created successfully', id: result.insertId });
  } catch (err) {
    console.error('createBlog error:', err);
    res.status(500).json({ success: false, message: 'Failed to create blog' });
  }
};

// PUT /api/blogs/:id
const updateBlog = async (req, res) => {
  try {
    const payload = await withCloudinaryImage(req.body);
    const result = await BlogRepository.update(req.params.id, payload);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.json({ success: true, message: 'Blog updated successfully' });
  } catch (err) {
    console.error('updateBlog error:', err);
    res.status(500).json({ success: false, message: 'Failed to update blog' });
  }
};

// DELETE /api/blogs/:id
const deleteBlog = async (req, res) => {
  try {
    const result = await BlogRepository.delete(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (err) {
    console.error('deleteBlog error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete blog' });
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  getBlogComments,
  createBlogComment,
  createBlog,
  updateBlog,
  deleteBlog,
};
