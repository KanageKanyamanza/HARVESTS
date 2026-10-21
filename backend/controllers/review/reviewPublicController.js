const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const Review = require("../../models/Review");
const Product = require("../../models/Product");
const User = require("../../models/User");
const {
	isTestViewer,
	getTestAccountIds,
	testReviewViewerFilter,
} = require("../../utils/testAccounts");

// Le parent d'un avis (produit ou vendeur) doit être dans le même périmètre
// sandbox que le visiteur, sinon un avis de test pourrait apparaître sur une
// fiche réelle (ou l'inverse).
async function getReviewScope(req) {
	const isTestView = isTestViewer(req);
	const testIds = new Set((await getTestAccountIds()).map(String));
	return {
		isTestView,
		testIds,
		reviewFilter: await testReviewViewerFilter(isTestView),
	};
}

const vendorIsTest = (testIds, id) =>
	id != null && testIds.has(String(id._id || id));

async function assertProductScope(productId, isTestView, testIds) {
	const product = await Product.findById(productId)
		.select("producer transformer restaurateur")
		.lean();
	const isTest =
		product &&
		[product.producer, product.transformer, product.restaurateur].some(
			(id) => vendorIsTest(testIds, id),
		);

	if (!product || isTest !== isTestView) {
		throw new AppError("product.not_found", 404);
	}
	return product;
}

async function assertVendorScope(vendorId, isTestView, testIds) {
	const vendor = await User.findById(vendorId)
		.select("_id isTestAccount")
		.lean();
	if (!vendor || Boolean(vendor.isTestAccount) !== isTestView) {
		throw new AppError("review.not_found", 404);
	}
	return vendor;
}

// Obtenir les avis d'un produit
exports.getProductReviews = catchAsync(async (req, res, next) => {
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 10;
	const skip = (page - 1) * limit;
	const { isTestView, testIds, reviewFilter } = await getReviewScope(req);

	await assertProductScope(req.params.productId, isTestView, testIds);

	// Filtres
	const queryObj = {
		product: req.params.productId,
		status: "approved",
		...reviewFilter,
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
	const stats = await Review.getProductRatingStats(
		req.params.productId,
		reviewFilter,
	);

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
	const { isTestView, testIds, reviewFilter } = await getReviewScope(req);
	await assertProductScope(req.params.productId, isTestView, testIds);

	const reviews = await Review.getFeaturedReviews(
		req.params.productId,
		5,
		reviewFilter,
	);

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
	const { isTestView, testIds, reviewFilter } = await getReviewScope(req);

	await assertVendorScope(req.params.producerId, isTestView, testIds);

	const reviews = await Review.find({
		producer: req.params.producerId,
		status: "approved",
		...reviewFilter,
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
		...reviewFilter,
	});

	// Statistiques du producteur
	const stats = await Review.getProducerRatingStats(
		req.params.producerId,
		reviewFilter,
	);

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
	const { isTestView, testIds } = await getReviewScope(req);

	const review = await Review.findById(req.params.id)
		.populate("reviewer", "firstName lastName avatar")
		.populate("replies.user", "firstName lastName avatar")
		.populate("producer", "farmName firstName lastName")
		.populate(
			"product",
			"name images price producer transformer restaurateur",
		)
		.populate("producerResponse.respondedBy", "firstName lastName");

	if (!review) {
		return next(new AppError("review.not_found", 404));
	}

	const reviewerIsTest = vendorIsTest(testIds, review.reviewer);
	const parentIds = [
		review.producer,
		review.product?.producer,
		review.product?.transformer,
		review.product?.restaurateur,
	].filter(Boolean);
	const parentIsTest = parentIds.some((id) => vendorIsTest(testIds, id));

	if (reviewerIsTest !== isTestView || parentIsTest !== isTestView) {
		return next(new AppError("review.not_found", 404));
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
	const { isTestView, testIds, reviewFilter } = await getReviewScope(req);
	await assertProductScope(req.params.productId, isTestView, testIds);

	const stats = await Review.getProductRatingStats(
		req.params.productId,
		reviewFilter,
	);

	res.status(200).json({
		status: "success",
		data: stats[0] || null,
	});
});

// Obtenir les statistiques de notation d'un producteur
exports.getProducerRatingStats = catchAsync(async (req, res, next) => {
	const { isTestView, testIds, reviewFilter } = await getReviewScope(req);
	await assertVendorScope(req.params.producerId, isTestView, testIds);

	const stats = await Review.getProducerRatingStats(
		req.params.producerId,
		reviewFilter,
	);

	res.status(200).json({
		status: "success",
		data: stats[0] || null,
	});
});

// Rechercher dans les avis
exports.searchReviews = catchAsync(async (req, res, next) => {
	const { q, productId, producerId } = req.query;
	const { isTestView, testIds, reviewFilter } = await getReviewScope(req);

	if (productId) {
		await assertProductScope(productId, isTestView, testIds);
	}
	if (producerId) {
		await assertVendorScope(producerId, isTestView, testIds);
	}

	const searchQuery = {
		status: "approved",
		$text: { $search: q },
		...reviewFilter,
	};

	if (productId) searchQuery.product = productId;
	if (producerId) searchQuery.producer = producerId;

	const reviews = await Review.find(searchQuery)
		.populate("reviewer", "firstName lastName avatar")
		.populate(
			"product",
			"name images producer transformer restaurateur",
		)
		.sort({ score: { $meta: "textScore" } })
		.limit(20);

	// Sans filtre produit/vendeur explicite, le parent de chaque avis doit
	// encore être dans le même périmètre sandbox que le visiteur.
	const visibleReviews = reviews.filter((review) => {
		const parentIds = [
			review.producer,
			review.product?.producer,
			review.product?.transformer,
			review.product?.restaurateur,
		].filter(Boolean);
		const parentIsTest = parentIds.some((id) => vendorIsTest(testIds, id));
		return parentIsTest === isTestView;
	});

	res.status(200).json({
		status: "success",
		results: visibleReviews.length,
		data: {
			reviews: visibleReviews,
		},
	});
});
