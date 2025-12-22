const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Charger les modèles
require("./models/User");
require("./models/notification"); // Charge l'index qui charge tout le reste
const Order = require("./models/Order");
const Notification = require("./models/Notification");

dotenv.config({ path: path.join(__dirname, ".env") });

const test = async () => {
	try {
		await mongoose.connect(
			process.env.DATABASE_LOCAL || "mongodb://localhost:27017/harvests"
		);
		console.log("✅ Connecté à MongoDB");

		const exporterId = "6901e2b45a5d2090047b4448";
		const orderId = "694935da4e7bd7f694ba94be";

		const order = await Order.findById(orderId);
		if (!order) {
			console.error("❌ Commande non trouvée");
			process.exit(1);
		}

		console.log("📤 Création de la notification pour l'exportateur...");

		const notification = await Notification.createNotification({
			recipient: exporterId,
			recipientModel: "User",
			type: "delivery_assigned",
			category: "order",
			title: `Test Assignment Notification`,
			message: `Une nouvelle commande ${order.orderNumber} vous a été assignée.`,
			data: {
				orderId: order._id,
				orderNumber: order.orderNumber,
				status: order.status,
			},
			channels: {
				inApp: { enabled: true },
				email: { enabled: false },
				push: { enabled: true },
			},
		});

		console.log("✅ Notification ID:", notification._id);
		console.log("📊 Status Push:", notification.channels.push);

		if (notification.channels.push.sent) {
			console.log("🚀 Push envoyé avec succès !");
		} else {
			console.log(
				"⚠️ Push non envoyé. Raison:",
				notification.channels.push.failureReason
			);
		}
	} catch (error) {
		console.error("❌ Erreur:", error);
	} finally {
		await mongoose.disconnect();
		process.exit(0);
	}
};

test();
