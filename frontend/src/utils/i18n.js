import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { fr, enUS } from "date-fns/locale";
import { getConfig } from "../config/production";
import { DEFAULT_CURRENCY } from "../config/currencies";
import { formatPriceForLanguage } from "./priceFormat";

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
import frDashboardTransporter from "../locales/fr/dashboard-transporter.json";
import frDashboardRestaurateur from "../locales/fr/dashboard-restaurateur.json";
import frAuth from "../locales/fr/auth.json";
import frBlog from "../locales/fr/blog.json";
import frSeo from "../locales/fr/seo.json";
import frProfile from "../locales/fr/profile.json";
import frSettings from "../locales/fr/settings.json";

import enCommon from "../locales/en/common.json";
import enNavigation from "../locales/en/navigation.json";
import enPublic from "../locales/en/public.json";
import enDashboardAdmin from "../locales/en/dashboard-admin.json";
import enDashboardConsumer from "../locales/en/dashboard-consumer.json";
import enDashboardProducer from "../locales/en/dashboard-producer.json";
import enDashboardTransporter from "../locales/en/dashboard-transporter.json";
import enDashboardRestaurateur from "../locales/en/dashboard-restaurateur.json";
import enAuth from "../locales/en/auth.json";
import enBlog from "../locales/en/blog.json";
import enSeo from "../locales/en/seo.json";
import enProfile from "../locales/en/profile.json";
import enSettings from "../locales/en/settings.json";

