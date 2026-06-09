import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
	FiChevronDown,
	FiX
} from "react-icons/fi";
import { Leaf, Search } from "lucide-react";
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
	const [searchParams, setSearchParams] = useSearchParams();
	const selectedCountry = searchParams.get("country") || "";
	const [searchTerm, setSearchTerm] = useState("");
	
	const { getCachedData, setCachedData } = useApiCache(5 * 60 * 1000); // Cache de 5 minutes

	const handleCountryChange = (country) => {
		const newParams = new URLSearchParams(searchParams);
		if (country) {
			newParams.set("country", country);
		useEffect(() => {
			const loadVendeurs = async (forceRefresh = false) => {
				const cacheKey = `vendeurs_list_${selectedCountry}`;

				try {
					// Vérifier le cache
					if (!forceRefresh) {
						const cached = getCachedData(cacheKey);
						if (cached) {
							setVendeurs(cached.vendeurs || []);
							setLoading(false);
							return;
						}
					}

					setLoading(true);

					const isMyZone = selectedCountry === "MY_ZONE";
					// Cas 1 : l'utilisateur veut uniquement sa zone
					if (isMyZone) {
						const [pResp, tResp, rResp] = await Promise.allSettled([
							producerService.getAllPublic({ limit: 50, useLocation: "true" }),
							transformerService.getAllPublic({ limit: 50, useLocation: "true" }),
							restaurateurService.getAllPublic({ limit: 50, useLocation: "true" }),
						]);

						const localList = [];
						if (pResp.status === "fulfilled" && pResp.value.data.status === "success") {
							localList.push(...(pResp.value.data.data.producers || []).map((producer) => ({
								...producer,
								type: "producer",
								displayName: producer.shopInfo?.shopName || (producer.farmName && producer.farmName !== "À compléter" ? producer.farmName : null) || `${producer.firstName} ${producer.lastName !== "À compléter" ? producer.lastName : ""}`.trim(),
								profileUrl: `/producers/${producer._id}`,
								shopBanner: producer.shopBanner,
								logo: producer.shopLogo,
							}));
						}
						if (tResp.status === "fulfilled" && tResp.value.data.status === "success") {
							localList.push(...(tResp.value.data.data.transformers || []).map((transformer) => ({
								...transformer,
								type: "transformer",
								displayName: transformer.shopInfo?.shopName || ((transformer.companyName && transformer.companyName !== "À compléter") ? transformer.companyName : null) || `${transformer.firstName} ${transformer.lastName !== "À compléter" ? transformer.lastName : ""}`.trim(),
								profileUrl: `/transformers/${transformer._id}`,
								shopBanner: transformer.shopBanner,
								logo: transformer.shopLogo,
							}));
						}
						if (rResp.status === "fulfilled" && rResp.value.data.status === "success") {
							localList.push(...(rResp.value.data.data.restaurateurs || []).map((restaurateur) => ({
								...restaurateur,
								type: "restaurateur",
								displayName: restaurateur.shopInfo?.shopName || ((restaurateur.restaurantName && restaurateur.restaurantName !== "À compléter") ? restaurateur.restaurantName : null) || `${restaurateur.firstName} ${restaurateur.lastName !== "À compléter" ? restaurateur.lastName : ""}`.trim(),
								profileUrl: `/restaurateurs/${restaurateur._id}`,
								shopBanner: restaurateur.restaurantBanner || restaurateur.shopBanner,
								logo: restaurateur.shopLogo,
							}));
						}

						const vendeursAvecNotes = await Promise.all(localList.map(async (vendeur) => {
							if (!vendeur?._id || !["producer", "transformer", "restaurateur"].includes(vendeur.type)) return vendeur;
							try {
								const statsResponse = await reviewService.getProducerRatingStats(vendeur._id);
								const statsData = statsResponse?.data;
								if (statsData) {
									return { ...vendeur, ratings: { ...(vendeur.ratings || {}), average: statsData.averageRating || 0, count: statsData.totalReviews || 0 }, stats: { ...(vendeur.stats || {}), averageRating: statsData.averageRating || 0, totalReviews: statsData.totalReviews || 0 }, reviewStats: statsData };
								}
							} catch (statsError) {
								console.error("Erreur lors du chargement des statistiques d'avis du vendeur:", statsError);
							}
							return vendeur;
						}));

						setVendeurs(vendeursAvecNotes);
						setCachedData(cacheKey, { vendeurs: vendeursAvecNotes, locationInfo: null });
						setLoading(false);
						return;
					}

					// Cas 2 : aucune sélection -> récupérer tout + locaux et fusionner (locaux d'abord)
					if (!selectedCountry) {
						const [allSettled, localSettled] = await Promise.allSettled([
							Promise.allSettled([
								producerService.getAllPublic({ limit: 50, useLocation: "false" }),
								transformerService.getAllPublic({ limit: 50, useLocation: "false" }),
								restaurateurService.getAllPublic({ limit: 50, useLocation: "false" }),
							]),
							Promise.allSettled([
								producerService.getAllPublic({ limit: 50, useLocation: "true" }),
								transformerService.getAllPublic({ limit: 50, useLocation: "true" }),
								restaurateurService.getAllPublic({ limit: 50, useLocation: "true" }),
							]),
						]);

						const buildList = (pResp, tResp, rResp) => {
							const list = [];
							if (pResp && pResp.status === "fulfilled" && pResp.value.data.status === "success") list.push(...(pResp.value.data.data.producers || []).map((producer) => ({ ...producer, type: "producer", displayName: producer.shopInfo?.shopName || (producer.farmName && producer.farmName !== "À compléter" ? producer.farmName : null) || `${producer.firstName} ${producer.lastName !== "À compléter" ? producer.lastName : ""}`.trim(), profileUrl: `/producers/${producer._id}`, shopBanner: producer.shopBanner, logo: producer.shopLogo })));
							if (tResp && tResp.status === "fulfilled" && tResp.value.data.status === "success") list.push(...(tResp.value.data.data.transformers || []).map((transformer) => ({ ...transformer, type: "transformer", displayName: transformer.shopInfo?.shopName || ((transformer.companyName && transformer.companyName !== "À compléter") ? transformer.companyName : null) || `${transformer.firstName} ${transformer.lastName !== "À compléter" ? transformer.lastName : ""}`.trim(), profileUrl: `/transformers/${transformer._id}`, shopBanner: transformer.shopBanner, logo: transformer.shopLogo })));
							if (rResp && rResp.status === "fulfilled" && rResp.value.data.status === "success") list.push(...(rResp.value.data.data.restaurateurs || []).map((restaurateur) => ({ ...restaurateur, type: "restaurateur", displayName: restaurateur.shopInfo?.shopName || ((restaurateur.restaurantName && restaurateur.restaurantName !== "À compléter") ? restaurateur.restaurantName : null) || `${restaurateur.firstName} ${restaurateur.lastName !== "À compléter" ? restaurateur.lastName : ""}`.trim(), profileUrl: `/restaurateurs/${restaurateur._id}`, shopBanner: restaurateur.restaurantBanner || restaurateur.shopBanner, logo: restaurateur.shopLogo })));
							return list;
						};

						const [pAll, tAll, rAll] = allSettled[0] || [];
						const [pLocal, tLocal, rLocal] = localSettled[0] || [];
						const allList = buildList(pAll, tAll, rAll);
						const localList = buildList(pLocal, tLocal, rLocal);

						const seen = new Set();
						const merged = [];
						const key = (v) => `${v.type}-${v._id}`;
						for (const v of localList) { merged.push({ ...v, isLocal: true }); seen.add(key(v)); }
						for (const v of allList) { if (!seen.has(key(v))) merged.push(v); }

						const vendeursAvecNotes = await Promise.all(merged.map(async (vendeur) => {
							if (!vendeur?._id || !["producer","transformer","restaurateur"].includes(vendeur.type)) return vendeur;
							try { const statsResponse = await reviewService.getProducerRatingStats(vendeur._id); const statsData = statsResponse?.data; if (statsData) return { ...vendeur, ratings: { ...(vendeur.ratings||{}), average: statsData.averageRating||0, count: statsData.totalReviews||0 }, stats: { ...(vendeur.stats||{}), averageRating: statsData.averageRating||0, totalReviews: statsData.totalReviews||0 }, reviewStats: statsData }; } catch (e) { console.error('Erreur stats', e); }
							return vendeur;
						}));

						setVendeurs(vendeursAvecNotes);
						setCachedData(cacheKey, { vendeurs: vendeursAvecNotes, locationInfo: null });
						setLoading(false);
						return;
					}

					// Cas 3 : pays/zone précis sélectionné
					const queryParams = { limit: 50, useLocation: "false" };
					if (selectedCountry) queryParams.country = selectedCountry;

					const [producersResponse, transformersResponse, restaurateursResponse] = await Promise.allSettled([
						producerService.getAllPublic(queryParams),
						transformerService.getAllPublic(queryParams),
						restaurateurService.getAllPublic(queryParams),
					]);

					const allVendeurs = [];
					let locationData = null;

					if (producersResponse.status === "fulfilled" && producersResponse.value.data.status === "success") {
						const producers = producersResponse.value.data.data.producers || [];
						if (producersResponse.value.data.data.location) locationData = producersResponse.value.data.data.location;
						allVendeurs.push(...producers.map((producer) => ({ ...producer, type: "producer", displayName: producer.shopInfo?.shopName || (producer.farmName && producer.farmName !== "À compléter" ? producer.farmName : null) || `${producer.firstName} ${producer.lastName !== "À compléter" ? producer.lastName : ""}`.trim(), profileUrl: `/producers/${producer._id}`, shopBanner: producer.shopBanner, logo: producer.shopLogo })));
					}

					if (transformersResponse.status === "fulfilled" && transformersResponse.value.data.status === "success") {
						const transformers = transformersResponse.value.data.data.transformers || [];
						allVendeurs.push(...transformers.map((transformer) => ({ ...transformer, type: "transformer", displayName: transformer.shopInfo?.shopName || ((transformer.companyName && transformer.companyName !== "À compléter") ? transformer.companyName : null) || `${transformer.firstName} ${transformer.lastName !== "À compléter" ? transformer.lastName : ""}`.trim(), profileUrl: `/transformers/${transformer._id}`, shopBanner: transformer.shopBanner, logo: transformer.shopLogo })));
					}

					if (restaurateursResponse.status === "fulfilled" && restaurateursResponse.value.data.status === "success") {
						const restaurateurs = restaurateursResponse.value.data.data.restaurateurs || [];
						allVendeurs.push(...restaurateurs.map((restaurateur) => ({ ...restaurateur, type: "restaurateur", displayName: restaurateur.shopInfo?.shopName || ((restaurateur.restaurantName && restaurateur.restaurantName !== "À compléter") ? restaurateur.restaurantName : null) || `${restaurateur.firstName} ${restaurateur.lastName !== "À compléter" ? restaurateur.lastName : ""}`.trim(), profileUrl: `/restaurateurs/${restaurateur._id}`, shopBanner: restaurateur.restaurantBanner || restaurateur.shopBanner, logo: restaurateur.shopLogo })));
					}

					const vendeursAvecNotes = await Promise.all(allVendeurs.map(async (vendeur) => {
						if (!vendeur?._id || !["producer","transformer","restaurateur"].includes(vendeur.type)) return vendeur;
						try { const statsResponse = await reviewService.getProducerRatingStats(vendeur._id); const statsData = statsResponse?.data; if (statsData) return { ...vendeur, ratings: { ...(vendeur.ratings||{}), average: statsData.averageRating||0, count: statsData.totalReviews||0 }, stats: { ...(vendeur.stats||{}), averageRating: statsData.averageRating||0, totalReviews: statsData.totalReviews||0 }, reviewStats: statsData }; } catch (e) { console.error('Erreur stats', e); }
						return vendeur;
					}));

					setVendeurs(vendeursAvecNotes);
					setCachedData(cacheKey, { vendeurs: vendeursAvecNotes, locationInfo: locationData });
				} catch (error) {
					console.error("Erreur lors du chargement des vendeurs:", error);
				} finally {
					setLoading(false);
				}
			};

			loadVendeurs();
		}, [getCachedData, setCachedData, selectedCountry]);

				// Mettre en cache
				setCachedData(cacheKey, {
					vendeurs: vendeursAvecNotes,
					locationInfo: locationData,
				});
			} catch (error) {
				console.error("Erreur lors du chargement des vendeurs:", error);
			} finally {
				setLoading(false);
			}
		};

		loadVendeurs();
	}, [getCachedData, setCachedData, selectedCountry]);



	const filteredVendeurs = vendeurs.filter((vendeur) => {
		const matchesType = filter === "all" || vendeur.type === filter;
		const name = (vendeur.displayName || "").toLowerCase();
		const city = (vendeur.city || "").toLowerCase();
		const country = (vendeur.country || "").toLowerCase();
		const region = (vendeur.region || "").toLowerCase();
		const searchLower = searchTerm.toLowerCase();
		const matchesSearch = 
			name.includes(searchLower) || 
			city.includes(searchLower) || 
			region.includes(searchLower) || 
			country.includes(searchLower);
		return matchesType && matchesSearch;
	});

	if (loading) {
		return (
			<div className="min-h-screen bg-harvests-light flex items-center justify-center">
				<LoadingSpinner size="lg" text="Chargement des vendeurs..." />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-200/20 rounded-full blur-[120px]"></div>
				<div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-yellow-200/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-emerald-200/10 rounded-full blur-[120px]"></div>
			</div>

			<div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
				{/* Hero Header Area */}
				<div className="text-center space-y-3 max-w-2xl mx-auto mb-8 animate-in fade-in duration-700">
					<h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-none">
						Découvrez nos <span className="text-emerald-600">Vendeurs Locaux</span>
					</h1>
					<p className="text-xs sm:text-sm text-gray-500 font-medium max-w-md mx-auto">
						Explorez les producteurs, transformateurs et restaurateurs près de chez vous proposant des produits frais et de qualité supérieure.
					</p>
				</div>

				{/* Search & Filters Bar - Separate and smaller */}
				<div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6 animate-slide-up">
					{/* Search input */}
					<div className="relative w-full sm:max-w-md bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
						<div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400">
							<Search className="h-4 w-4" />
						</div>
						<input
							type="text"
							placeholder="Rechercher par nom, ville, région..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-10 py-2.5 bg-transparent border-none focus:outline-none text-gray-900 placeholder:text-gray-400 text-xs font-semibold"
						/>
						{searchTerm && (
							<button
								onClick={() => setSearchTerm("")}
								className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
							>
								<FiX className="h-3.5 w-3.5" />
							</button>
						)}
					</div>

					{/* Country select */}
					<div className="relative w-full sm:w-[220px] bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
						<div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4 pointer-events-none">
							<FiMapPin />
						</div>
						<select
							value={selectedCountry}
							onChange={(e) => handleCountryChange(e.target.value)}
							className="w-full pl-10 pr-8 py-2.5 bg-transparent border-none focus:outline-none appearance-none text-gray-700 font-bold cursor-pointer text-xs"
						>
							<option value="MY_ZONE">Ma zone</option>
							<option value="">Tous les pays / zones</option>
							<optgroup label="Zones">
								<option value="West Africa">Afrique de l'Ouest</option>
								<option value="Central Africa">Afrique Centrale</option>
							</optgroup>
							<optgroup label="Pays">
								<option value="SN">Sénégal</option>
								<option value="CM">Cameroun</option>
								<option value="CI">Côte d'Ivoire</option>
								<option value="BF">Burkina Faso</option>
								<option value="ML">Mali</option>
								<option value="GH">Ghana</option>
								<option value="NG">Nigeria</option>
							</optgroup>
						</select>
						<div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
							<FiChevronDown className="h-4 w-4" />
						</div>
						{selectedCountry && (
							<button
								onClick={() => handleCountryChange("")}
								className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
								title="Effacer le filtre"
							>
								<FiX className="h-3.5 w-3.5" />
							</button>
						)}
					</div>
				</div>

				{/* Type tabs - Separate and smaller */}
				<div className="flex flex-wrap justify-center gap-1.5 mb-8 animate-slide-up">
					{[
						{ id: "all", label: "Tous", color: "bg-emerald-600 text-white" },
						{ id: "producer", label: "Producteurs", color: "bg-green-600 text-white" },
						{ id: "transformer", label: "Transformateurs", color: "bg-purple-600 text-white" },
						{ id: "restaurateur", label: "Restaurateurs", color: "bg-orange-600 text-white" }
					].map((tab) => {
						const isActive = filter === tab.id;
						return (
							<button
								key={tab.id}
								onClick={() => setFilter(tab.id)}
								className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
									isActive ?
										tab.color + " shadow-sm scale-105"
									:	"bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
								}`}
							>
								{tab.label}
							</button>
						);
					})}
				</div>

				{/* Grid */}
				{filteredVendeurs.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up">
						{filteredVendeurs.map((vendeur) => {
							const { averageDisplay, reviewCount } =
								buildVendorRating(vendeur);

							return (
								<Link
									key={`${vendeur.type}-${vendeur._id}`}
									to={vendeur.profileUrl}
									className="bg-white border border-gray-200 rounded-sm hover:shadow-md transition-shadow overflow-hidden block group"
								>
									{/* Bannière en arrière-plan */}
									<div className="relative h-40 bg-gray-100">
										{vendeur.shopBanner ? (
											<img
												src={vendeur.shopBanner}
												alt="Bannière de la boutique"
												className="w-full h-full object-cover"
												onError={(e) => {
													e.target.style.display = "none";
													e.target.nextSibling.style.display = "flex";
												}}
											/>
										) : null}
										<div
											className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center"
											style={{ display: vendeur.shopBanner ? "none" : "flex" }}
										>
											<FiPackage className="w-12 h-12 text-gray-400" />
										</div>

										{/* Photo de profil centrée qui déborde */}
										<div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
											<div className="w-16 h-16 rounded-full bg-white p-1 border border-gray-200 shadow-sm">
												<div className="w-full h-full rounded-full bg-gray-100 overflow-hidden">
													{vendeur.logo ? (
														<img
															src={vendeur.logo}
															alt={`${vendeur.displayName}`}
															className="w-full h-full object-cover"
															onError={(e) => {
																e.target.style.display = "none";
																e.target.nextSibling.style.display = "flex";
															}}
														/>
													) : null}
													<div
														className="w-full h-full bg-primary-100 flex items-center justify-center"
														style={{ display: vendeur.logo ? "none" : "flex" }}
													>
														<span className="text-lg font-bold text-primary-700">
															{vendeur.displayName?.[0] ||
																vendeur.firstName?.[0]}
														</span>
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* Informations */}
									<div className="px-4 pt-10 pb-4 text-center">
										<h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
											{vendeur.displayName}
										</h3>
										
										<div className="flex items-center justify-center text-sm text-gray-600 mb-2">
											<FiMapPin className="mr-1 h-3 w-3" />
											<span>{getCountryName(vendeur.country)}</span>
											{vendeur.city && (
												<span className="ml-1">• {vendeur.city}</span>
											)}
										</div>

										<div className="flex items-center justify-center space-x-2 mb-4">
											<div className="flex items-center text-yellow-500">
												<span className="text-sm font-bold text-gray-800 mr-1">
													{averageDisplay}
												</span>
												<FiStar className="h-4 w-4 fill-current" />
												<span className="ml-1 text-xs text-gray-500">
													({reviewCount})
												</span>
											</div>
											{vendeur.isBio && (
												<span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
													<Leaf className="w-3 h-3 mr-1" />
													BIO
												</span>
											)}
										</div>

										<div className="text-primary-600 text-sm font-medium hover:text-primary-800 hover:underline inline-flex items-center">
											Visiter la boutique
											<FiArrowRight className="ml-1 h-4 w-4" />
										</div>
									</div>
								</Link>
							);
						})}
					</div>
				) : (
					<div className="text-center py-20 bg-white/50 backdrop-blur-md rounded-[2rem] border border-gray-100 max-w-lg mx-auto">
						<FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-4" />
						<h3 className="text-lg font-[1000] text-gray-900 tracking-tight mb-1">
							Aucun vendeur trouvé
						</h3>
						<p className="text-xs text-gray-500 font-medium px-6">
							Essayez de modifier vos filtres ou votre recherche pour découvrir d'autres partenaires.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default Vendeurs;
