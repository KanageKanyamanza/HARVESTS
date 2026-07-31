import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../contexts/CartContext";
import { useChat } from "../../contexts/ChatContext";
import {
	FiMapPin,
	FiStar,
	FiPackage,
	FiUsers,
	FiCalendar,
	FiArrowLeft,
	FiShoppingCart,
	FiClock,
	FiPhone,
	FiMail,
	FiMessageCircle,
	FiCheckCircle,
	FiShield,
} from "react-icons/fi";
import { Leaf, Award, Sparkles, Store } from "lucide-react";
import { reviewService } from "../../services";
import { getCountryName } from "../../utils/countryMapper";
import LoadingSpinner from "./LoadingSpinner";

const VendorProfile = ({
	vendorType,
	service,
	getVendorName,
	getVendorSubtitle,
	getVendorStats,
	getVendorTags,
	formatPrice,
	getItemName,
	getItemDescription,
	getItemPrice,
	getItemImage,
	getItemExtraInfo,
	getItemButtonText,
	getItemButtonIcon,
	getItemButtonColor,
	getEmptyStateIcon,
	getEmptyStateTitle,
	getEmptyStateDescription,
	tabs = ["items"],
	getTabContent,
	getTabLabel,
	getTabCount,
}) => {
	const { id } = useParams();
	const { user } = useAuth();
	const { addToCart } = useCart();
	const { startConversation } = useChat();
	const navigate = useNavigate();
	const [vendor, setVendor] = useState(null);
	const [items, setItems] = useState([]);
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState(tabs[0]);

	const handleContact = async () => {
		if (!vendor?._id) return;

		if (!user) {
			navigate("/login", { state: { from: window.location.pathname } });
			return;
		}

		// La messagerie repose sur le modèle User ; les comptes Admin (modèle et
		// authentification distincts) ne peuvent pas y participer. Sans ce garde-fou,
		// la tentative échoue en 401 et finit par déconnecter l'admin.
		if (user.role === "admin" || user.userType === "admin") {
			window.alert(
				"Les comptes administrateur ne peuvent pas utiliser la messagerie client. Contactez le vendeur depuis un compte standard."
			);
			return;
		}

		const conversation = await startConversation(vendor._id);
		const userType = user?.userType || "consumer";
		navigate(`/${userType}/messages${conversation ? `/${conversation._id}` : ""}`);
	};

	useEffect(() => {
		const loadVendorData = async () => {
			try {
				setLoading(true);
				let vendorResponse = null;
				let itemsResponse = null;

				try {
					vendorResponse = await service.getPublic(id);

					if (vendorResponse?.data?.status === "success") {
						const vendorData =
							vendorResponse.data.data[vendorType] ||
							vendorResponse.data[vendorType];

						setVendor(vendorData);

						if (vendorType === "transporter" || vendorType === "exporter") {
							const fleetData = vendorData?.fleet;
							setItems(Array.isArray(fleetData) ? fleetData : []);
						}
					}
				} catch (error) {
					console.error(`Erreur chargement ${vendorType}:`, error);
				}

				try {
					if (vendorType !== "transporter" && vendorType !== "exporter") {
						itemsResponse = await service.getPublicProducts(id);

						if (itemsResponse?.data?.status === "success") {
							const rawItems =
								itemsResponse.data.data.products ||
								itemsResponse.data.data.dishes ||
								[];
							const itemsWithRatings = await Promise.all(
								rawItems.map(async (item) => {
									if (!item?._id) return item;

									const currentVendor =
										vendorResponse?.data?.data?.[vendorType] ||
										vendorResponse?.data?.[vendorType];
									if (
										vendorType === "restaurateur" &&
										currentVendor &&
										!item.restaurateur
									) {
										item.restaurateur = {
											_id: currentVendor._id,
											id: currentVendor._id,
											restaurantName:
												currentVendor.restaurantName || currentVendor.name,
											name: currentVendor.restaurantName || currentVendor.name,
										};
										item.restaurateurId = currentVendor._id;
										item.restaurantName =
											currentVendor.restaurantName || currentVendor.name;
									}

									try {
										const statsResponse =
											await reviewService.getProductRatingStats(item._id);
										const statsData = statsResponse?.data;
										if (statsData) {
											return {
												...item,
												ratingStats: {
													averageRating: statsData.averageRating || 0,
													totalReviews: statsData.totalReviews || 0,
												},
											};
										}
									} catch (statsError) {
										console.error(`Erreur stats produit ${item._id}:`, statsError);
									}

									return {
										...item,
										ratingStats: { averageRating: 0, totalReviews: 0 },
									};
								}),
							);

							setItems(itemsWithRatings);
						}
					}
				} catch (error) {
					console.error(`Erreur chargement items:`, error);
				}

				try {
					if (service && service.getReviews) {
						try {
							const reviewsResponse = await service.getReviews(id);
							if (reviewsResponse?.data?.status === "success") {
								setReviews(
									reviewsResponse.data.data?.reviews ||
										reviewsResponse.data.data ||
										[],
								);
							}
						} catch (reviewError) {
							setReviews([]);
						}
					} else {
						setReviews([]);
					}
				} catch (error) {
					setReviews([]);
				}
			} catch (error) {
				console.error("Erreur lors du chargement:", error);
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			loadVendorData();
		}
	}, [id, user, service, vendorType]);

	useEffect(() => {
		const shouldFetchStats = ["producer", "transformer"].includes(vendorType);
		if (!shouldFetchStats || !vendor?._id) return;

		let isActive = true;

		const loadVendorRatingStats = async () => {
			try {
				const statsResponse = await reviewService.getProducerRatingStats(vendor._id);
				const statsData = statsResponse?.data;

				if (!isActive || !statsData) return;

				setVendor((prev) => {
					if (!prev) return prev;
					return {
						...prev,
						ratings: {
							...(prev.ratings || {}),
							average: statsData.averageRating || 0,
							count: statsData.totalReviews || 0,
						},
						stats: {
							...(prev.stats || {}),
							averageRating: statsData.averageRating || 0,
							totalReviews: statsData.totalReviews || 0,
						},
						reviewStats: statsData,
					};
				});
			} catch (error) {
				console.error("Erreur avis vendeur:", error);
			}
		};

		loadVendorRatingStats();

		return () => {
			isActive = false;
		};
	}, [vendor?._id, vendorType]);

	if (loading) {
		return (
			<div className="min-h-screen bg-[#F8FAF6] flex items-center justify-center">
				<LoadingSpinner size="lg" text={`Chargement du profil...`} />
			</div>
		);
	}

	if (!vendor) {
		return (
			<div className="min-h-screen bg-[#F8FAF6] flex items-center justify-center p-4">
				<div className="text-center bg-white rounded-2xl p-8 border border-emerald-100 shadow-sm max-w-md w-full">
					<Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
					<h1 className="text-xl font-extrabold text-[#161D14] mb-2">
						Profil non trouvé
					</h1>
					<p className="text-xs text-gray-500 mb-6">
						Ce vendeur n'existe pas ou n'est plus disponible.
					</p>
					<button
						onClick={() => navigate("/producteurs")}
						className="bg-[#1A5514] hover:bg-[#31BC2E] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md"
					>
						Voir les producteurs
					</button>
				</div>
			</div>
		);
	}

	const stats = getVendorStats(vendor, items, reviews);
	const tags = getVendorTags(vendor);

	const bannerUrl =
		vendor.restaurantBanner ? (typeof vendor.restaurantBanner === "string" ? vendor.restaurantBanner : vendor.restaurantBanner.url)
		: vendor.shopBanner ? (typeof vendor.shopBanner === "string" ? vendor.shopBanner : vendor.shopBanner.url)
		: vendor.shopLogo ? (typeof vendor.shopLogo === "string" ? vendor.shopLogo : vendor.shopLogo.url)
		: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop";

	const logoUrl =
		vendor.logo ? (typeof vendor.logo === "string" ? vendor.logo : vendor.logo.url)
		: vendor.shopLogo ? (typeof vendor.shopLogo === "string" ? vendor.shopLogo : vendor.shopLogo.url)
		: null;

	return (
		<div className="min-h-screen bg-[#F8FAF6] pb-16">
			{/* Top Bar Navigation */}
			<div className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 sticky top-16 sm:top-20 lg:top-[108px] z-30">
				<div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
					<button
						onClick={() => navigate(-1)}
						className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#1A5514] transition-colors"
					>
						<FiArrowLeft className="w-4 h-4" />
						<span>Retour</span>
					</button>

					<div className="flex items-center gap-2">
						<span className="text-xs font-extrabold text-[#161D14] hidden sm:inline">{getVendorName(vendor)}</span>
						<span className="bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase">
							{vendorType === 'producer' ? 'Producteur' : vendorType === 'transformer' ? 'Transformateur' : 'Vendeur'}
						</span>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-4">

				{/* Card Profil Vendor Header */}
				<div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden mb-6">
					{/* Banner Container */}
					<div className="relative h-48 sm:h-64 lg:h-72 bg-gradient-to-r from-emerald-900 to-emerald-700 overflow-hidden">
						<img
							src={bannerUrl}
							alt={`Bannière de ${getVendorName(vendor)}`}
							className="w-full h-full object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

						{/* Verified Badge Top Right */}
						<div className="absolute top-4 right-4 bg-[#1A5514] backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-md flex items-center gap-1.5 border border-white/20">
							<FiCheckCircle className="w-4 h-4 text-emerald-400" />
							<span>Vendeur Vérifié</span>
						</div>
					</div>

					{/* Profile Body with Avatar Overlap */}
					<div className="px-5 sm:px-8 pb-8 pt-0 relative">
						<div className="flex flex-wrap items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
							{/* Avatar */}
							<div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-1.5 shadow-2xl border-2 border-emerald-400 overflow-hidden flex-shrink-0 relative">
								{logoUrl ? (
									<img
										src={logoUrl}
										alt={getVendorName(vendor)}
										className="w-full h-full object-cover rounded-xl"
									/>
								) : (
									<div className="w-full h-full bg-emerald-50 rounded-xl flex items-center justify-center font-black text-2xl text-[#1A5514]">
										{getVendorName(vendor)?.[0] || "P"}
									</div>
								)}
							</div>

							{/* Action Button */}
							<div className="flex items-center gap-3">
								<button
									onClick={handleContact}
									className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#1A5514] hover:bg-[#31BC2E] transition-all shadow-md active:scale-95"
								>
									<FiMessageCircle className="w-4 h-4" />
									<span>Contacter le vendeur</span>
								</button>
							</div>
						</div>

						{/* Title & Subtitle cleanly in white section below banner */}
						<div className="space-y-1 mb-5">
							<h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#161D14] flex items-center gap-2 leading-tight">
								<span>{getVendorName(vendor)}</span>
								{vendor.isBio && (
									<span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold text-white bg-[#1A5514]">
										<Leaf className="mr-1 h-3 w-3 text-emerald-400" />
										BIO
									</span>
								)}
							</h1>

							<p className="text-xs sm:text-sm text-gray-500 font-medium">
								{getVendorSubtitle(vendor)}
							</p>
						</div>

						{/* Location & Meta info */}
						<div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 pb-6 border-b border-gray-100">
							<span className="flex items-center gap-1.5 text-gray-700 font-bold">
								<FiMapPin className="w-4 h-4 text-emerald-700" />
								{getCountryName(vendor.country)}
								{vendor.city && ` • ${vendor.city}`}
								{vendor.region && ` • ${vendor.region}`}
							</span>

							{vendor.createdAt && (
								<span className="flex items-center gap-1 text-gray-400">
									<FiCalendar className="w-3.5 h-3.5" />
									Membre depuis {new Date(vendor.createdAt).getFullYear()}
								</span>
							)}
						</div>

						{/* Stats Grid */}
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
							{stats.map((stat, idx) => (
								<div key={idx} className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100/80 text-center">
									<div className="flex justify-center text-[#1A5514] mb-1">
										{stat.icon}
									</div>
									<div className="text-lg sm:text-xl font-black text-[#161D14]">{stat.value}</div>
									<div className="text-[11px] font-bold text-gray-500">{stat.label}</div>
								</div>
							))}
						</div>

						{/* Vendor Tags */}
						{tags.length > 0 && (
							<div className="mt-6 pt-4 border-t border-gray-100">
								<h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2.5">
									{tags[0].label}
								</h3>
								<div className="flex flex-wrap gap-2">
									{tags[0].items.map((tag, idx) => (
										<span key={idx} className="px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200/80">
											{tag}
										</span>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Tabs & Content */}
				<div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
					<div className="border-b border-gray-100 bg-gray-50/50 px-4 sm:px-6">
						<nav className="flex space-x-6">
							{tabs.map((tab) => (
								<button
									key={tab}
									onClick={() => setActiveTab(tab)}
									className={`py-4 px-2 font-extrabold text-xs sm:text-sm border-b-2 transition-all ${
										activeTab === tab 
											? "border-[#1A5514] text-[#1A5514]" 
											: "border-transparent text-gray-500 hover:text-gray-900"
									}`}
								>
									{getTabLabel(tab)} ({getTabCount(tab, items, reviews, vendor)})
								</button>
							))}
						</nav>
					</div>

					<div className="p-4 sm:p-6">
						{getTabContent(
							activeTab,
							items,
							vendor,
							{
								formatPrice,
								getItemName,
								getItemDescription,
								getItemPrice,
								getItemImage,
								getItemExtraInfo,
								getItemButtonText,
								getItemButtonIcon,
								getItemButtonColor,
								getEmptyStateIcon,
								getEmptyStateTitle,
								getEmptyStateDescription,
								addToCart,
								navigate,
							},
							reviews,
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default VendorProfile;
