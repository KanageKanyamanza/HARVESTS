const Consumer = require('../models/Consumer');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// ROUTES PROTÉGÉES CONSOMMATEUR

// Obtenir mon profil
exports.getMyProfile = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      consumer,
    },
  });
});

// Mettre à jour mon profil
exports.updateMyProfile = catchAsync(async (req, res, next) => {
  const allowedFields = [
    'shoppingPreferences', 'communicationPreferences'
  ];
  
  const filteredBody = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  const consumer = await Consumer.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      consumer,
    },
  });
});

// Gestion des préférences alimentaires
exports.getDietaryPreferences = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id).select('dietaryPreferences');

  res.status(200).json({
    status: 'success',
    data: {
      dietaryPreferences: consumer.dietaryPreferences,
    },
  });
});

exports.updateDietaryPreferences = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findByIdAndUpdate(
    req.user.id,
    { dietaryPreferences: req.body.dietaryPreferences },
    { new: true, runValidators: true }
  ).select('dietaryPreferences');

  res.status(200).json({
    status: 'success',
    data: {
      dietaryPreferences: consumer.dietaryPreferences,
    },
  });
});

// Gestion des allergies
exports.getAllergies = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id).select('allergies');

  res.status(200).json({
    status: 'success',
    results: consumer.allergies.length,
    data: {
      allergies: consumer.allergies,
    },
  });
});

exports.addAllergy = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  
  consumer.allergies.push(req.body);
  await consumer.save();

  res.status(201).json({
    status: 'success',
    data: {
      allergy: consumer.allergies[consumer.allergies.length - 1],
    },
  });
});

exports.updateAllergy = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  const allergy = consumer.allergies.id(req.params.allergyId);

  if (!allergy) {
    return next(new AppError('Allergie non trouvée', 404));
  }

  Object.keys(req.body).forEach(key => {
    allergy[key] = req.body[key];
  });

  await consumer.save();

  res.status(200).json({
    status: 'success',
    data: {
      allergy,
    },
  });
});

exports.removeAllergy = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  
  consumer.allergies.pull(req.params.allergyId);
  await consumer.save();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Gestion des adresses de livraison
exports.getDeliveryAddresses = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id).select('deliveryAddresses');

  res.status(200).json({
    status: 'success',
    results: consumer.deliveryAddresses.length,
    data: {
      addresses: consumer.deliveryAddresses,
    },
  });
});

exports.addDeliveryAddress = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  
  // Si c'est la première adresse, la définir par défaut
  const isFirstAddress = !consumer.deliveryAddresses || consumer.deliveryAddresses.length === 0;
  const newAddress = {
    ...req.body,
    isDefault: req.body.isDefault || isFirstAddress
  };

  // Si c'est la nouvelle adresse par défaut, désactiver les autres
  if (newAddress.isDefault) {
    consumer.deliveryAddresses?.forEach(addr => addr.isDefault = false);
  }

  consumer.deliveryAddresses.push(newAddress);
  await consumer.save();

  res.status(201).json({
    status: 'success',
    data: {
      address: consumer.deliveryAddresses[consumer.deliveryAddresses.length - 1],
    },
  });
});

exports.updateDeliveryAddress = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  const address = consumer.deliveryAddresses.id(req.params.addressId);

  if (!address) {
    return next(new AppError('Adresse non trouvée', 404));
  }

  // Si on définit comme adresse par défaut, désactiver les autres
  if (req.body.isDefault) {
    consumer.deliveryAddresses.forEach(addr => {
      if (addr.id !== req.params.addressId) addr.isDefault = false;
    });
  }

  Object.keys(req.body).forEach(key => {
    address[key] = req.body[key];
  });

  await consumer.save();

  res.status(200).json({
    status: 'success',
    data: {
      address,
    },
  });
});

