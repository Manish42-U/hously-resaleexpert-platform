import axios from 'axios';
import { NativeModules, Platform } from 'react-native';

const PRODUCTION_API_BASE_URL = 'https://hously-realty-api.onrender.com';

const getDevServerHost = () => {
  const scriptURL = NativeModules.SourceCode?.scriptURL as string | undefined;
  return scriptURL?.match(/^https?:\/\/([^:/]+)/)?.[1];
};

const DEV_API_HOST =
  getDevServerHost() ||
  Platform.select({
    android: '10.0.2.2',
    ios: 'localhost',
    default: 'localhost',
  });

export const API_BASE_URL = __DEV__
  ? `http://${DEV_API_HOST}:5050`
  : PRODUCTION_API_BASE_URL;
export const API_URL = `${API_BASE_URL}/api`;

export type MaintenanceStatus = {
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  companyName?: string;
  supportEmail?: string;
  supportPhone?: string;
};

const maintenanceListeners = new Set<(status: MaintenanceStatus) => void>();

export const subscribeToMaintenance = (
  listener: (status: MaintenanceStatus) => void,
) => {
  maintenanceListeners.add(listener);
  return () => maintenanceListeners.delete(listener);
};

const notifyMaintenance = (status: MaintenanceStatus) => {
  maintenanceListeners.forEach(listener => listener(status));
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  config => {
    if (__DEV__) {
      console.log('[API Request]', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  error => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  response => {
    if (__DEV__) {
      console.log(
        '[API Response]',
        response.status,
        response.config.url,
        response.data,
      );
    }
    return response;
  },
  error => {
    const suppressErrorLog = (error.config as any)?.suppressErrorLog;
    const responseData = error.response?.data;

    if (error.response?.status === 503 && responseData?.maintenance) {
      notifyMaintenance({
        maintenanceMode: true,
        maintenanceMessage: responseData.message,
      });
    }

    if (!suppressErrorLog) {
      if (error.response) {
        console.error(
          '[API Response Error]',
          error.response.status,
          error.response.data,
        );
      } else if (error.request) {
        console.error(
          '[API Network Error]',
          'No response received',
          error.message,
        );
      } else {
        console.error('[API Error]', error.message);
      }
    }
    return Promise.reject(error);
  },
);

export const propertyService = {
  getAll: (params?: any) => api.get('/properties', { params }),
  getById: (id: string | number) => api.get(`/properties/${id}`),
  recordView: (id: string | number) => api.post(`/properties/${id}/view`),
  create: (data: any) => api.post('/properties', data),
  update: (id: string | number, data: any) =>
    api.put(`/properties/${id}`, data),
  delete: (id: string | number) => api.delete(`/properties/${id}`),
};

export const blogService = {
  getAll: (params?: { category?: string; search?: string }) =>
    api.get('/blogs', { params }),
  getById: (id: string | number) => api.get(`/blogs/${id}`),
  getComments: (id: string | number) => api.get(`/blogs/${id}/comments`),
  createComment: (
    id: string | number,
    data: { name: string; email?: string; comment: string },
  ) => api.post(`/blogs/${id}/comments`, data),
  create: (data: any) => api.post('/blogs', data),
  update: (id: string | number, data: any) => api.put(`/blogs/${id}`, data),
  delete: (id: string | number) => api.delete(`/blogs/${id}`),
};

export const uploadService = {
  uploadImage: (file: string, folder?: string) =>
    api.post('/uploads/image', { file, folder }, { timeout: 60000 }),
  uploadImages: (files: string[], folder?: string) =>
    api.post('/uploads/images', { files, folder }, { timeout: 90000 }),
};

export const cmsService = {
  getAll: () => api.get('/cms'),
  getByKey: (key: string) =>
    api.get(`/cms/${key}`, { suppressErrorLog: true } as any),
};

export const contactService = {
  create: (data: any) => api.post('/contact', data),
  getAll: () => api.get('/contact'),
};

export const authService = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: 'user' | 'agent' | 'manager' | 'admin';
  }) => api.post('/auth/register', data),
};

export const userService = {
  getAll: () => api.get('/admin/users'),
  getById: (id: string | number) => api.get(`/admin/users/${id}`),
  create: (data: any) => api.post('/admin/users', data),
  update: (id: string | number, data: any) =>
    api.put(`/admin/users/${id}`, data),
  delete: (id: string | number) => api.delete(`/admin/users/${id}`),
};

// export default api;

export const adminService = {
  getSummary: () => api.get('/admin/summary'),
  getCounts: () => api.get('/admin/counts'),
  getUsers: () => api.get('/admin/users'),
};

export default api;
