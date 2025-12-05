// Ce fichier a été réorganisé en sous-modules dans le dossier public/
// Import direct des services pour éviter les problèmes de résolution de module
const { getAllProducts, searchProducts } = require('./public/productSearchService');
const { getProductsByLocation } = require('./public/productLocationService');
const { getCategories, getProductsByCategory } = require('./public/productCategoryService');
const { getProductById, getFeaturedProducts, getNewProducts } = require('./public/productDetailService');

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
