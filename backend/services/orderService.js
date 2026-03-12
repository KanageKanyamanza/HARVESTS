const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { toPlainText } = require("../utils/localization");
const {
	createSegmentsFromItems,
	ensureSegmentsForOrder,
	updateOrderStatusFromSegments,
} = require("../utils/orderSegments");

/**
 * Service pour la gestion des commandes
 */

// Construire l'URL de commande selon le type d'utilisateur
async function buildOrderUrl(userId, orderId) {
	const User = mongoose.model("User");
	const user = await User.findById(userId).select("userType");
	if (!user) {
		return buildFrontendUrl(`/consumer/orders/${orderId}`);
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
	return buildFrontendUrl(`${baseRoute}/${orderId}`);
}

function buildFrontendUrl(path) {
	const frontendUrl = process.env.FRONTEND_URL || "https://www.harvests.site";
	const baseUrl = frontendUrl.replace(/\/$/, "");
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	return `${baseUrl}${normalizedPath}`;
}

// Traiter les articles d'une commande
async function processOrderItems(items) {
	const processedItems = [];
	const sellerInfoMap = new Map();

	for (const item of items) {
		const product = await Product.findById(item.productId)
			.populate("producer", "city region country coordinates")
			.populate("transformer", "city region country coordinates")
			.populate("restaurateur", "city region country coordinates");

		if (!product || !product.isActive || product.status !== "approved") {
			throw new Error(`Produit ${item.productId} non disponible`);
		}

		let availableQuantity, unitPrice;

		if (product.hasVariants && item.variantId) {
			const variant = product.variants.id(item.variantId);
			if (!variant || !variant.isActive) {
				throw new Error(`Variante non disponible`);
			}
			availableQuantity = variant.inventory.quantity;
			unitPrice = variant.price;
		} else {
			availableQuantity = product.inventory.quantity;
			unitPrice = product.price;
		}

		if (availableQuantity < item.quantity) {
			throw new Error(`Stock insuffisant pour ${product.name}`);
		}

		const totalPrice = unitPrice * item.quantity;
		const sellerDoc =
			product.producer || product.transformer || product.restaurateur;
		const sellerIdRaw =
			item.supplierId ||
			(sellerDoc ?
				(sellerDoc._id || sellerDoc.id || sellerDoc).toString()
			:	null);

		if (!sellerIdRaw || !mongoose.Types.ObjectId.isValid(sellerIdRaw)) {
			throw new Error(
				`Impossible de déterminer un vendeur valide pour le produit ${product._id}`,
			);
		}

		const sellerObjectId = new mongoose.Types.ObjectId(sellerIdRaw);
		const sellerKey = sellerObjectId.toString();

		if (!sellerInfoMap.has(sellerKey)) {
			sellerInfoMap.set(sellerKey, {
				id: sellerObjectId,
				city: sellerDoc?.city || null,
				region: sellerDoc?.region || null,
				country: sellerDoc?.country || null,
				coordinates: sellerDoc?.coordinates || null,
			});
		}

		const weightData = product.shipping?.weight;
		const normalizedWeight = {
			value: Number(weightData?.value) > 0 ? Number(weightData.value) : 1,
			unit: weightData?.unit || product.shipping?.weightUnit || "kg",
		};

		const productName = toPlainText(
			product.name,
			product.slug || product._id?.toString() || "Produit",
		);
		const productDescription =
			toPlainText(product.shortDescription) ||
			toPlainText(product.description) ||
			"";

		processedItems.push({
			product: product._id,
			variant: item.variantId || undefined,
			productSnapshot: {
				name: productName,
				description: productDescription,
				images: (product.images || [])
					.map((img) => {
						if (typeof img === "string") return img;
						if (img && typeof img.url === "string") return img.url;
						return null;
					})
					.filter(Boolean),
				producer: product.producer,
				transformer: product.transformer,
				restaurateur: product.restaurateur,
			},
			seller: sellerObjectId,
			quantity: item.quantity,
			unitPrice,
			totalPrice,
			weight: normalizedWeight,
			specialInstructions: item.specialInstructions,
		});
	}

	return { processedItems, sellerInfoMap };
}

// Construire la requête de commandes selon le type d'utilisateur
function buildOrderQuery(userId, userType, queryParams = {}) {
	let query = {};

	if (userType === "restaurateur") {
		query.$or = [
			{ buyer: userId },
			{ seller: userId },
			{ "segments.seller": userId },
			{ "items.seller": userId },
			{ "items.productSnapshot.producer": userId },
			{ "items.productSnapshot.transformer": userId },
			{ "items.productSnapshot.restaurateur": userId },
		];
	} else if (userType === "consumer") {
		query.buyer = userId;
	} else if (["producer", "transformer"].includes(userType)) {
		query.$or = [
			{ seller: userId },
			{ "segments.seller": userId },
			{ "items.seller": userId },
			{ "items.productSnapshot.producer": userId },
			{ "items.productSnapshot.transformer": userId },
			{ "items.productSnapshot.restaurateur": userId },
		];
	} else if (userType === "transporter") {
		query["delivery.transporter"] = userId;
	}

	if (queryParams.status) query.status = queryParams.status;
	if (queryParams.dateFrom) {
		query.createdAt = { $gte: new Date(queryParams.dateFrom) };
	}
	if (queryParams.dateTo) {
		query.createdAt = {
			...query.createdAt,
			$lte: new Date(queryParams.dateTo),
		};
	}

	return query;
}

// Vérifier l'accès à une commande
function checkOrderAccess(order, userId, userRole) {
	const buyerId =
		order.buyer?._id?.toString() ||
		order.buyer?.toString() ||
		(typeof order.buyer === "object" ? order.buyer.toString() : order.buyer);
	const sellerId =
		order.seller?._id?.toString() ||
		order.seller?.toString() ||
		(typeof order.seller === "object" ? order.seller.toString() : order.seller);
	const transporterId =
		order.delivery?.transporter?._id?.toString() ||
		order.delivery?.transporter?.toString();
	const userIdStr = userId.toString();

	const sellerItemsMatch = order.items?.some((item) => {
		const itemSeller =
			item.seller?.toString?.() || item.seller?._id?.toString();
		const producerId =
			item.productSnapshot?.producer?.toString?.() ||
			item.productSnapshot?.producer?._id?.toString();
		const transformerId =
			item.productSnapshot?.transformer?.toString?.() ||
			item.productSnapshot?.transformer?._id?.toString();
		const restaurateurId =
			item.productSnapshot?.restaurateur?.toString?.() ||
			item.productSnapshot?.restaurateur?._id?.toString();
		return [itemSeller, producerId, transformerId, restaurateurId].includes(
			userIdStr,
		);
	});

	const isTransporterOrExporterAssigned =
		transporterId && transporterId === userIdStr;

	return (
		buyerId === userIdStr ||
		sellerId === userIdStr ||
		sellerItemsMatch ||
		isTransporterOrExporterAssigned ||
		userRole === "admin"
	);
}

// Vérifier les permissions d'annulation
function checkCancelPermission(order, userId, userRole) {
	const sellerIds = new Set();
	if (order.seller) sellerIds.add(order.seller.toString());
	(order.items || []).forEach((item) => {
		if (item.seller) sellerIds.add(item.seller.toString());
	});

	return (
		order.buyer.toString() === userId.toString() ||
		sellerIds.has(userId.toString()) ||
		userRole === "admin"
	);
}

// Obtenir les données de suivi d'une commande
function getTrackingData(order) {
	return {
		orderNumber: order.orderNumber,
		status: order.status,
		estimatedDelivery: order.estimatedDelivery,
		timeline: order.delivery.timeline,
		transporter: order.delivery.transporter,
		trackingNumber: order.delivery.trackingNumber,
	};
}

// Formater les commandes selon le type d'utilisateur
function formatOrders(orders, userId, userType) {
	const { formatOrderForSeller } = require("../utils/orderFormatting");
	const userIdStr = userId?.toString?.() || userId?.toString();
	const isSellerView = ["producer", "transformer", "restaurateur"].includes(
		userType,
	);

	return isSellerView ?
			orders
				.map((order) => {
					try {
						// Vérifier si l'utilisateur est l'acheteur
						const buyerId =
							order.buyer?._id?.toString?.() || order.buyer?.toString?.();
						const isBuyer = buyerId === userIdStr;

						if (isBuyer) {
							// Si le restaurateur est l'acheteur, formater comme un consommateur
							const orderObj = order.toObject({ virtuals: true });
							orderObj.role = "buyer";
							return orderObj;
						}

						// Sinon, formater comme vendeur
						return formatOrderForSeller(order, userId);
					} catch (error) {
						console.error(
							`Erreur lors du formatage de la commande ${order._id}:`,
							error.message,
						);
						return null;
					}
				})
				.filter((order) => order !== null)
		:	orders
				.map((order) => {
					try {
						return order.toObject({ virtuals: true });
					} catch (error) {
						console.error(
							`Erreur lors de la conversion de la commande ${order._id}:`,
							error.message,
						);
						return null;
					}
				})
				.filter((order) => order !== null);
}

// Formater une commande unique
function formatOrder(order, userId, userType) {
	const { formatOrderForSeller } = require("../utils/orderFormatting");
	const userIdStr = userId?.toString?.() || userId?.toString();

	if (["producer", "transformer", "restaurateur"].includes(userType)) {
		// Vérifier si l'utilisateur est l'acheteur
		const buyerId = order.buyer?._id?.toString?.() || order.buyer?.toString?.();
		const isBuyer = buyerId === userIdStr;

		if (isBuyer) {
			// Si le restaurateur est l'acheteur, formater comme un consommateur
			const orderObj = order.toObject({ virtuals: true });
			orderObj.role = "buyer";
			return orderObj;
		}

		// Sinon, formater comme vendeur
		try {
			return formatOrderForSeller(order, userId);
		} catch (error) {
			console.error(
				`Erreur formatOrderForSeller pour commande ${order._id}:`,
				error,
			);
			return order.toObject({ virtuals: true });
		}
	}

	return order.toObject({ virtuals: true });
}

// Créer une commande complète
async function createOrder(orderData, user) {
	const deliveryService = require("./deliveryService");
	const { processedItems, sellerInfoMap } = await processOrderItems(
		orderData.items,
	);
	const sellerLocations = Array.from(sellerInfoMap.values());
	const subtotal = processedItems.reduce(
		(sum, item) => sum + (item.totalPrice || 0),
		0,
	);
	const deliveryMethod = orderData.deliveryMethod || "standard-delivery";
	const deliveryFeeDetail = deliveryService.calculateDeliveryFee(
		processedItems,
		orderData.deliveryAddress,
		sellerLocations,
		deliveryMethod,
	);
	const deliveryFee = deliveryFeeDetail.amount;
	const taxes = 0;

	let discount = 0;
	let loyaltyPointsUsed = 0;

	if (orderData.useLoyaltyPoints && user.userType === "consumer") {
		const Consumer = require("../models/Consumer");
		const consumer = await Consumer.findById(user._id);
		if (
			consumer &&
			orderData.loyaltyPointsToUse <= consumer.loyaltyProgram.points
		) {
			discount = await consumer.redeemLoyaltyPoints(
				orderData.loyaltyPointsToUse,
			);
			loyaltyPointsUsed = orderData.loyaltyPointsToUse;
			await consumer.save();
		}
	}

	const total = subtotal + deliveryFee + taxes - discount;

	const uniqueSellerIds = sellerLocations
		.map((location) => location?.id)
		.filter((sellerId) => !!sellerId);

	if (uniqueSellerIds.length === 0) {
		throw new Error("Impossible de déterminer un vendeur pour cette commande");
	}

	// Vérifier les limites de commandes hebdomadaires pour les vendeurs
	const User = mongoose.model("User");
	const { checkWeeklyOrderLimit } = require("../utils/subscriptionLimits");
	for (const sellerId of uniqueSellerIds) {
		try {
			await checkWeeklyOrderLimit(sellerId);
		} catch (error) {
			// On récupère les détails du vendeur pour un message plus clair
			const sellerUser = await User.findById(sellerId);
			const sellerName =
				sellerUser?.farmName ||
				sellerUser?.companyName ||
				`${sellerUser?.firstName || ""} ${sellerUser?.lastName || ""}`.trim() ||
				"un vendeur";

			// Identifier les produits concernés dans le panier
			const affectedProducts = processedItems
				.filter((item) => item.seller.toString() === sellerId.toString())
				.map((item) => item.productSnapshot.name);

			const productsList = affectedProducts.join(", ");

			throw new Error(
				`Erreur : Le vendeur "${sellerName}" a atteint sa limite de commandes hebdomadaire. Produits concernés : ${productsList}. Veuillez les retirer pour continuer.`,
			);
		}
	}

	const isSingleSellerOrder = uniqueSellerIds.length === 1;
	const normalizedPaymentMethod =
		["paypal", "cash"].includes((orderData.paymentMethod || "").toLowerCase()) ?
			(orderData.paymentMethod || "").toLowerCase()
		:	"cash";
	const normalizedPaymentProvider =
		orderData.paymentProvider ||
		(normalizedPaymentMethod === "paypal" ? "paypal" : "cash-on-delivery");

	const orderPayload = {
		buyer: user._id,
		items: processedItems,
		segments: createSegmentsFromItems(processedItems),
		subtotal,
		deliveryFee,
		deliveryFeeDetail,
		taxes,
		discount,
		total,
		currency: orderData.currency || "XAF",
		payment: {
			method: normalizedPaymentMethod,
			provider: normalizedPaymentProvider,
			amount: total,
			currency: orderData.currency || "XAF",
			status: "pending",
		},
		delivery: {
			method: deliveryMethod,
			deliveryFee,
			feeDetail: deliveryFeeDetail,
			deliveryAddress: orderData.deliveryAddress,
			estimatedDeliveryDate:
				deliveryService.calculateEstimatedDelivery(deliveryMethod),
		},
		billingAddress: orderData.billingAddress || orderData.deliveryAddress,
		buyerNotes: orderData.notes,
		loyaltyPointsUsed,
		source: orderData.source || "web",
	};

	if (isSingleSellerOrder) {
		orderPayload.seller = uniqueSellerIds[0];
	}

	const order = await Order.create(orderPayload);

	// Réserver le stock
	try {
		await order.reserveStock();
	} catch (error) {
		await Order.findByIdAndDelete(order._id);
		throw error;
	}

	// Calculer les points de fidélité gagnés
	if (user.userType === "consumer") {
		const Consumer = require("../models/Consumer");
		const consumer = await Consumer.findById(user._id);
		if (consumer) {
			const pointsEarned = await consumer.addLoyaltyPoints(total, order._id);
			order.loyaltyPointsEarned = pointsEarned;
			await consumer.save();
		}
	}

	await order.save();
	return order;
}

// Annuler une commande
async function cancelOrder(order, userId, reason) {
	const {
		ensureSegmentsForOrder,
		updateOrderStatusFromSegments,
	} = require("../utils/orderSegments");

	if (!order.canBeCancelled) {
		throw new Error("Cette commande ne peut plus être annulée");
	}

	// Libérer le stock
	await order.releaseStock();

	const segmentsCreated = ensureSegmentsForOrder(order);
	if (segmentsCreated) {
		await order.save();
	}

	const now = new Date();

	for (const segment of order.segments || []) {
		segment.status = "cancelled";
		segment.history = segment.history || [];
		segment.history.push({
			status: "cancelled",
			timestamp: now,
			updatedBy: userId,
			reason,
		});
	}

	order.statusHistory = order.statusHistory || [];
	order.statusHistory.push({
		status: "cancelled",
		timestamp: now,
		updatedBy: userId,
		reason,
	});

	order.modifiedBy = userId;
	updateOrderStatusFromSegments(order, "cancelled");
	await order.save();

	// Traiter le remboursement si paiement effectué
	if (order.payment.status === "completed") {
		const Payment = require("../models/Payment");
		const payment = await Payment.findOne({ order: order._id });
		if (payment) {
			await payment.createRefund(payment.amount, "order_cancelled");
		}
	}

	return order;
}

// Obtenir les statistiques des commandes
async function getOrderStats(period = "30d", groupBy = "day") {
	const Order = require("../models/Order");

	const periodDays = parseInt(period.replace("d", ""));
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - periodDays);

	let groupFormat;
	switch (groupBy) {
		case "hour":
			groupFormat = {
				year: { $year: "$createdAt" },
				month: { $month: "$createdAt" },
				day: { $dayOfMonth: "$createdAt" },
				hour: { $hour: "$createdAt" },
			};
			break;
		case "day":
			groupFormat = {
				year: { $year: "$createdAt" },
				month: { $month: "$createdAt" },
				day: { $dayOfMonth: "$createdAt" },
			};
			break;
		case "week":
			groupFormat = {
				year: { $year: "$createdAt" },
				week: { $week: "$createdAt" },
			};
			break;
		case "month":
			groupFormat = {
				year: { $year: "$createdAt" },
				month: { $month: "$createdAt" },
			};
			break;
		default:
			groupFormat = {
				year: { $year: "$createdAt" },
				month: { $month: "$createdAt" },
				day: { $dayOfMonth: "$createdAt" },
			};
	}

	const stats = await Order.aggregate([
		{ $match: { createdAt: { $gte: startDate } } },
		{
			$group: {
				_id: groupFormat,
				totalOrders: { $sum: 1 },
				totalRevenue: { $sum: "$total" },
				averageOrderValue: { $avg: "$total" },
				completedOrders: {
					$sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
				},
				cancelledOrders: {
					$sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
				},
			},
		},
		{ $sort: { _id: 1 } },
	]);

	const statusDistribution = await Order.aggregate([
		{ $match: { createdAt: { $gte: startDate } } },
		{
			$group: {
				_id: "$status",
				count: { $sum: 1 },
			},
		},
	]);

	return {
		period,
		groupBy,
		startDate,
		endDate: new Date(),
		stats,
		statusDistribution,
	};
}

