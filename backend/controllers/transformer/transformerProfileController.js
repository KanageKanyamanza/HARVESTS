const Transformer = require('../../models/Transformer');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const transformerProfileService = require('../../services/transformer/transformerProfileService');
const transformerCertificationService = require('../../services/transformer/transformerCertificationService');

// ROUTES PROTÉGÉES TRANSFORMATEUR
exports.getMyProfile = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user._id);
  res.status(200).json({ status: 'success', data: { transformer } });
});

exports.updateMyProfile = catchAsync(async (req, res, next) => {
  try {
    const transformer = await transformerProfileService.updateTransformerProfile(req.user._id, req.body);
    res.status(200).json({ status: 'success', data: { transformer } });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.getCompanyInfo = catchAsync(async (req, res, next) => {
  const transformer = await Transformer.findById(req.user._id)
    .select('companyName companyRegistrationNumber transformationType');
  res.status(200).json({
    status: 'success',
    data: { companyInfo: transformer }
  });
});

exports.updateCompanyInfo = catchAsync(async (req, res, next) => {
  try {
    const transformer = await transformerProfileService.updateCompanyInfo(req.user._id, req.body);
    res.status(200).json({ status: 'success', data: { transformer } });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

// Gestion des certifications 
exports.getMyCertifications = catchAsync(async (req, res, next) => {
  try {
    const certifications = await transformerCertificationService.getCertifications(req.user._id);
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
    const certification = await transformerCertificationService.addCertification(req.user._id, certificationData);
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
    const certification = await transformerCertificationService.updateCertification(req.user._id, req.params.certId, req.body);
    res.status(200).json({ status: 'success', data: { certification } });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.removeCertification = catchAsync(async (req, res, next) => {
  try {
    await transformerCertificationService.removeCertification(req.user._id, req.params.certId);
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

