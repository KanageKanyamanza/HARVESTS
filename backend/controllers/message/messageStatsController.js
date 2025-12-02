const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Message = require('../../models/Message');
const Conversation = require('../../models/Conversation');

// Obtenir les statistiques de messagerie
exports.getMessagingStats = catchAsync(async (req, res, next) => {
  const { period = '30d' } = req.query;
  const periodDays = parseInt(period.replace('d', ''), 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  // Mes statistiques de messagerie
  const myStats = await Message.aggregate([
    { 
      $match: { 
        sender: req.user.id,
        createdAt: { $gte: startDate }
      } 
    },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        messagesByType: {
          $push: '$type'
        }
      }
    }
  ]);

  // Conversations actives
  const activeConversations = await Conversation.countDocuments({
    'participants.user': req.user.id,
    'participants.isActive': true,
    status: 'active',
    lastActivity: { $gte: startDate }
  });

  // Messages reçus
  const receivedMessages = await Message.countDocuments({
    conversation: {
      $in: await Conversation.find({
        'participants.user': req.user.id,
        'participants.isActive': true
      }).distinct('_id')
    },
    sender: { $ne: req.user.id },
    createdAt: { $gte: startDate }
  });

  res.status(200).json({
    status: 'success',
    data: {
      messagesSent: myStats[0]?.totalMessages || 0,
      messagesReceived: receivedMessages,
      activeConversations,
      period
    }
  });
});

