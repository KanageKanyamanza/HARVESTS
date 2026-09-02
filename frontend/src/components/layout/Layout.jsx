import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import AOS from "aos";
import Header from "./Header";
import Footer from "./Footer";
import VendorsNewsTicker from "../home/VendorsNewsTicker";
import MobileBottomNav from "./MobileBottomNav";
import ChatBot from "../chat/ChatBot";
import SEOHead from "../seo/SEOHead";
import CookieConsentBanner from "../common/CookieConsentBanner";
import { useSEO } from "../../hooks/useSEO";

const Layout = ({ children, className = "", seo }) => {
	const location = useLocation();
	const seoConfig = useSEO(seo);
	const stickyHeaderRef = useRef(null);

	// Mesure en direct la hauteur réelle du bloc Header + VendorsNewsTicker
	// (variable : le bandeau ne s'affiche que si des producteurs sont chargés)
	// et l'expose en variable CSS pour que les barres "sticky" des autres
	// pages (filtres, toolbars) se calent dessus au lieu d'un offset codé en dur.
	useEffect(() => {
		const el = stickyHeaderRef.current;
		if (!el) return;

		const updateHeight = () => {
			document.documentElement.style.setProperty(
				"--app-header-height",
				`${el.offsetHeight}px`
			);
		};

		updateHeight();
		const observer = new ResizeObserver(updateHeight);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

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

			<div ref={stickyHeaderRef} className="sticky top-0 z-40">
				<Header />
				<VendorsNewsTicker />
			</div>

			<main className={`flex-1 pb-16 md:pb-0 ${className}`}>{children}</main>

			<Footer />
			<ChatBot />
			<MobileBottomNav />
			<CookieConsentBanner />
		</div>
	);
};

export default Layout;
