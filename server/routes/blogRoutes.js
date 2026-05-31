const express = require('express');
const router = express.Router();
const {
  getAllBlogs,
  getBlogById,
  getBlogComments,
  createBlogComment,
  createBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');

// GET  /api/blogs           - fetch all blogs (supports ?category=Legal&search=mutation)
router.get('/', getAllBlogs);

// GET  /api/blogs/:id/comments - fetch comments for a blog
router.get('/:id/comments', getBlogComments);

// POST /api/blogs/:id/comments - post a comment for a blog
router.post('/:id/comments', createBlogComment);

// GET  /api/blogs/:id       - fetch a single blog by id
router.get('/:id', getBlogById);

// POST /api/blogs           - create a new blog
router.post('/', createBlog);

// PUT  /api/blogs/:id       - update a blog
router.put('/:id', updateBlog);

// DELETE /api/blogs/:id     - delete a blog
router.delete('/:id', deleteBlog);

module.exports = router;
