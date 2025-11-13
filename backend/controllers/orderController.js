const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const notificationController = require('./notificationController');
const {
  createSegmentsFromItems,
  ensureSegmentsForOrder,
  updateOrderStatusFromSegments
} = require('../utils/orderSegments');
const { toPlainText } = require('../utils/localization');

// Fonction utilitaire pour construire une URL complète du frontend
function buildFrontendUrl(path) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://harvests-khaki.vercel.app';
  // Supprimer le slash final de l'URL du frontend si présent
  const baseUrl = frontendUrl.replace(/\/$/, '');
  // S'assurer que le chemin commence par un slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

// Fonction pour construire l'URL de commande selon le type d'utilisateur
async function buildOrderUrl(userId, orderId) {
  const User = mongoose.model('User');
  const user = await User.findById(userId).select('userType');
  if (!user) {
    // Par défaut, utiliser /consumer/orders/ si l'utilisateur n'est pas trouvé
    return buildFrontendUrl(`/consumer/orders/${orderId}`);
  }
  
  const userType = user.userType;
  // Mapper les types d'utilisateurs aux routes appropriées
  const routeMap = {
    'consumer': '/consumer/orders',
    'restaurateur': '/restaurateur/orders',
    'producer': '/producer/orders',
    'transformer': '/transformer/orders',
    'exporter': '/exporter/orders',
    'transporter': '/transporter/orders'
  };
  
  const baseRoute = routeMap[userType] || '/consumer/orders';
  return buildFrontendUrl(`${baseRoute}/${orderId}`);
}

// ROUTES PUBLIQUES (avec authentification)

// Estimer les frais avant création de commande
exports.estimateOrderCosts = catchAsync(async (req, res, next) => {
  const { items, deliveryAddress, deliveryMethod, useLoyaltyPoints, loyaltyPointsToUse } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new AppError('Au moins un article est requis', 400));
  }

  let subtotal = 0;
  const processedItems = [];
  const sellerInfoMap = new Map();

  for (const item of items) {
    const product = await Product.findById(item.productId)
      .populate('producer', 'city region country coordinates')
      .populate('transformer', 'city region country coordinates')
      .populate('restaurateur', 'city region country coordinates');

    if (!product || !product.isActive || product.status !== 'approved') {
      return next(new AppError(`Produit ${item.productId} non disponible`, 400));
    }

    let availableQuantity;
    let unitPrice;

    if (product.hasVariants && item.variantId) {
      const variant = product.variants.id(item.variantId);
      if (!variant || !variant.isActive) {
        return next(new AppError(`Variante non disponible`, 400));
      }
      availableQuantity = variant.inventory.quantity;
      unitPrice = variant.price;
    } else {
      availableQuantity = product.inventory.quantity;
      unitPrice = product.price;
    }

    if (availableQuantity < item.quantity) {
      return next(new AppError(`Stock insuffisant pour ${product.name}`, 400));
    }

    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;

    const sellerDoc = product.producer || product.transformer || product.restaurateur;
    const sellerIdRaw = item.supplierId || (sellerDoc ? (sellerDoc._id || sellerDoc.id || sellerDoc).toString() : null);

    if (!sellerIdRaw) {
      return next(new AppError('Impossible de déterminer le vendeur pour un article', 400));
    }

    if (!mongoose.Types.ObjectId.isValid(sellerIdRaw)) {
      return next(new AppError(`Identifiant vendeur invalide pour le produit ${product._id}`, 400));
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerIdRaw);
    const sellerKey = sellerObjectId.toString();

    if (!sellerInfoMap.has(sellerKey)) {
      sellerInfoMap.set(sellerKey, {
        id: sellerObjectId,
        city: sellerDoc?.city || null,
        region: sellerDoc?.region || null,
        country: sellerDoc?.country || null,
        coordinates: sellerDoc?.coordinates || null
      });
    }

    const weightData = product.shipping?.weight;
    const normalizedWeight = {
      value: Number(weightData?.value) > 0 ? Number(weightData.value) : 1,
      unit: weightData?.unit || product.shipping?.weightUnit || 'kg'
    };

    const productName = toPlainText(product.name, product.slug || product._id?.toString() || 'Produit');
    const productDescription =
      toPlainText(product.shortDescription) ||
      toPlainText(product.description) ||
      '';

    processedItems.push({
      product: product._id,
      variant: item.variantId || undefined,
      productSnapshot: {
        name: productName,
        description: productDescription,
        images: (product.images || []).map((img) => {
          if (typeof img === 'string') return img;
          if (img && typeof img.url === 'string') return img.url;
          return null;
        }).filter(Boolean),
        producer: product.producer,
        transformer: product.transformer,
        restaurateur: product.restaurateur
      },
      seller: sellerObjectId,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      weight: normalizedWeight,
      specialInstructions: item.specialInstructions,
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        timestamp: new Date()
      }]
    });
  }

  const sellerLocations = Array.from(sellerInfoMap.values());
  const deliveryFeeDetail = calculateDeliveryFee(processedItems, deliveryAddress, sellerLocations, deliveryMethod);
  const deliveryFee = deliveryFeeDetail.amount;
  const taxes = 0;

  let discount = 0;
  let loyaltyPointsUsed = 0;

  if (useLoyaltyPoints && req.user.userType === 'consumer') {
    const Consumer = require('../models/Consumer');
    const consumer = await Consumer.findById(req.user._id);
    if (consumer) {
      const requestedPoints = Math.max(0, Number(loyaltyPointsToUse) || 0);
      const availablePoints = consumer.loyaltyProgram?.points || 0;
      loyaltyPointsUsed = Math.min(requestedPoints, availablePoints);
      discount = loyaltyPointsUsed * 10;
    }
  }

  const total = subtotal + deliveryFee + taxes - discount;
  const paymentMethodRaw = req.body.paymentMethod;
  const normalizedPaymentMethod = ['paypal', 'cash'].includes((paymentMethodRaw || '').toLowerCase())
    ? (paymentMethodRaw || '').toLowerCase()
    : 'cash';
  const normalizedPaymentProvider = (req.body.paymentProvider ||
    (normalizedPaymentMethod === 'paypal' ? 'paypal' : 'cash-on-delivery'));

  res.status(200).json({
    status: 'success',
    data: {
      subtotal,
      deliveryFee,
      deliveryFeeDetail,
      taxes,
      discount,
      total,
      loyaltyPointsUsed,
      deliveryMethod: deliveryMethod || 'standard-delivery',
      paymentMethod: normalizedPaymentMethod,
      paymentProvider: normalizedPaymentProvider,
      sellerCount: sellerLocations.length
    }
  });
});

