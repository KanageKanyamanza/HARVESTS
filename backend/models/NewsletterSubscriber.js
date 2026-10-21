const mongoose = require("mongoose");
const validator = require("validator");

const newsletterSubscriberSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, "validation.newsletter_subscriber_email_required"],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, "validation.newsletter_subscriber_email_invalid"],
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
