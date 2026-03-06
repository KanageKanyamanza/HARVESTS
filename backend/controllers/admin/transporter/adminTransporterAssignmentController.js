const Order = require("../../../models/Order");
const Transporter = require("../../../models/Transporter");
const Exporter = require("../../../models/Exporter");
const User = require("../../../models/User");
const Notification = require("../../../models/Notification");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/appError");

// Assigner un transporteur à une commande
exports.assignTransporterToOrder = catchAsync(async (req, res, next) => {
	const orderId = req.params.id;
	const { transporterId } = req.body;

	if (!transporterId) {
		return next(new AppError("ID du transporteur requis", 400));
	}

	// Récupérer la commande
	const order = await Order.findById(orderId)
		.populate("buyer", "firstName lastName email phone userType")
		.populate(
			"seller",
			"firstName lastName email phone farmName companyName userType",
		)
		.populate({
			path: "segments.seller",
			select: "firstName lastName email phone farmName companyName userType",
		});

	if (!order) {
		return next(new AppError("Commande non trouvée", 404));
	}

	// Vérifier que la commande n'est pas déjà livrée ou terminée
	const finalStatuses = [
		"delivered",
		"completed",
		"cancelled",
		"refunded",
		"disputed",
	];
	if (finalStatuses.includes(order.status)) {
		return next(
			new AppError(
				`Impossible d'assigner un transporteur à une commande avec le statut: ${order.status}`,
				400,
			),
		);
	}

	const previousTransporterId = order.delivery?.transporter;

	// Récupérer le transporteur ou exportateur
	let deliverer = await Transporter.findById(transporterId).select(
		"firstName lastName email phone companyName serviceAreas performanceStats isActive isApproved isEmailVerified userType",
	);

	if (!deliverer) {
		deliverer = await Exporter.findById(transporterId).select(
			"firstName lastName email phone companyName isActive isApproved isEmailVerified userType",
		);
		if (deliverer) {
			deliverer.userType = "exporter";
		}
	} else {
		deliverer.userType = "transporter";
	}

	const transporter = deliverer;

	if (!transporter) {
		return next(new AppError("Transporteur/Exportateur non trouvé", 404));
	}

	const isReassignment =
		previousTransporterId &&
		previousTransporterId.toString() !== transporter._id.toString();

	if (
		!transporter.isActive ||
		!transporter.isApproved ||
		!transporter.isEmailVerified
	) {
		return next(
			new AppError(
				"Le transporteur/exportateur sélectionné n'est pas disponible",
				400,
			),
		);
	}

	// Assigner le transporteur à la commande
	const transporterName =
		transporter.companyName ||
		`${transporter.firstName || ""} ${transporter.lastName || ""}`.trim() ||
		"Le transporteur";

	// Vérifier la limite hebdomadaire de commandes pour le transporteur
	const {
		checkWeeklyOrderLimit,
	} = require("../../../utils/subscriptionLimits");
	try {
		await checkWeeklyOrderLimit(transporter._id);
	} catch (error) {
		return next(
			new AppError(
				`Erreur : ${transporterName} a atteint sa limite hebdomadaire de commandes. Veuillez choisir un autre transporteur ou demander au transporteur de mettre à jour son plan.`,
				400,
			),
		);
	}

	// Vérifier que le transporteur couvre la zone de livraison
	const deliveryRegion = order.delivery?.deliveryAddress?.region;
	const deliveryCity = order.delivery?.deliveryAddress?.city;

	if (
		deliveryRegion &&
		transporter.userType === "transporter" &&
		transporter.serviceAreas
	) {
		const normalizeString = (str) => (str ? str.trim().toLowerCase() : "");
		const normalizedDeliveryRegion = normalizeString(deliveryRegion);
		const normalizedDeliveryCity = normalizeString(deliveryCity);

		const hasMatchingArea = transporter.serviceAreas.some((area) => {
			if (!area || !area.region) return false;

			const normalizedAreaRegion = normalizeString(area.region);
			const regionMatch = normalizedAreaRegion === normalizedDeliveryRegion;

			if (regionMatch) {
				if (!normalizedDeliveryCity) {
					return true;
				}

				if (
					area.cities &&
					Array.isArray(area.cities) &&
					area.cities.length > 0
				) {
					const normalizedCities = area.cities.map((city) =>
						normalizeString(city),
					);
					return normalizedCities.includes(normalizedDeliveryCity);
				}

				return true;
			}

			return false;
		});

		if (!hasMatchingArea) {
			return next(
				new AppError(
					"Le transporteur sélectionné ne couvre pas la zone de livraison",
					400,
				),
			);
		}
	}

	// Assigner le transporteur à la commande
	if (isReassignment && previousTransporterId) {
		const previousTransporter = await User.findById(
			previousTransporterId,
		).select("firstName lastName companyName");
		if (previousTransporter) {
			const previousName =
				previousTransporter.companyName ||
				`${previousTransporter.firstName} ${previousTransporter.lastName}`;
			console.log(`🔄 Réassignation: ${previousName} -> ${transporterName}`);
		}
	}

	order.delivery.transporter = transporter._id;

	if (!order.delivery.status || order.delivery.status === "pending") {
		order.delivery.status = "confirmed";
	}

	if (!order.delivery.timeline) {
		order.delivery.timeline = [];
	}

	const timelineNote =
		isReassignment ?
			`Transporteur réassigné: ${transporterName} (remplace le transporteur précédent)`
		:	`Transporteur assigné: ${transporterName}`;

	order.delivery.timeline.push({
		status: order.delivery.status,
		timestamp: new Date(),
		location: deliveryCity || deliveryRegion || "Zone de livraison",
		note: timelineNote,
		updatedBy: req.admin._id,
	});

	await order.save();

	// Fonction pour construire l'URL de commande
	const buildFrontendUrl = (path) => {
		const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
		return `${baseUrl}${path}`;
	};

	const buildOrderUrl = async (userId) => {
		const user = await User.findById(userId).select("userType");
		if (!user) {
			return buildFrontendUrl(`/consumer/orders/${order._id}`);
		}

		const routeMap = {
			consumer: "/consumer/orders",
			restaurateur: "/restaurateur/orders",
			producer: "/producer/orders",
			transformer: "/transformer/orders",
			exporter: "/exporter/orders",
			transporter: "/transporter/orders",
		};

		const baseRoute = routeMap[user.userType] || "/consumer/orders";
		return buildFrontendUrl(`${baseRoute}/${order._id}`);
	};

	// Fonction helper pour créer les notifications
	const createDeliveryNotification = async (
		recipientId,
		title,
		message,
		orderUrl,
	) => {
		return Notification.createNotification({
			recipient: recipientId,
			type: "delivery_assigned",
			category: "order",
			title,
			message,
			data: {
				orderId: order._id,
				orderNumber: order.orderNumber,
				transporter: {
					id: transporter._id,
					name: transporterName,
					email: transporter.email,
					phone: transporter.phone,
				},
				status: order.status,
			},
			actions: [{ type: "view", label: "Voir la commande", url: orderUrl }],
			channels: {
				inApp: { enabled: true },
				email: { enabled: true },
				push: { enabled: true },
			},
		});
	};

	// Notifier le client (acheteur)
	if (order.buyer) {
		const buyerOrderUrl = await buildOrderUrl(order.buyer._id);
		await createDeliveryNotification(
			order.buyer._id,
			"Livreur assigné à votre commande",
			`Un livreur a été assigné à votre commande ${order.orderNumber}. Votre livreur est ${transporterName}.`,
			buyerOrderUrl,
		);
	}

	// Notifier tous les vendeurs concernés
	const sellerIds = new Set();
	if (order.seller) sellerIds.add(order.seller._id.toString());
	if (order.segments && order.segments.length > 0) {
		order.segments.forEach((segment) => {
			if (segment.seller) sellerIds.add(segment.seller._id.toString());
		});
	}

	if (sellerIds.size > 0) {
		const sellerNotificationsPromises = Array.from(sellerIds).map(
			async (sellerId) => {
				const sellerOrderUrl = await buildOrderUrl(sellerId);
				return createDeliveryNotification(
					sellerId,
					"Livreur assigné à la commande",
					`Un livreur a été assigné à la commande ${order.orderNumber}. Le livreur est ${transporterName}.`,
					sellerOrderUrl,
				);
			},
		);
		await Promise.all(sellerNotificationsPromises);
	}

	// Notifier le transporteur/exportateur
	const transporterOrderUrl = await buildOrderUrl(transporter._id);
	const delivererType =
		transporter.userType === "exporter" ? "exportateur" : "transporteur";
	const deliveryFee = order.deliveryFee || order.delivery?.deliveryFee || 0;
	const currency = order.currency || "XAF";

	await Notification.createNotification({
		recipient: transporter._id,
		type: "delivery_assigned",
		category: "order",
		title: `Nouvelle commande assignée - ${delivererType === "exportateur" ? "Export" : "Livraison locale"}`,
		message: `Une nouvelle commande ${order.orderNumber} vous a été assignée comme ${delivererType}. Frais de livraison : ${deliveryFee} ${currency}`,
		data: {
			orderId: order._id,
			orderNumber: order.orderNumber,
			status: order.status,
			deliveryFee,
			currency,
			buyer:
				order.buyer ?
					{
						firstName: order.buyer.firstName || "",
						lastName: order.buyer.lastName || "",
						email: order.buyer.email || "",
						phone: order.buyer.phone || "",
					}
				:	null,
			seller:
				order.seller ?
					{
						firstName: order.seller.firstName || "",
						lastName: order.seller.lastName || "",
						email: order.seller.email || "",
						phone: order.seller.phone || "",
						companyName:
							order.seller.companyName || order.seller.farmName || "",
					}
				:	null,
			deliveryAddress: order.delivery?.deliveryAddress || null,
		},
		actions: [
			{ type: "view", label: "Voir la commande", url: transporterOrderUrl },
		],
		channels: {
			inApp: { enabled: true },
			email: { enabled: true },
			push: { enabled: true },
		},
	});

	// Récupérer la commande mise à jour avec les populations
	const updatedOrder = await Order.findById(orderId)
		.populate("buyer", "firstName lastName email phone userType")
		.populate(
			"seller",
			"firstName lastName email phone farmName companyName userType",
		)
		.populate(
			"delivery.transporter",
			"firstName lastName email phone companyName userType",
		)
		.populate("items.product", "name images price");

	res.status(200).json({
		status: "success",
		message: "Transporteur assigné avec succès",
		data: {
			order: updatedOrder,
			transporter: {
				_id: transporter._id,
				name:
					transporter.companyName ||
					`${transporter.firstName} ${transporter.lastName}`,
				email: transporter.email,
				phone: transporter.phone,
				userType: transporter.userType || "transporter",
			},
		},
	});
});
