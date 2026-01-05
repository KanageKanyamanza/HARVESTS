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

export const getStatusConfig = (status) => {
	const configs = {
		pending: {
			color: "text-yellow-600 bg-yellow-100",
			text: "En attente",
			icon: FiClock,
		},
		confirmed: {
			color: "text-blue-600 bg-blue-100",
			text: "Confirmée",
			icon: FiCheckCircle,
		},
		processing: {
			color: "text-purple-600 bg-purple-100",
			text: "En préparation",
			icon: FiPackage,
		},
		shipped: {
			color: "text-indigo-600 bg-indigo-100",
			text: "Expédiée",
			icon: FiTruck,
		},
		delivered: {
			color: "text-green-600 bg-green-100",
			text: "Livrée",
			icon: FiCheckCircle,
		},
		cancelled: {
			color: "text-red-600 bg-red-100",
			text: "Annulée",
			icon: FiClock,
		},
	};
	return configs[status] || configs["pending"];
};

export const formatDate = (dateString) =>
	new Date(dateString).toLocaleDateString("fr-FR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

export const SuccessHeader = () => (
	<div className="text-center mb-8">
		<div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
			<FiCheckCircle className="h-8 w-8 text-green-600" />
		</div>
		<h1 className="text-2xl font-bold text-gray-900 mb-2">
			Commande confirmée !
		</h1>
		<p className="text-gray-600">
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
		<div className="bg-white rounded-lg shadow p-6 mb-6">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h2 className="text-lg font-semibold text-gray-900">
						Commande #{order.orderNumber || order._id.slice(-8).toUpperCase()}
					</h2>
					<p className="text-sm text-gray-600">
						Passée le {formatDate(order.createdAt)}
					</p>
				</div>
				<span
					className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}
				>
					<StatusIcon className="h-4 w-4 mr-1" />
					{statusConfig.text}
				</span>
			</div>
			<div className="flex flex-wrap gap-3">
				<button
					onClick={onDownload}
					className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
				>
					<FiDownload className="h-4 w-4 mr-2" />
					Télécharger la facture
				</button>
				<button
					onClick={onShare}
					className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
				>
					<FiShare2 className="h-4 w-4 mr-2" />
					Partager
				</button>
				<button
					onClick={onViewOrders}
					className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
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
		<div className="bg-white rounded-lg shadow p-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				Articles commandés
			</h3>
			<div className="space-y-4">
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
							className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
						>
							<div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
								{imageUrl ? (
									<img
										src={imageUrl}
										alt={parseProductName(productName)}
										className="h-full w-full object-cover"
										onError={(e) => {
											e.target.style.display = "none";
										}}
									/>
								) : null}
								<FiPackage
									className="h-8 w-8 text-gray-400"
									style={{ display: imageUrl ? "none" : "block" }}
								/>
							</div>
							<div className="flex-1 min-w-0">
								<h4 className="text-sm font-medium text-gray-900">
									{parseProductName(productName)}
								</h4>
								<p className="text-sm text-gray-500 mt-1">
									Quantité: {quantity}
								</p>
								<p className="text-sm text-gray-500">
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
								<p className="text-sm font-medium text-gray-900">
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

export const OrderSummaryCard = ({
	totals,
	deliveryDetail,
	deliveryMethod,
}) => {
	const { currency } = useCurrency();
	const deliveryMethodLabels = {
		pickup: "retrait sur place",
		"standard-delivery": "livraison standard",
		"express-delivery": "livraison express",
		"same-day": "livraison jour même",
		scheduled: "livraison programmée",
	};

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				Résumé de la commande
			</h3>
			<div className="space-y-3">
				<Row
					label="Sous-total"
					value={formatPrice(
						convertPrice(totals.subtotal, DEFAULT_CURRENCY, currency),
						currency
					)}
				/>
				<Row
					label="Frais de livraison"
					value={formatPrice(
						convertPrice(totals.deliveryFee, DEFAULT_CURRENCY, currency),
						currency
					)}
				/>
				{totals.deliveryFee > 0 &&
					(deliveryDetail?.reason || deliveryMethod) && (
						<p className="text-xs text-gray-500 text-right">
							{deliveryDetail?.reason ||
								`Forfait ${
									deliveryMethodLabels[deliveryMethod] || deliveryMethod
								}`}
						</p>
					)}
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
						className="text-green-600"
					/>
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
			</div>
		</div>
	);
};

