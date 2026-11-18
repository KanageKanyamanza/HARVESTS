/**
 * Helpers AfriBaPay portés d'AfricaSend (utils/afribapayUtils.js) — fondations
 * Jour 75. La vérification montant/devise des confirmations (payinMismatch,
 * ajoutée au Jour 77 pour le webhook) et l'extraction des coûts réels
 * (extractAfribapayCosts) rejoignent ce fichier à leurs jours dédiés
 * (frais Jour 84).
 */

/**
 * Normalise le numéro pour l'API AfriBaPay. Règle éprouvée dans AfricaSend :
 * AfriBaPay attend la partie locale du numéro ; on retire le préfixe
 * international ("00" et/ou indicatif pays) mais JAMAIS le 0 initial de la
 * partie nationale quand il est là.
 *
 * @param {string} phone Le numéro brut (souvent déjà avec préfixe international)
 * @param {string} countryCode Code ISO ("SN", "CI"…)
 * @returns {string} Le numéro au format attendu par l'opérateur
 */
const formatPhoneForAfribapay = (phone, countryCode) => {
	if (!phone) return "";

	// 1. Nettoyage de base : garder uniquement les chiffres
	let cleaned = String(phone).replace(/\D/g, "");

	// 2. Gérer le préfixe international "00" (ex : 00242 → 242)
	if (cleaned.startsWith("00")) {
		cleaned = cleaned.substring(2);
	}

	const prefixes = {
		SN: "221",
		CG: "242",
		CI: "225",
		BF: "226",
		ML: "223",
		NE: "227",
		CM: "237",
		BJ: "229",
		TG: "228",
		GA: "241",
		CD: "243",
		// Jour 80 : pays payables en XOF/XAF (config/payout.js), indicatifs
		// repris de config/afribapayOperators.js
		TD: "235",
		CF: "236",
		GW: "245",
	};

	const prefix = prefixes[countryCode];

	// 3. Retirer l'indicatif pays s'il est présent au début
	if (prefix && cleaned.startsWith(prefix)) {
		cleaned = cleaned.substring(prefix.length);
	}

	// 4. Garder la partie nationale telle quelle (zéro initial inclus)
	return cleaned;
};

/**
 * AfriBaPay renvoie parfois, en HTTP 200, un corps qui commence par un dump de
 * debug PHP (print_r : "Array ( [operator] => wave ... )") suivi du vrai JSON.
 * Axios ne peut alors pas parser le corps : response.data est un STRING, et un
 * payout pourtant accepté (data.status = SUCCESS) était traité comme un échec
 * dans AfricaSend (payout réellement parti + webhook SUCCESS, mais alerte
 * "échec" et relance planifiée — risque de double paiement). On cherche donc
 * l'objet JSON même à travers le préambule.
 *
 * @param {*} data response.data brut
 * @returns {object|null} l'objet JSON ; l'objet d'origine s'il l'était déjà ;
 *   null si le corps est un texte sans JSON exploitable
 */
const parseAfribapayBody = (data) => {
	if (data && typeof data === "object") return data;
	if (typeof data !== "string") return null;
	const text = data.trim();
	try {
		const direct = JSON.parse(text);
		if (direct && typeof direct === "object") return direct;
	} catch (e) {
		// pas du JSON pur : on cherche l'objet après le préambule de debug
	}
	const end = text.lastIndexOf("}");
	for (
		let i = text.indexOf('{"');
		i !== -1 && i < end;
		i = text.indexOf('{"', i + 1)
	) {
		try {
			const parsed = JSON.parse(text.slice(i, end + 1));
			if (parsed && typeof parsed === "object") return parsed;
		} catch (e) {
			// candidat suivant
		}
	}
	return null;
};

/**
 * Vérifie qu'une confirmation de payin AfriBaPay (webhook Jour 77, ou /status
 * Jour 78) porte bien sur le paiement demandé : même devise et même montant
 * encaissé. Doc AfriBaPay : amount, net_amount, original_amount et
 * amount_total ne sont pas interchangeables ; amount_total (repli :
 * original_amount) est le montant payé par le client — celui envoyé dans
 * /pay/payin (montant arrondi côté serveur, cf. buildPayinData). Comparé sur
 * l'export AfriBaPay du 14/10/2026 par AfricaSend : identique au total arrondi.
 *
 * Peut porter sur le corps AfriBaPay à plat ou sous .data.
 *
 * @param {object} payment Payment local (amount, currency)
 * @param {object} payload corps AfriBaPay, à plat ou sous .data
 * @returns {string|null} l'écart en clair ; null si conforme ou si AfriBaPay
 *   n'a renvoyé ni montant ni devise (rien à comparer)
 */
const payinMismatch = (payment, payload) => {
	const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
	if (!payment || !data || typeof data !== "object") return null;
	const currency = String(payment.currency || "XOF").toUpperCase();
	const expected = Math.round(Number(payment.amount) || 0);
	const issues = [];
	if (data.currency && String(data.currency).toUpperCase() !== currency) {
		issues.push(`devise ${data.currency} au lieu de ${currency}`);
	}
	const received = parseFloat(data.amount_total ?? data.original_amount);
	if (Number.isFinite(received) && Math.abs(received - expected) > 1) {
		issues.push(`montant ${received} au lieu de ${expected}`);
	}
	return issues.length ? issues.join(", ") : null;
};

