const Message = require('../../models/Message');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

// @desc    Obtenir tous les messages
// @route   GET /api/v1/admin/messages
// @access  Admin
exports.getAllMessages = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status, search } = req.query;
  
  // Construire le filtre
  const filter = {};
  
  if (status) {
    filter.isRead = status === 'read';
  }
  
  if (search) {
    filter.$or = [
      { content: { $regex: search, $options: 'i' } },
      { 'sender.firstName': { $regex: search, $options: 'i' } },
      { 'sender.lastName': { $regex: search, $options: 'i' } },
      { 'sender.email': { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;
  
  // Récupérer les messages avec populate
  const messages = await Message.find(filter)
    .populate('sender', 'firstName lastName email avatar')
    .populate('recipient', 'firstName lastName email avatar')
    .populate('conversation', 'title type')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Compter le total
  const total = await Message.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

// @desc    Obtenir un message par ID
// @route   GET /api/v1/admin/messages/:id
// @access  Admin
exports.getMessageById = catchAsync(async (req, res, next) => {
  const message = await Message.findById(req.params.id)
    .populate('sender', 'firstName lastName email phone avatar')
    .populate('recipient', 'firstName lastName email phone avatar')
    .populate('conversation', 'title type participants')
    .populate('attachments.product', 'name images');

  if (!message) {
    return next(new AppError('Message non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { message }
  });
});

// @desc    Répondre à un message
// @route   POST /api/v1/admin/messages/:id/reply
// @access  Admin
exports.replyToMessage = catchAsync(async (req, res, next) => {
  const { content, messageType = 'text' } = req.body;
  const originalMessage = await Message.findById(req.params.id);
  
  if (!originalMessage) {
    return next(new AppError('Message original non trouvé', 404));
  }

  // Créer la réponse
  const reply = await Message.create({
    content,
    messageType,
    sender: req.admin._id,
    recipient: originalMessage.sender,
    conversation: originalMessage.conversation,
    isReply: true,
    originalMessage: originalMessage._id
  });

  // Marquer le message original comme lu
  await Message.findByIdAndUpdate(req.params.id, { isRead: true });

  const populatedReply = await Message.findById(reply._id)
    .populate('sender', 'firstName lastName email avatar')
    .populate('recipient', 'firstName lastName email avatar');

  res.status(201).json({
    status: 'success',
    message: 'Réponse envoyée avec succès',
    data: { message: populatedReply }
  });
});

// @desc    Marquer un message comme lu
// @route   POST /api/v1/admin/messages/:id/read
// @access  Admin
exports.markAsRead = catchAsync(async (req, res, next) => {
  const message = await Message.findByIdAndUpdate(
    req.params.id,
    { isRead: true, readAt: new Date() },
    { new: true }
  ).populate('sender', 'firstName lastName email');

  if (!message) {
    return next(new AppError('Message non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Message marqué comme lu',
    data: { message }
  });
});

// @desc    Supprimer un message
// @route   DELETE /api/v1/admin/messages/:id
// @access  Admin
exports.deleteMessage = catchAsync(async (req, res, next) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  
  if (!message) {
    return next(new AppError('Message non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Message supprimé avec succès'
  });
});

