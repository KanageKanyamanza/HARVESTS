import React from "react";
import {
	Package,
	User,
	MapPin,
	Phone,
	Mail,
	CreditCard,
	Truck,
	Clock,
	CheckCircle,
	XCircle,
	AlertTriangle,
	FileText,
	Calendar,
} from "lucide-react";
import CloudinaryImage from "../common/CloudinaryImage";
import { parseProductName } from "../../utils/productUtils";

export const getStatusConfig = (status) => {
	const configs = {
		pending: {
			color: "text-yellow-600 bg-yellow-100",
			text: "En attente",
			icon: Clock,
		},
		confirmed: {
			color: "text-blue-600 bg-blue-100",
			text: "Confirmée",
			icon: CheckCircle,
		},
		preparing: {
			color: "text-purple-600 bg-purple-100",
			text: "En préparation",
			icon: Package,
		},
		processing: {
			color: "text-purple-600 bg-purple-100",
			text: "En cours",
			icon: Package,
		},
		"ready-for-pickup": {
			color: "text-indigo-600 bg-indigo-100",
			text: "Prête à collecter",
			icon: Package,
		},
		"in-transit": {
			color: "text-indigo-600 bg-indigo-100",
			text: "En transit",
			icon: Truck,
		},
		shipped: {
			color: "text-indigo-600 bg-indigo-100",
			text: "Expédiée",
			icon: Truck,
		},
		delivered: {
			color: "text-green-600 bg-green-100",
			text: "Livrée",
			icon: CheckCircle,
		},
		completed: {
			color: "text-green-600 bg-green-100",
			text: "Terminée",
			icon: CheckCircle,
		},
		cancelled: {
			color: "text-red-600 bg-red-100",
			text: "Annulée",
			icon: XCircle,
		},
		disputed: {
			color: "text-orange-600 bg-orange-100",
			text: "En litige",
			icon: AlertTriangle,
		},
	};
	return configs[status] || configs["pending"];
};

export const getPaymentStatusConfig = (status) => {
	const configs = {
		pending: { color: "text-yellow-600 bg-yellow-100", text: "En attente" },
		completed: { color: "text-green-600 bg-green-100", text: "Payé" },
		paid: { color: "text-green-600 bg-green-100", text: "Payé" },
		failed: { color: "text-red-600 bg-red-100", text: "Échoué" },
		refunded: { color: "text-gray-600 bg-gray-100", text: "Remboursé" },
	};
	return configs[status] || configs["pending"];
};

