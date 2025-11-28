const express = require('express');
const contactController = require('../controllers/contactController');
const { emailLimiter } = require('../middleware/security');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: 📧 Formulaire de contact
 */

/**
 * @swagger
 * /api/v1/contact:
 *   post:
 *     summary: Envoyer un message de contact
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jean Dupont
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jean@example.com
 *               subject:
 *                 type: string
 *                 example: Question sur les produits
 *               message:
 *                 type: string
 *                 example: Bonjour, j'aimerais en savoir plus sur...
 *               type:
 *                 type: string
 *                 enum: [general, support, partnership, complaint, suggestion]
 *                 example: general
 *     responses:
 *       200:
 *         description: Message envoyé avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/', emailLimiter, contactController.sendContactMessage);

module.exports = router;