exports.removeDeliveryAddress = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  const address = consumer.deliveryAddresses.id(req.params.addressId);

  if (!address) {
    return next(new AppError('Adresse non trouvée', 404));
  }

  // Ne pas permettre la suppression si c'est la seule adresse
  if (consumer.deliveryAddresses.length === 1) {
    return next(new AppError('Vous devez avoir au moins une adresse de livraison', 400));
  }

  // Si c'était l'adresse par défaut, définir une autre comme par défaut
  if (address.isDefault && consumer.deliveryAddresses.length > 1) {
    const otherAddress = consumer.deliveryAddresses.find(addr => addr.id !== req.params.addressId);
    if (otherAddress) otherAddress.isDefault = true;
  }

  consumer.deliveryAddresses.pull(req.params.addressId);
  await consumer.save();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.setDefaultAddress = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  const address = consumer.deliveryAddresses.id(req.params.addressId);

  if (!address) {
    return next(new AppError('Adresse non trouvée', 404));
  }

  // Désactiver toutes les autres adresses par défaut
  consumer.deliveryAddresses.forEach(addr => {
    addr.isDefault = addr.id === req.params.addressId;
  });

  await consumer.save();

  res.status(200).json({
    status: 'success',
    data: {
      address,
    },
  });
});

// Gestion de la wishlist
exports.getWishlist = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id)
    .select('wishlist')
    .populate('wishlist.product', 'name price images producer');

  res.status(200).json({
    status: 'success',
    results: consumer.wishlist.length,
    data: {
      wishlist: consumer.wishlist,
    },
  });
});

exports.addToWishlist = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  
  // Vérifier si le produit n'est pas déjà dans la wishlist
  const existingItem = consumer.wishlist.find(
    item => item.product.toString() === req.body.productId
  );

  if (existingItem) {
    return next(new AppError('Ce produit est déjà dans votre liste de souhaits', 400));
  }

  consumer.wishlist.push({
    product: req.body.productId,
    notifyWhenAvailable: req.body.notifyWhenAvailable || true
  });

  await consumer.save();

  res.status(201).json({
    status: 'success',
    message: 'Produit ajouté à la liste de souhaits',
  });
});

exports.removeFromWishlist = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  
  const itemIndex = consumer.wishlist.findIndex(
    item => item.product.toString() === req.params.productId
  );

  if (itemIndex === -1) {
    return next(new AppError('Produit non trouvé dans la liste de souhaits', 404));
  }

  consumer.wishlist.splice(itemIndex, 1);
  await consumer.save();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.toggleWishlistNotifications = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  
  const item = consumer.wishlist.find(
    item => item.product.toString() === req.params.productId
  );

  if (!item) {
    return next(new AppError('Produit non trouvé dans la liste de souhaits', 404));
  }

  item.notifyWhenAvailable = !item.notifyWhenAvailable;
  await consumer.save();

  res.status(200).json({
    status: 'success',
    data: {
      notifyWhenAvailable: item.notifyWhenAvailable,
    },
  });
});

// Gestion des abonnements (livraisons récurrentes)
exports.getSubscriptions = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id)
    .select('subscriptions')
    .populate('subscriptions.product', 'name price images')
    .populate('subscriptions.producer', 'farmName address');

  res.status(200).json({
    status: 'success',
    results: consumer.subscriptions.length,
    data: {
      subscriptions: consumer.subscriptions,
    },
  });
});

exports.createSubscription = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  
  const subscriptionData = {
    ...req.body,
    nextDelivery: calculateNextDelivery(req.body.frequency)
  };

  consumer.subscriptions.push(subscriptionData);
  await consumer.save();

  res.status(201).json({
    status: 'success',
    data: {
      subscription: consumer.subscriptions[consumer.subscriptions.length - 1],
    },
  });
});

exports.getSubscription = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  const subscription = consumer.subscriptions.id(req.params.subscriptionId);

  if (!subscription) {
    return next(new AppError('Abonnement non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      subscription,
    },
  });
});

