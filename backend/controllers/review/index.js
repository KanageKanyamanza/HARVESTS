// Export all review controllers
const reviewPublicController = require("./reviewPublicController");
const reviewUserController = require("./reviewUserController");
const reviewProducerController = require("./reviewProducerController");
const reviewAdminController = require("./reviewAdminController");

module.exports = {
	// Public routes
	getProductReviews: reviewPublicController.getProductReviews,
	getFeaturedReviews: reviewPublicController.getFeaturedReviews,
	getProducerReviews: reviewPublicController.getProducerReviews,
	getReview: reviewPublicController.getReview,
	getProductRatingStats: reviewPublicController.getProductRatingStats,
	getProducerRatingStats: reviewPublicController.getProducerRatingStats,
	searchReviews: reviewPublicController.searchReviews,

	// User routes
	createReview: reviewUserController.createReview,
	getMyReviews: reviewUserController.getMyReviews,
	updateMyReview: reviewUserController.updateMyReview,
	deleteMyReview: reviewUserController.deleteMyReview,
	voteReview: reviewUserController.voteReview,
	removeVote: reviewUserController.removeVote,
	reportReview: reviewUserController.reportReview,
	likeReview: reviewUserController.likeReview,
	addReply: reviewUserController.addReply,
	likeReply: reviewUserController.likeReply,

	// Producer routes
	respondToReview: reviewProducerController.respondToReview,
	getReceivedReviews: reviewProducerController.getReceivedReviews,
	getRecentReviews: reviewProducerController.getRecentReviews,

	// Admin routes
	getAllReviews: reviewAdminController.getAllReviews,
	moderateReview: reviewAdminController.moderateReview,
	getReportedReviews: reviewAdminController.getReportedReviews,
	getReviewStats: reviewAdminController.getReviewStats,
};
