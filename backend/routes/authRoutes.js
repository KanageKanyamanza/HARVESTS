const express = require('express');
const authController = require('../controllers/auth/authController');
const emailVerificationController = require('../controllers/auth/emailVerificationController');
const passwordController = require('../controllers/auth/passwordController');
const authMiddleware = require('../controllers/auth/authMiddleware');
const { authLimiter, emailLimiter, signupLimiter } = require('../middleware/security');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: 🔐 Authentification et gestion des comptes
 */

const router = express.Router();

// Routes publiques d'authentification

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *               - password
 *               - userType
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Amadou
 *               lastName:
 *                 type: string
 *                 example: Diop
 *               email:
 *                 type: string
 *                 format: email
 *                 example: amadou.diop@test.sn
 *               phone:
 *                 type: string
 *                 example: "+221771234567"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: MotDePasseSecurise123!
 *               userType:
 *                 type: string
 *                 enum: [producer, consumer, transformer, restaurateur, exporter, transporter]
 *                 example: producer
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: Quartier Médina
 *                   city:
 *                     type: string
 *                     example: Thiès
 *                   region:
 *                     type: string
 *                     example: Thiès
 *                   country:
 *                     type: string
 *                     example: Sénégal
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/signup', signupLimiter, authController.signup);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Authentication]
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
 *                 example: amadou.diop@test.sn
 *               password:
 *                 type: string
 *                 example: MotDePasseSecurise123!
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/login', authLimiter, authController.login);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Déconnexion utilisateur
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post('/logout', authController.logout);

// Vérification et réinitialisation
router.get('/verify-email/:token', emailVerificationController.verifyEmail);
router.post('/resend-verification', emailLimiter, emailVerificationController.resendVerificationEmail);
router.post('/forgot-password', emailLimiter, passwordController.forgotPassword);
router.patch('/reset-password/:token', passwordController.resetPassword);

// Debug - Statut de la queue d'emails (désactivé en production)
if (process.env.NODE_ENV === 'development') {
  router.get('/email-queue-status', emailVerificationController.getEmailQueueStatus);
  router.post('/test-email-config', emailLimiter, emailVerificationController.testEmailConfiguration);
}

// Redemander l'envoi d'email de vérification
router.post('/retry-email-verification', emailLimiter, emailVerificationController.retryEmailVerification);

// Routes protégées (nécessitent une authentification)
router.use(authMiddleware.protect); // Toutes les routes après ce middleware sont protégées

router.patch('/update-password', passwordController.updatePassword);

module.exports = router;
