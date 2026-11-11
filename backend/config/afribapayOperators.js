// Opérateurs mobile money proposés au checkout, par pays (Jour 79) — relevés
// AfriBaPay repris de countriesData.js / countries_initial.js d'AfricaSend.
// Le nom affiché reste la source du code envoyé à AfriBaPay
// (utils/afribapayOperator.js) ; on renvoie les deux pour que le frontend
// n'ait ni à dupliquer la table ni à connaître les codes.
//
// Un pays absent de cette table n'a pas d'opérateur documenté : le frontend
// masque alors l'option « Mobile Money » plutôt que de laisser le client
// saisir un numéro qui serait refusé par AfriBaPay.
const { toAfribapayOperator } = require("../utils/afribapayOperator");

const COUNTRIES = {
	SN: {
		phoneCode: "+221",
		phoneLength: 9,
		operators: ["Wave", "Orange Money", "Free Money", "E-money"],
	},
	CI: {
		phoneCode: "+225",
		phoneLength: 10,
		operators: ["Wave", "Orange Money", "MTN Money", "Moov Money"],
	},
	CM: {
		phoneCode: "+237",
		phoneLength: 9,
		operators: ["Orange Money", "MTN Money"],
	},
	BF: {
		phoneCode: "+226",
		phoneLength: 8,
		operators: ["Orange Money", "Moov Money", "Wave"],
	},
	ML: {
		phoneCode: "+223",
		phoneLength: 8,
		operators: ["Orange Money", "Moov Money"],
	},
	BJ: {
		phoneCode: "+229",
		phoneLength: 10,
		operators: ["MTN Money", "Moov Money"],
	},
	TG: {
		phoneCode: "+228",
		phoneLength: 8,
		operators: ["TMoney", "Moov Money"],
	},
	GA: {
		phoneCode: "+241",
		phoneLength: 9,
		operators: ["Airtel Money", "Moov Money"],
	},
	CG: {
		phoneCode: "+242",
		phoneLength: 9,
		operators: ["MTN Money"],
	},
	CD: {
		phoneCode: "+243",
		phoneLength: 9,
		operators: [
			"M-Pesa",
			"Orange Money",
			"Airtel Money",
			"Afri Money",
			"Vodacom",
		],
	},
	TD: {
		phoneCode: "+235",
		phoneLength: 8,
		operators: ["Airtel Money", "Moov Money"],
	},
	CF: {
		phoneCode: "+236",
		phoneLength: 8,
		operators: ["Orange Money", "Telecel"],
	},
	GM: {
		phoneCode: "+220",
		phoneLength: 7,
		operators: ["Afri Money"],
	},
	GN: {
		phoneCode: "+224",
		phoneLength: 9,
		operators: ["Orange Money", "MTN Money"],
	},
	GW: {
		phoneCode: "+245",
		phoneLength: 9,
		operators: ["Orange Money"],
	},
	NE: {
		phoneCode: "+227",
		phoneLength: 8,
		operators: [
			"Airtel Money",
			"Moov Money",
			"Wallet LigdiCash",
			"Amanata",
			"Nita",
			"Zamani Cash",
		],
	},
};

// Nom canonique d'un code AfriBaPay : le Payment ne stocke que le code
// (paymentDetails.afribapay.operator), la page d'attente doit réafficher le
// nom du service choisi même après un rechargement.
const OPERATOR_LABELS = {
	wave: "Wave",
	orange: "Orange Money",
	free: "Free Money",
	emoney: "E-money",
	mtn: "MTN Money",
	moov: "Moov Money",
	tmoney: "TMoney",
	airtel: "Airtel Money",
	afrimoney: "Afri Money",
	mpesa: "M-Pesa",
	vodacom: "Vodacom",
	celtiis: "Celtiis",
	coris: "Coris Money",
	wligdicash: "Wallet LigdiCash",
	amanata: "Amanata",
	nita: "Nita",
	zamani: "Zamani Cash",
	expresso: "Expresso",
	telecel: "Telecel",
};

const normalizeCountry = (country) => {
	const code = String(country || "")
		.trim()
		.toUpperCase();
	return COUNTRIES[code] ? code : null;
};

/**
 * Opérateurs (nom affiché + code AfriBaPay) d'un pays, avec les métadonnées
 * téléphone utiles au placeholder du champ numéro.
 * @param {string} country code ISO 2 lettres (« SN »)
 */
const listOperatorsForCountry = (country) => {
	const requested = String(country || "")
		.trim()
		.toUpperCase();
	const code = normalizeCountry(requested);
	const entry = code ? COUNTRIES[code] : null;

	return {
		country: code || requested,
		phoneCode: entry?.phoneCode || null,
		phoneLength: entry?.phoneLength || null,
		operators: (entry?.operators || []).map((name) => ({
			name,
			code: toAfribapayOperator(name),
		})),
	};
};

/**
 * Nom affiché d'un code opérateur AfriBaPay ; le code brut en dernier recours.
 * @param {string} code code stocké sur le Payment (« mpesa », « orange »…)
 */
const operatorLabel = (code) =>
	OPERATOR_LABELS[String(code || "").toLowerCase()] || String(code || "");

module.exports = {
	COUNTRIES,
	OPERATOR_LABELS,
	normalizeCountry,
	listOperatorsForCountry,
	operatorLabel,
};
