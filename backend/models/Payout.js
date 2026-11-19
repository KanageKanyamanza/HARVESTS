// Reversement d'un vendeur en mobile money via AfriBaPay (Jour 80).
// Un Payout regroupe une ou plusieurs commandes livrées et encaissées d'un même
// vendeur (services/payment/paymentPayoutService.js) ; le montant dû est
// calculé ligne par ligne au taux de commission en vigueur (config/payout.js).
// Le Jour 80 ne crée aucun document : l'envoi et le verrou anti-doublon
// (Jour 81), le webhook payout (Jour 82) et les frais réels (Jour 84)
// rempliront attempts, afribapay et fees.
const mongoose = require('mongoose');
const { afribapayCostsSchema } = require('./afribapayCosts');
const {
  PAYOUT_STATUSES,
  PAYOUT_SELLER_TYPES,
  PAYOUT_CURRENCIES,
  COUNTRY_PAYOUT_CURRENCY
} = require('../config/payout');
const { normalizeCountry, listOperatorsForCountry } = require('../config/afribapayOperators');

// Francs CFA : aucun centime, tous les montants sont des entiers.
const isInteger = {
  validator: Number.isInteger,
  message: 'validation.amount_integer'
};

const sum = (lines, field) =>
  (lines || []).reduce((total, line) => total + (Number(line?.[field]) || 0), 0);

// Une commande du lot (assiette = articles du vendeur, hors livraison, taxes et coupon)
const payoutLineSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  orderNumber: String,
  gross: { type: Number, required: true, min: 0, validate: isInteger },      // assiette du vendeur
  commission: { type: Number, required: true, min: 0, validate: isInteger }, // arrondie par ligne
  net: { type: Number, required: true, min: 0, validate: isInteger },        // gross − commission
  settledBy: { type: String, enum: ['cash', 'mobile_money', 'paypal'] }      // moyen d'encaissement (order.payment.method)
}, { _id: false });

// Une tentative d'envoi (Jour 81) : order_id unique par tentative
// (payout-<id>, relance payout-<id>-r2…), AfriBaPay refusant sa réutilisation.
const payoutAttemptSchema = new mongoose.Schema({
  attempt: Number,          // 1 = premier envoi
  orderId: String,          // order_id envoyé à AfriBaPay
  status: String,           // statut de la tentative (PAYOUT_STATUSES)
  processorStatus: String,  // statut brut AfriBaPay
  transactionId: String,    // transaction_id AfriBaPay
  error: String,            // motif d'échec expurgé (redactSecrets)
  sentAt: { type: Date, default: Date.now }
}, { _id: false });

// Suivi AfriBaPay de la tentative courante, sur le modèle de
// Payment.paymentDetails.afribapay (payin).
const afribapaySchema = new mongoose.Schema({
  payoutOrderId: String,   // order_id de la tentative courante — unique (index sparse)
  attempt: Number,         // numéro de la tentative courante
  transactionId: String,   // transaction_id AfriBaPay de la tentative courante
  processorStatus: String, // dernier statut renvoyé par AfriBaPay
  lastPolledAt: Date,      // dernière interrogation /status (Jour 81)
  lastPollResult: String,  // dernier statut brut renvoyé par /status
  lockedAt: Date           // verrou d'envoi pris (claimPayout) — diagnostic
}, { _id: false });

const payoutSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerType: { type: String, enum: PAYOUT_SELLER_TYPES, required: true },
  sellerUserType: String, // userType d'origine (transformer, exporter… → sellerType « other »)

  lines: {
    type: [payoutLineSchema],
    validate: [
      {
        validator: (lines) => Array.isArray(lines) && lines.length > 0,
        message: 'validation.payout_lines_required'
      },
      {
        // Une commande n'est reversée qu'une fois par Payout ; l'index unique
        // (seller, lines.order) ne protège qu'entre documents.
        validator: (lines) => {
          const orders = (lines || []).map((line) => String(line?.order));
          return new Set(orders).size === orders.length;
        },
        message: 'validation.payout_duplicate_order'
      }
    ]
  },

  currency: {
    type: String,
    enum: PAYOUT_CURRENCIES,
    required: true,
    validate: {
      // Devise de reversement du pays (SN → XOF, CM → XAF…)
      validator: function (currency) {
        const expected = COUNTRY_PAYOUT_CURRENCY[this.country];
        return !expected || currency === expected;
      },
      message: 'validation.payout_currency_country_mismatch'
    }
  },
  commissionRate: {
    type: Number,
    required: true,
    validate: {
      validator: (rate) => Number.isFinite(rate) && rate >= 0 && rate < 1,
      message: 'validation.commission_rate_range'
    }
  },

  // Totaux = Σ des lignes (l'arrondi se fait par ligne, jamais sur le total)
  grossAmount: {
    type: Number,
    required: true,
    min: 0,
    validate: [
      isInteger,
      {
        validator: function (value) { return value === sum(this.lines, 'gross'); },
        message: 'validation.payout_totals_mismatch'
      }
    ]
  },
  commissionAmount: {
    type: Number,
    required: true,
    min: 0,
    validate: [
      isInteger,
      {
        validator: function (value) { return value === sum(this.lines, 'commission'); },
        message: 'validation.payout_totals_mismatch'
      }
    ]
  },
  amount: { // net reversé au vendeur
    type: Number,
    required: true,
    min: 1,
    validate: [
      isInteger,
      {
        validator: function (value) { return value === sum(this.lines, 'net'); },
        message: 'validation.payout_totals_mismatch'
      }
    ]
  },

  // Pays du vendeur : code ISO exact couvert par AfriBaPay ET payable en
  // XOF/XAF (pas de mise en majuscules silencieuse : « sn » est refusé).
  country: {
    type: String,
    required: true,
    validate: {
      validator: (country) => normalizeCountry(country) === country && !!COUNTRY_PAYOUT_CURRENCY[country],
      message: 'validation.payout_country_not_covered'
    }
  },
  // Code AfriBaPay (utils/afribapayOperator.js) proposé dans ce pays
  operator: {
    type: String,
    required: true,
    validate: {
      validator: function (operator) {
        return listOperatorsForCountry(this.country).operators.some((op) => op.code === operator);
      },
      message: 'validation.payout_operator_not_in_country'
    }
  },
phone: { type: String, required: true }, // format AfriBaPay (formatPhoneForAfribapay)

// Conversion XOF → XAF (Jour 81) : les commandes sont libellées en XOF, les
// vendeurs des pays XAF sont payés en XAF. Le taux appliqué et la devise source
// sont enregistrés pour l'audit (le back-office du Jour 85 doit pouvoir
// expliquer un montant). Un Payout antérieur au Jour 81 n'a pas de fx : le
// champ reste facultatif, mais `buildPayoutDoc` le pose toujours.
fx: {
	type: new mongoose.Schema(
		{
			rate: {
				type: Number,
				required: true,
				validate: {
					validator: (rate) => Number.isFinite(rate) && rate > 0,
					message: 'validation.payout_fx_rate_invalid'
				}
			},
			sourceCurrency: { type: String, enum: PAYOUT_CURRENCIES, required: true },
			targetCurrency: { type: String, enum: PAYOUT_CURRENCIES, required: true },
			convertedAt: { type: Date, default: Date.now }
		},
		{ _id: false }
	),
	validate: {
		// Une conversion ne se prononce que si les devises diffèrent : entre
		// XOF et XOF, le taux doit rester 1 (aucun effet de bord d'arrondi).
		validator: (fx) => !fx || fx.sourceCurrency !== fx.targetCurrency || fx.rate === 1,
		message: 'validation.payout_fx_same_currency_rate_one'
	}
},

status: { type: String, enum: PAYOUT_STATUSES, default: 'pending' },
  attempts: [payoutAttemptSchema],
  afribapay: afribapaySchema,

  // Frais réels AfriBaPay (Jour 84, extractAfribapayCosts) : frais et taxes
  // effectivement prélevés sur le reversement. `capturedAt` reste vide tant
  // qu'aucune réponse ne les a fournis (défauts à 0 = non mesuré).
  fees: { type: afribapayCostsSchema, default: () => ({}) },

  succeededAt: Date,
  failedAt: Date,
  failureReason: String
}, {
  timestamps: true,
  // Deux webhooks concurrents (FAILED d'un essai remplacé / SUCCESS du nouveau)
  // chargent puis enregistrent le même document : sans contrôle de version, le
  // dernier écrivain pourrait rétrograder un `succeeded` en `failed`. Une
  // VersionError remonte au handler, qui répond 500 et libère sa clé anti-replay
  // — AfriBaPay retente, relit le statut courant et n'applique rien.
  optimisticConcurrency: true
});

// Une commande n'est jamais reversée deux fois au même vendeur
payoutSchema.index({ seller: 1, 'lines.order': 1 }, { unique: true });
payoutSchema.index({ 'afribapay.payoutOrderId': 1 }, { unique: true, sparse: true });
payoutSchema.index({ status: 1, createdAt: -1 });
payoutSchema.index({ country: 1, status: 1 });

module.exports = mongoose.model('Payout', payoutSchema);