/**
 * Montant AfriBaPay → nombre exploitable, ou null. Les réponses passent parfois
 * par un dump PHP (valeurs en chaîne), avec espaces de milliers et virgule
 * décimale. Une valeur négative ou illisible est ignorée : un coût ne se
 * devine pas.
 * @param {*} value
 * @returns {number|null}
 */
const toXofAmount = (value) => {
	if (value === null || value === undefined || value === "") return null;
	const raw = typeof value === "number" ? value : Number(String(value).replace(/\s/g, "").replace(",", "."));
	if (!Number.isFinite(raw) || raw < 0) return null;
	return Math.round(raw * 100) / 100;
};

/**
 * Coûts réels d'une transaction AfriBaPay (Jour 84) : `fees` et `taxes`
 * prélevés, `fees_taxes_ttc` étant le total effectivement débité du compte
 * marchand. Accepte la charge utile à plat, sous `.data`, `.data.data`, ou en
 * chaîne (dump debug PHP devant le JSON — voir parseAfribapayBody).
 *
 * Renvoie `null` quand AfriBaPay ne fournit aucun coût : le back-office doit
 * distinguer « coût inconnu » d'un coût réellement nul (mêmes garanties que
 * payinMismatch sur des montants absents).
 *
 * @param {object|string} payload corps AfriBaPay (réponse d'envoi, webhook, /status)
 * @returns {{fees: number, taxes: number, total: number}|null}
 */
const extractAfribapayCosts = (payload) => {
	const parsed = typeof payload === "string" ? parseAfribapayBody(payload) : payload;
	if (!parsed || typeof parsed !== "object") return null;

	// Enveloppes successives : corps à plat, .data, .data.data (selon les
	// endpoints) — la première qui porte un champ de coût fait foi.
	const candidates = [parsed];
	let node = parsed.data;
	while (node && typeof node === "object") {
		candidates.push(node);
		node = node.data;
	}

	for (const candidate of candidates) {
		if (!("fees" in candidate) && !("taxes" in candidate) && !("fees_taxes_ttc" in candidate)) {
			continue;
		}
		const fees = toXofAmount(candidate.fees);
		const taxes = toXofAmount(candidate.taxes);
		const declaredTotal = toXofAmount(candidate.fees_taxes_ttc);
		if (fees === null && taxes === null && declaredTotal === null) continue;

		const safeFees = fees ?? 0;
		const safeTaxes = taxes ?? 0;
		return {
			fees: safeFees,
			taxes: safeTaxes,
			// Un total déclaré à 0 vaut « non fourni » : la somme des composants
			// est alors la seule information fiable.
			total: declaredTotal ? declaredTotal : Math.round((safeFees + safeTaxes) * 100) / 100,
		};
	}

	return null;
};

// Variables d'environnement dont la valeur ne doit jamais apparaître dans un log.
const SECRET_ENV_KEYS = [
	"AFRIBAPAY_MERCHANT_KEY",
	"AFRIBAPAY_API_KEY",
	"AFRIBAPAY_WEBHOOK_SECRET",
	"AFRIBAPAY_PAYOUT_WEBHOOK_SECRET",
];

/**
 * Masque les secrets avant tout log : AfriBaPay renvoie même la requête en écho
 * dans ses réponses (dump PHP), et les logs sont copiés/collés lors des
 * diagnostics — AfricaSend a vu la merchant_key sorties à CHAQUE paiement.
 *
 * Trois filets, du plus précis au plus large, pour ne dépendre d'aucun format :
 *  1. la VALEUR exacte de chaque secret configuré (quel que soit son format) ;
 *  2. les champs nommés : `secret=` dans une URL, `merchant_key` en JSON ou en
 *     dump PHP (`[merchant_key] => …`) ;
 *  3. le format connu des clés marchand `mk_live_…`.
 */
const redactSecrets = (value) => {
	let text = typeof value === "string" ? value : JSON.stringify(value);
	if (typeof text !== "string") return text;

	for (const key of SECRET_ENV_KEYS) {
		const secret = process.env[key];
		// Trop court = risque de masquer du texte ordinaire (ex : la valeur "k" en test)
		if (secret && secret.length >= 8) text = text.split(secret).join("***");
	}

	return text
		.replace(/([?&]secret=)[A-Za-z0-9._~%-]+/g, "$1***")
		.replace(/("merchant_key"\s*:\s*")[^"]*(")/g, "$1***$2")
		.replace(/(\[merchant_key\]\s*=>\s*)\S+/g, "$1***")
		.replace(/mk_(live|test|sandbox)_[A-Za-z0-9]+/g, "mk_$1_***");
};

module.exports = {
	formatPhoneForAfribapay,
	parseAfribapayBody,
	payinMismatch,
	extractAfribapayCosts,
	redactSecrets,
};
