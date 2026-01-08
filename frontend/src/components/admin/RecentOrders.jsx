import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	ShoppingCart,
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle,
} from "lucide-react";

const RecentOrders = ({ orders = [] }) => {
	const navigate = useNavigate();
	const getStatusIcon = (status) => {
		switch (status) {
			case "completed":
			case "confirmed":
				return <CheckCircle className="w-5 h-5 text-blue-500" />;
			case "delivered":
				return <CheckCircle className="w-5 h-5 text-green-500" />;
			case "cancelled":
				return <XCircle className="w-5 h-5 text-red-500" />;
			case "pending":
				return <Clock className="w-5 h-5 text-yellow-500" />;
			case "preparing":
				return <Clock className="w-5 h-5 text-purple-500" />;
			default:
				return <AlertCircle className="w-5 h-5 text-gray-400" />;
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "completed":
			case "confirmed":
				return "bg-blue-50 text-blue-700 border-blue-100 shadow-blue-100/30";
			case "delivered":
				return "bg-green-50 text-green-700 border-green-100 shadow-green-100/30";
			case "cancelled":
				return "bg-red-50 text-red-700 border-red-100 shadow-red-100/30";
			case "pending":
				return "bg-yellow-50 text-yellow-700 border-yellow-100 shadow-yellow-100/30";
			case "preparing":
				return "bg-purple-50 text-purple-700 border-purple-100 shadow-purple-100/30";
			default:
				return "bg-blue-50 text-blue-700 border-blue-100 shadow-blue-100/30";
		}
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: "XAF",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "short",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (orders.length === 0) {
		return (
			<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 p-6 text-center">
				<div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
					<ShoppingCart className="w-8 h-8 text-gray-300" />
				</div>
				<h3 className="text-lg font-black text-gray-900 tracking-tight">
					Aucune commande
				</h3>
				<p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
					En attente de ventes
				</p>
			</div>
		);
	}

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 h-full flex flex-col relative overflow-hidden group">
			<div className="p-4 border-b border-gray-200/50 flex items-center justify-between relative z-10">
				<div>
					<h3 className="text-base font-[1000] text-gray-900 tracking-tight">
						Commandes récentes
					</h3>
					<p className="text-[9px] font-black text-gray-400 mt-0.5 uppercase tracking-[0.2em]">
						Dernières transactions
					</p>
				</div>
				<Link
					to="/admin/orders"
					className="text-[9px] whitespace-nowrap font-black text-green-600 hover:text-white hover:bg-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 transition-all duration-300 uppercase tracking-widest"
				>
					Tout voir
				</Link>
			</div>

			<div className="p-2 space-y-2 flex-1 overflow-auto relative z-10">
				{orders.map((order) => (
					<div
						key={order._id}
						onClick={() => navigate(`/admin/orders/${order._id}`)}
						className="group p-2.5 rounded-[1rem] border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 cursor-pointer bg-white/40"
					>
						<div className="flex flex-wrap gap-2 items-center justify-between mb-1.5">
							<div className="flex items-center space-x-2">
								<div
									className={`p-2 rounded-lg ${
										order.status === "pending" ? "bg-yellow-50" : "bg-gray-50"
									} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm`}
								>
									{getStatusIcon(order.status)}
								</div>
								<div>
									<span className="text-[9px] font-black text-gray-800 block uppercase tracking-[0.2em] mb-0">
										#{order.orderNumber || order._id.slice(-8)}
									</span>
									<h4 className="text-sm font-[1000] text-gray-900 group-hover:text-green-600 transition-colors tracking-tight leading-none">
										{order.buyer?.firstName} {order.buyer?.lastName}
									</h4>
								</div>
							</div>
							<span
								className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all duration-300 ${getStatusColor(
									order.status
								)} shadow-sm`}
							>
								{order.status}
							</span>
						</div>

						<div className="flex flex-wrap gap-2 items-center justify-between sm:pl-12 transition-all duration-500 group-hover:pl-14">
							<div className="flex items-center space-x-2 text-[9px] font-bold text-gray-400">
								<span className="flex items-center bg-gray-50/50 group-hover:bg-green-50 px-2 py-0.5 rounded-lg group-hover:text-green-600 transition-all duration-300 border border-transparent group-hover:border-green-100">
									<Clock className="w-2.5 h-2.5 mr-1 opacity-60" />{" "}
									{formatDate(order.createdAt)}
								</span>
								<span className="flex items-center bg-gray-50/50 group-hover:bg-blue-50 px-2 py-0.5 rounded-lg group-hover:text-blue-600 transition-all duration-300 border border-transparent group-hover:border-blue-100">
									<ShoppingCart className="w-2.5 h-2.5 mr-1 opacity-60" />{" "}
									{order.items?.length || 0} items
								</span>
							</div>
							<span className="text-base font-[1000] text-gray-900 group-hover:text-green-600 transition-all tracking-tighter group-hover:scale-110">
								{formatCurrency(order.totalAmount || order.total)}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default RecentOrders;
