const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
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

// Rechercher des vendeurs (producteurs, transformateurs, restaurateurs)
exports.searchSellers = catchAsync(async (req, res, next) => {
  const { query, limit = 5 } = req.query;

  if (!query || query.length < 2) {
    return next(new AppError('Le terme de recherche doit contenir au moins 2 caractères', 400));
  }

  const searchRegex = { $regex: query, $options: 'i' };
  
  const sellers = await User.find({
    $and: [
      { userType: { $in: ['producer', 'transformer', 'restaurateur'] } },
      { isActive: true },
      { isVerified: true },
      {
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { farmName: searchRegex },
          { companyName: searchRegex },
          { restaurantName: searchRegex },
          { 'address.city': searchRegex },
          { 'address.region': searchRegex }
        ]
      }
    ]
  })
    .select('firstName lastName farmName companyName restaurantName userType address profileImage')
    .limit(parseInt(limit))
    .lean();

  res.status(200).json({
    status: 'success',
    results: sellers.length,
    data: { sellers }
  });
});

// Rechercher des transporteurs
exports.searchTransporters = catchAsync(async (req, res, next) => {
  const { query, limit = 5 } = req.query;

  if (!query || query.length < 2) {
    return next(new AppError('Le terme de recherche doit contenir au moins 2 caractères', 400));
  }

  const searchRegex = { $regex: query, $options: 'i' };
  
  const transporters = await User.find({
    $and: [
      { userType: { $in: ['transporter', 'exporter'] } },
      { isActive: true },
      { isVerified: true },
      {
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { companyName: searchRegex },
          { 'address.city': searchRegex },
          { 'address.region': searchRegex },
          { 'serviceAreas.region': searchRegex },
          { 'serviceAreas.city': searchRegex }
        ]
      }
    ]
  })
    .select('firstName lastName companyName userType address serviceAreas profileImage')
    .limit(parseInt(limit))
    .lean();

  res.status(200).json({
    status: 'success',
    results: transporters.length,
    data: { transporters }
  });
});

// Obtenir les catégories disponibles
exports.getCategories = catchAsync(async (req, res, next) => {
  const categories = await Product.distinct('category', {
    status: 'approved',
    isActive: true
  });

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: { categories }
  });
});

