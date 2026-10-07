import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
	FiHeart,
	FiShoppingCart,
	FiMapPin,
	FiClock,
	FiRefreshCw,
	FiSearch,
	FiArrowRight,
	FiTrash2,
} from "react-icons/fi";
import { consumerService } from "../../../services/genericService";
import CardGridSkeleton from "../../../components/common/CardGridSkeleton";
import DataValue from "../../../components/common/DataValue";
import ErrorMessage from "../../../components/common/ErrorMessage";
import { formatPrice } from "../../../utils/currencyUtils";
import { toPlainText } from "../../../utils/textHelpers";
import { getCategoryLabel } from "../../../utils/productHelpers";
import { UNITS } from "../../../config/units";
import CloudinaryImage from "../../../components/common/CloudinaryImage";

const FavoriteCard = ({ favorite, onRemove }) => {
	const { t, i18n } = useTranslation(["dashboard-consumer", "common"]);
	const product = favorite.product;
	// Nom dans la langue de l'interface (était toujours le français)
	const productName = toPlainText(product.name, t("favorites.unknownProduct"));
	const primaryImage =
		product.images?.find((img) => img.isPrimary) || product.images?.[0];
	const unit = UNITS.find((u) => u.value === product.unit);

	return (
		<div className="group bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col h-full">
			{/* Image Section */}
			<div className="relative aspect-[4/3] overflow-hidden">
				{primaryImage ?
					<CloudinaryImage
						src={primaryImage.url}
						alt={productName}
						className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
						width={400}
						height={300}
					/>
				:	<div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
						<FiShoppingCart className="w-12 h-12" />
					</div>
				}

				<button
					onClick={(e) => {
						e.preventDefault();
						onRemove(product._id);
					}}
					title={t("favorites.remove")}
					aria-label={t("favorites.remove")}
					className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-rose-500 shadow-sm border border-white/50 hover:bg-rose-500 hover:text-white transition-all transform active:scale-95"
				>
					<FiTrash2 className="w-4 h-4" />
				</button>

				{/* Catégorie réelle du produit (affichait « Bio » par défaut) */}
				{product.category && (
					<div className="absolute bottom-4 left-4">
						<span className="px-3 py-1 bg-blue-600/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg">
							{getCategoryLabel(product.category, i18n.language)}
						</span>
					</div>
				)}
			</div>

			{/* Info Section */}
			<div className="p-6 flex flex-col flex-1">
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-2 text-blue-600">
						<FiMapPin className="w-3 h-3" />
						<span className="text-[9px] font-black uppercase tracking-widest">
							{product.producer?.farmName || t("favorites.localProducer")}
						</span>
					</div>
					<h3 className="text-lg font-[1000] text-gray-900 tracking-tight leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
						{productName}
					</h3>
				</div>

				<div className="mt-4 pt-4 border-t border-gray-100/50 flex items-center justify-between">
					<div className="flex flex-col">
						<span className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none mb-1">
							{t("favorites.currentPrice")}
						</span>
						<span className="text-xl font-[1000] text-gray-900 tracking-tighter">
							{formatPrice(product.price || 0, product.currency || "XOF")}
							{product.unit && (
								<span className="text-[10px] font-bold text-gray-400 ml-1">
									/{unit ? t(`common:units.${unit.key}`) : product.unit}
								</span>
							)}
						</span>
					</div>

					<Link
						to={`/products/${product.slug || product._id}`}
						title={t("favorites.viewProduct")}
						aria-label={t("favorites.viewProduct")}
						className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 group-hover:shadow-blue-200"
					>
						<FiShoppingCart className="w-5 h-5" />
					</Link>
				</div>
			</div>
		</div>
	);
};

