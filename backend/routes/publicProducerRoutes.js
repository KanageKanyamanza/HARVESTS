const express = require('express');
const producerController = require('../controllers/producerController');
const authMiddleware = require('../controllers/auth/authMiddleware');

const router = express.Router();

// ========================================
// ROUTES PUBLIQUES POUR PRODUCTEURS
// (sans authentification)
// ========================================

// Routes de recherche de producteurs
router.get('/', authMiddleware.isLoggedIn, producerController.getAllProducers);
router.get('/search', authMiddleware.isLoggedIn, producerController.searchProducers);
router.get('/by-region/:region', authMiddleware.isLoggedIn, producerController.getProducersByRegion);
router.get('/by-crop/:crop', authMiddleware.isLoggedIn, producerController.getProducersByCrop);

// Routes publiques pour un producteur spécifique
router.get('/:id', authMiddleware.isLoggedIn, producerController.getProducer);
router.get('/:id/products', authMiddleware.isLoggedIn, producerController.getProducerProducts);
router.get('/:id/reviews', authMiddleware.isLoggedIn, producerController.getProducerReviews);

module.exports = router;
