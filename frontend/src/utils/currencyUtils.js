import { DEFAULT_CURRENCY, CURRENCIES } from "../config/currencies";

// Convertir le prix
export const convertPrice = (price, fromCurrency, toCurrency) => {
	if (!price) return 0;
	if (fromCurrency === toCurrency) return price;

	// Si l'une des devises est celle par défaut (FCFA), la conversion est directe
	if (fromCurrency === "FCFA" || fromCurrency === "XOF") {
		const config = CURRENCIES.find((c) => c.code === toCurrency);

		if (config && config.exchangeRate) {
			return price / config.exchangeRate;
		}
	}

	if (toCurrency === "FCFA" || toCurrency === "XOF") {
		const config = CURRENCIES.find((c) => c.code === fromCurrency);
		if (config && config.exchangeRate) {
			return price * config.exchangeRate;
		}
	}

	// Conversion croisée: convertir en FCFA puis dans la devise cible
	const fromConfig = CURRENCIES.find((c) => c.code === fromCurrency);
	const toConfig = CURRENCIES.find((c) => c.code === toCurrency);

	if (
		fromConfig &&
		toConfig &&
		fromConfig.exchangeRate &&
		toConfig.exchangeRate
	) {
		const priceInFcfa = price * fromConfig.exchangeRate;
		return priceInFcfa / toConfig.exchangeRate;
	}

	// console.warn("Conversion failed, returning original price");
	return price;
};

// Formater le prix
export const formatPrice = (price, currency = DEFAULT_CURRENCY) => {
	try {
		// Formattage spécial pour le FCFA (pas de décimales)
		const isFCFA = currency === "FCFA" || currency === "XOF";

		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: currency === "FCFA" ? "XOF" : currency, // Intl ne connait pas FCFA
			minimumFractionDigits: isFCFA ? 0 : 2,
			maximumFractionDigits: isFCFA ? 0 : 2,
		})
			.format(price)
			.replace("XOF", "FCFA");
	} catch (error) {
		console.warn(
			`Invalid currency code: ${currency}, falling back to ${DEFAULT_CURRENCY}`
		);
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: "XOF",
			minimumFractionDigits: 0,
		})
			.format(price)
			.replace("XOF", "FCFA");
	}
};
