import React from "react";
import { Link } from "react-router-dom";
import { parseProductName } from "../../utils/productUtils";
import {
	FiClock,
	FiTruck,
	FiCheckCircle,
	FiXCircle,
	FiEye,
	FiPackage,
	FiCalendar,
	FiUser,
	FiMapPin,
	FiChevronDown,
	FiChevronUp,
} from "react-icons/fi";
import {
	getStatusConfig,
	getItemStatusConfig,
	formatDate,
	getClientInfo,
} from "./orderListHelpers";

import { useCurrency } from "../../contexts/CurrencyContext";
import { convertPrice, formatPrice } from "../../utils/currencyUtils";

const OrderListItem = ({
	order,
	userType,
	onUpdateStatus,
	updatingOrders,
	isCollapsed,
	toggleCollapse,
}) => {
	const { currency: userCurrency } = useCurrency();
	const isSellerView = ["producer", "transformer", "restaurateur"].includes(
		userType
	);
	const segmentStatus = order.segment?.status || order.status;
	const statusConfig = getStatusConfig(segmentStatus);
	const StatusIcon = statusConfig.icon;
	const clientInfo = getClientInfo(order, userType) || {};
	const hasClientInfo =
		Boolean(clientInfo.name) ||
		Boolean(clientInfo.email) ||
		Boolean(clientInfo.phone);
	const orderItems = isSellerView
		? order.segment?.items || order.items || []
		: order.items || [];
	const displayedSubtotal = isSellerView
		? order.segment?.subtotal ?? order.subtotal ?? 0
		: order.subtotal ?? 0;
	const displayedTotal = isSellerView
		? order.segment?.total ?? displayedSubtotal ?? 0
		: order.total ?? 0;
	const segmentId = order.segment?.id || order.segment?._id;

	// Helper pour formater les prix selon la devise utilisateur
	const formatCurrency = (amount) => {
		const converted = convertPrice(
			amount,
			order.currency || "XOF",
			userCurrency
		);
		return formatPrice(converted, userCurrency);
	};

	return (
		<div className="bg-white rounded-lg shadow">
			{/* Header */}
			<div className="p-6 border-b border-gray-200">
				<div className="flex flex-wrap gap-2 items-center justify-between">
					<div className="flex-1">
						<div className="flex items-center space-x-3">
							<button
								onClick={() => toggleCollapse(order._id)}
								className="p-1 rounded-md hover:bg-gray-100 transition-colors"
							>
								{isCollapsed ? (
									<FiChevronDown className="h-5 w-5 text-gray-400" />
								) : (
									<FiChevronUp className="h-5 w-5 text-gray-400" />
								)}
							</button>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									Commande #
									{order.orderNumber || order._id.slice(-8).toUpperCase()}
								</h3>
								<p className="text-sm text-gray-600">
									{isSellerView ? "Client" : "Vendeur"} •{" "}
									{formatDate(order.createdAt)}
								</p>
							</div>
						</div>
						{isCollapsed && (
							<div className="mt-3 ml-8 flex items-center space-x-4 text-sm text-gray-600">
								<span>
									{orderItems.length} article{orderItems.length > 1 ? "s" : ""}
								</span>
								<span className="font-medium text-gray-900">
									{formatCurrency(displayedTotal)}
								</span>
								<Link
									to={`/${userType}/orders/${order._id}`}
									className="inline-flex items-center text-harvests-green hover:text-harvests-green-dark ml-auto"
								>
									<FiEye className="h-4 w-4 mr-1" />
									<span>Voir</span>
								</Link>
							</div>
						)}
					</div>
					<div className="flex items-center space-x-3 flex-wrap gap-2">
						<span
							className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}
						>
							<StatusIcon className="h-4 w-4 mr-1" />
							{statusConfig.text}
						</span>

						{/* Status update buttons */}
						{(isSellerView ||
							userType === "transporter" ||
							userType === "exporter") &&
							onUpdateStatus && (
								<StatusButtons
									order={order}
									userType={userType}
									segmentStatus={segmentStatus}
									segmentId={segmentId}
									onUpdateStatus={onUpdateStatus}
									updatingOrders={updatingOrders}
									isSellerView={isSellerView}
								/>
							)}
					</div>
				</div>
			</div>

			{/* Content - visible when expanded */}
			{!isCollapsed && (
				<div className="p-6">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Client info */}
						{hasClientInfo && (
							<div className="space-y-3">
								<h4 className="font-medium text-gray-900 flex items-center">
									<FiUser className="h-4 w-4 mr-2" />
									{isSellerView ? "Client" : "Vendeur"}
								</h4>
								<div className="text-sm text-gray-600 space-y-1">
									{clientInfo.name && (
										<p className="font-medium text-gray-900">
											{clientInfo.name}
										</p>
									)}
									{clientInfo.email && <p>{clientInfo.email}</p>}
									{clientInfo.phone && <p>{clientInfo.phone}</p>}
								</div>
							</div>
						)}

						{/* Delivery info */}
						{order.delivery?.deliveryAddress && (
							<div className="space-y-3">
								<h4 className="font-medium text-gray-900 flex items-center">
									<FiMapPin className="h-4 w-4 mr-2" />
									Livraison
								</h4>
								<div className="text-sm text-gray-600">
									<p>{order.delivery.deliveryAddress.street}</p>
									<p>
										{order.delivery.deliveryAddress.city},{" "}
										{order.delivery.deliveryAddress.region}
									</p>
								</div>
							</div>
						)}

						{/* Order summary */}
						<div className="space-y-3">
							<h4 className="font-medium text-gray-900 flex items-center">
								<FiCalendar className="h-4 w-4 mr-2" />
								Résumé
							</h4>
							<div className="text-sm text-gray-600 space-y-1">
								<p>
									{orderItems.length} article{orderItems.length > 1 ? "s" : ""}
								</p>
								<p className="font-semibold text-gray-900">
									{formatCurrency(displayedTotal)}
								</p>
							</div>
						</div>
					</div>

					{/* Items list */}
					<div className="mt-6">
						<h4 className="font-medium text-gray-900 mb-3">Articles</h4>
						<div className="space-y-3">
							{orderItems.slice(0, 3).map((item, index) => {
								const itemStatusConfig = getItemStatusConfig(item.status);
								const productImages =
									item.productSnapshot?.images || item.product?.images || [];
								let imageUrl = null;
								if (productImages.length > 0) {
									const firstImg = productImages[0];
									if (firstImg?.url) imageUrl = firstImg.url;
									else if (
										typeof firstImg === "string" &&
										firstImg.startsWith("http")
									)
										imageUrl = firstImg;
								}

								return (
									<div
										key={item._id || index}
										className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
									>
										<div className="h-12 w-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
											{imageUrl ? (
												<img
													src={imageUrl}
													alt=""
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="h-full w-full flex items-center justify-center">
													<FiPackage className="h-5 w-5 text-gray-400" />
												</div>
											)}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-900 truncate">
												{parseProductName(
													item.productSnapshot?.name || item.product?.name
												)}
											</p>
											<p className="text-xs text-gray-500">
												Qté: {item.quantity} ×{" "}
												{formatCurrency(item.unitPrice || item.price || 0)}
											</p>
										</div>
										<span
											className={`text-xs px-2 py-1 rounded ${itemStatusConfig.color}`}
										>
											{itemStatusConfig.text}
										</span>
									</div>
								);
							})}
							{orderItems.length > 3 && (
								<p className="text-sm text-gray-500 text-center">
									+ {orderItems.length - 3} autre(s) article(s)
								</p>
							)}
						</div>
					</div>

					{/* View details link */}
					<div className="mt-6 flex justify-end">
						<Link
							to={`/${userType}/orders/${order._id}`}
							className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
						>
							<FiEye className="h-4 w-4 mr-2" />
							Voir les détails
						</Link>
					</div>
				</div>
			)}
		</div>
	);
};

