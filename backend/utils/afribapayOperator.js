// Code opérateur AfriBaPay (champ `operator` des payin/payout) à partir du nom
// affiché — porté d'AfricaSend (utils/afribapayOperator.js), où il est la
// source unique du payin et du payout : leurs deux copies avaient divergé et
// envoyaient "m-pesa" / "afri" au lieu de "mpesa" / "afrimoney" (RDC :
// 12 envois M-Pesa sur 12 annulés, aucun réussi). Codes relevés via
// GET /v1/countries le 14/10/2026.
//
// Comparaison sur le nom réduit à ses lettres et chiffres ("M-Pesa" → "mpesa",
// "Afri Money" → "afrimoney"), du motif le plus spécifique au plus général.
// "emoney" et "tmoney" seulement en début de nom : "orangemoney" et
// "freemoney" contiennent "emoney" et partiraient sinon comme E-money.
const PREFIX_ONLY = new Set(["emoney", "tmoney"]);
const CODES = [
	["wligdicash", "wligdicash"],
	["ligdicash", "wligdicash"],
	["afrimoney", "afrimoney"],
	["mpesa", "mpesa"],
	["emoney", "emoney"],
	["tmoney", "tmoney"],
	["orange", "orange"],
	["mtn", "mtn"],
	["moov", "moov"],
	["wave", "wave"],
	["airtel", "airtel"],
	["free", "free"],
	["expresso", "expresso"],
	["vodacom", "vodacom"],
	["celtiis", "celtiis"],
	["coris", "coris"],
	["amanata", "amanata"],
	["nita", "nita"],
	["zamani", "zamani"],
	["card", "card"],
	["carte", "card"],
];

const toAfribapayOperator = (name) => {
	const key = String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
	const hit = CODES.find(([pattern]) =>
		PREFIX_ONLY.has(pattern) ? key.startsWith(pattern) : key.includes(pattern),
	);
	// Opérateur inconnu : premier mot, comme avant (AfriBaPay refusera s'il
	// n'existe pas).
	return hit ? hit[1] : String(name || "").toLowerCase().split(" ")[0];
};

module.exports = { toAfribapayOperator };
