const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const ChatInteraction = require('../models/ChatInteraction');
const UnansweredQuestion = require('../models/UnansweredQuestion');
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

// ========================================
// TRACKING & ANALYTICS
// ========================================

// Enregistrer une interaction avec le bot
exports.logInteraction = catchAsync(async (req, res, next) => {
  const { 
    question, 
    response, 
    responseType, 
    matchedFaqId, 
    matchedIntent,
    confidence,
    sessionId 
  } = req.body;

  const interaction = await ChatInteraction.create({
    userId: req.user?._id || null,
    sessionId,
    question,
    response,
    responseType,
    matchedFaqId,
    matchedIntent,
    confidence,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Si pas de réponse trouvée, enregistrer dans les questions sans réponse
  if (responseType === 'no_answer') {
    const normalizedQuestion = question.toLowerCase().trim();
    
    // Chercher une question similaire existante
    const existing = await UnansweredQuestion.findOne({
      question: { $regex: normalizedQuestion.substring(0, 50), $options: 'i' },
      status: 'pending'
    });

    if (existing) {
      // Incrémenter le compteur
      existing.count += 1;
      existing.updatedAt = new Date();
      existing.lastAskedBy = req.user?._id;
      
      // Ajouter comme question similaire si différente
      const alreadyExists = existing.similarQuestions.some(
        sq => sq.text.toLowerCase() === normalizedQuestion
      );
      if (!alreadyExists && existing.question.toLowerCase() !== normalizedQuestion) {
        existing.similarQuestions.push({
          text: question,
          count: 1,
          lastAsked: new Date()
        });
      }
      await existing.save();
    } else {
      // Créer une nouvelle entrée
      await UnansweredQuestion.create({
        question,
        firstAskedBy: req.user?._id,
        lastAskedBy: req.user?._id
      });
    }
  }

  res.status(201).json({
    status: 'success',
    data: { interactionId: interaction._id }
  });
});

// Enregistrer le feedback utilisateur
exports.logFeedback = catchAsync(async (req, res, next) => {
  const { interactionId, feedback } = req.body;

  if (!['helpful', 'not_helpful'].includes(feedback)) {
    return next(new AppError('Feedback invalide', 400));
  }

  await ChatInteraction.findByIdAndUpdate(interactionId, { feedback });

  res.status(200).json({
    status: 'success',
    message: 'Feedback enregistré'
  });
});

// Obtenir les réponses personnalisées (questions répondues par admin)
exports.getCustomAnswers = catchAsync(async (req, res, next) => {
  const answers = await UnansweredQuestion.find({ status: 'answered' })
    .select('question answer keywords category')
    .lean();

  res.status(200).json({
    status: 'success',
    results: answers.length,
    data: { answers }
  });
});

// ========================================
// ADMIN - GESTION DES QUESTIONS
// ========================================

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
    // Total des interactions
    ChatInteraction.countDocuments(matchStage),
    
    // Répartition par type de réponse
    ChatInteraction.aggregate([
      { $match: matchStage },
      { $group: { _id: '$responseType', count: { $sum: 1 } } }
    ]),
    
    // Statistiques de feedback
    ChatInteraction.aggregate([
      { $match: { ...matchStage, feedback: { $ne: null } } },
      { $group: { _id: '$feedback', count: { $sum: 1 } } }
    ]),
    
    // Top questions sans réponse
    UnansweredQuestion.find({ status: 'pending' })
      .sort({ count: -1 })
      .limit(10)
      .select('question count updatedAt')
      .lean(),
    
    // Stats par jour (7 derniers jours)
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
    
    // Utilisateurs uniques
    ChatInteraction.distinct('userId', { ...matchStage, userId: { $ne: null } })
  ]);

  // Calculer le taux de réponse
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

