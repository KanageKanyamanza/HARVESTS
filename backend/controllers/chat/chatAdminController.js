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

// Statistiques du chatbot (admin) - Version améliorée avec analytics avancées
exports.getChatStats = catchAsync(async (req, res, next) => {
  const { startDate, endDate, timeRange = '30d' } = req.query;
  
  // Calculer les dates selon timeRange
  let dateFilter = {};
  const now = new Date();
  if (timeRange === '7d') {
    dateFilter.$gte = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (timeRange === '30d') {
    dateFilter.$gte = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (timeRange === '90d') {
    dateFilter.$gte = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  } else if (timeRange === '1y') {
    dateFilter.$gte = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  }
  
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const matchStage = {};
  if (Object.keys(dateFilter).length > 0) {
    matchStage.createdAt = dateFilter;
  }

  // Calculer les stats de la période précédente pour comparaison
  const previousPeriodStart = new Date(dateFilter.$gte);
  previousPeriodStart.setTime(previousPeriodStart.getTime() - (dateFilter.$lte ? 
    (new Date(dateFilter.$lte) - new Date(dateFilter.$gte)) : 
    (now - dateFilter.$gte)));
  const previousPeriodEnd = new Date(dateFilter.$gte);

  const previousMatchStage = {
    createdAt: {
      $gte: previousPeriodStart,
      $lt: previousPeriodEnd
    }
  };

  const [
    totalInteractions,
    previousTotalInteractions,
    interactionsByType,
    interactionsByIntent,
    feedbackStats,
    topUnanswered,
    dailyStats,
    hourlyStats,
    uniqueUsers,
    topQuestions,
    topSearches,
    avgResponseTime,
    satisfactionRate,
    intentDistribution,
    questionTypeDistribution
  ] = await Promise.all([
    ChatInteraction.countDocuments(matchStage),
    ChatInteraction.countDocuments(previousMatchStage),
    ChatInteraction.aggregate([
      { $match: matchStage },
      { $group: { _id: '$responseType', count: { $sum: 1 } } }
    ]),
    ChatInteraction.aggregate([
      { $match: { ...matchStage, matchedIntent: { $ne: null } } },
      { $group: { _id: '$matchedIntent', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
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
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          noAnswer: { 
            $sum: { $cond: [{ $eq: ['$responseType', 'no_answer'] }, 1, 0] } 
          },
          withFeedback: {
            $sum: { $cond: [{ $ne: ['$feedback', null] }, 1, 0] }
          },
          positiveFeedback: {
            $sum: { $cond: [{ $eq: ['$feedback', true] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    ChatInteraction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    ChatInteraction.distinct('userId', { ...matchStage, userId: { $ne: null } }),
    ChatInteraction.aggregate([
      { $match: { ...matchStage, question: { $ne: null, $ne: '' } } },
      {
        $group: {
          _id: '$question',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    ChatInteraction.aggregate([
      { $match: { ...matchStage, responseType: 'product_search', question: { $ne: null } } },
      {
        $group: {
          _id: '$question',
          count: { $sum: 1 },
          successRate: {
            $avg: { $cond: [{ $ne: ['$responseType', 'no_answer'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    ChatInteraction.aggregate([
      { $match: { ...matchStage, responseTime: { $ne: null } } },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$responseTime' },
          minTime: { $min: '$responseTime' },
          maxTime: { $max: '$responseTime' }
        }
      }
    ]),
    ChatInteraction.aggregate([
      { $match: { ...matchStage, feedback: { $ne: null } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          positive: { $sum: { $cond: [{ $eq: ['$feedback', true] }, 1, 0] } }
        }
      }
    ]),
    ChatInteraction.aggregate([
      { $match: { ...matchStage, matchedIntent: { $ne: null } } },
      {
        $group: {
          _id: '$matchedIntent',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' }
        }
      },
      { $sort: { count: -1 } }
    ]),
    ChatInteraction.aggregate([
      { $match: { ...matchStage, question: { $ne: null } } },
      {
        $project: {
          questionType: {
            $cond: [
              { $regexMatch: { input: '$question', regex: /comment|comment faire/i } },
              'how',
              {
                $cond: [
                  { $regexMatch: { input: '$question', regex: /quoi|quel|quelle/i } },
                  'what',
                  {
                    $cond: [
                      { $regexMatch: { input: '$question', regex: /quand/i } },
                      'when',
                      {
                        $cond: [
                          { $regexMatch: { input: '$question', regex: /où/i } },
                          'where',
                          {
                            $cond: [
                              { $regexMatch: { input: '$question', regex: /pourquoi/i } },
                              'why',
                              {
                                $cond: [
                                  { $regexMatch: { input: '$question', regex: /combien|prix/i } },
                                  'how_much',
                                  'general'
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: '$questionType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])
  ]);

  const totalWithResponse = interactionsByType
    .filter(t => t._id !== 'no_answer')
    .reduce((sum, t) => sum + t.count, 0);
  const responseRate = totalInteractions > 0 
    ? ((totalWithResponse / totalInteractions) * 100).toFixed(1) 
    : 0;

  // Calculer la croissance
  const growth = previousTotalInteractions > 0
    ? (((totalInteractions - previousTotalInteractions) / previousTotalInteractions) * 100).toFixed(1)
    : 0;

  // Calculer le taux de satisfaction
  const satisfaction = satisfactionRate.length > 0 && satisfactionRate[0].total > 0
    ? ((satisfactionRate[0].positive / satisfactionRate[0].total) * 100).toFixed(1)
    : 0;

  // Temps de réponse moyen
  const avgResponse = avgResponseTime.length > 0 ? avgResponseTime[0] : null;

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalInteractions,
        previousTotalInteractions,
        growth: `${growth}%`,
        uniqueUsers: uniqueUsers.length,
        responseRate: `${responseRate}%`,
        satisfactionRate: `${satisfaction}%`,
        pendingQuestions: topUnanswered.length,
        avgResponseTime: avgResponse ? {
          avg: Math.round(avgResponse.avgTime || 0),
          min: Math.round(avgResponse.minTime || 0),
          max: Math.round(avgResponse.maxTime || 0)
        } : null
      },
      interactionsByType: interactionsByType.reduce((acc, t) => {
        acc[t._id || 'unknown'] = t.count;
        return acc;
      }, {}),
      interactionsByIntent: interactionsByIntent.reduce((acc, i) => {
        acc[i._id] = {
          count: i.count,
          percentage: totalInteractions > 0 ? ((i.count / totalInteractions) * 100).toFixed(1) : 0
        };
        return acc;
      }, {}),
      feedbackStats: feedbackStats.reduce((acc, f) => {
        acc[f._id] = f.count;
        return acc;
      }, {}),
      topUnanswered,
      dailyStats,
      hourlyStats: hourlyStats.reduce((acc, h) => {
        acc[h._id] = h.count;
        return acc;
      }, {}),
      topQuestions: topQuestions.map(q => ({
        question: q._id,
        count: q.count,
        avgConfidence: q.avgConfidence ? q.avgConfidence.toFixed(2) : null
      })),
      topSearches: topSearches.map(s => ({
        search: s._id,
        count: s.count,
        successRate: (s.successRate * 100).toFixed(1)
      })),
      intentDistribution: intentDistribution.map(i => ({
        intent: i._id,
        count: i.count,
        avgConfidence: i.avgConfidence ? i.avgConfidence.toFixed(2) : null,
        percentage: totalInteractions > 0 ? ((i.count / totalInteractions) * 100).toFixed(1) : 0
      })),
      questionTypeDistribution: questionTypeDistribution.reduce((acc, q) => {
        acc[q._id] = {
          count: q.count,
          percentage: totalInteractions > 0 ? ((q.count / totalInteractions) * 100).toFixed(1) : 0
        };
        return acc;
      }, {})
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

