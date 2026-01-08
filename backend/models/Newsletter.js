const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema({
	subject: {
		type: String,
		required: [true, "Une newsletter doit avoir un sujet"],
		trim: true,
	},
	content: {
		type: String,
		required: [true, "Une newsletter doit avoir un contenu"],
	},
	originalContent: {
		type: String, // Stores the Markdown version
	},
	imageUrl: {
		type: String,
	},
	status: {
		type: String,
		enum: ["draft", "sent"],
		default: "draft",
	},
	sentAt: {
		type: Date,
	},
	recipientCount: {
		type: Number,
		default: 0,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
	opens: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "NewsletterSubscriber",
		},
	],
});

// Update timestamp before saving
newsletterSchema.pre("save", function (next) {
	this.updatedAt = Date.now();
	next();
});

const Newsletter = mongoose.model("Newsletter", newsletterSchema);

module.exports = Newsletter;