// Créer une nouvelle commande
exports.createOrder = catchAsync(async (req, res, next) => {
  const { items, deliveryAddress, billingAddress, paymentMethod, paymentProvider, notes } = req.body;
  const paymentMethodRaw = paymentMethod;
  const normalizedPaymentMethod = ['paypal', 'cash'].includes((paymentMethodRaw || '').toLowerCase())
    ? (paymentMethodRaw || '').toLowerCase()
    : 'cash';
  const normalizedPaymentProvider = paymentProvider ||
    (normalizedPaymentMethod === 'paypal' ? 'paypal' : 'cash-on-delivery');

  // Valider les articles
  if (!items || items.length === 0) {
    return next(new AppError('Au moins un article est requis', 400));
  }

  // Vérifier la disponibilité et calculer les totaux
  let subtotal = 0;
  const processedItems = [];
  const sellerInfoMap = new Map();

  for (const item of items) {
    const product = await Product.findById(item.productId)
      .populate('producer', 'city region country coordinates')
      .populate('transformer', 'city region country coordinates')
      .populate('restaurateur', 'city region country coordinates');
    if (!product || !product.isActive || product.status !== 'approved') {
      return next(new AppError(`Produit ${item.productId} non disponible`, 400));
    }

    // Vérifier le stock
    let availableQuantity;
    let unitPrice;

    if (product.hasVariants && item.variantId) {
      const variant = product.variants.id(item.variantId);
      if (!variant || !variant.isActive) {
        return next(new AppError(`Variante non disponible`, 400));
      }
      availableQuantity = variant.inventory.quantity;
      unitPrice = variant.price;
    } else {
      availableQuantity = product.inventory.quantity;
      unitPrice = product.price;
    }

    if (availableQuantity < item.quantity) {
      return next(new AppError(`Stock insuffisant pour ${product.name}`, 400));
    }

    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;

    const sellerDoc = product.producer || product.transformer || product.restaurateur;
    const sellerIdRaw = item.supplierId || (sellerDoc ? (sellerDoc._id || sellerDoc.id || sellerDoc).toString() : null);

    if (!sellerIdRaw || !mongoose.Types.ObjectId.isValid(sellerIdRaw)) {
      return next(new AppError(`Impossible de déterminer un vendeur valide pour le produit ${product._id}`, 400));
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerIdRaw);
    const sellerKey = sellerObjectId.toString();

    if (!sellerInfoMap.has(sellerKey)) {
      sellerInfoMap.set(sellerKey, {
        id: sellerObjectId,
        city: sellerDoc?.city || null,
        region: sellerDoc?.region || null,
        country: sellerDoc?.country || null,
        coordinates: sellerDoc?.coordinates || null
      });
    }

    const weightData = product.shipping?.weight;
    const normalizedWeight = {
      value: Number(weightData?.value) > 0 ? Number(weightData.value) : 1,
      unit: weightData?.unit || product.shipping?.weightUnit || 'kg'
    };

    const productName = toPlainText(product.name, product.slug || product._id?.toString() || 'Produit');
    const productDescription =
      toPlainText(product.shortDescription) ||
      toPlainText(product.description) ||
      '';

    processedItems.push({
      product: product._id,
      variant: item.variantId || undefined,
      productSnapshot: {
        name: productName,
        description: productDescription,
        images: (product.images || []).map((img) => {
          if (typeof img === 'string') return img;
          if (img && typeof img.url === 'string') return img.url;
          return null;
        }).filter(Boolean),
        producer: product.producer,
        transformer: product.transformer,
        restaurateur: product.restaurateur
      },
      seller: sellerObjectId,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      weight: normalizedWeight,
      specialInstructions: item.specialInstructions
    });
  }

  const sellerLocations = Array.from(sellerInfoMap.values());
  const deliveryMethod = req.body.deliveryMethod || 'standard-delivery';
  const deliveryFeeDetail = calculateDeliveryFee(processedItems, deliveryAddress, sellerLocations, deliveryMethod);
  const deliveryFee = deliveryFeeDetail.amount;

  const taxes = 0;
  
  let discount = 0;
  let loyaltyPointsUsed = 0;
  
  if (req.body.useLoyaltyPoints && req.user.userType === 'consumer') {
    const Consumer = require('../models/Consumer');
    const consumer = await Consumer.findById(req.user._id);
    if (consumer && req.body.loyaltyPointsToUse <= consumer.loyaltyProgram.points) {
      discount = await consumer.redeemLoyaltyPoints(req.body.loyaltyPointsToUse);
      loyaltyPointsUsed = req.body.loyaltyPointsToUse;
      await consumer.save();
    }
  }
  
  const total = subtotal + deliveryFee + taxes - discount;
  
  const uniqueSellerIds = sellerLocations
    .map(location => location?.id)
    .filter((sellerId) => !!sellerId);

  if (uniqueSellerIds.length === 0) {
    return next(new AppError('Impossible de déterminer un vendeur pour cette commande', 400));
  }

  const isSingleSellerOrder = uniqueSellerIds.length === 1;

  const orderPayload = {
    buyer: req.user._id,
    items: processedItems,
    segments: createSegmentsFromItems(processedItems),
    subtotal,
    deliveryFee,
    deliveryFeeDetail,
    taxes,
    discount,
    total,
    currency: req.body.currency || 'XAF',
    payment: {
      method: normalizedPaymentMethod,
      provider: normalizedPaymentProvider,
      amount: total,
      currency: req.body.currency || 'XAF',
      status: 'pending'
    },
    delivery: {
      method: req.body.deliveryMethod || 'standard-delivery',
      deliveryFee,
      feeDetail: deliveryFeeDetail,
      deliveryAddress,
      estimatedDeliveryDate: calculateEstimatedDelivery(req.body.deliveryMethod)
    },
    billingAddress: billingAddress || deliveryAddress,
    buyerNotes: notes,
    loyaltyPointsUsed,
    source: req.body.source || 'web'
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
    return next(new AppError(error.message, 400));
  }

  // Calculer les points de fidélité gagnés
  if (req.user.userType === 'consumer') {
    const Consumer = require('../models/Consumer');
    const consumer = await Consumer.findById(req.user._id);
    if (consumer) {
      const pointsEarned = await consumer.addLoyaltyPoints(total, order._id);
      order.loyaltyPointsEarned = pointsEarned;
      await consumer.save();
    }
  }

  await order.save();

  // Envoyer notifications
  try {
    await Notification.notifyOrderCreated(order);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
  }

  // Notifier les admins pour les commandes de forte valeur (> 100,000 FCFA)
  if (total >= 100000) {
    try {
      const customerName = `${req.user.firstName} ${req.user.lastName}`;
      await notificationController.notifyHighValueOrder(
        order._id,
        total,
        customerName
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi de notification admin:', error);
      // Ne pas faire échouer la création de commande si la notification échoue
    }
  }

  res.status(201).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Obtenir mes commandes
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  let query = {};
  
  // Filtrer selon le type d'utilisateur
  // Les restaurateurs peuvent être à la fois acheteurs ET vendeurs
  if (req.user.userType === 'restaurateur') {
    // Restaurateur : voir les commandes où il est acheteur OU vendeur
    query.$or = [
      { buyer: req.user._id },
      { seller: req.user._id },
      { 'segments.seller': req.user._id },
      { 'items.seller': req.user._id },
      { 'items.productSnapshot.producer': req.user._id },
      { 'items.productSnapshot.transformer': req.user._id },
      { 'items.productSnapshot.restaurateur': req.user._id }
    ];
  } else if (req.user.userType === 'consumer') {
    // Consumer : seulement les commandes où il est acheteur
    query.buyer = req.user._id;
  } else if (['producer', 'transformer'].includes(req.user.userType)) {
    // Producteurs et transformateurs : seulement les commandes où ils sont vendeurs
    query.$or = [
      { seller: req.user._id },
      { 'segments.seller': req.user._id },
      { 'items.seller': req.user._id },
      { 'items.productSnapshot.producer': req.user._id },
      { 'items.productSnapshot.transformer': req.user._id },
      { 'items.productSnapshot.restaurateur': req.user._id }
    ];
  } else if (req.user.userType === 'transporter') {
    query['delivery.transporter'] = req.user._id;
  }

  // Filtres optionnels
  if (req.query.status) query.status = req.query.status;
  if (req.query.dateFrom) {
    query.createdAt = { $gte: new Date(req.query.dateFrom) };
  }
  if (req.query.dateTo) {
    query.createdAt = { ...query.createdAt, $lte: new Date(req.query.dateTo) };
  }

  const orders = await Order.find(query)
    .populate('buyer', 'firstName lastName email')
    .populate('seller', 'farmName companyName firstName lastName')
    .populate({
      path: 'segments.seller',
      select: 'farmName companyName firstName lastName email phone userType'
    })
    .populate('items.product', 'name images')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

for (const order of orders) {
  if (ensureSegmentsForOrder(order)) {
    await order.save();
  }
}

  const total = await Order.countDocuments(query);

  const isSellerView = ['producer', 'transformer', 'restaurateur'].includes(req.user.userType);
  const formattedOrders = isSellerView
    ? orders
        .map(order => formatOrderForSeller(order, req.user._id))
        .filter(order => order.items && order.items.length > 0)
    : orders.map(order => order.toObject({ virtuals: true }));

  res.status(200).json({
    status: 'success',
    results: formattedOrders.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      orders: formattedOrders
    }
  });
});

