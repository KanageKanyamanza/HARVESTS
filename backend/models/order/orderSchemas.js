const mongoose = require("mongoose");

// Schéma pour les articles de commande
const orderItemSchema = new mongoose.Schema({
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
		required: [true, "validation.product_required"],
	},
	variant: {
		type: mongoose.Schema.Types.ObjectId,
		required: false, // Seulement si le produit a des variantes
	},
	seller: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	productSnapshot: {
		name: String,
		description: String,
		unit: String,
		images: [String],
		producer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		transformer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		restaurateur: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	},
	quantity: {
		type: Number,
		required: [true, "validation.quantity_required"],
		min: [1, "validation.quantity_min_1"],
	},
	unit: {
		type: String,
		default: "unité",
	},
	unitPrice: {
		type: Number,
		required: [true, "validation.unit_price_required"],
		min: [0, "validation.price_negative"],
	},
	totalPrice: {
		type: Number,
		required: [true, "validation.total_price_required"],
		min: [0, "validation.total_price_negative"],
	},
	currency: {
		type: String,
		default: "XOF",
	},
	weight: {
		value: Number,
		unit: String,
	},
	specialInstructions: String,
	status: {
		type: String,
		enum: [
			"pending",
			"confirmed",
			"preparing",
			"ready-for-pickup",
			"in-transit",
			"delivered",
			"completed",
			"cancelled",
			"rejected",
			"refunded",
			"disputed",
		],
		default: "pending",
	},
	statusHistory: [
		{
			status: String,
			timestamp: {
				type: Date,
				default: Date.now,
			},
			updatedBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
			note: String,
			reason: String,
		},
	],
});

const segmentHistorySchema = new mongoose.Schema(
	{
		status: String,
		timestamp: {
			type: Date,
			default: Date.now,
		},
		updatedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		note: String,
		reason: String,
	},
	{ _id: false }
);

const orderSegmentSchema = new mongoose.Schema(
	{
		seller: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		status: {
			type: String,
			enum: [
				"pending",
				"confirmed",
				"preparing",
				"ready-for-pickup",
				"in-transit",
				"delivered",
				"completed",
				"cancelled",
				"refunded",
				"disputed",
			],
			default: "pending",
		},
		subtotal: {
			type: Number,
			default: 0,
		},

		discount: {
			type: Number,
			default: 0,
		},
		taxes: {
			type: Number,
			default: 0,
		},
		total: {
			type: Number,
			default: 0,
		},
		items: [orderItemSchema],
		history: [segmentHistorySchema],
	},
	{
		timestamps: true,
	}
);

// Schéma pour l'adresse de livraison
const deliveryAddressSchema = new mongoose.Schema({
	label: String,
	firstName: String,
	lastName: String,
	company: String,
	street: {
		type: String,
		required: [true, "validation.street_required"],
	},
	city: {
		type: String,
		required: [true, "validation.city_required"],
	},
	region: {
		type: String,
		required: [true, "validation.region_required"],
	},
	country: {
		type: String,
		default: "Senegal",
	},
	postalCode: String,
	phone: String,
	coordinates: {
		latitude: Number,
		longitude: Number,
	},
	deliveryInstructions: String,
});

// Schéma pour le paiement
const paymentSchema = new mongoose.Schema({
	method: {
		type: String,
		enum: ["cash", "paypal"],
		required: [true, "validation.payment_method_required"],
	},
	provider: {
		type: String,
		enum: ["cash-on-delivery", "paypal"],
		default: function () {
			return this.method === "cash" ? "cash-on-delivery" : "paypal";
		},
	},
	status: {
		type: String,
		enum: [
			"pending",
			"processing",
			"completed",
			"failed",
			"refunded",
			"cancelled",
		],
		default: "pending",
	},
	transactionId: String,
	amount: {
		type: Number,
		required: [true, "validation.amount_required"],
	},
	currency: {
		type: String,
		default: "XAF",
	},
	paidAt: Date,
	failureReason: String,
	refundAmount: Number,
	refundedAt: Date,
	fees: {
		platform: Number,
		payment: Number,
		total: Number,
	},
});

