const express = require('express');
const producerController = require('../controllers/producerController');

const router = express.Router();

// ========================================
// ROUTES PUBLIQUES POUR PRODUCTEURS
// (sans authentification)
// ========================================

// Routes de recherche de producteurs
router.get('/', producerController.getAllProducers);
router.get('/search', producerController.searchProducers);
router.get('/by-region/:region', producerController.getProducersByRegion);
router.get('/by-crop/:crop', producerController.getProducersByCrop);

// Routes publiques pour un producteur spécifique
router.get('/:id', producerController.getProducer);
router.get('/:id/products', producerController.getProducerProducts);
router.get('/:id/reviews', producerController.getProducerReviews);

module.exports = router;
