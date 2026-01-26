const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const producerSearchService = require("../../services/producer/producerSearchService");
const Producer = require("../../models/Producer");
const Review = require("../../models/Review");

// Obtenir tous les producteurs
exports.getAllProducers = catchAsync(async (req, res, next) => {
	try {
		let userLocation = null;
		if (req.query.useLocation !== "false") {
			try {
				const {
					getUserLocation,
					buildLocationQuery,
				} = require("../../utils/locationService");
				userLocation = await getUserLocation(req);
				if (
					userLocation &&
					(userLocation.city || userLocation.region || userLocation.country)
				) {
					const locationQuery = buildLocationQuery(
						userLocation,
						{
							prioritizeRegion: true,
							prioritizeCity: true,
						},
						"producer",
					);
					const baseQueryObj = producerSearchService.buildAllProducersQuery(
						req.query,
					);
					const locationQueryObj = { ...baseQueryObj };
					if (locationQuery.$or && locationQuery.$or.length > 0) {
						locationQueryObj.$and = locationQueryObj.$and || [];
						locationQueryObj.$and.push({ $or: locationQuery.$or });
					}
					const countInZone = await Producer.countDocuments(locationQueryObj);
					if (
						countInZone > 0 &&
						locationQuery.$or &&
						locationQuery.$or.length > 0
					) {
						req.query.locationQuery = locationQuery;
					}
				}
			} catch (error) {
				console.error("Erreur lors de la détection de localisation:", error);
			}
		}
		const result = await producerSearchService.getAllProducers(
			req.query,
			userLocation,
		);
		res.status(200).json({
			status: "success",
			results: result.producers.length,
			total: result.total,
			page: result.page,
			totalPages: result.totalPages,
			data: {
				producers: result.producers,
				location:
					result.userLocation ?
						{
							detected: true,
							country: result.userLocation.country,
							region: result.userLocation.region,
							city: result.userLocation.city,
							source: result.userLocation.source,
							noProducersInZone: !req.query.locationQuery,
						}
					:	{ detected: false },
			},
		});
	} catch (error) {
		return next(new AppError(error.message, 404));
	}
});

// Recherche de producteurs
exports.searchProducers = catchAsync(async (req, res, next) => {
	try {
		const producers = await producerSearchService.searchProducers(req.query);
		res.status(200).json({
			status: "success",
			results: producers.length,
			data: { producers },
		});
	} catch (error) {
		return next(new AppError(error.message, 404));
	}
});

// Obtenir les producteurs par région
exports.getProducersByRegion = catchAsync(async (req, res, next) => {
	try {
		const producers = await producerSearchService.getProducersByRegion(
			req.params.region,
		);
		res.status(200).json({
			status: "success",
			results: producers.length,
			data: { producers },
		});
	} catch (error) {
		return next(new AppError(error.message, 404));
	}
});

// Obtenir les producteurs par culture
exports.getProducersByCrop = catchAsync(async (req, res, next) => {
	try {
		const producers = await producerSearchService.getProducersByCrop(
			req.params.crop,
		);
		res.status(200).json({
			status: "success",
			results: producers.length,
			data: { producers },
		});
	} catch (error) {
		return next(new AppError(error.message, 404));
	}
});

// Obtenir un producteur par ID
exports.getProducer = catchAsync(async (req, res, next) => {
	try {
		const producer = await producerSearchService.getProducer(req.params.id);
		const reviews = await Review.find({
			producer: req.params.id,
			status: "approved",
		});
		const totalReviews = reviews.length;
		const averageRating =
			totalReviews > 0 ?
				reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
			:	0;
		const producerWithStats = {
			...producer.toObject(),
			ratings: { average: averageRating, count: totalReviews },
			stats: { totalReviews, averageRating, ...producer.stats },
		};
		res.status(200).json({
			status: "success",
			data: { producer: producerWithStats },
		});
	} catch (error) {
		return next(new AppError(error.message, 404));
	}
});

// Obtenir les produits d'un producteur
exports.getProducerProducts = catchAsync(async (req, res, next) => {
	try {
		const products = await producerSearchService.getProducerProducts(
			req.params.id,
		);
		res.status(200).json({
			status: "success",
			results: products.length,
			data: { products },
		});
	} catch (error) {
		return next(new AppError(error.message, 404));
	}
});

// Obtenir les avis d'un producteur
exports.getProducerReviews = catchAsync(async (req, res, next) => {
	try {
		const result = await producerSearchService.getProducerReviews(
			req.params.id,
		);
		res.status(200).json({
			status: "success",
			data: result,
		});
	} catch (error) {
		return next(new AppError(error.message, 404));
	}
});
