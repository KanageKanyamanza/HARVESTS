import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import {
	FiArrowLeft,
	FiClock,
	FiStar,
	FiShoppingCart,
	FiMapPin,
	FiPhone,
	FiMail,
	FiPackage,
	FiAlertTriangle,
	FiCheck,
} from "react-icons/fi";
import { restaurateurService } from "../services";
import { getDishImageUrl, normalizeDishImage } from "../utils/dishImageUtils";
import LoadingSpinner from "../components/common/LoadingSpinner";

const DishDetail = () => {
	const { id } = useParams();
	const { addToCart } = useCart();
	const navigate = useNavigate();
	const [dish, setDish] = useState(null);
	const [restaurateur, setRestaurateur] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isAdded, setIsAdded] = useState(false);

	useEffect(() => {
		const loadDishData = async () => {
			try {
				setLoading(true);

				const response = await restaurateurService.getDishDetail(id);
				if (response.data.status === "success") {
					const dishData = response.data.data.dish;
					// Normaliser l'image du plat avant de le définir
					const normalizedDish = normalizeDishImage(dishData);
					setDish(normalizedDish);
					setRestaurateur(response.data.data.restaurateur);
				} else {
					setError("Plat non trouvé ou non disponible");
				}
			} catch (error) {
				console.error("Erreur lors du chargement du plat:", error);
				const errorMessage =
					error.response?.data?.message || "Erreur lors du chargement du plat";
				setError(errorMessage);
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			loadDishData();
		}
	}, [id]);

	const formatPrice = (price) => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: dish?.currency || "XOF",
			minimumFractionDigits: 0,
		}).format(price);
	};

	const getCategoryText = (category) => {
		const categoryMap = {
			entree: "Entrée",
			plat: "Plat principal",
			dessert: "Dessert",
			boisson: "Boisson",
			accompagnement: "Accompagnement",
		};
		return categoryMap[category] || category;
	};

	const getAllergenText = (allergen) => {
		const allergenMap = {
			gluten: "Gluten",
			lactose: "Lactose",
			nuts: "Noix",
			eggs: "Œufs",
			soy: "Soja",
			fish: "Poisson",
			shellfish: "Crustacés",
			sesame: "Sésame",
		};
		return allergenMap[allergen] || allergen;
	};

	const handleAddToCart = () => {
		// Vérifier le stock avant d'ajouter au panier
		if (dish && restaurateur) {
			if (dish.trackQuantity && dish.stock <= 0) {
				alert("Ce plat est en rupture de stock");
				return;
			}
			addToCart({
				...dish,
				originType: "dish", // S'assurer que le type est défini pour les plats
				restaurateur: {
					_id: restaurateur._id,
					restaurantName: restaurateur.restaurantName,
					firstName: restaurateur.firstName,
					lastName: restaurateur.lastName,
				},
			});
			setIsAdded(true);
			setTimeout(() => setIsAdded(false), 2000);
		}
	};

	const handleGoToRestaurant = () => {
		navigate(`/restaurateurs/${restaurateur._id}`);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-harvests-light flex items-center justify-center">
				<LoadingSpinner size="lg" text="Chargement du plat..." />
			</div>
		);
	}

	if (error || !dish) {
		return (
			<div className="min-h-screen bg-harvests-light flex items-center justify-center">
				<div className="text-center">
					<FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						Plat non trouvé
					</h1>
					<p className="text-gray-600 mb-6">
						{error || "Ce plat n'existe pas ou n'est plus disponible."}
					</p>
					<button
						onClick={() => navigate("/")}
						className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
					>
						Retour à l'accueil
					</button>
				</div>
			</div>
		);
	}

	const dishImage = getDishImageUrl(dish);

	return (
		<div className="min-h-screen bg-harvests-light">
			{/* Header avec bouton retour */}
			<div className="bg-white border-b">
				<div className="container mx-auto px-4 py-4">
					<button
						onClick={() => navigate(-1)}
						className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
					>
						<FiArrowLeft className="mr-2" />
						Retour
					</button>
				</div>
			</div>

			{/* Contenu principal */}
			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Image du plat */}
					<div className="bg-white rounded-lg h-96 shadow-sm overflow-hidden">
						{dishImage ? (
							<img
								src={dishImage}
								alt={dish.name}
								className="w-full h-96 object-cover"
							/>
						) : (
							<div className="w-full h-96 bg-gray-200 flex items-center justify-center">
								<FiPackage className="w-24 h-24 text-gray-400" />
							</div>
						)}
					</div>

					{/* Informations du plat */}
					<div className="space-y-6">
						<div className="bg-white rounded-lg shadow-sm p-6">
							<div className="flex items-start justify-between mb-4">
								<div>
									<h1 className="text-3xl font-bold text-gray-900 mb-2">
										{dish.name}
									</h1>
									<div className="flex flex-wrap items-center space-x-4 text-sm text-gray-500">
										<span className="flex items-center">
											<FiPackage className="mr-1" />
											{getCategoryText(dish.category)}
										</span>
										<span className="flex items-center">
											<FiClock className="mr-1" />
											{dish.preparationTime || 30} min
										</span>
										{dish.trackQuantity && (
											<span
												className={`flex items-center ${
													dish.stock > 0 ? "text-green-600" : "text-red-600"
												}`}
											>
												<FiPackage className="mr-1" />
												Stock: {dish.stock || 0}
											</span>
										)}
									</div>
								</div>
								<div className="text-right">
									<div className="text-3xl font-bold text-orange-600">
										{formatPrice(dish.price)}{" "}
										<span className="text-sm font-normal text-gray-500">
											/ {dish.unit || "portion"}
										</span>
									</div>
								</div>
							</div>

							{dish.description && (
								<p className="text-gray-700 mb-6">{dish.description}</p>
							)}

							{/* Allergènes */}
							{dish.allergens && dish.allergens.length > 0 && (
								<div className="mb-6">
									<h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
										<FiAlertTriangle className="mr-1 text-yellow-500" />
										Allergènes
									</h3>
									<div className="flex flex-wrap gap-2">
										{dish.allergens.map((allergen, index) => (
											<span
												key={index}
												className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
											>
												{getAllergenText(allergen)}
											</span>
										))}
									</div>
								</div>
							)}

							{/* Affichage du stock épuisé */}
							{dish.trackQuantity && dish.stock === 0 && (
								<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
									<div className="flex items-center text-red-800">
										<FiAlertTriangle className="mr-2" />
										<span className="font-medium">Stock épuisé</span>
									</div>
									<p className="text-sm text-red-600 mt-1">
										Ce plat n'est plus disponible pour le moment.
									</p>
								</div>
							)}

							{/* Boutons d'action */}
							<div className="flex flex-wrap gap-2">
								<button
									onClick={handleAddToCart}
									disabled={dish.trackQuantity && dish.stock === 0}
									className={`flex-1 py-3 px-6 rounded-lg flex items-center justify-center transition-all duration-300 transform ${
										dish.trackQuantity && dish.stock === 0
											? "bg-gray-300 text-gray-500 cursor-not-allowed"
											: isAdded
											? "bg-green-600 text-white scale-105 shadow-lg"
											: "bg-orange-600 text-white hover:bg-orange-700 hover:scale-[1.02] active:scale-95"
									}`}
								>
									{isAdded ? (
										<FiCheck className="mr-2" />
									) : (
										<FiShoppingCart className="mr-2" />
									)}
									{dish.trackQuantity && dish.stock === 0
										? "Rupture de stock"
										: isAdded
										? "Ajouté !"
										: "Ajouter au panier"}
								</button>
								<button
									onClick={handleGoToRestaurant}
									className="px-6 py-3 mx-auto border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
								>
									Voir le restaurant
								</button>
							</div>
						</div>

						{/* Informations du restaurant */}
						{restaurateur && (
							<div className="bg-white rounded-lg shadow-sm p-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">
									Restaurant
								</h3>
								<div className="space-y-3">
									<div className="flex items-center">
										<FiPackage className="mr-3 text-gray-400" />
										<span className="text-gray-900">
											{restaurateur.restaurantName ||
												`${restaurateur.firstName} ${restaurateur.lastName}`}
										</span>
									</div>
									{restaurateur.city && (
										<div className="flex items-center">
											<FiMapPin className="mr-3 text-gray-400" />
											<span className="text-gray-600">{restaurateur.city}</span>
										</div>
									)}
									{restaurateur.phone && (
										<div className="flex items-center">
											<FiPhone className="mr-3 text-gray-400" />
											<span className="text-gray-600">
												{restaurateur.phone}
											</span>
										</div>
									)}
									{restaurateur.email && (
										<div className="flex items-center">
											<FiMail className="mr-3 text-gray-400" />
											<span className="text-gray-600">
												{restaurateur.email}
											</span>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default DishDetail;
