import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AOS from "aos";
import Header from "./Header";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import ChatBot from "../chat/ChatBot";
import SEOHead from "../seo/SEOHead";
import { useSEO } from "../../hooks/useSEO";

const Layout = ({ children, className = "", seo }) => {
	const location = useLocation();
	const seoConfig = useSEO(seo);

	// Sur la page d'accueil, ne pas appliquer de fond pour permettre la navbar transparente
	const isHomePage = location.pathname === "/";

	// Gérer le fond du body selon la page
	useEffect(() => {
		if (isHomePage) {
			document.body.classList.remove("bg-harvests-light");
		} else {
			document.body.classList.add("bg-harvests-light");
		}

		// Cleanup
		return () => {
			document.body.classList.remove("bg-harvests-light");
		};
	}, [isHomePage]);

	// Rafraîchir AOS lors des changements de route.
	// Plusieurs passes espacées : les sections qui chargent leurs données en
	// asynchrone (ex: home) changent de hauteur après le premier rendu, ce
	// qui décale les points de déclenchement des sections suivantes calculés
	// trop tôt par AOS — sans ces re-calculs, ces sections restent bloquées
	// à opacity:0 (AOS est en mode "once").
	useEffect(() => {
		const delays = [100, 500, 1200, 2500];
		const timers = delays.map((delay) =>
			setTimeout(() => AOS.refresh(), delay)
		);
		return () => timers.forEach(clearTimeout);
	}, [location.pathname]);

	return (
		<div
			className={`min-h-screen flex flex-col ${isHomePage ? "" : "bg-harvests-light"}`}
		>
			{/* SEO Head pour toutes les pages publiques */}
			<SEOHead {...seoConfig} />

			<Header />

			<main className={`flex-1 pb-16 md:pb-0 ${className}`}>{children}</main>

			<Footer />
			<ChatBot />
			<MobileBottomNav />
		</div>
	);
};

export default Layout;
