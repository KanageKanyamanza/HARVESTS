import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
	FiCheckCircle,
	FiClock,
	FiLoader,
	FiRefreshCw,
	FiSmartphone,
	FiXCircle,
} from "react-icons/fi";
import { paymentService } from "../../services";
import { formatPrice } from "../../utils/currencyUtils";
import { DEFAULT_CURRENCY } from "../../config/currencies";

// Jour 79 — page d'attente du payin mobile money. Le webhook (J77) peut être
// perdu ou en retard : on repolle `GET /payments/:id/afribapay/status`, qui
// interroge la source de vérité AfriBaPay (J78) avant de renvoyer l'état
// stocké. Aucun succès n'est affiché avant une confirmation serveur.
const POLL_INTERVAL_MS = 5000;
// 120 passages à 5 s = 10 minutes de suivi rapide ; au-delà on passe en
// vérification manuelle (la doc AfriBaPay demande d'éviter les /status
// excessifs, et un payin peut rester PENDING longtemps).
const MAX_QUICK_POLLS = 120;

const SUCCESS_STATUSES = ["succeeded", "refunded", "partially_refunded"];
const FAILURE_STATUSES = ["failed", "cancelled"];

const readStoredContact = (storageKey) => {
	try {
		return JSON.parse(sessionStorage.getItem(storageKey) || "null");
	} catch {
		return null;
	}
};

