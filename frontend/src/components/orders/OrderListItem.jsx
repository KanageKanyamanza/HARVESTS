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
	FiCreditCard,
	FiActivity,
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
		userType,
	);
	const segmentStatus = order.segment?.status || order.status;
	const statusConfig = getStatusConfig(segmentStatus);
	const StatusIcon = statusConfig.icon;
	const clientInfo = getClientInfo(order, userType) || {};
	const hasClientInfo =
		Boolean(clientInfo.name) ||
		Boolean(clientInfo.email) ||
		Boolean(clientInfo.phone);
	const orderItems =
		isSellerView ?
			order.segment?.items || order.items || []
		:	order.items || [];
	const displayedSubtotal =
		isSellerView ?
			(order.segment?.subtotal ?? order.subtotal ?? 0)
		:	(order.subtotal ?? 0);
	const displayedTotal =
		isSellerView ?
			(order.segment?.total ?? displayedSubtotal ?? 0)
		:	(order.total ?? 0);
	const segmentId = order.segment?.id || order.segment?._id;

	const formatCurrency = (amount) => {
		const converted = convertPrice(
			amount,
			order.currency || "XOF",
			userCurrency,
		);
		return formatPrice(converted, userCurrency);
	};

	return (
		<div
			className={`group bg-white/70 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] transition-all duration-500 overflow-hidden ${!isCollapsed ? "shadow-lg border-emerald-100/50" : ""}`}
		>
			{/* Main Header / Summary Row */}
			<div className="p-5 md:p-6">
				<div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
					{/* ID & Date */}
					<div className="flex flex-1 items-center gap-4">
						<button
							onClick={() => toggleCollapse(order._id)}
							className={`p-2 rounded-xl transition-all duration-300 ${isCollapsed ? "bg-gray-50 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500" : "bg-emerald-600 text-white shadow-lg shadow-emerald-200"}`}
						>
							{isCollapsed ?
								<FiChevronDown className="h-5 w-5" />
							:	<FiChevronUp className="h-5 w-5" />}
						</button>
						<div className="">
							<div className="flex items-center gap-2 mb-0.5">
								<span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
									Commande
								</span>
								<span className="text-gray-900 font-[1000] text-lg tracking-tight">
									#{order.orderNumber || order._id.slice(-8).toUpperCase()}
								</span>
							</div>
							<div className="flex items-center gap-3 text-[11px] font-bold text-gray-400">
								<span className="flex items-center gap-1">
									<FiCalendar className="w-3 h-3" />{" "}
									{formatDate(order.createdAt)}
								</span>
								<span className="w-1 h-1 bg-gray-300 rounded-full"></span>
								<span className="flex items-center gap-1 text-gray-500">
									<FiUser className="w-3 h-3" /> {clientInfo.name || "Client"}
								</span>
							</div>
						</div>
					</div>

					{/* Stats & Status */}
					<div className="flex flex-wrap items-center gap-3 md:gap-6 w-full md:w-auto">
						<div className="hidden sm:flex flex-col items-end">
							<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
								Montant Total
							</span>
							<span className="text-gray-900 font-black text-lg -mt-1 tracking-tight">
								{formatCurrency(displayedTotal)}
							</span>
						</div>

						<div className="flex items-center gap-3 ml-auto md:ml-0">
							<span
								className={`inline-flex items-center px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-colors ${statusConfig.color} shadow-sm backdrop-blur-sm`}
							>
								<StatusIcon className="h-3.5 w-3.5 mr-2" />
								{statusConfig.text}
							</span>

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
			</div>

			{/* Expandable Content */}
			{!isCollapsed && (
				<div className="px-5 md:px-6 pb-6 animate-fade-in-up">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
						{/* Info Sections */}
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
									<FiUser className="w-4 h-4" />
								</div>
								<div>
									<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
										Coordonnées du client
									</p>
									<h4 className="font-black text-gray-900 mt-1">
										{clientInfo.name || "N/A"}
									</h4>
								</div>
							</div>
							<div className="pl-12 text-xs font-bold text-gray-500 space-y-1">
								{clientInfo.email && (
									<p className="truncate">{clientInfo.email}</p>
								)}
								{clientInfo.phone && <p>{clientInfo.phone}</p>}
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
									<FiMapPin className="w-4 h-4" />
								</div>
								<div>
									<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
										Adresse de livraison
									</p>
									<h4 className="font-black text-gray-900 mt-1">
										{order.delivery?.deliveryAddress?.city || "N/A"}
									</h4>
								</div>
							</div>
							<div className="pl-12 text-xs font-bold text-gray-500 space-y-1">
								{order.delivery?.deliveryAddress && (
									<>
										<p>{order.delivery.deliveryAddress.street}</p>
										<p>{order.delivery.deliveryAddress.region}</p>
									</>
								)}
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
									<FiActivity className="w-4 h-4" />
								</div>
								<div>
									<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
										Résumé de commande
									</p>
									<h4 className="font-black text-gray-900 mt-1">
										{orderItems.length} article
										{orderItems.length > 1 ? "s" : ""}
									</h4>
								</div>
							</div>
							<div className="pl-12 text-xs font-bold text-gray-500">
								<p className="mb-2">
									Total partiel: {formatCurrency(displayedSubtotal)}
								</p>
								<Link
									to={`/${userType}/orders/${order._id}`}
									className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-wider text-gray-900 bg-white hover:bg-emerald-50 hover:text-emerald-700 transition-colors shadow-sm"
								>
									<FiEye className="h-3.5 w-3.5 mr-2" />
									Voir Détails
								</Link>
							</div>
						</div>
					</div>

					{/* Articles List Table Effect */}
					<div className="mt-8">
						<div className="flex items-center gap-2 mb-4">
							<div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
							<h4 className="text-[11px] font-[1000] text-gray-900 uppercase tracking-widest">
								Articles de la commande
							</h4>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
										className="group/item flex items-center gap-3 p-3 bg-white/40 border border-gray-100/50 rounded-2xl hover:bg-white transition-colors"
									>
										<div className="h-14 w-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 group-hover/item:border-emerald-100 transition-colors shadow-sm">
											{imageUrl ?
												<img
													src={imageUrl}
													alt=""
													className="h-full w-full object-cover shadow-inner"
												/>
											:	<div className="h-full w-full flex items-center justify-center">
													<FiPackage className="h-6 w-6 text-gray-300" />
												</div>
											}
										</div>
										<div className="flex-1 min-w-0">
											<p
												className="text-xs font-black text-gray-900 truncate leading-tight mb-1"
												title={parseProductName(
													item.productSnapshot?.name || item.product?.name,
												)}
											>
												{parseProductName(
													item.productSnapshot?.name || item.product?.name,
												)}
											</p>
											<div className="flex items-center gap-2">
												<span className="text-[10px] font-bold text-gray-400">
													×{item.quantity}
												</span>
												<span className="text-[10px] font-[1000] text-gray-900">
													{formatCurrency(item.unitPrice || item.price || 0)}
												</span>
											</div>
										</div>
										<span
											className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${itemStatusConfig.color}`}
										>
											{itemStatusConfig.text}
										</span>
									</div>
								);
							})}
							{orderItems.length > 3 && (
								<Link
									to={`/${userType}/orders/${order._id}`}
									className="flex items-center justify-center p-3 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-emerald-300 hover:text-emerald-700 transition-all"
								>
									+ {orderItems.length - 3} autres ...
								</Link>
							)}
						</div>
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
						className="inline-flex items-center px-4 py-2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-600 transition-all hover:scale-105 shadow-md shadow-amber-100 disabled:opacity-50"
					>
						<FiTruck className="h-3.5 w-3.5 mr-2" />
						{isUpdating ? "Collecte..." : "Collecter"}
					</button>
				)}
				{order.delivery?.status === "picked-up" &&
					segmentStatus !== "in-transit" &&
					segmentStatus !== "delivered" && (
						<button
							onClick={() => onUpdateStatus(order, "in-transit", segmentId)}
							disabled={isUpdating}
							className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all hover:scale-105 shadow-md shadow-blue-100 disabled:opacity-50"
						>
							<FiTruck className="h-3.5 w-3.5 mr-2" />
							{isUpdating ? "En cours..." : "En transit"}
						</button>
					)}
				{segmentStatus === "in-transit" && (
					<button
						onClick={() => onUpdateStatus(order, "delivered", segmentId)}
						disabled={isUpdating}
						className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all hover:scale-105 shadow-md shadow-emerald-100 disabled:opacity-50"
					>
						<FiCheckCircle className="h-3.5 w-3.5 mr-2" />
						{isUpdating ? "Livraison..." : "Livrer"}
					</button>
				)}
			</>
		);
	}

	if (isSellerView) {
		return (
			<div className="flex gap-2">
				{segmentStatus === "pending" && (
					<button
						onClick={() => onUpdateStatus(order, "cancelled", segmentId)}
						disabled={isUpdating}
						className="inline-flex items-center px-4 py-2 bg-white border border-rose-200 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-all disabled:opacity-50 shadow-sm"
					>
						<FiXCircle className="h-3.5 w-3.5 mr-2" />
						Annuler
					</button>
				)}
				{segmentStatus === "confirmed" && (
					<button
						onClick={() => onUpdateStatus(order, "preparing", segmentId)}
						disabled={isUpdating}
						className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all hover:scale-105 shadow-md shadow-blue-100 disabled:opacity-50"
					>
						<FiClock className="h-3.5 w-3.5 mr-2" />
						{isUpdating ? "Chargement..." : "Préparer"}
					</button>
				)}
				{segmentStatus === "preparing" && (
					<button
						onClick={() => onUpdateStatus(order, "ready-for-pickup", segmentId)}
						disabled={isUpdating}
						className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all hover:scale-105 shadow-md shadow-emerald-100 disabled:opacity-50"
					>
						<FiCheckCircle className="h-3.5 w-3.5 mr-2" />
						{isUpdating ? "Chargement..." : "Prête"}
					</button>
				)}
			</div>
		);
	}

	return null;
};

export default OrderListItem;
