import { useEffect } from "react";
import heroBg2 from "../../assets/images/herobgcar2.webp";

/**
 * Composant pour précharger les ressources critiques
 * Améliore le First Contentful Paint (FCP) et Largest Contentful Paint (LCP)
 */
const ResourcePreloader = () => {
	useEffect(() => {
		// Précharger les polices critiques
		const preloadFonts = () => {
			const fonts = [
				"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
				"https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
			];

			fonts.forEach((fontUrl) => {
				const link = document.createElement("link");
				link.rel = "preload";
				link.as = "style";
				link.href = fontUrl;
				link.crossOrigin = "anonymous";
				document.head.appendChild(link);
			});
		};

		// Précharger les images critiques (logo, etc.)
		const preloadCriticalImages = () => {
			const criticalImages = [
				"/logo.png",
				"/favicon.ico",
				heroBg2, // LCP Image
			];

			criticalImages.forEach((imageSrc) => {
				const link = document.createElement("link");
				link.rel = "preload";
				link.as = "image";
				link.href = imageSrc;
				document.head.appendChild(link);
			});
		};

		// Préconnecter aux domaines externes critiques
		const preconnectDomains = () => {
			const domains = [
				"https://fonts.googleapis.com",
				"https://fonts.gstatic.com",
				"https://res.cloudinary.com",
			];

			domains.forEach((domain) => {
				const link = document.createElement("link");
				link.rel = "preconnect";
				link.href = domain;
				link.crossOrigin = "anonymous";
				document.head.appendChild(link);
			});
		};

		preconnectDomains();
		preloadFonts();
		preloadCriticalImages();
	}, []);

	return null;
};

export default ResourcePreloader;