const MobileMoneyPaymentSection = ({ order, orderId }) => {
	const { t } = useTranslation("payment");
	const navigate = useNavigate();
	const storageKey = `harvests_mobile_money_${orderId}`;
	const [contact, setContact] = useState(() => readStoredContact(storageKey));
	// Numéro modifiable après un échec : la relance part avec ce numéro-là.
	const [phoneDraft, setPhoneDraft] = useState(() => contact?.phone || "");
	const [payment, setPayment] = useState(null);
	const [phase, setPhase] = useState("starting");
	const [error, setError] = useState(null);
	const [retrying, setRetrying] = useState(false);
	// Garde synchrone contre le double clic : l'état `retrying` n'est vu
	// qu'au rendu suivant, deux clics rapprochés partiraient tous les deux.
	const retryingRef = useRef(false);

	const paymentIdRef = useRef(contact?.paymentId || null);
	const timerRef = useRef(null);
	const mountedRef = useRef(true);
	const stoppedRef = useRef(false);
	const inFlightRef = useRef(false);
	const pollsRef = useRef(0);

	const cancelUrl = `/payment/cancel?orderId=${orderId}${
		paymentIdRef.current ? `&paymentId=${paymentIdRef.current}` : ""
	}`;

	const stopPolling = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const goToSuccess = useCallback(
		(nextPayment) => {
			stoppedRef.current = true;
			stopPolling();
			setPhase("succeeded");
			const paymentId = nextPayment?.id || paymentIdRef.current;
			setTimeout(() => {
				if (!mountedRef.current) return;
				navigate(
					`/payment/success?orderId=${orderId}${
						paymentId ? `&paymentId=${paymentId}` : ""
					}`
				);
			}, 1200);
		},
		[navigate, orderId, stopPolling]
	);

	const poll = useCallback(
		async (manual = false) => {
			const paymentId = paymentIdRef.current;
			if (!paymentId || inFlightRef.current || stoppedRef.current) return;

			if (!manual) {
				pollsRef.current += 1;
				if (pollsRef.current > MAX_QUICK_POLLS) {
					stopPolling();
					setPhase("slow");
					return;
				}
			}

			inFlightRef.current = true;
			try {
				const response = await paymentService.getAfribapayStatus(paymentId);
				if (!mountedRef.current) return;
				const nextPayment = response.data?.data?.payment || null;
				if (nextPayment) setPayment(nextPayment);
				setError(null);

				const status = nextPayment?.status;
				if (SUCCESS_STATUSES.includes(status)) {
					goToSuccess(nextPayment);
				} else if (FAILURE_STATUSES.includes(status)) {
					stoppedRef.current = true;
					stopPolling();
					setPhase("failed");
				}
			} catch (requestError) {
				if (!mountedRef.current) return;
				if (requestError.response?.status === 404) {
					stoppedRef.current = true;
					stopPolling();
					setPhase("failed");
					setError(t("errors.notFound"));
				} else {
					// Coupure réseau passagère : on garde la page en attente et on
					// retentera au prochain passage.
					setError(t("waiting.statusError"));
				}
			} finally {
				inFlightRef.current = false;
			}
		},
		[goToSuccess, stopPolling, t]
	);

	// Démarrage : envoie la demande si le checkout n'a pas pu le faire, puis
	// suit le statut. `cancelled` évite un setState après démontage.
	useEffect(() => {
		mountedRef.current = true;
		if (!contact?.operator || !contact?.phone) {
			setPhase("missing");
			return undefined;
		}

		let cancelled = false;

		const start = async () => {
			let paymentId = paymentIdRef.current;

			if (!paymentId) {
				const origin = window.location.origin;
				try {
					const response = await paymentService.initiatePayment({
						orderId,
						method: "mobile_money",
						operator: contact.operator,
						phone: contact.phone,
						country: contact.country,
						returnUrl: `${origin}/payment/success?orderId=${orderId}`,
						cancelUrl: `${origin}/payment/cancel?orderId=${orderId}`,
					});
					if (cancelled) return;
					paymentId = response.data?.data?.payment?.id || null;
					paymentIdRef.current = paymentId;
					sessionStorage.setItem(
						storageKey,
						JSON.stringify({ ...contact, paymentId })
					);
				} catch (requestError) {
					if (cancelled) return;
					setPhase("failed");
					setError(
						requestError.response?.data?.message ||
							t("waiting.initError")
					);
					return;
				}
			}

			if (cancelled) return;
			setPhase("awaiting");
			poll(false);
			stopPolling();
			timerRef.current = setInterval(() => poll(false), POLL_INTERVAL_MS);
		};

		start();

		return () => {
			cancelled = true;
			mountedRef.current = false;
			stopPolling();
		};
		// Démarrage lié à la commande seule : le suivi ne doit pas repartir à
		// chaque rendu. `t` est exclu (et donc `poll`, qui en dépend) : un
		// changement de langue relançait start() et, sans paymentId, un nouvel
		// initiate sans action de l'utilisateur. `contact` est exclu : il ne
		// sert qu'au premier envoi, une relance (handleRetry) le met à jour sans
		// relancer ce démarrage.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [orderId, storageKey]);

	const handleRetry = async () => {
		const phone = phoneDraft.trim();
		if (retryingRef.current || retrying || !contact?.operator || phone.length < 6) return;

		retryingRef.current = true;
		setRetrying(true);
		setError(null);
		stoppedRef.current = false;
		pollsRef.current = 0;

		const nextContact = { ...contact, phone };
		const origin = window.location.origin;
		const payinParams = {
			operator: nextContact.operator,
			phone,
			country: nextContact.country,
			returnUrl: `${origin}/payment/success?orderId=${orderId}`,
			cancelUrl: `${origin}/payment/cancel?orderId=${orderId}`,
		};

		try {
			// Premier envoi raté au checkout : pas encore de paymentId, on
			// relance l'initiation (le backend réutilise le Payment de la commande).
			const response = paymentIdRef.current
				? await paymentService.retryAfribapayPayment(
						paymentIdRef.current,
						payinParams
				  )
				: await paymentService.initiatePayment({
						orderId,
						method: "mobile_money",
						...payinParams,
				  });
			const paymentId =
				response.data?.data?.payment?.id || paymentIdRef.current;
			paymentIdRef.current = paymentId;
			setContact({ ...nextContact, paymentId });
			sessionStorage.setItem(
				storageKey,
				JSON.stringify({ ...nextContact, paymentId })
			);
			setPayment(null);
			if (!mountedRef.current) return;
			setPhase("awaiting");
			stopPolling();
			poll(false);
			timerRef.current = setInterval(() => poll(false), POLL_INTERVAL_MS);
		} catch (requestError) {
			if (!mountedRef.current) return;
			setPhase("failed");
			setError(
				requestError.response?.data?.message || t("waiting.initError")
			);
		} finally {
			retryingRef.current = false;
			if (mountedRef.current) setRetrying(false);
		}
	};

	const operatorName =
		payment?.afribapay?.operatorName || contact?.operator || "";
	const phone = payment?.afribapay?.phone || contact?.phone || "";
	const amount = payment?.amount ?? order?.total ?? 0;
	const currency = payment?.currency || order?.currency || DEFAULT_CURRENCY;

	const isFailed = phase === "failed" || phase === "missing";
	const isSuccess = phase === "succeeded";

	return (
		<div className="mb-5 bg-white rounded-2xl shadow-agri-card border border-emerald-100/80 p-5 sm:p-6">
			<div className="flex items-start">
				<span className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mr-3 flex-shrink-0">
					<FiSmartphone className="h-5 w-5 text-[#1A5514]" />
				</span>
				<div className="min-w-0 flex-1">
					<h3 className="font-extrabold text-[#161D14]">
						{isSuccess ? t("success.title") : t("waiting.title")}
					</h3>
					<p className="text-sm text-gray-500 mt-1">
						{isSuccess
							? t("waiting.success")
							: t("waiting.description", {
									operator: operatorName,
									phone,
							  })}
					</p>
				</div>
			</div>

			<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
				<div className="rounded-xl bg-emerald-50/70 border border-emerald-100 px-4 py-3">
					<p className="text-xs font-bold uppercase tracking-wide text-emerald-800/70">
						{t("waiting.amountLabel")}
					</p>
					<p className="text-lg font-extrabold text-[#1A5514] mt-0.5">
						{formatPrice(amount, currency)}
					</p>
				</div>
				<div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
					<p className="text-xs font-bold uppercase tracking-wide text-gray-500">
						{operatorName}
					</p>
					{phase === "failed" ? (
						<input
							type="tel"
							value={phoneDraft}
							onChange={(e) => setPhoneDraft(e.target.value)}
							aria-label={t("waiting.phoneLabel")}
							className="mt-1 w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm font-bold text-[#161D14] bg-white focus:outline-none focus:ring-2 focus:ring-[#31BC2E]/40 focus:border-[#31BC2E]"
						/>
					) : (
						<p className="text-sm font-bold text-[#161D14] mt-0.5 truncate">
							{phone}
						</p>
					)}
				</div>
			</div>

			<div
				role="status"
				aria-live="polite"
				className={`mt-4 flex items-start rounded-xl border px-4 py-3 ${
					isFailed
						? "bg-red-50 border-red-200"
						: isSuccess
						? "bg-emerald-50 border-emerald-200"
						: "bg-white border-emerald-100"
				}`}
			>
				{isFailed ? (
					<FiXCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
				) : isSuccess ? (
					<FiCheckCircle className="h-5 w-5 text-[#1A5514] mr-2 mt-0.5 flex-shrink-0" />
				) : phase === "slow" ? (
					<FiClock className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
				) : (
					<FiLoader className="h-5 w-5 text-[#1A5514] mr-2 mt-0.5 flex-shrink-0 animate-spin" />
				)}
				<div className="text-sm min-w-0">
					{isFailed ? (
						<>
							<p className="font-bold text-red-800">
								{phase === "missing"
									? t("waiting.missingContact")
									: t("waiting.failedTitle")}
							</p>
							<p className="text-red-700/80 mt-0.5">
								{error || t("waiting.failedText")}
							</p>
						</>
					) : isSuccess ? (
						<p className="font-bold text-[#1A5514]">
							{t("waiting.success")}
						</p>
					) : phase === "slow" ? (
						<p className="text-amber-800">
							{t("waiting.stillWaiting")}
						</p>
					) : (
						<p className="text-gray-600">
							{t("waiting.checking")}
							{error ? ` — ${error}` : ""}
						</p>
					)}
				</div>
			</div>

			{!isSuccess && (
				<div className="mt-4 flex flex-col sm:flex-row gap-2">
					{!isFailed && (
						<button
							type="button"
							onClick={() => poll(true)}
							className="inline-flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-bold text-[#1A5514] bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
						>
							<FiRefreshCw className="mr-2 h-4 w-4" />
							{t("waiting.checkNow")}
						</button>
					)}
					{isFailed && (
						<button
							type="button"
							onClick={handleRetry}
							disabled={
								retrying ||
								!contact?.operator ||
								phoneDraft.trim().length < 6
							}
							className="inline-flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#1A5514] to-[#31BC2E] shadow-lg shadow-emerald-900/20 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
						>
							<FiRefreshCw
								className={`mr-2 h-4 w-4 ${retrying ? "animate-spin" : ""}`}
							/>
							{retrying ? t("waiting.retrying") : t("waiting.retry")}
						</button>
					)}
					<button
						type="button"
						onClick={() => navigate(cancelUrl)}
						className="inline-flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
					>
						{t("waiting.cancel")}
					</button>
				</div>
			)}

			<p className="mt-4 text-xs text-gray-400">{t("waiting.secured")}</p>
		</div>
	);
};

export default MobileMoneyPaymentSection;
