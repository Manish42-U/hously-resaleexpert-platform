import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://hously-realty-api.onrender.com/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging and error handling
api.interceptors.request.use(
  (config) => {
    console.log('[API Request]', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('[API Error]', error)
    return Promise.reject(error)
  },
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('[API Response]', response.status, response.config.url)
    return response
  },
  (error) => {
    if (error.response) {
      console.error(
        '[API Error Response]',
        error.response.status,
        error.response.data,
      )
    } else if (error.request) {
      console.error('[API Error]', 'No response received', error.request)
    } else {
      console.error('[API Error]', error.message)
    }
    return Promise.reject(error)
  },
)

export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message
  if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.'
  if (error.request) return 'Backend server is not reachable. Start the server and refresh.'
  return error.message || 'Something went wrong'
}

export const unwrap = (response) => response.data?.data ?? response.data

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = () => reject(reader.error)
  reader.readAsDataURL(file)
})

export const propertyService = {
  getAll: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  delete: (id) => api.delete(`/properties/${id}`),
}

export const blogService = {
  getAll: (params) => api.get('/blogs', { params }),
  getById: (id) => api.get(`/blogs/${id}`),
  create: (data) => api.post('/blogs', data),
  update: (id, data) => api.put(`/blogs/${id}`, data),
  delete: (id) => api.delete(`/blogs/${id}`),
}

export const uploadService = {
  uploadImage: async (file, folder) => {
    const dataUrl = await fileToDataUrl(file)
    return api.post('/uploads/image', { file: dataUrl, folder })
  },
  uploadImages: async (files, folder) => {
    const dataUrls = await Promise.all(Array.from(files).map(fileToDataUrl))
    return api.post('/uploads/images', { files: dataUrls, folder })
  },
}

export const cmsService = {
  getAll: () => api.get('/cms'),
  getByKey: (key) => api.get(`/cms/${key}`),
  update: (key, data) => api.put(`/cms/${key}`, data),
}

export const contactService = {
  getAll: () => api.get('/contact'),
  create: (data) => api.post('/contact', data),
  update: (id, data) => api.put(`/contact/${id}`, data),
  delete: (id) => api.delete(`/contact/${id}`),
}

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

export const userService = {
  getAll: () => api.get('/admin/users'),
  getById: (id) => api.get(`/admin/users/${id}`),
  create: (data) => api.post('/admin/users', data),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  delete: (id) => api.delete(`/admin/users/${id}`),
}

export const adminService = {
  getSummary: () => api.get('/admin/summary'),
  getCounts: () => api.get('/admin/counts'),
  getWorkspace: () => api.get('/admin/workspace'),
  getPayments: () => api.get('/admin/payments'),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
}

export const whatsappService = {
  getContacts: () => api.get('/whatsapp/contacts'),
  getMessages: (contactId) => api.get(`/whatsapp/messages/${contactId}`),
  send: (data) => api.post('/whatsapp/send', data),
  simulate: (data) => api.post('/whatsapp/simulate', data),
  delete: (contactId) => api.delete(`/whatsapp/contacts/${contactId}`),
}

export default api
