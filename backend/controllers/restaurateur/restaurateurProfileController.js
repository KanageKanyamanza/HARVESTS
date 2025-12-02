const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Restaurateur = require('../../models/Restaurateur');
const restaurateurProfileService = require('../../services/restaurateur/restaurateurProfileService');
const restaurateurCertificationService = require('../../services/restaurateur/restaurateurCertificationService');

// Obtenir mon profil
exports.getMyProfile = catchAsync(async (req, res, next) => {
  const restaurateur = await Restaurateur.findById(req.user.id);
  res.status(200).json({ status: 'success', data: { restaurateur } });
});

// Mettre à jour mon profil
exports.updateMyProfile = catchAsync(async (req, res, next) => {
  try {
    const restaurateur = await restaurateurProfileService.updateMyProfile(req.user.id, req.body);
    res.status(200).json({ status: 'success', data: { restaurateur } });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Obtenir mes certifications
exports.getMyCertifications = catchAsync(async (req, res, next) => {
  const restaurateur = await Restaurateur.findById(req.user.id).select('certifications');
  res.status(200).json({
    status: 'success',
    results: restaurateur.certifications.length,
    data: { certifications: restaurateur.certifications }
  });
});

// Ajouter une certification
exports.addCertification = catchAsync(async (req, res, next) => {
  try {
    const certificationData = { ...req.body };
    if (req.file) certificationData.document = req.file.filename;
    const certification = await restaurateurCertificationService.addCertification(req.user.id, certificationData);
    res.status(201).json({
      status: 'success',
      data: { certification }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Mettre à jour une certification
exports.updateCertification = catchAsync(async (req, res, next) => {
  try {
    const certification = await restaurateurCertificationService.updateCertification(req.user.id, req.params.certId, req.body);
    res.status(200).json({ status: 'success', data: { certification } });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Supprimer une certification
exports.removeCertification = catchAsync(async (req, res, next) => {
  try {
    await restaurateurCertificationService.removeCertification(req.user.id, req.params.certId);
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

