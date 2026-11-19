import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
	FiCheckCircle,
	FiClock,
	FiHome,
	FiLoader,
	FiShoppingBag,
	FiXCircle,
} from "react-icons/fi";
import { paymentService } from "../../services";
import { useAuth } from "../../hooks/useAuth";

// Jour 79 — return_url du payin mobile money. La page ne proclame jamais un
// succès sans confirmation : elle repolle le /status (source de vérité, J78),
// puis affiche l'état réel — le webhook peut arriver après la redirection.
const CHECK_INTERVAL_MS = 4000;
const MAX_CHECKS = 15; // ~1 minute après le retour d'AfriBaPay

const readStoredPaymentId = (orderId) => {
	if (!orderId) return null;
	try {
		const stored = JSON.parse(
			sessionStorage.getItem(`harvests_mobile_money_${orderId}`) || "null"
		);
		return stored?.paymentId || null;
	} catch {
		return null;
	}
};

const MobileMoneySuccess = () => {
	const { t } = useTranslation("payment");
	const { user } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const params = new URLSearchParams(location.search);
	const orderId = params.get("orderId");
	const paymentId = params.get("paymentId") || readStoredPaymentId(orderId);

	const [state, setState] = useState({
		loading: Boolean(paymentId),
		status: null,
		error: null,
	});
	const checksRef = useRef(0);
	const timerRef = useRef(null);
	const mountedRef = useRef(true);

	const confirmRoute = orderId
		? user?.userType === "restaurateur"
			? `/restaurateur/orders/${orderId}/confirmation`
			: `/consumer/orders/${orderId}/confirmation`
		: null;

	const clearTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const checkStatus = useCallback(async () => {
		if (!paymentId) {
			setState({
				loading: false,
				status: null,
				error: t("errors.notFound"),
			});
			return;
		}

		try {
			const response = await paymentService.getAfribapayStatus(paymentId);
			if (!mountedRef.current) return;
			const payment = response.data?.data?.payment || null;
			const status = payment?.status || null;

			if (["succeeded", "refunded", "partially_refunded"].includes(status)) {
				clearTimer();
				setState({ loading: false, status: "succeeded", payment, error: null });
			} else if (["failed", "cancelled"].includes(status)) {
				clearTimer();
				setState({ loading: false, status, payment, error: null });
			} else {
				setState({ loading: false, status: "pending", payment, error: null });
			}
		} catch (error) {
			if (!mountedRef.current) return;
			clearTimer();
			setState({
				loading: false,
				status: null,
				error:
					error.response?.data?.message ||
					t("errors.loadError"),
			});
		}
	}, [clearTimer, paymentId, t]);

	useEffect(() => {
		mountedRef.current = true;
		checkStatus();

		timerRef.current = setInterval(() => {
			checksRef.current += 1;
			if (checksRef.current >= MAX_CHECKS) {
				clearTimer();
				return;
			}
			checkStatus();
		}, CHECK_INTERVAL_MS);

		return () => {
			mountedRef.current = false;
			clearTimer();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [paymentId]);

	const isSuccess = state.status === "succeeded";
	const isFailure = ["failed", "cancelled"].includes(state.status);

	if (state.loading) {
		return (
			<div className="min-h-screen bg-[#F8FAF6] py-10 px-4">
				<div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-agri-card border border-emerald-100/80 p-8 text-center">
					<FiLoader className="h-10 w-10 mx-auto text-[#1A5514] animate-spin" />
					<h1 className="mt-4 text-xl font-extrabold text-[#161D14]">
						{t("success.pendingTitle")}
					</h1>
					<p className="mt-2 text-sm text-gray-500">
						{t("success.pendingText")}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#F8FAF6] py-10 px-4">
			<div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-agri-card border border-emerald-100/80 p-8 text-center">
				<div
					className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
						isSuccess
							? "bg-emerald-50"
							: isFailure || state.error
							? "bg-red-50"
							: "bg-amber-50"
					}`}
				>
					{isSuccess ? (
						<FiCheckCircle className="h-8 w-8 text-[#1A5514]" />
					) : isFailure || state.error ? (
						<FiXCircle className="h-8 w-8 text-red-600" />
					) : (
						<FiClock className="h-8 w-8 text-amber-600" />
					)}
				</div>

				<h1 className="mt-4 text-xl font-extrabold text-[#161D14]">
					{isSuccess
						? t("success.title")
						: isFailure
						? t("success.failedTitle")
						: state.error
						? t("errors.loadError")
						: t("success.pendingTitle")}
				</h1>
				<p className="mt-2 text-sm text-gray-500">
					{isSuccess
						? t("success.text")
						: isFailure
						? t("success.failedText")
						: state.error
						? state.error
						: t("success.pendingText")}
				</p>

				<div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
					{confirmRoute && (
						<button
							type="button"
							onClick={() => navigate(confirmRoute)}
							className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-white bg-gradient-to-r from-[#1A5514] to-[#31BC2E] shadow-lg shadow-emerald-900/20 hover:shadow-xl transition-all"
						>
							<FiShoppingBag className="mr-2 h-5 w-5" />
							{t("success.viewOrder")}
						</button>
					)}
					{!isSuccess && !isFailure && (
						<button
							type="button"
							onClick={checkStatus}
							className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-[#1A5514] bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
						>
							<FiClock className="mr-2 h-5 w-5" />
							{t("success.checkAgain")}
						</button>
					)}
					<button
						type="button"
						onClick={() => navigate("/consumer/orders")}
						className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
					>
						<FiShoppingBag className="mr-2 h-5 w-5" />
						{t("success.viewOrders")}
					</button>
					<button
						type="button"
						onClick={() => navigate("/")}
						className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
					>
						<FiHome className="mr-2 h-5 w-5" />
						{t("success.home")}
					</button>
				</div>
			</div>
		</div>
	);
};

export default MobileMoneySuccess;