exports.updateSubscription = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  const subscription = consumer.subscriptions.id(req.params.subscriptionId);

  if (!subscription) {
    return next(new AppError('Abonnement non trouvé', 404));
  }

  Object.keys(req.body).forEach(key => {
    subscription[key] = req.body[key];
  });

  // Recalculer la prochaine livraison si la fréquence a changé
  if (req.body.frequency) {
    subscription.nextDelivery = calculateNextDelivery(req.body.frequency);
  }

  await consumer.save();

  res.status(200).json({
    status: 'success',
    data: {
      subscription,
    },
  });
});

exports.cancelSubscription = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  
  consumer.subscriptions.pull(req.params.subscriptionId);
  await consumer.save();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.pauseSubscription = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  const subscription = consumer.subscriptions.id(req.params.subscriptionId);

  if (!subscription) {
    return next(new AppError('Abonnement non trouvé', 404));
  }

  subscription.isActive = false;
  await consumer.save();

  res.status(200).json({
    status: 'success',
    message: 'Abonnement mis en pause',
  });
});

exports.resumeSubscription = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  const subscription = consumer.subscriptions.id(req.params.subscriptionId);

  if (!subscription) {
    return next(new AppError('Abonnement non trouvé', 404));
  }

  subscription.isActive = true;
  subscription.nextDelivery = calculateNextDelivery(subscription.frequency);
  await consumer.save();

  res.status(200).json({
    status: 'success',
    message: 'Abonnement repris',
  });
});

// Fonctions temporaires pour les fonctionnalités nécessitant d'autres modèles
exports.getCart = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement - Modèle Cart requis',
    data: { cart: [] },
  });
});

