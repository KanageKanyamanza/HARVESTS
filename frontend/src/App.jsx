import React, { Suspense } from "react";
import {
	BrowserRouter as Router,
} from "react-router-dom";
import { useTranslation } from "react-i18next";

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

	// Mettre à jour l'attribut lang du document
	React.useEffect(() => {
		document.documentElement.lang = i18n.language;
	}, [i18n.language]);

	return (
		<ErrorBoundary>
			<AuthProvider>
				<NotificationProvider>
					<CartProvider>
						<ModalProvider>
							<Router>
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
