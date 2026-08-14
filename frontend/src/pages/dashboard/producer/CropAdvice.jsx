import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { producerService } from "../../../services";
import {
	FiSearch,
	FiSun,
	FiDroplet,
	FiThermometer,
	FiCalendar,
	FiCheckCircle,
	FiPackage,
	FiInfo,
	FiTool,
	FiLayers,
} from "react-icons/fi";
import { toPlainText } from "../../../utils/textHelpers";
import {
	cropAdviceData,
	cropCategories,
	findCropAdviceByName,
	searchCropAdvice,
} from "../../../data/cropAdviceData";

const CropAdviceCard = ({ crop }) => (
	<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
		<div className="flex items-center justify-between mb-3">
			<h3 className="text-lg font-semibold text-gray-900">{crop.name}</h3>
			<span className="text-xs px-2 py-1 rounded-full bg-harvests-light text-harvests-primary font-medium">
				{cropCategories.find((c) => c.value === crop.category)?.label ||
					crop.category}
			</span>
		</div>

		<div className="space-y-3 text-sm text-gray-700">
			<div className="flex items-start gap-2">
				<FiSun className="mt-0.5 text-amber-500 flex-shrink-0" />
				<div>
					<span className="font-medium">{crop.season.label}</span>
					<div className="text-gray-500">
						Semis : {crop.season.sowing} · Récolte : {crop.season.harvest}
					</div>
					{crop.season.note && (
						<div className="text-xs text-gray-400 mt-1">{crop.season.note}</div>
					)}
				</div>
			</div>

			<div className="flex items-center gap-2">
				<FiThermometer className="text-red-500 flex-shrink-0" />
				<span>
					Température idéale : {crop.idealTemp.min}°C - {crop.idealTemp.max}°C
				</span>
			</div>

			<div className="flex items-start gap-2">
				<FiDroplet className="mt-0.5 text-blue-500 flex-shrink-0" />
				<span>{crop.water}</span>
			</div>

			<div className="flex items-center gap-2">
				<FiCalendar className="text-gray-500 flex-shrink-0" />
				<span>Cycle : {crop.cycleDays}</span>
			</div>

			<div>
				<div className="font-medium text-gray-800 mb-1">Sol recommandé</div>
				<p className="text-gray-600">{crop.soil}</p>
			</div>

			{crop.equipment && crop.equipment.length > 0 && (
				<div className="flex items-start gap-2">
					<FiTool className="mt-0.5 text-slate-500 flex-shrink-0" />
					<div>
						<div className="font-medium text-gray-800 mb-1">
							Engins & matériel nécessaires
						</div>
						<ul className="list-disc list-inside space-y-1 text-gray-600">
							{crop.equipment.map((item, i) => (
								<li key={i}>{item}</li>
							))}
						</ul>
					</div>
				</div>
			)}

			{crop.fertilizer && (
				<div className="flex items-start gap-2">
					<FiLayers className="mt-0.5 text-yellow-700 flex-shrink-0" />
					<div>
						<span className="font-medium text-gray-800">Fertilisation : </span>
						{crop.fertilizer}
					</div>
				</div>
			)}

			<div>
				<div className="font-medium text-gray-800 mb-1">Conseils de culture</div>
				<ul className="list-disc list-inside space-y-1 text-gray-600">
					{crop.tips.map((tip, i) => (
						<li key={i}>{tip}</li>
					))}
				</ul>
			</div>

			<div className="flex items-start gap-2">
				<FiCheckCircle className="mt-0.5 text-green-600 flex-shrink-0" />
				<div>
					<span className="font-medium text-gray-800">Récolte : </span>
					{crop.harvestTips}
				</div>
			</div>

			<div className="flex items-start gap-2">
				<FiPackage className="mt-0.5 text-orange-500 flex-shrink-0" />
				<div>
					<span className="font-medium text-gray-800">
						Après récolte :{" "}
					</span>
					{crop.postHarvest}
				</div>
			</div>
		</div>
	</div>
);

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
						response.data.data?.products ||
						response.data.products ||
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
		<div className="min-h-screen relative overflow-hidden">
			<div className="relative z-10 p-4 md:p-6 max-w-[1600px] mx-auto space-y-8">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						Conseils agricoles
					</h1>
					<p className="text-gray-500 mt-1">
						Saisons, températures et bonnes pratiques pour bien réussir vos
						cultures et vos récoltes.
					</p>
				</div>

				{!loadingProducts && myProductsAdvice.length > 0 && (
					<div>
						<h2 className="text-lg font-semibold text-gray-900 mb-3">
							Conseils pour vos produits
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
							{myProductsAdvice.map((crop) => (
								<CropAdviceCard key={crop.id} crop={crop} />
							))}
						</div>
					</div>
				)}

				{!loadingProducts &&
					myProducts.length > 0 &&
					myProductsAdvice.length === 0 && (
						<div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-lg p-4 flex items-start gap-2 text-sm">
							<FiInfo className="mt-0.5 flex-shrink-0" />
							<span>
								Aucune fiche conseil trouvée pour vos produits actuels.
								Recherchez votre culture ci-dessous pour trouver des
								informations similaires.
							</span>
						</div>
					)}

				<div>
					<h2 className="text-lg font-semibold text-gray-900 mb-3">
						Rechercher une culture
					</h2>
					<div className="flex flex-col md:flex-row gap-3 mb-5">
						<div className="relative flex-1">
							<FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
							<input
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Rechercher une culture (ex: tomate, mil, mangue...)"
								className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-harvests-primary focus:border-transparent"
							/>
						</div>
						<select
							value={categoryFilter}
							onChange={(e) => setCategoryFilter(e.target.value)}
							className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-harvests-primary focus:border-transparent"
						>
							<option value="all">Toutes les catégories</option>
							{cropCategories.map((cat) => (
								<option key={cat.value} value={cat.value}>
									{cat.label}
								</option>
							))}
						</select>
					</div>

					{filteredCatalog.length === 0 ?
						<div className="text-center py-12 text-gray-500">
							Aucune culture trouvée pour votre recherche.
						</div>
					:	<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
							{filteredCatalog.map((crop) => (
								<CropAdviceCard key={crop.id} crop={crop} />
							))}
						</div>
					}
				</div>
			</div>
		</div>
	);
};

export default CropAdvice;
