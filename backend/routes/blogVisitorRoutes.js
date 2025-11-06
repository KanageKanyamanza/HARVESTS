const express = require('express');
const blogVisitorController = require('../controllers/blogVisitorController');
const authController = require('../controllers/authController');

const router = express.Router();

// ROUTES PUBLIQUES

// Vérifier si un visiteur existe
router.get('/check', blogVisitorController.checkVisitor);

// Soumettre le formulaire visiteur
router.post('/submit', blogVisitorController.submitVisitorForm);

// ROUTES ADMIN

// Toutes les routes admin nécessitent l'authentification
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

// Liste des visiteurs (admin)
router.get('/admin', blogVisitorController.getVisitors);

// Statistiques des visiteurs (admin)
router.get('/admin/stats', blogVisitorController.getVisitorStats);

module.exports = router;

