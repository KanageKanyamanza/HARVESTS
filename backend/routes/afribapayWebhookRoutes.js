const express = require("express");
const { handleAfribapayWebhook } = require("../controllers/payment/afribapayWebhookController");

/**
 * @swagger
 * tags:
 *   name: AfriBaPay Webhook
 *   description: 💳 Notifications AfriBaPay (machine-to-machine, signées)
 */

/**
 * Routes du webhook payin AfriBaPay (Jour 77), montées dans app.js sur
 * /api/v1/payments/afribapay/webhook — SANS l'authentification globale des
 * routes /payments (c'est AfriBaPay qui appelle) et avec le corps brut capturé
 * avant express.json pour la vérification de l'en-tête Afribapay-Sign
 * (HMAC-SHA256 du corps brut, utils/afribapaySignature.js).
 */
const router = express.Router();

/**
 * @swagger
 * /api/v1/payments/afribapay/webhook:
 *   post:
 *     summary: Notification de payin AfriBaPay (webhook signé)
 *     description: >
 *       Reçoit les statuts des payins mobile money. Vérifie l'en-tête
 *       `Afribapay-Sign` (HMAC-SHA256 du corps brut : AFRIBAPAY_API_KEY,
 *       AFRIBAPAY_WEBHOOK_SECRET en repli), réclame l'événement une seule
 *       fois (anti-replay), contrôle montant/devise contre le paiement et ne
 *       rétrograde jamais un payin confirmé. Alerte les admins sur signature
 *       invalide et payin inconnu.
 *     tags: [AfriBaPay Webhook]
 *     parameters:
 *       - in: header
 *         name: Afribapay-Sign
 *         required: true
 *         schema:
 *           type: string
 *         description: HMAC-SHA256 hexadécimal du corps brut
 *     responses:
 *       200:
 *         description: Événement traité, déjà traité ou ignoré (statut intermédiaire, essai remplacé…)
 *       403:
 *         description: Signature manquante ou invalide
 *       503:
 *         description: AfriBaPay non configuré (AFRIBAPAY_API_KEY absent)
 */
router.post("/", handleAfribapayWebhook);

module.exports = router;
