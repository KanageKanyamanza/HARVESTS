const Product = require('../../models/Product');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { toPlainText } = require('../../utils/localization');

// @desc    Obtenir tous les plats
// @route   GET /api/v1/admin/dishes
// @access  Admin
exports.getAllDishes = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search, status } = req.query;

  const parsedLimit = Math.max(parseInt(limit) || 10, 1);
  const skip = (Math.max(parseInt(page) || 1, 1) - 1) * parsedLimit;

  // Construire la requête de base pour Product
  const query = {
    originType: 'dish',
    userType: 'restaurateur'
  };

  if (status) {
    query.status = status;
  }

  if (search) {
    const regex = new RegExp(search, 'i');
    query.$or = [
      { name: regex },
      { description: regex },
      { shortDescription: regex }
    ];
  }

  // Compter le total
  const total = await Product.countDocuments(query);

  // Récupérer les produits avec les images
  const products = await Product.find(query)
    .select('name description price images primaryImage image dishInfo status isActive createdAt restaurateur')
    .populate('restaurateur', 'restaurantName firstName lastName email')
    .sort('-createdAt')
    .skip(skip)
    .limit(parsedLimit);

  // Formater pour compatibilité avec le frontend
  const dishes = products.map(product => {
    // Extraire l'image principale - gérer différents formats
    let imageUrl = null;
    
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'object' && firstImage !== null) {
        imageUrl = firstImage.url || firstImage.src || null;
      } else if (typeof firstImage === 'string') {
        imageUrl = firstImage;
      }
    } else if (product.primaryImage) {
      if (typeof product.primaryImage === 'object' && product.primaryImage.url) {
        imageUrl = product.primaryImage.url;
      } else if (typeof product.primaryImage === 'string') {
        imageUrl = product.primaryImage;
      }
    } else if (typeof product.image === 'string') {
      imageUrl = product.image;
    }

    return {
      _id: product._id,
      name: toPlainText(product.name, ''),
      description: toPlainText(product.description, ''),
      price: product.price,
      image: imageUrl,
      images: product.images || [],
      category: product.dishInfo?.category || product.category,
      status: product.status,
      isAvailable: product.isActive,
      preparationTime: product.dishInfo?.preparationTime,
      allergens: product.dishInfo?.allergens || [],
      createdAt: product.createdAt,
      restaurateur: product.restaurateur ? {
        _id: product.restaurateur._id,
        restaurantName: product.restaurateur.restaurantName,
        firstName: product.restaurateur.firstName,
        lastName: product.restaurateur.lastName,
        email: product.restaurateur.email
      } : null
    };
  });

  const totalPages = Math.max(Math.ceil(total / parsedLimit), 1);

  res.status(200).json({
    status: 'success',
    data: {
      dishes,
      pagination: {
        currentPage: Math.max(parseInt(page) || 1, 1),
        totalPages,
        totalDishes: total,
        hasNext: Math.max(parseInt(page) || 1, 1) < totalPages,
        hasPrev: Math.max(parseInt(page) || 1, 1) > 1
      }
    }
  });
});

// @desc    Obtenir un plat par ID
// @route   GET /api/v1/admin/dishes/:id
// @access  Admin
exports.getDishById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const product = await Product.findOne({
    _id: id,
    originType: 'dish',
    userType: 'restaurateur'
  }).populate('restaurateur', 'restaurantName firstName lastName email');
  
  if (!product) {
    return next(new AppError('Plat non trouvé', 404));
  }
  
  const dish = {
    _id: product._id,
    name: toPlainText(product.name, ''),
    description: toPlainText(product.description, ''),
    price: product.price,
    image: product.images?.[0]?.url,
    category: product.dishInfo?.category,
    status: product.status,
    isAvailable: product.isActive,
    preparationTime: product.dishInfo?.preparationTime,
    allergens: product.dishInfo?.allergens || [],
    createdAt: product.createdAt,
    restaurateur: product.restaurateur ? {
      _id: product.restaurateur._id,
      restaurantName: product.restaurateur.restaurantName,
      firstName: product.restaurateur.firstName,
      lastName: product.restaurateur.lastName,
      email: product.restaurateur.email
    } : null
  };
  
  res.status(200).json({
    status: 'success',
    data: { dish }
  });
});

// @desc    Mettre à jour un plat
// @route   PATCH /api/v1/admin/dishes/:id
// @access  Admin
exports.updateDish = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;
  
  const product = await Product.findOne({
    _id: id,
    originType: 'dish',
    userType: 'restaurateur'
  });
  
  if (!product) {
    return next(new AppError('Plat non trouvé', 404));
  }
  
  const allowedFields = ['name', 'description', 'shortDescription', 'price', 'images', 'dishInfo', 'isActive'];
  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key) && key !== '_id' && key !== 'restaurateur') {
      if (['name', 'description', 'shortDescription'].includes(key)) {
        product[key] = toPlainText(updates[key], product[key]);
      } else {
        product[key] = updates[key];
      }
    }
  });
  
  await product.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Plat mis à jour avec succès',
    data: { dish: product }
  });
});

// @desc    Supprimer un plat
// @route   DELETE /api/v1/admin/dishes/:id
// @access  Admin
exports.deleteDish = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const product = await Product.findOneAndDelete({
    _id: id,
    originType: 'dish',
    userType: 'restaurateur'
  });
  
  if (!product) {
    return next(new AppError('Plat non trouvé', 404));
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Plat supprimé avec succès'
  });
});

// @desc    Approuver un plat
// @route   POST /api/v1/admin/dishes/:id/approve
// @access  Admin
exports.approveDish = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const product = await Product.findOneAndUpdate(
    {
      _id: id,
      originType: 'dish',
      userType: 'restaurateur'
    },
    {
      status: 'approved',
      isActive: true,
      approvedAt: new Date(),
      $unset: { rejectionReason: 1 }
    },
    { new: true }
  ).populate('restaurateur', 'restaurantName firstName lastName email');
  
  if (!product) {
    return next(new AppError('Plat non trouvé', 404));
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Plat approuvé avec succès',
    data: { dish: product }
  });
});

// @desc    Rejeter un plat
// @route   POST /api/v1/admin/dishes/:id/reject
// @access  Admin
exports.rejectDish = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  
  if (!reason) {
    return next(new AppError('Raison du rejet requise', 400));
  }
  
  const product = await Product.findOneAndUpdate(
    {
      _id: req.params.id,
      originType: 'dish',
      userType: 'restaurateur'
    },
    {
      status: 'rejected',
      isActive: false,
      rejectionReason: reason,
      $unset: { approvedAt: 1 }
    },
    { new: true }
  ).populate('restaurateur', 'restaurantName firstName lastName email');
  
  if (!product) {
    return next(new AppError('Plat non trouvé', 404));
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Plat rejeté avec succès',
    data: { dish: product }
  });
});

