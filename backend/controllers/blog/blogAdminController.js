const Blog = require("../../models/Blog");
const BlogVisit = require("../../models/BlogVisit");
const BlogVisitor = require("../../models/BlogVisitor"); // Import BlogVisitor
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

// Liste tous les blogs (admin)
exports.getAllBlogsAdmin = catchAsync(async (req, res, next) => {
	const language = req.language || "fr";
	const queryObj = {};

	// Filtres
	if (req.query.status) queryObj.status = req.query.status;
	if (req.query.type) queryObj.type = req.query.type;
	if (req.query.category) queryObj.category = req.query.category;

	// Pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 20;
	const skip = (page - 1) * limit;

	const blogs = await Blog.find(queryObj)
		.populate("author", "firstName lastName email")
		.sort("-createdAt")
		.skip(skip)
		.limit(limit);

	const total = await Blog.countDocuments(queryObj);

	res.status(200).json({
		success: true,
		data: blogs,
		pagination: {
			current: page,
			pages: Math.ceil(total / limit),
			total,
		},
	});
});

// Détail d'un blog (admin)
exports.getBlogAdmin = catchAsync(async (req, res, next) => {
	const blog = await Blog.findById(req.params.id).populate(
		"author",
		"firstName lastName email"
	);

	if (!blog) {
		return next(new AppError("Blog non trouvé", 404));
	}

	res.status(200).json({
		success: true,
		data: blog,
	});
});

// Créer un blog
exports.createBlog = catchAsync(async (req, res, next) => {
	// Validation : au moins un titre requis
	if (!req.body.title?.fr && !req.body.title?.en) {
		return next(new AppError("Au moins un titre (FR ou EN) est requis", 400));
	}

	// Validation : au moins un contenu requis
	if (!req.body.content?.fr && !req.body.content?.en) {
		return next(new AppError("Au moins un contenu (FR ou EN) est requis", 400));
	}

	// Ajouter l'auteur
	req.body.author = req.admin._id;

	// Définir publishedAt si status est published
	if (req.body.status === "published" && !req.body.publishedAt) {
		req.body.publishedAt = new Date();
	}

	const blog = await Blog.create(req.body);

	res.status(201).json({
		success: true,
		data: blog,
	});
});

// Mettre à jour un blog
exports.updateBlog = catchAsync(async (req, res, next) => {
	const blog = await Blog.findById(req.params.id);

	if (!blog) {
		return next(new AppError("Blog non trouvé", 404));
	}

	// Mettre à jour
	Object.keys(req.body).forEach((key) => {
		if (req.body[key] !== undefined) {
			blog[key] = req.body[key];
		}
	});

	// Définir publishedAt si status passe à published
	if (blog.status === "published" && !blog.publishedAt) {
		blog.publishedAt = new Date();
	}

	await blog.save();

	res.status(200).json({
		success: true,
		data: blog,
	});
});

// Supprimer un blog
exports.deleteBlog = catchAsync(async (req, res, next) => {
	const blog = await Blog.findByIdAndDelete(req.params.id);

	if (!blog) {
		return next(new AppError("Blog non trouvé", 404));
	}

	// Supprimer aussi les visites associées
	await BlogVisit.deleteMany({ blog: blog._id });

	res.status(200).json({
		success: true,
		message: "Blog supprimé avec succès",
	});
});

