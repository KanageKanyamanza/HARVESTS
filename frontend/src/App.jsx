import React, { Suspense } from "react";
import {
	BrowserRouter as Router,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
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

// Composant de fallback pour les routes
const RouteFallback = () => (
	<div className="min-h-screen flex items-center justify-center bg-harvests-light">
		<div className="text-center">
			<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
			<p className="text-gray-600">Chargement...</p>
		</div>
	</div>
);

// Tous les composants sont maintenant gérés par AppRoutes

// Configuration React Query
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 3,
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
			staleTime: 5 * 60 * 1000, // 5 minutes
			cacheTime: 10 * 60 * 1000, // 10 minutes
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: 1,
		},
	},
});

// Les composants de routes sont maintenant gérés par AppRoutes

function App() {
	const { i18n } = useTranslation();

	// Mettre à jour l'attribut lang du document
	React.useEffect(() => {
		document.documentElement.lang = i18n.language;
	}, [i18n.language]);

	return (
		<ErrorBoundary>
			<QueryClientProvider client={queryClient}>
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
										</UserTypeRedirect>
									</div>
								</Router>
							</ModalProvider>
						</CartProvider>
					</NotificationProvider>
				</AuthProvider>

				{/* React Query DevTools en développement */}
				{import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
			</QueryClientProvider>
		</ErrorBoundary>
	);
}

export default App;
