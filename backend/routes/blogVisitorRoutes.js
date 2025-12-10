const express = require('express');
const blogVisitorController = require('../controllers/blogVisitorController');
const authMiddleware = require('../controllers/auth/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Blog Visitors
 *   description: 👥 Gestion des visiteurs du blog
 */

const router = express.Router();

// ROUTES PUBLIQUES

/**
 * @swagger
 * /api/v1/blog-visitors/check:
 *   get:
 *     summary: Vérifier si un visiteur existe (public)
 *     tags: [Blog Visitors]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: Statut du visiteur
 */
router.get('/check', blogVisitorController.checkVisitor);

/**
 * @swagger
 * /api/v1/blog-visitors/submit:
 *   post:
 *     summary: Soumettre le formulaire visiteur (public)
 *     tags: [Blog Visitors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Visiteur enregistré
 */
router.post('/submit', blogVisitorController.submitVisitorForm);

// ROUTES ADMIN

// Toutes les routes admin nécessitent l'authentification
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

// Liste des visiteurs (admin)
router.get('/admin', blogVisitorController.getVisitors);

// Statistiques des visiteurs (admin)
router.get('/admin/stats', blogVisitorController.getVisitorStats);

module.exports = router;

