// Export all product controllers
const productPublicController = require('./productPublicController');
const productProducerController = require('./productProducerController');
const productAdminController = require('./productAdminController');
const productUploadController = require('./productUploadController');

module.exports = {
  // Uploads
  uploadProductImages: productUploadController.uploadProductImages,
  resizeProductImages: productUploadController.resizeProductImages,
  
  // Public routes
  getAllProducts: productPublicController.getAllProducts,
  getProductsByLocation: productPublicController.getProductsByLocation,
  searchProducts: productPublicController.searchProducts,
  getProduct: productPublicController.getProduct,
  getFeaturedProducts: productPublicController.getFeaturedProducts,
  getNewProducts: productPublicController.getNewProducts,
  getCategories: productPublicController.getCategories,
  getProductsByCategory: productPublicController.getProductsByCategory,
  
  // Producer routes
  getMyProducts: productProducerController.getMyProducts,
  createProduct: productProducerController.createProduct,
  getMyProduct: productProducerController.getMyProduct,
  updateMyProduct: productProducerController.updateMyProduct,
  deleteMyProduct: productProducerController.deleteMyProduct,
  addVariant: productProducerController.addVariant,
  updateVariant: productProducerController.updateVariant,
  deleteVariant: productProducerController.deleteVariant,
  updateStock: productProducerController.updateStock,
  getMyProductStats: productProducerController.getMyProductStats,
  
  // Admin routes
  approveProduct: productAdminController.approveProduct,
  rejectProduct: productAdminController.rejectProduct,
  featureProduct: productAdminController.featureProduct,
  unfeatureProduct: productAdminController.unfeatureProduct,
  getPendingProducts: productAdminController.getPendingProducts
};