// Obtenir une commande spécifique
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'firstName lastName email phone')
    .populate('seller', 'farmName companyName firstName lastName email phone')
    .populate({
      path: 'segments.seller',
      select: 'farmName companyName firstName lastName email phone userType'
    })
    .populate('items.product', 'name images category')
    .populate('delivery.transporter', 'companyName firstName lastName phone');

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

const segmentsCreated = ensureSegmentsForOrder(order);
if (segmentsCreated) {
  await order.save();
}

  // Vérifier que l'utilisateur a accès à cette commande
  const buyerId = order.buyer?._id?.toString() || order.buyer?.toString() || (typeof order.buyer === 'object' ? order.buyer.toString() : order.buyer);
  const sellerId = order.seller?._id?.toString() || order.seller?.toString() || (typeof order.seller === 'object' ? order.seller.toString() : order.seller);
  const transporterId = order.delivery?.transporter?._id?.toString() || order.delivery?.transporter?.toString();
  const userId = req.user._id.toString();

  const sellerItemsMatch = order.items?.some(item => {
    const itemSeller = item.seller?.toString?.() || item.seller?._id?.toString();
    const producerId = item.productSnapshot?.producer?.toString?.() || item.productSnapshot?.producer?._id?.toString();
    const transformerId = item.productSnapshot?.transformer?.toString?.() || item.productSnapshot?.transformer?._id?.toString();
    const restaurateurId = item.productSnapshot?.restaurateur?.toString?.() || item.productSnapshot?.restaurateur?._id?.toString();
    return [itemSeller, producerId, transformerId, restaurateurId].includes(userId);
  });

  const hasAccess = 
    buyerId === userId ||
    sellerId === userId ||
    sellerItemsMatch ||
    (transporterId && transporterId === userId) ||
    req.user.role === 'admin';

  if (!hasAccess) {
    return next(new AppError('Accès non autorisé à cette commande', 403));
  }

  const isSellerView = ['producer', 'transformer', 'restaurateur'].includes(req.user.userType);
  const orderData = isSellerView ? formatOrderForSeller(order, req.user._id) : order.toObject({ virtuals: true });

  res.status(200).json({
    status: 'success',
    data: {
      order: orderData
    }
  });
});

// Mettre à jour le statut d'une commande
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, reason, note } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  const sellerIds = new Set();
  if (order.seller) sellerIds.add(order.seller.toString());
  (order.items || []).forEach(item => {
    if (item.seller) {
      sellerIds.add(item.seller.toString());
    }
  });

  // Vérifier les permissions
  const buyerId = order.buyer?.toString?.() || order.buyer?._id?.toString?.();
  const canUpdate =
    sellerIds.has(req.user._id.toString()) ||
    (order.delivery.transporter && order.delivery.transporter.toString() === req.user._id.toString()) ||
    req.user.role === 'admin' ||
    (buyerId && buyerId === req.user._id.toString());

  if (!canUpdate) {
    return next(new AppError('Vous n\'avez pas le droit de modifier cette commande', 403));
  }

  // Vérifier si le statut demandé est différent du statut actuel de la commande
  // (pour éviter les transitions inutiles, mais permettre les mises à jour d'items individuels)
  // Note: Cette vérification ne bloque pas si on met à jour des items spécifiques
  const currentOrderStatus = order.status || 'pending';
  if (currentOrderStatus === status && !req.body.itemIds && !req.body.itemId) {
    // Si aucun item spécifique n'est ciblé et que le statut est déjà le même, retourner succès sans modification
    return res.status(200).json({
      status: 'success',
      message: 'Le statut de la commande est déjà à ce niveau',
      data: {
        order
      }
    });
  }

  // Valider la transition de statut
const segmentCreated = ensureSegmentsForOrder(order);
if (segmentCreated) {
  await order.save();
}

const resolveSegmentsForUpdate = () => {
  // Si un segment explicite est fourni
  if (req.body.segmentId) {
    const segment = order.segments.id(req.body.segmentId);
    if (!segment) {
      throw new AppError('Segment de commande introuvable', 404);
    }
    return [segment];
  }

  const sellerTypes = ['producer', 'transformer', 'restaurateur'];

  if (sellerTypes.includes(req.user.userType)) {
    const segment = order.segments.find(seg =>
      seg.seller && seg.seller.toString() === req.user._id.toString()
    );
    if (!segment) {
      throw new AppError('Vous n\'avez pas de segment associé à cette commande', 403);
    }
    return [segment];
  }

  // Pour admin, transporteur, acheteur : appliquer à tous les segments pour rester cohérent
  return order.segments;
};

let targetSegments;
try {
  targetSegments = resolveSegmentsForUpdate();
} catch (error) {
  return next(error);
}

const rawItemIds = Array.isArray(req.body.itemIds)
  ? req.body.itemIds
  : req.body.itemId
    ? [req.body.itemId]
    : [];
const itemIdSet = new Set(rawItemIds.map((id) => id.toString()));
const isItemScoped = itemIdSet.size > 0;
const baseItemsById = new Map();
(order.items || []).forEach((orderItem) => {
  if (orderItem && orderItem._id) {
    baseItemsById.set(orderItem._id.toString(), orderItem);
  }
});

const itemsEquivalent = (segmentItem, baseItem) => {
  if (!segmentItem || !baseItem) {
    return false;
  }

  const productMatches =
    segmentItem.product &&
    baseItem.product &&
    segmentItem.product.toString() === baseItem.product.toString();

  const sellerMatches =
    (!segmentItem.seller || !baseItem.seller) ||
    (segmentItem.seller.toString() === baseItem.seller.toString());

  const quantityMatches =
    Number(segmentItem.quantity) === Number(baseItem.quantity);

  const unitPriceMatches =
    Number(segmentItem.unitPrice) === Number(baseItem.unitPrice);

  const variantMatches =
    (!segmentItem.variant && !baseItem.variant) ||
    (segmentItem.variant && baseItem.variant && segmentItem.variant.toString() === baseItem.variant.toString());

  return productMatches && sellerMatches && quantityMatches && unitPriceMatches && variantMatches;
};

const findBaseItemForSegmentItem = (segmentItem) => {
  if (!segmentItem) {
    return null;
  }

  if (segmentItem._id && baseItemsById.has(segmentItem._id.toString())) {
    return baseItemsById.get(segmentItem._id.toString());
  }

  for (const baseItem of baseItemsById.values()) {
    if (itemsEquivalent(segmentItem, baseItem)) {
      return baseItem;
    }
  }

  return null;
};

