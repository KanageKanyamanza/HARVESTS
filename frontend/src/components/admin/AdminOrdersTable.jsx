import React from "react";
import { Link } from "react-router-dom";
import {
	Eye,
	Truck,
	CreditCard,
	Clock,
	CheckCircle,
	X,
	AlertTriangle,
	Package,
	User,
	ChevronRight,
} from "lucide-react";
import { parseProductName } from "../../utils/productUtils";
import CloudinaryImage from "../common/CloudinaryImage";

export const getStatusColor = (status) => {
	const colors = {
		pending: "text-amber-600 bg-amber-50 border-amber-100",
		confirmed: "text-blue-600 bg-blue-50 border-blue-100",
		processing: "text-purple-600 bg-purple-50 border-purple-100",
		shipped: "text-sky-600 bg-sky-50 border-sky-100",
		delivered: "text-emerald-600 bg-emerald-50 border-emerald-100",
		cancelled: "text-rose-600 bg-rose-50 border-rose-100",
		disputed: "text-orange-600 bg-orange-50 border-orange-100",
		completed: "text-emerald-600 bg-emerald-50 border-emerald-100",
	};
	return colors[status] || "text-gray-600 bg-gray-50 border-gray-100";
};

export const getStatusText = (status) => {
	const statusMap = {
		pending: "En attente",
		confirmed: "Confirmée",
		processing: "En cours",
		preparing: "En préparation",
		shipped: "Expédiée",
		delivered: "Livrée",
		cancelled: "Annulée",
		disputed: "En litige",
		completed: "Terminée",
	};
	return statusMap[status] || status;
};

export const getPaymentStatusColor = (status) => {
	const colors = {
		pending: "text-amber-600 bg-amber-50 border-amber-100",
		paid: "text-emerald-600 bg-emerald-50 border-emerald-100",
		completed: "text-emerald-600 bg-emerald-50 border-emerald-100",
		failed: "text-rose-600 bg-rose-50 border-rose-100",
		refunded: "text-orange-600 bg-orange-50 border-orange-100",
	};
	return colors[status] || "text-gray-600 bg-gray-50 border-gray-100";
};

export const getPaymentStatusText = (status) => {
	const statusMap = {
		pending: "En attente",
		paid: "Payé",
		completed: "Payé",
		failed: "Échoué",
		refunded: "Remboursé",
	};
	return statusMap[status] || status;
};

