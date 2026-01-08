const mongoose = require("mongoose");
const validator = require("validator");

const newsletterSubscriberSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, "Veuillez fournir une adresse email"],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, "Veuillez fournir une adresse email valide"],
		trim: true,
	},
	isActive: {
		type: Boolean,
		default: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	unsubscribedAt: {
		type: Date,
	},
});

const NewsletterSubscriber = mongoose.model(
	"NewsletterSubscriber",
	newsletterSubscriberSchema
);

module.exports = NewsletterSubscriber;