const updateItemStatus = (item, shouldCount = true, expectedBefore = null, expectedAfter = null) => {
  if (!item) {
    return false;
  }

  const currentItemStatus = item.status || 'pending';
  if (expectedBefore && currentItemStatus !== expectedBefore) {
    return false;
  }
  const allowedItemTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready-for-pickup', 'cancelled'],
    'ready-for-pickup': ['in-transit', 'cancelled'],
    'in-transit': ['delivered', 'cancelled'],
    delivered: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
    rejected: [],
    refunded: [],
    disputed: []
  };

  if (currentItemStatus === status) {
    return false;
  }

  const allowedTargets = allowedItemTransitions[currentItemStatus] || [];
  if (!allowedTargets.includes(status)) {
    throw new AppError(`Transition d'article invalide: ${currentItemStatus} -> ${status}`, 400);
  }

  item.status = status;
  if (expectedAfter && item.status !== expectedAfter) {
    return false;
  }
  item.statusHistory = item.statusHistory || [];
  item.statusHistory.push({
    status,
    timestamp: now,
    updatedBy: req.user._id,
    reason,
    note
  });

  if (shouldCount) {
    itemUpdatesCount += 1;
  }

  return true;
};

const now = new Date();
const segmentsToUpdate = [];
const segmentsTouchedByItems = new Set();
let itemMatchedCount = 0;
let itemUpdatesCount = 0;

if (isItemScoped) {
  for (const segment of targetSegments) {
    const directMatches = segment.items.filter((item) =>
      item && item._id && itemIdSet.has(item._id.toString())
    );

    const fallbackMatches = new Map();
    const usedSegmentItems = new Set();
    if (directMatches.length === 0) {
      for (const itemId of itemIdSet) {
        const baseItem = baseItemsById.get(itemId);
        if (!baseItem) {
          continue;
        }
        const candidate = segment.items.find((segmentItem) => {
          if (usedSegmentItems.has(segmentItem)) {
            return false;
          }
          if (segmentItem && segmentItem._id && segmentItem._id.toString() === itemId) {
            return true;
          }
          return itemsEquivalent(segmentItem, baseItem);
        });
        if (candidate) {
          fallbackMatches.set(itemId, candidate);
          usedSegmentItems.add(candidate);
        }
      }
    }

    const itemsToProcess = directMatches.length > 0 ? directMatches : Array.from(fallbackMatches.values());

    if (itemsToProcess.length === 0) {
      continue;
    }

    segmentsTouchedByItems.add(segment._id.toString());

    itemsToProcess.forEach((item) => {
      itemMatchedCount += 1;

      const currentItemStatus = item.status || 'pending';
      
      // Vérifier si le statut est déjà le même (éviter les transitions inutiles)
      if (currentItemStatus === status) {
        // Ne pas lever d'erreur, simplement ignorer cette transition
        return;
      }
      
      const allowedItemTransitions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['preparing', 'cancelled'],
        preparing: ['ready-for-pickup', 'cancelled'],
        'ready-for-pickup': ['in-transit', 'cancelled'],
        'in-transit': ['delivered', 'cancelled'],
        delivered: ['completed', 'cancelled'],
        completed: [],
        cancelled: [],
        rejected: [],
        refunded: [],
        disputed: []
      };
      const allowedTargets = allowedItemTransitions[currentItemStatus] || [];
      if (!allowedTargets.includes(status)) {
        throw new AppError(`Transition d'article invalide: ${currentItemStatus} -> ${status}`, 400);
      }

      const updatedSegmentItem = updateItemStatus(item, true);
      if (updatedSegmentItem) {
        const baseItem = findBaseItemForSegmentItem(item);
        if (baseItem && baseItem !== item) {
      updateItemStatus(baseItem, false, segment.status);
        }
      }
    });
  }

  if (itemMatchedCount === 0) {
    return next(new AppError('Aucun article correspondant trouvé pour cette commande', 404));
  }

if (['confirmed', 'preparing', 'ready-for-pickup', 'in-transit', 'delivered', 'completed', 'cancelled'].includes(status)) {
    for (const segment of targetSegments) {
      if (!segmentsTouchedByItems.has(segment._id.toString())) {
        continue;
      }

    // Vérifier si le segment a déjà le statut demandé
    const currentSegmentStatus = segment.status || 'pending';
    if (currentSegmentStatus === status) {
      continue;
    }
    
    const segmentAllowed = () => {
      const segmentAllowedTransitions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['preparing', 'cancelled'],
        preparing: ['ready-for-pickup', 'cancelled'],
        'ready-for-pickup': ['in-transit', 'cancelled'],
        'in-transit': ['delivered', 'cancelled'],
        delivered: ['completed', 'cancelled'],
        completed: [],
        cancelled: []
      };
      return (segmentAllowedTransitions[currentSegmentStatus] || []).includes(status);
    };

    if (!segmentAllowed()) {
      continue;
    }

    const allItemsHaveStatus = segment.items.every(
      (segmentItem) => (segmentItem.status || 'pending') === status
    );

      if (allItemsHaveStatus && segment.status !== status) {
        segmentsToUpdate.push(segment);
      }
    }
  }
} else {
  for (const segment of targetSegments) {
    const currentStatus = segment.status || order.status;
    if (currentStatus === status) {
      continue;
    }
    const validTransitions = getValidStatusTransitions(currentStatus, req.user.userType);
    if (!validTransitions.includes(status)) {
      return next(new AppError(`Transition de statut invalide: ${currentStatus} -> ${status}`, 400));
    }
    segmentsToUpdate.push(segment);
  }

  if (segmentsToUpdate.length === 0) {
    return res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  }
}

if (itemUpdatesCount > 0) {
  order.markModified('items');
}

// Aucun changement requis (toutes les cibles étaient déjà dans l'état souhaité)
if (segmentsToUpdate.length === 0 && itemUpdatesCount === 0) {
  return res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
}

let segmentStatusChanged = false;

for (const segment of segmentsToUpdate) {
  if (segment.status === status) {
    continue;
  }

  const previousSegmentStatus = segment.status || 'pending';
  segment.status = status;
  segment.history = segment.history || [];
  segment.history.push({
    status,
    timestamp: now,
    updatedBy: req.user._id,
    reason,
    note
  });
  segmentStatusChanged = true;

  const segmentItems = segment.items || [];
  segmentItems.forEach((segmentItem) => {
    const updated = updateItemStatus(segmentItem, true, previousSegmentStatus);
    if (updated) {
      const baseItem = findBaseItemForSegmentItem(segmentItem);
      if (baseItem && baseItem !== segmentItem) {
        updateItemStatus(baseItem, false, previousSegmentStatus);
      }
    }
  });
}

const previousOrderStatus = order.status;
let orderStatusChanged = false;

if (segmentStatusChanged) {
  const newAggregatedStatus = updateOrderStatusFromSegments(order, order.status);
  if (newAggregatedStatus !== previousOrderStatus) {
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: newAggregatedStatus,
      timestamp: now,
      updatedBy: req.user._id,
      reason,
      note
    });
    orderStatusChanged = true;
  }
}

if (itemUpdatesCount > 0 || segmentStatusChanged || orderStatusChanged) {
  order.modifiedBy = req.user._id;
  await order.save();
}

if (segmentStatusChanged) {
  // Envoyer notifications uniquement lorsqu'un statut de segment change
  await sendStatusNotifications(order, status);
}

res.status(200).json({
  status: 'success',
  data: {
    order
  }
});
});

// Annuler une commande
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  // Vérifier que la commande peut être annulée
  if (!order.canBeCancelled) {
    return next(new AppError('Cette commande ne peut plus être annulée', 400));
  }

  // Vérifier les permissions
  const sellerIds = new Set();
  if (order.seller) sellerIds.add(order.seller.toString());
  (order.items || []).forEach(item => {
    if (item.seller) sellerIds.add(item.seller.toString());
  });

  const canCancel =
    order.buyer.toString() === req.user._id.toString() ||
    sellerIds.has(req.user._id.toString()) ||
    req.user.role === 'admin';

  if (!canCancel) {
    return next(new AppError('Vous n\'avez pas le droit d\'annuler cette commande', 403));
  }

  // Libérer le stock
  await order.releaseStock();