// Schéma pour la livraison
const deliverySchema = new mongoose.Schema({
	transporter: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User", // Référence vers un utilisateur de type transporter
	},
	method: {
		type: String,
		enum: [
			"pickup",
			"standard-delivery",
			"express-delivery",
			"same-day",
			"scheduled",
		],
		required: [true, "validation.delivery_method_required"],
	},
	status: {
		type: String,
		enum: [
			"pending",
			"confirmed",
			"picked-up",
			"in-transit",
			"out-for-delivery",
			"delivered",
			"failed",
			"returned",
		],
		default: "pending",
	},
	trackingNumber: String,
	estimatedDeliveryDate: Date,
	actualDeliveryDate: Date,

	deliveryAddress: deliveryAddressSchema,
	pickupAddress: deliveryAddressSchema,
	timeline: [
		{
			status: String,
			timestamp: {
				type: Date,
				default: Date.now,
			},
			location: String,
			note: String,
			updatedBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		},
	],
	proofOfDelivery: {
		signature: String,
		photo: String,
		recipientName: String,
		deliveredAt: Date,
	},
	specialRequirements: {
		refrigerated: Boolean,
		fragile: Boolean,
		timeWindow: {
			start: String,
			end: String,
		},
	},
});

// Schéma principal de la commande
const orderSchema = new mongoose.Schema(
	{
		// Numéro de commande unique
		orderNumber: {
			type: String,
			unique: true,
			required: true,
		},

		// Participants
		buyer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "validation.buyer_required"],
		},

		seller: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},

		// Articles commandés
		items: [orderItemSchema],

		// Segments par vendeur pour commandes multi-vendeurs
		segments: [orderSegmentSchema],

		// Montants
		subtotal: {
			type: Number,
			required: [true, "validation.subtotal_required"],
			min: [0, "validation.subtotal_negative"],
		},



		taxes: {
			type: Number,
			default: 0,
			min: [0, "validation.taxes_negative"],
		},

		discount: {
			type: Number,
			default: 0,
			min: [0, "validation.discount_negative"],
		},

		total: {
			type: Number,
			required: [true, "validation.total_required"],
			min: [0, "validation.total_negative"],
		},

		currency: {
			type: String,
			default: "XAF",
			enum: [
				"XAF",
				"EUR",
				"USD",
				"XOF",
				"NGN",
				"GHS",
				"KES",
				"ZAR",
				"MAD",
				"EGP",
				"TZS",
				"UGX",
				"ZMW",
				"ZWL",
			],
		},

		// Statut de la commande
		status: {
			type: String,
			enum: [
				"pending", // En attente de confirmation
				"confirmed", // Confirmée par le vendeur
				"preparing", // En préparation
				"ready-for-pickup", // Prête pour collecte
				"in-transit", // En transit
				"delivered", // Livrée
				"completed", // Terminée (paiement confirmé)
				"cancelled", // Annulée
				"refunded", // Remboursée
				"disputed", // En litige
			],
			default: "pending",
		},

		// Paiement
		payment: paymentSchema,

		// Livraison
		delivery: deliverySchema,

		// Code de réduction appliqué
		couponCode: String,
		couponDiscount: {
			type: Number,
			default: 0,
		},

		// Points de fidélité
		loyaltyPointsUsed: {
			type: Number,
			default: 0,
		},
		loyaltyPointsEarned: {
			type: Number,
			default: 0,
		},

		// Notes et instructions
		buyerNotes: String,
		sellerNotes: String,
		internalNotes: String,

		// Dates importantes
		confirmedAt: Date,
		shippedAt: Date,
		deliveredAt: Date,
		completedAt: Date,
		cancelledAt: Date,

		// Raisons d'annulation ou de retour
		cancellationReason: String,
		cancelledBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},

		// Informations de facturation
		billingAddress: deliveryAddressSchema,
		invoiceNumber: String,

		// Métadonnées
		source: {
			type: String,
			enum: ["web", "mobile", "api", "admin"],
			default: "web",
		},

		deviceInfo: {
			userAgent: String,
			ip: String,
		},

		// Suivi des modifications
		statusHistory: [
			{
				status: String,
				timestamp: {
					type: Date,
					default: Date.now,
				},
				updatedBy: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				reason: String,
				note: String,
			},
		],

		// Informations pour l'export
		isExport: {
			type: Boolean,
			default: false,
		},

		exportInfo: {
			destinationCountry: String,
			customsDeclaration: String,
			exportLicense: String,
			incoterms: String,
			exportValue: Number,
		},

		// Évaluation et avis
		isReviewed: {
			type: Boolean,
			default: false,
		},

		review: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Review",
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

module.exports = {
	orderSchema,
	orderItemSchema,
	segmentHistorySchema,
	orderSegmentSchema,
	deliveryAddressSchema,
	paymentSchema,
	deliverySchema,
};
