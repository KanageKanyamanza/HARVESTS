const Order = require('../models/Order');
const Product = require('../models/Product');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Rechercher des produits pour le chatbot
exports.searchProducts = catchAsync(async (req, res, next) => {
  const { query, limit = 5 } = req.query;

  if (!query || query.length < 2) {
    return next(new AppError('Le terme de recherche doit contenir au moins 2 caractères', 400));
  }

  // Recherche flexible - nom peut être string ou objet {fr, en}
  const searchRegex = { $regex: query, $options: 'i' };
  
  const products = await Product.find({
    $and: [
      { status: 'approved', isActive: true },
      {
        $or: [
          { name: searchRegex }, // Si name est une string
          { 'name.fr': searchRegex },
          { 'name.en': searchRegex },
          { description: searchRegex },
          { 'description.fr': searchRegex },
          { shortDescription: searchRegex },
          { category: searchRegex }
        ]
      }
    ]
  })
    .select('name price images category')
    .limit(parseInt(limit))
    .lean();

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: { products }
  });
});

// Obtenir le statut d'une commande par numéro
exports.trackOrder = catchAsync(async (req, res, next) => {
  const { orderNumber } = req.params;

  const order = await Order.findOne({ orderNumber })
    .select('orderNumber status total createdAt delivery.estimatedDelivery')
    .lean();

  if (!order) {
    return next(new AppError('Commande non trouvée', 404));
  }

  // Vérifier que l'utilisateur est propriétaire de la commande ou admin
  if (req.user && order.buyer && order.buyer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('Vous n\'êtes pas autorisé à voir cette commande', 403));
  }

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

// Obtenir les commandes récentes de l'utilisateur connecté (pour le chatbot)
exports.getMyRecentOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ buyer: req.user._id })
    .select('orderNumber status total createdAt')
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders }
  });
});

