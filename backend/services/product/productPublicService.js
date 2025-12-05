// Ce fichier a été réorganisé en sous-modules dans le dossier public/
// Import direct des services pour éviter les problèmes de résolution de module
const { getAllProducts, searchProducts } = require('./public/productSearchService.js');
const { getProductsByLocation } = require('./public/productLocationService.js');
const { getCategories, getProductsByCategory } = require('./public/productCategoryService.js');
const { getProductById, getFeaturedProducts, getNewProducts } = require('./public/productDetailService.js');

module.exports = {
  getAllProducts,
  getProductsByLocation,
  searchProducts,
  getProductById,
  getFeaturedProducts,
  getNewProducts,
  getCategories,
  getProductsByCategory
};
