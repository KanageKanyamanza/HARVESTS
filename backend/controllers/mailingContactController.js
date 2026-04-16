const MailingContact = require("../models/MailingContact");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const emailQueue = require("../services/emailQueueService");

// Get all email addresses for duplicate checking
exports.getEmailsOnly = catchAsync(async (req, res, next) => {
	const contacts = await MailingContact.find({}, "email");
	const emails = contacts.map((c) => c.email);
	res.status(200).json({
		status: "success",
		emails,
	});
});

// Get all mailing contacts with pagination and search
exports.getAllContacts = catchAsync(async (req, res, next) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 50;
	const search = req.query.search || "";
	const source = req.query.source || "";

	const query = {};
	if (search) {
		query.$or = [
			{ email: { $regex: search, $options: "i" } },
			{ firstName: { $regex: search, $options: "i" } },
			{ lastName: { $regex: search, $options: "i" } },
			{ companyName: { $regex: search, $options: "i" } },
		];
	}
	if (source) query.source = source;

	const contacts = await MailingContact.find(query)
		.sort({ createdAt: -1 })
		.limit(limit)
		.skip((page - 1) * limit);

	const total = await MailingContact.countDocuments(query);

	res.status(200).json({
		status: "success",
		results: contacts.length,
		pagination: {
			total,
			pages: Math.ceil(total / limit),
			currentPage: page,
		},
		data: { contacts },
	});
});

// Bulk import mailing contacts
exports.bulkImport = catchAsync(async (req, res, next) => {
	const { contacts } = req.body;
	if (!contacts || !Array.isArray(contacts)) {
		return next(new AppError("Données d'importation invalides", 400));
	}

	let imported = 0;
	let updated = 0;
	let failed = 0;

	for (const contactData of contacts) {
		try {
			if (!contactData.email) {
				failed++;
				continue;
			}

			const email = contactData.email.toLowerCase();
			const existingContact = await MailingContact.findOne({ email });

			if (existingContact) {
				existingContact.firstName =
					contactData.firstName || existingContact.firstName;
				existingContact.lastName =
					contactData.lastName || existingContact.lastName;
				existingContact.companyName =
					contactData.companyName || existingContact.companyName;
				await existingContact.save();
				updated++;
			} else {
				await MailingContact.create({
					email,
					firstName: contactData.firstName || "",
					lastName: contactData.lastName || "",
					companyName: contactData.companyName || "",
					source: "import",
				});
				imported++;
			}
		} catch (err) {
			console.error("Single contact import error:", err);
			failed++;
		}
	}

	res.status(200).json({
		status: "success",
		message: `${imported} contacts importés, ${updated} mis à jour.`,
		stats: { imported, updated, failed },
	});
});

// Delete a mailing contact
exports.deleteContact = catchAsync(async (req, res, next) => {
	const contact = await MailingContact.findByIdAndDelete(req.params.id);

	if (!contact) {
		return next(new AppError("Contact non trouvé", 404));
	}

	res.status(204).json({
		status: "success",
		data: null,
	});
});

// Send bulk emails to selected contacts
exports.sendBulkEmails = catchAsync(async (req, res, next) => {
	const { emails, subject, message, userIds } = req.body;

	if ((!emails || emails.length === 0) && (!userIds || userIds.length === 0)) {
		return next(new AppError("Aucun destinataire sélectionné", 400));
	}

	if (!subject || !message) {
		return next(new AppError("Sujet et message obligatoires", 400));
	}

	const frontendUrl =
		process.env.FRONTEND_URL || "https://harvests-bp63.onrender.com";

	let count = 0;
	
    // Handle specific emails (external or imported)
    if (emails && Array.isArray(emails)) {
        for (const emailData of emails) {
            const targetEmail = typeof emailData === 'string' ? emailData : emailData.to;
            const targetMessage = typeof emailData === 'string' ? message : (emailData.message || message);
            const targetSubject = typeof emailData === 'string' ? subject : (emailData.subject || subject);

            emailQueue.addToQueue({
                email: targetEmail,
                emailType: "newsletter", // Reusing template
                subject: targetSubject,
                content: targetMessage,
                user: { email: targetEmail, firstName: "Abonné" },
                verifyURL: frontendUrl,
            });
            count++;
        }
    }

    // Handle user IDs from MailingContact
    if (userIds && Array.isArray(userIds)) {
        const contacts = await MailingContact.find({ _id: { $in: userIds } });
        for (const contact of contacts) {
            emailQueue.addToQueue({
                email: contact.email,
                emailType: "mailing",
                subject: subject,
                content: message,
                user: { email: contact.email, firstName: contact.firstName || "Abonné" },
                verifyURL: frontendUrl,
            });
            
            // Update last emailed date
            contact.lastEmailedAt = Date.now();
            await contact.save();
            count++;
        }
    }

	res.status(200).json({
		status: "success",
		message: `${count} emails ajoutés à la file d'attente.`,
	});
});
