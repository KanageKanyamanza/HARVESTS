import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getConfig } from "../config/production";

// Namespaces par domaine (Jour 34 - cadrage bilingue), un fichier par langue et
// par namespace : chaque écran ne demande que le(s) namespace(s) dont il a besoin
// via useTranslation('nom'), et deux personnes peuvent traduire des domaines
// différents sans se marcher dessus sur le même fichier.
import frCommon from "../locales/fr/common.json";
import frNavigation from "../locales/fr/navigation.json";
import frPublic from "../locales/fr/public.json";
import frDashboardAdmin from "../locales/fr/dashboard-admin.json";
import frDashboardConsumer from "../locales/fr/dashboard-consumer.json";
import frDashboardProducer from "../locales/fr/dashboard-producer.json";
import frAuth from "../locales/fr/auth.json";
import frBlog from "../locales/fr/blog.json";
import frSeo from "../locales/fr/seo.json";

import enCommon from "../locales/en/common.json";
import enNavigation from "../locales/en/navigation.json";
import enPublic from "../locales/en/public.json";
import enDashboardAdmin from "../locales/en/dashboard-admin.json";
import enDashboardConsumer from "../locales/en/dashboard-consumer.json";
import enDashboardProducer from "../locales/en/dashboard-producer.json";
import enAuth from "../locales/en/auth.json";
import enBlog from "../locales/en/blog.json";
import enSeo from "../locales/en/seo.json";

export const NAMESPACES = [
	"common",
	"navigation",
	"public",
	"dashboard-admin",
	"dashboard-consumer",
	"dashboard-producer",
	"auth",
	"blog",
	"seo",
];

// Configuration des ressources de traduction
const resources = {
	fr: {
		common: frCommon,
		navigation: frNavigation,
		public: frPublic,
		"dashboard-admin": frDashboardAdmin,
		"dashboard-consumer": frDashboardConsumer,
		"dashboard-producer": frDashboardProducer,
		auth: frAuth,
		blog: frBlog,
		seo: frSeo,
	},
	en: {
		common: enCommon,
		navigation: enNavigation,
		public: enPublic,
		"dashboard-admin": enDashboardAdmin,
		"dashboard-consumer": enDashboardConsumer,
		"dashboard-producer": enDashboardProducer,
		auth: enAuth,
		blog: enBlog,
		seo: enSeo,
	},
};

// Détection de la langue
// Décision Jour 33 (cadrage bilingue) : bascule explicite uniquement, pas de
// détection automatique via la langue du navigateur ni de géolocalisation.
// Un visiteur ne doit jamais atterrir en anglais sans l'avoir demandé.
const detectLanguage = () => {
	const savedLanguage = localStorage.getItem("harvests_language");
	if (savedLanguage && ["fr", "en"].includes(savedLanguage)) {
		return savedLanguage;
	}

	return "fr";
};

// Configuration i18next
i18n.use(initReactI18next).init({
	resources,
	lng: detectLanguage(),
	fallbackLng: "fr",
	debug: false,

	ns: NAMESPACES,
	defaultNS: "common",

	interpolation: {
		escapeValue: false, // React échappe déjà les valeurs
	},

	// Pas de plugin i18next-browser-languagedetector : la détection reste
	// entièrement gérée par detectLanguage() ci-dessus (localStorage only).

	// Fonction de callback quand la langue change
	saveMissing: true,
	missingKeyHandler: (lng, ns, key) => {
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

		// Jour 35 : poser le cookie harvests_lang côté backend (httpOnly, donc pas
		// modifiable en JS) en appelant un endpoint public avec ?lang= — le
		// middleware detectLanguage (backend/app.js) le pose sur n'importe quelle
		// route dès qu'il voit ce paramètre. /health est utilisé comme porteur
		// neutre, sans effet de bord, déjà public et sans authentification.
		try {
			const { API_BASE_URL } = getConfig();
			fetch(`${API_BASE_URL}/health?lang=${language}`, {
				credentials: "include",
			}).catch(() => {});
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
			flag: "FR",
			dir: "ltr",
		},
		en: {
			code: "en",
			name: "English",
			nativeName: "English",
			flag: "EN",
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
	} catch {
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
	} catch {
		return new Date(date).toLocaleDateString();
	}
};

// Fonction utilitaire pour formater les nombres
export const formatNumber = (number, language = getCurrentLanguage()) => {
	const config = getLocaleConfig(language);

	try {
		return new Intl.NumberFormat(config.locale).format(number);
	} catch {
		return number.toString();
	}
};

export default i18n;
