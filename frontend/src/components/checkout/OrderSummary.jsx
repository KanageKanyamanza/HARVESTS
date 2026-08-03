import React from "react";
import { FiShoppingBag, FiShield } from "react-icons/fi";
import CloudinaryImage from "../common/CloudinaryImage";
import { formatPrice, convertPrice } from "../../utils/currencyUtils";
import { useCurrency } from "../../contexts/CurrencyContext.jsx";
import { DEFAULT_CURRENCY } from "../../config/currencies";



const OrderSummary = ({ cartItems, totals }) => {
	const { currency } = useCurrency();

	return (
		<div className="bg-white rounded-2xl shadow-agri-card border border-emerald-100/80 p-5 sm:p-6 sticky top-6">
			<h2 className="font-extrabold text-[#161D14] mb-5">
				Résumé de la commande
			</h2>

			{/* Cart Items */}
			<div className="space-y-3 mb-5 pb-5 border-b border-gray-100">
				{cartItems.map((item, i) => (
					<div
						key={item.productId || item.id || `cart-item-${i}`}
						className="flex items-center gap-3"
					>
						<div className="h-12 w-12 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
							{item.image ? (
								<CloudinaryImage
									src={item.image}
									alt={item.name}
									className="h-full w-full object-contain mix-blend-multiply"
									width={48}
									height={48}
								/>
							) : (
								<FiShoppingBag className="h-6 w-6 text-gray-400" />
							)}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-bold text-[#161D14] truncate">
								{item.name}
							</p>
							<p className="text-xs text-gray-500">x {item.quantity}</p>
						</div>
						<p className="text-sm font-extrabold text-[#1A5514]">
							{formatPrice(
								convertPrice(
									item.price * item.quantity,
									item.currency || DEFAULT_CURRENCY,
									currency
								),
								currency
							)}
						</p>
					</div>
				))}
			</div>

			{/* Price Breakdown */}
			<div className="space-y-2.5 text-sm text-gray-600 mb-2">
				<div className="flex justify-between">
					<span>Sous-total</span>
					<span className="font-bold text-[#161D14]">
						{formatPrice(
							convertPrice(totals.subtotal, DEFAULT_CURRENCY, currency),
							currency
						)}
					</span>
				</div>

				{totals.taxes > 0 && (
					<div className="flex justify-between">
						<span>TVA</span>
						<span className="font-bold text-[#161D14]">
							{formatPrice(
								convertPrice(totals.taxes, DEFAULT_CURRENCY, currency),
								currency
							)}
						</span>
					</div>
				)}

				{totals.discount > 0 && (
					<div className="flex justify-between">
						<span className="text-emerald-600">Réduction</span>
						<span className="font-bold text-emerald-600">
							-
							{formatPrice(
								convertPrice(totals.discount, DEFAULT_CURRENCY, currency),
								currency
							)}
						</span>
					</div>
				)}
			</div>

			<div className="flex justify-between items-center py-4 border-t border-gray-100">
				<span className="font-extrabold text-[#161D14]">Total</span>
				<span className="font-extrabold text-xl text-[#1A5514]">
					{formatPrice(
						convertPrice(totals.total, DEFAULT_CURRENCY, currency),
						currency
					)}
				</span>
			</div>

			{/* Livraison gratuite (frais retirés) */}
			<p className="text-[10px] text-gray-400 text-right -mt-2 mb-4 italic uppercase font-bold tracking-tighter">
				Livraison offerte par Harvests
			</p>

			{/* Security Info */}
			<div className="flex items-center gap-4 pt-4 border-t border-gray-100 text-[10px] text-gray-400 font-semibold">
				<span className="flex items-center gap-1.5">
					<FiShield className="h-3.5 w-3.5 text-emerald-500" />
					Paiement sécurisé
				</span>
				<span>Livraison garantie</span>
			</div>
		</div>
	);
};

export default OrderSummary;