export const formatDate = (date) =>
	new Date(date).toLocaleDateString("fr-FR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
export const formatPrice = (price) =>
	new Intl.NumberFormat("fr-FR", {
		style: "currency",
		currency: "XOF",
		minimumFractionDigits: 0,
	}).format(price);

export const OrderSegment = ({ segment, index }) => {
	const segmentStatusConfig = getStatusConfig(segment.status);
	const SegmentStatusIcon = segmentStatusConfig.icon;

	return (
		<div className="border border-gray-200 rounded-lg overflow-hidden">
			<div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<Package className="h-5 w-5 text-gray-500" />
					<div>
						<p className="font-medium text-gray-900">
							{segment.seller?.name ||
								`${segment.seller?.firstName || ""} ${
									segment.seller?.lastName || ""
								}`.trim() ||
								"Vendeur"}
						</p>
						<p className="text-xs text-gray-500">
							{segment.seller?.userType === "producer" && "Producteur"}
							{segment.seller?.userType === "transformer" && "Transformateur"}
							{segment.seller?.userType === "restaurateur" && "Restaurateur"}
						</p>
					</div>
				</div>
				<span
					className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${segmentStatusConfig.color}`}
				>
					<SegmentStatusIcon className="h-4 w-4 mr-1" />
					{segmentStatusConfig.text}
				</span>
			</div>

			<div className="divide-y divide-gray-100">
				{segment.items?.map((item, i) => (
					<OrderItemRow key={item._id || i} item={item} />
				))}
			</div>

			<div className="bg-gray-50 px-4 py-2 flex justify-between text-sm">
				<span className="text-gray-600">Sous-total vendeur</span>
				<span className="font-medium text-gray-900">
					{formatPrice(segment.subtotal || segment.total || 0)}
				</span>
			</div>
		</div>
	);
};

export const OrderItemRow = ({ item }) => {
	const itemStatusConfig = getStatusConfig(item.status);
	const productImages =
		item.productSnapshot?.images || item.product?.images || [];
	let imageUrl = null;

	if (productImages.length > 0) {
		const firstImg = productImages[0];
		if (firstImg?.url) imageUrl = firstImg.url;
		else if (typeof firstImg === "string" && firstImg.startsWith("http"))
			imageUrl = firstImg;
	}

	return (
		<div className="flex items-center p-4 space-x-4">
			<div className="flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
				{imageUrl ? (
					<CloudinaryImage
						src={imageUrl}
						alt={parseProductName(
							item.productSnapshot?.name || item.product?.name
						)}
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="h-full w-full flex items-center justify-center">
						<Package className="h-6 w-6 text-gray-400" />
					</div>
				)}
			</div>
			<div className="flex-1 min-w-0">
				<p className="font-medium text-gray-900">
					{parseProductName(item.productSnapshot?.name || item.product?.name)}
				</p>
				<p className="text-sm text-gray-500">
					Quantité: {item.quantity} • Prix unitaire: {formatPrice(item.price)}
				</p>
			</div>
			<div className="flex-shrink-0 text-right">
				<p className="font-semibold text-gray-900">
					{formatPrice(item.price * item.quantity)}
				</p>
				<span
					className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${itemStatusConfig.color}`}
				>
					{itemStatusConfig.text}
				</span>
			</div>
		</div>
	);
};

export const BuyerInfoCard = ({ buyer }) => (
	<div className="bg-white rounded-lg shadow p-6">
		<h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
			<User className="h-5 w-5 mr-2" />
			Informations client
		</h3>
		<div className="space-y-3">
			<div className="flex items-center space-x-3">
				<User className="h-4 w-4 text-gray-400" />
				<span className="text-gray-900">
					{buyer?.firstName} {buyer?.lastName}
				</span>
			</div>
			{buyer?.email && (
				<div className="flex items-center space-x-3">
					<Mail className="h-4 w-4 text-gray-400" />
					<span className="text-gray-900">{buyer.email}</span>
				</div>
			)}
			{buyer?.phone && (
				<div className="flex items-center space-x-3">
					<Phone className="h-4 w-4 text-gray-400" />
					<span className="text-gray-900">{buyer.phone}</span>
				</div>
			)}
		</div>
	</div>
);

export const DeliveryInfoCard = ({ delivery }) => (
	<div className="bg-white rounded-lg shadow p-6">
		<h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
			<MapPin className="h-5 w-5 mr-2" />
			Livraison
		</h3>
		{delivery?.deliveryAddress ? (
			<div className="space-y-2 text-sm">
				<p className="font-medium">
					{delivery.deliveryAddress.firstName}{" "}
					{delivery.deliveryAddress.lastName}
				</p>
				<p>{delivery.deliveryAddress.street}</p>
				<p>
					{delivery.deliveryAddress.city}, {delivery.deliveryAddress.region}
				</p>
				<p>
					{delivery.deliveryAddress.country}{" "}
					{delivery.deliveryAddress.postalCode}
				</p>
				{delivery.deliveryAddress.phone && (
					<p className="flex items-center">
						<Phone className="h-4 w-4 mr-2 text-gray-400" />
						{delivery.deliveryAddress.phone}
					</p>
				)}
			</div>
		) : (
			<p className="text-gray-500 text-sm">Aucune adresse</p>
		)}
	</div>
);

