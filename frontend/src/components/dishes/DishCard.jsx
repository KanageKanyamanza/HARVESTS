import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
	FiEdit,
	FiTrash2,
	FiEye,
	FiClock,
	FiPackage,
	FiCheckCircle,
	FiAlertCircle,
	FiXCircle,
	FiFileText,
} from "react-icons/fi";
import { Utensils } from "lucide-react";
import CloudinaryImage from "../common/CloudinaryImage";
import { getDishImageUrl } from "../../utils/dishImageUtils";
import { getDishInfo } from "../../utils/dishHelpers";
import { formatPrice } from "../../utils/currencyUtils";
import { toPlainText } from "../../utils/textHelpers";

// Même rendu que les cartes produit du producteur (MyProducts)
const STATUS_STYLES = {
	approved: { icon: FiCheckCircle, classes: "bg-emerald-50 text-emerald-700 border-emerald-100" },
	"pending-review": { icon: FiAlertCircle, classes: "bg-amber-50 text-amber-700 border-amber-100" },
	draft: { icon: FiFileText, classes: "bg-gray-50 text-gray-600 border-gray-100" },
	rejected: { icon: FiXCircle, classes: "bg-red-50 text-red-700 border-red-100" },
};

const DishCard = ({ dish, onEdit, onDelete }) => {
	const { t } = useTranslation("dashboard-restaurateur");
	const status = STATUS_STYLES[dish.status] ? dish.status : "pending-review";
	const { icon: StatusIcon, classes: statusClasses } = STATUS_STYLES[status];
	const { category, preparationTime } = getDishInfo(dish);
	// Affichage : nom et description dans la langue de l'interface
	const name = toPlainText(dish.name, t("dish.fallbackName"));
	const description =
		toPlainText(dish.description, "") || toPlainText(dish.shortDescription, "");
	const imageUrl = getDishImageUrl(dish);
	const stock = dish.inventory?.quantity ?? dish.stock ?? 0;

	return (
		<div className="group bg-white/70 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-white hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col h-full">
			<div className="relative h-52 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity"></div>

				{/* Statut de validation et disponibilité */}
				<div className="absolute top-4 left-4 z-20 flex flex-col items-start gap-1.5">
					<span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm ${statusClasses}`}>
						<StatusIcon className="w-3 h-3 mr-1.5" />
						{t(`dish.status.${status}`)}
					</span>
					{status === "approved" && (
						<span
							className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm ${
								dish.isActive ? "bg-white text-emerald-700 border-emerald-100" : "bg-white text-gray-500 border-gray-100"
							}`}
						>
							{dish.isActive ? t("dish.available") : t("dish.unavailable")}
						</span>
					)}
				</div>

				{/* Actions au survol */}
				<div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
					<div className="flex flex-col gap-2">
						<button
							onClick={() => onEdit(dish)}
							className="p-2 bg-white text-gray-700 rounded-full shadow-lg hover:bg-orange-50 hover:text-orange-600 transition-colors"
							title={t("dish.edit")}
							aria-label={t("dish.edit")}
						>
							<FiEdit className="w-4 h-4" />
						</button>
						<button
							onClick={() => onDelete(dish._id)}
							className="p-2 bg-white text-gray-700 rounded-full shadow-lg hover:bg-red-50 hover:text-red-500 transition-colors"
							title={t("dish.delete")}
							aria-label={t("dish.delete")}
						>
							<FiTrash2 className="w-4 h-4" />
						</button>
					</div>
				</div>

				{imageUrl ?
					<CloudinaryImage
						src={imageUrl}
						alt={name}
						className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
					/>
				:	<div className="w-full h-full bg-orange-50/60 flex items-center justify-center">
						<Utensils className="h-12 w-12 text-orange-200" />
					</div>
				}
			</div>

			<div className="p-5 flex flex-col flex-grow relative">
				{/* Étiquette de prix */}
				<div className="absolute -top-6 right-5 bg-white px-4 py-2 rounded-2xl shadow-lg border border-gray-100 z-20">
					<span className="text-sm font-[1000] text-gray-900 tracking-tight">
						{formatPrice(dish.price, dish.currency)}
					</span>
				</div>

				<div className="mb-2 flex items-center gap-2 flex-wrap">
					<span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] bg-orange-50 px-2.5 py-1.5 rounded-lg">
						{t(`dish.categories.${category}`, { defaultValue: category })}
					</span>
					{preparationTime ?
						<span className="inline-flex items-center text-[10px] font-bold text-gray-500">
							<FiClock className="w-3 h-3 mr-1" />
							{t("dish.minutes", { count: preparationTime })}
						</span>
					:	null}
				</div>

				<h3
					className="text-lg font-[1000] text-gray-900 mb-2 group-hover:text-orange-700 transition-colors line-clamp-1 tracking-tight"
					title={name}
				>
					{name}
				</h3>

				<p className="text-[11px] font-medium text-gray-500 line-clamp-2 mb-6 flex-grow leading-relaxed">
					{description || t("dish.noDescription")}
				</p>

				<div className="pt-5 border-t border-gray-100 flex items-center justify-between mt-auto">
					<div className="flex items-center text-gray-600 text-[10px] font-black uppercase tracking-widest">
						<FiPackage className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
						<span>
							{t("dishes.stock")}{" "}
							<span className={stock < 5 ? "text-red-500" : "text-gray-900"}>{stock}</span>
						</span>
					</div>
					<Link
						to={`/restaurateur/dishes/${dish._id}`}
						className="text-[10px] text-gray-600 hover:text-orange-600 font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
					>
						{t("dishes.details")} <FiEye className="w-4 h-4" />
					</Link>
				</div>
			</div>
		</div>
	);
};

export default DishCard;
