const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');

const router = express.Router();

// ROUTES PUBLIQUES

// Obtenir tous les produits avec filtres et recherche
router.get('/', productController.getAllProducts);

// Recherche avancée de produits
router.get('/search', productController.searchProducts);

// Produits en vedette
router.get('/featured', productController.getFeaturedProducts);

// Nouveaux produits
router.get('/new', productController.getNewProducts);

// Obtenir les catégories de produits
router.get('/categories', productController.getCategories);

// Obtenir les produits par catégorie
router.get('/category/:category', productController.getProductsByCategory);

// Obtenir un produit par ID ou slug
router.get('/:id', productController.getProduct);

// ROUTES PROTÉGÉES PRODUCTEUR

// Middleware d'authentification
router.use(authController.protect);

// Routes pour les producteurs
router.use('/my', authController.restrictTo('producer'));
router.use('/my', authController.requireVerification);

// Mes produits
router.route('/my')
  .get(productController.getMyProducts)
  .post(
    uploadLimiter,
    productController.uploadProductImages,
    fileTypeValidation(['image/jpeg', 'image/png', 'image/webp']),
    fileSizeValidation(5 * 1024 * 1024), // 5MB par image
    productController.resizeProductImages,
    productController.createProduct
  );

// Gestion d'un produit spécifique
router.route('/my/:id')
  .get(productController.getMyProduct)
  .patch(productController.updateMyProduct)
  .delete(productController.deleteMyProduct);

// Gestion des variantes
router.route('/my/:id/variants')
  .post(productController.addVariant);

router.route('/my/:id/variants/:variantId')
  .patch(productController.updateVariant)
  .delete(productController.deleteVariant);

// Gestion du stock
router.patch('/my/:id/stock', productController.updateStock);

// Statistiques de mes produits
router.get('/my/stats/overview', productController.getMyProductStats);

// ROUTES ADMIN

router.use(authController.restrictTo('admin'));

// Modération des produits
router.get('/pending', productController.getPendingProducts);
router.patch('/:id/approve', productController.approveProduct);
router.patch('/:id/reject', productController.rejectProduct);

// Gestion de la vedette
router.patch('/:id/feature', productController.featureProduct);
router.patch('/:id/unfeature', productController.unfeatureProduct);

module.exports = router;
