import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";
import "./index.css";

// Service Worker : enregistré dès le chargement pour TOUS les visiteurs,
// y compris les anonymes (cache hors ligne + beforeinstallprompt). Le
// service de notifications réutilise cette même promesse.
if ("serviceWorker" in navigator) {
	window.__harvestsSwRegistrationPromise = new Promise((resolve) => {
		const register = () => resolve(navigator.serviceWorker.register("/sw.js"));
		if (document.readyState === "complete") {
			register();
			return;
		}
		window.addEventListener("load", register, { once: true });
	});
	window.__harvestsSwRegistrationPromise.catch((error) => {
		console.warn("[SW] enregistrement impossible:", error);
	});
}

// Désactiver les logs en production
if (import.meta.env.MODE === "production") {
	console.log = () => {};
	console.info = () => {};
	console.warn = () => {};
	console.error = () => {};
	console.debug = () => {};
}

// Configuration stricte React (désactivé temporairement pour éviter la double vérification)
ReactDOM.createRoot(document.getElementById("root")).render(
	<HelmetProvider>
		<App />
	</HelmetProvider>,
);