exports.addToCart = catchAsync(async (req, res, next) => {
  res.status(201).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement - Modèle Cart requis',
  });
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement - Modèle Cart requis',
  });
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.clearCart = catchAsync(async (req, res, next) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Commandes
const Order = require('../models/Order');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

exports.getMyOrders = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  
  const query = { buyer: req.user.id };
  if (status) {
    query.status = status;
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const orders = await Order.find(query)
    .populate('seller', 'firstName lastName email phone')
    .populate('items.product', 'name images')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: {
      orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

exports.createOrder = catchAsync(async (req, res, next) => {
  const { items, deliveryAddress, billingAddress, paymentMethod, paymentProvider, deliveryMethod, notes, useLoyaltyPoints, loyaltyPointsToUse, currency = 'XAF', source = 'web' } = req.body;

  // Valider les articles
  if (!items || items.length === 0) {
    return next(new AppError('Au moins un article est requis', 400));
  }

  // Vérifier la disponibilité et calculer les totaux
  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
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

    // Vérifier la quantité minimum
    if (item.quantity < product.minimumOrderQuantity) {
      return next(new AppError(`Quantité minimum de ${product.minimumOrderQuantity} requise pour ${product.name}`, 400));
    }

    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;

    processedItems.push({
      product: product._id,
      variant: item.variantId || undefined,
      productSnapshot: {
        name: product.name,
        description: product.description,
        images: product.images,
        producer: product.producer
      },
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      weight: product.shipping?.weight,
      specialInstructions: item.specialInstructions || ''
    });
  }

  // Calculer les frais de livraison
  const deliveryFee = deliveryMethod === 'express-delivery' ? 5000 : 2000;

  // Calculer les taxes (19.25% TVA au Cameroun)
  const taxes = Math.round(subtotal * 0.1925);

  // Appliquer les remises (points de fidélité)
  let discount = 0;
  let loyaltyPointsUsed = 0;

  if (useLoyaltyPoints && loyaltyPointsToUse > 0) {
    const consumer = await Consumer.findById(req.user.id);
    if (consumer && consumer.loyaltyProgram && loyaltyPointsToUse <= consumer.loyaltyProgram.points) {
      discount = loyaltyPointsToUse * 10; // 1 point = 10 FCFA
      loyaltyPointsUsed = loyaltyPointsToUse;
      consumer.loyaltyProgram.points -= loyaltyPointsUsed;
      await consumer.save();
    }
  }

  const total = subtotal + deliveryFee + taxes - discount;

  // Générer le numéro de commande (solution de secours)
  const generateOrderNumber = (countryCode) => {
    const countryMap = {
      'CM': 'CM', 'Cameroon': 'CM', 'cameroun': 'CM',
      'SN': 'SN', 'Senegal': 'SN', 'sénégal': 'SN', 'Sénégal': 'SN',
      'CI': 'CI', 'Côte d\'Ivoire': 'CI', 'côte d\'ivoire': 'CI',
      'GH': 'GH', 'Ghana': 'GH', 'ghana': 'GH',
      'NG': 'NG', 'Nigeria': 'NG', 'nigeria': 'NG',
      'KE': 'KE', 'Kenya': 'KE', 'kenya': 'KE',
      'BF': 'BF', 'Burkina Faso': 'BF', 'burkina faso': 'BF',
      'ML': 'ML', 'Mali': 'ML', 'mali': 'ML',
      'NE': 'NE', 'Niger': 'NE', 'niger': 'NE',
      'TD': 'TD', 'Tchad': 'TD', 'tchad': 'TD',
      'CF': 'CF', 'République centrafricaine': 'CF', 'république centrafricaine': 'CF',
      'GA': 'GA', 'Gabon': 'GA', 'gabon': 'GA',
      'CG': 'CG', 'Congo': 'CG', 'congo': 'CG',
      'CD': 'CD', 'République démocratique du Congo': 'CD', 'république démocratique du congo': 'CD',
      'AO': 'AO', 'Angola': 'AO', 'angola': 'AO',
      'ZM': 'ZM', 'Zambie': 'ZM', 'zambie': 'ZM',
      'ZW': 'ZW', 'Zimbabwe': 'ZW', 'zimbabwe': 'ZW',
      'ZA': 'ZA', 'Afrique du Sud': 'ZA', 'afrique du sud': 'ZA',
      'EG': 'EG', 'Égypte': 'EG', 'égypte': 'EG',
      'MA': 'MA', 'Maroc': 'MA', 'maroc': 'MA',
      'TN': 'TN', 'Tunisie': 'TN', 'tunisie': 'TN',
      'DZ': 'DZ', 'Algérie': 'DZ', 'algérie': 'DZ',
      'LY': 'LY', 'Libye': 'LY', 'libye': 'LY',
      'SD': 'SD', 'Soudan': 'SD', 'soudan': 'SD',
      'ET': 'ET', 'Éthiopie': 'ET', 'éthiopie': 'ET',
      'UG': 'UG', 'Ouganda': 'UG', 'ouganda': 'UG',
      'TZ': 'TZ', 'Tanzanie': 'TZ', 'tanzanie': 'TZ',
      'RW': 'RW', 'Rwanda': 'RW', 'rwanda': 'RW',
      'BI': 'BI', 'Burundi': 'BI', 'burundi': 'BI',
      'MW': 'MW', 'Malawi': 'MW', 'malawi': 'MW',
      'MZ': 'MZ', 'Mozambique': 'MZ', 'mozambique': 'MZ',
      'MG': 'MG', 'Madagascar': 'MG', 'madagascar': 'MG',
      'MU': 'MU', 'Maurice': 'MU', 'maurice': 'MU',
      'SC': 'SC', 'Seychelles': 'SC', 'seychelles': 'SC',
      'KM': 'KM', 'Comores': 'KM', 'comores': 'KM',
      'DJ': 'DJ', 'Djibouti': 'DJ', 'djibouti': 'DJ',
      'SO': 'SO', 'Somalie': 'SO', 'somalie': 'SO',
      'ER': 'ER', 'Érythrée': 'ER', 'érythrée': 'ER',
      'SS': 'SS', 'Soudan du Sud': 'SS', 'soudan du sud': 'SS'
    };
    
    if (countryCode && countryCode.length === 2 && /^[A-Z]{2}$/.test(countryCode)) {
      return countryCode;
    }
    return countryMap[countryCode] || 'CM';
  };

  const countryCode = deliveryAddress?.country || 'CM';
  const countryPrefix = generateOrderNumber(countryCode);
  const count = await Order.countDocuments();
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const countStr = count.toString().padStart(4, '0');
  const orderNumber = `H${countryPrefix}${countStr}${timestamp.substring(-4)}${random}`;

  console.log('🔢 Génération orderNumber dans contrôleur:', {
    countryCode,
    countryPrefix,
    count,
    orderNumber
  });

  // Créer la commande
  const order = await Order.create({
    orderNumber, // Ajouter explicitement le orderNumber
    buyer: req.user.id,
    seller: processedItems[0].productSnapshot.producer,
    items: processedItems,
    subtotal,
    deliveryFee,
    taxes,
    discount,
    total,
    currency,
    payment: {
      method: paymentMethod,
      provider: paymentProvider,
      amount: total,
      status: 'pending'
    },
    delivery: {
      method: deliveryMethod,
      deliveryAddress: {
        ...deliveryAddress,
        country: deliveryAddress.country || 'CM' // S'assurer que le pays est défini
      },
      estimatedDeliveryDate: calculateEstimatedDelivery(deliveryMethod)
    },
    billingAddress: billingAddress || deliveryAddress,
    buyerNotes: notes,
    loyaltyPointsUsed,
    source
  });

  // Réserver le stock
  try {
    await order.reserveStock();
  } catch (error) {
    await Order.findByIdAndDelete(order._id);
    return next(new AppError(error.message, 400));
  }

  // Calculer les points de fidélité gagnés
  if (req.user.userType === 'consumer') {
    const consumer = await Consumer.findById(req.user.id);
    if (consumer && consumer.loyaltyProgram) {
      const pointsEarned = Math.floor(total / 100); // 1 point pour 100 FCFA
      consumer.loyaltyProgram.points += pointsEarned;
      order.loyaltyPointsEarned = pointsEarned;
      await consumer.save();
    }
  }

  await order.save();

  // Envoyer notifications
  await sendOrderNotifications(order);

  res.status(201).json({
    status: 'success',
    message: 'Commande créée avec succès',
    data: {
      order: await Order.findById(order._id)
        .populate('buyer', 'firstName lastName email')
        .populate('seller', 'firstName lastName email')
    }
  });
});

exports.getMyOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    buyer: req.user.id
  })
    .populate('buyer', 'firstName lastName email phone')
    .populate('seller', 'firstName lastName email phone')
    .populate('items.product', 'name images');

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  
  const order = await Order.findOne({
    _id: req.params.orderId,
    buyer: req.user.id
  });

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    return next(new AppError('Cette commande ne peut pas être annulée', 400));
  }

  order.status = 'cancelled';
  order.cancellationReason = reason;
  order.cancelledAt = new Date();
  order.cancelledBy = req.user.id;

  // Libérer le stock réservé
  await order.releaseStock();

  await order.save();

  res.status(200).json({
    status: 'success',
    message: 'Commande annulée avec succès',
    data: { order }
  });
});

