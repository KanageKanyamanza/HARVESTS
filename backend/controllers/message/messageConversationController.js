const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/appError");
const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");
const User = require("../../models/User");

// Obtenir mes conversations
exports.getMyConversations = catchAsync(async (req, res, next) => {
	const options = {
		type: req.query.type,
		includeArchived: req.query.archived === "true",
		limit: parseInt(req.query.limit, 10) || 50,
	};

	const conversations = await Conversation.getUserConversations(
		req.user.id,
		options,
	);

	// Calculer les messages non lus pour chaque conversation
	for (const conversation of conversations) {
		const participant = conversation.participants.find(
			(p) => p.user._id.toString() === req.user.id,
		);
		if (participant) {
			conversation.unreadCount = participant.unreadCount;
		}
	}

	res.status(200).json({
		status: "success",
		results: conversations.length,
		data: {
			conversations,
		},
	});
});

// Créer une nouvelle conversation
exports.createConversation = catchAsync(async (req, res, next) => {
	const { type, title, participantIds, orderId } = req.body;

	let conversation;

	switch (type) {
		case "direct":
			if (!participantIds || participantIds.length !== 1) {
				return next(
					new AppError(
						"Une conversation directe nécessite exactement un autre participant",
						400,
					),
				);
			}
			conversation = await Conversation.createDirectConversation(
				req.user.id,
				participantIds[0],
				req.user.id,
			);
			break;

		case "group":
			if (!title) {
				return next(
					new AppError("Titre requis pour les conversations de groupe", 400),
				);
			}
			conversation = await Conversation.createGroupConversation(
				title,
				req.user.id,
				participantIds || [],
			);
			break;

		case "order":
			if (!orderId) {
				return next(new AppError("ID de commande requis", 400));
			}
			const Order = require("../../models/Order");
			const order = await Order.findById(orderId);
			if (!order) {
				return next(new AppError("Commande non trouvée", 404));
			}
			conversation = await Conversation.createOrderConversation(
				orderId,
				order.buyer,
				order.seller,
			);
			break;

		default:
			return next(new AppError("Type de conversation invalide", 400));
	}

	// Envoyer un message système de bienvenue
	await Message.createSystemMessage(
		conversation._id,
		"conversation_created",
		type === "direct" ?
			"Conversation démarrée"
		:	`Conversation "${title}" créée`,
	);

	// Populer les détails pour le client app et le socket
	await conversation.populate(
		"participants.user",
		"firstName lastName avatar userType",
	);

	// Émettre l'événement Socket.io
	const io = req.app.get("io");
	if (io) {
		conversation.participants.forEach((participant) => {
			if (participant.user) {
				io.to(`user:${participant.user._id}`).emit(
					"new_conversation",
					conversation,
				);
			}
		});
	}

	res.status(201).json({
		status: "success",
		data: {
			conversation,
		},
	});
});

// Obtenir une conversation
exports.getConversation = catchAsync(async (req, res, next) => {
	const conversation = await Conversation.findById(req.params.id)
		.populate("participants.user", "firstName lastName avatar userType")
		.populate("lastMessage", "content type createdAt sender")
		.populate("lastMessage.sender", "firstName lastName");

	if (!conversation) {
		return next(new AppError("Conversation non trouvée", 404));
	}

	// Vérifier l'accès
	if (!conversation.canUserAccess(req.user.id)) {
		return next(new AppError("Accès non autorisé à cette conversation", 403));
	}

	res.status(200).json({
		status: "success",
		data: {
			conversation,
		},
	});
});

// Marquer une conversation comme lue
exports.markConversationAsRead = catchAsync(async (req, res, next) => {
	const conversation = await Conversation.findById(req.params.id);

	if (!conversation) {
		return next(new AppError("Conversation non trouvée", 404));
	}

	if (!conversation.canUserAccess(req.user.id)) {
		return next(new AppError("Accès non autorisé", 403));
	}

	await Message.markConversationAsRead(req.params.id, req.user.id);
	await conversation.markAsRead(req.user.id);

	res.status(200).json({
		status: "success",
		message: "Conversation marquée comme lue",
	});
});

// Ajouter un participant à une conversation
exports.addParticipant = catchAsync(async (req, res, next) => {
	const { userId, role } = req.body;

	const conversation = await Conversation.findById(req.params.id);

	if (!conversation) {
		return next(new AppError("Conversation non trouvée", 404));
	}

	if (!conversation.canUserModerate(req.user.id)) {
		return next(
			new AppError(
				"Vous n'avez pas les droits pour ajouter des participants",
				403,
			),
		);
	}

	if (conversation.type === "direct") {
		return next(
			new AppError(
				"Impossible d'ajouter des participants à une conversation directe",
				400,
			),
		);
	}

	await conversation.addParticipant(userId, role || "member", req.user.id);

	// Message système
	const newUser = await User.findById(userId).select("firstName lastName");

	await Message.createSystemMessage(
		conversation._id,
		"user_joined",
		`${newUser.firstName} ${newUser.lastName} a rejoint la conversation`,
	);

	res.status(200).json({
		status: "success",
		message: "Participant ajouté avec succès",
	});
});

// Supprimer un participant
exports.removeParticipant = catchAsync(async (req, res, next) => {
	const conversation = await Conversation.findById(req.params.id);

	if (!conversation) {
		return next(new AppError("Conversation non trouvée", 404));
	}

	if (!conversation.canUserModerate(req.user.id)) {
		return next(
			new AppError(
				"Vous n'avez pas les droits pour supprimer des participants",
				403,
			),
		);
	}

	await conversation.removeParticipant(req.params.userId, req.user.id);

	// Message système
	const removedUser = await User.findById(req.params.userId).select(
		"firstName lastName",
	);

	await Message.createSystemMessage(
		conversation._id,
		"user_left",
		`${removedUser.firstName} ${removedUser.lastName} a quitté la conversation`,
	);

	res.status(200).json({
		status: "success",
		message: "Participant supprimé avec succès",
	});
});

// Quitter une conversation
exports.leaveConversation = catchAsync(async (req, res, next) => {
	const conversation = await Conversation.findById(req.params.id);

	if (!conversation) {
		return next(new AppError("Conversation non trouvée", 404));
	}

	if (conversation.type === "direct") {
		return next(
			new AppError("Impossible de quitter une conversation directe", 400),
		);
	}

	await conversation.removeParticipant(req.user.id, req.user.id);

	res.status(200).json({
		status: "success",
		message: "Vous avez quitté la conversation",
	});
});

// Archiver une conversation
exports.archiveConversation = catchAsync(async (req, res, next) => {
	const conversation = await Conversation.findById(req.params.id);

	if (!conversation) {
		return next(new AppError("Conversation non trouvée", 404));
	}

	if (!conversation.canUserAccess(req.user.id)) {
		return next(new AppError("Accès non autorisé", 403));
	}

	await conversation.archive(req.user.id);

	res.status(200).json({
		status: "success",
		message: "Conversation archivée",
	});
});

// Désarchiver une conversation
exports.unarchiveConversation = catchAsync(async (req, res, next) => {
	const conversation = await Conversation.findById(req.params.id);

	if (!conversation) {
		return next(new AppError("Conversation non trouvée", 404));
	}

	if (!conversation.canUserAccess(req.user.id)) {
		return next(new AppError("Accès non autorisé", 403));
	}

	await conversation.unarchive();

	res.status(200).json({
		status: "success",
		message: "Conversation désarchivée",
	});
});
