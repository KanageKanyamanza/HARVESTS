// Contrôleur du webhook payout AfriBaPay (Jour 82) : la logique vit dans
// services/payment/paymentPayoutWebhookService.js (décision pure testable sans
// base ni réseau), comme pour le webhook payin du Jour 77.
const { handleAfribapayPayoutWebhook } = require("../../services/payment/paymentPayoutWebhookService");

module.exports = { handleAfribapayPayoutWebhook };
