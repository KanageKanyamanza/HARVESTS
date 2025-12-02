const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../controllers/auth/authMiddleware');
const { uploadLimiter, fileTypeValidation, fileSizeValidation } = require('../middleware/security');

const router = express.Router();

// ROUTES PUBLIQUES

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Obtenir tous les produits avec filtres et recherche intelligente
 *     description: |
 *       Liste paginée de produits avec :
 *       - **Recherche intelligente** : Gère pluriel/singulier et localisation
 *       - **Filtres avancés** : Catégorie, prix, région, méthode de culture
 *       - **Détection géographique** : "tomates Dakar" filtre automatiquement
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: |
 *           Recherche textuelle avec détection géographique :
 *           - "tomates" → recherche flexible (tomate/tomates)
 *           - "tomates Dakar" → filtre par localisation
 *           - "légumes Yaoundé" → légumes à Yaoundé
 *         example: "tomates Dakar"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrer par catégorie
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filtrer par région
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Prix minimum
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Prix maximum
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre de résultats par page
 *     responses:
 *       200:
 *         description: Liste de produits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: number
 *                   example: 50
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     total:
 *                       type: number
 *                       example: 50
 *                     page:
 *                       type: number
 *                       example: 1
 *                     totalPages:
 *                       type: number
 *                       example: 3
 */
router.get('/', productController.getAllProducts);

// Obtenir les produits basés sur la localisation de l'utilisateur
router.get('/location-based', productController.getProductsByLocation);

/**
 * @swagger
 * /api/v1/products/search:
 *   get:
 *     summary: Recherche avancée de produits avec détection géographique
 *     description: |
 *       Recherche intelligente de produits avec :
 *       - **Gestion pluriel/singulier** : "tomates" trouve aussi "tomate"
 *       - **Détection de localisation** : "tomates à Dakar" filtre par ville
 *       - **Recherche flexible** : Insensible à la casse et aux accents
 *       - **Villes supportées** : Dakar, Yaoundé, Douala, Thiès, Saint-Louis, etc.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: |
 *           Terme de recherche. Peut inclure une localisation :
 *           - "tomates" → recherche tous les produits contenant "tomate" ou "tomates"
 *           - "tomates à Dakar" → recherche les tomates à Dakar
 *           - "Dakar" → tous les produits de Dakar
 *         example: "tomates à Dakar"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrer par catégorie
 *         example: "vegetables"
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Prix minimum
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Prix maximum
 *     responses:
 *       200:
 *         description: Produits trouvés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: number
 *                   example: 15
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *       400:
 *         description: Paramètre de recherche invalide
 *       404:
 *         description: Aucun produit trouvé
 */
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
router.use(authMiddleware.protect);

// Routes pour les producteurs
router.use('/my', authMiddleware.restrictTo('producer'));
router.use('/my', authMiddleware.requireVerification);

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

router.use(authMiddleware.restrictTo('admin'));

// Modération des produits
router.get('/pending', productController.getPendingProducts);
router.patch('/:id/approve', productController.approveProduct);
router.patch('/:id/reject', productController.rejectProduct);

// Gestion de la vedette
router.patch('/:id/feature', productController.featureProduct);
router.patch('/:id/unfeature', productController.unfeatureProduct);

module.exports = router;