export const NAMESPACES = [
	"common",
	"navigation",
	"public",
	"dashboard-admin",
	"dashboard-consumer",
	"dashboard-producer",
	"dashboard-transporter",
	"dashboard-restaurateur",
	"auth",
	"blog",
	"seo",
	"profile",
	"settings",
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
		"dashboard-transporter": frDashboardTransporter,
		"dashboard-restaurateur": frDashboardRestaurateur,
		auth: frAuth,
		blog: frBlog,
		seo: frSeo,
		profile: frProfile,
		settings: frSettings,
	},
	en: {
		common: enCommon,
		navigation: enNavigation,
		public: enPublic,
		"dashboard-admin": enDashboardAdmin,
		"dashboard-consumer": enDashboardConsumer,
		"dashboard-producer": enDashboardProducer,
		"dashboard-transporter": enDashboardTransporter,
		"dashboard-restaurateur": enDashboardRestaurateur,
		auth: enAuth,
		blog: enBlog,
		seo: enSeo,
		profile: enProfile,
		settings: enSettings,
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

// Jour 69 (PWA) : le manifeste est un fichier statique par langue
// (public/manifest.json en français, public/manifest.en.json en anglais) — un
// manifeste ne sait pas décrire plusieurs langues à la fois. On échange le
// <link rel="manifest"> quand la langue change : le navigateur relit le
// manifeste dès que son href change, et une PWA déjà installée rafraîchit son
// nom/description au lancement suivant. index.html déclare le français par
// défaut (langue de repli, Jour 33) en attendant que le JS prenne le relais.
export const MANIFESTS_BY_LANGUAGE = {
	fr: "/manifest.json",
	en: "/manifest.en.json",
};

export const getManifestUrl = (language = "fr") =>
	MANIFESTS_BY_LANGUAGE[language] || MANIFESTS_BY_LANGUAGE.fr;

export const applyManifestLanguage = (language = "fr") => {
	if (typeof document === "undefined") return;
	const link = document.querySelector('link[rel="manifest"]');
	if (!link) return;
	const href = getManifestUrl(language);
	// Comparaison sur le chemin : on ne réécrit pas l'attribut (et ne relance
	// pas un téléchargement) quand la bonne langue est déjà en place.
	if (new URL(link.href, window.location.href).pathname !== href) {
		link.setAttribute("href", href);
	}
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

// Jour 35 : poser le cookie harvests_lang côté backend (httpOnly, donc pas
// modifiable en JS) en appelant un endpoint public avec ?lang= — le
// middleware detectLanguage (backend/config/i18n.js) le pose sur n'importe
// quelle route dès qu'il voit ce paramètre. /health est utilisé comme porteur
// neutre, sans effet de bord, déjà public et sans authentification.
//
// Jour 63 : ce cookie est la mémoire de la langue choisie côté serveur ; le
// middleware le relit avant l'en-tête Accept-Language. Le front le rafraîchit
// donc à chaque changement de langue, et aussi au démarrage pour que le
// cookie reste le miroir exact de la langue affichée (sans cela l'API
// répondrait dans la langue du navigateur alors que l'interface est en
// français).
const syncLanguageWithBackend = (language) => {
	try {
		const { API_BASE_URL } = getConfig();
		return fetch(
			`${API_BASE_URL}/health?lang=${encodeURIComponent(language)}`,
			{ credentials: "include" },
		).catch(() => {});
	} catch (error) {
		console.warn("Could not save language preference to backend:", error);
	}
};

// Aligner le cookie serveur sur la langue réellement affichée (une seule
// requête au chargement, le cookie n'est réécrit que s'il diffère).
syncLanguageWithBackend(detectLanguage());

// Jour 69 : même logique pour le manifeste PWA (français au chargement de
// index.html, anglais si l'utilisateur a choisi l'anglais).
applyManifestLanguage(detectLanguage());

// Fonction utilitaire pour changer la langue
export const changeLanguage = (language) => {
	if (["fr", "en"].includes(language)) {
		i18n.changeLanguage(language);
		localStorage.setItem("harvests_language", language);

		// Mettre à jour l'attribut lang du document
		document.documentElement.lang = language;

		// Jour 69 : suit la langue pour le manifeste PWA (nom, description,
		// raccourcis de l'application installée).
		applyManifestLanguage(language);

		syncLanguageWithBackend(language);
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

// Configuration des formats selon la langue/région
export const getLocaleConfig = (language = getCurrentLanguage()) => {
	const configs = {
		fr: {
			locale: "fr-FR",
			currency: "XOF", // FCFA — devise de vente, identique dans les deux langues
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
			// Jour 70 : la devise ne dépend pas de la langue affichée. Avant,
			// l'anglais retombait sur le cedi ghanéen (GHS) alors que tous les
			// prix de la plateforme sont libellés en FCFA.
			currency: "XOF",
			currencySymbol: "FCFA",
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

// Fonction utilitaire pour formater les prix : mêmes conventions que
// utils/currencyUtils.formatPrice (fr « 3 000 F CFA », en « FCFA 3,000 »).
export const formatPrice = (
	amount,
	currency = null,
	language = getCurrentLanguage()
) => formatPriceForLanguage(amount, currency || DEFAULT_CURRENCY, language);

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

// Date + heure courtes (ex. « 29 sept. 2026, 08:15 » / « Sep 29, 2026, 08:15 AM »)
// Jour 49 : listes de commandes et widgets du tableau de bord.
export const formatDateTime = (
	date,
	language = getCurrentLanguage(),
	options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" },
) => {
	const config = getLocaleConfig(language);
	try {
		return new Intl.DateTimeFormat(config.locale, options).format(new Date(date));
	} catch {
		return new Date(date).toLocaleString();
	}
};

// Mois à partir d'un code « AAAA-MM » renvoyé par l'API (ex. « 2026-09 »)
export const formatMonthCode = (
	monthCode,
	language = getCurrentLanguage(),
	options = { month: "short", year: "2-digit" },
) => {
	const [year, month] = String(monthCode || "").split("-").map(Number);
	if (!year || !month) return monthCode || "";
	const config = getLocaleConfig(language);
	try {
		return new Intl.DateTimeFormat(config.locale, options).format(new Date(year, month - 1));
	} catch {
		return monthCode;
	}
};

// Langue date-fns (« il y a 3 heures » / « 3 hours ago ») selon l'interface
export const getDateFnsLocale = (language = getCurrentLanguage()) =>
	language === "en" ? enUS : fr;

// Nom d'un pays dans la langue de l'interface à partir de son code ISO (« SN » → « Sénégal » / « Senegal »)
export const getCountryName = (code, language = getCurrentLanguage()) => {
	if (!code) return "";
	try {
		return new Intl.DisplayNames([language], { type: "region" }).of(String(code).toUpperCase()) || code;
	} catch {
		return code;
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
