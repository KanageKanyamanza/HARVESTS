import React, { Suspense, useEffect } from "react";
import {
	BrowserRouter as Router,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import AOS from 'aos';
import 'aos/dist/aos.css';

// Configuration i18n
import "./utils/i18n";

// Providers
import { AuthProvider } from "./store/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ModalProvider } from "./components/modals/ModalManager";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Layout Components
import ScrollToTop from "./components/common/ScrollToTop";
import UserTypeRedirect from "./components/auth/UserTypeRedirect";
import ResourcePreloader from "./components/performance/ResourcePreloader";

// Import de la navigation
import AppRoutes from "./navigation/AppRoutes";

// Loading Component
import NotificationContainer from "./components/common/NotificationContainer";
import LoadingSpinner from "./components/common/LoadingSpinner";
import PWAInstallModal from "./components/common/PWAInstallModal";

// Composant de fallback pour les routes
const RouteFallback = () => (
	<div className="min-h-screen flex items-center justify-center bg-harvests-light">
		<LoadingSpinner size="lg" text="Chargement..." />
	</div>
);

function App() {
	const { i18n } = useTranslation();
	const baseUrl = (import.meta.env.VITE_FRONTEND_URL || (typeof window !== 'undefined' ? window.location.origin : '') || '').replace(/\/$/, '');

	// Mettre à jour l'attribut lang du document
	React.useEffect(() => {
		document.documentElement.lang = i18n.language;
	}, [i18n.language]);

	// Initialiser AOS (Animate On Scroll)
	useEffect(() => {
		AOS.init({
			duration: 800,
			easing: 'ease-in-out',
			once: true,
			mirror: false,
			offset: 100,
			delay: 0,
		});
		
		// Rafraîchir AOS lors des changements de route
		const refreshAOS = () => {
			setTimeout(() => {
				AOS.refresh();
			}, 100);
		};
		
		window.addEventListener('load', refreshAOS);
		window.addEventListener('resize', refreshAOS);
		
		return () => {
			window.removeEventListener('load', refreshAOS);
			window.removeEventListener('resize', refreshAOS);
		};
	}, []);

	return (
		<ErrorBoundary>
			<AuthProvider>
				<NotificationProvider>
					<CartProvider>
						<ModalProvider>
							<Router>
							<Helmet>
								<title>Harvests | Produits frais, logistique fiable</title>
								<meta name="description" content="Marketplace Harvests : produits frais, circuits courts, logistique fiable et rapide pour restaurateurs, consommateurs et transporteurs." />
								<link rel="canonical" href={baseUrl || 'https://www.harvests.site'} />
								<meta property="og:type" content="website" />
								<meta property="og:title" content="Harvests | Produits frais, logistique fiable" />
								<meta property="og:description" content="Découvrez Harvests, la plateforme qui connecte producteurs, restaurateurs et transporteurs pour des livraisons rapides et fiables." />
								<meta property="og:url" content={baseUrl || 'https://www.harvests.site'} />
								<meta property="og:image" content={`${baseUrl || 'https://www.harvests.site'}/logo.png`} />
								<meta name="twitter:card" content="summary_large_image" />
								<meta name="twitter:title" content="Harvests | Produits frais, logistique fiable" />
								<meta name="twitter:description" content="Produits frais, circuits courts, logistique rapide pour tous les acteurs de la chaîne alimentaire." />
								<meta name="twitter:image" content={`${baseUrl || 'https://www.harvests.site'}/logo.png`} />
								{/* Préchargement des ressources critiques */}
								<link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
								<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
								<link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
								<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
								<link rel="dns-prefetch" href="https://fonts.gstatic.com" />
								<link rel="dns-prefetch" href="https://res.cloudinary.com" />
							</Helmet>
							<ResourcePreloader />
							<ScrollToTop />
								<div className="App bg-[#f3f9e5]">
									<UserTypeRedirect>
										<Suspense fallback={<RouteFallback />}>
											<AppRoutes />
										</Suspense>

									{/* Container des notifications */}
									<NotificationContainer />
									
									{/* Modal d'installation PWA */}
									<PWAInstallModal />
								</UserTypeRedirect>
								</div>
							</Router>
						</ModalProvider>
					</CartProvider>
				</NotificationProvider>
			</AuthProvider>
		</ErrorBoundary>
	);
}

export default App;
