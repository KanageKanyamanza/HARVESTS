import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
	consumerService,
	producerService,
	transformerService,
	restaurateurService,
	orderService,
	transporterService,
	exporterService,
} from "../../services";
import { adminService } from "../../services/adminService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import OrderStatusBadge, {
	getStatusConfig,
} from "../../components/orders/OrderStatusBadge";
import OrderActions from "../../components/orders/OrderActions";
import OrderItemsList from "../../components/orders/OrderItemsList";
import {
	DeliveryAddressCard,
	OrderSummaryCard,
	DeliveryInfoCard,
	TransporterCard,
} from "../../components/orders/OrderSidebar";
import {
	FiArrowLeft,
	FiRefreshCw,
	FiAlertCircle,
	FiCalendar,
	FiPackage,
	FiShoppingCart,
	FiShield,
	FiDownload,
} from "react-icons/fi";

const formatDate = (dateString) => {
	if (!dateString) return "N/A";
	return new Date(dateString).toLocaleDateString("fr-FR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const OrderDetail = () => {
	const { id, orderId } = useParams();
	const orderIdParam = id || orderId;
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useAuth();
	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [updating, setUpdating] = useState(false);

	const isAdminContext = location.pathname.startsWith("/admin/orders");

	const loadOrderDetails = useCallback(async () => {
		if (!orderIdParam || !user) {
			navigate("/dashboard");
			return;
		}

		try {
			setLoading(true);
			setError(null);
			let response;

			if (isAdminContext) {
				response = await adminService.getOrderById(orderIdParam);
				if (response.status === "success" && response.data?.order)
					setOrder(response.data.order);
				else setError("Commande non trouvée");
			} else {
				const services = {
					consumer: consumerService.getMyOrder,
					producer: producerService.getOrder,
					transformer: transformerService.getMyOrder,
					restaurateur: restaurateurService.getOrder,
					transporter: transporterService.getOrder,
					exporter: exporterService.getOrder,
				};
				const service = services[user.userType] || orderService.getOrder;
				response = await service(orderIdParam);

				if (response.data.status === "success")
					setOrder(response.data.data.order);
				else setError("Commande non trouvée");
			}
		} catch (error) {
			console.error("Erreur chargement commande:", error);
			setError("Erreur lors du chargement");
		} finally {
			setLoading(false);
		}
	}, [orderIdParam, user, navigate, isAdminContext]);

	useEffect(() => {
		loadOrderDetails();
	}, [loadOrderDetails]);

	const updateOrderStatus = async (newStatus, options = {}) => {
		if (!order || updating) return;
		setUpdating(true);

		try {
			const payload = {
				status: newStatus,
				segmentId: order.segment?.id || order.segment?._id,
				...(options.itemId ? { itemId: options.itemId } : {}),
				...(options.itemIds ? { itemIds: options.itemIds } : {}),
			};

			if (isAdminContext) {
				await adminService.updateOrderStatus(order._id, newStatus);
			} else if (user.userType === "producer") {
				await producerService.updateOrderStatus(order._id, payload);
			} else if (user.userType === "transformer") {
				await transformerService.updateOrderStatus(order._id, payload);
			} else if (user.userType === "restaurateur") {
				await restaurateurService.updateOrderStatus(order._id, payload);
			} else if (
				user.userType === "transporter" ||
				user.userType === "exporter"
			) {
				let deliveryStatus = newStatus;
				if (newStatus === "ready-for-pickup") deliveryStatus = "picked-up";
				else if (newStatus === "in-transit" || newStatus === "out-for-delivery")
					deliveryStatus = "in-transit";
				else if (newStatus === "delivered") deliveryStatus = "delivered";

				const service =
					user.userType === "transporter" ?
						transporterService
					:	exporterService;
				await service.updateOrderStatus(order._id, {
					status: deliveryStatus,
					location: order.delivery?.deliveryAddress?.city || null,
					note: `Statut mis à jour par ${user?.firstName || user.userType}`,
				});
			} else {
				await orderService.updateOrderStatus(order._id, payload);
			}
			await loadOrderDetails();
		} catch (error) {
			console.error(`Erreur mise à jour statut:`, error);
		} finally {
			setUpdating(false);
		}
	};

	const cancelOrder = () => updateOrderStatus("cancelled");
	const prepareOrder = () => updateOrderStatus("preparing");
	const readyOrder = () => updateOrderStatus("ready-for-pickup");
	const deliverOrder = () => updateOrderStatus("delivered");
	const completeOrder = () => updateOrderStatus("completed");

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
				<LoadingSpinner size="lg" text="Chargement du dossier de commande..." />
			</div>
		);
	}

	if (error || !order) {
		return (
			<div className="max-w-4xl mx-auto px-4 py-20 animate-fade-in">
				<div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-12 text-center border border-white/60 shadow-xl">
					<div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
						<FiAlertCircle className="h-12 w-12 text-rose-500" />
					</div>
					<h3 className="text-3xl font-[1000] text-gray-900 tracking-tight mb-4">
						{error || "Commande non identifiée"}
					</h3>
					<p className="text-gray-500 mb-10 max-w-md mx-auto font-medium">
						Nous n'avons pas pu accéder à cette commande. Elle a peut-être été
						supprimée ou vous n'avez pas les droits nécessaires.
					</p>
					<button
						onClick={() => navigate(-1)}
						className="inline-flex items-center px-12 py-4 bg-gray-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all duration-300 shadow-xl shadow-gray-200"
					>
						<FiArrowLeft className="mr-3 h-4 w-4" />
						Retourner à la liste
					</button>
				</div>
			</div>
		);
	}

	const isAdmin = user?.role === "admin" || user?.userType === "admin";
	const buyerId =
		order?.buyer?._id ||
		order?.buyer?.id ||
		(typeof order?.buyer === "string" ? order.buyer : null);
	const userId = user?._id || user?.id;
	const isBuyerView =
		(user?.userType === "consumer" || user?.userType === "restaurateur") &&
		buyerId === userId;
	const isSellerView = ["producer", "transformer", "restaurateur"].includes(
		user?.userType,
	);
	const isTransporterView =
		user?.userType === "transporter" || user?.userType === "exporter";

	const displayedStatus = order.segment?.status || order.status;
	const statusConfig = getStatusConfig(displayedStatus);
	const StatusIcon = statusConfig.icon;

	const deliveryFee =
		order.originalTotals?.deliveryFee ??
		order.deliveryFee ??
		order.delivery?.deliveryFee ??
		0;
	const deliveryDetail =
		order.originalTotals?.deliveryFeeDetail ||
		order.deliveryFeeDetail ||
		order.delivery?.feeDetail ||
		null;

	return (
		<div className="min-h-screen pb-20 relative overflow-hidden bg-harvests-light/10">
			{/* High-end Background Decoration */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-100/40 rounded-full blur-[140px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[30%] left-[20%] w-[10%] h-[10%] bg-amber-100/20 rounded-full blur-[60px]"></div>
			</div>

			<div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10">
				{/* Global Navigation & Breadcrumb */}
				<div className="flex items-center gap-4 mb-10 animate-fade-in-down">
					<button
						onClick={() => navigate(-1)}
						className="w-12 h-12 bg-white/70 backdrop-blur-xl rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 border border-white/60 shadow-sm transition-all hover:-translate-x-1"
					>
						<FiArrowLeft className="h-5 w-5" />
					</button>
					<div className="flex flex-col">
						<span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-0.5">
							Détails de transaction
						</span>
						<div className="flex flex-wrap items-center gap-2">
							<h4 className="text-gray-900 font-[1000] text-xl tracking-tight">
								#{order.orderNumber || order._id.slice(-8).toUpperCase()}
							</h4>
							<span className="w-1 h-1 bg-gray-300 rounded-full"></span>
							<span className="text-xs font-bold text-gray-400">
								{formatDate(order.createdAt)}
							</span>
						</div>
					</div>
				</div>

				{/* Premium Hero Header */}
				<div className="mb-12 animate-fade-in-up">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
						<div className="lg:col-span-8 bg-white/70 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 border border-white/60 shadow-sm relative overflow-hidden flex flex-col justify-center">
							<div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
								<FiPackage className="w-48 h-48" />
							</div>
							<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
								<div className="space-y-4">
									<div className="flex flex-wrap items-center gap-4">
										<div className="w-16 h-16 bg-gray-900 text-white rounded-3xl flex items-center justify-center shadow-2xl">
											<FiShoppingCart className="h-8 w-8" />
										</div>
										<div>
											<h1 className="text-3xl md:text-5xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
												Bon de{" "}
												<span className="text-emerald-600">Commande.</span>
											</h1>
											<div className="flex items-center gap-2">
												<FiShield className="text-emerald-500 h-3.5 w-3.5" />
												<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
													Transaction sécurisée par Harvests
												</span>
											</div>
										</div>
									</div>
								</div>
								<div className="flex flex-wrap items-center gap-3">
									<div className="px-2 py-3 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
										<OrderStatusBadge status={displayedStatus} />
									</div>
									<button
										onClick={() => window.location.reload()}
										className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-emerald-600 transition-colors bg-white/40 px-4 py-2 rounded-xl"
									>
										<FiRefreshCw
											className={`h-3 w-3 ${updating ? "animate-spin" : ""}`}
										/>
										Actualiser les données
									</button>
								</div>
							</div>
						</div>

						<div className="lg:col-span-4 bg-gray-900 rounded-[3rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center">
							<div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mb-10 -mr-10"></div>
							<div className="relative z-10">
								<p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">
									Actions rapides
								</p>
								<OrderActions
									displayedStatus={displayedStatus}
									order={order}
									user={user}
									updating={updating}
									cancelOrder={cancelOrder}
									prepareOrder={prepareOrder}
									readyOrder={readyOrder}
									deliverOrder={deliverOrder}
									completeOrder={completeOrder}
									updateOrderStatus={updateOrderStatus}
									isSellerView={isSellerView}
									isTransporterView={isTransporterView}
									isAdmin={isAdmin}
									isBuyerView={isBuyerView}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Detailed Status Instruction */}
				<div className="bg-emerald-600 rounded-[2.5rem] p-8 md:p-10 mb-10 text-white shadow-xl relative overflow-hidden animate-fade-in delay-75">
					<div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
						<StatusIcon className="h-40 w-40" />
					</div>
					<div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
						<div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white border border-white/20 shrink-0">
							<StatusIcon className="h-10 w-10" />
						</div>
						<div className="flex-1">
							<h3 className="text-xl font-black text-white/80 tracking-tight uppercase mb-2 text-[11px] tracking-[0.2em]">
								{isSellerView ?
									"Instructions de traitement"
								:	"Suivi de votre commande"}
							</h3>
							<p className="text-white font-bold text-2xl md:text-3xl tracking-tight leading-tight">
								{statusConfig.description}
							</p>
						</div>
						{order.delivery?.estimatedDeliveryDate && (
							<div className="bg-white/10 backdrop-blur-md rounded-[2rem] px-4 py-4 border border-white/20">
								<p className="text-[9px] font-black text-emerald-100 uppercase tracking-widest mb-1">
									Livraison estimée
								</p>
								<div className="flex items-center gap-3">
									<FiCalendar className="text-emerald-300" />
									<span className="text-lg font-black tracking-tight">
										{
											formatDate(order.delivery.estimatedDeliveryDate).split(
												" à ",
											)[0]
										}
									</span>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Two-Column Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
					{/* Left Column: Items & Delivery details */}
					<div className="lg:col-span-8 space-y-10 animate-fade-in delay-200">
						<OrderItemsList
							order={order}
							isSellerView={isSellerView}
							updateOrderStatus={updateOrderStatus}
							updating={updating}
						/>
						<TransporterCard order={order} />
					</div>

					{/* Right Column: Address & Summary */}
					<div className="lg:col-span-4 space-y-10 animate-fade-in delay-300">
						<DeliveryAddressCard order={order} user={user} />
						<OrderSummaryCard
							order={order}
							isSellerView={isSellerView}
							deliveryFee={deliveryFee}
							deliveryDetail={deliveryDetail}
						/>
						<DeliveryInfoCard order={order} />

						{/* Download Quote/Invoice Placeholders */}
						<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/60 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all cursor-pointer">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
									<FiDownload className="h-5 w-5" />
								</div>
								<div>
									<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
										Documents
									</p>
									<h4 className="font-black text-gray-900 tracking-tight">
										Télécharger la facture
									</h4>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderDetail;
