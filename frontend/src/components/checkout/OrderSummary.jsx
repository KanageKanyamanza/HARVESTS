import React from "react";
import { FiShoppingBag, FiShield } from "react-icons/fi";
import CloudinaryImage from "../common/CloudinaryImage";
import { formatPrice, convertPrice } from "../../utils/currencyUtils";
import { useCurrency } from "../../contexts/CurrencyContext.jsx";
import { DEFAULT_CURRENCY } from "../../config/currencies";



const OrderSummary = ({ cartItems, totals }) => {
	const { currency } = useCurrency();

	return (
		<div className="bg-white rounded-lg shadow p-6 sticky top-6">
			<h2 className="text-lg font-semibold text-gray-900 mb-6">
				Résumé de la commande
			</h2>

			{/* Cart Items */}
			<div className="space-y-3 mb-6">
				{cartItems.map((item, i) => (
					<div
						key={item.productId || item.id || `cart-item-${i}`}
						className="flex items-center space-x-3"
					>
						<div className="h-12 w-12 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
							{item.image ? (
								<CloudinaryImage
									src={item.image}
									alt={item.name}
									className="h-full w-full object-cover"
									width={48}
									height={48}
								/>
							) : (
								<FiShoppingBag className="h-6 w-6 text-gray-400" />
							)}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">
								{item.name}
							</p>
							<p className="text-sm text-gray-500">x {item.quantity}</p>
						</div>
						<p className="text-sm font-medium text-gray-900">
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
			<div className="space-y-3 mb-6">
				<div className="flex justify-between text-sm">
					<span className="text-gray-600">Sous-total</span>
					<span className="font-medium">
						{formatPrice(
							convertPrice(totals.subtotal, DEFAULT_CURRENCY, currency),
							currency
						)}
					</span>
				</div>



				{totals.taxes > 0 && (
					<div className="flex justify-between text-sm">
						<span className="text-gray-600">TVA</span>
						<span className="font-medium">
							{formatPrice(
								convertPrice(totals.taxes, DEFAULT_CURRENCY, currency),
								currency
							)}
						</span>
					</div>
				)}

				{totals.discount > 0 && (
					<div className="flex justify-between text-sm">
						<span className="text-green-600">Réduction</span>
						<span className="font-medium text-green-600">
							-
							{formatPrice(
								convertPrice(totals.discount, DEFAULT_CURRENCY, currency),
								currency
							)}
						</span>
					</div>
				)}

				<div className="border-t border-gray-200 pt-3">
					<div className="flex justify-between">
						<span className="text-lg font-semibold text-gray-900">Total</span>
						<span className="text-lg font-semibold text-gray-900">
							{formatPrice(
								convertPrice(totals.total, DEFAULT_CURRENCY, currency),
								currency
							)}
						</span>
					</div>
				</div>

				{/* Livraison gratuite (frais retirés) */}
				<p className="text-[10px] text-gray-400 text-right mt-1 italic uppercase font-bold tracking-tighter">
					Livraison offerte par Harvests
				</p>
			</div>

			{/* Security Info */}
			<div className="text-center text-xs text-gray-500">
				<div className="flex items-center justify-center mb-2">
					<FiShield className="h-4 w-4 mr-1" />
					<span>Paiement sécurisé</span>
				</div>
				<p>Livraison garantie</p>
			</div>
		</div>
	);
};

export default OrderSummary;
