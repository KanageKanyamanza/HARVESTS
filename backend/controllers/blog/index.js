// Export all blog controllers
const blogPublicController = require('./blogPublicController');
const blogAdminController = require('./blogAdminController');

module.exports = {
  // Public routes
  getBlogs: blogPublicController.getBlogs,
  getBlogBySlug: blogPublicController.getBlogBySlug,
  likeBlog: blogPublicController.likeBlog,
  trackVisit: blogPublicController.trackVisit,
  
  // Admin routes
  getAllBlogsAdmin: blogAdminController.getAllBlogsAdmin,
  getBlogAdmin: blogAdminController.getBlogAdmin,
  createBlog: blogAdminController.createBlog,
  updateBlog: blogAdminController.updateBlog,
  deleteBlog: blogAdminController.deleteBlog,
  getStats: blogAdminController.getStats,
  getBlogVisits: blogAdminController.getBlogVisits,
  getAllVisits: blogAdminController.getAllVisits,
  translateText: blogAdminController.translateText
};

