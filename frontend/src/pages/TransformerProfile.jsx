import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { transformerService } from "../services";
import {
	FiMapPin,
	FiStar,
	FiTool,
	FiUsers,
	FiCalendar,
	FiAward,
	FiArrowLeft,
	FiClock,
	FiMail,
	FiPhone,
	FiGlobe,
	FiFacebook,
	FiInstagram,
	FiTwitter,
	FiMessageCircle,
	FiPackage,
	FiShield,
} from "react-icons/fi";

const TransformerProfile = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [transformer, setTransformer] = useState(null);
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("services");

	useEffect(() => {
		const loadTransformerData = async () => {
			try {
				setLoading(true);

				// Charger les informations du transformateur
				const transformerResponse =
					await transformerService.getPublicTransformer(id);
				if (transformerResponse.data.status === "success") {
					setTransformer(transformerResponse.data.data.transformer);
				}

				// Charger les services (pour l'instant, on simule)
				setServices([
					{
						_id: "service-1",
						name: "Transformation de fruits",
						description:
							"Transformation de fruits frais en jus, confitures et conserves",
						price: 5000,
						unit: "kg",
						processingTime: "2-3 jours",
						category: "processing",
					},
					{
						_id: "service-2",
						name: "Emballage sous vide",
						description: "Emballage sous vide pour conservation longue durée",
						price: 2000,
						unit: "unité",
						processingTime: "1 jour",
						category: "packaging",
					},
					{
						_id: "service-3",
						name: "Séchage solaire",
						description: "Séchage naturel au soleil pour fruits et légumes",
						price: 3000,
						unit: "kg",
						processingTime: "3-5 jours",
						category: "preservation",
					},
				]);
			} catch (error) {
				console.error("Erreur lors du chargement du transformateur:", error);
			} finally {
				setLoading(false);
			}
		};

		loadTransformerData();
	}, [id]);

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

	const getTransformationTypeLabel = (type) => {
		const types = {
			processing: "Transformation",
			packaging: "Emballage",
			preservation: "Conservation",
			manufacturing: "Fabrication",
			mixed: "Mixte",
		};
		return types[type] || type;
	};

	const getDayLabel = (day) => {
		const days = {
			monday: "Lundi",
			tuesday: "Mardi",
			wednesday: "Mercredi",
			thursday: "Jeudi",
			friday: "Vendredi",
			saturday: "Samedi",
			sunday: "Dimanche",
		};
		return days[day] || day;
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Chargement du transformateur...</p>
				</div>
			</div>
		);
	}

	if (!transformer) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<FiTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						Transformateur non trouvé
					</h3>
					<p className="text-gray-500 mb-4">
						Ce transformateur n'existe pas ou n'est plus disponible.
					</p>
					<button
						onClick={() => navigate(-1)}
						className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
					>
						Retour
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-8">
				{/* Bouton retour */}
				<button
					onClick={() => navigate(-1)}
					className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
				>
					<FiArrowLeft className="mr-2" />
					Retour
				</button>

				{/* En-tête avec bannière */}
				<div className="relative bg-white rounded-lg shadow-sm overflow-hidden mb-6">
					{/* Bannière */}
					<div className="relative sm:h-[300px] h-[200px] md:h-[375px] bg-gradient-to-r from-purple-400 to-purple-600">
						{transformer.shopInfo?.shopBanner ? (
							<img
								src={transformer.shopInfo.shopBanner}
								alt="Bannière de la boutique"
								className="w-full h-full object-cover"
								onError={(e) => {
									e.target.style.display = "none";
									e.target.nextSibling.style.display = "flex";
								}}
							/>
						) : null}
						<div
							className="w-full h-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center"
							style={{
								display: transformer.shopInfo?.shopBanner ? "none" : "flex",
							}}
						>
							<FiTool className="w-20 h-20 text-white opacity-50" />
						</div>
						<div className="absolute inset-0 bg-black bg-opacity-30"></div>
						{/* Logo */}
						<div className="absolute bottom-5 left-5 transform -translate-x-2 translate-y-2">
							<div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg">
								<div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
									{transformer.shopInfo?.shopLogo ? (
										<img
											src={transformer.shopInfo.shopLogo}
											alt={`${transformer.companyName}`}
											className="w-full h-full object-cover"
											onError={(e) => {
												e.target.style.display = "none";
												e.target.nextSibling.style.display = "flex";
											}}
										/>
									) : null}
									<div
										className="w-full h-full bg-purple-100 flex items-center justify-center"
										style={{
											display: transformer.shopInfo?.shopLogo ? "none" : "flex",
										}}
									>
										<span className="text-2xl font-bold text-purple-600">
											{transformer.companyName?.[0] ||
												transformer.firstName?.[0]}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="relative px-6 pt-6 pb-2 ">
						{/* Informations principales */}
						<div className="flex-1 mb-2">
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								{transformer.shopInfo?.shopName ||
									transformer.companyName ||
									`${transformer.firstName} ${transformer.lastName}`}
							</h1>
							<p className="text-lg text-gray-600 mb-2">
								{transformer.firstName} {transformer.lastName}
							</p>
							<div className="flex items-center text-gray-500 mb-2">
								<FiMapPin className="mr-1" />
								<span>{getCountryName(transformer.country)}</span>
								{transformer.address?.city && (
									<span className="ml-2">• {transformer.address.city}</span>
								)}
							</div>
							<div className="flex items-center text-purple-600">
								<FiTool className="mr-1" />
								<span>
									{getTransformationTypeLabel(transformer.transformationType)}
								</span>
							</div>
						</div>

						{/* Description */}
						{transformer.shopInfo?.shopDescription && (
							<p className="text-gray-700 mb-4">
								{transformer.shopInfo.shopDescription}
							</p>
						)}

						{/* Statistiques */}
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
							<div className="text-center bg-gray-100 rounded-lg p-4">
								<div className="text-2xl font-bold text-gray-900">
									{transformer.businessStats?.totalOrders || 0}
								</div>
								<div className="text-sm text-gray-600">Commandes</div>
							</div>
							<div className="text-center bg-gray-100 rounded-lg p-4">
								<div className="text-2xl font-bold text-gray-900">
									{transformer.businessStats?.averageRating?.toFixed(1) ||
										"0.0"}
								</div>
								<div className="text-sm text-gray-600">Note moyenne</div>
							</div>
							<div className="text-center bg-gray-100 rounded-lg p-4">
								<div className="text-2xl font-bold text-gray-900">
									{transformer.businessStats?.totalReviews || 0}
								</div>
								<div className="text-sm text-gray-600">Avis</div>
							</div>
							<div className="text-center bg-gray-100 rounded-lg p-4">
								<div className="text-2xl font-bold text-gray-900">
									{transformer.certifications?.length || 0}
								</div>
								<div className="text-sm text-gray-600">Certifications</div>
							</div>
						</div>

						{/* Actions */}
						<div className="flex space-x-4">
							<button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
								<FiMessageCircle className="mr-2" />
								Contacter
							</button>
							<button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
								<FiStar className="mr-2" />
								Favoris
							</button>
						</div>
					</div>
				</div>

				{/* Contenu principal */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Contenu principal */}
					<div className="lg:col-span-2">
						{/* Onglets */}
						<div className="bg-white rounded-lg shadow-sm mb-6">
							<div className="border-b border-gray-200">
								<nav className="flex space-x-8 px-6">
									<button
										onClick={() => setActiveTab("services")}
										className={`py-4 px-1 border-b-2 font-medium text-sm ${
											activeTab === "services"
												? "border-purple-500 text-purple-600"
												: "border-transparent text-gray-500 hover:text-gray-700"
										}`}
									>
										Services
									</button>
									<button
										onClick={() => setActiveTab("about")}
										className={`py-4 px-1 border-b-2 font-medium text-sm ${
											activeTab === "about"
												? "border-purple-500 text-purple-600"
												: "border-transparent text-gray-500 hover:text-gray-700"
										}`}
									>
										À propos
									</button>
									<button
										onClick={() => setActiveTab("reviews")}
										className={`py-4 px-1 border-b-2 font-medium text-sm ${
											activeTab === "reviews"
												? "border-purple-500 text-purple-600"
												: "border-transparent text-gray-500 hover:text-gray-700"
										}`}
									>
										Avis
									</button>
								</nav>
							</div>

							<div className="p-6">
								{activeTab === "services" && (
									<div>
										<h3 className="text-lg font-medium text-gray-900 mb-4">
											Services de transformation
										</h3>
										<div className="space-y-4">
											{services.map((service) => (
												<div
													key={service._id}
													className="border border-gray-200 rounded-lg p-4"
												>
													<div className="flex justify-between items-start">
														<div className="flex-1">
															<h4 className="font-medium text-gray-900 mb-2">
																{service.name}
															</h4>
															<p className="text-gray-600 mb-2">
																{service.description}
															</p>
															<div className="flex items-center text-sm text-gray-500">
																<FiClock className="mr-1" />
																<span>{service.processingTime}</span>
															</div>
														</div>
														<div className="text-right">
															<div className="text-lg font-bold text-gray-900">
																{service.price.toLocaleString()} FCFA
															</div>
															<div className="text-sm text-gray-500">
																par {service.unit}
															</div>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{activeTab === "about" && (
									<div>
										<h3 className="text-lg font-medium text-gray-900 mb-4">
											À propos
										</h3>
										<div className="space-y-6">
											{/* Capacités de transformation */}
											{transformer.processingCapabilities &&
												transformer.processingCapabilities.length > 0 && (
													<div>
														<h4 className="font-medium text-gray-900 mb-2">
															Capacités de transformation
														</h4>
														<div className="space-y-2">
															{transformer.processingCapabilities.map(
																(capability, index) => (
																	<div key={index} className="text-gray-600">
																		<span className="font-medium">
																			{capability.inputProduct}
																		</span>{" "}
																		→ {capability.outputProducts?.join(", ")}
																	</div>
																)
															)}
														</div>
													</div>
												)}

											{/* Certifications */}
											{transformer.certifications &&
												transformer.certifications.length > 0 && (
													<div>
														<h4 className="font-medium text-gray-900 mb-2">
															Certifications
														</h4>
														<div className="space-y-2">
															{transformer.certifications.map((cert, index) => (
																<div
																	key={index}
																	className="flex items-center text-gray-600"
																>
																	<FiAward className="mr-2 text-yellow-500" />
																	<span>{cert.name}</span>
																	{cert.validUntil && (
																		<span className="ml-2 text-sm text-gray-500">
																			(Valide jusqu'au{" "}
																			{new Date(
																				cert.validUntil
																			).toLocaleDateString("fr-FR")}
																			)
																		</span>
																	)}
																</div>
															))}
														</div>
													</div>
												)}

											{/* Équipements */}
											{transformer.equipment &&
												transformer.equipment.length > 0 && (
													<div>
														<h4 className="font-medium text-gray-900 mb-2">
															Équipements
														</h4>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
															{transformer.equipment.map((equipment, index) => (
																<div
																	key={index}
																	className="flex items-center text-gray-600"
																>
																	<FiTool className="mr-2 text-purple-500" />
																	<span>
																		{equipment.name || equipment.type}
																	</span>
																</div>
															))}
														</div>
													</div>
												)}
										</div>
									</div>
								)}

								{activeTab === "reviews" && (
									<div>
										<h3 className="text-lg font-medium text-gray-900 mb-4">
											Avis clients
										</h3>
										<div className="text-center py-8">
											<FiStar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
											<p className="text-gray-500">Aucun avis pour le moment</p>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Horaires d'ouverture */}
						{transformer.shopInfo?.openingHours && (
							<div className="bg-white rounded-lg shadow-sm p-6">
								<h3 className="text-lg font-medium text-gray-900 mb-4">
									Horaires d'ouverture
								</h3>
								<div className="space-y-2">
									{Object.entries(transformer.shopInfo.openingHours).map(
										([day, hours]) => (
											<div
												key={day}
												className="flex justify-between items-center"
											>
												<span className="text-gray-600">
													{getDayLabel(day)}
												</span>
												<span className="text-gray-900">
													{hours.isOpen
														? `${hours.open} - ${hours.close}`
														: "Fermé"}
												</span>
											</div>
										)
									)}
								</div>
							</div>
						)}

						{/* Contact */}
						<div className="bg-white rounded-lg shadow-sm p-6">
							<h3 className="text-lg font-medium text-gray-900 mb-4">
								Contact
							</h3>
							<div className="space-y-3">
								{transformer.shopInfo?.contactInfo?.phone && (
									<div className="flex items-center text-gray-600">
										<FiPhone className="mr-3" />
										<span>{transformer.shopInfo.contactInfo.phone}</span>
									</div>
								)}
								{transformer.shopInfo?.contactInfo?.email && (
									<div className="flex items-center text-gray-600">
										<FiMail className="mr-3" />
										<span>{transformer.shopInfo.contactInfo.email}</span>
									</div>
								)}
								{transformer.shopInfo?.contactInfo?.website && (
									<div className="flex items-center text-gray-600">
										<FiGlobe className="mr-3" />
										<a
											href={transformer.shopInfo.contactInfo.website}
											className="text-purple-600 hover:underline"
										>
											Site web
										</a>
									</div>
								)}
							</div>

							{/* Réseaux sociaux */}
							{transformer.shopInfo?.contactInfo?.socialMedia && (
								<div className="mt-4 pt-4 border-t border-gray-200">
									<h4 className="text-sm font-medium text-gray-900 mb-3">
										Réseaux sociaux
									</h4>
									<div className="flex space-x-3">
										{transformer.shopInfo.contactInfo.socialMedia.facebook && (
											<a
												href={
													transformer.shopInfo.contactInfo.socialMedia.facebook
												}
												className="text-blue-600 hover:text-blue-800"
											>
												<FiFacebook className="w-5 h-5" />
											</a>
										)}
										{transformer.shopInfo.contactInfo.socialMedia.instagram && (
											<a
												href={
													transformer.shopInfo.contactInfo.socialMedia.instagram
												}
												className="text-pink-600 hover:text-pink-800"
											>
												<FiInstagram className="w-5 h-5" />
											</a>
										)}
										{transformer.shopInfo.contactInfo.socialMedia.twitter && (
											<a
												href={
													transformer.shopInfo.contactInfo.socialMedia.twitter
												}
												className="text-blue-400 hover:text-blue-600"
											>
												<FiTwitter className="w-5 h-5" />
											</a>
										)}
									</div>
								</div>
							)}
						</div>

						{/* Certifications */}
						{transformer.certifications &&
							transformer.certifications.length > 0 && (
								<div className="bg-white rounded-lg shadow-sm p-6">
									<h3 className="text-lg font-medium text-gray-900 mb-4">
										Certifications
									</h3>
									<div className="space-y-3">
										{transformer.certifications.map((cert, index) => (
											<div key={index} className="flex items-center">
												<FiShield className="mr-3 text-green-500" />
												<div>
													<div className="font-medium text-gray-900">
														{cert.name}
													</div>
													<div className="text-sm text-gray-500">
														{cert.issuedBy}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TransformerProfile;
