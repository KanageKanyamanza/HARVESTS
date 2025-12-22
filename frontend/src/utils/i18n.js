import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import des traductions
import frTranslations from "../locales/fr.json";
import enTranslations from "../locales/en.json";

// Configuration des ressources de traduction
const resources = {
	fr: {
		translation: frTranslations,
	},
	en: {
		translation: enTranslations,
	},
};

// Détection de la langue
const detectLanguage = () => {
	// 1. Vérifier le localStorage
	const savedLanguage = localStorage.getItem("harvests_language");
	if (savedLanguage && ["fr", "en"].includes(savedLanguage)) {
		return savedLanguage;
	}

	// 2. Vérifier la langue du navigateur
	const browserLanguage = navigator.language.split("-")[0];
	if (["fr", "en"].includes(browserLanguage)) {
		return browserLanguage;
	}

	// 3. Défaut : français
	return "fr";
};

// Configuration i18next
i18n.use(initReactI18next).init({
	resources,
	lng: detectLanguage(),
	fallbackLng: "fr",
	debug: false,

	interpolation: {
		escapeValue: false, // React échappe déjà les valeurs
	},

	// Configuration des namespaces
	// Les ressources sont chargées dans le namespace par défaut 'translation'
	// Pas besoin de spécifier ns ou defaultNS si on utilise la structure standard

	// Options de détection
	detection: {
		order: ["localStorage", "navigator"],
		caches: ["localStorage"],
		lookupLocalStorage: "harvests_language",
	},

	// Fonction de callback quand la langue change
	saveMissing: true,
	missingKeyHandler: (lng, ns, key, fallbackValue) => {
		if (import.meta.env.DEV) {
			console.warn(`Missing translation key: ${key} for language: ${lng}`);
		}
	},
});

// Fonction utilitaire pour changer la langue
export const changeLanguage = (language) => {
	if (["fr", "en"].includes(language)) {
		i18n.changeLanguage(language);
		localStorage.setItem("harvests_language", language);

		// Mettre à jour l'attribut lang du document
		document.documentElement.lang = language;

		// Optionnel : notifier le backend de la préférence
		try {
			const token = localStorage.getItem("harvests_token");
			if (token) {
				// Appel API pour sauvegarder la préférence utilisateur
				// Cette fonction sera implémentée plus tard avec les services API
			}
		} catch (error) {
			console.warn("Could not save language preference to backend:", error);
		}
	}
};

// Fonction pour obtenir la langue actuelle
export const getCurrentLanguage = () => i18n.language || "fr";

// Fonction pour obtenir les langues disponibles
export const getAvailableLanguages = () => ["fr", "en"];

// Fonction pour obtenir les informations de langue
export const getLanguageInfo = (lang = getCurrentLanguage()) => {
	const languages = {
		fr: {
			code: "fr",
			name: "Français",
			nativeName: "Français",
			flag: "🇫🇷",
			dir: "ltr",
		},
		en: {
			code: "en",
			name: "English",
			nativeName: "English",
			flag: "🇬🇧",
			dir: "ltr",
		},
	};

	return languages[lang] || languages.fr;
};

// Hook personnalisé pour la traduction (alternative à useTranslation)
export const useHarvestsTranslation = () => {
	return {
		t: i18n.t.bind(i18n),
		i18n,
		language: getCurrentLanguage(),
		changeLanguage,
		getLanguageInfo: () => getLanguageInfo(getCurrentLanguage()),
	};
};

// Configuration des formats selon la langue/région
export const getLocaleConfig = (language = getCurrentLanguage()) => {
	const configs = {
		fr: {
			locale: "fr-FR",
			currency: "XAF", // FCFA pour les pays francophones
			currencySymbol: "FCFA",
			dateFormat: "DD/MM/YYYY",
			timeFormat: "HH:mm",
			numberFormat: {
				decimal: ",",
				thousands: " ",
			},
		},
		en: {
			locale: "en-US",
			currency: "GHS", // Par défaut Ghana Cedi
			currencySymbol: "₵",
			dateFormat: "MM/DD/YYYY",
			timeFormat: "hh:mm A",
			numberFormat: {
				decimal: ".",
				thousands: ",",
			},
		},
	};

	return configs[language] || configs.fr;
};

// Fonction utilitaire pour formater les prix
export const formatPrice = (
	amount,
	currency = null,
	language = getCurrentLanguage()
) => {
	const config = getLocaleConfig(language);
	const currencyToUse = currency || config.currency;

	try {
		return new Intl.NumberFormat(config.locale, {
			style: "currency",
			currency: currencyToUse,
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	} catch (error) {
		// Fallback si la devise n'est pas supportée
		return `${amount.toLocaleString(config.locale)} ${config.currencySymbol}`;
	}
};

// Fonction utilitaire pour formater les dates
export const formatDate = (date, language = getCurrentLanguage()) => {
	const config = getLocaleConfig(language);

	try {
		return new Intl.DateTimeFormat(config.locale, {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(new Date(date));
	} catch (error) {
		return new Date(date).toLocaleDateString();
	}
};

// Fonction utilitaire pour formater les nombres
export const formatNumber = (number, language = getCurrentLanguage()) => {
	const config = getLocaleConfig(language);

	try {
		return new Intl.NumberFormat(config.locale).format(number);
	} catch (error) {
		return number.toString();
	}
};

export default i18n;
