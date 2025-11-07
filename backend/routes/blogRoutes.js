const express = require('express');
const blogController = require('../controllers/blogController');
const adminAuthController = require('../controllers/adminAuthController');

const router = express.Router();

// ROUTES PUBLIQUES

// Liste des blogs publiés
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

// Créer un blog
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

