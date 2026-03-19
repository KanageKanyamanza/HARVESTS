import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
	producerService,
	transformerService,
	restaurateurService,
	reviewService,
} from "../services";
import {
	FiMapPin,
	FiStar,
	FiPackage,
	FiArrowRight,
	FiTool,
	FiSun,
} from "react-icons/fi";
import { Leaf } from "lucide-react";
import {
	getVendorAverageRating,
	getVendorReviewCount,
	formatAverageRating,
} from "../utils/vendorRatings";
import { getCountryName } from "../utils/countryMapper";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useApiCache } from "../hooks/useApiCache";

const Vendeurs = () => {
	const [vendeurs, setVendeurs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("all"); // 'all', 'producers', 'transformers', 'restaurateurs'
	const [locationInfo, setLocationInfo] = useState(null);
	const { getCachedData, setCachedData } = useApiCache(5 * 60 * 1000); // Cache de 5 minutes
	const hasLoadedRef = useRef(false);

	const buildVendorRating = (vendor) => {
		const average = getVendorAverageRating(vendor);
		const count = getVendorReviewCount(vendor);
		return {
			averageDisplay: formatAverageRating(average),
			reviewCount: count,
		};
	};

	useEffect(() => {
		const loadVendeurs = async (forceRefresh = false) => {
			// Éviter les appels multiples simultanés
			if (hasLoadedRef.current && !forceRefresh) return;
			hasLoadedRef.current = true;

			try {
				const cacheKey = "vendeurs_list";

				// Vérifier le cache
				if (!forceRefresh) {
					const cached = getCachedData(cacheKey);
					if (cached) {
						setVendeurs(cached.vendeurs || []);
						setLocationInfo(cached.locationInfo || null);
						setLoading(false);
						hasLoadedRef.current = false;
						return;
					}
				}

				setLoading(true);

				// Charger producteurs, transformateurs et restaurateurs en parallèle
				const API_BASE_URL =
					import.meta.env.VITE_API_URL ||
					"https://harvests.onrender.com/api/v1";

				const [producersResponse, transformersResponse, restaurateursResponse] =
					await Promise.allSettled([
						producerService.getAllPublic({ limit: 50, useLocation: "true" }),
						transformerService.getAllPublic({ limit: 50 }),
						restaurateurService.getAllPublic({ limit: 50 }),
					]);

				const allVendeurs = [];

				// Ajouter les producteurs
				if (
					producersResponse.status === "fulfilled" &&
					producersResponse.value.data.status === "success"
				) {
					const producers = producersResponse.value.data.data.producers || [];

					// Stocker les informations de localisation
					if (producersResponse.value.data.data.location) {
						setLocationInfo(producersResponse.value.data.data.location);
					}

					allVendeurs.push(
						...producers.map((producer) => ({
							...producer,
							type: "producer",
							displayName:
								producer.shopInfo?.shopName ||
								(producer.farmName && producer.farmName !== "À compléter" ?
									producer.farmName
								:	null) ||
								`${producer.firstName} ${producer.lastName !== "À compléter" ? producer.lastName : ""}`.trim(),
							profileUrl: `/producers/${producer._id}`,
							shopBanner: producer.shopBanner,
							logo: producer.shopLogo,
						})),
					);
				}

				// Ajouter les transformateurs
				if (
					transformersResponse.status === "fulfilled" &&
					transformersResponse.value.data.status === "success"
				) {
					const transformers =
						transformersResponse.value.data.data.transformers || [];

					allVendeurs.push(
						...transformers.map((transformer) => ({
							...transformer,
							type: "transformer",
							displayName:
								transformer.shopInfo?.shopName ||
								((
									transformer.companyName &&
									transformer.companyName !== "À compléter"
								) ?
									transformer.companyName
								:	null) ||
								`${transformer.firstName} ${transformer.lastName !== "À compléter" ? transformer.lastName : ""}`.trim(),
							profileUrl: `/transformers/${transformer._id}`,
							shopBanner: transformer.shopBanner,
							logo: transformer.shopLogo,
						})),
					);
				}

				// Ajouter les restaurateurs

				if (
					restaurateursResponse.status === "fulfilled" &&
					restaurateursResponse.value.data.status === "success"
				) {
					const restaurateurs =
						restaurateursResponse.value.data.data.restaurateurs || [];
					allVendeurs.push(
						...restaurateurs.map((restaurateur) => ({
							...restaurateur,
							type: "restaurateur",
							displayName:
								restaurateur.shopInfo?.shopName ||
								((
									restaurateur.restaurantName &&
									restaurateur.restaurantName !== "À compléter"
								) ?
									restaurateur.restaurantName
								:	null) ||
								`${restaurateur.firstName} ${restaurateur.lastName !== "À compléter" ? restaurateur.lastName : ""}`.trim(),
							profileUrl: `/restaurateurs/${restaurateur._id}`,
							shopBanner:
								restaurateur.restaurantBanner || restaurateur.shopBanner,
							logo: restaurateur.shopLogo,
						})),
					);
				} else {
					console.error("❌ Erreur restaurateurs:", restaurateursResponse);
				}

				const vendeursAvecNotes = await Promise.all(
					allVendeurs.map(async (vendeur) => {
						if (
							!vendeur?._id ||
							!["producer", "transformer", "restaurateur"].includes(
								vendeur.type,
							)
						) {
							return vendeur;
						}

						try {
							const statsResponse = await reviewService.getProducerRatingStats(
								vendeur._id,
							);
							const statsData = statsResponse?.data;
							if (statsData) {
								return {
									...vendeur,
									ratings: {
										...(vendeur.ratings || {}),
										average: statsData.averageRating || 0,
										count: statsData.totalReviews || 0,
									},
									stats: {
										...(vendeur.stats || {}),
										averageRating: statsData.averageRating || 0,
										totalReviews: statsData.totalReviews || 0,
									},
									reviewStats: statsData,
								};
							}
						} catch (statsError) {
							console.error(
								"Erreur lors du chargement des statistiques d'avis du vendeur:",
								statsError,
							);
						}

						return vendeur;
					}),
				);

				setVendeurs(vendeursAvecNotes);

				// Mettre en cache
				setCachedData(cacheKey, {
					vendeurs: vendeursAvecNotes,
					locationInfo: locationInfo,
				});
			} catch (error) {
				console.error("Erreur lors du chargement des vendeurs:", error);
			} finally {
				setLoading(false);
				hasLoadedRef.current = false;
			}
		};

		loadVendeurs();
	}, [getCachedData, setCachedData]);

	const getTypeBadge = (type) => {
		switch (type) {
			case "producer":
				return {
					label: "Producteur",
					icon: FiSun,
					color: "bg-green-100 text-green-800",
					iconColor: "text-green-600",
				};
			case "transformer":
				return {
					label: "Transformateur",
					icon: FiTool,
					color: "bg-purple-100 text-purple-800",
					iconColor: "text-purple-600",
				};
			case "restaurateur":
				return {
					label: "Restaurateur",
					icon: FiPackage,
					color: "bg-orange-100 text-orange-800",
					iconColor: "text-orange-600",
				};
			default:
				return {
					label: "Vendeur",
					icon: FiPackage,
					color: "bg-gray-100 text-gray-800",
					iconColor: "text-gray-600",
				};
		}
	};

	const getGradientColors = (type) => {
		switch (type) {
			case "producer":
				return "from-green-400 to-green-600";
			case "transformer":
				return "from-purple-400 to-purple-600";
			case "restaurateur":
				return "from-orange-400 to-orange-600";
			default:
				return "from-gray-400 to-gray-600";
		}
	};

	const filteredVendeurs = vendeurs.filter((vendeur) => {
		if (filter === "all") return true;
		return vendeur.type === filter;
	});

	if (loading) {
		return (
			<div className="min-h-screen bg-harvests-light flex items-center justify-center">
				<LoadingSpinner size="lg" text="Chargement des vendeurs..." />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-harvests-light">
			<div className="container mx-auto px-4 py-8">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						Nos Vendeurs
					</h1>
					<p className="text-xl text-gray-600">
						Découvrez les producteurs et transformateurs locaux qui proposent
						des produits frais et de qualité
					</p>

					{/* Message discret si pas de vendeurs dans la zone */}
					{locationInfo?.detected && locationInfo?.noProducersInZone && (
						<div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
							<svg
								className="w-4 h-4 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span>
								Aucun vendeur disponible dans votre zone. Affichage de tous les
								vendeurs.
							</span>
						</div>
					)}
				</div>

				{/* Filtres */}
				<div className="flex justify-center mb-8">
					<div className="bg-white rounded-lg shadow-sm p-1 flex overflow-x-auto">
						<button
							onClick={() => setFilter("all")}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								filter === "all" ?
									"bg-green-600 text-white"
								:	"text-gray-600 hover:text-gray-900"
							}`}
						>
							Tous
						</button>
						<button
							onClick={() => setFilter("producer")}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								filter === "producer" ?
									"bg-green-600 text-white"
								:	"text-gray-600 hover:text-gray-900"
							}`}
						>
							Producteurs
						</button>
						<button
							onClick={() => setFilter("transformer")}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								filter === "transformer" ?
									"bg-purple-600 text-white"
								:	"text-gray-600 hover:text-gray-900"
							}`}
						>
							Transformateurs
						</button>
						<button
							onClick={() => setFilter("restaurateur")}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								filter === "restaurateur" ?
									"bg-orange-600 text-white"
								:	"text-gray-600 hover:text-gray-900"
							}`}
						>
							Restaurateurs
						</button>
					</div>
				</div>

				{filteredVendeurs.length > 0 ?
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
						{filteredVendeurs.map((vendeur) => {
							const { averageDisplay, reviewCount } =
								buildVendorRating(vendeur);
							const typeBadge = getTypeBadge(vendeur.type);
							const BadgeIcon = typeBadge.icon;

							return (
								<Link
									key={`${vendeur.type}-${vendeur._id}`}
									to={vendeur.profileUrl}
									className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden block group"
								>
									{/* Bannière en arrière-plan */}
									<div
										className={`relative h-[175px] bg-gradient-to-r ${getGradientColors(
											vendeur.type,
										)}`}
									>
										{vendeur.shopBanner ?
											<img
												src={vendeur.shopBanner}
												alt="Bannière de la boutique"
												className="w-full h-full object-cover"
												onError={(e) => {
													e.target.style.display = "none";
													e.target.nextSibling.style.display = "flex";
												}}
												onLoad={() => {
													// Image loaded successfully
												}}
											/>
										:	<div
												className={`w-full h-full bg-gradient-to-r ${getGradientColors(
													vendeur.type,
												)} flex items-center justify-center`}
											>
												<BadgeIcon className="w-12 h-12 text-white opacity-50" />
											</div>
										}

										{/* Overlay pour améliorer la lisibilité */}
										<div className="absolute inset-0 bg-black bg-opacity-20"></div>

										{/* Badge de type */}
										<div className="absolute top-3 right-3">
											<span
												className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeBadge.color}`}
											>
												<BadgeIcon
													className={`w-3 h-3 mr-1 ${typeBadge.iconColor}`}
												/>
												{typeBadge.label}
											</span>
										</div>

										{/* Photo de profil en coin inférieur gauche */}
										<div className="absolute bottom-5 left-5 transform -translate-x-2 translate-y-2">
											<div className="w-16 h-16 rounded-full bg-white p-1 shadow-lg">
												<div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
													{vendeur.logo ?
														<img
															src={vendeur.logo}
															alt={`${vendeur.displayName}`}
															className="w-full h-full object-cover"
															onError={(e) => {
																e.target.style.display = "none";
																e.target.nextSibling.style.display = "flex";
															}}
															onLoad={() => {
																// Avatar loaded successfully
															}}
														/>
													:	<div className="w-full h-full bg-purple-100 flex items-center justify-center">
															<span className="text-sm font-bold text-purple-600">
																{vendeur.displayName?.[0] ||
																	vendeur.firstName?.[0]}
															</span>
														</div>
													}
												</div>
											</div>
										</div>
									</div>

									{/* Informations en bas */}
									<div className="p-4 pt-6">
										<h3 className="font-semibold text-gray-900 mb-1 text-lg flex items-center justify-between">
											<span className="truncate">{vendeur.displayName}</span>
											{vendeur.isBio && (
												<span
													className="flex-shrink-0 inline-flex items-center px-2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"
													title="Certifié Bio"
												>
													<Leaf className="w-3 h-3 mr-1" />
													BIO
												</span>
											)}
										</h3>
										<div className="flex items-center text-gray-500 text-sm mb-3">
											<FiMapPin className="mr-1" />
											<span>{getCountryName(vendeur.country)}</span>
											{vendeur.city && (
												<span className="ml-2">• {vendeur.city}</span>
											)}
											{vendeur.region && (
												<span className="ml-2">• {vendeur.region}</span>
											)}
										</div>

										{/* Statistiques */}
										<div className="flex items-center justify-between text-sm">
											<div className="flex items-center text-yellow-600">
												<FiStar className="mr-1" />
												<span>{averageDisplay}</span>
												<span className="ml-1 text-xs text-gray-500">
													({reviewCount} avis)
												</span>
											</div>
											<div className="flex items-center text-gray-500">
												<FiPackage className="mr-1" />
												<span className="mr-1">
													{vendeur.type === "producer" ?
														"Produits"
													:	"Services"}
												</span>
												<FiArrowRight className="text-gray-400 group-hover:text-gray-600 transition-colors" />
											</div>
										</div>
									</div>
								</Link>
							);
						})}
					</div>
				:	<div className="text-center py-12">
						<FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Aucun vendeur disponible
						</h3>
						<p className="text-gray-500">
							Revenez plus tard pour découvrir nos vendeurs.
						</p>
					</div>
				}
			</div>
		</div>
	);
};

export default Vendeurs;
