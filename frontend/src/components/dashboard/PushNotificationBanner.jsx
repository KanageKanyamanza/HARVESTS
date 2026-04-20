import React, { useState, useEffect } from "react";
import { Bell, X, CheckCircle, Smartphone, Loader2 } from "lucide-react";
import pushService from "../../services/pushService";

/**
 * Bannière violette affichée si les notifications push ne sont pas activées.
 */
const PushNotificationBanner = ({ user, onClose }) => {
	const [status, setStatus] = useState({ supported: true, subscribed: false });
	const [dismissed, setDismissed] = useState(() => {
		const saved = localStorage.getItem("push-banner-dismissed");
		if (saved) {
			const date = new Date(saved);
			const diff = (new Date() - date) / (1000 * 60 * 60 * 24);
			return diff < 3; // On ne remontre pas avant 3 jours
		}
		return false;
	});
	const [processing, setProcessing] = useState(false);

	useEffect(() => {
		const checkStatus = async () => {
			const res = await pushService.checkSubscriptionStatus();
			setStatus(res);
		};
		checkStatus();
	}, []);

	// Ne pas afficher si : non supporté, déjà abonné, fermé, ou pas d'user
	if (!user || !status.supported || status.subscribed || dismissed || status.permission === 'denied') return null;

	const handleEnable = async () => {
		setProcessing(true);
		try {
			const isAdmin = user.role === "admin" || user.userType === "admin";
			await pushService.registerAndSubscribe(isAdmin);
			// Vérifier à nouveau le statut
			const res = await pushService.checkSubscriptionStatus();
			setStatus(res);
		} catch (err) {
			console.error("Erreur activation push depuis bannière:", err);
		} finally {
			setProcessing(false);
		}
	};

	const handleDismiss = () => {
		setDismissed(true);
		localStorage.setItem("push-banner-dismissed", new Date().toISOString());
		if (onClose) onClose();
	};

	return (
		<div className="relative z-40 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg border-b border-white/10">
			<div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
				{/* Icône + Message */}
				<div className="flex items-center gap-3 flex-1 min-w-0">
					<div className="flex-shrink-0 bg-white/20 p-1.5 rounded-lg animate-pulse">
						<Bell className="w-4 h-4" />
					</div>
					<div className="min-w-0">
						<p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-0.5">
							Notifications Actives
						</p>
						<p className="text-xs font-bold truncate">
							Ne manquez aucune alerte critique. Activez les notifications push sur cet appareil.
						</p>
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-2 flex-shrink-0">
					<button
						onClick={handleEnable}
						disabled={processing}
						className="flex items-center gap-1.5 bg-white text-violet-600 hover:bg-violet-50 font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-60 shadow-md"
					>
						{processing ? (
							<Loader2 className="w-3 h-3 animate-spin" />
						) : (
							<Smartphone className="w-3 h-3" />
						)}
						{processing ? "Activation..." : "Activer"}
					</button>

					<button
						onClick={handleDismiss}
						className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
						title="Plus tard"
					>
						<X className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>
		</div>
	);
};

export default PushNotificationBanner;
