const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Producer = require('../../models/Producer');
const Transformer = require('../../models/Transformer');
const restaurateurSupplierService = require('../../services/restaurateur/restaurateurSupplierService');
const { isTestViewer, testAccountScope } = require('../../utils/testAccounts');

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
    const result = await restaurateurSupplierService.discoverSuppliers(req.query, isTestViewer(req));
    res.status(200).json({
      status: 'success',
      results: result.suppliers.length,
      total: result.total,
      data: { suppliers: result.suppliers }
    });
  } catch (error) {
    return next(AppError.from(error, 404));
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
  const scope = testAccountScope(isTestViewer(req));

  // Le détail doit appliquer le même périmètre sandbox que la liste : un
  // visiteur réel ne doit pas ouvrir la fiche d'un fournisseur de test.
  let supplier = await Producer.findOne({ _id: supplierId, ...scope })
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

  supplier = await Transformer.findOne({ _id: supplierId, ...scope })
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

  return next(new AppError('restaurateur.supplier_not_found', 404));
});

// Fonctions temporaires
exports.getPreferredSuppliers = temporaryResponse('Fournisseurs préférés');
exports.addPreferredSupplier = temporaryResponse('Ajout fournisseur');
exports.updateSupplierRating = temporaryResponse('Note fournisseur');
exports.removePreferredSupplier = temporaryResponse('Suppression fournisseur');

