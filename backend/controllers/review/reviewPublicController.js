const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const Review = require("../../models/Review");

// Obtenir les avis d'un produit
exports.getProductReviews = catchAsync(async (req, res, next) => {
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 10;
	const skip = (page - 1) * limit;

	// Filtres
	const queryObj = {
		product: req.params.productId,
		status: "approved",
	};

	if (req.query.rating && req.query.rating !== "all") {
		const rating = parseInt(req.query.rating, 10);
		if (!isNaN(rating)) {
			queryObj.rating = rating;
		}
	}

	if (req.query.verified === "true") {
		queryObj.isVerifiedPurchase = true;
	}

	// Tri
	let sortObj = {};
	switch (req.query.sort) {
		case "newest":
			sortObj = { createdAt: -1 };
			break;
		case "oldest":
			sortObj = { createdAt: 1 };
			break;
		case "highest-rating":
			sortObj = { rating: -1, createdAt: -1 };
			break;
		case "lowest-rating":
			sortObj = { rating: 1, createdAt: -1 };
			break;
		case "most-helpful":
			sortObj = { helpfulVotes: -1, createdAt: -1 };
			break;
		default:
			sortObj = { helpfulVotes: -1, createdAt: -1 };
	}

	const reviews = await Review.find(queryObj)
		.populate("reviewer", "firstName lastName avatar")
		.populate("replies.user", "firstName lastName avatar")
		.populate("producerResponse.respondedBy", "firstName lastName")
		.sort(sortObj)
		.skip(skip)
		.limit(limit);

	const total = await Review.countDocuments(queryObj);

	// Statistiques des avis pour ce produit
	const stats = await Review.getProductRatingStats(req.params.productId);

	res.status(200).json({
		status: "success",
		results: reviews.length,
		total,
		page,
		totalPages: Math.ceil(total / limit),
		stats: stats[0] || null,
		data: {
			reviews,
		},
	});
});

// Obtenir les avis en vedette d'un produit
exports.getFeaturedReviews = catchAsync(async (req, res, next) => {
	const reviews = await Review.getFeaturedReviews(req.params.productId);

	res.status(200).json({
		status: "success",
		results: reviews.length,
		data: {
			reviews,
		},
	});
});

// Obtenir les avis d'un producteur
exports.getProducerReviews = catchAsync(async (req, res, next) => {
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 10;
	const skip = (page - 1) * limit;

	const reviews = await Review.find({
		producer: req.params.producerId,
		status: "approved",
	})
		.populate("reviewer", "firstName lastName avatar")
		.populate("replies.user", "firstName lastName avatar")
		.populate("product", "name images")
		.sort("-createdAt")
		.skip(skip)
		.limit(limit);

	const total = await Review.countDocuments({
		producer: req.params.producerId,
		status: "approved",
	});

	// Statistiques du producteur
	const stats = await Review.getProducerRatingStats(req.params.producerId);

	res.status(200).json({
		status: "success",
		results: reviews.length,
		total,
		page,
		totalPages: Math.ceil(total / limit),
		stats: stats[0] || null,
		data: {
			reviews,
		},
	});
});

// Obtenir un avis spécifique
exports.getReview = catchAsync(async (req, res, next) => {
	const review = await Review.findById(req.params.id)
		.populate("reviewer", "firstName lastName avatar")
		.populate("replies.user", "firstName lastName avatar")
		.populate("producer", "farmName firstName lastName")
		.populate("product", "name images price")
		.populate("producerResponse.respondedBy", "firstName lastName");

	if (!review) {
		return next(new AppError("Avis non trouvé", 404));
	}

	res.status(200).json({
		status: "success",
		data: {
			review,
		},
	});
});

// Obtenir les statistiques de notation d'un produit
exports.getProductRatingStats = catchAsync(async (req, res, next) => {
	const stats = await Review.getProductRatingStats(req.params.productId);

	res.status(200).json({
		status: "success",
		data: stats[0] || null,
	});
});

// Obtenir les statistiques de notation d'un producteur
exports.getProducerRatingStats = catchAsync(async (req, res, next) => {
	const stats = await Review.getProducerRatingStats(req.params.producerId);

	res.status(200).json({
		status: "success",
		data: stats[0] || null,
	});
});

// Rechercher dans les avis
exports.searchReviews = catchAsync(async (req, res, next) => {
	const { q, productId, producerId } = req.query;

	const searchQuery = {
		status: "approved",
		$text: { $search: q },
	};

	if (productId) searchQuery.product = productId;
	if (producerId) searchQuery.producer = producerId;

	const reviews = await Review.find(searchQuery)
		.populate("reviewer", "firstName lastName avatar")
		.populate("product", "name images")
		.sort({ score: { $meta: "textScore" } })
		.limit(20);

	res.status(200).json({
		status: "success",
		results: reviews.length,
		data: {
			reviews,
		},
	});
});
