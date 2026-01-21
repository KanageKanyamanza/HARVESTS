import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { producerService } from "../../../services";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import OrderList from "../../../components/orders/OrderList";
import { FiSearch, FiRefreshCw, FiFilter, FiShoppingBag } from "react-icons/fi";

const Orders = () => {
	const { user } = useAuth();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [updatingOrders, setUpdatingOrders] = useState(new Set());

	const getOrderStatus = useCallback(
		(order) => order?.segment?.status || order?.status || "pending",
		[],
	);

	const loadOrders = useCallback(async () => {
		if (user?.userType !== "producer") return;

		try {
			setLoading(true);
			const response = await producerService.getOrders();
			const ordersData =
				response.data.data?.orders || response.data.orders || [];

			setOrders(Array.isArray(ordersData) ? ordersData : []);
		} catch (error) {
			console.error("Erreur lors du chargement des commandes:", error);
			setOrders([]);
		} finally {
			setLoading(false);
		}
	}, [user?.userType]);

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

			const response = await producerService.updateOrderStatus(
				orderId,
				payload,
			);

			if (response.data.status === "success") {
				console.log(`Commande ${orderId} ${newStatus} avec succès`);
				await loadOrders();
			}
		} catch (error) {
			console.error("Erreur lors de la mise à jour du statut:", error);
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

		const orderStatus = getOrderStatus(order);
		const matchesStatus =
			statusFilter === "all" || orderStatus === statusFilter;

		return matchesSearch && matchesStatus;
	});

	return (
		<ModularDashboardLayout>
			<div className="min-h-screen relative overflow-hidden">
				{/* Background radial glows */}
				<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
					<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
					<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
					<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-amber-50/30 rounded-full blur-[120px]"></div>
				</div>

				<div className="relative z-10 p-4 md:p-6 max-w-[1600px] mx-auto space-y-6">
					{/* Header Section */}
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
						<div>
							<div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest mb-2">
								<div className="w-5 h-[2px] bg-emerald-600"></div>
								<span>Gestion</span>
							</div>
							<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
								Mes{" "}
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
									Commandes.
								</span>
							</h1>
							<p className="text-xs text-gray-500 font-medium max-w-xl">
								Suivez vos ventes, préparez vos colis et gérez les interactions
								avec vos clients.
							</p>
						</div>

						<button
							onClick={() => loadOrders()}
							className="group relative inline-flex items-center justify-center px-6 py-3 bg-white/70 backdrop-blur-xl border border-white/60 text-gray-900 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all duration-300 hover:bg-emerald-600 hover:text-white hover:-translate-y-1 shadow-sm active:scale-95"
						>
							<FiRefreshCw
								className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
							/>
							Actualiser
						</button>
					</div>

					{/* Filters & Search Bar */}
					<div className="flex flex-col md:flex-row gap-4 animate-fade-in-up delay-100">
						<div className="relative flex-grow md:max-w-md group">
							<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
								<FiSearch className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
							</div>
							<input
								type="text"
								placeholder="Rechercher par numéro de commande..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="block w-full pl-11 pr-4 py-3 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm group-hover:shadow-md"
							/>
						</div>

						<div className="relative min-w-[200px]">
							<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
								<FiFilter className="h-4 w-4 text-gray-400" />
							</div>
							<select
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
								className="block w-full pl-10 pr-10 py-3 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl text-xs font-bold uppercase tracking-wide text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm cursor-pointer appearance-none hover:bg-white"
							>
								<option value="all">Tous les statuts</option>
								<option value="pending">En attente</option>
								<option value="confirmed">Confirmées</option>
								<option value="preparing">En préparation</option>
								<option value="ready-for-pickup">Prêtes</option>
								<option value="in-transit">En livraison</option>
								<option value="delivered">Livrées</option>
								<option value="completed">Terminées</option>
								<option value="cancelled">Annulées</option>
							</select>
							<div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
								<svg
									className="h-4 w-4 text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</div>
						</div>
					</div>

					<div className="animate-fade-in-up delay-200">
						<OrderList
							orders={filteredOrders}
							userType="producer"
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

export default Orders;