const segmentsCreated = ensureSegmentsForOrder(order);
if (segmentsCreated) {
  await order.save();
}

const now = new Date();

for (const segment of order.segments || []) {
  segment.status = 'cancelled';
  segment.history = segment.history || [];
  segment.history.push({
    status: 'cancelled',
    timestamp: now,
    updatedBy: req.user._id,
    reason
  });
}

order.statusHistory = order.statusHistory || [];
order.statusHistory.push({
  status: 'cancelled',
  timestamp: now,
  updatedBy: req.user._id,
  reason
});

order.modifiedBy = req.user._id;
updateOrderStatusFromSegments(order, 'cancelled');

await order.save();

  // Traiter le remboursement si paiement effectué
  if (order.payment.status === 'completed') {
    const Payment = require('../models/Payment');
    const payment = await Payment.findOne({ order: order._id });
    if (payment) {
      await payment.createRefund(payment.amount, 'order_cancelled');
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      order
    }
  });
});

// Suivi d'une commande
exports.trackOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('delivery.transporter', 'companyName phone')
    .select('orderNumber status delivery statusHistory');

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  // Vérifier l'accès
  const sellerIds = new Set();
  if (order.seller) sellerIds.add(order.seller.toString());
  (order.items || []).forEach(item => {
    if (item.seller) sellerIds.add(item.seller.toString());
  });

  // Vérifier l'accès
  const hasAccess =
    order.buyer.toString() === req.user._id.toString() ||
    sellerIds.has(req.user._id.toString()) ||
    (order.delivery.transporter && order.delivery.transporter._id.toString() === req.user._id.toString());

  if (!hasAccess) {
    return next(new AppError('Accès non autorisé', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tracking: {
        orderNumber: order.orderNumber,
        status: order.status,
        estimatedDelivery: order.estimatedDelivery,
        timeline: order.delivery.timeline,
        transporter: order.delivery.transporter,
        trackingNumber: order.delivery.trackingNumber
      }
    }
  });
});

// ROUTES ADMIN

// Obtenir toutes les commandes (admin)
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const queryObj = {};
  
  // Filtres
  if (req.query.status) queryObj.status = req.query.status;
  if (req.query.seller) queryObj.seller = req.query.seller;
  if (req.query.buyer) queryObj.buyer = req.query.buyer;
  if (req.query.dateFrom) {
    queryObj.createdAt = { $gte: new Date(req.query.dateFrom) };
  }
  if (req.query.dateTo) {
    queryObj.createdAt = { ...queryObj.createdAt, $lte: new Date(req.query.dateTo) };
  }

  const orders = await Order.find(queryObj)
    .populate('buyer', 'firstName lastName email userType')
    .populate('seller', 'farmName companyName firstName lastName userType')
    .populate({
      path: 'segments.seller',
      select: 'farmName companyName firstName lastName email phone userType'
    })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

for (const order of orders) {
  if (ensureSegmentsForOrder(order)) {
    await order.save();
  }
}

  const total = await Order.countDocuments(queryObj);

  // Statistiques rapides
  const stats = await Order.aggregate([
    { $match: queryObj },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        totalOrders: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: orders.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats: stats[0] || {},
    data: {
      orders
    }
  });
});

