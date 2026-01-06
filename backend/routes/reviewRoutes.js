const express = require("express");
const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../controllers/auth/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: ⭐ Avis et évaluations
 */

const router = express.Router();

// ROUTES PUBLIQUES

/**
 * @swagger
 * /api/v1/reviews/product/{productId}:
 *   get:
 *     summary: Obtenir les avis d'un produit (public)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: Liste des avis du produit
 */
router.get("/product/:productId", reviewController.getProductReviews);

// Obtenir les avis en vedette d'un produit
router.get("/product/:productId/featured", reviewController.getFeaturedReviews);

// Obtenir les statistiques de notation d'un produit
router.get("/product/:productId/stats", reviewController.getProductRatingStats);

// Obtenir les avis d'un producteur (public)
router.get("/producer/:producerId", reviewController.getProducerReviews);

// Obtenir les statistiques de notation d'un producteur (public)
router.get(
	"/producer/:producerId/stats",
	reviewController.getProducerRatingStats
);

// Rechercher dans les avis
router.get("/search", reviewController.searchReviews);

// ROUTES PROTÉGÉES

router.use(authMiddleware.protect);
// La vérification d'email n'est requise que pour les méthodes POST/PATCH/DELETE
router.use((req, res, next) => {
	// Autoriser les requêtes GET même sans vérification d'email
	if (
		req.method === "GET" ||
		req.method === "HEAD" ||
		req.method === "OPTIONS"
	) {
		return next();
	}
	// Pour les autres méthodes, vérifier l'email
	return authMiddleware.requireVerification(req, res, next);
});

/**
 * @swagger
 * /api/v1/reviews:
 *   post:
 *     summary: Créer un avis (Consommateur/Restaurateur)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - product
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               comment:
 *                 type: string
 *               product:
 *                 type: string
 *                 format: objectId
 *     responses:
 *       201:
 *         description: Avis créé avec succès
 */
router.post(
	"/",
	authMiddleware.restrictTo("consumer", "restaurateur"),
	reviewController.createReview
);

// Obtenir mes avis
router.get("/my/reviews", reviewController.getMyReviews);

// Mettre à jour mon avis
router.patch("/my/:id", reviewController.updateMyReview);

// Supprimer mon avis
router.delete("/my/:id", reviewController.deleteMyReview);

// Voter pour l'utilité d'un avis
router.post("/:id/vote", reviewController.voteReview);

// Supprimer un vote
router.delete("/:id/vote", reviewController.removeVote);

// Liker un avis
router.post("/:id/like", reviewController.likeReview);

// Ajouter un commentaire à un avis
router.post("/:id/reply", reviewController.addReply);

// Liker un commentaire
router.post("/:id/replies/:replyId/like", reviewController.likeReply);

// Signaler un avis
router.post("/:id/report", reviewController.reportReview);

// ROUTES PRODUCTEUR

// Répondre à un avis (producteurs, transformateurs, restaurateurs)
router.post(
	"/:id/respond",
	authMiddleware.restrictTo("producer", "transformer", "restaurateur"),
	reviewController.respondToReview
);

// Obtenir les avis reçus (producteurs, transformateurs, restaurateurs)
router.get(
	"/received",
	authMiddleware.restrictTo("producer", "transformer", "restaurateur"),
	reviewController.getReceivedReviews
);

// Obtenir les avis récents
router.get(
	"/received/recent",
	authMiddleware.restrictTo("producer", "transformer", "restaurateur"),
	reviewController.getRecentReviews
);

// Obtenir un avis spécifique (doit être après les routes spécifiques)
router.get("/:id", reviewController.getReview);

// ROUTES ADMIN

router.use(authMiddleware.restrictTo("admin"));

// Obtenir tous les avis
router.get("/admin/all", reviewController.getAllReviews);

// Modérer un avis
router.patch("/admin/:id/moderate", reviewController.moderateReview);

// Obtenir les avis signalés
router.get("/admin/reported", reviewController.getReportedReviews);

// Statistiques des avis
router.get("/admin/stats", reviewController.getReviewStats);

module.exports = router;