// Construire une requête pour toutes les commandes (admin)
function buildAllOrdersQuery(queryParams) {
	const queryObj = {};

	if (queryParams.status) queryObj.status = queryParams.status;
	if (queryParams.seller) queryObj.seller = queryParams.seller;
	if (queryParams.buyer) queryObj.buyer = queryParams.buyer;
	if (queryParams.dateFrom) {
		queryObj.createdAt = { $gte: new Date(queryParams.dateFrom) };
	}
	if (queryParams.dateTo) {
		queryObj.createdAt = {
			...queryObj.createdAt,
			$lte: new Date(queryParams.dateTo),
		};
	}

	return queryObj;
}

// Estimer les coûts d'une commande
async function estimateOrderCosts(
	items,
	deliveryAddress,
	deliveryMethod,
	user,
	options = {},
) {
	const deliveryService = require("./deliveryService");
	const { processedItems, sellerInfoMap } = await processOrderItems(items);
	const sellerLocations = Array.from(sellerInfoMap.values());
	const subtotal = processedItems.reduce(
		(sum, item) => sum + (item.totalPrice || 0),
		0,
	);
	const deliveryFeeDetail = deliveryService.calculateDeliveryFee(
		processedItems,
		deliveryAddress,
		sellerLocations,
		deliveryMethod,
	);
	const deliveryFee = deliveryFeeDetail.amount;
	const taxes = 0;

	let discount = 0;
	let loyaltyPointsUsed = 0;

	if (options.useLoyaltyPoints && user.userType === "consumer") {
		const Consumer = require("../models/Consumer");
		const consumer = await Consumer.findById(user._id);
		if (consumer) {
			const requestedPoints = Math.max(
				0,
				Number(options.loyaltyPointsToUse) || 0,
			);
			const availablePoints = consumer.loyaltyProgram?.points || 0;
			loyaltyPointsUsed = Math.min(requestedPoints, availablePoints);
			discount = loyaltyPointsUsed * 10;
		}
	}

	const total = subtotal + deliveryFee + taxes - discount;
	const paymentMethodRaw = options.paymentMethod;
	const normalizedPaymentMethod =
		["paypal", "cash"].includes((paymentMethodRaw || "").toLowerCase()) ?
			(paymentMethodRaw || "").toLowerCase()
		:	"cash";
	const normalizedPaymentProvider =
		options.paymentProvider ||
		(normalizedPaymentMethod === "paypal" ? "paypal" : "cash-on-delivery");

	return {
		subtotal,
		deliveryFee,
		deliveryFeeDetail,
		taxes,
		discount,
		total,
		loyaltyPointsUsed,
		deliveryMethod: deliveryMethod || "standard-delivery",
		paymentMethod: normalizedPaymentMethod,
		paymentProvider: normalizedPaymentProvider,
		sellerCount: sellerLocations.length,
	};
}

