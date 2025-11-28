const Product = require('../../models/Product');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { toPlainText } = require('../../utils/localization');

// @desc    Obtenir tous les produits
// @route   GET /api/v1/admin/products
// @access  Admin
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search, status, category, featured } = req.query;
  
  // Construire le filtre
  const filter = {};
  
  // Exclure les plats (originType: 'dish') de la liste des produits
  filter.$and = [
    {
      $or: [
        { originType: { $exists: false } },
        { originType: { $ne: 'dish' } }
      ]
    }
  ];
  
  if (search) {
    filter.$and.push({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ]
    });
  }
  
  if (status) {
    filter.status = status;
  }
  
  if (category) {
    filter.category = category;
  }
  
  if (featured) {
    if (featured === 'featured') {
      filter.isFeatured = true;
    } else if (featured === 'not-featured') {
      filter.isFeatured = false;
    }
  }

  // Pagination
  const skip = (page - 1) * limit;
  
  // Récupérer les produits avec populate du producteur
  const products = await Product.find(filter)
    .populate('producer', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Compter le total
  const total = await Product.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

// @desc    Obtenir un produit par ID
// @route   GET /api/v1/admin/products/:id
// @access  Admin
exports.getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('producer', 'firstName lastName email phone address');

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { product }
  });
});

// @desc    Mettre à jour un produit
// @route   PATCH /api/v1/admin/products/:id
// @access  Admin
exports.updateProduct = catchAsync(async (req, res, next) => {
  const { name, description, price, category, stock, status } = req.body;
  
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { name, description, price, category, stock, status },
    { new: true, runValidators: true }
  ).populate('producer', 'firstName lastName email');

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Produit mis à jour avec succès',
    data: { product }
  });
});

// @desc    Supprimer un produit
// @route   DELETE /api/v1/admin/products/:id
// @access  Admin
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  
  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Produit supprimé avec succès'
  });
});

// @desc    Approuver un produit
// @route   POST /api/v1/admin/products/:id/approve
// @access  Admin
exports.approveProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { status: 'approved', approvedAt: new Date() },
    { new: true }
  ).populate('producer', 'firstName lastName email');

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  // Créer une notification pour le producteur
  if (product.producer) {
    const Notification = require('../../models/Notification');
    
    const productName = toPlainText(product.name, 'Produit');
    const producerName = `${product.producer.firstName} ${product.producer.lastName}`;
    
    await Notification.create({
      recipient: product.producer._id,
      type: 'product_approved',
      category: 'product',
      title: 'Produit approuvé',
      message: `Votre produit "${productName}" a été approuvé et est maintenant visible sur la plateforme`,
      data: {
        productId: product._id,
        productName: productName,
        producerName: producerName,
        action: 'product_approved'
      },
      actions: [{
        type: 'view',
        label: 'Voir le produit',
        url: `/products/${product._id}`
      }],
      isRead: false,
      priority: 'medium'
    });

    console.log(`✅ Notification envoyée au producteur ${producerName} pour l'approbation du produit "${productName}"`);
  }

  res.status(200).json({
    status: 'success',
    message: 'Produit approuvé avec succès',
    data: { product }
  });
});

// @desc    Rejeter un produit
// @route   POST /api/v1/admin/products/:id/reject
// @access  Admin
exports.rejectProduct = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'rejected', 
      rejectedAt: new Date(),
      rejectionReason: reason 
    },
    { new: true }
  ).populate('producer', 'firstName lastName email');

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  // Créer une notification pour le producteur
  if (product.producer) {
    const Notification = require('../../models/Notification');
    
    const productName = toPlainText(product.name, 'Produit');
    const producerName = `${product.producer.firstName} ${product.producer.lastName}`;
    
    await Notification.create({
      recipient: product.producer._id,
      type: 'product_rejected',
      category: 'product',
      title: 'Produit rejeté',
      message: `Votre produit "${productName}" a été rejeté. Raison: ${reason || 'Non spécifiée'}`,
      data: {
        productId: product._id,
        productName: productName,
        producerName: producerName,
        rejectionReason: reason,
        action: 'product_rejected'
      },
      actions: [{
        type: 'edit',
        label: 'Modifier le produit',
        url: `/producer/products/${product._id}/edit`
      }],
      isRead: false,
      priority: 'high'
    });

    console.log(`❌ Notification envoyée au producteur ${producerName} pour le rejet du produit "${productName}"`);
  }

  res.status(200).json({
    status: 'success',
    message: 'Produit rejeté avec succès',
    data: { product }
  });
});

// @desc    Mettre un produit en vedette
// @route   POST /api/v1/admin/products/:id/feature
// @access  Admin
exports.featureProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isFeatured: true, featuredAt: new Date() },
    { new: true }
  ).populate('producer', 'firstName lastName email');

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Produit mis en vedette avec succès',
    data: { product }
  });
});

// @desc    Retirer un produit de la vedette
// @route   POST /api/v1/admin/products/:id/unfeature
// @access  Admin
exports.unfeatureProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isFeatured: false, $unset: { featuredAt: 1 } },
    { new: true }
  ).populate('producer', 'firstName lastName email');

  if (!product) {
    return next(new AppError('Produit non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Produit retiré de la vedette avec succès',
    data: { product }
  });
});