const StatusButtons = ({
	order,
	userType,
	segmentStatus,
	segmentId,
	onUpdateStatus,
	updatingOrders,
	isSellerView,
}) => {
	const isUpdating = updatingOrders.has(order._id);

	if (userType === "transporter" || userType === "exporter") {
		return (
			<>
				{segmentStatus === "ready-for-pickup" && (
					<button
						onClick={() => onUpdateStatus(order, "ready-for-pickup", segmentId)}
						disabled={isUpdating}
						className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
					>
						<FiTruck className="h-4 w-4 mr-1" />
						{isUpdating ? "Collecte..." : "Collecter"}
					</button>
				)}
				{order.delivery?.status === "picked-up" &&
					segmentStatus !== "in-transit" &&
					segmentStatus !== "delivered" && (
						<button
							onClick={() => onUpdateStatus(order, "in-transit", segmentId)}
							disabled={isUpdating}
							className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
						>
							<FiTruck className="h-4 w-4 mr-1" />
							{isUpdating ? "En cours..." : "En transit"}
						</button>
					)}
				{segmentStatus === "in-transit" && (
					<button
						onClick={() => onUpdateStatus(order, "delivered", segmentId)}
						disabled={isUpdating}
						className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
					>
						<FiCheckCircle className="h-4 w-4 mr-1" />
						{isUpdating ? "Livraison..." : "Livrer"}
					</button>
				)}
			</>
		);
	}

	if (isSellerView) {
		return (
			<>
				{segmentStatus === "pending" && (
					<button
						onClick={() => onUpdateStatus(order, "cancelled", segmentId)}
						disabled={isUpdating}
						className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light disabled:opacity-50"
					>
						<FiXCircle className="h-4 w-4 mr-1" />
						Annuler
					</button>
				)}
				{segmentStatus === "confirmed" && (
					<button
						onClick={() => onUpdateStatus(order, "preparing", segmentId)}
						disabled={isUpdating}
						className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
					>
						<FiTruck className="h-4 w-4 mr-1" />
						{isUpdating ? "Préparation..." : "Préparer"}
					</button>
				)}
				{segmentStatus === "preparing" && (
					<button
						onClick={() => onUpdateStatus(order, "ready-for-pickup", segmentId)}
						disabled={isUpdating}
						className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
					>
						<FiTruck className="h-4 w-4 mr-1" />
						{isUpdating ? "Préparation..." : "Prête"}
					</button>
				)}
			</>
		);
	}

	return null;
};

export default OrderListItem;
