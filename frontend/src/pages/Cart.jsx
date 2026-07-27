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
	FiShield,
	FiTruck,
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

	const goToCheckout = () => {
		let checkoutRoute = "/checkout";
		if (user?.userType === "consumer") {
			checkoutRoute = "/consumer/checkout";
		} else if (user?.userType === "restaurateur") {
			checkoutRoute = "/restaurateur/checkout";
		}
		navigate(checkoutRoute);
	};

	if (items.length === 0) {
		return (
			<div className="min-h-screen bg-[#F8FAF6] py-8">
				<div className="max-w-3xl mx-auto px-4">
					<div className="flex items-center mb-6">
						<button
							onClick={() => navigate(-1)}
							className="mr-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-full transition-colors"
						>
							<FiArrowLeft className="h-5 w-5" />
						</button>
						<h1 className="text-xl sm:text-2xl font-extrabold text-[#161D14]">Mon Panier</h1>
					</div>

					<div className="bg-white rounded-3xl shadow-agri-card border border-emerald-100/80 p-10 text-center">
						<div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-emerald-50 flex items-center justify-center">
							<FiShoppingCart className="h-10 w-10 text-[#1A5514]" />
						</div>
						<h2 className="text-xl font-extrabold text-[#161D14] mb-2">
							Votre panier est vide
						</h2>
						<p className="text-gray-500 mb-6 text-sm">
							Découvrez nos produits agricoles et ajoutez-les à votre panier
						</p>
						<button
							onClick={() => navigate("/products")}
							className="bg-gradient-to-r from-[#1A5514] to-[#31BC2E] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-emerald-900/20 hover:shadow-xl transition-all"
						>
							Voir les produits
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#F8FAF6] pb-28 md:pb-8">
			<div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-5">
					<div className="flex items-center gap-3">
						<button
							onClick={() => navigate(-1)}
							className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-full transition-colors"
						>
							<FiArrowLeft className="h-5 w-5" />
						</button>
						<div>
							<h1 className="text-xl sm:text-2xl font-extrabold text-[#161D14]">
								Mon Panier
							</h1>
							<p className="text-xs text-gray-500 font-medium">
								{totalItems} article{totalItems > 1 ? "s" : ""}
							</p>
						</div>
					</div>
					<button
						onClick={clearCart}
						className="text-xs font-bold text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1"
					>
						<FiTrash2 className="h-3.5 w-3.5" />
						<span className="hidden sm:inline">Vider le panier</span>
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
					{/* Liste des articles */}
					<div className="lg:col-span-8 space-y-3">
						{items.map((item) => (
							<div
								key={item.productId}
								className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 flex gap-3 sm:gap-4"
							>
								{/* Image */}
								<div className="w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-50 rounded-xl flex items-center justify-center p-2 overflow-hidden">
									<CloudinaryImage
										src={item.image}
										alt={item.name}
										className="max-w-full max-h-full object-contain mix-blend-multiply"
										width={110}
										height={110}
									/>
								</div>

								{/* Infos */}
								<div className="flex-1 min-w-0 flex flex-col justify-between">
									<div>
										<div className="flex items-start justify-between gap-2">
											<h3 className="text-sm sm:text-base font-bold text-[#161D14] line-clamp-2 leading-snug">
												{item.name}
											</h3>
											<span className="shrink-0 font-extrabold text-sm sm:text-base text-[#1A5514]">
												{formatPrice(
													convertPrice(
														item.price,
														item.currency || DEFAULT_CURRENCY,
														currency
													),
													currency
												)}
											</span>
										</div>
										<p className="text-[11px] text-emerald-700 font-bold mt-1">En stock</p>
										<p className="text-[11px] text-gray-500 mt-0.5 truncate">
											Vendu par{" "}
											<span className="text-[#1A5514] font-semibold">
												{item.producer?.name ||
													item.producerName ||
													item.supplierName ||
													"Fournisseur"}
											</span>
										</p>
									</div>

									{/* Actions (Qty, Delete) */}
									<div className="flex items-center justify-between mt-2">
										<div className="flex items-center border border-gray-200 rounded-full bg-gray-50 overflow-hidden">
											<button
												onClick={() =>
													updateQuantity(
														item.productId,
														item.quantity - 1,
														item.originType
													)
												}
												className="p-1.5 px-2.5 hover:bg-gray-200 text-gray-600 transition-colors"
											>
												<FiMinus className="h-3.5 w-3.5" />
											</button>
											<span className="px-3 min-w-[2.25rem] text-center text-sm font-bold text-[#161D14]">
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
												className="p-1.5 px-2.5 hover:bg-gray-200 text-gray-600 transition-colors"
											>
												<FiPlus className="h-3.5 w-3.5" />
											</button>
										</div>

										<button
											onClick={() =>
												removeFromCart(item.productId, item.originType)
											}
											className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
											title="Supprimer"
										>
											<FiTrash2 className="h-4 w-4" />
										</button>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Résumé de la commande */}
					<div className="lg:col-span-4">
						<div className="bg-white rounded-2xl shadow-agri-card border border-emerald-100/80 p-5 sticky top-4">
							<h2 className="font-extrabold text-[#161D14] mb-4">Résumé de la commande</h2>

							<div className="space-y-2 text-sm text-gray-600 pb-4 border-b border-gray-100">
								<div className="flex justify-between">
									<span>Sous-total ({totalItems} article{totalItems > 1 ? "s" : ""})</span>
									<span className="font-bold text-[#161D14]">
										{formatPrice(
											convertPrice(totalPrice, DEFAULT_CURRENCY, currency),
											currency
										)}
									</span>
								</div>
								<div className="flex justify-between">
									<span>Livraison</span>
									<span className="font-bold text-emerald-600">Calculée au paiement</span>
								</div>
							</div>

							<div className="flex justify-between items-center py-4">
								<span className="font-extrabold text-[#161D14]">Total</span>
								<span className="font-extrabold text-xl text-[#1A5514]">
									{formatPrice(
										convertPrice(totalPrice, DEFAULT_CURRENCY, currency),
										currency
									)}
								</span>
							</div>

							<button
								onClick={goToCheckout}
								className="hidden md:flex w-full items-center justify-center bg-gradient-to-r from-[#1A5514] to-[#31BC2E] hover:shadow-xl text-white py-3.5 rounded-full transition-all font-bold shadow-lg shadow-emerald-900/20"
							>
								Passer la commande
							</button>

							<div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-100 text-[10px] text-gray-400 font-semibold">
								<span className="flex items-center gap-1.5">
									<FiShield className="h-3.5 w-3.5 text-emerald-500" />
									Paiement sécurisé
								</span>
								<span className="flex items-center gap-1.5">
									<FiTruck className="h-3.5 w-3.5 text-emerald-500" />
									Livraison directe producteur
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Barre de commande fixe (mobile) */}
			<div className="md:hidden fixed bottom-16 inset-x-0 z-30 bg-white border-t border-gray-200 p-3 shadow-[0_-8px_30px_-8px_rgba(0,0,0,0.15)]">
				<div className="flex items-center justify-between mb-2 px-1">
					<span className="text-xs text-gray-500 font-medium">Total ({totalItems} article{totalItems > 1 ? "s" : ""})</span>
					<span className="font-extrabold text-lg text-[#1A5514]">
						{formatPrice(
							convertPrice(totalPrice, DEFAULT_CURRENCY, currency),
							currency
						)}
					</span>
				</div>
				<button
					onClick={goToCheckout}
					className="w-full bg-gradient-to-r from-[#1A5514] to-[#31BC2E] text-white py-3.5 rounded-full font-bold shadow-lg shadow-emerald-900/20"
				>
					Passer la commande
				</button>
			</div>
		</div>
	);
};

export default Cart;