// Statistiques globales
exports.getStats = catchAsync(async (req, res, next) => {
	const total = await Blog.countDocuments();
	const published = await Blog.countDocuments({ status: "published" });
	const draft = await Blog.countDocuments({ status: "draft" });

	// Statistiques par type
	const byType = await Blog.aggregate([
		{ $group: { _id: "$type", count: { $sum: 1 } } },
	]);

	// Statistiques par catégorie
	const byCategory = await Blog.aggregate([
		{ $match: { category: { $exists: true } } },
		{ $group: { _id: "$category", count: { $sum: 1 } } },
	]);

	// Total des vues et likes
	const stats = await Blog.aggregate([
		{
			$group: {
				_id: null,
				totalViews: { $sum: "$views" },
				totalLikes: { $sum: "$likes" },
			},
		},
	]);

	// Statistiques de tracking
	const totalVisits = await BlogVisit.countDocuments();
	const uniqueVisitors = await BlogVisit.distinct("sessionId").then(
		(ids) => ids.length
	);

	const deviceBreakdown = await BlogVisit.aggregate([
		{ $group: { _id: "$device.type", count: { $sum: 1 } } },
	]);

	const topCountries = await BlogVisit.aggregate([
		{ $match: { country: { $exists: true, $ne: "Unknown" } } },
		{ $group: { _id: "$country", count: { $sum: 1 } } },
		{ $sort: { count: -1 } },
		{ $limit: 10 },
	]);

	const topReferrers = await BlogVisit.aggregate([
		{ $match: { referrerDomain: { $exists: true } } },
		{ $group: { _id: "$referrerDomain", count: { $sum: 1 } } },
		{ $sort: { count: -1 } },
		{ $limit: 10 },
	]);

	res.status(200).json({
		success: true,
		data: {
			total,
			published,
			draft,
			byType,
			byCategory,
			totalViews: stats[0]?.totalViews || 0,
			totalLikes: stats[0]?.totalLikes || 0,
			tracking: {
				totalVisits,
				uniqueVisitors,
				deviceBreakdown,
				topCountries,
				topReferrers,
			},
		},
	});
});

// Visites d'un blog
exports.getBlogVisits = catchAsync(async (req, res, next) => {
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 20;
	const skip = (page - 1) * limit;

	const visits = await BlogVisit.find({ blog: req.params.id })
		.populate("user", "email firstName lastName")
		.sort("-visitedAt")
		.skip(skip)
		.limit(limit);

	const total = await BlogVisit.countDocuments({ blog: req.params.id });

	// Enrichir les visites
	const enrichedVisits = await Promise.all(
		visits.map(async (visit) => {
			const visitObj = visit.toObject();

			if (!visitObj.user) {
				// 1. Essayer par sessionId
				let visitor = null;
				if (visitObj.sessionId) {
					visitor = await BlogVisitor.findOne({
						sessionId: visitObj.sessionId,
					}).select("email firstName lastName country city region");
				}

				// 2. Fallback par IP si pas trouvé
				if (!visitor && visitObj.ipAddress) {
					visitor = await BlogVisitor.findOne({
						ipAddress: visitObj.ipAddress,
					})
						.sort({ lastVisitAt: -1 }) // Le plus récent
						.select("email firstName lastName country city region");
				}

				if (visitor) {
					visitObj.visitorInfo = {
						email: visitor.email,
						firstName: visitor.firstName,
						lastName: visitor.lastName,
						country: visitor.country,
						city: visitor.city,
						region: visitor.region,
						type: "lead",
					};
				}
			} else if (visitObj.user) {
				visitObj.visitorInfo = {
					email: visitObj.user.email,
					firstName: visitObj.user.firstName,
					lastName: visitObj.user.lastName,
					type: "user",
				};
			}

			return visitObj;
		})
	);

	res.status(200).json({
		success: true,
		data: enrichedVisits,
		pagination: {
			current: page,
			pages: Math.ceil(total / limit),
			total,
		},
	});
});

