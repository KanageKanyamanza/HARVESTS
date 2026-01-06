export const CURRENCIES = [
	{
		code: "XOF",
		symbol: "FCFA",
		name: "Franc CFA (XOF)",
		locale: "fr-FR",
		exchangeRate: 1,
	},
	{
		code: "EUR",
		symbol: "€",
		name: "Euro",
		locale: "fr-FR",
		exchangeRate: 655.957,
	},
	{
		code: "USD",
		symbol: "$",
		name: "Dollar Américain",
		locale: "en-US",
		exchangeRate: 600, // Taux approximatif fixe pour l'exemple
	},
	{ code: "NGN", name: "Naira", symbol: "₦", exchangeRate: 0.4 },
	{ code: "GHS", name: "Cedi", symbol: "₵", exchangeRate: 40 },
	{ code: "KES", name: "Shilling Kényan", symbol: "KSh", exchangeRate: 4.5 },
	{ code: "ZAR", name: "Rand Sud-Africain", symbol: "R", exchangeRate: 35 },
	{ code: "MAD", name: "Dirham Marocain", symbol: "DH", exchangeRate: 60 },
	{ code: "EGP", name: "Livre Égyptienne", symbol: "E£", exchangeRate: 12 },
	{ code: "TZS", name: "Shilling Tchad", symbol: "TSh", exchangeRate: 0.25 },
	{ code: "UGX", name: "Shilling Ouganda", symbol: "USh", exchangeRate: 0.16 },
	{ code: "ZMW", name: "Kwacha Zambien", symbol: "ZK", exchangeRate: 25 },
	{ code: "ZWL", name: "Dollar Zimbabwe", symbol: "Z$", exchangeRate: 0.002 },
];

export const DEFAULT_CURRENCY = "XOF";

export const getCurrencySymbol = (code) => {
	const currency = CURRENCIES.find((c) => c.code === code);
	return currency ? currency.symbol : code;
};
