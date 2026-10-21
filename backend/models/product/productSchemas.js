const mongoose = require("mongoose");

// Schéma pour les variantes de produits
const variantSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "validation.variant_name_required"],
	},
	sku: {
		type: String,
		unique: true,
		sparse: true,
	},
	price: {
		type: Number,
		required: [true, "validation.price_required"],
		min: [0, "validation.price_negative"],
	},
	compareAtPrice: {
		type: Number,
		min: [0, "validation.compare_price_negative"],
	},
	weight: {
		value: {
			type: Number,
			required: [true, "validation.weight_required"],
			min: [0, "validation.weight_negative"],
		},
		unit: {
			type: String,
			enum: ["g", "kg", "lb", "oz"],
			default: "kg",
		},
	},
	dimensions: {
		length: Number,
		width: Number,
		height: Number,
		unit: {
			type: String,
			enum: ["cm", "m", "in", "ft"],
			default: "cm",
		},
	},
	inventory: {
		quantity: {
			type: Number,
			default: 0,
			min: [0, "validation.quantity_negative"],
		},
		lowStockThreshold: {
			type: Number,
			default: 10,
		},
		trackQuantity: {
			type: Boolean,
			default: true,
		},
		allowBackorder: {
			type: Boolean,
			default: false,
		},
	},
	attributes: [
		{
			name: String, // ex: "Couleur", "Taille", "Qualité"
			value: String, // ex: "Rouge", "Large", "Bio"
		},
	],
	images: [
		{
			url: String,
			alt: String,
			isPrimary: {
				type: Boolean,
				default: false,
			},
		},
	],
	isActive: {
		type: Boolean,
		default: true,
	},
});

// Schéma principal du produit
const productSchema = new mongoose.Schema(
	{
		// Informations de base
		// Jour 45 (bascule bilingue) : name/description/shortDescription acceptent
		// soit une chaîne (documents historiques, avant migration), soit un objet
		// { fr, en } — le champ `en` est rempli automatiquement par traduction
		// automatique dans productMiddleware.js si absent à la sauvegarde.
		// Type Mixed plutôt qu'un sous-schéma strict pour rester compatible en
		// lecture avec les documents existants sans migration préalable.
		name: {
			type: mongoose.Schema.Types.Mixed,
			required: [true, "validation.product_name_required"],
			validate: {
				validator: function (value) {
					const text = typeof value === "string" ? value : value?.fr;
					return typeof text === "string" && text.trim().length > 0 && text.length <= 200;
				},
				message: "validation.product_name_invalid",
			},
		},

		slug: {
			type: String,
			unique: true,
			lowercase: true,
		},

		description: {
			type: mongoose.Schema.Types.Mixed,
			required: [true, "validation.product_description_required"],
			validate: {
				validator: function (value) {
					const text = typeof value === "string" ? value : value?.fr;
					return typeof text === "string" && text.trim().length > 0 && text.length <= 2000;
				},
				message: "validation.product_description_invalid",
			},
		},

		shortDescription: {
			type: mongoose.Schema.Types.Mixed,
			validate: {
				validator: function (value) {
					if (value === undefined || value === null || value === "") return true;
					const text = typeof value === "string" ? value : value?.fr;
					return typeof text === "string" && text.length <= 300;
				},
				message: "validation.product_short_description_maxlength",
			},
		},

		// Producteur
		producer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: function () {
				return this.userType === "producer";
			},
		},

		// Transformateur
		transformer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: function () {
				return this.userType === "transformer";
			},
		},

		restaurateur: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: function () {
				return this.userType === "restaurateur";
			},
		},

		// Type d'utilisateur (producer ou transformer)
		userType: {
			type: String,
			enum: ["producer", "transformer", "restaurateur"],
			required: true,
		},
		originType: {
			type: String,
			enum: ["catalog", "dish"],
			default: "catalog",
		},

		sourceDish: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Restaurateur.dishes",
		},

		dishInfo: {
			category: String,
			preparationTime: Number,
			allergens: [String],
		},

		isPublic: {
			type: Boolean,
			default: true,
		},

		// Catégorisation
		category: {
			type: String,
			required: [true, "validation.product_category_required"],
			enum: [
				"cereals",
				"vegetables",
				"fruits",
				"legumes",
				"tubers",
				"spices",
				"herbs",
				"nuts",
				"seeds",
				"dairy",
				"meat",
				"poultry",
				"fish",
				"processed-foods",
				"beverages",
				"other",
			],
		},

		subcategory: {
			type: String,
			required: false,
		},

		tags: [
			{
				type: String,
				lowercase: true,
			},
		],

		// Unité de mesure
		unit: {
			type: String,
			default: "unité",
		},

		// Prix et variantes
		hasVariants: {
			type: Boolean,
			default: false,
		},

		// Si pas de variantes, prix unique
		price: {
			type: Number,
			min: [0, "validation.price_negative"],
		},

		compareAtPrice: {
			type: Number,
			min: [0, "validation.compare_price_negative"],
		},

		currency: {
			type: String,
			default: "XOF",
		},

		// Vente Flash
		flashSale: {
			isActive: {
				type: Boolean,
				default: false,
			},
			discountPercentage: {
				type: Number,
				min: 0,
				max: 100,
			},
			salePrice: {
				type: Number,
				min: 0,
			},
			endDate: {
				type: Date,
			},
		},

		// Variantes du produit
		variants: [variantSchema],

		// Images
		images: [
			{
				url: {
					type: String,
					required: true,
				},
				alt: String,
				isPrimary: {
					type: Boolean,
					default: false,
				},
				order: {
					type: Number,
					default: 0,
				},
			},
		],

		// Inventaire (si pas de variantes)
		inventory: {
			quantity: {
				type: Number,
				default: 0,
				min: [0, "validation.quantity_negative"],
			},
			lowStockThreshold: {
				type: Number,
				default: 10,
			},
			trackQuantity: {
				type: Boolean,
				default: true,
			},
			allowBackorder: {
				type: Boolean,
				default: false,
			},
			reservedQuantity: {
				type: Number,
				default: 0,
			},
		},

		// Commande minimum (désactivé - les clients peuvent commander n'importe quelle quantité)
		minimumOrderQuantity: {
			type: Number,
			default: 0,
		},

		maximumOrderQuantity: {
			type: Number,
			min: [1, "validation.max_quantity_min_1"],
		},

		// Statut et modération
		status: {
			type: String,
			enum: ["draft", "pending-review", "approved", "rejected", "inactive"],
			default: "draft",
		},

		rejectionReason: String,

		isActive: {
			type: Boolean,
			default: true,
		},

		isFeatured: {
			type: Boolean,
			default: false,
		},

		// Métadonnées
		publishedAt: Date,
		lastStockUpdate: Date,

		// Statistiques
		stats: {
			views: {
				type: Number,
				default: 0,
			},
			sales: {
				type: Number,
				default: 0,
			},
			favorites: {
				type: Number,
				default: 0,
			},
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

module.exports = {
	variantSchema,
	productSchema,
};
