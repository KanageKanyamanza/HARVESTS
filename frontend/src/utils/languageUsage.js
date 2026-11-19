import { getConfig } from "../config/production";

// Jour 73 (lancement bilingue) : suivi du taux d'usage de la bascule
// anglais. La feuille de route demande de « suivre le taux d'usage de la
// bascule anglaise » au lancement, puis de « se baser sur les retours /
// usages remontés » pour l'extension progressive (Jour 74). Ce module
// relève chaque bascule explicite auprès de l'API
// (GET /api/v1/language-usage), qui les agrège pour l'admin
// (adminAnalyticsController.getLanguageUsage).
//
// Motifs respectés :
// - pas d'identifiant personnel : un identifiant anonyme et stable de
//   navigateur (localStorage), comme les visites de blog (TrackingService) ;
// - fire-and-forget : la bascule de langue ne doit jamais attendre ni
//   échouer à cause du suivi (le suivi est la conséquence du clic, pas
//   une condition de son effet) ;
// - GET sans jeton : le suivi doit compter aussi les visiteurs non
//   connectés, et n'a aucune conséquence de sécurité à protéger (aucune
//   écriture nominative).

const VISITOR_ID_KEY = "harvests_visitor_id";

// Génère un identifiant anonyme du navigateur quand il n'existe pas encore.
// crypto.randomUUID est disponible sur tous les navigateurs récents ; le
// repli conserve une chaîne suffisamment discriminante sur cette session.
const createVisitorId = () => {
	try {
		if (typeof crypto !== "undefined" && crypto.randomUUID) {
			return crypto.randomUUID();
		}
	} catch {
		// crypto indisponible (contexte restreint) : repli ci-dessous
	}
	return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

/**
 * Identifiant stable du navigateur, anonyme : sert à compter des
 * visiteurs distincts (« combien de personnes ont essayé l'anglais »),
 * pas à identifier des comptes. Jamais envoyé au nom d'un utilisateur.
 */
export const getVisitorId = () => {
	try {
		let visitorId = localStorage.getItem(VISITOR_ID_KEY);
		if (!visitorId) {
			visitorId = createVisitorId();
			localStorage.setItem(VISITOR_ID_KEY, visitorId);
		}
		return visitorId;
	} catch {
		// localStorage bloqué (mode privé strict) : identifiant de session.
		// Chaque bascule comptera un visiteur de plus — biais assumé, mieux
		// vaut compter large que ne pas compter du tout.
		return createVisitorId();
	}
};

/**
 * Relève une bascule effective (appelée par changeLanguage, utils/i18n.js,
 * après que la langue a réellement changé).
 *
 * @param {Object} params
 * @param {string} params.from langue affichée avant le clic ("fr" | "en")
 * @param {string} params.to langue choisie ("fr" | "en")
 * @param {string} params.context endroit de l'interface : "header" (en-tête
 *   public), "footer", "topbar" (tableaux de bord), "auth" (connexion /
 *   inscription) — permet de repérer les sélecteurs vraiment employés.
 * @param {string} [params.path] chemin de la page au moment du clic ;
 *   renseigné par défaut ici pour que chaque appelant n'ait rien à faire.
 * @returns {Promise<void>} jamais bloquée : toute erreur est avalée.
 */
export const trackLanguageSwitch = ({ from, to, context, path } = {}) => {
	const payload = {
		context: context || "unknown",
		path,
	};

	try {
		const { API_BASE_URL } = getConfig();
		const query = new URLSearchParams();
		query.set("from", from);
		query.set("to", to);
		query.set("context", payload.context);
		query.set("path", payload.path || (typeof window !== "undefined" ? window.location.pathname : ""));
		query.set("visitor", getVisitorId());

		// fetch direct (pas l'instance api/) : le suivi part de tout
		// changement de langue, y compris depuis un écran qui n'a pas encore
		// monté le client HTTP, et ne doit déclencher ni intercepteur ni
		// boucle de rafraîchissement de session.
		return fetch(`${API_BASE_URL}/language-usage?${query}`, {
			credentials: "include",
			// keepalive : la bascule peut précéder une navigation immédiate,
			// la requête doit survivre au déchargement de la page.
			keepalive: true,
		}).catch(() => {
			// Un serveur injoignable ne doit pas marquer la console à chaque
			// bascule : le suivi est best-effort par conception.
		});
	} catch (error) {
		console.warn("Suivi de la bascule de langue impossible :", error);
		return Promise.resolve();
	}
};