export const PaymentInfoCard = ({ payment, order }) => {
	const paymentStatusConfig = getPaymentStatusConfig(
		payment?.status || order?.paymentStatus
	);
	return (
		<div className="bg-white rounded-lg shadow p-6">
			<h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
				<CreditCard className="h-5 w-5 mr-2" />
				Paiement
			</h3>
			<div className="space-y-3 text-sm">
				<div className="flex justify-between">
					<span className="text-gray-500">Méthode</span>
					<span className="font-medium">
						{payment?.method === "paypal"
							? "PayPal"
							: payment?.method === "cash"
							? "Espèces"
							: payment?.method || "N/A"}
					</span>
				</div>
				<div className="flex justify-between">
					<span className="text-gray-500">Statut</span>
					<span
						className={`px-2 py-1 rounded text-xs font-medium ${paymentStatusConfig.color}`}
					>
						{paymentStatusConfig.text}
					</span>
				</div>
				{payment?.paidAt && (
					<div className="flex justify-between">
						<span className="text-gray-500">Payé le</span>
						<span>{formatDate(payment.paidAt)}</span>
					</div>
				)}
			</div>
		</div>
	);
};

export const OrderTotalsCard = ({ order }) => (
	<div className="bg-white rounded-lg shadow p-6">
		<h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
			<FileText className="h-5 w-5 mr-2" />
			Résumé
		</h3>
		<div className="space-y-2 text-sm">
			<div className="flex justify-between">
				<span className="text-gray-500">Sous-total</span>
				<span>{formatPrice(order?.subtotal || 0)}</span>
			</div>
			<div className="flex justify-between">
				<span className="text-gray-500">Livraison</span>
				<span>
					{formatPrice(order?.deliveryFee || order?.delivery?.deliveryFee || 0)}
				</span>
			</div>
			{(order?.discount || order?.couponDiscount) > 0 && (
				<div className="flex justify-between text-green-600">
					<span>Réduction</span>
					<span>
						-{formatPrice(order?.discount || order?.couponDiscount || 0)}
					</span>
				</div>
			)}
			<div className="border-t pt-2 flex justify-between font-semibold text-lg">
				<span>Total</span>
				<span>{formatPrice(order?.total || 0)}</span>
			</div>
		</div>
	</div>
);

export const OrderActionsCard = ({
	order,
	updating,
	onUpdateStatus,
	onCancelOrder,
	onConfirmPayment,
}) => {
	const canConfirmPayment =
		order?.payment?.method === "cash" &&
		order?.payment?.status !== "completed" &&
		order?.payment?.status !== "paid";

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
			<div className="space-y-3">
				{order?.status === "pending" && (
					<button
						onClick={() => onUpdateStatus("confirmed")}
						disabled={updating}
						className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
					>
						{updating ? "Mise à jour..." : "Confirmer la commande"}
					</button>
				)}
				{order?.status === "confirmed" && (
					<button
						onClick={() => onUpdateStatus("preparing")}
						disabled={updating}
						className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
					>
						{updating ? "Mise à jour..." : "Marquer en préparation"}
					</button>
				)}
				{order?.status === "preparing" && (
					<button
						onClick={() => onUpdateStatus("ready-for-pickup")}
						disabled={updating}
						className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
					>
						{updating ? "Mise à jour..." : "Prête pour collecte"}
					</button>
				)}
				{order?.status === "in-transit" && (
					<button
						onClick={() => onUpdateStatus("delivered")}
						disabled={updating}
						className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
					>
						{updating ? "Mise à jour..." : "Marquer livrée"}
					</button>
				)}
				{canConfirmPayment && (
					<button
						onClick={onConfirmPayment}
						disabled={updating}
						className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
					>
						{updating ? "Mise à jour..." : "Confirmer paiement"}
					</button>
				)}
				{!["cancelled", "completed", "delivered"].includes(order?.status) && (
					<button
						onClick={onCancelOrder}
						disabled={updating}
						className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
					>
						{updating ? "Annulation..." : "Annuler la commande"}
					</button>
				)}
			</div>
		</div>
	);
};