const Favorites = () => {
	const { t } = useTranslation("dashboard-consumer");
	const [favorites, setFavorites] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		loadFavorites();
	}, []);

	const loadFavorites = async () => {
		try {
			setLoading(true);
			const response = await consumerService.getFavorites();

			let favoritesData = [];
			if (response.data) {
				if (response.data.data?.favorites) {
					favoritesData = response.data.data.favorites;
				} else if (response.data.favorites) {
					favoritesData = response.data.favorites;
				} else if (response.data.data && Array.isArray(response.data.data)) {
					favoritesData = response.data.data;
				} else if (Array.isArray(response.data)) {
					favoritesData = response.data;
				}
			}

			const validFavorites = favoritesData.filter((fav) => {
				const hasProduct = fav.product && (fav.product._id || fav.product);
				return hasProduct;
			});

			setFavorites(validFavorites);
		} catch (err) {
			console.error("Erreur lors du chargement des favoris:", err);
			setError(t("favorites.loadError"));
		} finally {
			setLoading(false);
		}
	};

	const handleRemoveFavorite = async (productId) => {
		try {
			await consumerService.removeFavorite(productId);
			setFavorites((prev) =>
				prev.filter((fav) => fav.product._id !== productId),
			);
		} catch (err) {
			console.error("Erreur lors de la suppression du favori:", err);
			setError(t("favorites.removeError"));
		}
	};


	return (
		<div className="dashboard-page bg-harvests-light/20">
				{/* Background radial glows - Blue/Sky theme */}
				<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
					<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[120px]"></div>
					<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-rose-50/20 rounded-full blur-[100px]"></div>
					<div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-cyan-100/20 rounded-full blur-[120px]"></div>
				</div>

				<div className="dashboard-container space-y-10">
					{/* Header */}
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
						<div className="space-y-3">
							<div className="flex items-center gap-2 text-blue-600 font-black text-[9px] uppercase tracking-widest mb-2">
								<div className="w-5 h-[2px] bg-blue-600 rounded-full"></div>
								<span>{t("favorites.eyebrow")}</span>
							</div>
							<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
								{t("favorites.titleStart")}{" "}
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 italic">
									{t("favorites.titleHighlight")}
								</span>
							</h1>
							<p className="text-xs text-gray-500 font-medium max-w-xl">
								{t("favorites.subtitle")}{" "}
								<DataValue loading={loading} className="w-16 h-[0.9em]">
									{t("favorites.savedCount", { count: favorites.length })}
								</DataValue>
							</p>
						</div>

						<div className="flex items-center gap-3">
							<Link
								to="/products"
								className="group relative inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all duration-300 hover:bg-blue-600 shadow-sm"
							>
								<FiSearch className="mr-2" />
								{t("favorites.discoverMore")}
							</Link>
							<button
								onClick={loadFavorites}
								title={t("favorites.refresh")}
								aria-label={t("favorites.refresh")}
								className="w-12 h-12 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors group"
							>
								<FiRefreshCw className="w-4 h-4 group-active:rotate-180 transition-transform duration-500" />
							</button>
						</div>
					</div>

					{error && (
						<div className="animate-fade-in">
							<ErrorMessage message={error} />
						</div>
					)}

					{/* Favorites List */}
					<div className="animate-fade-in-up delay-100">
						{loading ?
							<CardGridSkeleton count={4} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10" />
						: favorites.length === 0 ?
							<div className="bg-white/50 backdrop-blur-xl rounded-[3rem] p-20 border border-white/60 text-center shadow-lg">
								<div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6 shadow-inner">
									<FiHeart className="w-10 h-10" />
								</div>
								<h3 className="text-2xl font-[1000] text-gray-900 tracking-tight mb-2">
									{t("favorites.emptyTitle")}
								</h3>
								<p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">
									{t("favorites.emptyText")}
								</p>
								<Link
									to="/products"
									className="inline-flex items-center px-10 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
								>
									{t("favorites.explore")}
								</Link>
							</div>
						:	<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
								{favorites.map((favorite) => {
									if (!favorite.product) return null;

									return (
										<FavoriteCard
											key={favorite._id}
											favorite={favorite}
											onRemove={handleRemoveFavorite}
										/>
									);
								})}
							</div>
						}
					</div>
				</div>
			</div>
	);
};

export default Favorites;
