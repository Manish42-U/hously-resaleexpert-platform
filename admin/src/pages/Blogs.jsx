import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertCircle,
  Edit,
  Eye,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  Calendar,
  Clock,
  User,
  Tag,
  Star,
  Share2,
  Upload
} from 'lucide-react'
import { blogService, getErrorMessage, unwrap, uploadService } from '../services/api'

const emptyForm = {
  title: '',
  excerpt: '',
  content: '',
  author: '',
  category: 'Real Estate',
  readTime: '5 min read',
  image_url: '',
  tags: '',
  featured: false,
}

const getPublicBlogUrl = (blog) => {
  const publicSite = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://resaleexpert.in'
  return `${publicSite}/blogs/${blog.id}`
}

const formatBlogDate = (value) => {
  if (!value) return 'Recently'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return date.toLocaleDateString('en-IN')
}

const Blogs = () => {
  const [blogs, setBlogs] = useState([])
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [query, setQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [previewBlog, setPreviewBlog] = useState(null)

  const fetchBlogs = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await blogService.getAll()
      const data = unwrap(response)
      setBlogs(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const filteredBlogs = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return blogs
    return blogs.filter((blog) =>
      [blog.title, blog.author, blog.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search)),
    )
  }, [blogs, query])

  const openCreateModal = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setShowModal(true)
  }

  const openEditModal = (blog) => {
    setEditingId(blog.id)
    setFormData({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      author: blog.author || '',
      category: blog.category || 'Real Estate',
      readTime: blog.read_time || blog.readTime || '5 min read',
      image_url: blog.image_url || '',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
      featured: Boolean(blog.featured),
    })
    setShowModal(true)
  }

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    setError('')
    try {
      const response = await uploadService.uploadImage(file, 'hously/blogs')
      const url = unwrap(response)?.url
      if (url) setFormData((current) => ({ ...current, image_url: url }))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setUploadingImage(false)
      event.target.value = ''
    }
  }

  const buildPayload = () => ({
    ...formData,
    tags: formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId) {
        await blogService.update(editingId, buildPayload())
      } else {
        await blogService.create(buildPayload())
      }
      setShowModal(false)
      await fetchBlogs()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return
    setError('')
    try {
      await blogService.delete(id)
      setBlogs((current) => current.filter((blog) => blog.id !== id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleViewBlog = (blog) => {
    setPreviewBlog(blog)
  }

  const handleShareBlog = async (blog) => {
    const url = getPublicBlogUrl(blog)
    const text = `${blog.title || 'Blog'} - ${url}`
    try {
      if (navigator.share) {
        await navigator.share({ title: blog.title || 'Blog', text, url })
      } else {
        await navigator.clipboard.writeText(text)
        setError('Blog share link copied.')
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setError('Share link copy nahi ho paya.')
      }
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <FileText className="text-emerald-500" size={24} />
            Content Platform
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Publish and maintain blog content</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm text-sm w-64 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition-all outline-none"
              placeholder="Search blogs..."
            />
          </div>
          <button onClick={fetchBlogs} className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:text-emerald-600 transition-all shadow-sm">
            <RefreshCw size={18} className={loading ? 'animate-spin text-emerald-500' : 'text-gray-500'} />
          </button>
          <button onClick={openCreateModal} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all ripple">
            <Plus size={18} /> New Blog
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 text-red-700 border border-red-100 shadow-sm">
          <AlertCircle size={20} className="text-red-500" /> <span className="font-semibold">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 rounded-3xl bg-gray-100 animate-pulse border border-gray-200"></div>
          ))}
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4"><FileText className="text-gray-300 w-10 h-10" /></div>
          <p className="text-lg font-bold text-gray-500">No blogs found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or write a new post.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredBlogs.map((blog) => (
            <article key={blog.id} className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-200 card-lift">
              <div className="relative h-52 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {blog.image_url ? (
                  <img src={blog.image_url} alt={blog.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100 text-gray-300 group-hover:scale-110 transition-transform duration-700"><FileText size={48} /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-[-10px] group-hover:translate-y-0">
                  <button onClick={() => handleViewBlog(blog)} className="p-2 rounded-xl bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-blue-600 hover:text-white shadow-lg transition-colors" title="Preview"><Eye size={16} /></button>
                  <button onClick={() => handleShareBlog(blog)} className="p-2 rounded-xl bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-emerald-600 hover:text-white shadow-lg transition-colors" title="Share"><Share2 size={16} /></button>
                  <button onClick={() => openEditModal(blog)} className="p-2 rounded-xl bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-emerald-500 hover:text-white shadow-lg transition-colors"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(blog.id)} className="p-2 rounded-xl bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-red-500 hover:text-white shadow-lg transition-colors"><Trash2 size={16} /></button>
                </div>

                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-500/90 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                    {blog.category || 'Real Estate'}
                  </span>
                  {blog.featured && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                      <Star size={12} fill="white" /> Featured
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="line-clamp-2 text-xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors mb-2">{blog.title}</h3>
                <p className="line-clamp-3 text-sm font-medium text-gray-500 mb-6">{blog.excerpt || blog.content}</p>
                
                <div className="mt-auto border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      {(blog.author || 'A').charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{blog.author || 'ResaleExpert Team'}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1"><Clock size={10} /> {blog.readTime || '5 min'}</p>
                    </div>
                  </div>
                  <button onClick={() => handleViewBlog(blog)} className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Eye size={12} /> View
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
          style={{ overflowY: 'auto', padding: '16px' }}
          onClick={(event) => { if (event.target === event.currentTarget) setShowModal(false) }}
        >
          <div className="relative my-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-300" style={{ maxHeight: 'calc(100vh - 32px)' }}>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-8 py-5 flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-black text-white flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  {editingId ? <Edit size={20} className="text-emerald-300" /> : <Plus size={20} className="text-emerald-300" />}
                </div>
                {editingId ? 'Edit Blog Post' : 'Write New Blog Post'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full bg-white/10 text-emerald-100 hover:bg-white/20 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 scrollbar-custom bg-slate-50/50" style={{ minHeight: 0 }}>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField label="Post Title" name="title" value={formData.title} onChange={handleInputChange} required />
                  <InputField label="Author Name" name="author" value={formData.author} onChange={handleInputChange} required icon={<User size={14} className="text-gray-400" />} />
                  <InputField label="Category" name="category" value={formData.category} onChange={handleInputChange} />
                  <InputField label="Read Time" name="readTime" value={formData.readTime} onChange={handleInputChange} icon={<Clock size={14} className="text-gray-400" />} />
                  <div>
                    <InputField label="Cover Cloudinary Image URL" name="image_url" value={formData.image_url} onChange={handleInputChange} />
                    <UploadButton label="Upload Cover Image" onChange={handleCoverUpload} disabled={uploadingImage} />
                  </div>
                  <InputField label="Tags (comma separated)" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="buying, legal, finance" icon={<Tag size={14} className="text-gray-400" />} />
                </div>
                
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Short Excerpt</label>
                  <textarea name="excerpt" rows="2" value={formData.excerpt} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition-all outline-none resize-none bg-gray-50 focus:bg-white" placeholder="Brief summary of the post..."></textarea>
                </div>
                
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">Full Content</label>
                  <textarea name="content" rows="8" value={formData.content} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition-all outline-none resize-none bg-gray-50 focus:bg-white" placeholder="Write your blog post content here..."></textarea>
                </div>
                
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer group w-fit">
                    <div className="relative">
                      <input type="checkbox" name="featured" checked={formData.featured} onChange={handleInputChange} className="peer sr-only" />
                      <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4 shadow-sm"></div>
                    </div>
                    <span className="font-bold text-gray-700 group-hover:text-gray-900">Mark as Featured Post</span>
                  </label>
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="button" onClick={handleSubmit} disabled={saving || uploadingImage} className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 flex items-center gap-2">
                {(saving || uploadingImage) && <Loader2 className="animate-spin" size={18} />}
                {editingId ? 'Save Changes' : 'Publish Blog'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {previewBlog && createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(event) => { if (event.target === event.currentTarget) setPreviewBlog(null) }}
        >
          <div className="max-h-[calc(100vh-32px)] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-slate-950 px-6 py-4 text-white">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-300">Blog Preview</p>
                <h3 className="mt-1 text-lg font-black">{previewBlog.title}</h3>
              </div>
              <button onClick={() => setPreviewBlog(null)} className="rounded-full bg-white/10 p-2 text-white transition-all hover:bg-white/20">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[calc(100vh-105px)] overflow-y-auto bg-slate-50 p-6">
              <article className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                {previewBlog.image_url ? (
                  <img src={previewBlog.image_url} alt={previewBlog.title} className="h-80 w-full object-cover" />
                ) : (
                  <div className="flex h-80 items-center justify-center bg-gray-100 text-gray-300"><FileText size={72} /></div>
                )}
                <div className="p-7">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase text-emerald-700">{previewBlog.category || 'Real Estate'}</span>
                    {previewBlog.featured && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black uppercase text-amber-700">Featured</span>}
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-600"><Clock size={12} /> {previewBlog.readTime || previewBlog.read_time || '5 min read'}</span>
                  </div>
                  <h1 className="text-3xl font-black leading-tight text-gray-950">{previewBlog.title}</h1>
                  <div className="mt-4 flex items-center gap-3 text-sm font-bold text-gray-500">
                    <User size={16} className="text-emerald-600" /> {previewBlog.author || 'ResaleExpert Team'}
                    <Calendar size={16} className="ml-2 text-emerald-600" /> {formatBlogDate(previewBlog.created_at)}
                  </div>
                  {previewBlog.excerpt && <p className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-900">{previewBlog.excerpt}</p>}
                  <p className="mt-6 whitespace-pre-line text-sm font-medium leading-7 text-gray-700">{previewBlog.content}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {(Array.isArray(previewBlog.tags) ? previewBlog.tags : []).map((tag) => (
                      <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-600">#{tag}</span>
                    ))}
                  </div>
                  <div className="mt-7 grid grid-cols-2 gap-3 border-t border-gray-100 pt-5">
                    <button onClick={() => handleShareBlog(previewBlog)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-700">
                      <Share2 size={16} /> Share
                    </button>
                    <button onClick={() => openEditModal(previewBlog)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E6761D] px-4 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-orange-600">
                      <Edit size={16} /> Edit
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

const InputField = ({ label, icon, ...props }) => (
  <div>
    <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
      <input {...props} className={`w-full rounded-xl border border-gray-200 py-3 text-sm focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition-all outline-none bg-gray-50 focus:bg-white font-medium text-gray-900 ${icon ? 'pl-9 pr-4' : 'px-4'}`} />
    </div>
  </div>
)

const UploadButton = ({ label, onChange, disabled }) => (
  <label className={`mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-600 transition-colors hover:bg-emerald-100 ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
    <Upload size={14} />
    {disabled ? 'Uploading...' : label}
    <input type="file" accept="image/*" onChange={onChange} className="hidden" />
  </label>
)

export default Blogs
