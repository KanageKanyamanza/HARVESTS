import React from "react";
import {
	FiCheckCircle,
	FiClock,
	FiPackage,
	FiTruck,
	FiMapPin,
	FiUser,
	FiPhone,
	FiCreditCard,
	FiDownload,
	FiShare2,
	FiShoppingBag,
	FiHome,
} from "react-icons/fi";
import { parseProductName } from "../../utils/productUtils";
import { formatPrice, convertPrice } from "../../utils/currencyUtils";
import { useCurrency } from "../../contexts/CurrencyContext";
import { DEFAULT_CURRENCY } from "../../config/currencies";

import { formatDate } from "../../utils/orderUIUtils";

export const SuccessHeader = () => (
	<div className="text-center mb-6 sm:mb-8">
		<div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-emerald-50 mb-5">
			<div className="h-14 w-14 rounded-full bg-gradient-to-r from-[#1A5514] to-[#31BC2E] flex items-center justify-center shadow-lg shadow-emerald-900/20">
				<FiCheckCircle className="h-7 w-7 text-white" />
			</div>
		</div>
		<h1 className="text-xl sm:text-2xl font-extrabold text-[#161D14] mb-2">
			Commande confirmée !
		</h1>
		<p className="text-gray-500 text-sm">
			Votre commande a été passée avec succès. Vous recevrez un email de
			confirmation.
		</p>
	</div>
);