// Statistiques des commandes
exports.getOrderStats = catchAsync(async (req, res, next) => {
  const { period = '30d', groupBy = 'day' } = req.query;
  
  const periodDays = parseInt(period.replace('d', ''));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Groupement par période
  let groupFormat;
  switch (groupBy) {
    case 'hour':
      groupFormat = { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
        hour: { $hour: '$createdAt' }
      };
      break;
    case 'day':
      groupFormat = { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      break;
    case 'week':
      groupFormat = { 
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
      break;
    case 'month':
      groupFormat = { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      break;
    default:
      groupFormat = { 
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
  }

  const stats = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: groupFormat,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
  ]);

  // Statistiques par statut
  const statusStats = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$total' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Top vendeurs
  const topSellers = await Order.aggregate([
    { 
      $match: { 
        createdAt: { $gte: startDate },
        status: 'completed'
      } 
    },
    {
      $group: {
        _id: '$seller',
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'seller'
      }
    },
    { $unwind: '$seller' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      timeline: stats,
      statusBreakdown: statusStats,
      topSellers,
      period,
      groupBy
    }
  });
});

// FONCTIONS UTILITAIRES

// Calculer les frais de livraison
function calculateDeliveryFee(items, deliveryAddress, sellerLocations = [], deliveryMethod = 'standard-delivery') {
  const method = deliveryMethod || 'standard-delivery';

  const toAmount = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  };

  const methodLabels = {
    pickup: 'retrait sur place',
    'standard-delivery': 'livraison standard',
    'express-delivery': 'livraison express',
    'same-day': 'livraison jour même',
    'scheduled': 'livraison programmée'
  };

  const localFees = {
    pickup: toAmount(process.env.DELIVERY_FEE_PICKUP_LOCAL, 0),
    'standard-delivery': toAmount(process.env.DELIVERY_FEE_STANDARD_LOCAL, 2000),
    'express-delivery': toAmount(process.env.DELIVERY_FEE_EXPRESS_LOCAL, 5000),
    'same-day': toAmount(process.env.DELIVERY_FEE_SAME_DAY_LOCAL, 7000),
    'scheduled': toAmount(process.env.DELIVERY_FEE_SCHEDULED_LOCAL, 3000)
  };

  const localFee = localFees[method] ?? localFees['standard-delivery'];
  const methodKey = method.replace(/-/g, '_').toUpperCase();

  const intercityBaseDefault = toAmount(process.env.DELIVERY_FEE_INTERCITY_BASE, localFee);
  const intercityMethodBase = toAmount(process.env[`DELIVERY_FEE_INTERCITY_${methodKey}`], intercityBaseDefault);
  const perKm = toAmount(process.env.DELIVERY_FEE_PER_KM, 0);
  const internationalBaseDefault = toAmount(process.env.DELIVERY_FEE_INTERNATIONAL_BASE, intercityBaseDefault + 3000);
  const internationalMethodBase = toAmount(process.env[`DELIVERY_FEE_INTERNATIONAL_${methodKey}`], internationalBaseDefault);

  const result = {
    amount: localFee,
    scope: 'local',
    method,
    reason: `Livraison locale (${methodLabels[method] || method})`
  };

  if (!deliveryAddress || !Array.isArray(sellerLocations) || sellerLocations.length === 0) {
    result.reason = 'Adresse ou vendeurs manquants : application du forfait local.';
    return result;
  }

  const allSameCity = sellerLocations.every((seller) => isSameCity(seller, deliveryAddress));
  if (allSameCity) {
    result.amount = localFee;
    result.scope = 'local';
    result.reason = `Tous les vendeurs et l'adresse de livraison sont dans la même ville (${methodLabels[method] || method}).`;
    return result;
  }

  const allSameCountry = sellerLocations.every((seller) => isSameCountry(seller, deliveryAddress));
  if (allSameCountry) {
    const maxDistance = computeMaxDistanceKm(sellerLocations, deliveryAddress);
    const variableFee = maxDistance > 0 && perKm > 0 ? perKm * maxDistance : 0;
    result.amount = Math.round(intercityMethodBase + variableFee);
    result.scope = 'domestic';
    if (maxDistance > 0 && perKm > 0) {
      result.reason = `Livraison inter-ville (${methodLabels[method] || method}) : distance maximale estimée ${maxDistance.toFixed(1)} km.`;
    } else {
      result.reason = `Livraison inter-ville (${methodLabels[method] || method}) : application du forfait national.`;
    }
    return result;
  }

  result.amount = Math.round(internationalMethodBase);
  result.scope = 'international';
  result.reason = `Livraison internationale (${methodLabels[method] || method}) : au moins un vendeur se trouve dans un autre pays.`;
  return result;
}

function normalizeString(value) {
  return (value || '').toString().trim().toLowerCase();
}

function removeDiacritics(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeCountry(value) {
  const str = normalizeString(value);
  if (!str) return null;

  const map = {
    'cm': 'cm',
    'cameroun': 'cm',
    'cameroon': 'cm',
    'sn': 'sn',
    'sénégal': 'sn',
    'senegal': 'sn',
    'ci': 'ci',
    "côte d'ivoire": 'ci',
    'cote d\'ivoire': 'ci',
    'cote-divoire': 'ci',
    'bf': 'bf',
    'burkina faso': 'bf',
    'ng': 'ng',
    'nigeria': 'ng',
    'gh': 'gh',
    'ghana': 'gh'
  };

  return map[str] || str;
}

function normalizeCity(value) {
  const str = normalizeString(value);
  if (!str) return null;
  return removeDiacritics(str);
}

function isSameCity(seller, deliveryAddress) {
  const sellerCountry = normalizeCountry(seller?.country);
  const deliveryCountry = normalizeCountry(deliveryAddress?.country);

  if (!sellerCountry || !deliveryCountry) {
    return true;
  }

  if (sellerCountry !== deliveryCountry) {
    return false;
  }

  const sellerCity = normalizeCity(seller?.city || seller?.region);
  const deliveryCity = normalizeCity(deliveryAddress?.city);

  if (!sellerCity || !deliveryCity) {
    return true;
  }

  return sellerCity === deliveryCity;
}

function isSameCountry(seller, deliveryAddress) {
  const sellerCountry = normalizeCountry(seller?.country);
  const deliveryCountry = normalizeCountry(deliveryAddress?.country);

  if (!sellerCountry || !deliveryCountry) {
    return true;
  }

  return sellerCountry === deliveryCountry;
}

function computeMaxDistanceKm(sellerLocations, deliveryAddress) {
  const destinationCoords = deliveryAddress?.coordinates;
  if (!destinationCoords?.latitude || !destinationCoords?.longitude) {
    return 0;
  }

  let maxDistance = 0;

  for (const seller of sellerLocations) {
    const coords = seller?.coordinates;
    if (!coords?.latitude || !coords?.longitude) {
      continue;
    }

    const distance = haversineDistance(
      coords.latitude,
      coords.longitude,
      destinationCoords.latitude,
      destinationCoords.longitude
    );

    if (distance > maxDistance) {
      maxDistance = distance;
    }
  }

  return maxDistance;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Rayon de la terre en km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculer la date de livraison estimée
function calculateEstimatedDelivery(deliveryMethod) {
  const now = new Date();
  const deliveryDays = {
    'same-day': 0,
    'express-delivery': 1,
    'standard-delivery': 3,
    'scheduled': 7,
    'pickup': 0
  };

  const days = deliveryDays[deliveryMethod] || 3;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

function formatOrderForSeller(orderDoc, sellerId) {
  const orderObj = orderDoc.toObject({ virtuals: true });
  const sellerIdStr = sellerId?.toString?.();

  const sellerSegment = (orderDoc.segments || []).find((segment) => {
    const rawSeller = segment.seller;
    const segmentSellerId =
      rawSeller?._id?.toString?.() ||
      (typeof rawSeller?.toString === 'function' ? rawSeller.toString() : null);
    return segmentSellerId && segmentSellerId === sellerIdStr;
  });

  const matchesSeller = (item) => {
    const directSeller =
      item.seller?._id?.toString?.() ||
      item.seller?.toString?.();
    const producerId =
      item.productSnapshot?.producer?._id?.toString?.() ||
      item.productSnapshot?.producer?.toString?.();
    const transformerId =
      item.productSnapshot?.transformer?._id?.toString?.() ||
      item.productSnapshot?.transformer?.toString?.();
    const restaurateurId =
      item.productSnapshot?.restaurateur?._id?.toString?.() ||
      item.productSnapshot?.restaurateur?.toString?.();

    return (
      (directSeller && directSeller === sellerIdStr) ||
      (producerId && producerId === sellerIdStr) ||
      (transformerId && transformerId === sellerIdStr) ||
      (restaurateurId && restaurateurId === sellerIdStr)
    );
  };

  const segmentItems = sellerSegment
    ? ((typeof sellerSegment.toObject === 'function' ? sellerSegment.toObject() : sellerSegment).items || []).map((item) =>
        typeof item.toObject === 'function' ? item.toObject() : item
      )
    : null;

  const sellerItemsSource = segmentItems || (orderObj.items || []).filter(matchesSeller);
  const sellerItems = sellerItemsSource.map((item) =>
    typeof item.toObject === 'function' ? item.toObject() : item
  );
  const sellerItemStatuses = sellerItems.map((item) => item.status || 'pending');

  const STATUS_ORDER = [
    'pending',
    'confirmed',
    'preparing',
    'ready-for-pickup',
    'in-transit',
    'delivered',
    'completed',
    'cancelled',
    'refunded',
    'disputed'
  ];
  const getStatusPriority = (status) => {
    const idx = STATUS_ORDER.indexOf(status);
    return idx === -1 ? STATUS_ORDER.length : idx;
  };
  const derivedStatus = sellerItemStatuses.length
    ? sellerItemStatuses.reduce((acc, status) =>
        getStatusPriority(status) < getStatusPriority(acc) ? status : acc
      , sellerItemStatuses[0])
    : orderObj.status;
  const sellerSubtotal = sellerItems.reduce((sum, item) => {
    const unitPrice = Number(item.unitPrice) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + unitPrice * quantity;
  }, 0);

  orderObj.originalTotals = {
    subtotal: orderObj.subtotal,
    deliveryFee: orderObj.deliveryFee,
    taxes: orderObj.taxes,
    discount: orderObj.discount,
    total: orderObj.total,
    deliveryFeeDetail: orderObj.deliveryFeeDetail || orderObj.delivery?.feeDetail || null
  };

  orderObj.items = sellerItems;
  orderObj.subtotal = sellerSubtotal;
  orderObj.deliveryFee = 0;
  orderObj.taxes = 0;
  orderObj.discount = 0;
  orderObj.total = sellerSubtotal;
  orderObj.deliveryFeeDetail = null;
  orderObj.isSellerView = true;
  if (orderObj.delivery) {
    orderObj.delivery.deliveryFee = 0;
    orderObj.delivery.feeDetail = null;
  }
  orderObj.role = 'seller';

  if (sellerSegment) {
    const segmentObj = typeof sellerSegment.toObject === 'function'
      ? sellerSegment.toObject()
      : sellerSegment;

    orderObj.status = segmentObj.status;
    orderObj.segment = {
      id: segmentObj._id?.toString?.() || segmentObj._id,
      status: segmentObj.status,
      subtotal: segmentObj.subtotal,
      deliveryFee: segmentObj.deliveryFee,
      discount: segmentObj.discount,
      taxes: segmentObj.taxes,
      total: segmentObj.total,
      history: segmentObj.history || [],
      items: sellerItems
    };

    if (segmentObj.seller) {
      const sellerData = typeof segmentObj.seller?.toObject === 'function'
        ? segmentObj.seller.toObject()
        : segmentObj.seller;
      orderObj.segment.seller = sellerData;
    }
  } else {
    orderObj.status = derivedStatus;
    orderObj.segment = {
      id: null,
      status: derivedStatus,
      items: sellerItems
    };
  }

  return orderObj;
}

// Obtenir les transitions de statut valides
function getValidStatusTransitions(currentStatus, userType) {
  const transitions = {
    pending: {
      producer: ['confirmed', 'cancelled'],
      transformer: ['confirmed', 'cancelled'],
      restaurateur: ['confirmed', 'cancelled'],
      consumer: ['cancelled'],
      admin: ['confirmed', 'cancelled']
    },
    confirmed: {
      producer: ['preparing', 'cancelled'],
      transformer: ['preparing', 'cancelled'],
      restaurateur: ['preparing', 'cancelled'],
      admin: ['preparing', 'cancelled']
    },
    preparing: {
      producer: ['ready-for-pickup', 'cancelled'],
      transformer: ['ready-for-pickup', 'cancelled'],
      restaurateur: ['ready-for-pickup', 'cancelled'],
      admin: ['ready-for-pickup', 'cancelled']
    },
    'ready-for-pickup': {
      transporter: ['in-transit'],
      producer: ['cancelled'],
      transformer: ['cancelled'],
      restaurateur: ['cancelled'],
      admin: ['in-transit', 'cancelled']
    },
    'in-transit': {
      transporter: ['cancelled'],
      producer: ['cancelled'],
      transformer: ['cancelled'],
      restaurateur: ['cancelled'],
      admin: ['delivered', 'cancelled']
    },
    delivered: {
      consumer: ['completed'],
      restaurateur: ['completed'],
      admin: ['completed']
    },
    completed: {
      admin: []
    },
    cancelled: {
      admin: []
    },
    refunded: {
      admin: []
    },
    disputed: {
      admin: []
    }
  };

  return transitions[currentStatus]?.[userType] || [];
}

// Envoyer les notifications selon le statut à tous les acteurs concernés
async function sendStatusNotifications(order, newStatus) {
  const User = mongoose.model('User');
  // Notifications pour l'acheteur
  const buyerNotifications = {
    confirmed: {
      type: 'order_confirmed',
      category: 'order',
      title: 'Commande confirmée',
      message: `Votre commande ${order.orderNumber} a été confirmée par le vendeur`
    },
    preparing: {
      type: 'order_preparing',
      category: 'order',
      title: 'Commande en préparation',
      message: `Votre commande ${order.orderNumber} est en cours de préparation`
    },
    'ready-for-pickup': {
      type: 'order_ready_for_pickup',
      category: 'order',
      title: 'Commande prête',
      message: `Votre commande ${order.orderNumber} est prête pour la collecte`
    },
    'in-transit': {
      type: 'order_in_transit',
      category: 'order',
      title: 'Commande en transit',
      message: `Votre commande ${order.orderNumber} est en route`
    },
    delivered: {
      type: 'order_delivered',
      category: 'order',
      title: 'Commande livrée',
      message: `Votre commande ${order.orderNumber} a été livrée`
    },
    completed: {
      type: 'order_completed',
      category: 'order',
      title: 'Commande terminée',
      message: `Votre commande ${order.orderNumber} est terminée. Merci pour votre achat !`
    },
    cancelled: {
      type: 'order_cancelled',
      category: 'order',
      title: 'Commande annulée',
      message: `Votre commande ${order.orderNumber} a été annulée`
    },
    refunded: {
      type: 'order_refunded',
      category: 'order',
      title: 'Commande remboursée',
      message: `Votre commande ${order.orderNumber} a été remboursée`
    },
    disputed: {
      type: 'order_disputed',
      category: 'order',
      title: 'Commande en litige',
      message: `Un litige a été ouvert pour votre commande ${order.orderNumber}`
    }
  };

  // Notifications pour les vendeurs
  const sellerNotifications = {
    confirmed: {
      type: 'order_confirmed_seller',
      category: 'order',
      title: 'Commande confirmée',
      message: `Vous avez confirmé la commande ${order.orderNumber}`
    },
    preparing: {
      type: 'order_preparing_seller',
      category: 'order',
      title: 'Commande en préparation',
      message: `La commande ${order.orderNumber} est maintenant en préparation`
    },
    'ready-for-pickup': {
      type: 'order_ready_for_pickup_seller',
      category: 'order',
      title: 'Commande prête pour collecte',
      message: `La commande ${order.orderNumber} est prête pour la collecte par le transporteur`
    },
    'in-transit': {
      type: 'order_in_transit_seller',
      category: 'order',
      title: 'Commande en transit',
      message: `La commande ${order.orderNumber} a été prise en charge par le transporteur`
    },
    delivered: {
      type: 'order_delivered_seller',
      category: 'order',
      title: 'Commande livrée',
      message: `La commande ${order.orderNumber} a été livrée au client`
    },
    completed: {
      type: 'order_completed_seller',
      category: 'order',
      title: 'Commande terminée',
      message: `La commande ${order.orderNumber} est terminée. Paiement reçu.`
    },
    cancelled: {
      type: 'order_cancelled_seller',
      category: 'order',
      title: 'Commande annulée',
      message: `La commande ${order.orderNumber} a été annulée`
    }
  };

  // Notifications pour le transporteur
  const transporterNotifications = {
    'ready-for-pickup': {
      type: 'order_ready_for_pickup_transporter',
      category: 'order',
      title: 'Nouvelle collecte disponible',
      message: `Une commande ${order.orderNumber} est prête pour collecte`
    },
    'in-transit': {
      type: 'order_in_transit_transporter',
      category: 'order',
      title: 'Commande en transit',
      message: `Vous transportez la commande ${order.orderNumber}`
    },
    delivered: {
      type: 'order_delivered_transporter',
      category: 'order',
      title: 'Livraison effectuée',
      message: `Vous avez livré la commande ${order.orderNumber} avec succès`
    }
  };

  const getIdString = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (value._id) return value._id.toString();
    if (typeof value === 'object' && typeof value.toString === 'function') {
      return value.toString();
    }
    return null;
  };

  const sellerIds = new Set();
  const pushSellerId = (value) => {
    const id = getIdString(value);
    if (id) {
      sellerIds.add(id);
    }
  };

  pushSellerId(order.seller);

  const segmentInfoMap = new Map();
  (order.segments || []).forEach(segment => {
    const sellerKey = getIdString(segment?.seller);
    if (sellerKey) {
      pushSellerId(sellerKey);
      segmentInfoMap.set(sellerKey, {
        status: segment.status || null,
        segmentId: segment._id?.toString?.() || null
      });
    }
  });

  (order.items || []).forEach(item => {
    pushSellerId(item?.seller);
  });

  const sellerInfoCache = new Map();
  const getSellerInfo = async (sellerId) => {
    if (!sellerId) return null;
    if (sellerInfoCache.has(sellerId)) {
      return sellerInfoCache.get(sellerId);
    }

    const seller = await User.findById(sellerId).select('firstName lastName companyName farmName restaurantName businessName name userType');
    if (!seller) {
      sellerInfoCache.set(sellerId, null);
      return null;
    }

    const displayName = seller.farmName || seller.companyName || seller.restaurantName || seller.businessName || seller.name || `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || 'Vendeur';
    const info = {
      id: sellerId,
      name: displayName,
      userType: seller.userType || null
    };
    sellerInfoCache.set(sellerId, info);
    return info;
  };

  const items = Array.isArray(order.items) ? order.items : [];
  const productsDetails = [];

  for (const item of items) {
    const images = item.productSnapshot?.images || [];
    const productName = item.productSnapshot?.name || 'Produit';
    const productDescription = item.productSnapshot?.description || '';

    const sellerId = getIdString(item.seller) || getIdString(item.productSnapshot?.producer) || getIdString(item.productSnapshot?.transformer) || getIdString(item.productSnapshot?.restaurateur);
    const sellerInfo = sellerId ? await getSellerInfo(sellerId) : null;
    const segmentInfo = sellerId ? segmentInfoMap.get(sellerId) : null;
    if (segmentInfo && sellerInfo?.name) {
      segmentInfoMap.set(sellerId, {
        ...segmentInfo,
        sellerName: sellerInfo.name
      });
    }

    const productStatus = item.status || segmentInfo?.status || order.status || newStatus || 'pending';

    productsDetails.push({
      name: productName,
      description: productDescription,
      images: Array.isArray(images) ? images : [],
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      totalPrice: item.totalPrice || 0,
      status: productStatus,
      seller: sellerId ? {
        id: sellerId,
        name: sellerInfo?.name || null,
        type: sellerInfo?.userType || null
      } : null,
      segment: segmentInfo ? {
        id: segmentInfo.segmentId || null,
        status: segmentInfo.status || null,
        sellerId,
        sellerName: segmentInfo.sellerName || sellerInfo?.name || null
      } : null
    });
  }

  // Notifier l'acheteur
  const buyerNotification = buyerNotifications[newStatus];
  if (buyerNotification && order.buyer) {
    const buyerId = order.buyer._id || order.buyer;
    const buyerOrderUrl = await buildOrderUrl(buyerId, order._id);
    await Notification.createNotification({
      recipient: order.buyer,
      ...buyerNotification,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: order.total,
        currency: order.currency,
        status: newStatus,
        products: productsDetails
      },
      actions: [{
        type: 'view',
        label: 'Voir la commande',
        url: buyerOrderUrl
      }],
      channels: {
        inApp: { enabled: true },
        email: { enabled: true },
        push: { enabled: true }
      }
    });
  }

  // Récupérer les informations du client (buyer) pour les notifications vendeur
  let buyerInfo = null;
  if (order.buyer) {
    const User = mongoose.model('User');
    const buyerId = order.buyer._id || order.buyer;
    const buyer = await User.findById(buyerId).select('firstName lastName email phone');
    if (buyer) {
      buyerInfo = {
        firstName: buyer.firstName || '',
        lastName: buyer.lastName || '',
        fullName: `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim() || 'Client',
        email: buyer.email || '',
        phone: buyer.phone || ''
      };
    }
  }

  // Notifier tous les vendeurs concernés
  const sellerNotification = sellerNotifications[newStatus];
  if (sellerNotification && sellerIds.size > 0) {
    const sellerNotificationsPromises = Array.from(sellerIds).map(async (sellerId) => {
      const sellerOrderUrl = await buildOrderUrl(sellerId, order._id);
      const segmentInfo = segmentInfoMap.get(sellerId) || null;
      const sellerProducts = productsDetails.filter((product) => product.seller?.id === sellerId);
      const productsForSeller = sellerProducts.length > 0 ? sellerProducts : productsDetails;
      const sellerAmount = productsForSeller.reduce((sum, product) => sum + (Number(product.totalPrice) || 0), 0);
      return Notification.createNotification({
        recipient: sellerId,
        ...sellerNotification,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          amount: sellerAmount || order.total,
          currency: order.currency,
          status: segmentInfo?.status || newStatus,
          buyer: buyerInfo,
          segment: segmentInfo ? {
            id: segmentInfo.segmentId || null,
            status: segmentInfo.status || null,
            sellerId,
            sellerName: segmentInfo.sellerName || sellerProducts[0]?.seller?.name || null
          } : null,
          products: productsForSeller
        },
        actions: [{
          type: 'view',
          label: 'Voir la commande',
          url: sellerOrderUrl
        }],
        channels: {
          inApp: { enabled: true },
          email: { enabled: true },
          push: { enabled: true }
        }
      });
    });
    await Promise.all(sellerNotificationsPromises);
  }

  // Notifier le transporteur si applicable
  const transporterNotification = transporterNotifications[newStatus];
  if (transporterNotification && order.delivery?.transporter) {
    const transporterId = order.delivery.transporter._id || order.delivery.transporter;
    const transporterOrderUrl = await buildOrderUrl(transporterId, order._id);
    await Notification.createNotification({
      recipient: order.delivery.transporter,
      ...transporterNotification,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: newStatus
      },
      actions: [{
        type: 'view',
        label: 'Voir la commande',
        url: transporterOrderUrl
      }],
      channels: {
        inApp: { enabled: true },
        email: { enabled: true },
        push: { enabled: true }
      }
    });
  }
}

