import React, { useState, useEffect, useCallback } from "react";
import { BellRing, BellOff, Smartphone, Loader2, ShieldAlert, CheckCircle2, XCircle, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import pushService from "../../services/pushService";

/**
 * PushNotificationToggle
 * Composant réutilisable pour activer/désactiver les web push notifications.
 *
 * Props:
 *  - isAdmin (bool) : true pour les admins, false pour les utilisateurs normaux
 *  - className (string) : classes CSS additionnelles sur le container
 */
const PushNotificationToggle = ({ isAdmin = false, className = "" }) => {
	const { t } = useTranslation("settings");
	// États possibles : "loading" | "unsupported" | "denied" | "granted" | "default"
	const [permissionStatus, setPermissionStatus] = useState("loading");
	// true si une subscription active existe en BDD
	const [isSubscribed, setIsSubscribed] = useState(false);
	// Animation en cours (subscribe/unsubscribe)
	const [isProcessing, setIsProcessing] = useState(false);
	// Message de feedback
	const [feedback, setFeedback] = useState(null); // { type: "success"|"error", text: string }

	// Vérifie la permission et l'état de la subscription au montage
	const checkStatus = useCallback(async () => {
		if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
			setPermissionStatus("unsupported");
			return;
		}

		const permission = Notification.permission;
		setPermissionStatus(permission);

		if (permission === "granted") {
			try {
				const registration = await navigator.serviceWorker.ready;
				const subscription = await registration.pushManager.getSubscription();
				setIsSubscribed(!!subscription);
			} catch {
				setIsSubscribed(false);
			}
		}
	}, []);

	useEffect(() => {
		checkStatus();
	}, [checkStatus]);

	const showFeedback = (type, text) => {
		setFeedback({ type, text });
		setTimeout(() => setFeedback(null), 4000);
	};

	const handleEnable = async () => {
		setIsProcessing(true);
		try {
			await pushService.registerAndSubscribe(isAdmin);
			// Recheck après subscription
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();
			const permission = Notification.permission;
			setPermissionStatus(permission);
			if (subscription) {
				setIsSubscribed(true);
				showFeedback("success", t("push.enabled"));
			} else if (permission === "denied") {
				setPermissionStatus("denied");
				showFeedback("error", t("push.denied"));
			} else {
				showFeedback("error", t("push.cancelled"));
			}
		} catch (err) {
			console.error("[PushToggle] Erreur activation:", err);
			showFeedback("error", t("push.enableError"));
		} finally {
			setIsProcessing(false);
		}
	};

	const handleDisable = async () => {
		setIsProcessing(true);
		try {
			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();

			if (subscription) {
				// Informer le backend de la désinscription
				await pushService.sendUnsubscribeToBackend(subscription.endpoint, isAdmin);
				// Désinscrire localement dans le navigateur
				await pushService.unsubscribeLocally(subscription);
			}
			setIsSubscribed(false);
			showFeedback("success", t("push.disabled"));
		} catch (err) {
			console.error("[PushToggle] Erreur désactivation:", err);
			showFeedback("error", t("push.disableError"));
		} finally {
			setIsProcessing(false);
		}
	};

	// ── Rendu selon l'état ──────────────────────────────────────────────────────

	if (permissionStatus === "loading") {
		return (
			<div
				className={`flex items-center justify-between gap-3 p-4 bg-gray-50 rounded-2xl animate-pulse ${className}`}
				aria-busy="true"
			>
				<div className="h-3 w-40 bg-gray-200 rounded" />
				<div className="h-8 w-14 bg-gray-200 rounded-full" />
			</div>
		);
	}

	if (permissionStatus === "unsupported") {
		return (
			<div className={`flex items-start gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 ${className}`}>
				<div className="p-2.5 bg-gray-200 rounded-xl shrink-0">
					<BellOff className="h-5 w-5 text-gray-500" />
				</div>
				<div>
					<p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">
						{t("push.unsupportedTitle")}
					</p>
					<p className="text-[11px] text-gray-500 font-medium leading-relaxed">
						{t("push.unsupportedText")}
					</p>
				</div>
			</div>
		);
	}

	if (permissionStatus === "denied") {
		return (
			<div className={`flex items-start gap-4 p-5 bg-rose-50 rounded-2xl border border-rose-100 ${className}`}>
				<div className="p-2.5 bg-rose-100 rounded-xl shrink-0">
					<ShieldAlert className="h-5 w-5 text-rose-500" />
				</div>
				<div>
					<p className="text-xs font-black text-rose-700 uppercase tracking-widest mb-1">
						{t("push.deniedTitle")}
					</p>
					<p className="text-[11px] text-rose-600 font-medium leading-relaxed mb-3">
						{t("push.deniedTextStart")} <Lock className="inline w-4 h-4 text-gray-700" /> {t("push.deniedTextEnd")}
					</p>
					<a
						href="https://support.google.com/chrome/answer/3220216"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:text-rose-800 transition-colors"
					>
						{t("push.howTo")}
					</a>
				</div>
			</div>
		);
	}

	// États : "default" (jamais demandé) ou "granted" (autorisé)
	const isActive = permissionStatus === "granted" && isSubscribed;

	return (
		<div className={`space-y-3 ${className}`}>
			{/* Carte principale */}
			<div
				className={`relative flex items-center justify-between gap-4 p-5 rounded-2xl border-2 transition-all duration-500 ${
					isActive
						? "border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50 shadow-lg shadow-violet-50/50"
						: "border-gray-100 bg-gray-50/50"
				}`}
			>
				{/* Indicateur animé quand actif */}
				{isActive && (
					<span className="absolute top-3 right-3 w-2 h-2 bg-violet-500 rounded-full animate-ping opacity-75" />
				)}

				{/* Icône + texte */}
				<div className="flex items-center gap-4">
					<div
						className={`p-3 rounded-xl transition-all duration-300 ${
							isActive
								? "bg-violet-100 text-violet-600"
								: "bg-gray-100 text-gray-400"
						}`}
					>
						<Smartphone className="h-5 w-5" />
					</div>
					<div>
						<p className="text-xs font-black text-gray-900 uppercase tracking-widest mb-0.5">
							{t("push.title")}
						</p>
						<p className="text-[11px] text-gray-500 font-medium leading-snug max-w-xs">
							{isActive
								? t("push.activeText")
								: t("push.inactiveText")}
						</p>
					</div>
				</div>

				{/* Bouton toggle */}
				<button
					onClick={isActive ? handleDisable : handleEnable}
					disabled={isProcessing}
					aria-label={isActive ? t("push.disable") : t("push.enable")}
					className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ring-4 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed ${
						isActive
							? "bg-violet-500 ring-violet-100"
							: "bg-gray-200 ring-gray-100"
					}`}
				>
					{isProcessing ? (
						<Loader2 className="h-4 w-4 text-white absolute left-1/2 -translate-x-1/2 animate-spin" />
					) : (
						<span
							className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
								isActive ? "translate-x-7" : "translate-x-1.5"
							}`}
						/>
					)}
				</button>
			</div>

			{/* Badge de statut */}
			<div className="flex items-center gap-2 px-2">
				{isActive ? (
					<div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700">
						<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
						{t("push.activeBadge")}
					</div>
				) : permissionStatus === "default" ? (
					<div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
						<BellRing className="h-3.5 w-3.5" />
						{t("push.defaultBadge")}
					</div>
				) : (
					<div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
						<XCircle className="h-3.5 w-3.5" />
						{t("push.offBadge")}
					</div>
				)}
			</div>

			{/* Feedback toast */}
			{feedback && (
				<div
					className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest animate-fade-in ${
						feedback.type === "success"
							? "bg-emerald-50 text-emerald-700 border border-emerald-100"
							: "bg-rose-50 text-rose-700 border border-rose-100"
					}`}
				>
					{feedback.type === "success" ? (
						<CheckCircle2 className="h-4 w-4 shrink-0" />
					) : (
						<XCircle className="h-4 w-4 shrink-0" />
					)}
					{feedback.text}
				</div>
			)}
		</div>
	);
};

export default PushNotificationToggle;
