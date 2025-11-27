import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
	exporterService,
	transporterService,
} from "../services";
import {
	FiMapPin,
	FiStar,
	FiTruck,
	FiArrowRight,
	FiGlobe,
	FiPackage,
} from "react-icons/fi";
import { getCountryName } from "../utils/countryMapper";
import LoadingSpinner from "../components/common/LoadingSpinner";

const TransporteursExportateurs = () => {
	const [logistics, setLogistics] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("all"); // 'all', 'exporters', 'transporters'
	const [locationInfo, setLocationInfo] = useState(null);

	useEffect(() => {
		const loadLogistics = async () => {
			try {
				setLoading(true);

				const [exportersResponse, transportersResponse] =
					await Promise.allSettled([
						exporterService.getAllPublic({ limit: 50 }),
						transporterService.getAllPublic({ limit: 50, useLocation: 'true' }),
					]);
				
				// Stocker les informations de localisation des transporteurs
				if (
					transportersResponse.status === "fulfilled" &&
					transportersResponse.value.data.status === "success" &&
					transportersResponse.value.data.data.location
				) {
					setLocationInfo(transportersResponse.value.data.data.location);
				}

				const allLogistics = [];

				// Ajouter les exportateurs
				if (
					exportersResponse.status === "fulfilled" &&
					exportersResponse.value.data.status === "success"
				) {
					const exporters =
						exportersResponse.value.data.data.exporters || [];
					
					allLogistics.push(
						...exporters.map((exporter) => ({
							...exporter,
							type: "exporter",
							displayName: exporter.companyName || "Exportateur",
							profileUrl: `/exporters/${exporter._id}`,
							shopBanner: exporter.shopBanner,
							logo: exporter.shopLogo,
						}))
					);
				}

				// Ajouter les transporteurs
				if (
					transportersResponse.status === "fulfilled" &&
					transportersResponse.value.data.status === "success"
				) {
					const transporters =
						transportersResponse.value.data.data.transporters || [];
					
					allLogistics.push(
						...transporters.map((transporter) => ({
							...transporter,
							type: "transporter",
							displayName: transporter.companyName || "Transporteur",
							profileUrl: `/transporters/${transporter._id}`,
							shopBanner: transporter.shopBanner,
							logo: transporter.shopLogo,
						}))
					);
				}

				setLogistics(allLogistics);
			} catch (error) {
				console.error("Erreur lors du chargement des transporteurs et exportateurs:", error);
			} finally {
				setLoading(false);
			}
		};

		loadLogistics();
	}, []);


	const getTypeBadge = (type) => {
		switch (type) {
			case "exporter":
				return {
					label: "Exportateur",
					icon: FiGlobe,
					color: "bg-blue-100 text-blue-800",
					iconColor: "text-blue-600",
				};
			case "transporter":
				return {
					label: "Transporteur",
					icon: FiTruck,
					color: "bg-indigo-100 text-indigo-800",
					iconColor: "text-indigo-600",
				};
			default:
				return {
					label: "Logistique",
					icon: FiTruck,
					color: "bg-gray-100 text-gray-800",
					iconColor: "text-gray-600",
				};
		}
	};

	const getGradientColors = (type) => {
		switch (type) {
			case "exporter":
				return "from-blue-400 to-blue-600";
			case "transporter":
				return "from-indigo-400 to-indigo-600";
			default:
				return "from-gray-400 to-gray-600";
		}
	};

	const filteredLogistics = logistics.filter((item) => {
		if (filter === "all") return true;
		return item.type === filter;
	});

	if (loading) {
		return (
			<div className="min-h-screen bg-harvests-light flex items-center justify-center">
				<LoadingSpinner size="lg" text="Chargement des transporteurs et exportateurs..." />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-harvests-light">
			<div className="container mx-auto px-4 py-8">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						Transporteurs & Exportateurs
					</h1>
					<p className="text-xl text-gray-600">
						Découvrez nos partenaires logistiques pour vos besoins de transport et d'export
					</p>
					
					{/* Message discret si pas de transporteurs dans la zone */}
					{locationInfo?.detected && locationInfo?.noTransportersInZone && (
						<div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
							<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span>
								Aucun service de transport disponible dans votre zone. Affichage de tous les services.
							</span>
						</div>
					)}
				</div>

				{/* Filtres */}
				<div className="flex justify-center mb-8">
					<div className="bg-white rounded-lg shadow-sm p-1 flex">
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
							onClick={() => setFilter("exporter")}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								filter === "exporter"
									? "bg-blue-600 text-white"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							Exportateurs
						</button>
						<button
							onClick={() => setFilter("transporter")}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								filter === "transporter"
									? "bg-indigo-600 text-white"
									: "text-gray-600 hover:text-gray-900"
							}`}
						>
							Transporteurs
						</button>
					</div>
				</div>

				{filteredLogistics.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
						{filteredLogistics.map((item) => {
							const typeBadge = getTypeBadge(item.type);
							const BadgeIcon = typeBadge.icon;

							return (
								<Link
									key={`${item.type}-${item._id}`}
									to={item.profileUrl}
									className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden block group"
								>
									{/* Bannière en arrière-plan */}
									<div
										className={`relative h-[175px] bg-gradient-to-r ${getGradientColors(
											item.type
										)}`}
									>
										{item.shopBanner ? (
											<img
												src={item.shopBanner}
												alt="Bannière"
												className="w-full h-full object-cover"
												onError={(e) => {
													e.target.style.display = "none";
													if (e.target.nextSibling) {
														e.target.nextSibling.style.display = "flex";
													}
												}}
											/>
										) : (
											<div
												className={`w-full h-full bg-gradient-to-r ${getGradientColors(
													item.type
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
													{item.logo ? (
														<img
															src={item.logo}
															alt={`${item.displayName}`}
															className="w-full h-full object-cover"
															onError={(e) => {
																e.target.style.display = "none";
																if (e.target.nextSibling) {
																	e.target.nextSibling.style.display = "flex";
																}
															}}
														/>
													) : (
														<div className="w-full h-full bg-indigo-100 flex items-center justify-center">
															<span className="text-sm font-bold text-indigo-600">
																{item.displayName?.[0] ||
																	item.firstName?.[0]}
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
											{item.displayName}
										</h3>
										<div className="flex items-center text-gray-500 text-sm mb-3">
											<FiMapPin className="mr-1" />
											<span>{getCountryName(item.country)}</span>
											{item.city && (
												<span className="ml-2">• {item.city}</span>
											)}
											{item.region && (
												<span className="ml-2">• {item.region}</span>
											)}
										</div>

										{/* Statistiques */}
										<div className="flex items-center justify-between text-sm">
											{item.type === "exporter" ? (
												<div className="flex items-center text-blue-600">
													<FiGlobe className="mr-1" />
													<span>Export International</span>
												</div>
											) : (
												<div className="flex items-center text-indigo-600">
													<FiTruck className="mr-1" />
													<span>Livraison Locale</span>
												</div>
											)}
											<div className="flex items-center text-gray-500">
												<FiPackage className="mr-1" />
												<span className="mr-1">
													{item.type === "exporter" ? "Flotte" : "Véhicules"}
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
						<FiTruck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Aucun transporteur ou exportateur disponible
						</h3>
						<p className="text-gray-500">
							Revenez plus tard pour découvrir nos partenaires logistiques.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default TransporteursExportateurs;