// Fonction de test pour créer une commande (TEMPORAIRE)
exports.createTestOrder = catchAsync(async (req, res, next) => {
  const Order = require('../models/Order');
  const Product = require('../models/Product');
  
  try {
    console.log('🔧 createTestOrder - User ID:', req.user._id);
    
    // Trouver un produit du producteur connecté
    const product = await Product.findOne({ producer: req.user._id });
    console.log('🔧 createTestOrder - Product found:', product);
    
    // Si pas de produit, créer une commande simple sans produit
    let orderData;
    
    if (product) {
      orderData = {
        orderNumber: `TEST-${Date.now()}`,
        buyer: req.user._id, // Temporairement, le producteur est aussi l'acheteur
        seller: req.user._id,
        items: [{
          product: product._id,
          quantity: 2,
          unitPrice: product.price || 1000,
          totalPrice: (product.price || 1000) * 2,
          productSnapshot: {
            name: toPlainText(product.name, 'Produit de test'),
            description: toPlainText(product.description, 'Description de test')
          }
        }],
        total: (product.price || 1000) * 2,
        status: 'pending',
        paymentMethod: 'cash',
        delivery: {
          method: 'standard-delivery',
          deliveryFee: 0,
          deliveryAddress: {
            firstName: 'Test',
            lastName: 'User',
            street: 'Test Street',
            city: 'Dakar',
            region: 'Dakar',
            country: 'Sénégal',
            postalCode: '00000',
            phone: '+221000000000'
          }
        }
      };
    } else {
      // Commande sans produit réel
      orderData = {
        orderNumber: `TEST-${Date.now()}`,
        buyer: req.user._id,
        seller: req.user._id,
        items: [{
          product: null, // Pas de produit réel
          quantity: 1,
          unitPrice: 1000,
          totalPrice: 1000,
          productSnapshot: {
            name: 'Produit de test',
            description: 'Commande de test sans produit réel'
          }
        }],
        total: 1000,
        status: 'pending',
        paymentMethod: 'cash',
        delivery: {
          method: 'standard-delivery',
          deliveryFee: 0,
          deliveryAddress: {
            firstName: 'Test',
            lastName: 'User',
            street: 'Test Street',
            city: 'Dakar',
            region: 'Dakar',
            country: 'Sénégal',
            postalCode: '00000',
            phone: '+221000000000'
          }
        }
      };
    }

    // Créer une commande de test
    const testOrder = new Order(orderData);

    console.log('🔧 createTestOrder - Saving order...');
    await testOrder.save();
    console.log('🔧 createTestOrder - Order saved successfully');
    
    // Populate les données
    await testOrder.populate('buyer', 'firstName lastName email');
    await testOrder.populate('seller', 'firstName lastName');
    await testOrder.populate('items.product', 'name images');

    console.log('🔧 createTestOrder - Order created successfully:', testOrder._id);

    res.status(201).json({
      status: 'success',
      message: 'Commande de test créée',
      data: { order: testOrder }
    });
  } catch (error) {
    console.error('🔧 Erreur création commande test:', error);
    console.error('🔧 Error details:', error.message);
    console.error('🔧 Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la création de la commande de test',
      error: error.message
    });
  }
});

// Exporter la fonction de notification pour utilisation dans d'autres contrôleurs
exports.sendStatusNotifications = sendStatusNotifications;

module.exports = exports;
