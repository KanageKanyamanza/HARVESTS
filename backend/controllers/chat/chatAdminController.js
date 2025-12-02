const ChatInteraction = require('../../models/ChatInteraction');
const UnansweredQuestion = require('../../models/UnansweredQuestion');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

// Obtenir les questions sans réponse (admin)
exports.getUnansweredQuestions = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, status = 'pending' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {};
  if (status !== 'all') filter.status = status;

  const [questions, total] = await Promise.all([
    UnansweredQuestion.find(filter)
      .sort({ count: -1, updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('firstAskedBy', 'firstName lastName email')
      .populate('lastAskedBy', 'firstName lastName email')
      .populate('answeredBy', 'firstName lastName')
      .lean(),
    UnansweredQuestion.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    results: questions.length,
    data: {
      questions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total
      }
    }
  });
});

// Répondre à une question (admin)
exports.answerQuestion = catchAsync(async (req, res, next) => {
  const { answer, keywords, category } = req.body;

  if (!answer) {
    return next(new AppError('La réponse est requise', 400));
  }

  const question = await UnansweredQuestion.findByIdAndUpdate(
    req.params.id,
    {
      answer,
      keywords: keywords || [],
      category: category || 'autre',
      status: 'answered',
      answeredBy: req.user._id,
      answeredAt: new Date()
    },
    { new: true }
  );

  if (!question) {
    return next(new AppError('Question non trouvée', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Réponse enregistrée',
    data: { question }
  });
});

// Ignorer une question (admin)
exports.ignoreQuestion = catchAsync(async (req, res, next) => {
  const question = await UnansweredQuestion.findByIdAndUpdate(
    req.params.id,
    { status: 'ignored' },
    { new: true }
  );

  if (!question) {
    return next(new AppError('Question non trouvée', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Question ignorée'
  });
});

// Statistiques du chatbot (admin)
exports.getChatStats = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const matchStage = {};
  if (Object.keys(dateFilter).length > 0) {
    matchStage.createdAt = dateFilter;
  }

  const [
    totalInteractions,
    interactionsByType,
    feedbackStats,
    topUnanswered,
    dailyStats,
    uniqueUsers
  ] = await Promise.all([
    ChatInteraction.countDocuments(matchStage),
    ChatInteraction.aggregate([
      { $match: matchStage },
      { $group: { _id: '$responseType', count: { $sum: 1 } } }
    ]),
    ChatInteraction.aggregate([
      { $match: { ...matchStage, feedback: { $ne: null } } },
      { $group: { _id: '$feedback', count: { $sum: 1 } } }
    ]),
    UnansweredQuestion.find({ status: 'pending' })
      .sort({ count: -1 })
      .limit(10)
      .select('question count updatedAt')
      .lean(),
    ChatInteraction.aggregate([
      { 
        $match: { 
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          noAnswer: { 
            $sum: { $cond: [{ $eq: ['$responseType', 'no_answer'] }, 1, 0] } 
          }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    ChatInteraction.distinct('userId', { ...matchStage, userId: { $ne: null } })
  ]);

  const totalWithResponse = interactionsByType
    .filter(t => t._id !== 'no_answer')
    .reduce((sum, t) => sum + t.count, 0);
  const responseRate = totalInteractions > 0 
    ? ((totalWithResponse / totalInteractions) * 100).toFixed(1) 
    : 0;

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalInteractions,
        uniqueUsers: uniqueUsers.length,
        responseRate: `${responseRate}%`,
        pendingQuestions: topUnanswered.length
      },
      interactionsByType: interactionsByType.reduce((acc, t) => {
        acc[t._id || 'unknown'] = t.count;
        return acc;
      }, {}),
      feedbackStats: feedbackStats.reduce((acc, f) => {
        acc[f._id] = f.count;
        return acc;
      }, {}),
      topUnanswered,
      dailyStats
    }
  });
});

// Obtenir toutes les interactions avec filtres (admin)
exports.getAllInteractions = catchAsync(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 50, 
    userId, 
    sessionId,
    responseType,
    feedback,
    search,
    startDate,
    endDate
  } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {};
  
  if (userId) filter.userId = userId;
  if (sessionId) filter.sessionId = sessionId;
  if (responseType) filter.responseType = responseType;
  if (feedback) filter.feedback = feedback;
  
  if (search) {
    filter.$or = [
      { question: { $regex: search, $options: 'i' } },
      { response: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const [interactions, total] = await Promise.all([
    ChatInteraction.find(filter)
      .populate('userId', 'firstName lastName email userType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    ChatInteraction.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    results: interactions.length,
    data: {
      interactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total
      }
    }
  });
});

// Historique des interactions d'un utilisateur (admin)
exports.getUserChatHistory = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [interactions, total] = await Promise.all([
    ChatInteraction.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    ChatInteraction.countDocuments({ userId })
  ]);

  res.status(200).json({
    status: 'success',
    results: interactions.length,
    data: {
      interactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total
      }
    }
  });
});

