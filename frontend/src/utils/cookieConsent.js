/**
 * Gestion du consentement aux cookies non essentiels.
 * Les cookies strictement nécessaires (session, protection CSRF) ne sont
 * pas soumis à consentement — seules les catégories facultatives le sont.
 */

const STORAGE_KEY = "harvests_cookie_consent";
const REOPEN_EVENT = "harvests:open-cookie-preferences";

export const COOKIE_CATEGORIES = [
	{
		id: "essential",
		label: "Essentiels",
		description:
			"Nécessaires au fonctionnement du site (connexion, sécurité, panier). Toujours actifs.",
		locked: true,
	},
	{
		id: "performance",
		label: "Performance",
		description:
			"Nous aident à comprendre l'usage du site pour l'améliorer. Désactivés tant que vous ne les acceptez pas.",
		locked: false,
	},
	{
		id: "preference",
		label: "Préférence",
		description:
			"Mémorisent vos choix (langue, devise) d'une visite à l'autre.",
		locked: false,
	},
];

export function getCookieConsent() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

export function setCookieConsent(choices) {
	const record = {
		essential: true,
		performance: Boolean(choices.performance),
		preference: Boolean(choices.preference),
		decidedAt: new Date().toISOString(),
	};
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
	} catch {
		// Stockage indisponible (navigation privée stricte, etc.) : le choix ne persistera pas
	}
	return record;
}

export function openCookiePreferences() {
	window.dispatchEvent(new Event(REOPEN_EVENT));
}

export function onOpenCookiePreferences(handler) {
	window.addEventListener(REOPEN_EVENT, handler);
	return () => window.removeEventListener(REOPEN_EVENT, handler);
}
