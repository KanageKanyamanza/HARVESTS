import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { exporterService } from "../../../services";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import OrderList from "../../../components/orders/OrderList";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { FiSearch, FiRefreshCw, FiFilter, FiPackage } from "react-icons/fi";

const Orders = () => {
	const { user } = useAuth();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [updatingOrders, setUpdatingOrders] = useState(new Set());

	const loadOrders = useCallback(async () => {
		if (user?.userType === "exporter") {
			try {
				setLoading(true);
				const response = await exporterService.getOrders();
				const ordersData =
					response.data.data?.exportOrders ||
					response.data.data?.orders ||
					response.data.exportOrders ||
					response.data.orders ||
					[];
				setOrders(Array.isArray(ordersData) ? ordersData : []);
			} catch (error) {
				console.error("Erreur lors du chargement des commandes:", error);
				setOrders([]);
			} finally {
				setLoading(false);
			}
		}
	}, [user]);

	useEffect(() => {
		loadOrders();
	}, [loadOrders]);

	const handleUpdateStatus = async (
		order,
		newStatus,
		segmentId = null,
		options = {},
	) => {
		if (updatingOrders.has(order._id)) return;

		try {
			setUpdatingOrders((prev) => new Set(prev).add(order._id));

			let deliveryStatus = newStatus;
			if (newStatus === "ready-for-pickup") {
				deliveryStatus = "picked-up";
			} else if (
				newStatus === "in-transit" ||
				newStatus === "out-for-delivery"
			) {
				deliveryStatus = "in-transit";
			} else if (newStatus === "delivered") {
				deliveryStatus = "delivered";
			}

			const response = await exporterService.updateOrderStatus(order._id, {
				status: deliveryStatus,
				location: order.delivery?.deliveryAddress?.city || null,
				note: `Statut mis à jour par ${user?.firstName || "Exportateur"}`,
			});

			if (response.data?.status === "success") {
				await loadOrders();
			}
		} catch (error) {
			console.error("Erreur lors de la mise à jour du statut:", error);
			alert(
				error.response?.data?.message ||
					"Erreur lors de la mise à jour du statut",
			);
		} finally {
			setUpdatingOrders((prev) => {
				const newSet = new Set(prev);
				newSet.delete(order._id);
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
			statusFilter === "all" || order.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	return (
		<div className="min-h-screen relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-50/30 rounded-full blur-[120px]"></div>
			</div>

			<div className="relative z-10 p-4 md:p-6 max-w-[1600px] mx-auto space-y-8">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
					<div>
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest mb-2">
							<div className="w-5 h-[2px] bg-emerald-600"></div>
							<span>Logistique & Export</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
							Mes{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-500 italic">
								Commandes.
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">
							Gérez vos flux d'exportation, suivez les expéditions en temps réel
							et maintenez la satisfaction client.
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
				<div className="flex flex-col md:flex-row gap-4 animate-fade-in-up delay-100 pb-2">
					<div className="relative flex-grow md:max-w-md group">
						<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
							<FiSearch className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
						</div>
						<input
							type="text"
							placeholder="Rechercher par numéro ou ID..."
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
							className="block w-full pl-10 pr-10 py-3 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm cursor-pointer appearance-none hover:bg-white"
						>
							<option value="all">Tous les statuts</option>
							<option value="pending">En attente</option>
							<option value="confirmed">Confirmées</option>
							<option value="processing">En préparation</option>
							<option value="shipped">Expédiées</option>
							<option value="delivered">Livrées</option>
							<option value="cancelled">Annulées</option>
						</select>
						<div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
							<svg
								className="h-4 w-4"
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

				{/* Content Section */}
				<div className="animate-fade-in-up delay-200">
					{loading && orders.length === 0 ?
						<div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl p-12 text-center shadow-sm">
							<LoadingSpinner size="lg" text="Synchronisation des flux..." />
						</div>
					: filteredOrders.length === 0 ?
						<div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl p-20 text-center shadow-sm">
							<div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-400">
								<FiPackage className="w-8 h-8" />
							</div>
							<h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tighter">
								Aucune commande
							</h3>
							<p className="text-gray-500 text-sm font-medium mb-8">
								{searchTerm || statusFilter !== "all" ?
									"Aucun résultat ne correspond à vos critères de recherche."
								:	"Votre carnet de commandes est actuellement vide."}
							</p>
							{(searchTerm || statusFilter !== "all") && (
								<button
									onClick={() => {
										setSearchTerm("");
										setStatusFilter("all");
									}}
									className="px-6 py-3 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-emerald-600 transition-all active:scale-95"
								>
									Réinitialiser les filtres
								</button>
							)}
						</div>
					:	<div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl shadow-sm overflow-hidden">
							<div className="p-1">
								<OrderList
									orders={filteredOrders}
									userType="exporter"
									onUpdateStatus={handleUpdateStatus}
									updatingOrders={updatingOrders}
									loading={loading}
								/>
							</div>
						</div>
					}
				</div>
			</div>
		</div>
	);
};

export default Orders;
