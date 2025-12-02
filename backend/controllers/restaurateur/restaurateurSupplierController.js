const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Producer = require('../../models/Producer');
const Transformer = require('../../models/Transformer');
const restaurateurSupplierService = require('../../services/restaurateur/restaurateurSupplierService');

// Fonction temporaire pour les fonctionnalités en cours de développement
const temporaryResponse = (message) => catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: `Fonctionnalité en cours de développement - ${message}`,
    data: {}
  });
});

// Découvrir des fournisseurs
exports.discoverSuppliers = catchAsync(async (req, res, next) => {
  try {
    const result = await restaurateurSupplierService.discoverSuppliers(req.query);
    res.status(200).json({
      status: 'success',
      results: result.suppliers.length,
      total: result.total,
      data: { suppliers: result.suppliers }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Rechercher des fournisseurs
exports.searchSuppliers = catchAsync(async (req, res, next) => {
  // Utiliser la même logique que discoverSuppliers mais avec des filtres de recherche plus avancés
  return exports.discoverSuppliers(req, res, next);
});

// Obtenir les détails d'un fournisseur
exports.getSupplierDetails = catchAsync(async (req, res, next) => {
  const { supplierId } = req.params;
  
  try {
    // Essayer de trouver dans les producteurs
    let supplier = await Producer.findById(supplierId)
      .select('-password -__v');
    
    if (supplier) {
      return res.status(200).json({
        status: 'success',
        data: {
          supplier: {
            ...supplier.toObject(),
            userType: 'producer',
            supplierType: 'Producteur'
          }
        }
      });
    }
    
    // Essayer de trouver dans les transformateurs
    supplier = await Transformer.findById(supplierId)
      .select('-password -__v');
    
    if (supplier) {
      return res.status(200).json({
        status: 'success',
        data: {
          supplier: {
            ...supplier.toObject(),
            userType: 'transformer',
            supplierType: 'Transformateur'
          }
        }
      });
    }
    
    res.status(404).json({
      status: 'fail',
      message: 'Fournisseur non trouvé'
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du fournisseur:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération du fournisseur'
    });
  }
});

// Fonctions temporaires
exports.getPreferredSuppliers = temporaryResponse('Fournisseurs préférés');
exports.addPreferredSupplier = temporaryResponse('Ajout fournisseur');
exports.updateSupplierRating = temporaryResponse('Note fournisseur');
exports.removePreferredSupplier = temporaryResponse('Suppression fournisseur');

