import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Utensils, Tag, Clock, Edit, Eye } from "lucide-react";
import CloudinaryImage from "../../../../components/common/CloudinaryImage";
import { toPlainText } from "../../../../utils/textHelpers";
import { getDishImageUrl } from "../../../../utils/dishImageUtils";
import { getDishInfo } from "../../../../utils/dishHelpers";
import { formatPrice } from "../../../../utils/currencyUtils";

// Derniers plats du restaurateur (même rendu que les derniers produits du
// producteur). loading : l'en-tête reste affiché, seule la liste attend.
const RecentDishesWidget = ({ dishes = [], loading = false }) => {
	const { t } = useTranslation(["dashboard-restaurateur", "common"]);

	if (!loading && dishes.length === 0) {
		return (
			<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 p-6 text-center h-full flex flex-col items-center justify-center">
				<div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mb-3">
					<Utensils className="w-8 h-8 text-gray-300" />
				</div>
				<h3 className="text-base font-black text-gray-900 tracking-tight">
					{t("dashboard.noDishes")}
				</h3>
				<Link
					to="/restaurateur/dishes/add"
					className="mt-3 text-[10px] font-black text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl transition-all shadow-lg shadow-orange-200 uppercase tracking-widest"
				>
					{t("dishes.add")}
				</Link>
			</div>
		);
	}

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 h-full flex flex-col relative overflow-hidden">
			<div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
				<div>
					<h3 className="text-base font-[1000] text-gray-900 tracking-tight">
						{t("dashboard.myDishes")}
					</h3>
					<p className="text-[9px] font-black text-gray-600 mt-0.5 uppercase tracking-[0.2em]">
						{t("dashboard.latestDishes")}
					</p>
				</div>
				<Link
					to="/restaurateur/dishes"
					className="text-[9px] font-black text-orange-600 hover:text-white hover:bg-orange-500 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 transition-all duration-300 uppercase tracking-widest"
				>
					{t("common:dashboardWidgets.seeAll")}
				</Link>
			</div>

			<div className="p-2 space-y-2 flex-1 overflow-auto">
				{loading ?
					[1, 2, 3].map((i) => (
						<div key={i} className="p-2.5 flex items-center gap-3 animate-pulse">
							<div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
							<div className="flex-1 space-y-2">
								<div className="h-3 bg-gray-100 rounded w-1/2" />
								<div className="h-2.5 bg-gray-100 rounded w-1/3" />
							</div>
						</div>
					))
				:	dishes.map((dish) => {
						const name = toPlainText(dish.name, t("dish.fallbackName"));
						const { category, preparationTime } = getDishInfo(dish);
						return (
							<div
								key={dish._id}
								className="group p-2.5 rounded-[1rem] border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 bg-white/40"
							>
								<div className="flex items-center space-x-3">
									<CloudinaryImage
										src={getDishImageUrl(dish)}
										alt={name}
										className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0"
										fallback="/images/placeholder-product.svg"
									/>
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0">
												<h4 className="text-sm font-[1000] text-gray-900 group-hover:text-orange-600 transition-colors tracking-tight truncate">
													{name}
												</h4>
												<div className="flex items-center space-x-1.5 mt-0.5">
													<Tag className="w-2.5 h-2.5 text-orange-500" />
													<span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter truncate">
														{t(`dish.categories.${category}`, { defaultValue: category })}
													</span>
												</div>
											</div>
											<div className="text-right shrink-0">
												<p className="text-sm font-[1000] text-gray-900 tracking-tighter leading-none mb-0.5">
													{formatPrice(dish.price, dish.currency || "XOF")}
												</p>
												{preparationTime ?
													<span className="text-[8px] font-bold text-gray-400 flex items-center justify-end">
														<Clock className="w-2 h-2 mr-1 opacity-60" />
														{t("dish.minutes", { count: preparationTime })}
													</span>
												:	null}
											</div>
										</div>
										<div className="mt-2 flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
											<Link
												to={`/restaurateur/dishes?edit=${dish._id}`}
												title={t("dish.edit")}
												aria-label={t("dish.edit")}
												className="p-1 bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
											>
												<Edit className="w-3 h-3" />
											</Link>
											<Link
												to={`/restaurateur/dishes/${dish._id}`}
												title={t("dish.view")}
												aria-label={t("dish.view")}
												className="p-1 bg-gray-100 hover:bg-orange-50 text-gray-500 hover:text-orange-600 rounded-lg transition-colors"
											>
												<Eye className="w-3 h-3" />
											</Link>
										</div>
									</div>
								</div>
							</div>
						);
					})
				}

				{!loading && dishes.length < 5 && (
					<Link
						to="/restaurateur/dishes/add"
						className="flex items-center justify-center p-3 rounded-[1rem] border border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50/50 text-gray-400 hover:text-orange-600 transition-all duration-300"
					>
						<span className="text-[10px] font-black uppercase tracking-widest">
							+ {t("dishes.add")}
						</span>
					</Link>
				)}
			</div>
		</div>
	);
};

export default RecentDishesWidget;
