const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const Message = require("../../models/Message");
const Conversation = require("../../models/Conversation");
const Notification = require("../../models/Notification");
const Product = require("../../models/Product");

// Obtenir les messages d'une conversation
exports.getConversationMessages = catchAsync(async (req, res, next) => {
	const conversation = await Conversation.findById(req.params.id);

	if (!conversation) {
		return next(new AppError("Conversation non trouvée", 404));
	}

	if (!conversation.canUserAccess(req.user.id)) {
		return next(new AppError("Accès non autorisé", 403));
	}

	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 50;

	const messages = await Message.getConversationMessages(
		req.params.id,
		page,
		limit,
	);

	// Marquer les messages comme lus
	await Message.markConversationAsRead(req.params.id, req.user.id);
	await conversation.markAsRead(req.user.id);

	res.status(200).json({
		status: "success",
		results: messages.length,
		page,
		data: {
			messages: messages.reverse(), // Ordre chronologique
		},
	});
});

// Envoyer un message
exports.sendMessage = catchAsync(async (req, res, next) => {
	const { content, type, replyToId, attachments } = req.body;

	const conversation = await Conversation.findById(req.params.id);

	if (!conversation) {
		return next(new AppError("Conversation non trouvée", 404));
	}

	if (!conversation.canUserAccess(req.user.id)) {
		return next(new AppError("Accès non autorisé", 403));
	}

	// Valider le contenu
	if (!content && (!attachments || attachments.length === 0)) {
		return next(new AppError("Contenu ou pièce jointe requise", 400));
	}

	// Créer le message
	const messageData = {
		conversation: req.params.id,
		sender: req.user.id,
		type: type || "text",
		content,
	};

	if (replyToId) {
		const replyToMessage = await Message.findById(replyToId);
		if (
			replyToMessage &&
			replyToMessage.conversation.toString() === req.params.id
		) {
			messageData.replyTo = replyToId;
		}
	}

	if (req.body.attachments && req.body.attachments.length > 0) {
		messageData.attachments = req.body.attachments;
	}

	const message = await Message.create(messageData);

	// Populer pour la réponse
	await message.populate("sender", "firstName lastName avatar userType");
	if (message.replyTo) {
		await message.populate("replyTo", "content sender");
	}

	// Notifier les autres participants
	const otherParticipants = conversation.participants.filter(
		(p) => p.user.toString() !== req.user.id && p.isActive,
	);

	// Émettre l'événement Socket.io
	const io = req.app.get("io");
	if (io) {
		io.to(`conversation:${conversation._id}`).emit("new_message", {
			message,
			conversationId: conversation._id,
		});
	}

	for (const participant of otherParticipants) {
		// Incrémenter le compteur de messages non lus
		await conversation.incrementUnreadCount(participant.user);

		// Envoyer notification si activée
		if (participant.notifications.enabled) {
			await Notification.createNotification({
				recipient: participant.user,
				sender: req.user.id,
				type: "message_received",
				category: "message",
				title: `Message de ${req.user.firstName}`,
				message: content ? content.substring(0, 100) : "Pièce jointe envoyée",
				data: {
					conversationId: conversation._id,
					messageId: message._id,
				},
				actions: [
					{
						type: "view",
						label: "Répondre",
						url: `/messages/${conversation._id}`,
					},
				],
				channels: {
					inApp: { enabled: true },
					push: { enabled: participant.notifications.push },
					email: { enabled: participant.notifications.email },
				},
			});
		}
	}

	res.status(201).json({
		status: "success",
		data: {
			message,
		},
	});
});

// Modifier un message
exports.editMessage = catchAsync(async (req, res, next) => {
	const { content } = req.body;

	if (!content) {
		return next(new AppError("Nouveau contenu requis", 400));
	}

	const message = await Message.findById(req.params.messageId);

	if (!message) {
		return next(new AppError("Message non trouvé", 404));
	}

	try {
		await message.editContent(content, req.user.id);
	} catch (error) {
		return next(new AppError(error.message, 400));
	}

	res.status(200).json({
		status: "success",
		data: {
			message,
		},
	});
});

// Supprimer un message
exports.deleteMessage = catchAsync(async (req, res, next) => {
	const message = await Message.findById(req.params.messageId);

	if (!message) {
		return next(new AppError("Message non trouvé", 404));
	}

	const isAdmin = req.user.role === "admin";

	try {
		await message.delete(req.user.id, isAdmin);
	} catch (error) {
		return next(new AppError(error.message, 400));
	}

	res.status(204).json({
		status: "success",
		data: null,
	});
});

// Ajouter une réaction à un message
exports.addReaction = catchAsync(async (req, res, next) => {
	const { emoji } = req.body;

	if (!emoji) {
		return next(new AppError("Emoji requis", 400));
	}

	const message = await Message.findById(req.params.messageId);

	if (!message) {
		return next(new AppError("Message non trouvé", 404));
	}

	await message.addReaction(req.user.id, emoji);

	res.status(200).json({
		status: "success",
		data: {
			reactions: message.uniqueReactions,
		},
	});
});