exports.trackOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    buyer: req.user.id
  })
    .populate('seller', 'firstName lastName phone')
    .populate('items.product', 'name images');

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { 
      order,
      tracking: {
        status: order.status,
        estimatedDelivery: order.delivery?.estimatedDeliveryDate,
        trackingNumber: order.trackingNumber,
        updates: order.statusUpdates || []
      }
    }
  });
});

// Fonctions utilitaires
function calculateEstimatedDelivery(deliveryMethod) {
  const now = new Date();
  const days = deliveryMethod === 'express-delivery' ? 1 : 3;
  return new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
}

async function sendOrderNotifications(order) {
  try {
    // Notification au vendeur
    await Notification.create({
      user: order.seller,
      type: 'order_received',
      title: 'Nouvelle commande reçue',
      message: `Vous avez reçu une nouvelle commande de ${order.buyer.firstName} ${order.buyer.lastName}`,
      data: { orderId: order._id }
    });

    // Notification à l'acheteur
    await Notification.create({
      user: order.buyer,
      type: 'order_confirmed',
      title: 'Commande confirmée',
      message: `Votre commande #${order.orderNumber || order._id.slice(-8)} a été confirmée`,
      data: { orderId: order._id }
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error);
  }
}

// Avis et évaluations
exports.getMyReviews = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement - Modèle Review requis',
    data: { reviews: [] },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  res.status(201).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement - Modèle Review requis',
  });
});

