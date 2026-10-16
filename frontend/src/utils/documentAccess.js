import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

/**
 * Jour 59 (sécurité) — documents administratifs protégés.
 * Les documents envoyés sur Cloudinary sont en accès « authenticated » : leur
 * URL brute renvoie 401. Le serveur (propriétaire ou admin seulement) renvoie
 * le fichier lui-même ; on l'affiche via une URL locale (blob:), ce qui permet
 * l'aperçu dans la page et ne laisse circuler aucun lien vers le document.
 * Les anciens documents publics (type « upload ») restent ouverts directement.
 */
export const isProtectedDocument = (url) =>
	typeof url === "string" && /res\.cloudinary\.com\/[^/]+\/(image|raw|video)\/(authenticated|private)\//i.test(url);

/** URL locale (blob:) du contenu d'un document protégé — à libérer avec URL.revokeObjectURL. */
export const fetchDocumentObjectUrl = async (url) => {
	const response = await apiRequest.get("/upload/documents/file", {
		params: { url },
		responseType: "blob",
	});
	return URL.createObjectURL(response.data);
};

/**
 * Ouvre un document dans un nouvel onglet. L'onglet est ouvert avant l'appel
 * réseau pour ne pas être bloqué par le navigateur (fenêtre surgissante).
 * Rejette en cas d'échec (accès refusé, session expirée) : à signaler à l'utilisateur.
 */
export const openDocument = async (url) => {
	if (!url) return;
	if (!isProtectedDocument(url)) {
		window.open(url, "_blank", "noopener,noreferrer");
		return;
	}
	const tab = window.open("", "_blank");
	try {
		const objectUrl = await fetchDocumentObjectUrl(url);
		if (tab) tab.location.href = objectUrl;
		else window.location.assign(objectUrl);
		setTimeout(() => URL.revokeObjectURL(objectUrl), 60 * 1000);
	} catch (error) {
		tab?.close();
		throw error;
	}
};

/**
 * URL affichable d'un document (aperçu image / PDF) : l'URL d'origine pour un
 * document public, une URL locale pour un document protégé.
 */
export const useDocumentUrl = (url, enabled = true) => {
	const [state, setState] = useState({ url: null, loading: false, error: false });

	useEffect(() => {
		let cancelled = false;
		let objectUrl = null;
		if (!url || !enabled) {
			setState({ url: null, loading: false, error: false });
			return undefined;
		}
		if (!isProtectedDocument(url)) {
			setState({ url, loading: false, error: false });
			return undefined;
		}
		setState({ url: null, loading: true, error: false });
		fetchDocumentObjectUrl(url)
			.then((result) => {
				objectUrl = result;
				if (cancelled) URL.revokeObjectURL(result);
				else setState({ url: result, loading: false, error: false });
			})
			.catch(() => !cancelled && setState({ url: null, loading: false, error: true }));
		return () => {
			cancelled = true;
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [url, enabled]);

	return state;
};
