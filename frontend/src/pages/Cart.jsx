import React from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
	FiShoppingCart,
	FiPlus,
	FiMinus,
	FiTrash2,
	FiArrowLeft,
} from "react-icons/fi";
import CloudinaryImage from "../components/common/CloudinaryImage";
import { useCurrency } from "../contexts/CurrencyContext";
import { convertPrice, formatPrice } from "../utils/currencyUtils";
import { DEFAULT_CURRENCY } from "../config/currencies";

const Cart = () => {
	const {
		items,
		totalItems,
		totalPrice,
		updateQuantity,
		removeFromCart,
		clearCart,
	} = useCart();
	const { user } = useAuth();
	const { currency } = useCurrency();
	const navigate = useNavigate();

	if (items.length === 0) {
		return (
			<div className="min-h-screen bg-harvests-light py-8">
				<div className="max-w-5xl mx-auto px-4">
					<div className="flex items-center mb-6">
						<button
							onClick={() => navigate(-1)}
							className="mr-4 p-2 text-gray-600 hover:text-gray-900"
						>
							<FiArrowLeft className="h-5 w-5" />
						</button>
						<h1 className="text-2xl font-bold text-gray-900">Mon Panier</h1>
					</div>

					<div className="bg-white rounded-lg shadow p-8 text-center">
						<FiShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
						<h2 className="text-xl font-semibold text-gray-900 mb-2">
							Votre panier est vide
						</h2>
						<p className="text-gray-600 mb-6">
							Découvrez nos produits et ajoutez-les à votre panier
						</p>
						<button
							onClick={() => navigate("/products")}
							className="bg-harvests-green text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
						>
							Voir les produits
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-harvests-light py-8">
			<div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					{/* Liste des articles (Left) */}
					<div className="lg:col-span-9">
						<div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6">
							<div className="flex items-end justify-between border-b border-gray-200 pb-4 mb-4">
								<h1 className="text-3xl font-normal text-gray-900">
									Votre panier
								</h1>
								<span className="text-sm text-gray-600 hidden sm:inline">Prix</span>
							</div>

							{items.map((item) => (
								<div
									key={item.productId}
									className="py-4 border-b border-gray-100 last:border-b-0 flex flex-col sm:flex-row gap-4"
								>
									{/* Image */}
									<div className="w-32 h-32 flex-shrink-0 bg-gray-50 flex items-center justify-center p-2">
										<CloudinaryImage
											src={item.image}
											alt={item.name}
											className="max-w-full max-h-full object-contain mix-blend-multiply"
											width={120}
											height={120}
										/>
									</div>

									{/* Infos */}
									<div className="flex-1 flex flex-col sm:flex-row justify-between">
										<div className="flex-1 pr-4">
											<h3 className="text-lg font-medium text-gray-900 line-clamp-2 leading-tight">
												{item.name}
											</h3>
											<p className="text-sm text-green-700 mt-1">En stock</p>
											<p className="text-xs text-gray-500 mt-1">
												Vendu par : {" "}
												<span className="text-primary-600 hover:underline cursor-pointer">
													{item.producer?.name ||
														item.producerName ||
														item.supplierName ||
														"Fournisseur"}
												</span>
											</p>

											{/* Actions (Qty, Delete) */}
											<div className="flex items-center gap-4 mt-4">
												<div className="flex items-center border border-gray-300 rounded shadow-sm bg-gray-50">
													<button
														onClick={() =>
															updateQuantity(
																item.productId,
																item.quantity - 1,
																item.originType
															)
														}
														className="p-1 px-2 hover:bg-gray-200 text-gray-600"
													>
														<FiMinus className="h-4 w-4" />
													</button>
													<span className="px-3 py-1 bg-white border-x border-gray-300 min-w-[2.5rem] text-center text-sm font-medium">
														{item.quantity}
													</span>
													<button
														onClick={() =>
															updateQuantity(
																item.productId,
																item.quantity + 1,
																item.originType
															)
														}
														className="p-1 px-2 hover:bg-gray-200 text-gray-600"
													>
														<FiPlus className="h-4 w-4" />
													</button>
												</div>

												<div className="h-4 border-l border-gray-300 hidden sm:block"></div>

												<button
													onClick={() =>
														removeFromCart(item.productId, item.originType)
													}
													className="text-sm text-primary-600 hover:underline"
												>
													Supprimer
												</button>
											</div>
										</div>

										{/* Prix individuel (aligné à droite sur desktop) */}
										<div className="text-right mt-4 sm:mt-0 font-bold text-lg text-gray-900">
											{formatPrice(
												convertPrice(
													item.price,
													item.currency || DEFAULT_CURRENCY,
													currency
												),
												currency
											)}
										</div>
									</div>
								</div>
							))}
							
							<div className="flex justify-end pt-4 font-normal text-lg">
								Sous-total ({totalItems} articles): {" "}
								<span className="font-bold ml-2">
									{formatPrice(
										convertPrice(totalPrice, DEFAULT_CURRENCY, currency),
										currency
									)}
								</span>
							</div>
						</div>
					</div>

					{/* Résumé de la commande (Right) */}
					<div className="lg:col-span-3">
						<div className="bg-white rounded-sm shadow-sm border border-gray-200 p-4 sticky top-4">
							<div className="text-lg font-normal mb-4">
								Sous-total ({totalItems} articles): {" "}
								<span className="font-bold">
									{formatPrice(
										convertPrice(totalPrice, DEFAULT_CURRENCY, currency),
										currency
									)}
								</span>
							</div>

							<button
								onClick={() => {
									console.log('🛒 [Cart] Bouton "Passer la commande" cliqué');
									let checkoutRoute = "/checkout";
									if (user?.userType === "consumer") {
										checkoutRoute = "/consumer/checkout";
									} else if (user?.userType === "restaurateur") {
										checkoutRoute = "/restaurateur/checkout";
									}
									navigate(checkoutRoute);
								}}
								className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 rounded-full transition-colors font-medium shadow-sm border border-yellow-500 text-sm"
							>
								Passer la commande
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Cart;