// Supprimer une réaction
exports.removeReaction = catchAsync(async (req, res, next) => {
	const { emoji } = req.body;

	const message = await Message.findById(req.params.messageId);

	if (!message) {
		return next(new AppError("Message non trouvé", 404));
	}

	await message.removeReaction(req.user.id, emoji);

	res.status(200).json({
		status: "success",
		data: {
			reactions: message.uniqueReactions,
		},
	});
});

// Épingler un message
exports.pinMessage = catchAsync(async (req, res, next) => {
	const message = await Message.findById(req.params.messageId);

	if (!message) {
		return next(new AppError("Message non trouvé", 404));
	}

	// Vérifier les permissions
	const conversation = await Conversation.findById(message.conversation);
	if (!conversation.canUserModerate(req.user.id)) {
		return next(
			new AppError(
				"Vous n'avez pas les droits pour épingler des messages",
				403,
			),
		);
	}

	await message.pin(req.user.id);

	res.status(200).json({
		status: "success",
		data: {
			message,
		},
	});
});

// Désépingler un message
exports.unpinMessage = catchAsync(async (req, res, next) => {
	const message = await Message.findById(req.params.messageId);

	if (!message) {
		return next(new AppError("Message non trouvé", 404));
	}

	const conversation = await Conversation.findById(message.conversation);
	if (!conversation.canUserModerate(req.user.id)) {
		return next(
			new AppError(
				"Vous n'avez pas les droits pour désépingler des messages",
				403,
			),
		);
	}

	await message.unpin();

	res.status(200).json({
		status: "success",
		data: {
			message,
		},
	});
});

// Signaler un message
exports.reportMessage = catchAsync(async (req, res, next) => {
	const { reason, description } = req.body;

	if (!reason) {
		return next(new AppError("Raison du signalement requise", 400));
	}

	const message = await Message.findById(req.params.messageId);

	if (!message) {
		return next(new AppError("Message non trouvé", 404));
	}

	await message.report(req.user.id, reason, description);

	res.status(200).json({
		status: "success",
		message: "Message signalé avec succès",
	});
});

// Rechercher dans les messages
exports.searchMessages = catchAsync(async (req, res, next) => {
	const { q, conversationId } = req.query;

	if (!q) {
		return next(new AppError("Terme de recherche requis", 400));
	}

	let searchOptions = {
		limit: parseInt(req.query.limit, 10) || 20,
	};

	// Filtres optionnels
	if (req.query.sender) searchOptions.sender = req.query.sender;
	if (req.query.type) searchOptions.type = req.query.type;
	if (req.query.dateFrom) searchOptions.dateFrom = req.query.dateFrom;
	if (req.query.dateTo) searchOptions.dateTo = req.query.dateTo;

	let messages;

	if (conversationId) {
		// Recherche dans une conversation spécifique
		const conversation = await Conversation.findById(conversationId);
		if (!conversation || !conversation.canUserAccess(req.user.id)) {
			return next(
				new AppError("Conversation non trouvée ou accès non autorisé", 404),
			);
		}

		messages = await Message.searchMessages(conversationId, q, searchOptions);
	} else {
		// Recherche globale dans toutes les conversations de l'utilisateur
		const userConversations = await Conversation.find({
			"participants.user": req.user.id,
			"participants.isActive": true,
		}).select("_id");

		const conversationIds = userConversations.map((c) => c._id);

		messages = await Message.find({
			conversation: { $in: conversationIds },
			isDeleted: false,
			$text: { $search: q },
		})
			.populate("sender", "firstName lastName avatar")
			.populate("conversation", "title type")
			.sort({ score: { $meta: "textScore" } })
			.limit(searchOptions.limit);
	}

	res.status(200).json({
		status: "success",
		results: messages.length,
		data: {
			messages,
		},
	});
});

// Partager un produit dans une conversation
exports.shareProduct = catchAsync(async (req, res, next) => {
	const { productId, message } = req.body;

	const conversation = await Conversation.findById(req.params.id);
	if (!conversation || !conversation.canUserAccess(req.user.id)) {
		return next(
			new AppError("Conversation non trouvée ou accès non autorisé", 404),
		);
	}

	const product = await Product.findById(productId);
	if (!product) {
		return next(new AppError("Produit non trouvé", 404));
	}

	const sharedMessage = await Message.createProductShare(
		req.params.id,
		req.user.id,
		productId,
		message,
	);

	await sharedMessage.populate("sender", "firstName lastName avatar");
	await sharedMessage.populate("attachments.product", "name images price");

	res.status(201).json({
		status: "success",
		data: {
			message: sharedMessage,
		},
	});
});

// Envoyer un devis dans une conversation
exports.sendQuote = catchAsync(async (req, res, next) => {
	const { products, total, currency, validUntil, terms } = req.body;

	const conversation = await Conversation.findById(req.params.id);
	if (!conversation || !conversation.canUserAccess(req.user.id)) {
		return next(
			new AppError("Conversation non trouvée ou accès non autorisé", 404),
		);
	}

	const quoteData = {
		products,
		total,
		currency: currency || "XAF",
		validUntil:
			validUntil ?
				new Date(validUntil)
			:	new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		terms,
	};

	const quoteMessage = await Message.createQuote(
		req.params.id,
		req.user.id,
		quoteData,
	);

	await quoteMessage.populate("sender", "firstName lastName avatar");

	res.status(201).json({
		status: "success",
		data: {
			message: quoteMessage,
		},
	});
});
