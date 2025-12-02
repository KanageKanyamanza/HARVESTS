const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const consumerAddressService = require('../../services/consumer/consumerAddressService');

// Gestion des adresses de livraison
exports.getDeliveryAddresses = catchAsync(async (req, res, next) => {
  try {
    const addresses = await consumerAddressService.getDeliveryAddresses(req.user.id);
    res.status(200).json({
      status: 'success',
      results: addresses.length,
      data: { addresses }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.addDeliveryAddress = catchAsync(async (req, res, next) => {
  try {
    const address = await consumerAddressService.addDeliveryAddress(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      data: { address }
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
});

exports.updateDeliveryAddress = catchAsync(async (req, res, next) => {
  try {
    const address = await consumerAddressService.updateDeliveryAddress(req.user.id, req.params.addressId, req.body);
    res.status(200).json({
      status: 'success',
      data: { address }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

exports.removeDeliveryAddress = catchAsync(async (req, res, next) => {
  try {
    await consumerAddressService.removeDeliveryAddress(req.user.id, req.params.addressId);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    return next(new AppError(error.message, error.message.includes('au moins') ? 400 : 404));
  }
});

exports.setDefaultAddress = catchAsync(async (req, res, next) => {
  try {
    const address = await consumerAddressService.setDefaultAddress(req.user.id, req.params.addressId);
    res.status(200).json({
      status: 'success',
      data: { address }
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
});

