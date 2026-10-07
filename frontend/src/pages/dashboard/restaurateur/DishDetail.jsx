import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Utensils } from "lucide-react";
import {
	FiArrowLeft,
	FiClock,
	FiDollarSign,
	FiTag,
	FiAlertTriangle,
	FiEdit,
	FiTrash2,
	FiInfo,
} from "react-icons/fi";
import { restaurateurService } from "../../../services";
import { useNotifications } from "../../../hooks/useNotifications";
import { getDishImageUrl } from "../../../utils/dishImageUtils";
import { getDishInfo } from "../../../utils/dishHelpers";
import { formatPrice } from "../../../utils/currencyUtils";
import { toPlainText } from "../../../utils/textHelpers";

const STATUS_CLASSES = {
	approved: "bg-green-100 text-green-800",
	"pending-review": "bg-yellow-100 text-yellow-800",
	draft: "bg-gray-100 text-gray-700",
	rejected: "bg-red-100 text-red-800",
};

const DishDetail = () => {
	const { t } = useTranslation("dashboard-restaurateur");
	const { dishId } = useParams();
	const navigate = useNavigate();
	const { showError, showSuccess } = useNotifications();

	const [dish, setDish] = useState(null);
	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);

	const loadDish = useCallback(async () => {
		try {
			setLoading(true);
			const response = await restaurateurService.getDishes();
			const dishes = response.data?.data?.dishes || [];
			const foundDish = dishes.find((d) => d._id === dishId);
			setDish(foundDish || null);
			setNotFound(!foundDish);
		} catch (error) {
			console.error("Erreur lors du chargement du plat:", error);
			showError(t("detail.loadError"));
			setNotFound(true);
		} finally {
			setLoading(false);
		}
		// `t` exclu : changer de langue ne doit pas recharger le plat
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dishId, showError]);

	useEffect(() => {
		loadDish();
	}, [loadDish]);

	// L'édition se fait dans la fenêtre de la liste des plats
	const handleEdit = () => {
		navigate(`/restaurateur/dishes?edit=${dishId}`);
	};

	const handleDelete = async () => {
		if (!window.confirm(t("dishes.confirmDelete"))) return;
		try {
			await restaurateurService.deleteDish(dishId);
			showSuccess(t("detail.deleted"));
			navigate("/restaurateur/dishes");
		} catch (error) {
			console.error("Erreur lors de la suppression:", error);
			showError(t("detail.deleteError"));
		}
	};

	if (!loading && (notFound || !dish)) {
		return (
			<div className="dashboard-page bg-harvests-light">
				<div className="dashboard-container flex items-center justify-center min-h-[60vh]">
					<div className="text-center">
						<div className="flex justify-center text-red-500 mb-4">
							<FiAlertTriangle size={64} />
						</div>
						<h1 className="text-2xl font-bold text-gray-900 mb-2">
							{t("detail.notFoundTitle")}
						</h1>
						<p className="text-gray-600 mb-6">{t("detail.notFoundText")}</p>
						<button
							onClick={() => navigate(-1)}
							className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
						>
							{t("detail.back")}
						</button>
					</div>
				</div>
			</div>
		);
	}

	const info = getDishInfo(dish);
	const name = toPlainText(dish?.name, t("dish.fallbackName"));
	const description = toPlainText(dish?.description, "");
	const imageUrl = getDishImageUrl(dish);
	const status = STATUS_CLASSES[dish?.status] ? dish.status : "pending-review";

	return (
		<div className="dashboard-page bg-harvests-light/20">
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-100/30 rounded-full blur-[120px]"></div>
			</div>
			<div className="dashboard-container">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<button
						onClick={() => navigate(-1)}
						className="group inline-flex items-center text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-orange-600 transition-colors"
					>
						<FiArrowLeft className="mr-2" />
						{t("detail.back")}
					</button>

					<div className="flex space-x-3">
						<button
							onClick={handleEdit}
							disabled={loading}
							className="flex items-center px-4 py-2.5 bg-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
						>
							<FiEdit className="mr-2" />
							{t("dish.edit")}
						</button>
						<button
							onClick={handleDelete}
							disabled={loading}
							className="flex items-center px-4 py-2.5 bg-white text-red-600 border border-red-100 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
						>
							<FiTrash2 className="mr-2" />
							{t("dish.delete")}
						</button>
					</div>
				</div>

				{loading ? (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse" aria-busy="true">
						<div className="aspect-square rounded-2xl bg-gray-100" />
						<div className="space-y-4">
							<div className="h-8 bg-gray-100 rounded w-2/3" />
							<div className="h-4 bg-gray-100 rounded w-1/3" />
							<div className="h-24 bg-gray-100 rounded-xl" />
							<div className="h-12 bg-gray-100 rounded-xl w-1/2" />
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Image */}
						<div className="aspect-square rounded-[2rem] overflow-hidden bg-orange-50/60 shadow-sm border border-white/60">
							{imageUrl ? (
								<img src={imageUrl} alt={name} className="w-full h-full object-cover" />
							) : (
								<div className="w-full h-full flex items-center justify-center">
									<div className="text-center text-gray-400">
										<div className="flex justify-center mb-4 text-gray-300">
											<Utensils size={64} />
										</div>
										<p>{t("detail.noImage")}</p>
									</div>
								</div>
							)}
						</div>

						{/* Details */}
						<div className="space-y-6">
							{/* Title and Status */}
							<div>
								<div className="flex items-start justify-between gap-3 mb-2">
									<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter">{name}</h1>
									<div className="flex flex-col items-end gap-1 shrink-0">
										<span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CLASSES[status]}`}>
											{t(`dish.status.${status}`)}
										</span>
										<span
											className={`px-3 py-1 rounded-full text-sm font-medium ${
												dish.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
											}`}
										>
											{dish.isActive ? t("dish.available") : t("dish.unavailable")}
										</span>
									</div>
								</div>
								<p className="text-gray-600 text-lg">
									{description || t("dish.noDescription")}
								</p>
							</div>

							{/* Price and Time */}
							<div className="grid grid-cols-2 gap-4">
								<div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm">
									<div className="flex items-center text-green-600">
										<FiDollarSign className="mr-2" />
										<span className="font-semibold">{t("detail.price")}</span>
									</div>
									<p className="text-2xl font-bold text-gray-900 mt-1">
										{formatPrice(dish.price, dish.currency)}
									</p>
								</div>

								<div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm">
									<div className="flex items-center text-blue-600">
										<FiClock className="mr-2" />
										<span className="font-semibold">{t("detail.preparationTime")}</span>
									</div>
									<p className="text-2xl font-bold text-gray-900 mt-1">
										{info.preparationTime ?
											t("dish.minutes", { count: info.preparationTime })
										:	"—"}
									</p>
								</div>
							</div>

							{/* Category */}
							<div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm">
								<div className="flex items-center text-orange-600 mb-2">
									<FiTag className="mr-2" />
									<span className="font-semibold">{t("detail.category")}</span>
								</div>
								<span className="inline-block px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-bold">
									{t(`dish.categories.${info.category}`, { defaultValue: info.category })}
								</span>
							</div>

							{/* Allergens */}
							{info.allergens.length > 0 && (
								<div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm">
									<div className="flex items-center text-orange-600 mb-3">
										<FiAlertTriangle className="mr-2" />
										<span className="font-semibold">{t("detail.allergens")}</span>
									</div>
									<div className="flex flex-wrap gap-2">
										{info.allergens.map((allergen) => (
											<span
												key={allergen}
												className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
											>
												{t(`dish.allergens.${allergen}`, { defaultValue: allergen })}
											</span>
										))}
									</div>
								</div>
							)}

							{/* La mise en ligne dépend de la validation admin */}
							<div className="flex items-start gap-3 p-4 bg-blue-50/70 border border-blue-100 rounded-2xl text-sm text-blue-800">
								<FiInfo className="h-5 w-5 shrink-0 mt-0.5" />
								<p>{t("detail.availabilityNote")}</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default DishDetail;
