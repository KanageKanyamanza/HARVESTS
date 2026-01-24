import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { restaurateurService } from "../../../services";
import { useNotifications } from "../../../contexts/NotificationContext";
import { useAuth } from "../../../hooks/useAuth";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import DishCard from "../../../components/dishes/DishCard";
import DishForm from "../../../components/dishes/DishForm";
import { normalizeDishImage } from "../../../utils/dishImageUtils";
import { toPlainText } from "../../../utils/textHelpers";
import { FiPlus, FiPackage, FiRefreshCw } from "react-icons/fi";

const DishesManagement = () => {
	const navigate = useNavigate();
	const { user: propsUser } = useAuth();
	const { showSuccess, showError } = useNotifications();
	const [dishes, setDishes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingDish, setEditingDish] = useState(null);
	const [filter, setFilter] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");

	const loadDishes = async () => {
		try {
			setLoading(true);
			const response = await restaurateurService.getDishes();
			const dishes = (response.data?.data?.dishes || []).map((dish) => {
				const normalizedDish = normalizeDishImage(dish);
				return {
					...normalizedDish,
					name: toPlainText(normalizedDish.name, ""),
					description: toPlainText(normalizedDish.description, ""),
					shortDescription: toPlainText(normalizedDish.shortDescription, ""),
				};
			});
			setDishes(dishes);
		} catch (error) {
			console.error("Erreur:", error);
			showError("Erreur lors du chargement des plats");
			setDishes([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadDishes();
	}, []); // eslint-disable-line

	const handleDishUpdate = async (dishData) => {
		if (!editingDish) return;
		try {
			setLoading(true);
			await restaurateurService.updateDish(editingDish._id, dishData);
			showSuccess("Plat mis à jour");
			await loadDishes();
			setIsEditModalOpen(false);
			setEditingDish(null);
		} catch (error) {
			console.error("Erreur:", error);
			showError("Erreur lors de la sauvegarde");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteDish = async (dishId) => {
		if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce plat ?")) return;
		try {
			setLoading(true);
			await restaurateurService.deleteDish(dishId);
			setDishes((prev) => prev.filter((dish) => dish._id !== dishId));
			showSuccess("Plat supprimé");
		} catch (error) {
			console.error("Erreur:", error);
			showError("Erreur lors de la suppression");
		} finally {
			setLoading(false);
		}
	};

	const filteredDishes = dishes.filter((dish) => {
		if (!dish) return false;
		const matchesFilter =
			filter === "all" ||
			(filter === "available" && dish.isActive) ||
			(filter === "unavailable" && !dish.isActive);
		if (!searchTerm?.trim()) return matchesFilter;
		const searchLower = searchTerm.toLowerCase();
		return (
			matchesFilter &&
			(toPlainText(dish.name, "").toLowerCase().includes(searchLower) ||
				toPlainText(dish.description, "").toLowerCase().includes(searchLower))
		);
	});

	if (loading && dishes.length === 0) {
		return (
			<ModularDashboardLayout>
				<div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-64">
					<LoadingSpinner size="lg" text="Chargement des plats..." />
				</div>
			</ModularDashboardLayout>
		);
	}

	return (
		<ModularDashboardLayout>
			<div className="p-6 max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">
						Gestion des Plats
					</h1>
					<p className="mt-2 text-gray-600">
						Gérez votre menu et vos spécialités culinaires
					</p>
				</div>

				{/* Actions et Filtres */}
				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="flex flex-col gap-2">
							{propsUser?.subscriptionFeatures && (
								<div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
									<div
										className={`w-2 h-2 rounded-full ${dishes.length >= propsUser.subscriptionFeatures.maxProducts && propsUser.subscriptionFeatures.maxProducts !== -1 ? "bg-red-500" : "bg-emerald-500 animate-pulse"}`}
									></div>
									Quota Plats: {dishes.length} /{" "}
									{propsUser.subscriptionFeatures.maxProducts === -1 ?
										"∞"
									:	propsUser.subscriptionFeatures.maxProducts}
								</div>
							)}
							<button
								onClick={() => {
									if (
										propsUser?.subscriptionFeatures?.maxProducts !== -1 &&
										dishes.length >=
											propsUser?.subscriptionFeatures?.maxProducts
									) {
										alert(
											`Limite de plats atteinte (${propsUser.subscriptionFeatures.maxProducts} plats). Passez au niveau supérieur pour en ajouter plus !`,
										);
										return;
									}
									navigate("/restaurateur/dishes/add");
								}}
								disabled={
									propsUser?.subscriptionFeatures?.maxProducts !== -1 &&
									dishes.length >= propsUser?.subscriptionFeatures?.maxProducts
								}
								className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
									(
										propsUser?.subscriptionFeatures?.maxProducts !== -1 &&
										dishes.length >=
											propsUser?.subscriptionFeatures?.maxProducts
									) ?
										"bg-gray-300 cursor-not-allowed"
									:	"bg-harvests-green hover:bg-green-700"
								}`}
							>
								<FiPlus className="h-4 w-4 mr-2" />
								Ajouter un plat
							</button>
						</div>
						<div className="flex flex-col sm:flex-row gap-4">
							<div className="relative">
								<input
									type="text"
									placeholder="Rechercher un plat..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
								/>
								<FiPackage className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
							</div>
							<select
								value={filter}
								onChange={(e) => setFilter(e.target.value)}
								className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
							>
								<option value="all">Tous les plats</option>
								<option value="available">Disponibles</option>
								<option value="unavailable">Indisponibles</option>
							</select>
						</div>
					</div>
				</div>

				{/* Modal */}
				{isEditModalOpen && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
							<DishForm
								dish={editingDish}
								onSubmit={handleDishUpdate}
								onCancel={() => {
									setIsEditModalOpen(false);
									setEditingDish(null);
								}}
								loading={loading}
							/>
						</div>
					</div>
				)}

				{/* Liste */}
				<div className="bg-white rounded-lg shadow">
					<div className="px-6 py-4 border-b border-gray-200">
						<h2 className="text-lg font-medium text-gray-900">
							Mes Plats ({filteredDishes.length})
						</h2>
					</div>
					<div className="p-6">
						{filteredDishes.length > 0 ?
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredDishes.map((dish) => (
									<DishCard
										key={dish._id}
										dish={dish}
										onEdit={(d) => {
											setEditingDish(d);
											setIsEditModalOpen(true);
										}}
										onDelete={handleDeleteDish}
									/>
								))}
							</div>
						:	<div className="text-center py-12">
								<FiPackage className="mx-auto h-12 w-12 text-gray-400" />
								<h3 className="mt-2 text-sm font-medium text-gray-900">
									{searchTerm ? "Aucun plat trouvé" : "Aucun plat disponible"}
								</h3>
								<p className="mt-1 text-sm text-gray-500">
									{searchTerm ?
										"Essayez de modifier vos critères."
									:	"Commencez par ajouter des plats."}
								</p>
								{!searchTerm && dishes.length === 0 && (
									<button
										onClick={loadDishes}
										className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
									>
										<FiRefreshCw className="h-4 w-4 mr-2" />
										Réessayer
									</button>
								)}
							</div>
						}
					</div>
				</div>
			</div>
		</ModularDashboardLayout>
	);
};

export default DishesManagement;