// Obtenir toutes les commandes selon les critères
async function getAllOrders(queryParams = {}) {
	const query = buildAllOrdersQuery(queryParams);

	const page = parseInt(queryParams.page, 10) || 1;
	const limit = parseInt(queryParams.limit, 10) || 20;
	const skip = (page - 1) * limit;

	const orders = await Order.find(query)
		.populate("buyer", "firstName lastName email userType")
		.populate("seller", "farmName companyName firstName lastName userType")
		.populate({
			path: "segments.seller",
			select: "farmName companyName firstName lastName email phone userType",
		})
		.sort("-createdAt")
		.skip(skip)
		.limit(limit);

	return orders;
}

// Obtenir une commande par ID
async function getOrderById(orderId) {
	const order = await Order.findById(orderId)
		.populate("buyer", "firstName lastName email userType")
		.populate("seller", "farmName companyName firstName lastName userType")
		.populate({
			path: "segments.seller",
			select: "farmName companyName firstName lastName email phone userType",
		})
		.populate("items.product", "name images price")
		.populate(
			"delivery.transporter",
			"firstName lastName email phone companyName userType",
		);

	return order;
}

module.exports = {
	buildOrderUrl,
	buildFrontendUrl,
	processOrderItems,
	buildOrderQuery,
	checkOrderAccess,
	checkCancelPermission,
	getTrackingData,
	formatOrders,
	formatOrder,
	createOrder,
	cancelOrder,
	getOrderStats,
	buildAllOrdersQuery,
	estimateOrderCosts,
	ensureSegmentsForOrder,
	updateOrderStatusFromSegments,
	getAllOrders,
	getOrderById,
};
