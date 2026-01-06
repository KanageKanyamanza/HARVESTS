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
	ChevronLeft,
	RefreshCw,
	AlertCircle,
	Calendar,
	Package,
	ShoppingCart,
	ArrowLeft,
} from "lucide-react";

const formatDate = (dateString) =>
	new Date(dateString).toLocaleDateString("fr-FR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

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
					user.userType === "transporter"
						? transporterService
						: exporterService;
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
			<div className="flex items-center justify-center min-h-[400px]">
				<LoadingSpinner size="lg" text="Chargement des détails..." />
			</div>
		);
	}

	if (error || !order) {
		return (
			<div className="max-w-4xl mx-auto px-4 py-20">
				<div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-12 text-center border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
					<AlertCircle className="mx-auto h-20 w-20 text-rose-400 mb-6" />
					<h3 className="text-3xl font-[1000] text-gray-900 tracking-tight mb-2">
						{error || "Commande non trouvée"}
					</h3>
					<p className="text-gray-500 mb-8">
						La commande n'existe pas ou vous n'avez pas l'autorisation de la
						consulter.
					</p>
					<button
						onClick={() => navigate(-1)}
						className="inline-flex items-center px-10 py-4 bg-gray-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all duration-300 shadow-xl"
					>
						<ArrowLeft className="mr-3 h-4 w-4" />
						Retour
					</button>
				</div>
			</div>
		);
	}

	const isAdmin = user?.role === "admin" || user?.userType === "admin";
	const buyerId =
		order?.buyer?._id?.toString?.() ||
		order?.buyer?.id?.toString?.() ||
		(typeof order?.buyer?.toString === "function"
			? order.buyer.toString()
			: null);
	const userId = user?._id?.toString?.() || user?.id?.toString?.();
	const isBuyerView =
		(user?.userType === "consumer" || user?.userType === "restaurateur") &&
		buyerId &&
		userId &&
		buyerId === userId;
	const isSellerView = ["producer", "transformer", "restaurateur"].includes(
		user?.userType
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
		<div className="min-h-screen pb-20 relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="max-w-[1400px] mx-auto px-4 py-12 relative z-10">
				{/* Header */}
				<div className="mb-12 animate-fade-in-down">
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
						<div className="flex items-center gap-6">
							<button
								onClick={() => navigate(-1)}
								className="w-14 h-14 bg-white/70 backdrop-blur-xl rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 border border-white/60 shadow-sm transition-all hover:scale-105 active:scale-95"
							>
								<ArrowLeft className="h-6 w-6" />
							</button>
							<div>
								<div className="flex items-center gap-3 mb-2">
									<h1 className="text-4xl md:text-5xl font-[1000] text-gray-900 tracking-tighter leading-none">
										Commande{" "}
										<span className="text-green-600">
											#{order.orderNumber || order._id.slice(-8).toUpperCase()}
										</span>
									</h1>
								</div>
								<p className="text-gray-500 font-medium flex items-center gap-2">
									<Package className="h-4 w-4 text-green-500" />
									Passée le {formatDate(order.createdAt)}
								</p>
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-4 bg-white/70 backdrop-blur-xl p-3 rounded-[2rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
							<div className="px-6 py-3">
								<OrderStatusBadge status={displayedStatus} />
							</div>
							<button
								onClick={() => window.location.reload()}
								className="p-3 bg-gray-50 text-gray-400 hover:text-green-600 rounded-xl transition-all border border-transparent hover:border-green-100 shadow-sm"
								title="Actualiser"
							>
								<RefreshCw className="h-5 w-5" />
							</button>
							<div className="h-8 w-px bg-gray-100 mx-2 hidden md:block" />
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

				{/* Status Description Card */}
				<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 mb-10 border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)] animate-fade-in">
					<div className="flex items-start gap-6">
						<div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 flex-shrink-0">
							<StatusIcon className="h-8 w-8" />
						</div>
						<div className="flex-1">
							<h3 className="text-xl font-[1000] text-gray-900 tracking-tight uppercase mb-2">
								{isSellerView
									? "Statut de la commande"
									: "Statut de votre commande"}
							</h3>
							<p className="text-gray-600 font-medium text-lg leading-relaxed">
								{statusConfig.description}
							</p>
							{order.delivery?.estimatedDeliveryDate &&
								order.status !== "delivered" &&
								order.status !== "cancelled" && (
									<div className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-green-50 text-green-700 rounded-2xl border border-green-100 animate-pulse">
										<Calendar className="h-4 w-4" />
										<span className="text-[10px] font-black uppercase tracking-widest">
											Livraison prévue :{" "}
											{formatDate(order.delivery.estimatedDeliveryDate)}
										</span>
									</div>
								)}
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-10 animate-fade-in delay-100">
						<OrderItemsList
							order={order}
							isSellerView={isSellerView}
							updateOrderStatus={updateOrderStatus}
							updating={updating}
						/>
						<TransporterCard order={order} />
					</div>

					{/* Sidebar */}
					<div className="space-y-10 animate-fade-in delay-200">
						<DeliveryAddressCard order={order} user={user} />
						<OrderSummaryCard
							order={order}
							isSellerView={isSellerView}
							deliveryFee={deliveryFee}
							deliveryDetail={deliveryDetail}
						/>
						<DeliveryInfoCard order={order} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderDetail;
