import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiPlus, FiSearch, FiFilter, FiPackage, FiRefreshCw } from "react-icons/fi";
import CardGridSkeleton from "../../../components/common/CardGridSkeleton";
import DataValue from "../../../components/common/DataValue";
import { restaurateurService } from "../../../services";
import { useNotifications } from "../../../hooks/useNotifications";
import { useAuth } from "../../../hooks/useAuth";
import DishCard from "../../../components/dishes/DishCard";
import DishForm from "../../../components/dishes/DishForm";
import { normalizeDishImage } from "../../../utils/dishImageUtils";
import { toPlainText } from "../../../utils/textHelpers";

const STATUS_FILTERS = ["approved", "pending-review", "draft", "rejected"];

const DishesManagement = () => {
	const { t } = useTranslation(["dashboard-restaurateur", "dashboard-producer"]);
	const [searchParams, setSearchParams] = useSearchParams();
	const { user } = useAuth();
	const { showSuccess, showError } = useNotifications();
	const [dishes, setDishes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [editingDish, setEditingDish] = useState(null);
	const [statusFilter, setStatusFilter] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");

	const loadDishes = async () => {
		try {
			setLoading(true);
			const response = await restaurateurService.getDishes();
			// Jour 53 : plats gardés tels quels (name/description en { fr, en }) ;
			// les convertir en texte simple faisait réenregistrer le nom dans la
			// mauvaise langue à l'édition. L'affichage passe par toPlainText.
			setDishes((response.data?.data?.dishes || []).map(normalizeDishImage));
		} catch (error) {
			console.error("Erreur:", error);
			showError(t("dishes.loadError"));
			setDishes([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadDishes();
	}, []); // eslint-disable-line

	// Ouvre l'édition demandée par la fiche d'un plat ou le tableau de bord (?edit=<id>)
	const editId = searchParams.get("edit");
	useEffect(() => {
		if (!editId || dishes.length === 0) return;
		const dish = dishes.find((d) => d._id === editId);
		if (dish) setEditingDish(dish);
		setSearchParams({}, { replace: true });
	}, [editId, dishes, setSearchParams]);

	const handleDishUpdate = async (dishData) => {
		if (!editingDish) return;
		try {
			setSaving(true);
			await restaurateurService.updateDish(editingDish._id, dishData);
			showSuccess(t("dishes.updated"));
			setEditingDish(null);
			await loadDishes();
		} catch (error) {
			console.error("Erreur:", error);
			showError(t("dishes.saveError"));
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteDish = async (dishId) => {
		if (!window.confirm(t("dishes.confirmDelete"))) return;
		try {
			await restaurateurService.deleteDish(dishId);
			setDishes((prev) => prev.filter((dish) => dish._id !== dishId));
			showSuccess(t("dishes.deleted"));
		} catch (error) {
			console.error("Erreur:", error);
			showError(t("dishes.deleteError"));
		}
	};

	// Seule la liste attend le serveur : titre, quota et filtres restent affichés
	const initialLoading = loading && dishes.length === 0;
	const maxDishes = user?.subscriptionFeatures?.maxProducts;
	const limitReached = maxDishes !== undefined && maxDishes !== -1 && dishes.length >= maxDishes;

	const searchLower = searchTerm.trim().toLowerCase();
	const filteredDishes = dishes.filter((dish) => {
		const status = dish.status || "pending-review";
		if (statusFilter !== "all" && status !== statusFilter) return false;
		if (!searchLower) return true;
		return (
			toPlainText(dish.name, "").toLowerCase().includes(searchLower) ||
			toPlainText(dish.description, "").toLowerCase().includes(searchLower)
		);
	});

	return (
		<div className="dashboard-page bg-harvests-light/20">
			{/* Halos d'arrière-plan */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-amber-50/30 rounded-full blur-[120px]"></div>
			</div>

			<div className="dashboard-container space-y-8">
				{/* En-tête */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
					<div>
						<div className="flex items-center gap-2 text-orange-600 font-black text-[9px] uppercase tracking-widest mb-2">
							<div className="w-5 h-[2px] bg-orange-600"></div>
							<span>{t("dishes.eyebrow")}</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
							{t("dishes.titleStart")}{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
								{t("dishes.titleHighlight")}
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">{t("dishes.subtitle")}</p>
					</div>

					<div className="flex flex-col items-end gap-2">
						{user?.subscriptionFeatures && (
							<div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 border border-white/60 rounded-xl shadow-sm">
								<div className={`w-2 h-2 rounded-full ${limitReached ? "bg-red-500" : "bg-orange-500 animate-pulse"}`}></div>
								<span className="text-[10px] font-black text-gray-600 uppercase tracking-wider">
									<DataValue loading={initialLoading} className="w-16 h-[0.9em]">
										{t("dishes.quotaCount", {
											count: dishes.length,
											max: maxDishes === -1 ? "∞" : maxDishes,
										})}
									</DataValue>
								</span>
							</div>
						)}
						<Link
							to={limitReached ? "#" : "/restaurateur/dishes/add"}
							onClick={(e) => {
								if (limitReached) {
									e.preventDefault();
									alert(t("dishes.limitReached", { max: maxDishes }));
								}
							}}
							className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-sm ${
								limitReached ?
									"bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-100"
								:	"bg-gray-900 text-white hover:bg-orange-600 hover:shadow-orange-200 hover:-translate-y-1"
							}`}
						>
							<FiPlus className="w-4 h-4" />
							{t("dishes.add")}
						</Link>
					</div>
				</div>

				{/* Recherche et filtre */}
				<div className="flex flex-col md:flex-row gap-4 animate-fade-in-up delay-100">
					<div className="relative flex-grow md:max-w-md group">
						<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
							<FiSearch className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
						</div>
						<input
							type="text"
							placeholder={t("dishes.searchPlaceholder")}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="block w-full pl-11 pr-4 py-3.5 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
						/>
					</div>
					<div className="relative min-w-[200px]">
						<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
							<FiFilter className="h-4 w-4 text-gray-400" />
						</div>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="block w-full pl-10 pr-4 py-3.5 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl text-xs font-bold uppercase tracking-wide text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm cursor-pointer"
						>
							<option value="all">{t("dashboard-producer:products.list.filters.all")}</option>
							{STATUS_FILTERS.map((status) => (
								<option key={status} value={status}>
									{t(`dish.status.${status}`)}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* Grille des plats */}
				{initialLoading ?
					<CardGridSkeleton className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" />
				: filteredDishes.length === 0 ?
					<div className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center animate-fade-in-up">
						<div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
							<FiPackage className="h-10 w-10 text-gray-300" />
						</div>
						<h3 className="text-lg font-black text-gray-900 mb-2">
							{dishes.length ? t("dishes.noResultTitle") : t("dishes.emptyTitle")}
						</h3>
						<p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
							{dishes.length ? t("dishes.noResultText") : t("dishes.emptyText")}
						</p>
						{dishes.length === 0 && (
							<div className="flex items-center justify-center gap-3">
								<Link
									to="/restaurateur/dishes/add"
									className="inline-flex items-center px-5 py-2.5 bg-orange-50 text-orange-700 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-orange-100 transition-colors"
								>
									{t("dishes.add")}
								</Link>
								<button
									onClick={loadDishes}
									className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-600 font-bold rounded-xl text-xs uppercase tracking-wider border border-gray-200 hover:bg-gray-50 transition-colors"
								>
									<FiRefreshCw className="h-3.5 w-3.5" />
									{t("dishes.retry")}
								</button>
							</div>
						)}
					</div>
				:	<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up delay-200">
						{filteredDishes.map((dish) => (
							<DishCard
								key={dish._id}
								dish={dish}
								onEdit={setEditingDish}
								onDelete={handleDeleteDish}
							/>
						))}
					</div>
				}
			</div>

			{/* Fenêtre de modification */}
			{editingDish && (
				<div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[88vh] overflow-y-auto">
						<DishForm
							key={editingDish._id}
							dish={editingDish}
							onSubmit={handleDishUpdate}
							onCancel={() => setEditingDish(null)}
							loading={saving}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default DishesManagement;
