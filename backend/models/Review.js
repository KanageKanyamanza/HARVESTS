const mongoose = require("mongoose");

// Schéma pour les critères d'évaluation détaillés
const ratingCriteriaSchema = new mongoose.Schema({
	quality: {
		type: Number,
		min: 1,
		max: 5,
		required: true,
	},
	freshness: {
		type: Number,
		min: 1,
		max: 5,
		required: true,
	},
	packaging: {
		type: Number,
		min: 1,
		max: 5,
		required: true,
	},
	delivery: {
		type: Number,
		min: 1,
		max: 5,
		required: true,
	},
	communication: {
		type: Number,
		min: 1,
		max: 5,
		required: true,
	},
	valueForMoney: {
		type: Number,
		min: 1,
		max: 5,
		required: true,
	},
});

// Schéma pour les réponses aux avis
const reviewReplySchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	content: {
		type: String,
		required: [true, "Le contenu du commentaire est requis"],
		maxlength: [1000, "Le commentaire ne peut pas dépasser 1000 caractères"],
		trim: true,
	},
	likes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	createdAt: {
		type: Date,
		default: Date.now,
	},
	isEdited: {
		type: Boolean,
		default: false,
	},
	editedAt: Date,
});

// Schéma pour les images/vidéos d'avis
const reviewMediaSchema = new mongoose.Schema({
	type: {
		type: String,
		enum: ["image", "video"],
		required: true,
	},
	url: {
		type: String,
		required: true,
	},
	thumbnail: String, // Pour les vidéos
	caption: String,
	order: {
		type: Number,
		default: 0,
	},
});

// Schéma principal des avis
const reviewSchema = new mongoose.Schema(
	{
		// Références
		reviewer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Évaluateur requis"],
		},

		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: [true, "Produit requis"],
		},

		order: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Order",
			required: [true, "Commande requise"],
		},

		producer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Producteur requis"],
		},

		// Évaluation globale
		rating: {
			type: Number,
			required: [true, "Note globale requise"],
			min: [1, "La note minimum est 1"],
			max: [5, "La note maximum est 5"],
		},

		// Évaluation détaillée
		detailedRating: ratingCriteriaSchema,

		// Contenu de l'avis
		title: {
			type: String,
			required: false,
			maxlength: [200, "Le titre ne peut pas dépasser 200 caractères"],
			trim: true,
			default: "",
		},

		comment: {
			type: String,
			required: false,
			maxlength: [2000, "Le commentaire ne peut pas dépasser 2000 caractères"],
			trim: true,
			default: "",
		},

		// Médias attachés
		media: [reviewMediaSchema],

		// Informations sur l'achat vérifié
		isVerifiedPurchase: {
			type: Boolean,
			default: true,
		},

		purchaseDate: Date,

		// Réponse du producteur
		producerResponse: {
			comment: {
				type: String,
				maxlength: [1000, "La réponse ne peut pas dépasser 1000 caractères"],
			},
			respondedAt: Date,
			respondedBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		},

		// Utilité de l'avis
		helpfulVotes: {
			type: Number,
			default: 0,
			min: 0,
		},

		unhelpfulVotes: {
			type: Number,
			default: 0,
			min: 0,
		},

		// Nouveau système de likes
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],

		// Réponses (commentaires sur l'avis)
		replies: [reviewReplySchema],

		// Utilisateurs qui ont voté
		voters: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				vote: {
					type: String,
					enum: ["helpful", "unhelpful"],
				},
				votedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],

		// Statut et modération
		status: {
			type: String,
			enum: ["pending", "approved", "rejected", "reported", "hidden"],
			default: "approved", // Auto-approuvé par défaut
		},

		moderationReason: String,

		moderatedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},

		moderatedAt: Date,

		// Signalements
		reports: [
			{
				reportedBy: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				reason: {
					type: String,
					enum: [
						"inappropriate-content",
						"spam",
						"fake-review",
						"offensive-language",
						"irrelevant",
						"other",
					],
				},
				description: String,
				reportedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],

		// Métadonnées
		isEdited: {
			type: Boolean,
			default: false,
		},

		editedAt: Date,

		originalReview: {
			title: String,
			comment: String,
			rating: Number,
		},

		// Informations techniques
		deviceInfo: {
			userAgent: String,
			platform: String,
			language: String,
		},

		// Informations géographiques
		location: {
			country: String,
			region: String,
			city: String,
		},

		// Tags automatiques basés sur le contenu
		autoTags: [
			{
				type: String,
				lowercase: true,
			},
		],

		// Sentiment analysis (à implémenter)
		sentiment: {
			score: {
				type: Number,
				min: -1,
				max: 1,
			},
			label: {
				type: String,
				enum: ["positive", "negative", "neutral"],
			},
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Index pour performance
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ producer: 1, status: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1, createdAt: -1 });
reviewSchema.index({ order: 1 }, { unique: true }); // Un seul avis par commande
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isVerifiedPurchase: 1 });
reviewSchema.index({ helpfulVotes: -1 });

