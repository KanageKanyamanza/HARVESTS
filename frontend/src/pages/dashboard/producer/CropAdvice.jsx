import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { producerService } from "../../../services";
import {
	FiSearch,
	FiSun,
	FiThermometer,
	FiCalendar,
	FiInfo,
	FiChevronRight,
	FiImage,
} from "react-icons/fi";
import { Sprout } from "lucide-react";
import { toPlainText } from "../../../utils/textHelpers";
import {
	cropAdviceData,
	cropCategories,
	findCropAdviceByName,
	searchCropAdvice,
} from "../../../data/cropAdviceData";

// Carte compacte : résumé cliquable avec image et badges
const CropAdviceCard = ({ crop }) => {
	const [imgSrc, setImgSrc] = useState(crop.image || crop.fallbackUrl);

	const handleImgError = () => {
		if (imgSrc !== crop.fallbackUrl && crop.fallbackUrl) {
			setImgSrc(crop.fallbackUrl);
		} else {
			setImgSrc(null);
		}
	};

	const categoryLabel =
		cropCategories.find((c) => c.value === crop.category)?.label || crop.category;

	return (
		<Link
			to={`/producer/crop-advice/${crop.id}`}
			className="group flex flex-col text-left bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-harvests-primary/40 transition-all duration-300 transform hover:-translate-y-1"
		>
			<div className="relative w-full aspect-[16/10] bg-gradient-to-br from-emerald-50 via-gray-100 to-amber-50 overflow-hidden">
				{imgSrc ? (
					<img
						src={imgSrc}
						alt={crop.name}
						onError={handleImgError}
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
					/>
				) : (
					<div className="w-full h-full flex flex-col items-center justify-center text-harvests-primary/50">
						<Sprout className="h-10 w-10 mb-1 animate-pulse" />
						<span className="text-xs font-medium">{crop.name}</span>
					</div>
				)}

				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

				<div className="absolute top-3 right-3">
					<span className="text-xs px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-harvests-primary font-semibold shadow-sm">
						{categoryLabel}
					</span>
				</div>

				<div className="absolute bottom-3 left-4 right-4">
					<h3 className="text-xl font-bold text-white drop-shadow-sm group-hover:text-amber-200 transition-colors">
						{crop.name}
					</h3>
				</div>
			</div>

			<div className="p-5 flex-1 flex flex-col justify-between space-y-4">
				<div className="space-y-2.5 text-sm text-gray-600">
					<div className="flex items-start gap-2.5">
						<FiSun className="mt-0.5 text-amber-500 flex-shrink-0" />
						<span className="font-medium text-gray-800 line-clamp-1">{crop.season.label}</span>
					</div>
					<div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
						<div className="flex items-center gap-1.5">
							<FiThermometer className="text-red-500 flex-shrink-0" />
							<span>{crop.idealTemp.min}°C à {crop.idealTemp.max}°C</span>
						</div>
						<div className="flex items-center gap-1.5">
							<FiCalendar className="text-emerald-600 flex-shrink-0" />
							<span>{crop.cycleDays}</span>
						</div>
					</div>
				</div>

				<div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-harvests-primary group-hover:text-harvests-secondary transition-colors">
					<span>Voir fiche & étapes de pousse</span>
					<FiChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
				</div>
			</div>
		</Link>
	);
};

