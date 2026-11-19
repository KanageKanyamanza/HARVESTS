// Webhook payin AfriBaPay (Jour 77) : contrôleur volontairement mince — le
// service gère lui-même ses codes de réponse (machine-to-machine, sans i18n :
// c'est l'agrégateur qui appelle, seul l'humain lit les alertes admin).
const paymentAfribapayWebhookService = require("../../services/payment/paymentAfribapayWebhookService");

// Non-catchAsync : le service renvoie ses propres réponses (403 signature,
// 503 non configuré, 200 sur tout événement traité/ignoré, 500 en interne)
// et ne doit jamais passer par le gestionnaire d'erreurs global i18n.
exports.handleAfribapayWebhook = (req, res) =>
	paymentAfribapayWebhookService.handleAfribapayWebhook(req, res);
