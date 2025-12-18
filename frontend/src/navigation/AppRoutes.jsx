/**
 * Composant principal pour gérer toutes les routes de l'application
 */
import React, { Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/common/LoadingSpinner";

// Import des routes organisées
import {
	adminRoutes,
	consumerRoutes,
	producerRoutes,
	transformerRoutes,
	restaurateurRoutes,
	transporterRoutes,
	exporterRoutes,
	explorerRoutes,
} from "./routes";

// Import des pages publiques avec React.lazy pour le code splitting
const Home = React.lazy(() => import("../pages/Home"));
const NotFound = React.lazy(() => import("../pages/NotFound"));
const Products = React.lazy(() => import("../pages/Products"));
const ProductDetail = React.lazy(() => import("../pages/ProductDetail"));
const DishDetail = React.lazy(() => import("../pages/DishDetail"));
const Categories = React.lazy(() => import("../pages/Categories"));
const Producers = React.lazy(() => import("../pages/Producers"));
const ProducerProfile = React.lazy(() => import("../pages/ProducerProfile"));
const Vendeurs = React.lazy(() => import("../pages/Vendeurs"));
const Transformers = React.lazy(() => import("../pages/Transformers"));
const TransformerProfile = React.lazy(() =>
	import("../pages/TransformerProfile")
);
const PublicRestaurateurProfile = React.lazy(() =>
	import("../pages/RestaurateurProfile")
);
const TransporterProfile = React.lazy(() =>
	import("../pages/TransporterProfile")
);
const ExporterProfile = React.lazy(() => import("../pages/ExporterProfile"));
const TransporteursExportateurs = React.lazy(() =>
	import("../pages/TransporteursExportateurs")
);
const CartPage = React.lazy(() => import("../pages/Cart"));
const Contact = React.lazy(() => import("../pages/Contact"));
const About = React.lazy(() => import("../pages/About"));
const FAQ = React.lazy(() => import("../pages/FAQ"));
const Terms = React.lazy(() => import("../pages/Terms"));
const Privacy = React.lazy(() => import("../pages/Privacy"));
const Pricing = React.lazy(() => import("../pages/Pricing"));
const LoyaltyProgram = React.lazy(() => import("../pages/LoyaltyProgram"));
const BlogPage = React.lazy(() => import("../pages/BlogPage"));
const BlogDetailPage = React.lazy(() => import("../pages/BlogDetailPage"));
const PayPalSuccess = React.lazy(() =>
	import("../pages/payments/PayPalSuccess")
);
const PayPalCancel = React.lazy(() => import("../pages/payments/PayPalCancel"));
const SubscriptionPayment = React.lazy(() =>
	import("../pages/payments/SubscriptionPayment")
);
const SubscriptionCheckout = React.lazy(() =>
	import("../pages/payments/SubscriptionCheckout")
);

// Import des pages d'authentification
const Login = React.lazy(() => import("../pages/auth/Login"));
const Register = React.lazy(() => import("../pages/auth/Register"));
const ForgotPassword = React.lazy(() => import("../pages/auth/ForgotPassword"));
const EmailVerification = React.lazy(() =>
	import("../pages/auth/EmailVerification")
);
const ResetPassword = React.lazy(() => import("../pages/auth/ResetPassword"));

// Import des layouts
import Layout from "../components/layout/Layout";
import AuthLayout from "../components/layout/AuthLayout";
import AdminLayout from "../components/layout/AdminLayout";
import ModularDashboardLayout from "../components/layout/ModularDashboardLayout";
import UserTypeRedirect from "../components/auth/UserTypeRedirect";

// Import du NavigationManager
import { generateSidebarNavigation } from "./NavigationManager";

// Import des icônes
import {
	FiHome,
	FiShoppingBag,
	FiPackage,
	FiStar,
	FiUser,
	FiSettings,
} from "react-icons/fi";
import { FaChartBar } from "react-icons/fa";

// Composant de fallback pour les routes
const RouteFallback = () => (
	<div className="min-h-screen flex items-center justify-center bg-harvests-light">
		<LoadingSpinner size="lg" text="Chargement..." />
	</div>
);

// Composant wrapper pour les routes avec ModularDashboardLayout
const DashboardRouteWrapper = ({ children }) => {
	const { user } = useAuth();
	const navigationItems = generateSidebarNavigation(user, {
		// Icons pour la navigation
		FiHome,
		FiShoppingBag,
		FiPackage,
		FiStar,
		FiUser,
		FiSettings,
		FaChartBar,
	});

	return (
		<ModularDashboardLayout navigationItems={navigationItems} user={user}>
			{children}
		</ModularDashboardLayout>
	);
};

/**
 * Composant pour wrapper les routes avec Suspense
 */
const SuspenseRoute = ({ element }) => (
	<Suspense fallback={<RouteFallback />}>{element}</Suspense>
);

/**
 * Composant pour les routes protégées
 */
const ProtectedRoute = ({ children, requiredRole, requiredUserType }) => {
	const { isAuthenticated, user, isLoading } = useAuth();

	if (isLoading) {
		return <RouteFallback />;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (requiredRole && user?.role !== requiredRole) {
		return <Navigate to="/" replace />;
	}

	if (requiredUserType && user?.userType !== requiredUserType) {
		return <Navigate to="/" replace />;
	}

	return children;
};

/**
 * Composant pour les routes publiques (redirection si connecté)
 */
const PublicRoute = ({ children }) => {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return <RouteFallback />;
	}

	if (isAuthenticated) {
		return <Navigate to="/dashboard" replace />;
	}

	return children;
};

const CheckoutGateway = () => {
	const { isAuthenticated, user, getDefaultRoute } = useAuth();
	const location = useLocation();

	console.log(
		"🛒 [CheckoutGateway] Rendu, isAuthenticated:",
		isAuthenticated,
		"userType:",
		user?.userType
	);

	if (!isAuthenticated) {
		console.log(
			"🛒 [CheckoutGateway] Non authentifié, redirection vers /login"
		);
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
	}

	if (user?.userType === "consumer") {
		console.log(
			"🛒 [CheckoutGateway] Consumer, redirection vers /consumer/checkout"
		);
		return <Navigate to="/consumer/checkout" replace />;
	}

	if (user?.userType === "restaurateur") {
		console.log(
			"🛒 [CheckoutGateway] Restaurateur, redirection vers /restaurateur/checkout"
		);
		return <Navigate to="/restaurateur/checkout" replace />;
	}

	const fallbackRoute =
		typeof getDefaultRoute === "function" ? getDefaultRoute() : "/";
	console.log(
		"🛒 [CheckoutGateway] Autre type d'utilisateur, redirection vers:",
		fallbackRoute
	);
	return <Navigate to={fallbackRoute || "/"} replace />;
};

/**
 * Composant principal des routes
 */
const AppRoutes = () => {
	return (
		<Routes>
			{/* Routes publiques */}
			<Route
				path="/"
				element={
					<Layout>
						<SuspenseRoute element={<Home />} />
					</Layout>
				}
			/>
			<Route
				path="/products"
				element={
					<Layout>
						<SuspenseRoute element={<Products />} />
					</Layout>
				}
			/>
			<Route
				path="/products/:id"
				element={
					<Layout>
						<SuspenseRoute element={<ProductDetail />} />
					</Layout>
				}
			/>
			<Route
				path="/dishes/:id"
				element={
					<Layout>
						<SuspenseRoute element={<DishDetail />} />
					</Layout>
				}
			/>
			<Route
				path="/categories"
				element={
					<Layout>
						<SuspenseRoute element={<Categories />} />
					</Layout>
				}
			/>
			<Route
				path="/categories/:category"
				element={
					<Layout>
						<SuspenseRoute element={<Products />} />
					</Layout>
				}
			/>
			<Route
				path="/producers"
				element={
					<Layout>
						<SuspenseRoute element={<Producers />} />
					</Layout>
				}
			/>
			<Route
				path="/producers/:id"
				element={
					<Layout>
						<SuspenseRoute element={<ProducerProfile />} />
					</Layout>
				}
			/>
			<Route
				path="/producteurs"
				element={
					<Layout>
						<SuspenseRoute element={<Vendeurs />} />
					</Layout>
				}
			/>
			<Route
				path="/transformers"
				element={
					<Layout>
						<SuspenseRoute element={<Transformers />} />
					</Layout>
				}
			/>
			<Route
				path="/transformers/:id"
				element={
					<Layout>
						<SuspenseRoute element={<TransformerProfile />} />
					</Layout>
				}
			/>
			<Route
				path="/restaurateurs/:id"
				element={
					<Layout>
						<SuspenseRoute element={<PublicRestaurateurProfile />} />
					</Layout>
				}
			/>
			<Route
				path="/logistics"
				element={
					<Layout>
						<SuspenseRoute element={<TransporteursExportateurs />} />
					</Layout>
				}
			/>
			<Route
				path="/transporters/:id"
				element={
					<Layout>
						<SuspenseRoute element={<TransporterProfile />} />
					</Layout>
				}
			/>
			<Route
				path="/exporters/:id"
				element={
					<Layout>
						<SuspenseRoute element={<ExporterProfile />} />
					</Layout>
				}
			/>
			<Route
				path="/cart"
				element={
					<Layout>
						<SuspenseRoute element={<CartPage />} />
					</Layout>
				}
			/>
			<Route path="/checkout" element={<CheckoutGateway />} />
			<Route
				path="/about"
				element={
					<Layout>
						<SuspenseRoute element={<About />} />
					</Layout>
				}
			/>
			<Route
				path="/a-propos"
				element={
					<Layout>
						<SuspenseRoute element={<About />} />
					</Layout>
				}
			/>
			<Route
				path="/contact"
				element={
					<Layout>
						<SuspenseRoute element={<Contact />} />
					</Layout>
				}
			/>
			<Route path="/help" element={<SuspenseRoute element={<FAQ />} />} />
			<Route path="/terms" element={<SuspenseRoute element={<Terms />} />} />
			<Route
				path="/privacy"
				element={<SuspenseRoute element={<Privacy />} />}
			/>
			<Route
				path="/pricing"
				element={
					<Layout>
						<SuspenseRoute element={<Pricing />} />
					</Layout>
				}
			/>
			<Route
				path="/loyalty"
				element={
					<Layout>
						<SuspenseRoute element={<LoyaltyProgram />} />
					</Layout>
				}
			/>
			<Route
				path="/blog"
				element={
					<Layout>
						<SuspenseRoute element={<BlogPage />} />
					</Layout>
				}
			/>
			<Route
				path="/blog/:slug"
				element={<SuspenseRoute element={<BlogDetailPage />} />}
			/>
			<Route
				path="/payments/paypal/success"
				element={
					<Layout>
						<SuspenseRoute element={<PayPalSuccess />} />
					</Layout>
				}
			/>
			<Route
				path="/payments/paypal/cancel"
				element={
					<Layout>
						<SuspenseRoute element={<PayPalCancel />} />
					</Layout>
				}
			/>
			<Route
				path="/payment/subscription/:planId"
				element={
					<Layout>
						<SuspenseRoute element={<SubscriptionPayment />} />
					</Layout>
				}
			/>
			<Route
				path="/payment/subscription/:planId/checkout"
				element={
					<Layout>
						<SuspenseRoute element={<SubscriptionCheckout />} />
					</Layout>
				}
			/>

			{/* Routes d'authentification */}
			<Route
				path="/login"
				element={
					<PublicRoute>
						<AuthLayout>
							<SuspenseRoute element={<Login />} />
						</AuthLayout>
					</PublicRoute>
				}
			/>
			<Route
				path="/register"
				element={
					<PublicRoute>
						<AuthLayout>
							<SuspenseRoute element={<Register />} />
						</AuthLayout>
					</PublicRoute>
				}
			/>
			<Route
				path="/forgot-password"
				element={
					<PublicRoute>
						<AuthLayout>
							<SuspenseRoute element={<ForgotPassword />} />
						</AuthLayout>
					</PublicRoute>
				}
			/>
			<Route
				path="/email-verification"
				element={
					<PublicRoute>
						<AuthLayout>
							<SuspenseRoute element={<EmailVerification />} />
						</AuthLayout>
					</PublicRoute>
				}
			/>
			{/* Route avec token en paramètre de route */}
			<Route
				path="/verify-email/:token"
				element={
					<PublicRoute>
						<AuthLayout>
							<SuspenseRoute element={<EmailVerification />} />
						</AuthLayout>
					</PublicRoute>
				}
			/>
			{/* Route avec token en query parameter (pour les redirections du backend) */}
			<Route
				path="/verify-email"
				element={
					<PublicRoute>
						<AuthLayout>
							<SuspenseRoute element={<EmailVerification />} />
						</AuthLayout>
					</PublicRoute>
				}
			/>
			<Route
				path="/reset-password/:token"
				element={
					<PublicRoute>
						<AuthLayout>
							<SuspenseRoute element={<ResetPassword />} />
						</AuthLayout>
					</PublicRoute>
				}
			/>

			{/* Routes admin */}
			{adminRoutes.map((route) => (
				<Route
					key={route.path}
					path={route.path}
					element={
						<ProtectedRoute requiredRole="admin">
							<AdminLayout>
								<SuspenseRoute element={route.element} />
							</AdminLayout>
						</ProtectedRoute>
					}
				/>
			))}

			{/* Routes consumer */}
			{consumerRoutes.map((route) => (
				<Route
					key={route.path}
					path={route.path}
					element={
						<ProtectedRoute requiredUserType="consumer">
							<DashboardRouteWrapper>
								<SuspenseRoute element={route.element} />
							</DashboardRouteWrapper>
						</ProtectedRoute>
					}
				/>
			))}

			{/* Routes producer */}
			{producerRoutes.map((route) => (
				<Route
					key={route.path}
					path={route.path}
					element={
						<ProtectedRoute requiredUserType="producer">
							<DashboardRouteWrapper>
								<SuspenseRoute element={route.element} />
							</DashboardRouteWrapper>
						</ProtectedRoute>
					}
				/>
			))}

			{/* Routes transformer */}
			{transformerRoutes.map((route) => (
				<Route
					key={route.path}
					path={route.path}
					element={
						<ProtectedRoute requiredUserType="transformer">
							<DashboardRouteWrapper>
								<SuspenseRoute element={route.element} />
							</DashboardRouteWrapper>
						</ProtectedRoute>
					}
				/>
			))}

			{/* Routes restaurateur */}
			{restaurateurRoutes.map((route) => (
				<Route
					key={route.path}
					path={route.path}
					element={
						<ProtectedRoute requiredUserType="restaurateur">
							<DashboardRouteWrapper>
								<SuspenseRoute element={route.element} />
							</DashboardRouteWrapper>
						</ProtectedRoute>
					}
				/>
			))}

			{/* Routes transporter */}
			{transporterRoutes.map((route) => (
				<Route
					key={route.path}
					path={route.path}
					element={
						<ProtectedRoute requiredUserType="transporter">
							<DashboardRouteWrapper>
								<SuspenseRoute element={route.element} />
							</DashboardRouteWrapper>
						</ProtectedRoute>
					}
				/>
			))}

			{/* Routes exporter */}
			{exporterRoutes.map((route) => (
				<Route
					key={route.path}
					path={route.path}
					element={
						<ProtectedRoute requiredUserType="exporter">
							<DashboardRouteWrapper>
								<SuspenseRoute element={route.element} />
							</DashboardRouteWrapper>
						</ProtectedRoute>
					}
				/>
			))}

			{/* Routes explorer */}
			{explorerRoutes.map((route) => (
				<Route
					key={route.path}
					path={route.path}
					element={
						<ProtectedRoute requiredUserType="explorer">
							<DashboardRouteWrapper>
								<SuspenseRoute element={route.element} />
							</DashboardRouteWrapper>
						</ProtectedRoute>
					}
				/>
			))}

			{/* Route de redirection pour le dashboard */}
			<Route path="/dashboard" element={<UserTypeRedirect />} />

			{/* Route 404 */}
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
};

export default AppRoutes;
