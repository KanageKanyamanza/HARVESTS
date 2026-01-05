import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import { useNotifications } from "../../../contexts/NotificationContext";
import { restaurateurService } from "../../../services";
import { FiArrowLeft, FiSave, FiUpload, FiX } from "react-icons/fi";
import { CURRENCIES, DEFAULT_CURRENCY } from "../../../config/currencies";
import { UNITS, DEFAULT_UNIT } from "../../../config/units";

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

const AddDish = () => {
	const navigate = useNavigate();
	const { showError, showSuccess } = useNotifications();
	const fileInputRef = useRef(null);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		price: "",
		currency: DEFAULT_CURRENCY,
		image: "",
		category: "plat",
		preparationTime: 30,
		allergens: [],
		stock: 10,
		unit: DEFAULT_UNIT,
	});

	const [loading, setLoading] = useState(false);
	const [imagePreview, setImagePreview] = useState("");

	const handleChange = (event) => {
		const { name, value, type } = event.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
		}));
	};

	const handleAllergenToggle = (allergen) => {
		setFormData((prev) => ({
			...prev,
			allergens: prev.allergens.includes(allergen)
				? prev.allergens.filter((item) => item !== allergen)
				: [...prev.allergens, allergen],
		}));
	};

	const handleImageSelect = (event) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			showError("Veuillez sélectionner un fichier image valide.");
			return;
		}

		const reader = new FileReader();
		reader.onload = (loadEvent) => {
			const base64 = loadEvent.target?.result;
			if (typeof base64 === "string") {
				setFormData((prev) => ({
					...prev,
					image: base64,
				}));
				setImagePreview(base64);
			}
		};
		reader.readAsDataURL(file);
	};

	const removeImage = () => {
		setFormData((prev) => ({
			...prev,
			image: "",
		}));
		setImagePreview("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!formData.name.trim()) {
			showError("Le nom du plat est requis.");
			return;
		}

		if (!formData.price || Number(formData.price) <= 0) {
			showError("Le prix du plat doit être supérieur à zéro.");
			return;
		}

		const payload = {
			...formData,
			price: Number(formData.price),
			preparationTime: Number(formData.preparationTime) || 0,
			stock: Number(formData.stock) || 0,
		};

		try {
			setLoading(true);
			await restaurateurService.createDish(payload);
			showSuccess("Plat soumis pour validation.");
			navigate("/restaurateur/dishes");
		} catch (error) {
			console.error("Erreur lors de la création du plat :", error);
			showError(
				error.response?.data?.message ||
					"Impossible de créer le plat pour le moment."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<ModularDashboardLayout userType="restaurateur">
			<div className="max-w-4xl mx-auto p-6 pb-20">
				<button
					onClick={() => navigate(-1)}
					className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
				>
					<FiArrowLeft className="h-4 w-4 mr-2" />
					Retour
				</button>

				<div className="mb-6">
					<h1 className="text-3xl font-bold text-gray-900">
						Ajouter un nouveau plat
					</h1>
					<p className="text-gray-600 mt-2">
						Renseignez les informations de votre plat pour enrichir votre menu.
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6"
				>
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
								{categories.map((category) => (
									<option key={category.value} value={category.value}>
										{category.label}
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

					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Prix *
							</label>
							<input
								type="number"
								name="price"
								min="0"
								value={formData.price}
								onChange={handleChange}
								required
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Devise
							</label>
							<select
								name="currency"
								value={formData.currency}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
							>
								{CURRENCIES.map((currency) => (
									<option key={currency.code} value={currency.code}>
										{currency.code} - {currency.name}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Temps de préparation (min)
							</label>
							<input
								type="number"
								name="preparationTime"
								min="0"
								value={formData.preparationTime}
								onChange={handleChange}
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
								min="0"
								value={formData.stock}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
							/>
							<p className="mt-1 text-xs text-gray-500">
								Quantité disponible lors de la mise en ligne.
							</p>
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
							Image du plat
						</label>
						<div className="flex flex-col sm:flex-row sm:items-center gap-4">
							<label className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-harvests-green transition-colors">
								<FiUpload className="h-5 w-5 text-gray-400 mr-2" />
								<span className="text-sm text-gray-600">
									Cliquez pour sélectionner une image
								</span>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handleImageSelect}
									className="hidden"
								/>
							</label>
							{imagePreview && (
								<div className="relative">
									<img
										src={imagePreview}
										alt="Aperçu du plat"
										className="w-24 h-24 rounded-lg object-cover border border-gray-200"
									/>
									<button
										type="button"
										onClick={removeImage}
										className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
									>
										<FiX className="h-3 w-3" />
									</button>
								</div>
							)}
						</div>
						<p className="mt-2 text-xs text-gray-500">
							Formats recommandés : JPG, PNG ou WebP (5 MB max).
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Allergènes
						</label>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
							{allergenOptions.map((allergen) => (
								<label
									key={allergen.value}
									className="flex items-center text-sm text-gray-600"
								>
									<input
										type="checkbox"
										checked={formData.allergens.includes(allergen.value)}
										onChange={() => handleAllergenToggle(allergen.value)}
										className="h-4 w-4 text-harvests-green focus:ring-harvests-green border-gray-300 rounded"
									/>
									<span className="ml-2 text-xs">{allergen.label}</span>
								</label>
							))}
						</div>
					</div>

					<div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
						<button
							type="button"
							onClick={() => navigate("/restaurateur/dishes")}
							className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
						>
							Annuler
						</button>
						<button
							type="submit"
							disabled={loading}
							className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-harvests-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-harvests-green disabled:opacity-50"
						>
							{loading ? (
								<>
									<FiSave className="h-4 w-4 mr-2 animate-spin" />
									Enregistrement...
								</>
							) : (
								<>
									<FiSave className="h-4 w-4 mr-2" />
									Enregistrer le plat
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</ModularDashboardLayout>
	);
};

export default AddDish;
