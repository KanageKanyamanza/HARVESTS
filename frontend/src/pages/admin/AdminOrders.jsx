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
		<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="max-w-full mx-auto px-3 py-4 relative z-10 pl-1 md:pl-6 md:px-4 md:py-6">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 animate-fade-in-down">
					<div>
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">
							<div className="w-5 h-[2px] bg-emerald-600"></div>
							<span className="text-[9px]">Transaction Flow</span>
						</div>
						<h1 className="text-2xl font-[1000] text-gray-900 tracking-tighter leading-none mb-1.5">
							Gestion des <span className="text-green-600">Commandes</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
							<ShoppingCart className="h-3.5 w-3.5 text-green-500" />
							Suivez et gérez les ventes de la plateforme en temps réel
						</p>
					</div>

					{/* Search & Filter Bar */}
					<div className="flex flex-wrap items-center gap-3 bg-white/70 backdrop-blur-xl p-1.5 rounded-[1rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
							<input
								type="text"
								placeholder="Rechercher par n° ou client..."
								value={searchTerm}
								onChange={(e) => {
									setSearchTerm(e.target.value);
									setCurrentPage(1);
								}}
								className="pl-8 pr-4 py-1.5 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-lg text-xs font-medium transition-all w-full md:w-56"
							/>
						</div>
						<div className="relative">
							<Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
							<select
								value={statusFilter}
								onChange={(e) => {
									setStatusFilter(e.target.value);
									setCurrentPage(1);
								}}
								className="pl-8 pr-5 py-1.5 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all appearance-none cursor-pointer"
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
						<div className="px-3 py-1.5 bg-gray-900/5 text-gray-900 rounded-lg text-[8px] font-black uppercase tracking-widest border border-gray-900/5">
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
					<div className="mt-6 flex items-center justify-between bg-white/70 backdrop-blur-xl p-3 rounded-[1.5rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
						<button
							onClick={() => {
								const newPage = Math.max(1, currentPage - 1);
								setCurrentPage(newPage);
								setSearchParams({ page: newPage.toString() });
							}}
							disabled={currentPage === 1}
							className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all duration-300 disabled:opacity-50"
						>
							<ChevronLeft className="h-4 w-4" />{" "}
							<span className="hidden md:block">Précédent</span>
						</button>
						<div className="flex items-center gap-2">
							{/* Page 1 & 2 - Toujours visibles */}
							{[1, 2].map(
								(p) =>
									p <= totalPages && (
										<button
											key={p}
											onClick={() => {
												setCurrentPage(p);
												setSearchParams({ page: p.toString() });
											}}
											className={`w-8 h-8 rounded-lg text-[9px] font-black transition-all duration-300 ${
												currentPage === p
													? "bg-gray-900 text-white shadow-xl shadow-gray-200"
													: "text-gray-400 hover:bg-gray-50"
											}`}
										>
											{p}
										</button>
									)
							)}

							{/* Mobile: Ellipsis et Dernière page */}
							{totalPages > 3 && (
								<span className="md:hidden text-gray-400 font-black">...</span>
							)}
							{totalPages > 2 && (
								<button
									onClick={() => {
										setCurrentPage(totalPages);
										setSearchParams({ page: totalPages.toString() });
									}}
									className={`w-8 h-8 rounded-lg text-[9px] font-black transition-all duration-300 md:hidden ${
										currentPage === totalPages
											? "bg-gray-900 text-white shadow-xl shadow-gray-200"
											: "text-gray-400 hover:bg-gray-50"
									}`}
								>
									{totalPages}
								</button>
							)}

							{/* Tablet: Pages 3 & 4 */}
							{[3, 4].map(
								(p) =>
									p <= totalPages && (
										<button
											key={p}
											onClick={() => {
												setCurrentPage(p);
												setSearchParams({ page: p.toString() });
											}}
											className={`w-8 h-8 rounded-lg text-[9px] font-black transition-all duration-300 hidden md:flex items-center justify-center lg:hidden ${
												currentPage === p
													? "bg-gray-900 text-white shadow-xl shadow-gray-200"
													: "text-gray-400 hover:bg-gray-50"
											}`}
										>
											{p}
										</button>
									)
							)}

							{/* Tablet: Ellipsis et Dernière page */}
							{totalPages > 5 && (
								<span className="hidden md:block lg:hidden text-gray-400 font-black">
									...
								</span>
							)}
							{totalPages > 4 && (
								<button
									onClick={() => {
										setCurrentPage(totalPages);
										setSearchParams({ page: totalPages.toString() });
									}}
									className={`w-8 h-8 rounded-lg text-[9px] font-black transition-all duration-300 hidden md:flex items-center justify-center lg:hidden ${
										currentPage === totalPages
											? "bg-gray-900 text-white shadow-xl shadow-gray-200"
											: "text-gray-400 hover:bg-gray-50"
									}`}
								>
									{totalPages}
								</button>
							)}

							{/* Desktop: Pages 3 à 10 */}
							{[3, 4, 5, 6, 7, 8, 9, 10].map(
								(p) =>
									p <= totalPages && (
										<button
											key={p}
											onClick={() => {
												setCurrentPage(p);
												setSearchParams({ page: p.toString() });
											}}
											className={`w-8 h-8 rounded-lg text-[9px] font-black transition-all duration-300 hidden lg:flex items-center justify-center ${
												currentPage === p
													? "bg-gray-900 text-white shadow-xl shadow-gray-200"
													: "text-gray-400 hover:bg-gray-50"
											}`}
										>
											{p}
										</button>
									)
							)}

							{/* Desktop: Ellipsis et Dernière page si > 10 */}
							{totalPages > 11 && (
								<span className="hidden lg:block text-gray-400 font-black">
									...
								</span>
							)}
							{totalPages > 10 && (
								<button
									onClick={() => {
										setCurrentPage(totalPages);
										setSearchParams({ page: totalPages.toString() });
									}}
									className={`w-8 h-8 rounded-lg text-[9px] font-black transition-all duration-300 hidden lg:flex items-center justify-center ${
										currentPage === totalPages
											? "bg-gray-900 text-white shadow-xl shadow-gray-200"
											: "text-gray-400 hover:bg-gray-50"
									}`}
								>
									{totalPages}
								</button>
							)}
						</div>
						<button
							onClick={() => {
								const newPage = Math.min(totalPages, currentPage + 1);
								setCurrentPage(newPage);
								setSearchParams({ page: newPage.toString() });
							}}
							disabled={currentPage === totalPages}
							className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all duration-300 disabled:opacity-50"
						>
							<span className="hidden md:block">Suivant</span>{" "}
							<ChevronRight className="h-4 w-4" />
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