exports.getMyReview = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement - Modèle Review requis',
  });
});

exports.updateMyReview = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement - Modèle Review requis',
  });
});

exports.deleteMyReview = catchAsync(async (req, res, next) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Programme de fidélité
exports.getLoyaltyStatus = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id).select('loyaltyProgram');

  res.status(200).json({
    status: 'success',
    data: {
      loyalty: consumer.loyaltyProgram,
    },
  });
});

exports.redeemLoyaltyPoints = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  const { pointsToRedeem } = req.body;

  try {
    const discount = consumer.redeemLoyaltyPoints(pointsToRedeem);
    await consumer.save();

    res.status(200).json({
      status: 'success',
      data: {
        pointsRedeemed: pointsToRedeem,
        discountAmount: discount,
        remainingPoints: consumer.loyaltyProgram.points,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.getLoyaltyHistory = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement - Modèle LoyaltyTransaction requis',
    data: { history: [] },
  });
});

// Méthodes de paiement
exports.getPaymentMethods = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id).select('paymentMethods');

  res.status(200).json({
    status: 'success',
    results: consumer.paymentMethods.length,
    data: {
      paymentMethods: consumer.paymentMethods,
    },
  });
});

exports.addPaymentMethod = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  
  // Si c'est la première méthode de paiement, la définir par défaut
  const isFirstMethod = !consumer.paymentMethods || consumer.paymentMethods.length === 0;
  const newMethod = {
    ...req.body,
    isDefault: req.body.isDefault || isFirstMethod
  };

  // Si c'est la nouvelle méthode par défaut, désactiver les autres
  if (newMethod.isDefault) {
    consumer.paymentMethods?.forEach(method => method.isDefault = false);
  }

  consumer.paymentMethods.push(newMethod);
  await consumer.save();

  res.status(201).json({
    status: 'success',
    data: {
      paymentMethod: consumer.paymentMethods[consumer.paymentMethods.length - 1],
    },
  });
});

exports.updatePaymentMethod = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  const method = consumer.paymentMethods.id(req.params.methodId);

  if (!method) {
    return next(new AppError('Méthode de paiement non trouvée', 404));
  }

  Object.keys(req.body).forEach(key => {
    method[key] = req.body[key];
  });

  await consumer.save();

  res.status(200).json({
    status: 'success',
    data: {
      paymentMethod: method,
    },
  });
});

exports.removePaymentMethod = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  
  consumer.paymentMethods.pull(req.params.methodId);
  await consumer.save();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.setDefaultPaymentMethod = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  const method = consumer.paymentMethods.id(req.params.methodId);

  if (!method) {
    return next(new AppError('Méthode de paiement non trouvée', 404));
  }

  // Désactiver toutes les autres méthodes par défaut
  consumer.paymentMethods.forEach(m => {
    m.isDefault = m.id === req.params.methodId;
  });

  await consumer.save();

  res.status(200).json({
    status: 'success',
    data: {
      paymentMethod: method,
    },
  });
});

