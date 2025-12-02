// Export all payment controllers
const paymentPaypalController = require('./paymentPaypalController');
const paymentController = require('./paymentController');
const paymentRefundController = require('./paymentRefundController');
const paymentAdminController = require('./paymentAdminController');
const paymentWebhookController = require('./paymentWebhookController');

module.exports = {
  // PayPal specific
  getPaypalClientToken: paymentPaypalController.getPaypalClientToken,
  createOrderForHostedFields: paymentPaypalController.createOrderForHostedFields,
  
  // Payment operations
  initiatePayment: paymentController.initiatePayment,
  confirmPayment: paymentController.confirmPayment,
  getMyPayments: paymentController.getMyPayments,
  getPayment: paymentController.getPayment,
  getMyRevenue: paymentController.getMyRevenue,
  
  // Refunds
  requestRefund: paymentRefundController.requestRefund,
  processRefund: paymentRefundController.processRefund,
  
  // Admin
  getAllPayments: paymentAdminController.getAllPayments,
  getPaymentStats: paymentAdminController.getPaymentStats,
  getUnreconciledPayments: paymentAdminController.getUnreconciledPayments,
  reconcilePayment: paymentAdminController.reconcilePayment,
  
  // Webhooks
  handlePaymentWebhook: paymentWebhookController.handlePaymentWebhook
};

