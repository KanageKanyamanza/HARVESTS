const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router();

// ROUTES PUBLIQUES

// Obtenir les avis d'un produit
router.get('/products/:productId', reviewController.getProductReviews);

// Obtenir les avis en vedette d'un produit
router.get('/products/:productId/featured', reviewController.getFeaturedReviews);

// Obtenir les avis d'un producteur
router.get('/producers/:producerId', reviewController.getProducerReviews);

// Obtenir un avis spécifique
router.get('/:id', reviewController.getReview);

// Rechercher dans les avis
router.get('/search', reviewController.searchReviews);

// ROUTES PROTÉGÉES

router.use(authController.protect);
router.use(authController.requireVerification);

// Créer un avis (acheteurs seulement)
router.post('/', 
  authController.restrictTo('consumer', 'restaurateur'),
  reviewController.createReview
);

// Obtenir mes avis
router.get('/my/reviews', reviewController.getMyReviews);

// Mettre à jour mon avis
router.patch('/my/:id', reviewController.updateMyReview);

// Supprimer mon avis
router.delete('/my/:id', reviewController.deleteMyReview);

// Voter pour l'utilité d'un avis
router.post('/:id/vote', reviewController.voteReview);

// Supprimer un vote
router.delete('/:id/vote', reviewController.removeVote);

// Signaler un avis
router.post('/:id/report', reviewController.reportReview);

// ROUTES PRODUCTEUR

// Répondre à un avis (producteurs seulement)
router.post('/:id/respond', 
  authController.restrictTo('producer', 'transformer'),
  reviewController.respondToReview
);

// Obtenir les avis reçus (producteurs)
router.get('/received/my', 
  authController.restrictTo('producer', 'transformer'),
  reviewController.getReceivedReviews
);

// Obtenir les avis récents
router.get('/received/recent', 
  authController.restrictTo('producer', 'transformer'),
  reviewController.getRecentReviews
);

// ROUTES ADMIN

router.use(authController.restrictTo('admin'));

// Obtenir tous les avis
router.get('/admin/all', reviewController.getAllReviews);

// Modérer un avis
router.patch('/admin/:id/moderate', reviewController.moderateReview);

// Obtenir les avis signalés
router.get('/admin/reported', reviewController.getReportedReviews);

// Statistiques des avis
router.get('/admin/stats', reviewController.getReviewStats);

module.exports = router;
