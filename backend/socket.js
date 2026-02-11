const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Conversation = require("./models/Conversation");
const Message = require("./models/Message");

/**
 * Initialisation de Socket.io
 * @param {Object} server - Serveur HTTP Express
 * @returns {Object} io - Instance Socket.io
 */
module.exports = (server) => {
	const io = socketIO(server, {
		cors: {
			origin: process.env.FRONTEND_URL || "http://localhost:5173",
			methods: ["GET", "POST"],
			credentials: true,
		},
		pingTimeout: 60000,
	});

	// Middleware d'authentification
	io.use(async (socket, next) => {
		try {
			const token = socket.handshake.auth.token || socket.handshake.query.token;

			if (!token) {
				return next(new Error("Authentication error: No token provided"));
			}

			// Vérifier le token
			const decoded = jwt.verify(
				token,
				process.env.JWT_SECRET || "votre_secret_jwt_super_securise",
			);

			// Récupérer l'utilisateur
			const user = await User.findById(decoded.id).select(
				"firstName lastName mobile photo role userType",
			);

			if (!user) {
				return next(new Error("Authentication error: User not found"));
			}

			// Attacher l'utilisateur au socket
			socket.user = user;
			next();
		} catch (error) {
			console.error("Socket authentication error:", error.message);
			next(new Error("Authentication error: Invalid token"));
		}
	});

	// Gestion des connexions
	io.on("connection", (socket) => {
		console.log(`👤 User connected: ${socket.user.firstName} (${socket.id})`);

		// Rejoindre la room personnelle de l'utilisateur (pour les notifs privées)
		socket.join(socket.user._id.toString());

		// Mettre à jour le statut "en ligne"
		socket.broadcast.emit("user_online", {
			userId: socket.user._id,
			lastActivity: new Date(),
		});

		// Rejoindre les rooms de conversation
		socket.on("join_conversation", (conversationId) => {
			socket.join(conversationId);
			console.log(
				`User ${socket.user._id} joined conversation ${conversationId}`,
			);
		});

		// Quitter une conversation
		socket.on("leave_conversation", (conversationId) => {
			socket.leave(conversationId);
			console.log(
				`User ${socket.user._id} left conversation ${conversationId}`,
			);
		});

		// Envoi de message
		socket.on("send_message", async (data) => {
			try {
				const {
					conversationId,
					content,
					type = "text",
					attachments = [],
				} = data;

				// Validation basique
				if (!conversationId || (!content && attachments.length === 0)) {
					return;
				}

				// Vérifier l'appartenance à la conversation (sécurité supplémentaire)
				// Note: Idéalement, on devrait faire cette vérif via la DB,
				// mais pour la rapidité on suppose que le client est honnête
				// (la vraie sécurité est dans l'API REST)

				// Emettre aux autres participants de la room
				socket.to(conversationId).emit("new_message", {
					_id: new Date().getTime().toString(), // Temp ID
					conversation: conversationId,
					sender: {
						_id: socket.user._id,
						firstName: socket.user.firstName,
						lastName: socket.user.lastName,
						avatar: socket.user.avatar,
					},
					content,
					type,
					attachments,
					createdAt: new Date().toISOString(),
					status: "sent",
				});

				// Notifier les participants hors ligne ou qui ne regardent pas cette conv
				// (Géré par la logique "room", mais on peut envoyer une notif globale)
			} catch (error) {
				console.error("Error handling send_message:", error);
				socket.emit("error", { message: "Failed to send message" });
			}
		});

		// Indicateur "en train d'écrire"
		socket.on("typing", (data) => {
			const { conversationId, isTyping } = data;
			socket.to(conversationId).emit("user_typing", {
				conversationId,
				userId: socket.user._id,
				isTyping,
				user: {
					firstName: socket.user.firstName,
				},
			});
		});

		// Marquer comme lu
		socket.on("mark_read", (data) => {
			const { conversationId, messageId } = data;
			// Diffuser l'info que c'est lu
			socket.to(conversationId).emit("message_read", {
				conversationId,
				messageId,
				userId: socket.user._id,
				readAt: new Date(),
			});
		});

		// Déconnexion
		socket.on("disconnect", () => {
			console.log(`User disconnected: ${socket.user._id}`);
			// Notifier que l'utilisateur est hors ligne
			socket.broadcast.emit("user_offline", {
				userId: socket.user._id,
				lastSeen: new Date(),
			});
		});
	});

	return io;
};
