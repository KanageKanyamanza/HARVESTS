import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { restaurateurService } from "../../../services";
import { useNotifications } from "../../../contexts/NotificationContext";
import { useAuth } from "../../../hooks/useAuth";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import OrderList from "../../../components/orders/OrderList";
import {
	FiShoppingCart,
	FiSearch,
	FiRefreshCw,
	FiFilter,
	FiBox,
	FiShoppingBag,
} from "react-icons/fi";

const OrdersList = () => {
	const { showSuccess, showError } = useNotifications();
	const { user } = useAuth();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [orderTypeFilter, setOrderTypeFilter] = useState("all"); // 'all', 'received', 'placed'
	const [updatingOrders, setUpdatingOrders] = useState(new Set());

	const isOrderReceived = useCallback((order) => {
		if (!order) return false;
		if (order.role === "seller") return true;
		if (order.segment?.seller) return true;
		return Boolean(order.seller);
	}, []);

	const isOrderPlaced = useCallback(
		(order) => {
			if (!order || !user) return false;
			if (order.role === "buyer") return true;
			const buyerId =
				order.buyer?._id?.toString() ||
				order.buyer?.id?.toString() ||
				order.buyer?.toString();
			const userId = user._id?.toString() || user.id?.toString();
			return buyerId === userId;
		},
		[user],
	);

	const getOrderStatus = useCallback(
		(order) => order?.segment?.status || order?.status || "pending",
		[],
	);

	const loadOrders = useCallback(async () => {
		try {
			setLoading(true);
			const response = await restaurateurService.getOrders();
			const ordersData =
				response.data.data?.orders || response.data.orders || [];
			setOrders(Array.isArray(ordersData) ? ordersData : []);
			setError(null);
		} catch (error) {
			console.error("Erreur lors du chargement des commandes:", error);
			setError("Erreur lors du chargement des commandes");
			setOrders([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadOrders();
	}, [loadOrders]);

	const updateOrderStatus = async (
		order,
		newStatus,
		segmentId,
		options = {},
	) => {
		const orderId = order?._id;
		if (!orderId) return;

		try {
			setUpdatingOrders((prev) => new Set([...prev, orderId]));
			const payload = {
				status: newStatus,
				segmentId,
				...(options.itemId ? { itemId: options.itemId } : {}),
				...(options.itemIds ? { itemIds: options.itemIds } : {}),
			};

			const response = await restaurateurService.updateOrderStatus(
				orderId,
				payload,
			);

			if (response.data.status === "success") {
				showSuccess(`Statut mis à jour avec succès`);
				await loadOrders();
			}
		} catch (error) {
			showError("Erreur lors de la mise à jour");
		} finally {
			setUpdatingOrders((prev) => {
				const newSet = new Set(prev);
				newSet.delete(orderId);
				return newSet;
			});
		}
	};

	const filteredOrders = orders.filter((order) => {
		if (!order) return false;
		const matchesSearch =
			searchTerm === "" ||
			order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order._id?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus =
			statusFilter === "all" || getOrderStatus(order) === statusFilter;
		let matchesOrderType = true;
		if (orderTypeFilter === "received")
			matchesOrderType = isOrderReceived(order);
		else if (orderTypeFilter === "placed")
			matchesOrderType = isOrderPlaced(order);
		return matchesStatus && matchesSearch && matchesOrderType;
	});

	return (
		<ModularDashboardLayout>
			<div className="min-h-screen relative overflow-hidden bg-harvests-light/20">
				{/* Decorative Background */}
				<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
					<div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-[100px]"></div>
					<div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				</div>

				<div className="relative z-10 p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
					{/* Modern Header */}
					<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 animate-fade-in-down">
						<div className="space-y-2">
							<div className="flex items-center gap-3 text-emerald-600 font-black text-[10px] uppercase tracking-[0.3em]">
								<div className="w-8 h-[2px] bg-emerald-600 rounded-full"></div>
								<span>Transactions</span>
							</div>
							<h1 className="text-4xl md:text-5xl font-[1000] text-gray-900 tracking-tighter leading-none">
								Flux des{" "}
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
									Commandes.
								</span>
							</h1>
							<p className="text-gray-500 font-medium text-base">
								Gérez vos achats de matières premières et vos ventes de plats
								préparés dans un espace unifié.
							</p>
						</div>

						<button
							onClick={() => loadOrders()}
							className="inline-flex items-center justify-center px-6 py-3.5 bg-white/70 backdrop-blur-xl border border-white/60 text-gray-900 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all duration-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-100 shadow-sm hover:shadow-emerald-200/40"
						>
							<FiRefreshCw
								className={`w-4 h-4 mr-3 ${loading ? "animate-spin" : ""}`}
							/>
							Rafraîchir
						</button>
					</div>

					{/* Filters Bar */}
					<div className="flex flex-col lg:flex-row gap-4 bg-white/40 backdrop-blur-md p-4 rounded-[2rem] border border-white/60 shadow-sm animate-fade-in-up delay-100">
						<div className="relative flex-grow group">
							<div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
								<FiSearch className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500" />
							</div>
							<input
								type="text"
								placeholder="Chercher par n° de commande ou nom de client..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="block w-full pl-12 pr-6 py-4 bg-white/60 border border-transparent focus:bg-white focus:border-emerald-500/30 rounded-[1.5rem] text-sm font-bold text-gray-900 placeholder-gray-400 transition-all shadow-inner"
							/>
						</div>

						<div className="flex flex-col sm:flex-row gap-3">
							<div className="relative">
								<FiBox className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
								<select
									value={orderTypeFilter}
									onChange={(e) => setOrderTypeFilter(e.target.value)}
									className="pl-11 pr-10 py-4 bg-white/60 border border-transparent rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-gray-700 appearance-none cursor-pointer focus:bg-white transition-all shadow-inner min-w-[180px]"
								>
									<option value="all">Tous les types</option>
									<option value="received">Ventes (Reçues)</option>
									<option value="placed">Achats (Passées)</option>
								</select>
							</div>

							<div className="relative">
								<FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
								<select
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
									className="pl-11 pr-10 py-4 bg-white/60 border border-transparent rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-gray-700 appearance-none cursor-pointer focus:bg-white transition-all shadow-inner min-w-[200px]"
								>
									<option value="all">Tous les statuts</option>
									<option value="pending">En attente</option>
									<option value="confirmed">Confirmées</option>
									<option value="preparing">En préparation</option>
									<option value="ready-for-pickup">Prête</option>
									<option value="in-transit">En transit</option>
									<option value="delivered">Livrées</option>
									<option value="completed">Terminées</option>
									<option value="cancelled">Annulées</option>
								</select>
							</div>
						</div>
					</div>

					{/* List Area */}
					<div className="animate-fade-in-up delay-200">
						<OrderList
							orders={filteredOrders}
							userType="restaurateur"
							onUpdateStatus={updateOrderStatus}
							loading={loading}
							updatingOrders={updatingOrders}
						/>
					</div>
				</div>
			</div>
		</ModularDashboardLayout>
	);
};

export default OrdersList;
