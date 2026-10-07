import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../hooks/useAuth";
import {
	consumerService,
	orderService,
	paymentService,
} from "../../../services";
import PayPalPaymentSection from "../../../components/orders/PayPalPaymentSection";
import { 
	SuccessHeader, 
	OrderInfoCard, 
	OrderItemsCard, 
	OrderSummaryCard, 
	DeliveryAddressCard, 
	PaymentInfoCard, 
	NextStepsCard, 
	ActionButtons 
} from "../../../components/orders/OrderConfirmationComponents";
import { getStatusConfig } from "../../../utils/orderUIUtils";
import { FiShoppingBag, FiArrowRight, FiHome } from "react-icons/fi";
import { useCurrency } from "../../../contexts/CurrencyContext";
import { CURRENCIES, DEFAULT_CURRENCY } from "../../../config/currencies";

const OrderConfirmation = () => {
	const { t } = useTranslation("dashboard-consumer");
	const { orderId } = useParams();
	const { user, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const { currency } = useCurrency();
	const [order, setOrder] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [paymentProcessing, setPaymentProcessing] = useState(false);
	const [paymentError, setPaymentError] = useState(null);
	const paymentIdRef = useRef(null);
	const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
	const paypalCurrency = "USD";
	const orderKey = order?._id || order?.id || null;

	const fetchOrder = useCallback(async () => {
		if (!orderId) {
			setError(t("confirmation.errors.missingId"));
			setLoading(false);
			return;
		}
		if (!isAuthenticated) {
			setError(t("confirmation.errors.notLoggedIn"));
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			setError(null);
			let response;

			if (["consumer", "restaurateur"].includes(user?.userType)) {
				try {
					response = await consumerService.getMyOrder(orderId);
					if (response.data.status === "success") {
						setOrder(response.data.data?.order || response.data.order);
						setPaymentProcessing(false);
						return;
					}
				} catch {
					/* fallback */
				}
			}

			response = await orderService.getOrder(orderId);
			if (response.data.status === "success")
				setOrder(response.data.data?.order || response.data.order);
			else setError(t("confirmation.errors.notFound"));
		} catch (error) {
			if (error.response?.status === 404) setError(t("confirmation.errors.notFound"));
			else if (error.response?.status === 403)
				setError(t("confirmation.errors.forbidden"));
			else setError(t("confirmation.errors.loadError"));
		} finally {
			setLoading(false);
			setPaymentProcessing(false);
		}
		// `t` exclu : changer de langue ne doit pas recharger la commande
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [orderId, isAuthenticated, user]);

	useEffect(() => {
		fetchOrder();
	}, [fetchOrder]);

	const handleFallbackPayment = useCallback(async () => {
		if (!orderKey) {
			setPaymentError(t("paypal.orderNotFound"));
			return;
		}
		try {
			setPaymentProcessing(true);
			setPaymentError(null);
			const origin = window.location.origin;
			const response = await paymentService.initiatePayment({
				orderId: orderKey,
				method: "paypal",
				returnUrl: `${origin}/payments/paypal/success?orderId=${orderKey}`,
				cancelUrl: `${origin}/payments/paypal/cancel?orderId=${orderKey}`,
			});
			const payload = response.data?.data;
			const paymentId =
				payload?.payment?.paymentId ||
				payload?.payment?.id ||
				payload?.paymentId ||
				null;
			if (paymentId)
				sessionStorage.setItem(
					`harvests_paypal_payment_${orderKey}`,
					paymentId
				);
			if (payload?.approvalUrl) {
				window.location.href = payload.approvalUrl;
				return;
			}
			setPaymentError(t("paypal.linkNotFound"));
		} catch (err) {
			setPaymentError(
				err.response?.data?.message ||
					err.message ||
					t("paypal.initPaymentError")
			);
		} finally {
			setPaymentProcessing(false);
		}
	}, [orderKey, t]);

	const createPayPalOrder = useCallback(async () => {
		if (!orderKey) throw new Error(t("paypal.orderNotFound"));
		try {
			setPaymentProcessing(true);
			setPaymentError(null);
			const origin = window.location.origin;
			const response = await paymentService.initiatePayment({
				orderId: orderKey,
				method: "paypal",
				returnUrl: `${origin}/payments/paypal/success?orderId=${orderKey}`,
				cancelUrl: `${origin}/payments/paypal/cancel?orderId=${orderKey}`,
			});
			const payload = response.data?.data;
			const paymentId =
				payload?.payment?.paymentId ||
				payload?.payment?.id ||
				payload?.paymentId ||
				null;
			paymentIdRef.current = paymentId;
			if (paymentId)
				sessionStorage.setItem(
					`harvests_paypal_payment_${orderKey}`,
					paymentId
				);
			if (!payload?.paypalOrderId)
				throw new Error(t("paypal.paypalIdNotFound"));
			return payload.paypalOrderId;
		} catch (err) {
			setPaymentError(
				err.response?.data?.message ||
					err.message ||
					t("paypal.contactError")
			);
			setPaymentProcessing(false);
			throw err;
		}
	}, [orderKey, t]);

	const handlePayPalApprove = useCallback(
		async (data) => {
			if (!orderKey) {
				setPaymentError(t("paypal.orderNotFound"));
				setPaymentProcessing(false);
				return;
			}
			try {
				const paymentId =
					paymentIdRef.current ||
					sessionStorage.getItem(`harvests_paypal_payment_${orderKey}`);
				if (!paymentId) throw new Error(t("paypal.paymentIdNotFound"));
				await paymentService.confirmPayment(paymentId, {
					paypalOrderId: data.orderID,
				});
				sessionStorage.setItem(`harvests_paypal_confirmed_${orderKey}`, "true");
				await fetchOrder();
				setPaymentError(null);
				navigate(
					`/payments/paypal/success?orderId=${orderKey}&paymentId=${paymentId}`
				);
			} catch (err) {
				setPaymentError(
					err.response?.data?.message ||
						err.message ||
						t("paypal.confirmError")
				);
			} finally {
				setPaymentProcessing(false);
			}
		},
		[fetchOrder, orderKey, navigate, t]
	);

	const handlePayPalCancel = useCallback(() => {
		setPaymentError(t("paypal.cancelled"));
		setPaymentProcessing(false);
		if (orderKey) navigate(`/payments/paypal/cancel?orderId=${orderKey}`);
	}, [navigate, orderKey, t]);

	const handlePayPalError = useCallback((err) => {
		setPaymentError(err?.message || t("paypal.unexpectedError"));
		setPaymentProcessing(false);
	}, [t]);

	const handleDownloadInvoice = async () => {
		if (!orderId) {
			console.error(
				"[OrderConfirmation] Pas d'ID de commande pour télécharger la facture"
			);
			return;
		}

		try {
			console.log(
				"[OrderConfirmation] Téléchargement de la facture pour la commande:",
				orderId
			);
			setLoading(true);

			const targetCurrency = currency || DEFAULT_CURRENCY;
			const exchangeRate =
				CURRENCIES.find((c) => c.code === targetCurrency)?.exchangeRate || 1;

			const response = await orderService.generateInvoice(
				orderId,
				targetCurrency,
				exchangeRate
			);

			// Créer un blob à partir de la réponse
			const blob = new Blob([response.data], { type: "application/pdf" });
			const url = window.URL.createObjectURL(blob);

			// Créer un lien de téléchargement
			const link = document.createElement("a");
			link.href = url;
			const invoiceNumber =
				order?.invoiceNumber ||
				order?.orderNumber ||
				`INV-${orderId.substring(0, 8).toUpperCase()}`;
			link.download = t("confirmation.invoiceFile", { number: invoiceNumber });

			// Déclencher le téléchargement
			document.body.appendChild(link);
			link.click();

			// Nettoyer
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			console.log("[OrderConfirmation] Facture téléchargée avec succès");
		} catch (error) {
			console.error(
				"[OrderConfirmation] Erreur lors du téléchargement de la facture:",
				error
			);
			if (error.response?.status === 403) {
				window.alert(t("confirmation.errors.invoiceForbidden"));
			} else if (error.response?.status === 404) {
				window.alert(t("confirmation.errors.invoiceNotFound"));
			} else {
				window.alert(t("confirmation.errors.invoiceError"));
			}
		} finally {
			setLoading(false);
		}
	};
	const handleShareOrder = () => {
		if (navigator.share)
			navigator.share({
				title: t("confirmation.orderNumber", { number: order?.orderNumber }),
				text: t("confirmation.shareText"),
				url: window.location.href,
			});
		else navigator.clipboard.writeText(window.location.href);
	};

	// Chargement : l'en-tête de confirmation (texte fixe) s'affiche tout de
	// suite, seules les cartes de la commande attendent le serveur
	if (loading) {
		return (
			<div className="dashboard-page bg-[#F8FAF6]">
				<div className="dashboard-container">
					<SuccessHeader />
					<div className="space-y-4 animate-pulse" aria-busy="true">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="bg-white rounded-2xl shadow-agri-card border border-emerald-100/80 p-6"
							>
								<div className="h-5 bg-gray-100 rounded-full w-1/3 mb-4"></div>
								<div className="h-4 bg-gray-100 rounded-full"></div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error || !order) {
		return (
			<div className="min-h-screen bg-[#F8FAF6] py-8">
				<div className="max-w-3xl mx-auto px-4">
					<div className="bg-white rounded-3xl shadow-agri-card border border-emerald-100/80 p-10 text-center">
						<div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-emerald-50 flex items-center justify-center">
							<FiShoppingBag className="h-10 w-10 text-[#1A5514]" />
						</div>
						<h2 className="text-xl font-extrabold text-[#161D14] mb-2">
							{error || t("confirmation.errors.notFound")}
						</h2>
						<p className="text-gray-500 mb-6 text-sm">
							{t("confirmation.errors.loadErrorText")}
						</p>
						<div className="flex flex-wrap items-center justify-center gap-3">
							{!isAuthenticated ? (
								<button
									onClick={() => navigate("/login")}
									className="inline-flex items-center bg-gradient-to-r from-[#1A5514] to-[#31BC2E] text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-emerald-900/20 hover:shadow-xl transition-all"
								>
									{t("confirmation.errors.login")}
								</button>
							) : (
								<button
									onClick={() => {
										const userType = user?.userType || "consumer";
										const ordersRoute =
											userType === "restaurateur"
												? "/restaurateur/orders"
												: "/consumer/orders";
										navigate(ordersRoute);
									}}
									className="inline-flex items-center bg-gradient-to-r from-[#1A5514] to-[#31BC2E] text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-emerald-900/20 hover:shadow-xl transition-all"
								>
									<FiArrowRight className="mr-2 h-5 w-5" />
									{t("confirmation.viewOrders")}
								</button>
							)}
							<button
								onClick={() => navigate("/")}
								className="inline-flex items-center px-6 py-3 rounded-full font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
							>
								<FiHome className="mr-2 h-5 w-5" />
								{t("confirmation.home")}
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	const paymentStatus = (order?.payment?.status || "").toLowerCase();
	const isPaypalPayment = order?.payment?.method === "paypal";
	const isPaypalPending =
		isPaypalPayment &&
		!["succeeded", "completed", "paid"].includes(paymentStatus);
	const orderCurrency = (
		order?.currency ||
		order?.payment?.currency ||
		""
	).toUpperCase();
	const showCurrencyNotice =
		Boolean(orderCurrency) && orderCurrency !== paypalCurrency;
	const statusConfig = getStatusConfig(order?.status);

	const confirmedTotals = {
		subtotal: order?.subtotal ?? order?.originalTotals?.subtotal ?? 0,
		taxes: order?.taxes ?? order?.originalTotals?.taxes ?? 0,
		discount: order?.discount ?? order?.originalTotals?.discount ?? 0,
		total: order?.total ?? order?.originalTotals?.total ?? 0,
	};

	return (
		<div className="dashboard-page bg-[#F8FAF6]">
			<div className="dashboard-container">
				<SuccessHeader />

				{isPaypalPending && (
					<PayPalPaymentSection
						user={user}
						paypalClientId={paypalClientId}
						paypalCurrency={paypalCurrency}
						orderCurrency={orderCurrency}
						showCurrencyNotice={showCurrencyNotice}
						paymentProcessing={paymentProcessing}
						paymentError={paymentError}
						createPayPalOrder={createPayPalOrder}
						handlePayPalApprove={handlePayPalApprove}
						handlePayPalCancel={handlePayPalCancel}
						handlePayPalError={handlePayPalError}
						handleFallbackPayment={handleFallbackPayment}
					/>
				)}

				<OrderInfoCard
					order={order}
					statusConfig={statusConfig}
					onDownload={handleDownloadInvoice}
					onShare={handleShareOrder}
					onViewOrders={() => {
						const userType = user?.userType || "consumer";
						const ordersRoute =
							userType === "restaurateur"
								? "/restaurateur/orders"
								: "/consumer/orders";
						navigate(ordersRoute);
					}}
				/>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
					<OrderItemsCard items={order.items} />
					<OrderSummaryCard
						totals={confirmedTotals}
					/>
					<DeliveryAddressCard address={order.delivery?.deliveryAddress} />
					<PaymentInfoCard payment={order.payment} />
				</div>

				<NextStepsCard />
				<ActionButtons
					onHome={() => navigate("/")}
					onViewOrders={() => {
						const userType = user?.userType || "consumer";
						const ordersRoute =
							userType === "restaurateur"
								? "/restaurateur/orders"
								: "/consumer/orders";
						navigate(ordersRoute);
					}}
				/>
			</div>
		</div>
	);
};

export default OrderConfirmation;
