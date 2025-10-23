import React, { Suspense } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
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
import { useAuth } from "./hooks/useAuth";
import { ModalProvider } from "./components/modals/ModalManager";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Layout Components
import Layout from "./components/layout/Layout";
import AuthLayout from "./components/layout/AuthLayout";
import AdminLayout from "./components/layout/AdminLayout";
import ScrollToTop from "./components/common/ScrollToTop";
import UserTypeRedirect from "./components/auth/UserTypeRedirect";

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

// Lazy Loading des pages
const Home = React.lazy(() => import("./pages/Home"));
const Products = React.lazy(() => import("./pages/Products"));
const ProductDetail = React.lazy(() => import("./pages/ProductDetail"));
const Categories = React.lazy(() => import("./pages/Categories"));
const Producers = React.lazy(() => import("./pages/Producers"));
const ProducerProfile = React.lazy(() => import("./pages/ProducerProfile"));
const Vendeurs = React.lazy(() => import("./pages/Vendeurs"));
const Transformers = React.lazy(() => import("./pages/Transformers"));
const TransformerProfile = React.lazy(() =>
	import("./pages/TransformerProfile")
);
const PublicRestaurateurProfile = React.lazy(() =>
	import("./pages/RestaurateurProfile")
);
const CartPage = React.lazy(() => import("./pages/Cart"));
const LoyaltyProgram = React.lazy(() => import("./pages/LoyaltyProgram"));

// Auth Pages
const Login = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));
const ForgotPassword = React.lazy(() => import("./pages/auth/ForgotPassword"));
const EmailVerification = React.lazy(() =>
	import("./pages/auth/EmailVerification")
);
const ResetPassword = React.lazy(() => import("./pages/auth/ResetPassword"));

// Dashboard Pages
const Dashboard = React.lazy(() => import("./pages/dashboard/Dashboard"));

// Common Dashboard Pages
const ProfilePage = React.lazy(() =>
	import("./pages/dashboard/common/ProfilePage")
);
const SettingsPage = React.lazy(() =>
	import("./pages/dashboard/common/SettingsPage")
);

// Consumer Dashboard
const ConsumerDashboard = React.lazy(() =>
	import("./pages/dashboard/consumer/ConsumerDashboardNew")
);
const ConsumerFavorites = React.lazy(() =>
	import("./pages/dashboard/consumer/Favorites")
);
const ConsumerReviews = React.lazy(() =>
	import("./pages/dashboard/consumer/Reviews")
);
const ConsumerStatistics = React.lazy(() =>
	import("./pages/dashboard/consumer/Statistics")
);

// Producer Dashboard
const ProducerDashboard = React.lazy(() =>
	import("./pages/dashboard/producer/ProducerDashboardNew")
);
const MyProducts = React.lazy(() =>
	import("./pages/dashboard/producer/MyProducts")
);
const AddProduct = React.lazy(() =>
	import("./pages/dashboard/producer/AddProduct")
);
const EditProduct = React.lazy(() =>
	import("./pages/dashboard/producer/EditProduct")
);
const ProducerOrders = React.lazy(() =>
	import("./pages/dashboard/producer/Orders")
);
const ProducerReviews = React.lazy(() =>
	import("./pages/dashboard/producer/ProducerReviews")
);
const ProducerStats = React.lazy(() =>
	import("./pages/dashboard/producer/Stats")
);

// Transformer Dashboard
const TransformerDashboard = React.lazy(() =>
	import("./pages/dashboard/transformer/TransformerDashboardNew")
);

// Transformer Pages
const OrdersList = React.lazy(() =>
	import("./pages/dashboard/transformer/OrdersList")
);
const TransformerProducts = React.lazy(() =>
	import("./pages/dashboard/transformer/products/MyProducts")
);
const NewProduct = React.lazy(() =>
	import("./pages/dashboard/transformer/products/NewProduct")
);

// Restaurateur Dashboard
const RestaurateurDashboard = React.lazy(() =>
	import("./pages/dashboard/restaurateur/RestaurateurDashboardNew")
);
const RestaurateurOrders = React.lazy(() =>
	import("./pages/dashboard/restaurateur/OrdersList")
);
const RestaurateurSuppliers = React.lazy(() =>
	import("./pages/dashboard/restaurateur/SuppliersList")
);
const RestaurateurNewOrder = React.lazy(() =>
	import("./pages/dashboard/restaurateur/NewOrder")
);
const RestaurateurDishes = React.lazy(() =>
	import("./pages/dashboard/restaurateur/DishesManagement")
);
const DishDetail = React.lazy(() =>
	import("./pages/dashboard/restaurateur/DishDetail")
);

// Exporter Dashboard
const ExporterDashboard = React.lazy(() =>
	import("./pages/dashboard/exporter/ExporterDashboardNew")
);

