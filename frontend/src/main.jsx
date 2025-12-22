import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";
import "./index.css";

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
	</HelmetProvider>
);
