/**
 * Helpers AfriBaPay portés d'AfricaSend (utils/afribapayUtils.js) — fondations
 * Jour 75. La vérification montant/devise des confirmations (payinMismatch) et
 * l'extraction des coûts réels (extractAfribapayCosts) rejoignent ce fichier à
 * leurs jours dédiés (webhook Jour 77, frais Jour 84).
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

module.exports = { formatPhoneForAfribapay, parseAfribapayBody, redactSecrets };
