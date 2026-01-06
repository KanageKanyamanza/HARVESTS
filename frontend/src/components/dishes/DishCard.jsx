import React from "react";
import { Link } from "react-router-dom";
import {
	FiEdit,
	FiTrash2,
	FiEye,
	FiEyeOff,
	FiClock,
	FiDollarSign,
	FiImage,
	FiExternalLink,
} from "react-icons/fi";
import CloudinaryImage from "../common/CloudinaryImage";
import { getDishImageUrl } from "../../utils/dishImageUtils";
import { formatPrice } from "../../utils/currencyUtils";

export const getStatusBadge = (dish) => {
	const normalized = dish.status || "pending-review";
	const map = {
		approved: { label: "Approuvé", classes: "bg-green-100 text-green-700" },
		"pending-review": {
			label: "En attente de validation",
			classes: "bg-yellow-100 text-yellow-700",
		},
		draft: { label: "Brouillon", classes: "bg-gray-100 text-gray-600" },
		rejected: { label: "Rejeté", classes: "bg-red-100 text-red-700" },
	};
	return map[normalized] || map["pending-review"];
};

export const getCategoryLabel = (category) => {
	const categories = {
		entree: "Entrée",
		plat: "Plat principal",
		dessert: "Dessert",
		boisson: "Boisson",
		accompagnement: "Accompagnement",
	};
	return categories[category] || category;
};

const DishCard = ({ dish, onEdit, onDelete }) => {
	const statusInfo = getStatusBadge(dish);
	const isAwaitingApproval = (dish.status || "pending-review") !== "approved";

	return (
		<div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
			{/* Image */}
			{dish.image ? (
				<div className="w-full h-32 mb-3 rounded-lg overflow-hidden">
					<CloudinaryImage
						src={getDishImageUrl(dish)}
						alt={dish.name}
						className="w-full h-full object-cover"
					/>
				</div>
			) : (
				<div className="w-full h-32 mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
					<FiImage className="h-8 w-8 text-gray-400" />
				</div>
			)}

			{/* Status & Availability */}
			<div className="flex items-center justify-between mb-2">
				<span
					className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.classes}`}
				>
					{statusInfo.label}
				</span>
				<span
					className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
						dish.isActive
							? "bg-green-100 text-green-700"
							: "bg-red-100 text-red-700"
					}`}
				>
					{dish.isActive ? (
						<>
							<FiEye className="h-3 w-3 mr-1" />
							Disponible
						</>
					) : (
						<>
							<FiEyeOff className="h-3 w-3 mr-1" />
							Indisponible
						</>
					)}
				</span>
			</div>

			{/* Name & Description */}
			<h3 className="text-lg font-semibold text-gray-900 mb-1">{dish.name}</h3>
			<p className="text-sm text-gray-500 mb-2 line-clamp-2">
				{dish.description || dish.shortDescription || "Pas de description"}
			</p>

			{/* Category */}
			<div className="text-xs text-gray-500 mb-2">
				{getCategoryLabel(dish.category)}
			</div>

			{/* Price & Prep Time */}
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center text-harvests-green font-semibold">
					<FiDollarSign className="h-4 w-4 mr-1" />
					{formatPrice(dish.price, dish.currency)}
				</div>
				{dish.preparationTime && (
					<div className="flex items-center text-gray-500 text-sm">
						<FiClock className="h-4 w-4 mr-1" />
						{dish.preparationTime} min
					</div>
				)}
			</div>

			{/* Warning */}
			{isAwaitingApproval && (
				<div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
					Ce plat est en attente de validation par un administrateur.
				</div>
			)}

			{/* Actions */}
			<div className="flex items-center justify-between pt-3 border-t border-gray-200">
				<div className="flex space-x-2">
					<button
						onClick={() => onEdit(dish)}
						className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
					>
						<FiEdit className="h-4 w-4 mr-1" />
						Modifier
					</button>
					<button
						onClick={() => onDelete(dish._id)}
						className="inline-flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
					>
						<FiTrash2 className="h-4 w-4 mr-1" />
						Supprimer
					</button>
				</div>
				<Link
					to={`/dishes/${dish._id}`}
					className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
				>
					<FiExternalLink className="h-4 w-4 mr-1" />
					Voir
				</Link>
			</div>
		</div>
	);
};

export default DishCard;
