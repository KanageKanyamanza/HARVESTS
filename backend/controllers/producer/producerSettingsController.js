const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const producerTransporterService = require('../../services/producer/producerTransporterService');
const producerDocumentService = require('../../services/producer/producerDocumentService');
const producerDeliveryService = require('../../services/producer/producerDeliveryService');

// Gestion des transporteurs préférés
exports.getPreferredTransporters = catchAsync(async (req, res, next) => {
  try {
    const transporters = await producerTransporterService.getPreferredTransporters(req.user._id);
    res.status(200).json({
      status: 'success',
      results: transporters.length,
      data: { transporters }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.addPreferredTransporter = catchAsync(async (req, res, next) => {
  try {
    await producerTransporterService.addPreferredTransporter(req.user._id, req.body.transporterId);
    res.status(201).json({
      status: 'success',
      message: 'Transporteur ajouté aux préférés'
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.removePreferredTransporter = catchAsync(async (req, res, next) => {
  try {
    await producerTransporterService.removePreferredTransporter(req.user._id, req.params.transporterId);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Gestion des documents
exports.getMyDocuments = catchAsync(async (req, res, next) => {
  try {
    const documents = await producerDocumentService.getDocuments(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { documents }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.addDocument = catchAsync(async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Veuillez télécharger un document', 400));
    }
    const documentData = {
      ...req.body,
      document: req.file.filename
    };
    const document = await producerDocumentService.addDocument(req.user._id, documentData);
    res.status(201).json({
      status: 'success',
      data: { document }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

// Paramètres de livraison
exports.getDeliverySettings = catchAsync(async (req, res, next) => {
  try {
    const deliverySettings = await producerDeliveryService.getDeliverySettings(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { deliverySettings }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateDeliverySettings = catchAsync(async (req, res, next) => {
  try {
    const deliverySettings = await producerDeliveryService.updateDeliverySettings(req.user._id, req.body);
    res.status(200).json({
      status: 'success',
      data: { deliverySettings }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

