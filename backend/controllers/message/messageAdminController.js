const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');

// Obtenir toutes les conversations (admin)
exports.getAllConversations = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const queryObj = {};
  if (req.query.type) queryObj.type = req.query.type;
  if (req.query.status) queryObj.status = req.query.status;

  const conversations = await Conversation.find(queryObj)
    .populate('participants.user', 'firstName lastName email userType')
    .populate('createdBy', 'firstName lastName userType')
    .sort('-lastActivity')
    .skip(skip)
    .limit(limit);

  const total = await Conversation.countDocuments(queryObj);

  res.status(200).json({
    status: 'success',
    results: conversations.length,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    data: {
      conversations
    }
  });
});

// Statistiques globales de messagerie (admin)
exports.getGlobalMessagingStats = catchAsync(async (req, res, next) => {
  const { period = '30d' } = req.query;
  const periodDays = parseInt(period.replace('d', ''), 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Statistiques générales
  const generalStats = await Message.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        uniqueSenders: { $addToSet: '$sender' },
        messagesByType: {
          $push: '$type'
        }
      }
    },
    {
      $addFields: {
        uniqueSendersCount: { $size: '$uniqueSenders' }
      }
    }
  ]);

  // Évolution dans le temps
  const timeline = await Message.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        messageCount: { $sum: 1 },
        uniqueUsers: { $addToSet: '$sender' }
      }
    },
    {
      $addFields: {
        activeUsers: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Top utilisateurs actifs
  const topUsers = await Message.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$sender',
        messageCount: { $sum: 1 }
      }
    },
    { $sort: { messageCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      overview: generalStats[0] || {},
      timeline,
      topUsers,
      period
    }
  });
});

// Nettoyer les conversations inactives
exports.cleanupInactiveConversations = catchAsync(async (req, res, next) => {
  const { daysInactive = 90 } = req.body;

  const result = await Conversation.cleanupInactiveConversations(daysInactive);

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} conversation(s) archivée(s)`,
    data: {
      archivedCount: result.modifiedCount
    }
  });
});

