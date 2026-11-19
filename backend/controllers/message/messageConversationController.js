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
						"message.direct_participant_required",
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
					new AppError("message.group_title_required", 400),
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
				return next(new AppError("message.order_id_required", 400));
			}
			const Order = require("../../models/Order");
			const order = await Order.findById(orderId);
			if (!order) {
				return next(new AppError("order.not_found", 404));
			}
			conversation = await Conversation.createOrderConversation(
				orderId,
				order.buyer,
				order.seller,
			);
			break;

		default:
			return next(new AppError("message.invalid_type", 400));
	}

	// Envoyer un message système de bienvenue
	await Message.createSystemMessage(
		conversation._id,
		"conversation_created",
		type === "direct" ?
			req.t("message.system_conversation_started")
		:	req.t("message.system_conversation_created", { title }),
		type === "direct" ? {} : { title },
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
		return next(new AppError("message.conversation_not_found", 404));
	}

	// Vérifier l'accès
	if (!conversation.canUserAccess(req.user.id)) {
		return next(new AppError("message.access_denied", 403));
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
		return next(new AppError("message.conversation_not_found", 404));
	}

	if (!conversation.canUserAccess(req.user.id)) {
		return next(new AppError("message.access_denied", 403));
	}

	await Message.markConversationAsRead(req.params.id, req.user.id);
	await conversation.markAsRead(req.user.id);

	res.status(200).json({
		status: "success",
		message: req.t("message.marked_as_read"),
	});
});

// Ajouter un participant à une conversation
exports.addParticipant = catchAsync(async (req, res, next) => {
	const { userId, role } = req.body;

	const conversation = await Conversation.findById(req.params.id);

	if (!conversation) {
		return next(new AppError("message.conversation_not_found", 404));
	}

	if (!conversation.canUserModerate(req.user.id)) {
		return next(
			new AppError(
				"message.add_participant_forbidden",
				403,
			),
		);
	}

	if (conversation.type === "direct") {
		return next(
			new AppError(
				"message.add_to_direct_forbidden",
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
		req.t("message.system_user_joined", {
			name: `${newUser.firstName} ${newUser.lastName}`,
		}),
		{ name: `${newUser.firstName} ${newUser.lastName}` },
	);

	res.status(200).json({
		status: "success",
		message: req.t("message.participant_added"),
	});
});

// Supprimer un participant
exports.removeParticipant = catchAsync(async (req, res, next) => {
	const conversation = await Conversation.findById(req.params.id);

	if (!conversation) {
		return next(new AppError("message.conversation_not_found", 404));
	}

	if (!conversation.canUserModerate(req.user.id)) {
		return next(
			new AppError(
				"message.remove_participant_forbidden",
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
		req.t("message.system_user_left", {
			name: `${removedUser.firstName} ${removedUser.lastName}`,
		}),
		{ name: `${removedUser.firstName} ${removedUser.lastName}` },
	);

	res.status(200).json({
		status: "success",
		message: req.t("message.participant_removed"),
	});
});

// Quitter une conversation
exports.leaveConversation = catchAsync(async (req, res, next) => {
	const conversation = await Conversation.findById(req.params.id);

	if (!conversation) {
		return next(new AppError("message.conversation_not_found", 404));
	}

	if (conversation.type === "direct") {
		return next(
			new AppError("message.leave_direct_forbidden", 400),
		);
	}

	await conversation.removeParticipant(req.user.id, req.user.id);

	res.status(200).json({
		status: "success",
		message: req.t("message.left"),
	});
});

// Archiver une conversation
exports.archiveConversation = catchAsync(async (req, res, next) => {
	const conversation = await Conversation.findById(req.params.id);

	if (!conversation) {
		return next(new AppError("message.conversation_not_found", 404));
	}

	if (!conversation.canUserAccess(req.user.id)) {
		return next(new AppError("message.access_denied", 403));
	}

	await conversation.archive(req.user.id);

	res.status(200).json({
		status: "success",
		message: req.t("message.archived"),
	});
});

// Désarchiver une conversation
exports.unarchiveConversation = catchAsync(async (req, res, next) => {
	const conversation = await Conversation.findById(req.params.id);

	if (!conversation) {
		return next(new AppError("message.conversation_not_found", 404));
	}

	if (!conversation.canUserAccess(req.user.id)) {
		return next(new AppError("message.access_denied", 403));
	}

	await conversation.unarchive();

	res.status(200).json({
		status: "success",
		message: req.t("message.unarchived"),
	});
});
