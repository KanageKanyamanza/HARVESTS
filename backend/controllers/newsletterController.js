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
	let isNewSubscription = false;

	if (subscriber) {
		if (!subscriber.isActive) {
			subscriber.isActive = true;
			subscriber.unsubscribedAt = undefined;
			await subscriber.save();
			isNewSubscription = true; // Treated as new sub for welcome email
		} else {
			return res.status(200).json({
				status: "success",
				message: "Vous êtes déjà abonné à notre newsletter.",
			});
		}
	} else {
		subscriber = await NewsletterSubscriber.create({ email });
		isNewSubscription = true;
	}

	if (isNewSubscription) {
		// Send Welcome Email with Newsletter Design
		// Standard Welcome Content
		const welcomeContent = `
      <div style="font-family: inherit; color: #4a5568;">
        <h2 style="color: #2f855a; margin-top: 0;">Bienvenue dans la communauté Harvests ! 🌱</h2>
        <p>Merci de vous être inscrit à notre newsletter. Nous sommes ravis de vous compter parmi nous.</p>
        <p>Vous recevrez désormais nos actualités, conseils et mises à jour directement dans votre boîte de réception.</p>
        <p>En attendant, n'hésitez pas à visiter notre plateforme pour découvrir les dernières offres.</p>
        <br>
        <p>À très bientôt,</p>
        <p><strong>L'équipe Harvests</strong></p>
      </div>
    `;

		try {
			emailQueue.addToQueue({
				email: subscriber.email,
				emailType: "newsletter", // Reusing newsletter type for same design
				subject: "Bienvenue sur la newsletter Harvests !",
				content: welcomeContent,
				imageUrl:
					"https://res.cloudinary.com/dmykbxyyy/image/upload/v1705000000/harvests/newsletter-welcome.jpg", // Optional: generic welcome image
				user: { email: subscriber.email, firstName: "Abonné" },
				verifyURL: process.env.FRONTEND_URL || "https://harvests-bp63.onrender.com",
				// No newsletterId for welcome email to avoid tracking errors or confusion
			});
		} catch (error) {
			console.error("Error queueing welcome email:", error);
			// Do not fail the request if email fails
		}
	}

	res.status(200).json({
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
	const { recipients } = req.body; // Optional: array of subscriber IDs

	const newsletter = await Newsletter.findById(id);
	if (!newsletter) {
		return next(new AppError("Newsletter non trouvée", 404));
	}

	// If no specific recipients are selected, enforce status check
	if (!recipients || recipients.length === 0) {
		if (newsletter.status === "sent") {
			return next(new AppError("Cette newsletter a déjà été envoyée.", 400));
		}
	}

	let subscribers;

	if (recipients && recipients.length > 0) {
		// Send to specific recipients (Resend or Selective Send)
		subscribers = await NewsletterSubscriber.find({
			_id: { $in: recipients },
			isActive: true, // Always check if active
		});
	} else {
		// Send to all active subscribers
		subscribers = await NewsletterSubscriber.find({ isActive: true });
	}

	if (subscribers.length === 0) {
		return next(
			new AppError("Aucun abonné actif trouvé pour l'envoi sélectionné.", 400)
		);
	}

	// Get frontend URL for links
	const frontendUrl =
		process.env.FRONTEND_URL || "https://harvests-bp63.onrender.com";

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

	// Only update status if sending to ALL (or significant batch), or maybe always update send date?
	// For now, if it was draft, mark as sent. If sent, update recipient count (add logic).
	// Simplification: Always mark as sent if not already. Update stats.

	if (newsletter.status !== "sent") {
		newsletter.status = "sent";
		newsletter.sentAt = Date.now();
		newsletter.recipientCount = count;
	} else {
		// If resending, maybe just increment recipientCount?
		// Or keep it as is to reflect original "bulk" send.
		// Let's just update recipient count to reflect total ever sent?
		// Or maybe we don't update if it's a resend to avoid messing up "Open Rate" metrics (which uses recipientCount).
		// If we resend to 1 person, open rate denominator shouldn't spike if we don't track them separately.
		// Ideally we track unique recipients.
		// For now, let's just leave recipientCount as the initial send count if it's already sent, unless we are "sending for the first time" to a subset.
		if (!recipients) {
			newsletter.recipientCount = count;
		}
	}

	await newsletter.save();

	res.status(200).json({
		status: "success",
		message: `${count} emails ajoutés à la file d'attente d'envoi.`,
		data: { newsletter },
	});
});
