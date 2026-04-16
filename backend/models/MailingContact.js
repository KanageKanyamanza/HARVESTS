const mongoose = require("mongoose");

const mailingContactSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: [true, "L'adresse email est obligatoire"],
			unique: true,
			trim: true,
			lowercase: true,
		},
		firstName: {
			type: String,
			trim: true,
			default: "",
		},
		lastName: {
			type: String,
			trim: true,
			default: "",
		},
		companyName: {
			type: String,
			trim: true,
			default: "",
		},
		source: {
			type: String,
			enum: ["manual", "import"],
			default: "manual",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		lastEmailedAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
	},
);

// Index pour la recherche textuelle
mailingContactSchema.index({
	email: "text",
	firstName: "text",
	lastName: "text",
	companyName: "text",
});

const MailingContact = mongoose.model("MailingContact", mailingContactSchema);

module.exports = MailingContact;
