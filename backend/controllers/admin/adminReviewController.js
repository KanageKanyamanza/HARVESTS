const Review = require('../../models/Review');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

// @desc    Obtenir tous les avis
// @route   GET /api/v1/admin/reviews
// @access  Admin
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status, search } = req.query;
  
  // Construire le filtre
  const filter = {};
  
  if (status) {
    filter.status = status;
  }
  
  if (search) {
    filter.$or = [
      { comment: { $regex: search, $options: 'i' } },
      { 'reviewer.firstName': { $regex: search, $options: 'i' } },
      { 'reviewer.lastName': { $regex: search, $options: 'i' } },
      { 'product.name': { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;
  
  // Récupérer les avis avec populate
  const reviews = await Review.find(filter)
    .populate('reviewer', 'firstName lastName email')
    .populate('product', 'name images')
    .populate('producer', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Compter le total
  const total = await Review.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

// @desc    Obtenir un avis par ID
// @route   GET /api/v1/admin/reviews/:id
// @access  Admin
exports.getReviewById = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate('reviewer', 'firstName lastName email phone')
    .populate('product', 'name images description')
    .populate('producer', 'firstName lastName email phone');

  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { review }
  });
});

// @desc    Mettre à jour un avis
// @route   PATCH /api/v1/admin/reviews/:id
// @access  Admin
exports.updateReview = catchAsync(async (req, res, next) => {
  const { status, adminNotes } = req.body;
  
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { status, adminNotes },
    { new: true }
  ).populate('reviewer', 'firstName lastName email')
   .populate('product', 'name images');

  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Avis mis à jour avec succès',
    data: { review }
  });
});

// @desc    Supprimer un avis
// @route   DELETE /api/v1/admin/reviews/:id
// @access  Admin
exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  
  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Avis supprimé avec succès'
  });
});

// @desc    Approuver un avis
// @route   POST /api/v1/admin/reviews/:id/approve
// @access  Admin
exports.approveReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { status: 'approved', approvedAt: new Date() },
    { new: true }
  ).populate('reviewer', 'firstName lastName email')
   .populate('product', 'name images');

  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Avis approuvé avec succès',
    data: { review }
  });
});

// @desc    Rejeter un avis
// @route   POST /api/v1/admin/reviews/:id/reject
// @access  Admin
exports.rejectReview = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'rejected', 
      rejectedAt: new Date(),
      rejectionReason: reason 
    },
    { new: true }
  ).populate('reviewer', 'firstName lastName email')
   .populate('product', 'name images');

  if (!review) {
    return next(new AppError('Avis non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Avis rejeté avec succès',
    data: { review }
  });
});

