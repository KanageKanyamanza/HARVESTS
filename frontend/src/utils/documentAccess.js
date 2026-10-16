import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

/**
 * Jour 59 (sécurité) — documents administratifs protégés.
 * Les documents envoyés sur Cloudinary sont désormais en accès « authenticated » :
 * leur URL brute renvoie 401. On demande au serveur un lien temporaire (5 min),
 * accordé seulement au propriétaire du document ou à un admin. Les anciens
 * documents publics (type « upload ») restent ouverts directement.
 */
export const isProtectedDocument = (url) =>
	typeof url === "string" && /res\.cloudinary\.com\/[^/]+\/(image|raw|video)\/(authenticated|private)\//i.test(url);

export const getDocumentAccessUrl = async (url) => {
	if (!isProtectedDocument(url)) return url;
	const response = await apiRequest.get("/upload/documents/access", { params: { url } });
	return response.data?.data?.url || null;
};

/**
 * Ouvre un document dans un nouvel onglet. L'onglet est ouvert avant l'appel
 * réseau pour ne pas être bloqué par le navigateur (fenêtre surgissante).
 */
export const openDocument = async (url) => {
	if (!url) return;
	if (!isProtectedDocument(url)) {
		window.open(url, "_blank", "noopener,noreferrer");
		return;
	}
	const tab = window.open("", "_blank");
	try {
		const accessUrl = await getDocumentAccessUrl(url);
		if (!accessUrl) throw new Error("no access url");
		if (tab) {
			tab.opener = null;
			tab.location.href = accessUrl;
		} else {
			window.location.assign(accessUrl);
		}
	} catch (error) {
		tab?.close();
		throw error;
	}
};

/**
 * URL affichable d'un document (aperçu image / PDF) : l'URL d'origine pour un
 * document public, un lien temporaire pour un document protégé.
 */
export const useDocumentUrl = (url, enabled = true) => {
	const [state, setState] = useState({ url: null, loading: false, error: false });

	useEffect(() => {
		let cancelled = false;
		if (!url || !enabled) {
			setState({ url: null, loading: false, error: false });
			return undefined;
		}
		if (!isProtectedDocument(url)) {
			setState({ url, loading: false, error: false });
			return undefined;
		}
		setState({ url: null, loading: true, error: false });
		getDocumentAccessUrl(url)
			.then((accessUrl) => !cancelled && setState({ url: accessUrl, loading: false, error: !accessUrl }))
			.catch(() => !cancelled && setState({ url: null, loading: false, error: true }));
		return () => {
			cancelled = true;
		};
	}, [url, enabled]);

	return state;
};
