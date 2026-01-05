import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
	Search,
	Filter,
	ShoppingCart,
	ChevronLeft,
	ChevronRight,
	Calendar,
	MoreVertical,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import AdminOrdersTable from "../../components/admin/AdminOrdersTable";
import TransporterAssignModal from "../../components/admin/TransporterAssignModal";

const AdminOrders = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [currentPage, setCurrentPage] = useState(
		parseInt(searchParams.get("page")) || 1
	);
	const [totalPages, setTotalPages] = useState(1);
	const [totalOrders, setTotalOrders] = useState(0);
	const [confirmingPayment, setConfirmingPayment] = useState(null);
	const [showAssignModal, setShowAssignModal] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [availableTransporters, setAvailableTransporters] = useState([]);
	const [loadingTransporters, setLoadingTransporters] = useState(false);
	const [assigning, setAssigning] = useState(false);

	const loadOrders = useCallback(async () => {
		try {
			setLoading(true);
			const response = await adminService.getOrders({
				page: currentPage,
				limit: 10,
				status: statusFilter,
				search: searchTerm,
			});

			if (response.status === "success" && response.data?.orders) {
				setOrders(response.data.orders);
				setTotalPages(response.data.pagination?.totalPages || 1);
				setTotalOrders(
					response.data.pagination?.totalOrders || response.data.orders.length
				);
			} else if (response.data?.orders) {
				setOrders(response.data.orders);
				setTotalPages(response.data.pagination?.totalPages || 1);
				setTotalOrders(
					response.data.pagination?.totalOrders || response.data.orders.length
				);
			} else {
				setOrders([]);
			}
		} catch (error) {
			console.error("Erreur:", error);
			setOrders([]);
		} finally {
			setLoading(false);
		}
	}, [currentPage, statusFilter, searchTerm]);

	useEffect(() => {
		loadOrders();
	}, [loadOrders]);

	const handleConfirmPayment = async (orderId) => {
		if (!window.confirm("Confirmer ce paiement ?")) return;
		try {
			setConfirmingPayment(orderId);
			await adminService.updatePaymentStatus(orderId, {
				paymentStatus: "completed",
				paidAt: new Date().toISOString(),
			});
			loadOrders();
		} catch (error) {
			console.error("Erreur:", error);
			alert("Erreur lors de la confirmation");
		} finally {
			setConfirmingPayment(null);
		}
	};

	const handleOpenAssignModal = async (order) => {
		setSelectedOrder(order);
		setShowAssignModal(true);
		setLoadingTransporters(true);
		try {
			const response = await adminService.getAvailableTransporters(order._id);
			setAvailableTransporters(
				response.status === "success" && response.data
					? response.data.transporters || []
					: []
			);
		} catch {
			setAvailableTransporters([]);
		} finally {
			setLoadingTransporters(false);
		}
	};

	const handleAssignTransporter = async (transporterId) => {
		if (!selectedOrder) return;
		setAssigning(true);
		try {
			await adminService.assignTransporterToOrder(
				selectedOrder._id,
				transporterId
			);
			setShowAssignModal(false);
			setSelectedOrder(null);
			loadOrders();
		} catch (error) {
			alert(error.response?.data?.message || "Erreur");
		} finally {
			setAssigning(false);
		}
	};

	if (loading)
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<LoadingSpinner size="lg" text="Chargement des commandes..." />
			</div>
		);

	return (
		<div className="min-h-screen pb-20 relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="max-w-[1400px] mx-auto px-4 py-12 relative z-10">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 animate-fade-in-down">
					<div>
						<h1 className="text-5xl font-[1000] text-gray-900 tracking-tighter leading-none mb-4">
							Gestion des <span className="text-green-600">Commandes</span>
						</h1>
						<p className="text-gray-500 font-medium flex items-center gap-2">
							<ShoppingCart className="h-4 w-4 text-green-500" />
							Suivez et gérez les ventes de la plateforme en temps réel
						</p>
					</div>

					{/* Search & Filter Bar */}
					<div className="flex flex-wrap items-center gap-4 bg-white/70 backdrop-blur-xl p-3 rounded-[2rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
						<div className="relative">
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<input
								type="text"
								placeholder="Rechercher par n° ou client..."
								value={searchTerm}
								onChange={(e) => {
									setSearchTerm(e.target.value);
									setCurrentPage(1);
								}}
								className="pl-11 pr-6 py-3 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-2xl text-sm font-medium transition-all w-full md:w-64"
							/>
						</div>
						<div className="relative">
							<Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<select
								value={statusFilter}
								onChange={(e) => {
									setStatusFilter(e.target.value);
									setCurrentPage(1);
								}}
								className="pl-11 pr-10 py-3 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all appearance-none cursor-pointer"
							>
								<option value="">Tous les statuts</option>
								<option value="pending">En attente</option>
								<option value="confirmed">Confirmée</option>
								<option value="processing">En cours</option>
								<option value="shipped">Expédiée</option>
								<option value="delivered">Livrée</option>
								<option value="cancelled">Annulée</option>
							</select>
						</div>
						<div className="px-6 py-3 bg-gray-900/5 text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-gray-900/5">
							{totalOrders} Commande(s)
						</div>
					</div>
				</div>

				{/* Table Container */}
				<div className="animate-fade-in-up">
					<AdminOrdersTable
						orders={orders}
						onConfirmPayment={handleConfirmPayment}
						onOpenAssignModal={handleOpenAssignModal}
						confirmingPayment={confirmingPayment}
					/>
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="mt-12 flex items-center justify-between bg-white/70 backdrop-blur-xl p-4 rounded-[2rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
						<button
							onClick={() => {
								const newPage = Math.max(1, currentPage - 1);
								setCurrentPage(newPage);
								setSearchParams({ page: newPage.toString() });
							}}
							disabled={currentPage === 1}
							className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all duration-300 disabled:opacity-50"
						>
							<ChevronLeft className="h-4 w-4" /> Précédent
						</button>
						<div className="flex items-center gap-2">
							{Array.from({ length: totalPages }).map((_, i) => (
								<button
									key={i}
									onClick={() => {
										setCurrentPage(i + 1);
										setSearchParams({ page: (i + 1).toString() });
									}}
									className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all duration-300 ${
										currentPage === i + 1
											? "bg-gray-900 text-white shadow-xl shadow-gray-200"
											: "text-gray-400 hover:bg-gray-50"
									}`}
								>
									{i + 1}
								</button>
							))}
						</div>
						<button
							onClick={() => {
								const newPage = Math.min(totalPages, currentPage + 1);
								setCurrentPage(newPage);
								setSearchParams({ page: newPage.toString() });
							}}
							disabled={currentPage === totalPages}
							className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all duration-300 disabled:opacity-50"
						>
							Suivant <ChevronRight className="h-4 w-4" />
						</button>
					</div>
				)}

				{/* Assign Modal */}
				<TransporterAssignModal
					show={showAssignModal}
					order={selectedOrder}
					transporters={availableTransporters}
					loading={loadingTransporters}
					assigning={assigning}
					onAssign={handleAssignTransporter}
					onClose={() => {
						setShowAssignModal(false);
						setSelectedOrder(null);
					}}
				/>
			</div>
		</div>
	);
};

export default AdminOrders;
