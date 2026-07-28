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
import { buildVendorRating } from "../utils/vendorRatings";
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
		} else {
			newParams.delete("country");
		}
		setSearchParams(newParams);
	};

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
								logo: producer.shopLogo
							})));
						}
						if (tResp.status === "fulfilled" && tResp.value.data.status === "success") {
							localList.push(...(tResp.value.data.data.transformers || []).map((transformer) => ({
								...transformer,
								type: "transformer",
								displayName: transformer.shopInfo?.shopName || ((transformer.companyName && transformer.companyName !== "À compléter") ? transformer.companyName : null) || `${transformer.firstName} ${transformer.lastName !== "À compléter" ? transformer.lastName : ""}`.trim(),
								profileUrl: `/transformers/${transformer._id}`,
								shopBanner: transformer.shopBanner,
								logo: transformer.shopLogo
							})));
						}
						if (rResp.status === "fulfilled" && rResp.value.data.status === "success") {
							localList.push(...(rResp.value.data.data.restaurateurs || []).map((restaurateur) => ({
								...restaurateur,
								type: "restaurateur",
								displayName: restaurateur.shopInfo?.shopName || ((restaurateur.restaurantName && restaurateur.restaurantName !== "À compléter") ? restaurateur.restaurantName : null) || `${restaurateur.firstName} ${restaurateur.lastName !== "À compléter" ? restaurateur.lastName : ""}`.trim(),
								profileUrl: `/restaurateurs/${restaurateur._id}`,
								shopBanner: restaurateur.restaurantBanner || restaurateur.shopBanner,
								logo: restaurateur.shopLogo
							})));
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
						const [pAll, tAll, rAll, pLocal, tLocal, rLocal] = await Promise.allSettled([
							producerService.getAllPublic({ limit: 60, useLocation: "false" }),
							transformerService.getAllPublic({ limit: 60, useLocation: "false" }),
							restaurateurService.getAllPublic({ limit: 60, useLocation: "false" }),
							producerService.getAllPublic({ limit: 60, useLocation: "true" }),
							transformerService.getAllPublic({ limit: 60, useLocation: "true" }),
							restaurateurService.getAllPublic({ limit: 60, useLocation: "true" }),
						]);

						const buildList = (pResp, tResp, rResp) => {
							const list = [];
							if (pResp && pResp.status === "fulfilled" && pResp.value.data.status === "success") list.push(...(pResp.value.data.data.producers || []).map((producer) => ({ ...producer, type: "producer", displayName: producer.shopInfo?.shopName || (producer.farmName && producer.farmName !== "À compléter" ? producer.farmName : null) || `${producer.firstName} ${producer.lastName !== "À compléter" ? producer.lastName : ""}`.trim(), profileUrl: `/producers/${producer._id}`, shopBanner: producer.shopBanner, logo: producer.shopLogo })));
							if (tResp && tResp.status === "fulfilled" && tResp.value.data.status === "success") list.push(...(tResp.value.data.data.transformers || []).map((transformer) => ({ ...transformer, type: "transformer", displayName: transformer.shopInfo?.shopName || ((transformer.companyName && transformer.companyName !== "À compléter") ? transformer.companyName : null) || `${transformer.firstName} ${transformer.lastName !== "À compléter" ? transformer.lastName : ""}`.trim(), profileUrl: `/transformers/${transformer._id}`, shopBanner: transformer.shopBanner, logo: transformer.shopLogo })));
							if (rResp && rResp.status === "fulfilled" && rResp.value.data.status === "success") list.push(...(rResp.value.data.data.restaurateurs || []).map((restaurateur) => ({ ...restaurateur, type: "restaurateur", displayName: restaurateur.shopInfo?.shopName || ((restaurateur.restaurantName && restaurateur.restaurantName !== "À compléter") ? restaurateur.restaurantName : null) || `${restaurateur.firstName} ${restaurateur.lastName !== "À compléter" ? restaurateur.lastName : ""}`.trim(), profileUrl: `/restaurateurs/${restaurateur._id}`, shopBanner: restaurateur.restaurantBanner || restaurateur.shopBanner, logo: restaurateur.shopLogo })));
							return list;
						};

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
							const { averageDisplay, reviewCount } = buildVendorRating(vendeur);

							return (
								<Link
									key={`${vendeur.type}-${vendeur._id}`}
									to={vendeur.profileUrl}
									className="bg-white border border-gray-200/90 rounded-2xl hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group overflow-hidden block"
								>
									<div>
										{/* Bannière en arrière-plan */}
										<div className="relative h-32 bg-gradient-to-r from-emerald-900 to-emerald-700 overflow-hidden">
											{vendeur.shopBanner ? (
												<img
													src={vendeur.shopBanner}
													alt={vendeur.displayName}
													className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
												/>
											) : (
												<div className="w-full h-full opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
											)}

											{/* Top Right Rating Badge */}
											<div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1 shadow-sm z-10">
												<FiStar className="w-3 h-3 text-yellow-400 fill-yellow-400" />
												<span>{averageDisplay}</span>
												{reviewCount > 0 && <span className="text-gray-300 font-normal">({reviewCount})</span>}
											</div>

											{/* Type Badge top left */}
											<div className="absolute top-2.5 left-2.5 bg-emerald-600/90 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm uppercase">
												{vendeur.type === 'producer' ? 'Producteur' : vendeur.type === 'transformer' ? 'Transformateur' : 'Restaurateur'}
											</div>
										</div>

										{/* Photo de profil (Overlapping Banner) */}
										<div className="px-4 -mt-7 flex items-end justify-between relative z-10">
											<div className="w-14 h-14 rounded-xl bg-white p-0.5 border border-gray-200/90 shadow-md overflow-hidden flex-shrink-0">
												{vendeur.logo || vendeur.avatar ? (
													<img
														src={vendeur.logo || vendeur.avatar}
														alt={vendeur.displayName}
														className="w-full h-full object-cover rounded-lg"
													/>
												) : (
													<div className="w-full h-full rounded-lg bg-emerald-50 text-[#1A5514] font-black flex items-center justify-center text-lg">
														{vendeur.displayName?.[0] || 'V'}
													</div>
												)}
											</div>
										</div>

										{/* Informations */}
										<div className="p-4 pt-3 space-y-1.5">
											<h3 className="text-base font-extrabold text-[#161D14] group-hover:text-[#1A5514] transition-colors truncate" title={vendeur.displayName}>
												{vendeur.displayName}
											</h3>

											<div className="flex items-center text-xs text-gray-500 font-medium truncate">
												<FiMapPin className="w-3.5 h-3.5 text-emerald-600 mr-1 flex-shrink-0" />
												<span className="truncate">
													{vendeur.city ? `${vendeur.city}, ` : ''}{getCountryName(vendeur.country)}
												</span>
											</div>
										</div>
									</div>

									{/* CTA Footer */}
									<div className="m-4 mt-0 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1A5514] group-hover:text-[#31BC2E] transition-colors">
										<span>Visiter la boutique</span>
										<FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
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
