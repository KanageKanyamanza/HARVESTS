// Export all payment services
const paymentService = require('./paymentService');
const paymentPaypalService = require('./paymentPaypalService');
const paymentRefundService = require('./paymentRefundService');
const paymentAdminService = require('./paymentAdminService');
const paymentWebhookService = require('./paymentWebhookService');

module.exports = {
  ...paymentService,
  ...paymentPaypalService,
  ...paymentRefundService,
  ...paymentAdminService,
  ...paymentWebhookService
};