// Transporter Dashboard
const TransporterDashboard = React.lazy(() =>
	import("./pages/dashboard/transporter/TransporterDashboardNew")
);
const Cart = React.lazy(() => import("./pages/dashboard/consumer/Cart"));
const Checkout = React.lazy(() =>
	import("./pages/dashboard/consumer/Checkout")
);
const OrderHistory = React.lazy(() =>
	import("./pages/dashboard/consumer/OrderHistory")
);
const OrderDetail = React.lazy(() => import("./pages/orders/OrderDetail"));
const OrderConfirmation = React.lazy(() =>
	import("./pages/dashboard/consumer/OrderConfirmation")
);

// Admin Dashboard
const AdminDashboard = React.lazy(() => import("./pages/admin/AdminDashboard"));
const AdminManagement = React.lazy(() =>
	import("./pages/admin/AdminManagement")
);
const AdminUsers = React.lazy(() => import("./pages/admin/AdminUsers"));
const UserDetails = React.lazy(() => import("./pages/admin/UserDetails"));
const AdminProducts = React.lazy(() => import("./pages/admin/AdminProducts"));
const ProductDetails = React.lazy(() => import("./pages/admin/ProductDetails"));
const AdminReviews = React.lazy(() => import("./pages/admin/AdminReviews"));
const AdminMessages = React.lazy(() => import("./pages/admin/AdminMessages"));
const AdminOrders = React.lazy(() => import("./pages/admin/AdminOrders"));
const OrderDetails = React.lazy(() => import("./pages/admin/OrderDetails"));
const AdminAnalytics = React.lazy(() => import("./pages/admin/AdminAnalytics"));

// Error Pages
const NotFound = React.lazy(() => import("./pages/errors/NotFound"));
const ServerError = React.lazy(() => import("./pages/errors/ServerError"));
const Unauthorized = React.lazy(() => import("./pages/errors/Unauthorized"));

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

