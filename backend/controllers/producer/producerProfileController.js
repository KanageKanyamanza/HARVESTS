const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const producerProfileService = require('../../services/producer/producerProfileService');
const producerCertificationService = require('../../services/producer/producerCertificationService');

// Obtenir mon profil
exports.getMyProfile = catchAsync(async (req, res, next) => {
  try {
    const producer = await producerProfileService.getProducerProfile(req.user._id);
    res.status(200).json({
      status: 'success',
      data: { producer }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Mettre à jour mon profil
exports.updateMyProfile = catchAsync(async (req, res, next) => {
  try {
    const producer = await producerProfileService.updateProducerProfile(req.user._id, req.body);
    res.status(200).json({
      status: 'success',
      data: { producer }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Gestion des certifications
exports.getMyCertifications = catchAsync(async (req, res, next) => {
  try {
    const certifications = await producerCertificationService.getCertifications(req.user._id);
    res.status(200).json({
      status: 'success',
      results: certifications.length,
      data: { certifications }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.addCertification = catchAsync(async (req, res, next) => {
  try {
    const certificationData = { ...req.body };
    if (req.file) certificationData.document = req.file.filename;
    const certification = await producerCertificationService.addCertification(req.user._id, certificationData);
    res.status(201).json({
      status: 'success',
      data: { certification }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.updateCertification = catchAsync(async (req, res, next) => {
  try {
    const certification = await producerCertificationService.updateCertification(req.user._id, req.params.certId, req.body);
    res.status(200).json({
      status: 'success',
      data: { certification }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.removeCertification = catchAsync(async (req, res, next) => {
  try {
    await producerCertificationService.removeCertification(req.user._id, req.params.certId);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

