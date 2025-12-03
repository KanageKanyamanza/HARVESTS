const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Restaurateur = require('../../models/Restaurateur');
const restaurateurDishService = require('../../services/restaurateur/restaurateurDishService');

// Récupérer les plats du restaurateur
exports.getMyDishes = catchAsync(async (req, res, next) => {
  try {
    const dishes = await restaurateurDishService.getMyDishes(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { dishes }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Récupérer les produits du restaurateur connecté
exports.getMyProducts = catchAsync(async (req, res, next) => {
  console.log('🔍 getMyProducts appelé pour user ID:', req.user.id);
  
  const restaurateur = await Restaurateur.findById(req.user.id).select('products');
  console.log('📋 Restaurateur trouvé:', !!restaurateur);
  console.log('📦 Produits:', restaurateur?.products?.length || 0);
  
  if (!restaurateur) {
    return res.status(404).json({
      status: 'error',
      message: 'Restaurateur non trouvé'
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: { products: restaurateur.products || [] }
  });
});

// Ajouter un plat
exports.addDish = catchAsync(async (req, res, next) => {
  try {
    const product = await restaurateurDishService.addDish(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      message: 'Plat soumis pour validation',
      data: { dish: product }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// Mettre à jour un plat
exports.updateDish = catchAsync(async (req, res, next) => {
  try {
    const { product, requiresReview } = await restaurateurDishService.updateDish(req.params.dishId, req.user.id, req.body);
    res.status(200).json({
      status: 'success',
      message: requiresReview ? 'Plat mis à jour. Une nouvelle validation est nécessaire.' : 'Plat mis à jour avec succès',
      data: { dish: product }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Supprimer un plat
exports.deleteDish = catchAsync(async (req, res, next) => {
  try {
    await restaurateurDishService.deleteDish(req.params.dishId, req.user.id);
    res.status(200).json({
      status: 'success',
      message: 'Plat supprimé avec succès'
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