// Toutes les visites
exports.getAllVisits = catchAsync(async (req, res, next) => {
	const queryObj = {};

	if (req.query.blogId) queryObj.blog = req.query.blogId;
	if (req.query.country) queryObj.country = req.query.country;
	if (req.query.deviceType) queryObj["device.type"] = req.query.deviceType;

	if (req.query.dateFrom || req.query.dateTo) {
		queryObj.visitedAt = {};
		if (req.query.dateFrom)
			queryObj.visitedAt.$gte = new Date(req.query.dateFrom);
		if (req.query.dateTo) queryObj.visitedAt.$lte = new Date(req.query.dateTo);
	}

	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 20;
	const skip = (page - 1) * limit;

	const visits = await BlogVisit.find(queryObj)
		.populate("blog", "title")
		.populate("user", "email firstName lastName") // Populate User email
		.sort("-visitedAt")
		.skip(skip)
		.limit(limit);

	const total = await BlogVisit.countDocuments(queryObj);

	// Enrichir les visites avec les emails des BlogVisitor (leads) si utilisateur non connecté
	const enrichedVisits = await Promise.all(
		visits.map(async (visit) => {
			const visitObj = visit.toObject();

			// Si pas d'utilisateur connecté
			if (!visitObj.user) {
				// 1. Essayer par sessionId
				let visitor = null;
				if (visitObj.sessionId) {
					visitor = await BlogVisitor.findOne({
						sessionId: visitObj.sessionId,
					}).select("email firstName lastName country city region");
				}

				// 2. Fallback par IP si pas trouvé
				if (!visitor && visitObj.ipAddress) {
					visitor = await BlogVisitor.findOne({
						ipAddress: visitObj.ipAddress,
					})
						.sort({ lastVisitAt: -1 }) // Le plus récent
						.select("email firstName lastName country city region");
				}

				if (visitor) {
					visitObj.visitorInfo = {
						email: visitor.email,
						firstName: visitor.firstName,
						lastName: visitor.lastName,
						country: visitor.country,
						city: visitor.city,
						region: visitor.region,
						type: "lead",
					};
				}
			} else if (visitObj.user) {
				visitObj.visitorInfo = {
					email: visitObj.user.email,
					firstName: visitObj.user.firstName,
					lastName: visitObj.user.lastName,
					type: "user",
				};
			}

			return visitObj;
		})
	);

	res.status(200).json({
		success: true,
		data: enrichedVisits, // Send enriched visits
		pagination: {
			current: page,
			pages: Math.ceil(total / limit),
			total,
		},
	});
});

// Traduction automatique
exports.translateText = catchAsync(async (req, res, next) => {
	const { text, fromLang, toLang } = req.body;

	if (!text || !fromLang || !toLang) {
		return next(
			new AppError("Texte, langue source et langue cible requis", 400)
		);
	}

	if (fromLang === toLang) {
		return res.status(200).json({
			success: true,
			data: {
				translatedText: text,
			},
		});
	}

	try {
		const axios = require("axios");
		try {
			const response = await axios.get(
				`https://api.mymemory.translated.net/get`,
				{
					params: {
						q: text,
						langpair: `${fromLang}|${toLang}`,
					},
					timeout: 5000,
				}
			);

			if (
				response.data &&
				response.data.responseData &&
				response.data.responseData.translatedText
			) {
				return res.status(200).json({
					success: true,
					data: {
						translatedText: response.data.responseData.translatedText,
					},
				});
			}
		} catch (mymemoryError) {
			console.log("MyMemory failed, trying LibreTranslate...");
		}

		// Fallback vers LibreTranslate
		try {
			const response = await axios.post(
				"https://libretranslate.de/translate",
				{
					q: text,
					source: fromLang,
					target: toLang,
					format: "text",
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
					timeout: 5000,
				}
			);

			if (response.data && response.data.translatedText) {
				return res.status(200).json({
					success: true,
					data: {
						translatedText: response.data.translatedText,
					},
				});
			}
		} catch (libreError) {
			console.error("LibreTranslate failed:", libreError.message);
		}

		// Si les deux services échouent, retourner le texte original
		return res.status(200).json({
			success: true,
			data: {
				translatedText: text,
				warning: "Traduction non disponible, texte original retourné",
			},
		});
	} catch (error) {
		console.error("Erreur lors de la traduction:", error);
		return res.status(200).json({
			success: true,
			data: {
				translatedText: text,
				warning: "Erreur de traduction, texte original retourné",
			},
		});
	}
});
