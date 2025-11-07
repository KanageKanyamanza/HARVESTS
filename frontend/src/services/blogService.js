import api from './api';
import { getCurrentLanguage } from '../utils/i18n';

// Service public pour les blogs
const blogApiService = {
  // Récupérer tous les blogs
  getBlogs: (params = {}) => {
    const language = getCurrentLanguage();
    return api.get('/blogs', {
      params: {
        ...params,
        lang: language
      }
    });
  },

  // Récupérer un blog par slug
  getBlogBySlug: (slug) => {
    const language = getCurrentLanguage();
    return api.get(`/blogs/${slug}`, {
      params: { lang: language }
    });
  },

  // Liker un blog
  likeBlog: (id) => api.post(`/blogs/${id}/like`),

  // Tracker une visite
  trackVisit: (visitId, data) => api.post('/blogs/track', { visitId, ...data }),

  // Rechercher des blogs
  searchBlogs: (query, params = {}) => {
    const language = getCurrentLanguage();
    return api.get('/blogs', {
      params: {
        search: query,
        lang: language,
        ...params
      }
    });
  },

  // Vérifier un visiteur par IP
  checkVisitorByIP: () => api.get('/blog-visitors/check'),

  // Soumettre le formulaire visiteur
  submitVisitorForm: (data) => api.post('/blog-visitors/submit', data)
};

// Service admin pour les blogs
const adminBlogApiService = {
  // CRUD blogs
  getBlogs: (params = {}) => api.get('/blogs/admin/blogs', { params }),
  getBlog: (id) => api.get(`/blogs/admin/blogs/${id}`),
  createBlog: (data) => api.post('/blogs/admin/blogs', data),
  updateBlog: (id, data) => api.put(`/blogs/admin/blogs/${id}`, data),
  deleteBlog: (id) => api.delete(`/blogs/admin/blogs/${id}`),

  // Statistiques
  getStats: () => api.get('/blogs/admin/stats'),
  getBlogVisits: (blogId, params = {}) => api.get(`/blogs/admin/blogs/${blogId}/visits`, { params }),
  getAllVisits: (params = {}) => api.get('/blogs/admin/visits', { params }),
  getVisitors: (params = {}) => api.get('/blog-visitors/admin', { params }),
  getVisitorStats: () => api.get('/blog-visitors/admin/stats'),
  exportVisitors: (format = 'json') => api.get(`/blog-visitors/admin/export?format=${format}`)
};

export { blogApiService, adminBlogApiService };
export default blogApiService;