export const OrderInfoCard = ({
	order,
	statusConfig,
	onDownload,
	onShare,
	onViewOrders,
}) => {
	const StatusIcon = statusConfig.icon;
	return (
		<div className="bg-white rounded-2xl shadow-agri-card border border-emerald-100/80 p-5 sm:p-6 mb-5">
			<div className="flex items-center justify-between mb-5 gap-2 flex-wrap">
				<div>
					<h2 className="font-extrabold text-[#161D14]">
						Commande #{order.orderNumber || order._id.slice(-8).toUpperCase()}
					</h2>
					<p className="text-xs sm:text-sm text-gray-500 mt-0.5">
						Passée le {formatDate(order.createdAt)}
					</p>
				</div>
				<span
					className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.color}`}
				>
					<StatusIcon className="h-3.5 w-3.5 mr-1.5" />
					{statusConfig.text}
				</span>
			</div>
			<div className="flex flex-wrap gap-2.5">
				<button
					onClick={onDownload}
					className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-full text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
				>
					<FiDownload className="h-4 w-4 mr-2" />
					Télécharger la facture
				</button>
				<button
					onClick={onShare}
					className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-full text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
				>
					<FiShare2 className="h-4 w-4 mr-2" />
					Partager
				</button>
				<button
					onClick={onViewOrders}
					className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-full text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
				>
					<FiShoppingBag className="h-4 w-4 mr-2" />
					Voir toutes mes commandes
				</button>
			</div>
		</div>
	);
};

export const OrderItemsCard = ({ items }) => {
	const { currency } = useCurrency();
	return (
		<div className="bg-white rounded-2xl shadow-agri-card border border-emerald-100/80 p-5 sm:p-6">
			<h3 className="font-extrabold text-[#161D14] mb-4 flex items-center">
				<span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mr-2.5">
					<FiPackage className="h-4 w-4 text-[#1A5514]" />
				</span>
				Articles commandés
			</h3>
			<div className="space-y-3">
				{items?.map((item, index) => {
					const productSnapshot = item.productSnapshot || {};
					const productName =
						productSnapshot.name || item.name || "Produit inconnu";
					const productImages = productSnapshot.images || [];
					const productPrice =
						productSnapshot.price || item.unitPrice || item.price || 0;
					const quantity = item.quantity || 1;
					const totalPrice = item.totalPrice || productPrice * quantity;

					let imageUrl = null;
					if (productImages.length > 0) {
						const firstImg = productImages[0];
						if (firstImg?.url) imageUrl = firstImg.url;
						else if (
							typeof firstImg === "string" &&
							firstImg.startsWith("http")
						)
							imageUrl = firstImg;
						else if (typeof firstImg === "string") {
							const urlMatch = firstImg.match(/url:\s*['"]([^'"]+)['"]/);
							if (urlMatch?.[1]) imageUrl = urlMatch[1];
						}
					}

					return (
						<div
							key={index}
							className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl"
						>
							<div className="h-14 w-14 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
								{imageUrl ? (
									<img
										src={imageUrl}
										alt={parseProductName(productName)}
										className="h-full w-full object-contain mix-blend-multiply"
										onError={(e) => {
											e.target.style.display = "none";
										}}
									/>
								) : null}
								<FiPackage
									className="h-6 w-6 text-gray-400"
									style={{ display: imageUrl ? "none" : "block" }}
								/>
							</div>
							<div className="flex-1 min-w-0">
								<h4 className="text-sm font-bold text-[#161D14] truncate">
									{parseProductName(productName)}
								</h4>
								<p className="text-xs text-gray-500 mt-0.5">
									Quantité: {quantity}
								</p>
								<p className="text-xs text-gray-500">
									Prix unitaire:{" "}
									{formatPrice(
										convertPrice(
											productPrice,
											item.currency ||
												productSnapshot.currency ||
												DEFAULT_CURRENCY,
											currency
										),
										currency
									)}
								</p>
							</div>
							<div className="text-right">
								<p className="text-sm font-extrabold text-[#1A5514]">
									{formatPrice(
										convertPrice(
											totalPrice,
											item.currency ||
												productSnapshot.currency ||
												DEFAULT_CURRENCY,
											currency
										),
										currency
									)}
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export const OrderSummaryCard = ({ totals }) => {
	const { currency } = useCurrency();


	return (
		<div className="bg-white rounded-2xl shadow-agri-card border border-emerald-100/80 p-5 sm:p-6">
			<h3 className="font-extrabold text-[#161D14] mb-4">
				Résumé de la commande
			</h3>
			<div className="space-y-2.5">
				<Row
					label="Sous-total"
					value={formatPrice(
						convertPrice(totals.subtotal, DEFAULT_CURRENCY, currency),
						currency
					)}
				/>

				{totals.taxes > 0 && (
					<Row
						label="TVA"
						value={formatPrice(
							convertPrice(totals.taxes, DEFAULT_CURRENCY, currency),
							currency
						)}
					/>
				)}
				{totals.discount > 0 && (
					<Row
						label="Réduction"
						value={`-${formatPrice(
							convertPrice(totals.discount, DEFAULT_CURRENCY, currency),
							currency
						)}`}
						className="text-emerald-600"
					/>
				)}
				<div className="border-t border-gray-100 pt-3">
					<div className="flex justify-between items-center">
						<span className="font-extrabold text-[#161D14]">Total</span>
						<span className="font-extrabold text-xl text-[#1A5514]">
							{formatPrice(
								convertPrice(totals.total, DEFAULT_CURRENCY, currency),
								currency
							)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export const DeliveryAddressCard = ({ address }) => (
	<div className="bg-white rounded-2xl shadow-agri-card border border-emerald-100/80 p-5 sm:p-6">
		<h3 className="font-extrabold text-[#161D14] mb-4 flex items-center">
			<span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mr-2.5">
				<FiMapPin className="h-4 w-4 text-[#1A5514]" />
			</span>
			Adresse de livraison
		</h3>
		{address ? (
			<div className="space-y-3">
				<div className="flex items-start gap-3">
					<FiUser className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
					<div>
						<p className="font-bold text-[#161D14] text-sm">
							{address.firstName} {address.lastName}
						</p>
						{address.label && (
							<p className="text-xs text-gray-500">{address.label}</p>
						)}
					</div>
				</div>
				<div className="flex items-start gap-3">
					<FiMapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
					<div className="text-sm text-gray-600">
						<p>{address.street}</p>
						<p>
							{address.city}, {address.region}
						</p>
						<p>
							{address.country} {address.postalCode}
						</p>
					</div>
				</div>
				{address.phone && (
					<div className="flex items-center gap-3">
						<FiPhone className="h-4 w-4 text-gray-400 flex-shrink-0" />
						<p className="text-sm text-gray-600">{address.phone}</p>
					</div>
				)}
				{address.deliveryInstructions && (
					<div className="mt-3 p-3 bg-emerald-50 rounded-xl">
						<p className="text-sm text-emerald-800/80">
							<span className="font-bold text-[#1A5514]">Instructions:</span>
							<br />
							{address.deliveryInstructions}
						</p>
					</div>
				)}
			</div>
		) : (
			<p className="text-sm text-gray-500">Aucune adresse spécifiée</p>
		)}
	</div>
);

export const PaymentInfoCard = ({ payment }) => (
	<div className="bg-white rounded-2xl shadow-agri-card border border-emerald-100/80 p-5 sm:p-6">
		<h3 className="font-extrabold text-[#161D14] mb-4 flex items-center">
			<span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mr-2.5">
				<FiCreditCard className="h-4 w-4 text-[#1A5514]" />
			</span>
			Paiement
		</h3>
		<div className="text-sm text-gray-600 space-y-1">
			<p>
				<span className="font-bold text-[#161D14]">Méthode:</span>{" "}
				{payment?.method === "paypal"
					? "PayPal"
					: payment?.method === "cash"
					? "Paiement à la livraison"
					: payment?.method}
			</p>
			<p>
				<span className="font-bold text-[#161D14]">Statut:</span>{" "}
				{payment?.status === "pending"
					? "En attente"
					: payment?.status === "completed"
					? "Payé"
					: payment?.status === "failed"
					? "Échoué"
					: payment?.status}
			</p>
			{payment?.transactionId && (
				<p>
					<span className="font-bold text-[#161D14]">Transaction:</span>{" "}
					{payment.transactionId}
				</p>
			)}
		</div>
	</div>
);

export const NextStepsCard = () => (
	<div className="mt-5 bg-emerald-50 rounded-2xl border border-emerald-100 p-5 sm:p-6">
		<h3 className="font-extrabold text-[#1A5514] mb-4">
			Prochaines étapes
		</h3>
		<div className="space-y-3 text-sm text-emerald-900/80">
			{[
				"Vous recevrez un email de confirmation avec les détails de votre commande.",
				"Le producteur préparera votre commande et vous informera de l'expédition.",
				"Vous recevrez un numéro de suivi pour suivre votre livraison en temps réel.",
			].map((text, i) => (
				<div key={i} className="flex items-start">
					<div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-r from-[#1A5514] to-[#31BC2E] flex items-center justify-center mr-3 mt-0.5">
						<span className="text-xs font-bold text-white">{i + 1}</span>
					</div>
					<p>{text}</p>
				</div>
			))}
		</div>
	</div>
);

export const ActionButtons = ({ onHome, onViewOrders }) => (
	<div className="mt-6 flex flex-col sm:flex-row gap-3">
		<button
			onClick={onHome}
			className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#1A5514] to-[#31BC2E] shadow-lg shadow-emerald-900/20 hover:shadow-xl transition-all"
		>
			<FiHome className="mr-2 h-5 w-5" />
			Retour à l'accueil
		</button>
		<button
			onClick={onViewOrders}
			className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
		>
			<FiShoppingBag className="mr-2 h-5 w-5" />
			Voir mes commandes
		</button>
	</div>
);

const Row = ({ label, value, className = "" }) => (
	<div className={`flex justify-between text-sm ${className || "text-[#161D14]"}`}>
		<span className="text-gray-500">{label}</span>
		<span className="font-bold">{value}</span>
	</div>
);
