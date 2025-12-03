const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const transformerSupplierService = require('../../services/transformer/transformerSupplierService');

// Fournisseurs
exports.getPreferredSuppliers = catchAsync(async (req, res, next) => {
  try {
    const preferredSuppliers = await transformerSupplierService.getPreferredSuppliers(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { preferredSuppliers }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.addPreferredSupplier = catchAsync(async (req, res, next) => {
  try {
    const supplier = await transformerSupplierService.addPreferredSupplier(req.user._id, req.body);
    res.status(201).json({
      status: 'success',
      message: 'Fournisseur ajouté avec succès',
      data: { supplier }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateSupplierPreference = catchAsync(async (req, res, next) => {
  try {
    const supplier = await transformerSupplierService.updateSupplierPreference(req.user._id, req.params.supplierId, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Fournisseur mis à jour avec succès',
      data: { supplier }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.removePreferredSupplier = catchAsync(async (req, res, next) => {
  try {
    await transformerSupplierService.removePreferredSupplier(req.user._id, req.params.supplierId);
    res.status(200).json({
      status: 'success',
      message: 'Fournisseur supprimé avec succès'
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

