const NewsletterSubscriber = require("../models/NewsletterSubscriber");
const Newsletter = require("../models/Newsletter");
const emailQueue = require("../services/emailQueueService");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Public: Subscribe to newsletter
exports.subscribe = catchAsync(async (req, res, next) => {
	const { email } = req.body;

	if (!email) {
		return next(new AppError("Veuillez fournir une adresse email.", 400));
	}

	let subscriber = await NewsletterSubscriber.findOne({ email });

	if (subscriber) {
		if (!subscriber.isActive) {
			subscriber.isActive = true;
			subscriber.unsubscribedAt = undefined;
			await subscriber.save();

			return res.status(200).json({
				status: "success",
				message: "Re-bonjour ! Vous êtes à nouveau abonné à notre newsletter.",
			});
		} else {
			return res.status(200).json({
				status: "success",
				message: "Vous êtes déjà abonné à notre newsletter.",
			});
		}
	}

	subscriber = await NewsletterSubscriber.create({ email });

	res.status(201).json({
		status: "success",
		message: "Merci de vous être abonné à notre newsletter !",
	});
});

// Public: Unsubscribe
exports.unsubscribe = catchAsync(async (req, res, next) => {
	const { email } = req.query; // Or req.body, but links usually use query

	if (!email) {
		return next(new AppError("Email manquant pour la désinscription.", 400));
	}

	const subscriber = await NewsletterSubscriber.findOne({ email });

	if (subscriber && subscriber.isActive) {
		subscriber.isActive = false;
		subscriber.unsubscribedAt = Date.now();
		await subscriber.save();
	}

	res.status(200).json({
		status: "success",
		message: "Vous avez été désabonné avec succès.",
	});
});

// Admin: Get all subscribers
exports.getAllSubscribers = catchAsync(async (req, res, next) => {
	const subscribers = await NewsletterSubscriber.find().sort("-createdAt");

	res.status(200).json({
		status: "success",
		results: subscribers.length,
		data: { subscribers },
	});
});

// Admin: Get all newsletters
exports.getAllNewsletters = catchAsync(async (req, res, next) => {
	const newsletters = await Newsletter.find().sort("-createdAt");

	res.status(200).json({
		status: "success",
		results: newsletters.length,
		data: { newsletters },
	});
});

// Admin: Create newsletter
exports.createNewsletter = catchAsync(async (req, res, next) => {
	const { subject, content, imageUrl } = req.body;

	const newsletter = await Newsletter.create({
		subject,
		content,
		imageUrl,
		status: "draft",
	});

	res.status(201).json({
		status: "success",
		data: { newsletter },
	});
});

// Admin: Update newsletter
exports.updateNewsletter = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { subject, content, imageUrl } = req.body;

	const newsletter = await Newsletter.findByIdAndUpdate(
		id,
		{
			subject,
			content,
			imageUrl,
			updatedAt: Date.now(),
		},
		{ new: true, runValidators: true }
	);

	if (!newsletter) {
		return next(new AppError("Newsletter non trouvée", 404));
	}

	res.status(200).json({
		status: "success",
		data: { newsletter },
	});
});

// Admin: Delete newsletter
exports.deleteNewsletter = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	await Newsletter.findByIdAndDelete(id);

	res.status(204).json({
		status: "success",
		data: null,
	});
});

// Public: Track newsletter open
exports.trackOpen = catchAsync(async (req, res, next) => {
	const { id, subscriberId } = req.params;
	console.log(
		`👁️ Tracking Open Request: Newsletter ${id}, Subscriber ${subscriberId}`
	);

	// 1x1 transparent GIF
	const transparentPixel = Buffer.from(
		"R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
		"base64"
	);

	try {
		const newsletter = await Newsletter.findById(id);
		console.log(`📄 Newsletter found: ${newsletter ? "Yes" : "No"}`);
		if (newsletter) {
			// Add subscriber ID to opens set if not already present
			// Using addToSet logic with Mongoose array
			const alreadyOpened = newsletter.opens.includes(subscriberId);
			if (!alreadyOpened) {
				newsletter.opens.push(subscriberId);
				await newsletter.save({ validateBeforeSave: false });
				console.log(`✅ Open recorded for subscriber ${subscriberId}`);
			} else {
				console.log(`ℹ️ Already recorded for subscriber ${subscriberId}`);
			}
		}
	} catch (error) {
		console.error("Error tracking newsletter open:", error);
	}

	res.writeHead(200, {
		"Content-Type": "image/gif",
		"Content-Length": transparentPixel.length,
		"Cache-Control": "no-cache, no-store, must-revalidate",
	});
	res.end(transparentPixel);
});

// Admin: Send newsletter
exports.sendNewsletter = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const newsletter = await Newsletter.findById(id);
	if (!newsletter) {
		return next(new AppError("Newsletter non trouvée", 404));
	}

	if (newsletter.status === "sent") {
		return next(new AppError("Cette newsletter a déjà été envoyée.", 400));
	}

	// Get active subscribers
	const subscribers = await NewsletterSubscriber.find({ isActive: true });

	if (subscribers.length === 0) {
		return next(
			new AppError("Aucun abonné actif trouvé pour envoyer la newsletter.", 400)
		);
	}

	// Get frontend URL for links
	const frontendUrl =
		process.env.FRONTEND_URL || "https://harvests.onrender.com";

	// Queue emails
	let count = 0;
	for (const sub of subscribers) {
		emailQueue.addToQueue({
			email: sub.email,
			emailType: "newsletter",
			subject: newsletter.subject,
			content: newsletter.content, // HTML content
			imageUrl: newsletter.imageUrl,
			user: { email: sub.email, firstName: "Abonné" },
			verifyURL: frontendUrl,
			newsletterId: newsletter._id,
			subscriberId: sub._id,
		});
		count++;
	}

	// Update newsletter status
	newsletter.status = "sent";
	newsletter.sentAt = Date.now();
	newsletter.recipientCount = count;
	await newsletter.save();

	res.status(200).json({
		status: "success",
		message: `${count} emails ajoutés à la file d'attente d'envoi.`,
		data: { newsletter },
	});
});
