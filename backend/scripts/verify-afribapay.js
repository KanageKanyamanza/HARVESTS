// Vérification sandbox AfriBaPay (Jour 86) — script réexécutable, sans base.
//
//   node scripts/verify-afribapay.js            # dry-run : 0 réseau, 0 Mongo
//   node scripts/verify-afribapay.js --live     # test /token en sandbox only
//
// Garde-fous : jamais de mongoose.connect (backend/.env pointe sur l'Atlas de
// PRODUCTION), refus des clés *_live_* et d'une URL de payin hors sandbox,
// secrets masqués via utils/afribapayUtils.redactSecrets. Les simulations
// payin/payout/refund et la recette navigateur restent à faire par l'humain.
require("dotenv").config();

const axios = require("axios");
const { redactSecrets } = require("../utils/afribapayUtils");
const {
	AFRIBAPAY_BASE_URL,
	AFRIBAPAY_PAYOUT_URL,
	AFRIBAPAY_API_USER,
	AFRIBAPAY_API_KEY,
	AFRIBAPAY_MERCHANT_KEY,
} = require("../config/afribapay");
// Même appel que l'application (utils/afribapayClient.js) : Basic auth et agent
// IPv4. Un /token sans Authorization renvoie 401 même avec des clés valides.
const { afribapayBasicAuth, ipv4Agent } = require("../utils/afribapayClient");

const SANDBOX_HOST = "api-sandbox.afribapay.com";
const LIVE_KEY_RE = /^(pk|sk|mk)_(live|prod|production)_/i;

/** Clés sandbox complètes et sans marqueur LIVE. */
const isSandboxCredentials = ({ apiUser, apiKey, merchantKey } = {}) => {
	const values = [apiUser, apiKey, merchantKey].map((value) => String(value || "").trim());
	if (values.some((value) => !value)) return false;
	return !values.some((value) => LIVE_KEY_RE.test(value));
};

const hostOf = (url) => {
	try {
		return new URL(String(url)).hostname.toLowerCase();
	} catch {
		return "";
	}
};

/** Refuse toute configuration susceptible de parler à la production. */
const assertSandboxSafe = ({ credentials, baseUrl, payoutUrl } = {}) => {
	if (!isSandboxCredentials(credentials)) {
		throw new RangeError(
			"Refus : clés AfriBaPay absentes ou clés LIVE détectées (sandbox uniquement)",
		);
	}
	const host = hostOf(baseUrl);
	if (host !== SANDBOX_HOST) {
		throw new RangeError(
			`Refus : URL de payin hors sandbox (${host || "invalide"}) — attendu ${SANDBOX_HOST}`,
		);
	}
	if (payoutUrl) {
		const payoutHost = hostOf(payoutUrl);
		if (/(^|\.)live|api\.afribapay\.com$/i.test(payoutHost)) {
			throw new RangeError(`Refus : URL de payout LIVE (${payoutHost})`);
		}
	}
};

/** order_id neuf à chaque lancement : AfriBaPay interdit la réutilisation. */
const buildVerifyOrderId = (prefix = "verify", now = Date.now()) =>
	`${prefix}-${now}-${Math.random().toString(16).slice(2, 10)}`;

const redactLog = (value) => redactSecrets(value);

const CHECKLIST = [
	"payin : initier un paiement mobile_money puis rejouer le webhook (double claim = 1 seul effet)",
	"payout : reversement vendeur, y compris statut ambigu et échec tardif",
	"refund : remboursement client puis relance d'un essai échoué",
	"vérifier qu'aucun log ne contient ?secret= ni merchant_key",
];

/**
 * Vérification de configuration. Par défaut : dry-run strict (aucun appel).
 * @param {{live?: boolean, credentials?: object, baseUrl?: string, payoutUrl?: string, http?: object, now?: number}} [options]
 */
const runVerification = async ({
	live = false,
	credentials,
	baseUrl = AFRIBAPAY_BASE_URL,
	payoutUrl = AFRIBAPAY_PAYOUT_URL,
	http = axios,
	now = Date.now(),
} = {}) => {
	const orderId = buildVerifyOrderId("verify", now);
	if (!live) {
		return {
			mode: "dry-run",
			orderId,
			steps: CHECKLIST,
			note: "Aucun appel réseau, aucune base. Ajouter --live pour tester /token en sandbox.",
		};
	}

	assertSandboxSafe({ credentials, baseUrl, payoutUrl });
	const response = await http.post(
		`${baseUrl}/token`,
		{},
		{
			headers: {
				Authorization: afribapayBasicAuth(credentials?.apiUser, credentials?.apiKey),
				"Content-Type": "application/json",
			},
			httpsAgent: ipv4Agent,
			timeout: 10_000,
		},
	);
	const body = response?.data;
	const tokenOk = Boolean(
		body?.data?.access_token || body?.token || body?.access_token,
	);
	return { mode: "live", orderId, steps: CHECKLIST, tokenOk };
};

module.exports = {
	isSandboxCredentials,
	assertSandboxSafe,
	buildVerifyOrderId,
	redactLog,
	runVerification,
	CHECKLIST,
};

if (require.main === module) {
	const live = process.argv.slice(2).includes("--live");
	const credentials = {
		apiUser: AFRIBAPAY_API_USER,
		apiKey: AFRIBAPAY_API_KEY,
		merchantKey: AFRIBAPAY_MERCHANT_KEY,
	};
	const overrides = {};
	if (process.env.AFRIBAPAY_BASE_URL) overrides.baseUrl = process.env.AFRIBAPAY_BASE_URL;
	if (process.env.AFRIBAPAY_PAYOUT_URL) overrides.payoutUrl = process.env.AFRIBAPAY_PAYOUT_URL;

	runVerification({ live, credentials, ...overrides })
		.then((result) => {
			console.log(`[verify-afribapay] mode=${result.mode} order_id=${result.orderId}`);
			for (const step of result.steps) console.log(`  - ${step}`);
			if (result.mode === "live") console.log(`  - /token : ${result.tokenOk ? "OK" : "échec"}`);
			process.exit(result.tokenOk === false ? 1 : 0);
		})
		.catch((error) => {
			console.error(`[verify-afribapay] ${redactLog(error.message)}`);
			process.exit(1);
		});
}
