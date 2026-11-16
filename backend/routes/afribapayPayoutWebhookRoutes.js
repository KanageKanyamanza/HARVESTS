const express = require("express");
const { handleAfribapayPayoutWebhook } = require("../controllers/payment/afribapayPayoutWebhookController");

/**
 * @swagger
 * tags:
 *   name: AfriBaPay Payout Webhook
 *   description: 💸 Notifications de reversement AfriBaPay (machine-to-machine)
 */

/**
 * Route du webhook payout AfriBaPay (Jour 82), montée dans app.js sur
 * AFRIBAPAY_PAYOUT_WEBHOOK_PATH (/api/v1/payouts/afribapay/webhook) — le chemin
 * annoncé à AfriBaPay dans la `notify_url` du POST /pay/payout. Montée AVANT
 * express.json pour vérifier la signature sur le corps brut, et sans
 * authentification Harvests (c'est AfriBaPay qui appelle).
 */
const router = express.Router();

/**
 * @swagger
 * /api/v1/payouts/afribapay/webhook:
 *   post:
 *     summary: Notification de reversement AfriBaPay (signature ou secret d'URL)
 *     description: >
 *       Reçoit les statuts des reversements vendeurs. Accepte l'en-tête
 *       `Afribapay-Sign` (HMAC-SHA256 du corps brut) ou le secret d'URL
 *       (`?secret=…` / en-tête `Afribapay-Secret`), réclame l'événement une
 *       seule fois (anti-replay), ne rétrograde jamais un reversement confirmé,
 *       notifie le vendeur au succès et alerte les admins sur échec définitif
 *       ou statut ambigu.
 *     tags: [AfriBaPay Payout Webhook]
 *     parameters:
 *       - in: header
 *         name: Afribapay-Sign
 *         required: false
 *         schema:
 *           type: string
 *         description: HMAC-SHA256 hexadécimal du corps brut
 *       - in: query
 *         name: secret
 *         required: false
 *         schema:
 *           type: string
 *         description: Secret d'URL (AFRIBAPAY_PAYOUT_WEBHOOK_SECRET)
 *     responses:
 *       200:
 *         description: Événement traité, déjà traité ou ignoré
 *       403:
 *         description: Signature et secret absents ou invalides
 *       503:
 *         description: Aucun canal d'authentification configuré
 */
router.post("/", handleAfribapayPayoutWebhook);

module.exports = router;
