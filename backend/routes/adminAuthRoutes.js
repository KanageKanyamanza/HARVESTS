const express = require('express');
const adminAuthController = require('../controllers/adminAuthController');

/**
 * @swagger
 * tags:
 *   name: Admin Auth
 *   description: 🔐 Authentification administrateur
 */

const router = express.Router();

/**
 * @swagger
 * /api/v1/admin/auth/login:
 *   post:
 *     summary: Connexion administrateur
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@harvests.sn
 *               password:
 *                 type: string
 *                 example: AdminPassword123!
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login', adminAuthController.login);

/**
 * @swagger
 * /api/v1/admin/auth/logout:
 *   post:
 *     summary: Déconnexion administrateur
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post('/logout', adminAuthController.logout);

// Routes protégées (nécessitent une authentification)
router.use(adminAuthController.protect);

/**
 * @swagger
 * /api/v1/admin/auth/me:
 *   get:
 *     summary: Obtenir les informations de l'admin connecté
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations de l'admin
 */
router.get('/me', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      admin: req.admin
    }
  });
});

module.exports = router;
