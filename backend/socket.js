const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

/**
 * Initialisation de Socket.io
 * @param {Object} server - Serveur HTTP Express
 * @returns {Object} io - Instance Socket.io
 */
module.exports = (server) => {
	const io = socketIO(server, {
		cors: {
			origin: [
				"http://localhost:5173",
				"https://harvests.site",
				"https://www.harvests.site",
				process.env.FRONTEND_URL
			].filter(Boolean),
			methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
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

		// Rejoindre la room personnelle de l'utilisateur (notifications, nouvelles conversations)
		// Convention alignée avec les émissions faites depuis les contrôleurs REST (messageController)
		socket.join(`user:${socket.user._id}`);

		// Mettre à jour le statut "en ligne"
		socket.broadcast.emit("user_online", {
			userId: socket.user._id,
			lastActivity: new Date(),
		});

		// Rejoindre les rooms de conversation
		// Convention: "conversation:<id>" — doit matcher les emit() des contrôleurs REST
		socket.on("join_conversation", (conversationId) => {
			if (!conversationId) return;
			socket.join(`conversation:${conversationId}`);
			console.log(
				`User ${socket.user._id} joined conversation ${conversationId}`,
			);
		});

		// Quitter une conversation
		socket.on("leave_conversation", (conversationId) => {
			if (!conversationId) return;
			socket.leave(`conversation:${conversationId}`);
			console.log(
				`User ${socket.user._id} left conversation ${conversationId}`,
			);
		});

		// Indicateur "en train d'écrire"
		socket.on("typing", (data) => {
			const conversationId =
				typeof data === "string" ? data : data?.conversationId;
			if (!conversationId) return;
			socket.to(`conversation:${conversationId}`).emit("typing", {
				conversationId,
				userId: socket.user._id,
				user: {
					_id: socket.user._id,
					firstName: socket.user.firstName,
				},
			});
		});

		socket.on("stop_typing", (data) => {
			const conversationId =
				typeof data === "string" ? data : data?.conversationId;
			if (!conversationId) return;
			socket.to(`conversation:${conversationId}`).emit("stop_typing", {
				conversationId,
				userId: socket.user._id,
			});
		});

		// Marquer comme lu (diffusion temps réel, la persistance se fait via l'API REST)
		socket.on("mark_read", (data) => {
			const { conversationId, messageId } = data || {};
			if (!conversationId) return;
			socket.to(`conversation:${conversationId}`).emit("message_read", {
				conversationId,
				messageId,
				userId: socket.user._id,
				readAt: new Date(),
			});
		});

		// Déconnexion
		socket.on("disconnect", () => {
			console.log(`User disconnected: ${socket.user._id}`);
			socket.broadcast.emit("user_offline", {
				userId: socket.user._id,
				lastSeen: new Date(),
			});
		});
	});

	return io;
};