export const formatDate = (date) =>
	new Date(date).toLocaleDateString("fr-FR", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
export const formatPrice = (price, currency = "XOF") =>
	new Intl.NumberFormat("fr-FR", {
		style: "currency",
		currency: currency,
		minimumFractionDigits: 0,
	}).format(price);

const AdminOrdersTable = ({
	orders,
	onConfirmPayment,
	onOpenAssignModal,
	confirmingPayment,
}) => {
	if (!orders.length) {
		return (
			<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] p-10 text-center border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
				<div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
					<Package className="h-8 w-8 text-gray-200" />
				</div>
				<h3 className="text-xl font-[1000] text-gray-900 tracking-tight">
					Aucune commande trouvée
				</h3>
				<p className="text-xs text-gray-500 mt-1.5">
					Ajustez vos filtres pour voir plus de résultats
				</p>
			</div>
		);
	}

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-[1rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
			<div className="overflow-x-auto overflow-y-hidden">
				<table className="min-w-full divide-y divide-gray-200/50 border-collapse">
					<thead>
						<tr className="bg-gray-50/80 backdrop-blur-sm">
							<th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
								Commande
							</th>
							<th className="px-5 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
								Client
							</th>
							<th className="px-5 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
								Articles
							</th>
							<th className="px-5 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
								Total
							</th>
							<th className="px-5 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
								Statuts
							</th>
							<th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100/50">
						{orders.map((order) => (
							<OrderRow
								key={order._id}
								order={order}
								onConfirmPayment={onConfirmPayment}
								onOpenAssignModal={onOpenAssignModal}
								confirmingPayment={confirmingPayment}
							/>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

const OrderRow = ({
	order,
	onConfirmPayment,
	onOpenAssignModal,
	confirmingPayment,
}) => {
	const canConfirmPayment =
		order.payment?.method === "cash" &&
		order.payment?.status !== "completed" &&
		order.payment?.status !== "paid";
	const needsTransporter =
		order.delivery?.method !== "pickup" &&
		!order.delivery?.transporter &&
		["confirmed", "preparing", "ready-for-pickup"].includes(order.status);

	return (
		<tr className="group hover:bg-emerald-50/30 transition-all duration-300">
			<td className="px-6 py-5 whitespace-nowrap">
				<div className="text-sm font-[1000] text-gray-900 tracking-tighter mb-1 transition-colors">
					#{order.orderNumber || order._id.slice(-8).toUpperCase()}
				</div>
				<div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
					<Clock className="h-3 w-3 text-emerald-500" />
					{formatDate(order.createdAt)}
				</div>
			</td>
			<td className="px-5 py-5 whitespace-nowrap">
				<div className="flex items-center gap-3.5">
					<div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-gray-300 border border-gray-100 shadow-sm transition-all group-hover:border-emerald-200 overflow-hidden">
						{order.buyer?.avatar ?
							<CloudinaryImage
								src={order.buyer.avatar}
								className="h-full w-full object-cover"
							/>
						:	<User className="h-5 w-5" />}
					</div>
					<div>
						<div className="text-xs font-black text-gray-900 leading-none mb-1 group-hover:text-emerald-700">
							{order.buyer?.firstName} {order.buyer?.lastName}
						</div>
						<div className="text-[9px] font-bold text-gray-400">
							{order.buyer?.email}
						</div>
					</div>
				</div>
			</td>
			<td className="px-5 py-5">
				<div className="flex items-center gap-2 mb-1">
					<div className="w-5 h-5 bg-gray-900 text-white rounded-lg flex items-center justify-center text-[9px] font-black shadow-lg">
						{order.items?.length || 0}
					</div>
					<div className="text-[11px] font-[1000] text-gray-900 tracking-tight uppercase">
						Articles
					</div>
				</div>
				<div className="text-[9px] font-bold text-gray-400 truncate max-w-[150px] uppercase tracking-wide">
					{order.items
						?.slice(0, 2)
						.map((i) =>
							parseProductName(i.productSnapshot?.name || i.product?.name),
						)
						.join(", ")}
					{order.items?.length > 2 && "..."}
				</div>
			</td>
			<td className="px-5 py-5 whitespace-nowrap">
				<div className="text-lg font-[1000] text-gray-900 tracking-tighter">
					{formatPrice(order.total || 0, order.currency)}
				</div>
			</td>
			<td className="px-5 py-5 whitespace-nowrap">
				<div className="flex flex-col gap-1.5 min-w-[120px]">
					<span
						className={`inline-flex items-center justify-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-colors shadow-sm ${getStatusColor(
							order.status,
						)}`}
					>
						{getStatusText(order.status)}
					</span>
					<span
						className={`inline-flex items-center justify-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-colors shadow-sm ${getPaymentStatusColor(
							order.payment?.status,
						)}`}
					>
						<CreditCard className="w-2.5 h-2.5 mr-1.5 opacity-60" />
						{getPaymentStatusText(order.payment?.status)}
					</span>
				</div>
			</td>
			<td className="px-5 py-3 whitespace-nowrap text-right">
				<div className="flex items-center justify-end gap-1.5">
					<Link
						to={`/admin/orders/${order._id}`}
						className="p-1.5 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-100"
						title="Voir détails"
					>
						<Eye className="h-3.5 w-3.5" />
					</Link>
					{canConfirmPayment && (
						<button
							onClick={() => onConfirmPayment(order._id)}
							disabled={confirmingPayment === order._id}
							className="p-1.5 bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-300 border border-transparent hover:border-emerald-100 disabled:opacity-50"
							title="Confirmer paiement"
						>
							<CreditCard className="h-3.5 w-3.5" />
						</button>
					)}
					{needsTransporter && (
						<button
							onClick={() => onOpenAssignModal(order)}
							className="p-1.5 bg-gray-50 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-300 border border-transparent hover:border-amber-100"
							title="Assigner transporteur"
						>
							<Truck className="h-3.5 w-3.5" />
						</button>
					)}
					<div className="p-1.5 bg-gray-50 text-gray-300 rounded-lg transition-all">
						<ChevronRight className="h-3.5 w-3.5" />
					</div>
				</div>
			</td>
		</tr>
	);
};

export default AdminOrdersTable;
