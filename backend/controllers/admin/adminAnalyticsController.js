const User = require('../../models/User');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const catchAsync = require('../../utils/catchAsync');
const { toPlainText } = require('../../utils/localization');

// @desc    Obtenir les analytics
// @route   GET /api/v1/admin/analytics
// @access  Admin
exports.getAnalytics = catchAsync(async (req, res, next) => {
  const { timeRange = '30d' } = req.query;
  
  // Calculer la période
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Récupérer les statistiques générales
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  
  // Calculer le revenu total
  const revenueResult = await Order.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
  
  // Statistiques de croissance
  const usersLastPeriod = await User.countDocuments({
    createdAt: { $gte: startDate }
  });
  const productsLastPeriod = await Product.countDocuments({
    createdAt: { $gte: startDate }
  });
  const ordersLastPeriod = await Order.countDocuments({
    createdAt: { $gte: startDate }
  });
  
  const userGrowth = totalUsers > 0 ? ((usersLastPeriod / totalUsers) * 100) : 0;
  const productGrowth = totalProducts > 0 ? ((productsLastPeriod / totalProducts) * 100) : 0;
  const orderGrowth = totalOrders > 0 ? ((ordersLastPeriod / totalOrders) * 100) : 0;
  
  // Données pour les graphiques
  const userRegistrations = await User.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
  
  const revenueTrends = await Order.aggregate([
    {
      $match: { 
        createdAt: { $gte: startDate },
        status: { $in: ['completed', 'delivered'] }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
  
  // Distribution par catégorie
  const categoryDistribution = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        averagePrice: { $avg: '$price' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
  
  // Top producteurs
  const topProducers = await Order.aggregate([
    {
      $match: { status: { $in: ['completed', 'delivered'] } }
    },
    {
      $group: {
        _id: '$seller',
        totalSales: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'producer'
      }
    },
    {
      $unwind: '$producer'
    },
    {
      $project: {
        producerName: { $concat: ['$producer.firstName', ' ', '$producer.lastName'] },
        farmName: '$producer.farmName',
        totalSales: 1,
        orderCount: 1
      }
    },
    {
      $sort: { totalSales: -1 }
    },
    {
      $limit: 5
    }
  ]);
  
  // Top produits
  const topProducts = await Order.aggregate([
    {
      $match: { status: { $in: ['completed', 'delivered'] } }
    },
    {
      $unwind: '$items'
    },
    {
      $group: {
        _id: '$items.product',
        totalSales: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        totalQuantity: { $sum: '$items.quantity' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $project: {
        name: '$product.name',
        price: '$product.price',
        totalSales: 1,
        totalQuantity: 1,
        orderCount: 1,
        sales: '$totalQuantity'
      }
    },
    {
      $sort: { totalSales: -1 }
    },
    {
      $limit: 5
    }
  ]);
  
  const normalizedTopProducts = topProducts.map((product) => ({
    ...product,
    name: toPlainText(product.name, 'Produit')
  }));
  
  const analytics = {
    overview: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      userGrowth: parseFloat(userGrowth.toFixed(1)),
      productGrowth: parseFloat(productGrowth.toFixed(1)),
      orderGrowth: parseFloat(orderGrowth.toFixed(1)),
      revenueGrowth: 0
    },
    charts: {
      userRegistrations,
      productCreations: [],
      orderTrends: revenueTrends,
      revenueTrends,
      categoryDistribution,
      topProducers,
      topProducts: normalizedTopProducts
    }
  };
  
  res.status(200).json({
    status: 'success',
    data: { analytics }
  });
});

// @desc    Obtenir les rapports
// @route   GET /api/v1/admin/reports/:type
// @access  Admin
exports.getReports = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement',
    data: { reports: [] }
  });
});

// @desc    Exporter des données
// @route   GET /api/v1/admin/export/:type
// @access  Admin
exports.exportData = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Fonctionnalité en cours de développement'
  });
});

