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
	FiShoppingCart,
} from "react-icons/fi";

const TransformerProfile = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [transformer, setTransformer] = useState(null);
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("products");

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

				// Charger les produits du transformateur
				try {
					const productsResponse = await transformerService.getPublicProducts(id);
					if (productsResponse.data.status === 'success') {
						setProducts(productsResponse.data.data.products || []);
					}
				} catch (error) {
					console.error('Erreur lors du chargement des produits:', error);
					setProducts([]);
				}
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
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
							<button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
								<FiStar className="mr-2" />
								Favoris
							</button>
						</div>
					</div>
				</div>

				{/* Contenu principal */}
				<div className="flex flex-col lg:flex-row gap-6">
					{/* Contenu principal */}
					<div className="lg:col-span-2 md:w-[75%]">
						{/* Onglets */}
						<div className="bg-white rounded-lg shadow-sm mb-6">
							<div className="border-b border-gray-200">
								<nav className="flex space-x-8 px-6">
									<button
										onClick={() => setActiveTab("products")}
										className={`py-4 px-1 border-b-2 font-medium text-sm ${
											activeTab === "products"
												? "border-purple-500 text-purple-600"
												: "border-transparent text-gray-500 hover:text-gray-700"
										}`}
									>
										Produits
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

							<div className="p-4">
								{activeTab === "products" && (
									<div>
										<h3 className="text-lg font-medium text-gray-900 mb-4">
											Produits disponibles
										</h3>
										{products.length > 0 ? (
											<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
												{products.map((product) => (
													<div 
														key={product._id} 
														className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
														onClick={() => navigate(`/products/${product._id}`)}
													>
														{/* Image du produit */}
														<div className="h-48 bg-gray-200 relative">
															{product.images && product.images.length > 0 ? (
																<img 
																	src={product.images[0].url}
																	alt={typeof product.name === 'object' ? product.name.fr : product.name || 'Produit'}
																	className="w-full h-full object-cover"
																/>
															) : (
																<div className="w-full h-full bg-gray-100 flex items-center justify-center">
																	<FiPackage className="w-12 h-12 text-gray-400" />
																</div>
															)}
														</div>

														{/* Informations du produit */}
														<div className="p-4">
															<div className="flex items-center justify-between mb-2">
																<h3 className="font-semibold text-gray-900">
																	{typeof product.name === 'object' ? product.name.fr : product.name || 'Produit sans nom'}
																</h3>
																<span className={`px-2 whitespace-nowrap py-1 rounded-full text-xs font-medium ${
																	(product.inventory?.quantity || product.stock || 0) > 0 
																		? 'bg-green-100 text-green-800' 
																		: 'bg-red-100 text-red-800'
																}`}>
																	{(product.inventory?.quantity || product.stock || 0) > 0 ? 'En stock' : 'Rupture'}
																</span>
															</div>
															<p className="text-gray-600 text-sm mb-3 line-clamp-2">
																{typeof product.description === 'object' ? product.description.fr : product.description || 'Aucune description'}
															</p>
															<div className="flex items-center justify-between">
																<span className="text-lg font-bold text-green-600">
																	{product.price?.toLocaleString()} {product.currency}
																</span>
																<span className="text-sm text-gray-500">
																	{product.inventory?.quantity || product.stock || 0} en stock
																</span>
															</div>
															<button 
																className="w-full mt-3 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
																onClick={(e) => {
																	e.stopPropagation(); // Empêcher la navigation vers les détails
																	console.log('Produit ajouté au panier:', typeof product.name === 'object' ? product.name.fr : product.name);
																}}
															>
																<FiShoppingCart className="w-4 h-4 mr-2" />
																Ajouter au panier
															</button>
														</div>
													</div>
												))}
											</div>
										) : (
											<div className="text-center py-12">
												<FiPackage className="mx-auto h-12 w-12 text-gray-400" />
												<h3 className="mt-2 text-sm font-medium text-gray-900">Aucun produit disponible</h3>
												<p className="mt-1 text-sm text-gray-500">
													Ce transformateur n'a pas encore ajouté de produits à sa boutique.
												</p>
											</div>
										)}
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
					<div className="space-y-4 md:w-[25%]">
						{/* Horaires d'ouverture */}
						{transformer.shopInfo?.openingHours && (
							<div className="bg-white rounded-lg shadow-sm p-4">
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
