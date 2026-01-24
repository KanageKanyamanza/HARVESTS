import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { consumerService } from "../../../services";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import OrderList from "../../../components/orders/OrderList";
import {
	FiShoppingBag,
	FiClock,
	FiCheckCircle,
	FiXCircle,
	FiSearch,
	FiRefreshCw,
	FiFilter,
	FiPieChart,
	FiTrendingUp,
} from "react-icons/fi";

const OrderHistory = () => {
	const { user } = useAuth();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");

	const loadOrders = useCallback(async () => {
		if (user?.userType === "consumer") {
			try {
				setLoading(true);
				const response = await consumerService.getMyOrders();
				setOrders(response.data.data?.orders || response.data.orders || []);
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

	const filteredOrders = orders.filter((order) => {
		try {
			const matchesFilter = filter === "all" || order?.status === filter;
			const matchesSearch =
				searchTerm === "" ||
				order?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				order?._id?.toLowerCase().includes(searchTerm.toLowerCase());
			return matchesFilter && matchesSearch;
		} catch (error) {
			console.error("Erreur lors du filtrage des commandes:", error);
			return false;
		}
	});

	const getOrderStats = () => {
		try {
			const stats = {
				total: orders.length,
				pending: orders.filter((o) => o?.status === "pending").length,
				confirmed: orders.filter((o) => o?.status === "confirmed").length,
				delivered: orders.filter(
					(o) => o?.status === "delivered" || o?.status === "completed",
				).length,
				cancelled: orders.filter((o) => o?.status === "cancelled").length,
			};
			return stats;
		} catch (error) {
			return { total: 0, pending: 0, confirmed: 0, delivered: 0, cancelled: 0 };
		}
	};

	const stats = getOrderStats();

	return (
		<ModularDashboardLayout>
			<div className="min-h-screen relative overflow-hidden bg-harvests-light/30">
				{/* Background radial glows */}
				<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
					<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[120px]"></div>
					<div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-100/30 rounded-full blur-[100px]"></div>
					<div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-cyan-100/20 rounded-full blur-[120px]"></div>
				</div>

				<div className="relative z-10 p-4 md:p-8 max-w-[1600px] mx-auto space-y-10">
					{/* Header Section */}
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fade-in-down">
						<div className="space-y-3">
							<div className="flex items-center gap-3 text-blue-600 font-black text-[10px] uppercase tracking-[0.3em]">
								<div className="w-8 h-[2px] bg-blue-600 rounded-full"></div>
								<span>Journal d'Achat</span>
							</div>
							<h1 className="text-4xl md:text-5xl font-[1000] text-gray-900 tracking-tighter leading-[0.9] mb-2">
								Historique des{" "}
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 italic">
									Achats.
								</span>
							</h1>
							<p className="text-gray-500 font-medium max-w-xl text-base">
								Gérez vos commandes, suivez vos livraisons et retrouvez vos
								factures en quelques clics.
							</p>
						</div>

						<button
							onClick={() => loadOrders()}
							className="group relative inline-flex items-center justify-center px-6 py-3.5 bg-white/70 backdrop-blur-xl border border-white/60 text-gray-900 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all duration-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-100 hover:-translate-y-1 shadow-sm hover:shadow-blue-200/50"
						>
							<FiRefreshCw
								className={`w-4 h-4 mr-3 transition-transform group-hover:rotate-180 duration-500 ${loading ? "animate-spin" : ""}`}
							/>
							Synchroniser
						</button>
					</div>

					{/* Stats Grid */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in-up delay-100">
						{[
							{
								label: "Total Commandes",
								value: stats.total,
								icon: FiShoppingBag,
								color: "blue",
							},
							{
								label: "En attente",
								value: stats.pending,
								icon: FiClock,
								color: "amber",
							},
							{
								label: "Livrées",
								value: stats.delivered,
								icon: FiCheckCircle,
								color: "cyan",
							},
							{
								label: "Annulées",
								value: stats.cancelled,
								icon: FiXCircle,
								color: "rose",
							},
						].map((item, idx) => (
							<div
								key={idx}
								className="group bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
							>
								<div
									className={`absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`}
								>
									<item.icon className="w-24 h-24" />
								</div>
								<div className="flex flex-col h-full relative z-10">
									<div
										className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm border
                        ${item.color === "blue" ? "bg-blue-50 text-blue-600 border-blue-100" : ""}
                        ${item.color === "amber" ? "bg-amber-50 text-amber-600 border-amber-100" : ""}
                        ${item.color === "cyan" ? "bg-cyan-50 text-cyan-600 border-cyan-100" : ""}
                        ${item.color === "rose" ? "bg-rose-50 text-rose-600 border-rose-100" : ""}
                      `}
									>
										<item.icon className="w-5 h-5" />
									</div>
									<p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-1">
										{item.label}
									</p>
									<p className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none">
										{item.value}
									</p>
								</div>
							</div>
						))}
					</div>

					{/* Filters & Content Area */}
					<div className="space-y-6 animate-fade-in-up delay-200">
						<div className="flex flex-col lg:flex-row gap-4">
							<div className="relative flex-grow lg:max-w-2xl group">
								<div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
									<FiSearch className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
								</div>
								<input
									type="text"
									placeholder="Rechercher par numéro de commande, produit..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="block w-full pl-12 pr-6 py-4 bg-white/70 backdrop-blur-xl border border-white/60 rounded-[1.8rem] text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all shadow-sm hover:bg-white"
								/>
							</div>

							<div className="relative min-w-[240px]">
								<div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
									<FiFilter className="h-4 w-4 text-gray-400" />
								</div>
								<select
									value={filter}
									onChange={(e) => setFilter(e.target.value)}
									className="block w-full pl-12 pr-12 py-4 bg-white/70 backdrop-blur-xl border border-white/60 rounded-[1.8rem] text-xs font-black uppercase tracking-widest text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 transition-all shadow-sm cursor-pointer appearance-none hover:bg-white"
								>
									<option value="all">Tous les statuts</option>
									<option value="pending">En attente</option>
									<option value="confirmed">Confirmées</option>
									<option value="processing">Préparation</option>
									<option value="shipped">Expédiées</option>
									<option value="delivered">Livrées</option>
									<option value="completed">Terminées</option>
									<option value="cancelled">Annulées</option>
								</select>
								<div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
									<svg
										className="h-5 w-5 text-gray-300"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2.5}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</div>
							</div>
						</div>

						<div className="relative min-h-[400px]">
							{loading && orders.length === 0 ?
								<div className="space-y-6">
									{[1, 2, 3].map((i) => (
										<div
											key={i}
											className="bg-white/40 backdrop-blur-sm rounded-[2.5rem] border border-white/60 p-8 flex gap-6 animate-pulse"
										>
											<div className="w-24 h-24 bg-gray-200 rounded-3xl shrink-0"></div>
											<div className="flex-1 space-y-4 py-2">
												<div className="h-4 bg-gray-200 rounded w-1/4"></div>
												<div className="h-6 bg-gray-200 rounded w-1/2"></div>
												<div className="h-4 bg-gray-200 rounded w-1/3"></div>
											</div>
										</div>
									))}
								</div>
							:	<OrderList
									orders={filteredOrders}
									userType="consumer"
									loading={loading}
								/>
							}
						</div>
					</div>
				</div>
			</div>
		</ModularDashboardLayout>
	);
};

export default OrderHistory;
