import React, { useState } from "react";
import { toPlainText } from "../../utils/textHelpers";
import { getDishImageUrl } from "../../utils/dishImageUtils";
import { UNITS, DEFAULT_UNIT } from "../../config/units";
import { CURRENCIES, DEFAULT_CURRENCY } from "../../config/currencies";

const categories = [
	{ value: "entree", label: "Entrée" },
	{ value: "plat", label: "Plat principal" },
	{ value: "dessert", label: "Dessert" },
	{ value: "boisson", label: "Boisson" },
	{ value: "accompagnement", label: "Accompagnement" },
];

const allergenOptions = [
	{ value: "gluten", label: "Gluten" },
	{ value: "lactose", label: "Lactose" },
	{ value: "nuts", label: "Noix" },
	{ value: "eggs", label: "Œufs" },
	{ value: "soy", label: "Soja" },
	{ value: "fish", label: "Poisson" },
	{ value: "shellfish", label: "Crustacés" },
	{ value: "sesame", label: "Sésame" },
];

const DishForm = ({ dish, onSubmit, onCancel, loading }) => {
	const dishName = toPlainText(dish?.name, "");
	const dishDescription = toPlainText(dish?.description, "");
	const dishImage = getDishImageUrl(dish) || "";
	const dishCategory = dish?.dishInfo?.category || dish?.category || "plat";
	const dishPreparationTime =
		dish?.dishInfo?.preparationTime || dish?.preparationTime || 30;
	const dishAllergens = dish?.dishInfo?.allergens || dish?.allergens || [];
	const dishStock = dish?.inventory?.quantity ?? dish?.stock ?? 10;

	const [formData, setFormData] = useState({
		name: dishName,
		description: dishDescription,
		price: dish?.price || "",
		image: dishImage,
		category: dishCategory,
		preparationTime: dishPreparationTime,
		allergens: dishAllergens,
		stock: dishStock,
		unit: dish?.unit || DEFAULT_UNIT,
		currency: dish?.currency || DEFAULT_CURRENCY,
	});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) =>
				setFormData((prev) => ({ ...prev, image: e.target.result }));
			reader.readAsDataURL(file);
		}
	};

	const handleAllergenChange = (allergen) => {
		setFormData((prev) => ({
			...prev,
			allergens: prev.allergens.includes(allergen)
				? prev.allergens.filter((a) => a !== allergen)
				: [...prev.allergens, allergen],
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit({
			...formData,
			name: toPlainText(formData.name, ""),
			description: toPlainText(formData.description, ""),
			shortDescription: toPlainText(formData.description, "").slice(0, 160),
		});
	};

	return (
		<div className="p-6">
			<h4 className="text-lg font-medium text-gray-900 mb-6">
				{dish ? "Modifier le plat" : "Ajouter un nouveau plat"}
			</h4>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Nom du plat *
						</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Catégorie
						</label>
						<select
							name="category"
							value={formData.category}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
						>
							{categories.map((cat) => (
								<option key={cat.value} value={cat.value}>
									{cat.label}
								</option>
							))}
						</select>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Description
					</label>
					<textarea
						name="description"
						value={formData.description}
						onChange={handleChange}
						rows={3}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Prix *
						</label>
						<div className="flex gap-2">
							<input
								type="number"
								name="price"
								value={formData.price}
								onChange={handleChange}
								required
								min="0"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
							/>
							<select
								name="currency"
								value={formData.currency}
								onChange={handleChange}
								className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
							>
								{CURRENCIES.map((currency) => (
									<option key={currency.code} value={currency.code}>
										{currency.code}
									</option>
								))}
							</select>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Temps de préparation (min)
						</label>
						<input
							type="number"
							name="preparationTime"
							value={formData.preparationTime}
							onChange={handleChange}
							min="0"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Stock initial
						</label>
						<input
							type="number"
							name="stock"
							value={formData.stock}
							onChange={handleChange}
							min="0"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
							placeholder="10"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Unité
						</label>
						<select
							name="unit"
							value={formData.unit}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
						>
							{UNITS.map((unit) => (
								<option key={unit.value} value={unit.value}>
									{unit.label}
								</option>
							))}
						</select>
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Image
					</label>
					<input
						type="file"
						name="image"
						accept="image/*"
						onChange={handleImageChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
					/>
					{formData.image && (
						<div className="mt-2">
							<img
								src={formData.image}
								alt="Aperçu"
								className="w-20 h-20 object-cover rounded-md"
							/>
						</div>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Allergènes
					</label>
					<div className="grid grid-cols-3 md:grid-cols-4 gap-2">
						{allergenOptions.map((allergen) => (
							<label key={allergen.value} className="flex items-center text-sm">
								<input
									type="checkbox"
									checked={formData.allergens.includes(allergen.value)}
									onChange={() => handleAllergenChange(allergen.value)}
									className="h-4 w-4 text-harvests-green focus:ring-harvests-green border-gray-300 rounded"
								/>
								<span className="ml-2 text-xs text-gray-700">
									{allergen.label}
								</span>
							</label>
						))}
					</div>
				</div>

				<div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
					<button
						type="button"
						onClick={onCancel}
						className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
					>
						Annuler
					</button>
					<button
						type="submit"
						disabled={loading}
						className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-harvests-green hover:bg-green-700 disabled:opacity-50"
					>
						{loading ? "Sauvegarde..." : dish ? "Modifier" : "Ajouter"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default DishForm;