// Index de recherche textuelle
reviewSchema.index({
	title: "text",
	comment: "text",
	"producerResponse.comment": "text",
});

// Virtuals
reviewSchema.virtual("helpfulnessRatio").get(function () {
	const totalVotes = this.helpfulVotes + this.unhelpfulVotes;
	if (totalVotes === 0) return 0;
	return this.helpfulVotes / totalVotes;
});

reviewSchema.virtual("averageDetailedRating").get(function () {
	if (!this.detailedRating) return this.rating;

	const criteria = this.detailedRating;
	const ratings = [
		criteria.quality,
		criteria.freshness,
		criteria.packaging,
		criteria.delivery,
		criteria.communication,
		criteria.valueForMoney,
	];

	const sum = ratings.reduce((acc, rating) => acc + rating, 0);
	return Math.round((sum / ratings.length) * 10) / 10;
});

reviewSchema.virtual("isRecent").get(function () {
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
	return this.createdAt > thirtyDaysAgo;
});

reviewSchema.virtual("hasResponse").get(function () {
	return !!(this.producerResponse && this.producerResponse.comment);
});

reviewSchema.virtual("totalReports").get(function () {
	return this.reports ? this.reports.length : 0;
});

// Middleware pre-save
reviewSchema.pre("save", function (next) {
	// Calculer la note moyenne si les critères détaillés sont fournis
	if (this.detailedRating && !this.rating) {
		this.rating = this.averageDetailedRating;
	}

	// Marquer comme édité si modifié
	if (
		this.isModified("title") ||
		this.isModified("comment") ||
		this.isModified("rating")
	) {
		if (!this.isNew) {
			this.isEdited = true;
			this.editedAt = new Date();

			// Sauvegarder la version originale
			if (!this.originalReview) {
				this.originalReview = {
					title: this.title,
					comment: this.comment,
					rating: this.rating,
				};
			}
		}
	}

	// Auto-tags basés sur le contenu (implémentation simple)
	this.generateAutoTags();

	next();
});

// Middleware post-save pour mettre à jour les statistiques du produit
reviewSchema.post("save", async function () {
	try {
		const Product = mongoose.model("Product");
		const product = await Product.findById(this.product);
		if (product) {
			await product.updateStats();
		}

		// Mettre à jour les statistiques du producteur
		try {
			const Producer = mongoose.models.Producer || require("./Producer");
			const producer = await Producer.findById(this.producer);
			if (producer && producer.updateAverageRating) {
				await producer.updateAverageRating();
			}
		} catch (producerError) {
			console.log(
				"Modèle Producer non disponible pour mise à jour stats:",
				producerError.message
			);
		}
	} catch (error) {
		console.error("Erreur lors de la mise à jour des statistiques:", error);
	}
});

