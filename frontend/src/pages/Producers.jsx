import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { producerService } from "../services";
import { FiMapPin, FiStar, FiPackage, FiArrowRight, FiChevronDown, FiX } from "react-icons/fi";
import { Leaf } from "lucide-react";
import { getCountryName } from "../utils/countryMapper";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useApiCache } from "../hooks/useApiCache";

const Producers = () => {
	const [producers, setProducers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [locationInfo, setLocationInfo] = useState(null);
	const [searchParams, setSearchParams] = useSearchParams();
	const selectedCountry = searchParams.get("country") || "";
	
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
		const loadProducers = async (forceRefresh = false) => {
			try {
				const cacheKey = `producers_list_${selectedCountry}`;

				// Vérifier le cache
				if (!forceRefresh) {
					const cached = getCachedData(cacheKey);
					if (cached) {
						setProducers(cached.producers || []);
						setLocationInfo(cached.locationInfo || null);
						setLoading(false);
						return;
					}
				}

				setLoading(true);
				
				const queryParams = {
					limit: 20,
					useLocation: selectedCountry ? "false" : "true",
				};

				if (selectedCountry) {
					queryParams.country = selectedCountry;
				}

				const response = await producerService.getAllPublic(queryParams);
				if (response.data.status === "success") {
					const producersData = response.data.data.producers || [];
					const locationData = response.data.data.location || null;

					setProducers(producersData);
					setLocationInfo(locationData);

					// Mettre en cache
					setCachedData(cacheKey, {
						producers: producersData,
						locationInfo: locationData,
					});
				}
			} catch (error) {
				console.error("Erreur lors du chargement des producteurs:", error);
			} finally {
				setLoading(false);
			}
		};

		loadProducers();
	}, [getCachedData, setCachedData, selectedCountry]);

	if (loading) {
		return (
			<div className="min-h-screen bg-harvests-light flex items-center justify-center">
				<LoadingSpinner size="lg" text="Chargement des producteurs..." />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-harvests-light">
			<div className="container mx-auto px-4 py-8">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						Nos Producteurs
					</h1>
					<p className="text-xl text-gray-600 mb-8">
						Découvrez les producteurs locaux qui cultivent des produits frais et
						de qualité
					</p>

					{/* Filtre de pays */}
					<div className="flex justify-center mb-10">
						<div className="relative inline-flex items-center">
							<div className="relative">
								<FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-5 w-5 pointer-events-none" />
								<select
									value={selectedCountry}
									onChange={(e) => handleCountryChange(e.target.value)}
									className="pl-10 pr-10 py-3 bg-white border-2 border-green-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 appearance-none text-gray-700 font-bold shadow-sm transition-all cursor-pointer min-w-[240px]"
								>
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
								<FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
							</div>
							
							{selectedCountry && (
								<button
									onClick={() => handleCountryChange("")}
									className="ml-3 p-3 text-gray-400 hover:text-red-500 bg-white border-2 border-gray-100 rounded-2xl transition-colors shadow-sm"
									title="Effacer le filtre"
								>
									<FiX className="h-5 w-5" />
								</button>
							)}
						</div>
					</div>

					{/* Message discret si pas de producteurs dans la zone */}
					{!selectedCountry && locationInfo?.detected && locationInfo?.noProducersInZone && (
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
								Aucun producteur disponible dans votre zone. Affichage de tous
								les producteurs.
							</span>
						</div>
					)}
				</div>

				{producers.length > 0 ?
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
						{producers.map((producer) => (
							<Link
								key={producer._id}
								to={`/producers/${producer._id}`}
								className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden block group"
							>
								{/* Bannière en arrière-plan */}
								<div className="relative h-[175px] bg-gradient-to-r from-green-400 to-green-600">
									{producer.shopBanner ?
										<img
											src={producer.shopBanner}
											alt="Bannière de la boutique"
											className="w-full h-full object-cover"
										/>
									:	<div className=" w-full h-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
											<FiPackage className="w-12 h-12 text-white opacity-50" />
										</div>
									}

									{/* Overlay pour améliorer la lisibilité */}
									<div className="absolute inset-0 bg-black bg-opacity-20"></div>

									{/* Photo de profil en coin inférieur gauche */}
									<div className="absolute  bottom-5 left-5 transform -translate-x-2 translate-y-2">
										<div className="w-16 h-16 rounded-full bg-white p-1 shadow-lg">
											<div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
												{producer.avatar ?
													<img
														src={producer.avatar}
														alt={`${producer.firstName} ${producer.lastName}`}
														className="w-full h-full object-cover"
													/>
												:	<div className="w-full h-full bg-green-100 flex items-center justify-center">
														<span className="text-sm font-bold text-green-600">
															{producer.firstName?.[0]}
															{producer.lastName?.[0]}
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
										<span className="truncate">
											{producer.shopInfo?.shopName ||
												((
													producer.farmName && producer.farmName !== "À compléter"
												) ?
													producer.farmName
												:	null) ||
												`${producer.firstName} ${
													producer.lastName !== "À compléter" ?
														producer.lastName
													:	""
												}`.trim()}
										</span>
										{producer.isBio && (
											<span
												className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"
												title="Producteur Bio Certifié"
											>
												<Leaf className="w-2.5 h-2.5 mr-1" />
												BIO
											</span>
										)}
									</h3>
									<p className="text-sm text-gray-600 mb-2">
										{producer.firstName}{" "}
										{producer.lastName !== "À compléter" ?
											producer.lastName
										:	""}
									</p>
									<div className="flex items-center text-gray-500 text-sm mb-3">
										<FiMapPin className="mr-1" />
										<span>{getCountryName(producer.country)}</span>
										{producer.address?.city && (
											<span className="ml-2">• {producer.address.city}</span>
										)}
									</div>

									{/* Statistiques */}
									<div className="flex items-center justify-between text-sm">
										<div className="flex items-center text-yellow-600">
											<FiStar className="mr-1" />
											<span>
												{producer.salesStats?.averageRating?.toFixed(1) ||
													"0.0"}
											</span>
										</div>
										<div className="flex items-center text-gray-500">
											<FiPackage className="mr-1" />
											<span className="mr-1">Produits</span>
											<FiArrowRight className="text-gray-400 group-hover:text-gray-600 transition-colors" />
										</div>
									</div>
								</div>
							</Link>
						))}
					</div>
				:	<div className="text-center py-12">
						<FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Aucun producteur disponible
						</h3>
						<p className="text-gray-500">
							Revenez plus tard pour découvrir nos producteurs.
						</p>
					</div>
				}
			</div>
		</div>
	);
};

export default Producers;
