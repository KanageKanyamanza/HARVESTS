import React, { useState, useEffect } from "react";
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
import {
	getVendorAverageRating,
	getVendorReviewCount,
	formatAverageRating,
} from "../utils/vendorRatings";

const Vendeurs = () => {
	const [vendeurs, setVendeurs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("all"); // 'all', 'producers', 'transformers', 'restaurateurs'

	const buildVendorRating = (vendor) => {
		const average = getVendorAverageRating(vendor);
		const count = getVendorReviewCount(vendor);
		return {
			averageDisplay: formatAverageRating(average),
			reviewCount: count,
		};
	};

	useEffect(() => {
		const loadVendeurs = async () => {
			try {
				setLoading(true);

				// Charger producteurs, transformateurs et restaurateurs en parallèle
				console.log("🔗 URL API utilisée:", window.location.origin);

				// Test direct de l'API restaurateurs
				try {
					const directTest = await fetch(
						"http://localhost:8000/api/v1/restaurateurs"
					);
					const directData = await directTest.json();
					console.log("🧪 Test direct API:", directData);
				} catch (error) {
					console.error("❌ Erreur test direct:", error);
				}

				// Test avec fetch et headers comme Axios
				try {
					const fetchWithHeaders = await fetch(
						"http://localhost:8000/api/v1/restaurateurs",
						{
							method: "GET",
							headers: {
								"Content-Type": "application/json",
							},
						}
					);
					const fetchData = await fetchWithHeaders.json();
					console.log("🧪 Test fetch avec headers:", fetchData);
				} catch (error) {
					console.error("❌ Erreur test fetch:", error);
				}

				// Test Axios seul
				try {
					const axiosTest = await restaurateurService.getAllPublic();
					console.log("🧪 Test Axios seul:", axiosTest.data);
				} catch (error) {
					console.error("❌ Erreur test Axios:", error);
				}

				// Test avec nouvelle instance Axios sans intercepteurs
				try {
					const axios = (await import("axios")).default;
					const cleanAxios = axios.create({
						baseURL: "http://localhost:8000/api/v1",
						timeout: 60000,
						headers: {
							"Content-Type": "application/json",
						},
					});
					const cleanTest = await cleanAxios.get("/restaurateurs");
					console.log("🧪 Test Axios propre:", cleanTest.data);
				} catch (error) {
					console.error("❌ Erreur test Axios propre:", error);
				}

				const [producersResponse, transformersResponse, restaurateursResponse] =
					await Promise.allSettled([
						producerService.getAllPublic({ limit: 50 }),
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
					
					// Debug: Afficher la structure des données d'un producteur
					if (producers.length > 0) {
						console.log("🔍 Structure producteur:", {
							address: producers[0].address,
							city: producers[0].city,
							region: producers[0].region,
							country: producers[0].country
						});
					}
					
					allVendeurs.push(
						...producers.map((producer) => ({
							...producer,
							type: "producer",
							displayName: producer.farmName || "Producteur",
							profileUrl: `/producers/${producer._id}`,
							shopBanner: producer.shopBanner,
							logo: producer.shopLogo,
						}))
					);
				}

				// Ajouter les transformateurs
				if (
					transformersResponse.status === "fulfilled" &&
					transformersResponse.value.data.status === "success"
				) {
					const transformers =
						transformersResponse.value.data.data.transformers || [];
					
					// Debug: Afficher la structure des données d'un transformateur
					if (transformers.length > 0) {
						console.log("🔍 Structure transformateur:", {
							address: transformers[0].address,
							city: transformers[0].city,
							region: transformers[0].region,
							country: transformers[0].country
						});
					}
					
					allVendeurs.push(
						...transformers.map((transformer) => ({
							...transformer,
							type: "transformer",
							displayName: transformer.companyName || "Transformateur",
							profileUrl: `/transformers/${transformer._id}`,
							shopBanner: transformer.shopBanner,
							logo: transformer.shopLogo,
						}))
					);
				}

				// Ajouter les restaurateurs
				console.log("🔍 Restaurateurs response:", restaurateursResponse);
				if (
					restaurateursResponse.status === "fulfilled" &&
					restaurateursResponse.value.data.status === "success"
				) {
					console.log(
						"📋 Structure de la réponse:",
						restaurateursResponse.value.data
					);
					const restaurateurs =
						restaurateursResponse.value.data.data.restaurateurs || [];
					console.log("📊 Restaurateurs trouvés:", restaurateurs.length);
					console.log("📋 Premier restaurateur:", restaurateurs[0]);
					allVendeurs.push(
						...restaurateurs.map((restaurateur) => ({
							...restaurateur,
							type: "restaurateur",
							displayName: restaurateur.restaurantName || "Restaurant",
							profileUrl: `/restaurateurs/${restaurateur._id}`,
							shopBanner:
								restaurateur.restaurantBanner || restaurateur.shopBanner,
							logo: restaurateur.shopLogo,
						}))
					);
				} else {
					console.error("❌ Erreur restaurateurs:", restaurateursResponse);
				}
				console.log("📊 Total vendeurs chargés:", allVendeurs.length);
				console.log(
					"📋 Types de vendeurs:",
					allVendeurs.map((v) => v.type)
				);
				const vendeursAvecNotes = await Promise.all(
					allVendeurs.map(async (vendeur) => {
						if (!vendeur?._id || !["producer", "transformer"].includes(vendeur.type)) {
							return vendeur;
						}

						try {
							const statsResponse = await reviewService.getProducerRatingStats(vendeur._id);
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
							console.error('Erreur lors du chargement des statistiques d\'avis du vendeur:', statsError);
						}

						return vendeur;
					})
				);

				setVendeurs(vendeursAvecNotes);
			} catch (error) {
				console.error("Erreur lors du chargement des vendeurs:", error);
			} finally {
				setLoading(false);
			}
		};

		loadVendeurs();
	}, []);

	const getCountryName = (code) => {
		const countries = {
			CM: "Cameroun",
			SN: "Sénégal",
			CI: "Côte d'Ivoire",
			GH: "Ghana",
			NG: "Nigeria",
			KE: "Kenya",
		};
		return countries[code] || code;
	};

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
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Chargement des vendeurs...</p>
				</div>
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
				</div>

				{/* Filtres */}
				<div className="flex justify-center mb-8">
					<div className="bg-white rounded-lg shadow-sm p-1 flex overflow-x-auto">
						<button
							onClick={() => setFilter("all")}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								filter === "all"
									? "bg-green-600 text-white"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							Tous
						</button>
						<button
							onClick={() => setFilter("producer")}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								filter === "producer"
									? "bg-green-600 text-white"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							Producteurs
						</button>
						<button
							onClick={() => setFilter("transformer")}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								filter === "transformer"
									? "bg-purple-600 text-white"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							Transformateurs
						</button>
						<button
							onClick={() => setFilter("restaurateur")}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								filter === "restaurateur"
									? "bg-orange-600 text-white"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							Restaurateurs
						</button>
					</div>
				</div>

				{filteredVendeurs.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
				{filteredVendeurs.map((vendeur) => {
					const { averageDisplay, reviewCount } = buildVendorRating(vendeur);
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
											vendeur.type
										)}`}
									>
										{vendeur.shopBanner ? (
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
										) : (
											<div
												className={`w-full h-full bg-gradient-to-r ${getGradientColors(
													vendeur.type
												)} flex items-center justify-center`}
											>
												<BadgeIcon className="w-12 h-12 text-white opacity-50" />
											</div>
										)}

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
													{vendeur.logo ? (
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
													) : (
														<div className="w-full h-full bg-purple-100 flex items-center justify-center">
															<span className="text-sm font-bold text-purple-600">
																{vendeur.displayName?.[0] ||
																	vendeur.firstName?.[0]}
															</span>
														</div>
													)}
												</div>
											</div>
										</div>
									</div>

									{/* Informations en bas */}
									<div className="p-4 pt-6">
										<h3 className="font-semibold text-gray-900 mb-1 text-lg">
											{vendeur.displayName}
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
													{vendeur.type === "producer"
														? "Produits"
														: "Services"}
												</span>
												<FiArrowRight className="text-gray-400 group-hover:text-gray-600 transition-colors" />
											</div>
										</div>
									</div>
								</Link>
							);
						})}
					</div>
				) : (
					<div className="text-center py-12">
						<FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Aucun vendeur disponible
						</h3>
						<p className="text-gray-500">
							Revenez plus tard pour découvrir nos vendeurs.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default Vendeurs;