// Méthodes du schéma
reviewSchema.methods.vote = function (userId, voteType) {
	// Vérifier si l'utilisateur a déjà voté
	const existingVoteIndex = this.voters.findIndex(
		(voter) => voter.user.toString() === userId.toString()
	);

	if (existingVoteIndex !== -1) {
		const existingVote = this.voters[existingVoteIndex];

		// Si même vote, ne rien faire
		if (existingVote.vote === voteType) {
			return this;
		}

		// Changer le vote
		if (existingVote.vote === "helpful") {
			this.helpfulVotes -= 1;
		} else {
			this.unhelpfulVotes -= 1;
		}

		if (voteType === "helpful") {
			this.helpfulVotes += 1;
		} else {
			this.unhelpfulVotes += 1;
		}

		this.voters[existingVoteIndex].vote = voteType;
		this.voters[existingVoteIndex].votedAt = new Date();
	} else {
		// Nouveau vote
		if (voteType === "helpful") {
			this.helpfulVotes += 1;
		} else {
			this.unhelpfulVotes += 1;
		}

		this.voters.push({
			user: userId,
			vote: voteType,
			votedAt: new Date(),
		});
	}

	return this.save();
};

reviewSchema.methods.removeVote = function (userId) {
	const voteIndex = this.voters.findIndex(
		(voter) => voter.user.toString() === userId.toString()
	);

	if (voteIndex !== -1) {
		const vote = this.voters[voteIndex];

		if (vote.vote === "helpful") {
			this.helpfulVotes -= 1;
		} else {
			this.unhelpfulVotes -= 1;
		}

		this.voters.splice(voteIndex, 1);
	}

	return this.save();
};

reviewSchema.methods.addProducerResponse = function (comment, respondedBy) {
	this.producerResponse = {
		comment,
		respondedAt: new Date(),
		respondedBy,
	};

	return this.save();
};

reviewSchema.methods.report = function (reportedBy, reason, description = "") {
	// Vérifier si l'utilisateur a déjà signalé cet avis
	const existingReport = this.reports.find(
		(report) => report.reportedBy.toString() === reportedBy.toString()
	);

	if (!existingReport) {
		this.reports.push({
			reportedBy,
			reason,
			description,
			reportedAt: new Date(),
		});

		// Marquer comme signalé si assez de signalements
		if (this.reports.length >= 3) {
			this.status = "reported";
		}
	}

	return this.save();
};

reviewSchema.methods.moderate = function (status, reason, moderatorId) {
	this.status = status;
	this.moderationReason = reason;
	this.moderatedBy = moderatorId;
	this.moderatedAt = new Date();

	return this.save();
};

reviewSchema.methods.toggleLike = function (userId) {
	const likeIndex = this.likes.indexOf(userId);
	if (likeIndex === -1) {
		this.likes.push(userId);
	} else {
		this.likes.splice(likeIndex, 1);
	}
	return this.save();
};

reviewSchema.methods.addReply = function (userId, content) {
	this.replies.push({
		user: userId,
		content,
		createdAt: new Date(),
	});
	return this.save();
};

reviewSchema.methods.toggleReplyLike = function (replyId, userId) {
	const reply = this.replies.id(replyId);
	if (!reply) return null;

	const likeIndex = reply.likes.indexOf(userId);
	if (likeIndex === -1) {
		reply.likes.push(userId);
	} else {
		reply.likes.splice(likeIndex, 1);
	}
	return this.save();
};

reviewSchema.methods.generateAutoTags = function () {
	const text = `${this.title} ${this.comment}`.toLowerCase();
	const tags = [];

	// Tags basés sur des mots-clés
	const keywords = {
		quality: ["qualité", "frais", "bon", "excellent", "parfait"],
		delivery: ["livraison", "rapide", "ponctuel", "retard"],
		packaging: ["emballage", "emballé", "packaging", "conditionnement"],
		service: ["service", "accueil", "communication", "réponse"],
		price: ["prix", "cher", "abordable", "rapport qualité prix"],
		organic: ["bio", "biologique", "naturel", "sans pesticides"],
		fresh: ["frais", "fraîcheur", "croquant"],
		recommended: ["recommande", "conseil", "satisfait"],
	};

	Object.keys(keywords).forEach((tag) => {
		if (keywords[tag].some((keyword) => text.includes(keyword))) {
			tags.push(tag);
		}
	});

	this.autoTags = tags;
};

