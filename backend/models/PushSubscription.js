const mongoose = require("mongoose");

const pushSubscriptionSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		endpoint: {
			type: String,
			required: true,
		},
		keys: {
			p256dh: {
				type: String,
				required: true,
			},
			auth: {
				type: String,
				required: true,
			},
		},
		userAgent: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

// Avoid duplicate subscriptions for the same endpoint
pushSubscriptionSchema.index({ endpoint: 1 }, { unique: true });
pushSubscriptionSchema.index({ user: 1 });

module.exports = mongoose.model("PushSubscription", pushSubscriptionSchema);
