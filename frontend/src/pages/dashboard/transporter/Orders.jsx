import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { transporterService } from "../../../services";

import OrderList from "../../../components/orders/OrderList";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { FiSearch, FiRefreshCw } from "react-icons/fi";

const Orders = () => {
	const { user } = useAuth();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [updatingOrders, setUpdatingOrders] = useState(new Set());

	useEffect(() => {
		const loadOrders = async () => {
			if (user?.userType === "transporter") {
				try {
					setLoading(true);
					const response = await transporterService.getOrders();
					const ordersData =
						response.data.data?.deliveries ||
						response.data.data?.orders ||
						response.data.deliveries ||
						response.data.orders ||
						[];
					setOrders(Array.isArray(ordersData) ? ordersData : []);
				} catch (error) {
					console.error("Erreur lors du chargement des livraisons:", error);
					setOrders([]);
				} finally {
					setLoading(false);
				}
			}
		};

		loadOrders();
	}, [user]);

	const handleUpdateStatus = async (
		order,
		newStatus,
		segmentId = null,
		options = {},
	) => {
		if (updatingOrders.has(order._id)) return;

		try {
			setUpdatingOrders((prev) => new Set(prev).add(order._id));

			// Mapper les statuts pour les transporteurs
			let deliveryStatus = newStatus;
			if (newStatus === "ready-for-pickup") {
				deliveryStatus = "picked-up"; // Quand le transporteur collecte
			} else if (
				newStatus === "in-transit" ||
				newStatus === "out-for-delivery"
			) {
				deliveryStatus = "in-transit";
			} else if (newStatus === "delivered") {
				deliveryStatus = "delivered";
			}

			const response = await transporterService.updateOrderStatus(order._id, {
				status: deliveryStatus,
				location: order.delivery?.deliveryAddress?.city || null,
				note: `Statut mis à jour par ${user?.firstName || "Transporteur"}`,
			});

			if (response.data?.status === "success") {
				// Recharger les commandes
				const refreshResponse = await transporterService.getOrders();
				const ordersData =
					refreshResponse.data.data?.deliveries ||
					refreshResponse.data.data?.orders ||
					[];
				setOrders(Array.isArray(ordersData) ? ordersData : []);
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
			order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			order.deliveryAddress?.city
				?.toLowerCase()
				.includes(searchTerm.toLowerCase());

		const matchesStatus =
			statusFilter === "all" || order.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	return (
		<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden bg-gray-50/30">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-100/20 rounded-full blur-[120px]"></div>
			</div>

			<div className="relative z-10 p-4 md:p-6 max-w-7xl mx-auto space-y-8">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
					<div>
						<div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
							<div className="w-5 h-[2px] bg-indigo-600"></div>
							<span>Suivi d'Activité</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
							Livraisons&nbsp;
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 italic">
								Locales.
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">
							Gérez et suivez en temps réel toutes vos opérations de transport
							et de livraison de dernier kilomètre.
						</p>
					</div>

					<button
						onClick={() => window.location.reload()}
						className="p-3 bg-white border border-gray-100 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm"
						title="Rafraîchir"
					>
						<FiRefreshCw className="w-4 h-4" />
					</button>
				</div>

				{/* Filters Section */}
				<div className="animate-fade-in-up delay-100">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1 relative group">
							<div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur opacity-10 group-focus-within:opacity-20 transition duration-1000"></div>
							<div className="relative flex items-center bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
								<div className="pl-4 text-indigo-500">
									<FiSearch className="w-4 h-4" />
								</div>
								<input
									type="text"
									placeholder="Numéro de commande, ville, client..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full px-4 py-3 bg-transparent text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none border-none ring-0 focus:ring-0"
								/>
							</div>
						</div>

						<div className="sm:w-64 relative">
							<select
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
								className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm appearance-none cursor-pointer"
							>
								<option value="all">TOUS LES STATUTS</option>
								<option value="confirmed">CONFIRMÉE</option>
								<option value="preparing">EN PRÉPARATION</option>
								<option value="ready-for-pickup">PRÊTE POUR COLLECTE</option>
								<option value="in-transit">EN TRANSIT</option>
								<option value="delivered">LIVRÉE</option>
								<option value="completed">TERMINÉE</option>
								<option value="cancelled">ANNULÉE</option>
							</select>
							<div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="3"
										d="M19 9l-7 7-7-7"
									></path>
								</svg>
							</div>
						</div>
					</div>
				</div>

				{/* Orders Content */}
				<div className="animate-fade-in-up delay-200">
					{loading ?
						<div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] p-20 flex flex-col items-center justify-center border border-white/60">
							<LoadingSpinner
								size="lg"
								text="Synchronisation des livraisons..."
							/>
						</div>
					: filteredOrders.length === 0 ?
						<div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] p-20 flex flex-col items-center justify-center border border-white/60 text-center">
							<div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
								<FiSearch className="w-10 h-10 text-indigo-300" />
							</div>
							<h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">
								Aucune livraison trouvée
							</h3>
							<p className="text-xs text-gray-500 font-medium max-w-xs">
								{searchTerm || statusFilter !== "all" ?
									"Ajustez vos filtres pour voir d'autres résultats."
								:	"Vos missions de livraison apparaîtront ici dès qu'elles seront assignées."
								}
							</p>
						</div>
					:	<div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] overflow-hidden shadow-xl shadow-indigo-900/5">
							<OrderList
								orders={filteredOrders}
								userType="transporter"
								onUpdateStatus={handleUpdateStatus}
								updatingOrders={updatingOrders}
							/>
						</div>
					}
				</div>
			</div>
		</div>
	);
};

export default Orders;
