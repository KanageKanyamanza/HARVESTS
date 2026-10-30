import { DEFAULT_CURRENCY, CURRENCIES } from "../config/currencies";
import { formatPriceForLanguage } from "./priceFormat";

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

// Formater le prix selon la langue affichée (Jour 70) :
// fr « 3 000 F CFA », en « FCFA 3,000 ». Voir utils/priceFormat.js.
export const formatPrice = (price, currency = DEFAULT_CURRENCY, language) =>
	formatPriceForLanguage(price, currency, language);
