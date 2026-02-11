const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = (server) => {
	const io = socketIo(server, {
		cors: {
			origin: [
				process.env.FRONTEND_URL || "http://localhost:5173",
				"http://localhost:3000",
			],
			methods: ["GET", "POST"],
			credentials: true,
		},
	});

	// Middleware d'authentification Socket.io
	io.use(async (socket, next) => {
		try {
			const token = socket.handshake.auth.token || socket.handshake.query.token;

			if (!token) {
				return next(new Error("Authentication error: Token required"));
			}

			// Enlever 'Bearer ' si présent
			const tokenString =
				token.startsWith("Bearer ") ? token.slice(7, token.length) : token;

			const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
			const user = await User.findById(decoded.id).select(
				"firstName lastName _id role",
			);

			if (!user) {
				return next(new Error("Authentication error: User not found"));
			}

			socket.user = user;
			next();
		} catch (err) {
			console.error("Socket auth error:", err.message);
			next(new Error("Authentication error: Invalid token"));
		}
	});

	io.on("connection", (socket) => {
		console.log(
			`🔌 User connected: ${socket.user.firstName} (${socket.user._id})`,
		);

		// Rejoindre sa propre room pour les notifications personnelles
		socket.join(`user:${socket.user._id}`);

		// Rejoindre une conversation
		socket.on("join_conversation", (conversationId) => {
			socket.join(`conversation:${conversationId}`);
			console.log(
				`User ${socket.user._id} joined conversation ${conversationId}`,
			);
		});

		// Quitter une conversation
		socket.on("leave_conversation", (conversationId) => {
			socket.leave(`conversation:${conversationId}`);
			console.log(
				`User ${socket.user._id} left conversation ${conversationId}`,
			);
		});

		// Typing indicators
		socket.on("typing", (conversationId) => {
			socket.to(`conversation:${conversationId}`).emit("typing", {
				userId: socket.user._id,
				conversationId,
				user: {
					_id: socket.user._id,
					firstName: socket.user.firstName,
				},
			});
		});

		socket.on("stop_typing", (conversationId) => {
			socket.to(`conversation:${conversationId}`).emit("stop_typing", {
				userId: socket.user._id,
				conversationId,
			});
		});

		// Marquer comme lu (temps réel)
		socket.on("mark_read", ({ conversationId, messageId }) => {
			socket.to(`conversation:${conversationId}`).emit("message_read", {
				conversationId,
				messageId,
				userId: socket.user._id,
			});
		});

		socket.on("disconnect", () => {
			console.log(`User disconnected: ${socket.user.firstName}`);
		});
	});

	return io;
};
