import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
	useMemo,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useOrderNotifications } from "../../hooks/useOrderNotifications";
import ModularDashboardLayout from "../layout/ModularDashboardLayout";
import CommonStats from "../common/CommonStats";
import { authService } from "../../services";
import { normalizeDishImage } from "../../utils/dishImageUtils";
import { FiAlertCircle, FiMail, FiRefreshCw, FiCheck } from "react-icons/fi";

// Composant pour la bannière de vérification d'email
const EmailVerificationBanner = ({ userEmail }) => {
	const [isResending, setIsResending] = useState(false);
	const [resendStatus, setResendStatus] = useState(null);
	const [lastResendTime, setLastResendTime] = useState(0);

	const handleResendEmail = async () => {
		if (!userEmail) {
			setResendStatus("error");
			return;
		}

		// Protection contre les clics trop rapides (30 secondes minimum)
		const now = Date.now();
		const timeSinceLastResend = now - lastResendTime;
		const minInterval = 30 * 1000; // 30 secondes

		if (timeSinceLastResend < minInterval && lastResendTime > 0) {
			const remainingTime = Math.ceil(
				(minInterval - timeSinceLastResend) / 1000,
			);
			setResendStatus("wait");
			setTimeout(() => setResendStatus(null), 2000);
			return;
		}

		setIsResending(true);
		setResendStatus(null);
		setLastResendTime(now);

		try {
			await authService.resendVerification(userEmail);
			setResendStatus("success");
		} catch (error) {
			console.error("Erreur lors du renvoi de l'email:", error);
			setResendStatus("error");
		} finally {
			setIsResending(false);
		}
	};

	return (
		<div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
			<div className="flex items-start">
				<FiAlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
				<div className="flex-1">
					<h3 className="text-sm font-medium text-yellow-800">
						Vérification d'email requise
					</h3>
					<p className="mt-1 text-sm text-yellow-700">
						Pour accéder à toutes les fonctionnalités du dashboard, veuillez
						vérifier votre adresse email.
						{userEmail && (
							<span className="block mt-1 font-medium">
								Email : {userEmail}
							</span>
						)}
					</p>

					{/* Messages de statut */}
					{resendStatus === "success" && (
						<div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
							<div className="flex items-center">
								<FiCheck className="h-4 w-4 text-green-600 mr-2" />
								<p className="text-sm text-green-700">
									Email de vérification renvoyé avec succès ! Vérifiez votre
									boîte de réception.
								</p>
							</div>
						</div>
					)}

					{resendStatus === "error" && (
						<div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
							<div className="flex items-center">
								<FiAlertCircle className="h-4 w-4 text-red-600 mr-2" />
								<p className="text-sm text-red-700">
									Erreur lors du renvoi. Veuillez réessayer.
								</p>
							</div>
						</div>
					)}

					{resendStatus === "wait" && (
						<div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
							<p className="text-sm text-blue-700">
								Veuillez attendre avant de renvoyer l'email.
							</p>
						</div>
					)}

					{/* Bouton de renvoi */}
					<div className="mt-3">
						<button
							onClick={handleResendEmail}
							disabled={isResending || resendStatus === "success" || !userEmail}
							className="inline-flex items-center px-3 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{isResending ?
								<>
									<FiRefreshCw className="h-4 w-4 mr-2 animate-spin" />
									Envoi en cours...
								</>
							: resendStatus === "success" ?
								<>
									<FiCheck className="h-4 w-4 mr-2" />
									Email renvoyé
								</>
							:	<>
									<FiMail className="h-4 w-4 mr-2" />
									Renvoyer l'email de vérification
								</>
							}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

const GenericDashboard = ({
	userType,
	service,
	title,
	description,
	icon,
	statsConfig,
	sections = [],
	loading: externalLoading,
}) => {
	const { user, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const { notifyNewOrder } = useOrderNotifications();

	// États communs
	const [stats, setStats] = useState(null);
	const [products, setProducts] = useState([]);
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [emailVerificationRequired, setEmailVerificationRequired] =
		useState(false);
	const previousOrdersCountRef = useRef(0);
	const isLoadingRef = useRef(false);

	// Fonction pour calculer les revenus du mois en cours
	const calculateMonthlyRevenue = useCallback(
		(orders) => {
			const now = new Date();
			const currentMonth = now.getMonth();
			const currentYear = now.getFullYear();

			return orders
				.filter((order) => {
					const orderDate = new Date(order.createdAt);
					return (
						orderDate.getMonth() === currentMonth &&
						orderDate.getFullYear() === currentYear &&
						order.status === "completed"
					);
				})
				.reduce(
					(total, order) => total + (order.total || order.totalAmount || 0),
					0,
				);
		},
		[userType],
	);

	// Fonction pour charger les données du dashboard
	const loadDashboardData = useCallback(async () => {
		if (isLoadingRef.current) return;
		isLoadingRef.current = true;

		try {
			// Pour les consommateurs, ne pas charger les produits
			const promises = [
				service.getStats().catch((err) => {
					console.warn("Erreur lors du chargement des stats:", err);
					if (
						err.response?.status === 403 &&
						err.response?.data?.code === "EMAIL_VERIFICATION_REQUIRED"
					) {
						setEmailVerificationRequired(true);
					}
					return { data: { stats: {} } };
				}),
				service.getOrders({ limit: 5 }).catch((err) => {
					console.warn("Erreur lors du chargement des commandes:", err);
					if (
						err.response?.status === 403 &&
						err.response?.data?.code === "EMAIL_VERIFICATION_REQUIRED"
					) {
						setEmailVerificationRequired(true);
					}
					return { data: { orders: [] } };
				}),
			];

			// Ajouter le chargement des produits seulement si ce n'est pas un consommateur, exportateur ou transporteur
			if (
				userType !== "consumer" &&
				userType !== "exporter" &&
				userType !== "transporter"
			) {
				// Pour les restaurateurs, utiliser getDishes() au lieu de getProducts()
				const productsPromise =
					userType === "restaurateur" ?
						service.getDishes({ limit: 5 })
					:	service.getProducts({ limit: 5 });

				promises.splice(
					1,
					0,
					productsPromise.catch((err) => {
						console.warn("Erreur lors du chargement des produits:", err);
						if (
							err.response?.status === 403 &&
							err.response?.data?.code === "EMAIL_VERIFICATION_REQUIRED"
						) {
							setEmailVerificationRequired(true);
						}
						return { data: { products: [] } };
					}),
				);
			}

			const responses = await Promise.all(promises);

			// Extraire les réponses selon le type d'utilisateur
			let statsResponse, productsResponse, ordersResponse;

			if (
				userType === "consumer" ||
				userType === "exporter" ||
				userType === "transporter"
			) {
				[statsResponse, ordersResponse] = responses;
				productsResponse = { data: { products: [] } }; // Pas de produits pour les consommateurs, exportateurs et transporteurs
			} else {
				[statsResponse, productsResponse, ordersResponse] = responses;
			}

			// Extraire les données correctement selon la structure de l'API
			// Pour les transformateurs, les stats sont directement dans data, pas dans data.stats
			setStats(
				statsResponse.data.data?.stats ||
					statsResponse.data.stats ||
					statsResponse.data.data ||
					statsResponse.data ||
					{},
			);

			// Pour les restaurateurs, les plats peuvent être dans data.data.dishes ou data.dishes
			let productsData = [];
			if (userType === "restaurateur") {
				const dishes =
					productsResponse.data?.data?.dishes ||
					productsResponse.data?.dishes ||
					productsResponse.data?.data ||
					productsResponse.data ||
					[];

				productsData =
					Array.isArray(dishes) ?
						dishes.map((dish) => normalizeDishImage({ ...dish }))
					:	[];
			} else {
				productsData =
					productsResponse.data?.data?.products ||
					productsResponse.data?.products ||
					productsResponse.data ||
					[];
			}
			setProducts(Array.isArray(productsData) ? productsData : []);

			const ordersData =
				ordersResponse.data.data?.orders || ordersResponse.data.orders || [];
			setOrders(Array.isArray(ordersData) ? ordersData : []);

			// Vérifier les nouvelles commandes
			const currentOrdersCount = ordersData.length;
			if (
				currentOrdersCount > previousOrdersCountRef.current &&
				previousOrdersCountRef.current > 0
			) {
				const newOrdersCount =
					currentOrdersCount - previousOrdersCountRef.current;
				notifyNewOrder(newOrdersCount);
			}
			previousOrdersCountRef.current = currentOrdersCount;
		} catch (error) {
			console.error("Erreur lors du chargement du dashboard:", error);
		} finally {
			setLoading(false);
			isLoadingRef.current = false;
		}
	}, [service, notifyNewOrder]);

	// Charger les données au montage du composant
	useEffect(() => {
		if (isAuthenticated && user) {
			// Délai pour éviter les appels simultanés
			const timeoutId = setTimeout(() => {
				loadDashboardData();
			}, 100);

			return () => clearTimeout(timeoutId);
		}
	}, [isAuthenticated, user]);

	// Recharger les données toutes les 5 minutes
	useEffect(() => {
		const interval = setInterval(
			() => {
				if (isAuthenticated && user && !isLoadingRef.current) {
					loadDashboardData();
				}
			},
			5 * 60 * 1000,
		); // 5 minutes

		return () => clearInterval(interval);
	}, [isAuthenticated, user]);

	// Calculer les revenus du mois
	const monthlyRevenue = useMemo(() => {
		return calculateMonthlyRevenue(orders);
	}, [orders, calculateMonthlyRevenue]);

	// Configuration des statistiques selon le type d'utilisateur
	const getStatsConfig = () => {
		// Combiner les stats du backend avec les stats calculées localement
		const baseConfig = {
			...stats, // Inclure toutes les stats du backend
			monthlyRevenue,
			totalOrders: orders.length,
			totalProducts: products.length,
			averageRating: stats?.averageRating || stats?.ratings?.average || 0,
			totalReviews: stats?.totalReviews || stats?.ratings?.count || 0,
		};

		// Si un statsConfig est fourni, l'utiliser pour transformer les stats
		if (statsConfig) {
			return statsConfig(baseConfig);
		}

		// Sinon, retourner la configuration par défaut
		return baseConfig;
	};

	if (!isAuthenticated || !user) {
		return (
			<ModularDashboardLayout>
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							Accès non autorisé
						</h2>
						<p className="text-gray-600 mb-6">
							Vous devez être connecté pour accéder à cette page.
						</p>
						<Link
							to="/login"
							className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
						>
							Se connecter
						</Link>
					</div>
				</div>
			</ModularDashboardLayout>
		);
	}

	// Combiner le loading externe et interne
	const isLoading = loading || externalLoading;

	if (isLoading) {
		return (
			<ModularDashboardLayout>
				<div className="p-6 max-w-7xl mx-auto pb-20">
					{/* Header Skeleton */}
					<div className="mb-8">
						<div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
						<div className="h-4 bg-gray-200 rounded w-1/2"></div>
					</div>

					{/* Content Skeleton */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div className="bg-white rounded-lg shadow p-6">
							<div className="h-6 bg-gray-200 rounded mb-4"></div>
							<div className="space-y-3">
								{[1, 2, 3].map((i) => (
									<div key={i} className="h-4 bg-gray-200 rounded"></div>
								))}
							</div>
						</div>
						<div className="bg-white rounded-lg shadow p-6">
							<div className="h-6 bg-gray-200 rounded mb-4"></div>
							<div className="space-y-3">
								{[1, 2, 3].map((i) => (
									<div key={i} className="h-4 bg-gray-200 rounded"></div>
								))}
							</div>
						</div>
					</div>
				</div>
			</ModularDashboardLayout>
		);
	}

	return (
		<ModularDashboardLayout>
			<div className="p-6 max-w-7xl mx-auto pb-20">
				{/* Alerte de vérification d'email */}
				{emailVerificationRequired && (
					<EmailVerificationBanner userEmail={user?.email} />
				)}

				{/* Quota Alerts */}
				{stats?.maxWeeklyOrders !== -1 &&
					stats?.weeklyOrders >= stats?.maxWeeklyOrders && (
						<div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<FiAlertCircle className="h-5 w-5 text-red-500" />
								</div>
								<div className="ml-3">
									<p className="text-sm text-red-700 font-bold">
										Quota hebdomadaire atteint ({stats.weeklyOrders}/
										{stats.maxWeeklyOrders})
									</p>
									<p className="text-xs text-red-600">
										Vous avez atteint votre limite de commandes/actions pour
										cette semaine. Passez au plan Standard ou Premium pour lever
										cette limite.
									</p>
								</div>
								<div className="ml-auto">
									<button
										onClick={() => (window.location.href = "/pricing")}
										className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-md font-bold hover:bg-red-700 transition-colors uppercase tracking-wider"
									>
										Upgrade
									</button>
								</div>
							</div>
						</div>
					)}

				{stats?.maxWeeklyOrders !== -1 &&
					stats?.weeklyOrders < stats?.maxWeeklyOrders &&
					stats?.weeklyOrders >= stats?.maxWeeklyOrders * 0.8 && (
						<div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg shadow-sm">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<FiAlertCircle className="h-5 w-5 text-amber-500" />
								</div>
								<div className="ml-3">
									<p className="text-sm text-amber-700 font-bold">
										Limite hebdomadaire proche ({stats.weeklyOrders}/
										{stats.maxWeeklyOrders})
									</p>
									<p className="text-xs text-amber-600">
										Vous approchez de votre limite de commandes pour cette
										semaine. Anticipez en passant à un plan supérieur.
									</p>
								</div>
								<div className="ml-auto">
									<button
										onClick={() => (window.location.href = "/pricing")}
										className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-md font-bold hover:bg-amber-700 transition-colors uppercase tracking-wider"
									>
										Upgrade
									</button>
								</div>
							</div>
						</div>
					)}

				{/* Header */}
				<div className="mb-8">
					<div className="flex justify-between items-start">
						<div>
							<h1 className="text-2xl font-bold text-gray-900 flex items-center">
								{icon && <span className="mr-3">{icon}</span>}
								{title}
							</h1>
							<p className="text-gray-600 mt-1">{description}</p>
						</div>
						{/* <div className="flex space-x-3">
              <Link
                to="/dashboard/profile"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              >
                <FiEdit className="mr-2" />
                Mon profil
              </Link>
              <Link
                to="/dashboard/settings"
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
              >
                <FiEdit className="mr-2" />
                Paramètres
              </Link>
            </div> */}
					</div>
				</div>

				{/* Statistiques communes */}
				<div className="mb-8">
					<CommonStats
						stats={getStatsConfig()}
						userType={userType}
						loading={isLoading}
					/>
				</div>

				{/* Sections personnalisées */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
					{sections.map((section, index) => (
						<div
							key={index}
							className={`bg-white rounded-lg shadow p-4 ${
								section.fullWidth ? "w-full" : "w-full"
							}`}
						>
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-semibold text-gray-900 flex items-center">
									{section.icon && <span className="mr-2">{section.icon}</span>}
									{section.title}
								</h3>
								{section.action && (
									<Link
										to={section.action.to}
										className="text-blue-600 hover:text-blue-800 text-sm font-medium"
									>
										{section.action.text}
									</Link>
								)}
							</div>
							{React.cloneElement(section.content, {
								products,
								userType,
								loading: isLoading,
								orders,
								stats,
								service,
							})}
						</div>
					))}
				</div>
			</div>
		</ModularDashboardLayout>
	);
};

export default GenericDashboard;