// Méthodes statiques
reviewSchema.statics.getProductRatingStats = function (productId) {
	const match = { status: "approved" };

	if (productId) {
		if (mongoose.Types.ObjectId.isValid(productId)) {
			match.product = new mongoose.Types.ObjectId(productId);
		} else {
			match.product = productId;
		}
	}

	return this.aggregate([
		{ $match: match },
		{
			$group: {
				_id: null,
				averageRating: { $avg: "$rating" },
				totalReviews: { $sum: 1 },
				ratingDistribution: { $push: "$rating" },
			},
		},
		{
			$addFields: {
				ratingCounts: {
					5: {
						$size: {
							$filter: {
								input: "$ratingDistribution",
								cond: { $eq: ["$$this", 5] },
							},
						},
					},
					4: {
						$size: {
							$filter: {
								input: "$ratingDistribution",
								cond: { $eq: ["$$this", 4] },
							},
						},
					},
					3: {
						$size: {
							$filter: {
								input: "$ratingDistribution",
								cond: { $eq: ["$$this", 3] },
							},
						},
					},
					2: {
						$size: {
							$filter: {
								input: "$ratingDistribution",
								cond: { $eq: ["$$this", 2] },
							},
						},
					},
					1: {
						$size: {
							$filter: {
								input: "$ratingDistribution",
								cond: { $eq: ["$$this", 1] },
							},
						},
					},
				},
			},
		},
	]);
};

reviewSchema.statics.getProducerRatingStats = async function (producerId) {
	const reviews = await this.find({ producer: producerId, status: "approved" });

	if (reviews.length === 0) {
		return [
			{
				averageRating: 0,
				totalReviews: 0,
				averageDetailedRatings: {
					quality: 0,
					freshness: 0,
					packaging: 0,
					delivery: 0,
					communication: 0,
					valueForMoney: 0,
				},
			},
		];
	}

	const totalReviews = reviews.length;
	const averageRating =
		reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

	// Calculer les moyennes des évaluations détaillées si elles existent
	const detailedRatings = reviews.filter((review) => review.detailedRating);
	let averageDetailedRatings = {
		quality: 0,
		freshness: 0,
		packaging: 0,
		delivery: 0,
		communication: 0,
		valueForMoney: 0,
	};

	if (detailedRatings.length > 0) {
		averageDetailedRatings = {
			quality:
				detailedRatings.reduce(
					(sum, review) => sum + (review.detailedRating.quality || 0),
					0
				) / detailedRatings.length,
			freshness:
				detailedRatings.reduce(
					(sum, review) => sum + (review.detailedRating.freshness || 0),
					0
				) / detailedRatings.length,
			packaging:
				detailedRatings.reduce(
					(sum, review) => sum + (review.detailedRating.packaging || 0),
					0
				) / detailedRatings.length,
			delivery:
				detailedRatings.reduce(
					(sum, review) => sum + (review.detailedRating.delivery || 0),
					0
				) / detailedRatings.length,
			communication:
				detailedRatings.reduce(
					(sum, review) => sum + (review.detailedRating.communication || 0),
					0
				) / detailedRatings.length,
			valueForMoney:
				detailedRatings.reduce(
					(sum, review) => sum + (review.detailedRating.valueForMoney || 0),
					0
				) / detailedRatings.length,
		};
	}

	return [
		{
			averageRating: Math.round(averageRating * 10) / 10,
			totalReviews,
			averageDetailedRatings,
		},
	];
};

reviewSchema.statics.getFeaturedReviews = function (productId, limit = 5) {
	return this.find({
		product: productId,
		status: "approved",
	})
		.populate("reviewer", "firstName lastName avatar")
		.sort({
			helpfulVotes: -1,
			createdAt: -1,
		})
		.limit(limit);
};

reviewSchema.statics.getRecentReviews = function (
	producerId,
	days = 30,
	limit = 10
) {
	const dateLimit = new Date();
	dateLimit.setDate(dateLimit.getDate() - days);

	return this.find({
		producer: producerId,
		status: "approved",
		createdAt: { $gte: dateLimit },
	})
		.populate("reviewer", "firstName lastName avatar")
		.populate("product", "name images")
		.sort({ createdAt: -1 })
		.limit(limit);
};

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
