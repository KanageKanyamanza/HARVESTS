const Order = require('../../models/Order');
const catchAsync = require('../../utils/catchAsync');
const {
  ensureSegmentsForOrder
} = require('../../utils/orderSegments');
const orderService = require('../../services/orderService');

// Obtenir toutes les commandes (admin)
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const queryObj = orderService.buildAllOrdersQuery(req.query);

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
    data: { orders }
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