// Composant pour les routes protégées
const ProtectedRoute = ({
	children,
	requiredAuth = true,
	requiredVerification = false,
}) => {
	const { isAuthenticated, isEmailVerified } = useAuth();

	// Ne plus afficher de loader global - laisser les pages gérer leur propre état

	if (requiredAuth && !isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (requiredVerification && !isEmailVerified) {
		return <Navigate to="/verify-email" replace />;
	}

	return children;
};

// Composant pour les routes publiques (pas de redirection si connecté)
const PublicRoute = ({ children }) => {
	return children;
};

// Composant pour les routes d'authentification (redirection si déjà connecté)
const AuthRoute = ({ children, useLayout = true }) => {
	const { isAuthenticated } = useAuth();

	// Ne plus afficher de loader global - laisser les pages gérer leur propre état

	if (isAuthenticated) {
		return <Navigate to="/dashboard" replace />;
	}

	return useLayout ? <AuthLayout>{children}</AuthLayout> : children;
};

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
												<Routes>
													{/* Routes publiques */}
													<Route
														path="/"
														element={
															<PublicRoute>
																<Layout>
																	<Home />
																</Layout>
															</PublicRoute>
														}
													/>

													<Route
														path="/products"
														element={
															<PublicRoute>
																<Layout>
																	<Products />
																</Layout>
															</PublicRoute>
														}
													/>

													<Route
														path="/products/:id"
														element={
															<PublicRoute>
																<Layout>
																	<ProductDetail />
																</Layout>
															</PublicRoute>
														}
													/>

													<Route
														path="/cart"
														element={
															<PublicRoute>
																<Layout>
																	<CartPage />
																</Layout>
															</PublicRoute>
														}
													/>

													<Route
														path="/categories"
														element={
															<PublicRoute>
																<Layout>
																	<Categories />
																</Layout>
															</PublicRoute>
														}
													/>

													<Route
														path="/categories/:category"
														element={
															<PublicRoute>
																<Layout>
																	<Products />
																</Layout>
															</PublicRoute>
														}
													/>

													<Route
														path="/producers"
														element={
															<PublicRoute>
																<Layout>
																	<Producers />
																</Layout>
															</PublicRoute>
														}
													/>

													<Route
														path="/producers/:id"
														element={
															<PublicRoute>
																<Layout>
																	<ProducerProfile />
																</Layout>
															</PublicRoute>
														}
													/>

													{/* Page Vendeurs (Producteurs + Transformateurs) */}
													<Route
														path="/vendeurs"
														element={
															<PublicRoute>
																<Layout>
																	<Vendeurs />
																</Layout>
															</PublicRoute>
														}
													/>

													<Route
														path="/transformers"
														element={
															<PublicRoute>
																<Layout>
																	<Transformers />
																</Layout>
															</PublicRoute>
														}
													/>

													<Route
														path="/transformers/:id"
														element={
															<PublicRoute>
																<Layout>
																	<TransformerProfile />
																</Layout>
															</PublicRoute>
														}
													/>

													<Route
														path="/restaurateurs/:id"
														element={
															<PublicRoute>
																<Layout>
																	<PublicRestaurateurProfile />
																</Layout>
															</PublicRoute>
														}
													/>

													<Route
														path="/loyalty"
														element={
															<PublicRoute>
																<Layout>
																	<LoyaltyProgram />
																</Layout>
															</PublicRoute>
														}
													/>

													{/* Routes d'authentification */}
													<Route
														path="/login"
														element={
															<AuthRoute>
																<Login />
															</AuthRoute>
														}
													/>

													<Route
														path="/register"
														element={
															<AuthRoute>
																<Register />
															</AuthRoute>
														}
													/>

													<Route
														path="/forgot-password"
														element={
															<AuthRoute>
																<ForgotPassword />
															</AuthRoute>
														}
													/>

													<Route
														path="/reset-password/:token"
														element={
															<AuthRoute>
																<ResetPassword />
															</AuthRoute>
														}
													/>

													<Route
														path="/verify-email/:token?"
														element={
															<AuthRoute>
																<EmailVerification />
															</AuthRoute>
														}
													/>

													{/* Routes protégées - Dashboard (sans Layout classique) */}
													<Route
														path="/dashboard"
														element={
															<ProtectedRoute>
																<Dashboard />
															</ProtectedRoute>
														}
													/>

													{/* Routes communes pour tous les utilisateurs */}
													<Route
														path="/dashboard/profile"
														element={
															<ProtectedRoute>
																<ProfilePage />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/dashboard/settings"
														element={
															<ProtectedRoute>
																<SettingsPage />
															</ProtectedRoute>
														}
													/>

													{/* Routes spécifiques Consommateur */}
													<Route
														path="/consumer/profile"
														element={
															<ProtectedRoute>
																<ProfilePage />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/consumer/settings"
														element={
															<ProtectedRoute>
																<SettingsPage />
															</ProtectedRoute>
														}
													/>

													{/* Routes spécifiques Producteur */}
													<Route
														path="/producer/profile"
														element={
															<ProtectedRoute>
																<ProfilePage />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/producer/settings"
														element={
															<ProtectedRoute>
																<SettingsPage />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/producer/dashboard"
														element={
															<ProtectedRoute>
																<ProducerDashboard />
															</ProtectedRoute>
														}
													/>

													{/* Transformer Dashboard Routes */}
													<Route
														path="/transformer/dashboard"
														element={
															<ProtectedRoute>
																<TransformerDashboard />
															</ProtectedRoute>
														}
													/>

													{/* Transformer Orders Routes */}
													<Route
														path="/transformer/orders"
														element={
															<ProtectedRoute>
																<OrdersList />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/transformer/orders/:orderId"
														element={
															<ProtectedRoute>
																<OrderDetail />
															</ProtectedRoute>
														}
													/>

													{/* Transformer Products Routes */}
													<Route
														path="/transformer/products"
														element={
															<ProtectedRoute>
																<TransformerProducts />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/transformer/products/new"
														element={
															<ProtectedRoute>
																<NewProduct />
															</ProtectedRoute>
														}
													/>

													{/* Restaurateur Dashboard Routes */}
													<Route
														path="/restaurateur/dashboard"
														element={
															<ProtectedRoute>
																<RestaurateurDashboard />
															</ProtectedRoute>
														}
													/>

													{/* Restaurateur Orders Routes */}
													<Route
														path="/restaurateur/orders"
														element={
															<ProtectedRoute>
																<RestaurateurOrders />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/restaurateur/orders/new"
														element={
															<ProtectedRoute>
																<RestaurateurNewOrder />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/restaurateur/orders/:orderId"
														element={
															<ProtectedRoute>
																<OrderDetail />
															</ProtectedRoute>
														}
													/>

													{/* Restaurateur Suppliers Routes */}
													<Route
														path="/restaurateur/suppliers"
														element={
															<ProtectedRoute>
																<RestaurateurSuppliers />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/restaurateur/suppliers/:supplierId"
														element={
															<ProtectedRoute>
																<ProducerProfile />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/restaurateur/settings"
														element={
															<ProtectedRoute>
																<SettingsPage />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/restaurateur/dishes"
														element={
															<ProtectedRoute>
																<RestaurateurDishes />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/dishes/:dishId"
														element={
															<ProtectedRoute>
																<DishDetail />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/producer/products"
														element={
															<ProtectedRoute>
																<MyProducts />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/producer/products/add"
														element={
															<ProtectedRoute>
																<AddProduct />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/producer/products/edit/:id"
														element={
															<ProtectedRoute>
																<EditProduct />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/producer/orders"
														element={
															<ProtectedRoute>
																<ProducerOrders />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/producer/reviews"
														element={
															<ProtectedRoute requireRole="producer">
																<ProducerReviews />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/producer/stats"
														element={
															<ProtectedRoute>
																<ProducerStats />
															</ProtectedRoute>
														}
													/>

													{/* Routes spécifiques Consommateur (sans Layout classique) */}
													<Route
														path="/consumer/dashboard"
														element={
															<ProtectedRoute>
																<ConsumerDashboard />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/consumer/favorites"
														element={
															<ProtectedRoute>
																<ConsumerFavorites />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/consumer/reviews"
														element={
															<ProtectedRoute>
																<ConsumerReviews />
															</ProtectedRoute>
														}
													/>
													<Route
														path="/consumer/statistics"
														element={
															<ProtectedRoute>
																<ConsumerStatistics />
															</ProtectedRoute>
														}
													/>

													{/* Routes Exporter Dashboard */}
													<Route
														path="/exporter/dashboard"
														element={
															<ProtectedRoute>
																<ExporterDashboard />
															</ProtectedRoute>
														}
													/>

													{/* Routes Transporter Dashboard */}
													<Route
														path="/transporter/dashboard"
														element={
															<ProtectedRoute>
																<TransporterDashboard />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/cart"
														element={
															<ProtectedRoute>
																<Cart />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/checkout"
														element={
															<ProtectedRoute>
																<Checkout />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/order-history"
														element={
															<ProtectedRoute>
																<OrderHistory />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/orders/:id"
														element={
															<ProtectedRoute>
																<OrderDetail />
															</ProtectedRoute>
														}
													/>

													<Route
														path="/orders/:orderId/confirmation"
														element={
															<ProtectedRoute>
																<OrderConfirmation />
															</ProtectedRoute>
														}
													/>

													{/* Routes Admin */}
													<Route
														path="/admin"
														element={
															<ProtectedRoute requireRole="admin">
																<AdminLayout>
																	<AdminDashboard />
																</AdminLayout>
															</ProtectedRoute>
														}
													/>

													<Route
														path="/admin/management"
														element={
															<ProtectedRoute requireRole="admin">
																<AdminLayout>
																	<AdminManagement />
																</AdminLayout>
															</ProtectedRoute>
														}
													/>

													<Route
														path="/admin/products"
														element={
															<ProtectedRoute requireRole="admin">
																<AdminLayout>
																	<AdminProducts />
																</AdminLayout>
															</ProtectedRoute>
														}
													/>

													<Route
														path="/admin/products/:id"
														element={
															<ProtectedRoute requireRole="admin">
																<AdminLayout>
																	<ProductDetails />
																</AdminLayout>
															</ProtectedRoute>
														}
													/>

													<Route
														path="/admin/users"
														element={
															<ProtectedRoute requireRole="admin">
																<AdminLayout>
																	<AdminUsers />
																</AdminLayout>
															</ProtectedRoute>
														}
													/>

													<Route
														path="/admin/users/:id"
														element={
															<ProtectedRoute requireRole="admin">
																<AdminLayout>
																	<UserDetails />
																</AdminLayout>
															</ProtectedRoute>
														}
													/>

													<Route
														path="/admin/reviews"
														element={
															<ProtectedRoute requireRole="admin">
																<AdminLayout>
																	<AdminReviews />
																</AdminLayout>
															</ProtectedRoute>
														}
													/>

													<Route
														path="/admin/messages"
														element={
															<ProtectedRoute requireRole="admin">
																<AdminLayout>
																	<AdminMessages />
																</AdminLayout>
															</ProtectedRoute>
														}
													/>

													<Route
														path="/admin/orders"
														element={
															<ProtectedRoute requireRole="admin">
																<AdminLayout>
																	<AdminOrders />
																</AdminLayout>
															</ProtectedRoute>
														}
													/>

													<Route
														path="/admin/orders/:orderId"
														element={
															<ProtectedRoute requireRole="admin">
																<AdminLayout>
																	<OrderDetails />
																</AdminLayout>
															</ProtectedRoute>
														}
													/>

													<Route
														path="/admin/analytics"
														element={
															<ProtectedRoute requireRole="admin">
																<AdminLayout>
																	<AdminAnalytics />
																</AdminLayout>
															</ProtectedRoute>
														}
													/>

													{/* Routes d'erreur */}
													<Route
														path="/unauthorized"
														element={<Unauthorized />}
													/>
													<Route
														path="/server-error"
														element={<ServerError />}
													/>
													<Route path="*" element={<NotFound />} />
												</Routes>
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