export const DeliveryAddressCard = ({ address }) => (
	<div className="bg-white rounded-lg shadow p-6">
		<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
			<FiMapPin className="h-5 w-5 mr-2" />
			Adresse de livraison
		</h3>
		{address ? (
			<div className="space-y-3">
				<div className="flex items-start space-x-3">
					<FiUser className="h-5 w-5 text-gray-400 mt-1" />
					<div>
						<p className="font-medium text-gray-900">
							{address.firstName} {address.lastName}
						</p>
						{address.label && (
							<p className="text-sm text-gray-500">{address.label}</p>
						)}
					</div>
				</div>
				<div className="flex items-start space-x-3">
					<FiMapPin className="h-5 w-5 text-gray-400 mt-1" />
					<div>
						<p className="text-gray-900">{address.street}</p>
						<p className="text-gray-900">
							{address.city}, {address.region}
						</p>
						<p className="text-gray-900">
							{address.country} {address.postalCode}
						</p>
					</div>
				</div>
				{address.phone && (
					<div className="flex items-center space-x-3">
						<FiPhone className="h-5 w-5 text-gray-400" />
						<p className="text-gray-900">{address.phone}</p>
					</div>
				)}
				{address.deliveryInstructions && (
					<div className="mt-3 p-3 bg-harvests-light rounded-md">
						<p className="text-sm text-gray-600">
							<span className="font-medium">Instructions:</span>
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
	<div className="bg-white rounded-lg shadow p-6">
		<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
			<FiCreditCard className="h-5 w-5 mr-2" />
			Paiement
		</h3>
		<div className="text-sm text-gray-600">
			<p>
				<span className="font-medium">Méthode:</span>{" "}
				{payment?.method === "paypal"
					? "PayPal"
					: payment?.method === "cash"
					? "Paiement à la livraison"
					: payment?.method}
			</p>
			<p>
				<span className="font-medium">Statut:</span>{" "}
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
					<span className="font-medium">Transaction:</span>{" "}
					{payment.transactionId}
				</p>
			)}
		</div>
	</div>
);

export const NextStepsCard = () => (
	<div className="mt-8 bg-blue-50 rounded-lg p-6">
		<h3 className="text-lg font-semibold text-blue-900 mb-4">
			Prochaines étapes
		</h3>
		<div className="space-y-3 text-sm text-blue-800">
			{[
				"Vous recevrez un email de confirmation avec les détails de votre commande.",
				"Le producteur préparera votre commande et vous informera de l'expédition.",
				"Vous recevrez un numéro de suivi pour suivre votre livraison en temps réel.",
			].map((text, i) => (
				<div key={i} className="flex items-start">
					<div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center mr-3 mt-0.5">
						<span className="text-xs font-medium">{i + 1}</span>
					</div>
					<p>{text}</p>
				</div>
			))}
		</div>
	</div>
);

export const ActionButtons = ({ onHome, onViewOrders }) => (
	<div className="mt-8 flex flex-col sm:flex-row gap-4">
		<button
			onClick={onHome}
			className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
		>
			<FiHome className="mr-2 h-5 w-5" />
			Retour à l'accueil
		</button>
		<button
			onClick={onViewOrders}
			className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light"
		>
			<FiShoppingBag className="mr-2 h-5 w-5" />
			Voir mes commandes
		</button>
	</div>
);

const Row = ({ label, value, className = "" }) => (
	<div className={`flex justify-between text-sm ${className}`}>
		<span className="text-gray-600">{label}</span>
		<span className="font-medium">{value}</span>
	</div>
);
