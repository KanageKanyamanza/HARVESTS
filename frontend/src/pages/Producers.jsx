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

					</div>

				{producers.length > 0 ?
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{producers.map((producer) => (
							<Link
								key={producer._id}
								to={`/producers/${producer._id}`}
								className="bg-white border border-gray-200 rounded-sm hover:shadow-md transition-shadow overflow-hidden block group"
							>
								{/* Bannière en arrière-plan */}
								<div className="relative h-40 bg-gray-100">
									{producer.shopBanner ?
										<img
											src={producer.shopBanner}
											alt="Bannière de la boutique"
											className="w-full h-full object-cover"
										/>
									:	<div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
											<FiPackage className="w-12 h-12 text-gray-400" />
										</div>
									}

									{/* Photo de profil centrée qui déborde */}
									<div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
										<div className="w-16 h-16 rounded-full bg-white p-1 border border-gray-200 shadow-sm">
											<div className="w-full h-full rounded-full bg-gray-100 overflow-hidden">
												{producer.avatar ?
													<img
														src={producer.avatar}
														alt={`${producer.firstName} ${producer.lastName}`}
														className="w-full h-full object-cover"
													/>
												:	<div className="w-full h-full bg-primary-100 flex items-center justify-center">
														<span className="text-lg font-bold text-primary-700">
															{producer.firstName?.[0]}
															{producer.lastName?.[0]}
														</span>
													</div>
												}
											</div>
										</div>
									</div>
								</div>

								{/* Informations */}
								<div className="px-4 pt-10 pb-4 text-center">
									<h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
										{producer.shopInfo?.shopName ||
											((producer.farmName && producer.farmName !== "À compléter") ?
												producer.farmName
											:	null) ||
											`${producer.firstName} ${
												producer.lastName !== "À compléter" ?
													producer.lastName
												:	""
											}`.trim()}
									</h3>
									
									<div className="flex items-center justify-center text-sm text-gray-600 mb-2">
										<FiMapPin className="mr-1 h-3 w-3" />
										<span>{getCountryName(producer.country)}</span>
										{producer.address?.city && (
											<span className="ml-1">• {producer.address.city}</span>
										)}
									</div>

									<div className="flex items-center justify-center space-x-2 mb-4">
										<div className="flex items-center text-yellow-500">
											<span className="text-sm font-bold text-gray-800 mr-1">
												{producer.salesStats?.averageRating?.toFixed(1) || "0.0"}
											</span>
											<FiStar className="h-4 w-4 fill-current" />
										</div>
										{producer.isBio && (
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
						))}
					</div>
				:	<div className="text-center py-16 bg-white border border-gray-200 rounded-sm">
						<FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
						<h3 className="text-xl font-bold text-gray-900 mb-2">
							Aucun producteur disponible
						</h3>
						<p className="text-gray-500 max-w-md mx-auto">
							Il n'y a actuellement aucun producteur correspondant à vos critères.
						</p>
					</div>
				}
			</div>
		</div>
	);
};

export default Producers;
