const ChatInteraction = require("../../models/ChatInteraction");
const UnansweredQuestion = require("../../models/UnansweredQuestion");
const mongoose = require("mongoose");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");

// Enregistrer une interaction avec le bot
exports.logInteraction = catchAsync(async (req, res, next) => {
	const {
		question,
		response,
		responseType,
		matchedFaqId,
		matchedIntent,
		confidence,
		sessionId,
		responseTime,
	} = req.body;

	const interaction = await ChatInteraction.create({
		userId: req.user?._id || null,
		sessionId,
		question,
		response,
		responseType,
		matchedFaqId,
		matchedIntent,
		confidence,
		responseTime,
		ip: req.ip,
		userAgent: req.get("User-Agent"),
	});

	// Si pas de réponse trouvée, enregistrer dans les questions sans réponse
	if (responseType === "no_answer") {
		const normalizedQuestion = question.toLowerCase().trim();

		// Chercher une question similaire existante
		const existing = await UnansweredQuestion.findOne({
			question: { $regex: normalizedQuestion.substring(0, 50), $options: "i" },
			status: "pending",
		});

		if (existing) {
			// Incrémenter le compteur
			existing.count += 1;
			existing.updatedAt = new Date();
			existing.lastAskedBy = req.user?._id;

			// Ajouter comme question similaire si différente
			const alreadyExists = existing.similarQuestions.some(
				(sq) => sq.text.toLowerCase() === normalizedQuestion,
			);
			if (
				!alreadyExists &&
				existing.question.toLowerCase() !== normalizedQuestion
			) {
				existing.similarQuestions.push({
					text: question,
					count: 1,
					lastAsked: new Date(),
				});
			}
			await existing.save();
		} else {
			// Créer une nouvelle entrée
			await UnansweredQuestion.create({
				question,
				firstAskedBy: req.user?._id,
				lastAskedBy: req.user?._id,
			});
		}
	}

	res.status(201).json({
		status: "success",
		data: { interactionId: interaction._id },
	});
});

// Enregistrer le feedback utilisateur
exports.logFeedback = catchAsync(async (req, res, next) => {
	const { interactionId, feedback } = req.body;

	if (!mongoose.Types.ObjectId.isValid(interactionId)) {
		return next(new AppError("ID d'interaction invalide", 400));
	}

	// Accepter boolean ou string
	let feedbackValue = feedback;
	if (typeof feedback === "string") {
		feedbackValue = feedback === "true" || feedback === "helpful";
	} else if (typeof feedback === "boolean") {
		feedbackValue = feedback;
	} else {
		return next(new AppError("Feedback invalide", 400));
	}

	await ChatInteraction.findByIdAndUpdate(interactionId, {
		feedback: feedbackValue,
	});

	res.status(200).json({
		status: "success",
		message: "Feedback enregistré",
	});
});

// Obtenir les réponses personnalisées
exports.getCustomAnswers = catchAsync(async (req, res, next) => {
	const answers = await UnansweredQuestion.find({ status: "answered" })
		.select("question answer keywords category")
		.lean();

	res.status(200).json({
		status: "success",
		results: answers.length,
		data: { answers },
	});
});