const CropAdvice = () => {
	const { user } = useAuth();
	const [myProducts, setMyProducts] = useState([]);
	const [loadingProducts, setLoadingProducts] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");

	useEffect(() => {
		const loadProducts = async () => {
			if (user?.userType === "producer") {
				try {
					setLoadingProducts(true);
					const response = await producerService.getProducts({
						sort: "-createdAt",
					});
					const productsData =
						response.data?.data?.products ||
						response.data?.products ||
						response.data ||
						[];
					setMyProducts(
						Array.isArray(productsData) ?
							productsData.map((p) => ({
								...p,
								name: toPlainText(p.name, ""),
							}))
						:	[]
					);
				} catch (error) {
					console.error("Erreur lors du chargement des produits:", error);
					setMyProducts([]);
				} finally {
					setLoadingProducts(false);
				}
			} else {
				setLoadingProducts(false);
			}
		};
		loadProducts();
	}, [user]);

	const myProductsAdvice = useMemo(() => {
		const seen = new Set();
		const results = [];
		myProducts.forEach((product) => {
			const match = findCropAdviceByName(product.name);
			if (match && !seen.has(match.id)) {
				seen.add(match.id);
				results.push(match);
			}
		});
		return results;
	}, [myProducts]);

	const filteredCatalog = useMemo(() => {
		let list = searchTerm ? searchCropAdvice(searchTerm) : cropAdviceData;
		if (categoryFilter !== "all") {
			list = list.filter((crop) => crop.category === categoryFilter);
		}
		return list;
	}, [searchTerm, categoryFilter]);

	return (
		<div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-gray-50/50 to-white">
			<div className="relative z-10 p-4 md:p-6 max-w-[1600px] mx-auto space-y-8">
				{/* En-tête */}
				<div className="bg-gradient-to-r from-emerald-800 via-harvests-primary to-emerald-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
					<div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
					<div className="relative z-10 max-w-3xl space-y-2">
						<span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-white/20 text-emerald-100 backdrop-blur-md">
							<Sprout className="h-3.5 w-3.5" /> Guide Agricole & Bonnes Pratiques
						</span>
						<h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
							Conseils Agricoles & Fiches de Culture
						</h1>
						<p className="text-emerald-100 text-sm md:text-base opacity-90 leading-relaxed">
							Découvrez les conseils personnalisés pour vos récoltes : saisons optimales, températures, étapes de pousse illustrées et équipements agricoles préconisés.
						</p>
					</div>
				</div>

				{/* Conseils pour les produits du producteur */}
				{!loadingProducts && myProductsAdvice.length > 0 && (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
								<span className="w-2 h-6 rounded-full bg-harvests-primary" />
								Conseils pour vos produits actuels
							</h2>
							<span className="text-xs text-gray-500 font-medium">
								{myProductsAdvice.length} fiche(s) personnalisée(s)
							</span>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
							{myProductsAdvice.map((crop) => (
								<CropAdviceCard key={crop.id} crop={crop} />
							))}
						</div>
					</div>
				)}

				{!loadingProducts &&
					myProducts.length > 0 &&
					myProductsAdvice.length === 0 && (
						<div className="bg-amber-50/80 border border-amber-200 text-amber-900 rounded-2xl p-4 flex items-start gap-3 text-sm shadow-sm">
							<FiInfo className="mt-0.5 h-5 w-5 text-amber-600 flex-shrink-0" />
							<div>
								<span className="font-semibold block mb-0.5">Fiches d'aide sur-mesure</span>
								<span>
									Aucune correspondance directe trouvée pour l'un de vos produits enregistrés. Vous pouvez rechercher n'importe quelle culture du catalogue ci-dessous.
								</span>
							</div>
						</div>
					)}

				{/* Section Filtres & Recherche */}
				<div className="space-y-6">
					<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
						<div className="relative flex-1">
							<FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
							<input
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Rechercher une culture (ex: tomate, mil, mangue, maïs...)"
								className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-harvests-primary focus:border-transparent text-sm bg-gray-50/50 focus:bg-white transition-all"
							/>
						</div>

						<div className="flex items-center gap-3">
							<select
								value={categoryFilter}
								onChange={(e) => setCategoryFilter(e.target.value)}
								className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-harvests-primary focus:border-transparent text-sm bg-gray-50/50 focus:bg-white transition-all font-medium text-gray-700"
							>
								<option value="all">Toutes les catégories ({cropAdviceData.length})</option>
								{cropCategories.map((cat) => {
									const count = cropAdviceData.filter((c) => c.category === cat.value).length;
									return (
										<option key={cat.value} value={cat.value}>
											{cat.label} ({count})
										</option>
									);
								})}
							</select>
						</div>
					</div>

					{/* Grille principale des cultures */}
					{filteredCatalog.length === 0 ? (
						<div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 space-y-3">
							<FiImage className="h-12 w-12 text-gray-300 mx-auto" />
							<p className="font-semibold text-gray-700">Aucune culture trouvée</p>
							<p className="text-xs">Essayez un autre mot-clé ou réinitialisez le filtre de catégorie.</p>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{filteredCatalog.map((crop) => (
								<CropAdviceCard key={crop.id} crop={crop} />
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CropAdvice;