// Préférences de communication
exports.getCommunicationPreferences = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id).select('communicationPreferences');

  res.status(200).json({
    status: 'success',
    data: {
      preferences: consumer.communicationPreferences,
    },
  });
});

exports.updateCommunicationPreferences = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findByIdAndUpdate(
    req.user.id,
    { communicationPreferences: req.body },
    { new: true, runValidators: true }
  ).select('communicationPreferences');

  res.status(200).json({
    status: 'success',
    data: {
      preferences: consumer.communicationPreferences,
    },
  });
});

// Statistiques et analytics (fonctionnalités temporaires)
exports.getPurchaseHistory = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id).select('purchaseHistory');

  res.status(200).json({
    status: 'success',
    data: {
      purchaseHistory: consumer.purchaseHistory,
    },
  });
});

exports.getRecommendations = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement - Algorithme de recommandation requis',
    data: { recommendations: [] },
  });
});

exports.getFavoriteProducers = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id)
    .select('purchaseHistory.favoriteProducers')
    .populate('purchaseHistory.favoriteProducers.producer', 'farmName address salesStats');

  res.status(200).json({
    status: 'success',
    data: {
      favoriteProducers: consumer.purchaseHistory.favoriteProducers,
    },
  });
});

exports.getMyStats = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id).select('activityStats loyaltyProgram');

  res.status(200).json({
    status: 'success',
    data: {
      activityStats: consumer.activityStats,
      loyaltyStats: consumer.loyaltyProgram,
    },
  });
});

exports.getSpendingAnalytics = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement - Modèle Order requis',
    data: { analytics: {} },
  });
});

// Notifications (fonctionnalités temporaires)
exports.getNotifications = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement - Modèle Notification requis',
    data: { notifications: [] },
  });
});

exports.markNotificationsAsRead = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement - Modèle Notification requis',
  });
});

exports.markNotificationAsRead = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement - Modèle Notification requis',
  });
});

exports.deleteNotification = catchAsync(async (req, res, next) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Fonction utilitaire pour calculer la prochaine livraison
function calculateNextDelivery(frequency) {
  const now = new Date();
  let nextDelivery;

  switch (frequency) {
    case 'weekly':
      nextDelivery = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case 'bi-weekly':
      nextDelivery = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      nextDelivery = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      break;
    default:
      nextDelivery = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  return nextDelivery;
}

// Gestion des préférences d'achat
exports.getShoppingPreferences = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id)
    .select('shoppingPreferences');

  res.status(200).json({
    status: 'success',
    data: {
      shoppingPreferences: consumer.shoppingPreferences || {
        preferredDeliveryTime: 'flexible',
        maxDeliveryDistance: 25,
        budgetRange: { min: 0, max: 100000, currency: 'XAF' },
        preferredPaymentMethods: ['cash', 'mobile-money']
      }
    }
  });
});

exports.updateShoppingPreferences = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  
  consumer.shoppingPreferences = {
    ...consumer.shoppingPreferences,
    ...req.body
  };

  await consumer.save();

  res.status(200).json({
    status: 'success',
    message: 'Préférences d\'achat mises à jour avec succès',
    data: {
      shoppingPreferences: consumer.shoppingPreferences
    }
  });
});

// Gestion des préférences de notification
exports.getNotificationPreferences = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id)
    .select('notifications');

  res.status(200).json({
    status: 'success',
    data: {
      notifications: consumer.notifications || {
        email: true,
        sms: false,
        push: true
      }
    }
  });
});

exports.updateNotificationPreferences = catchAsync(async (req, res, next) => {
  const consumer = await Consumer.findById(req.user.id);
  
  consumer.notifications = {
    ...consumer.notifications,
    ...req.body
  };

  await consumer.save();

  res.status(200).json({
    status: 'success',
    message: 'Préférences de notification mises à jour avec succès',
    data: {
      notifications: consumer.notifications
    }
  });
});
