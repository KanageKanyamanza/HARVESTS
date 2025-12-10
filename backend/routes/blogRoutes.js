const express = require('express');
const blogController = require('../controllers/blogController');
const adminAuthController = require('../controllers/adminAuthController');

/**
 * @swagger
 * tags:
 *   name: Blog
 *   description: 📝 Blog et articles
 */

const router = express.Router();

// ROUTES PUBLIQUES

/**
 * @swagger
 * /api/v1/blogs:
 *   get:
 *     summary: Obtenir tous les articles de blog publiés (public)
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des articles
 */
router.get('/', blogController.getBlogs);

// Détail d'un blog par slug
router.get('/:slug', blogController.getBlogBySlug);

// Liker un blog
router.post('/:id/like', blogController.likeBlog);

// Tracker une visite
router.post('/track', blogController.trackVisit);

// ROUTES ADMIN

// Toutes les routes admin nécessitent l'authentification admin
router.use(adminAuthController.protect);

// Liste tous les blogs (admin)
router.get('/admin/blogs', blogController.getAllBlogsAdmin);

// Détail d'un blog (admin)
router.get('/admin/blogs/:id', blogController.getBlogAdmin);

/**
 * @swagger
 * /api/v1/blogs/admin/blogs:
 *   post:
 *     summary: Créer un article de blog (Admin)
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               featuredImage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Article créé
 */
router.post('/admin/blogs', blogController.createBlog);

// Mettre à jour un blog
router.put('/admin/blogs/:id', blogController.updateBlog);

// Supprimer un blog
router.delete('/admin/blogs/:id', blogController.deleteBlog);

// Statistiques globales
router.get('/admin/stats', blogController.getStats);

// Visites d'un blog
router.get('/admin/blogs/:id/visits', blogController.getBlogVisits);

// Toutes les visites
router.get('/admin/visits', blogController.getAllVisits);

// Traduction automatique
router.post('/translate', blogController.translateText);

module.exports = router;

