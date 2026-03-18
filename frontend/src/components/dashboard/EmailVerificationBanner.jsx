import React, { useState } from "react";
import { Mail, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import api from "../../services/api";

/**
 * Bannière orange affichée en haut du dashboard si l'email n'est pas vérifié.
 * Disparaît définitivement si l'utilisateur la ferme, ou si l'email est vérifié.
 */
const EmailVerificationBanner = ({ user }) => {
	const [dismissed, setDismissed] = useState(false);
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState(null);

	// Ne pas afficher si email déjà vérifié, ou si fermé, ou pas d'user
	if (!user || user.isEmailVerified || dismissed) return null;

	const handleResend = async () => {
		setSending(true);
		setError(null);
		try {
			await api.post("/auth/resend-verification", { email: user.email });
			setSent(true);
		} catch (err) {
			const msg =
				err.response?.data?.message ||
				"Impossible d'envoyer l'email. Réessayez plus tard.";
			setError(msg);
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="relative z-50 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
			<div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
				{/* Icône + Message */}
				<div className="flex items-center gap-3 flex-1 min-w-0">
					<div className="flex-shrink-0 bg-white/20 p-1.5 rounded-lg">
						<Mail className="w-4 h-4" />
					</div>
					<p className="text-xs font-bold truncate">
						{sent ? (
							<span className="flex items-center gap-1.5">
								<CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
								Email envoyé à <strong>{user.email}</strong> — vérifiez votre boîte mail.
							</span>
						) : (
							<>
								<span className="hidden sm:inline">
									⚠️ Votre adresse email <strong>{user.email}</strong> n'est pas encore vérifiée.
									Certaines fonctionnalités sont limitées.
								</span>
								<span className="sm:hidden">
									⚠️ Email non vérifié — fonctionnalités limitées.
								</span>
							</>
						)}
					</p>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-2 flex-shrink-0">
					{error && (
						<span className="hidden md:flex items-center gap-1 text-[10px] font-bold bg-red-500/30 px-2 py-1 rounded-lg">
							<AlertCircle className="w-3 h-3" />
							{error}
						</span>
					)}

					{!sent && (
						<button
							onClick={handleResend}
							disabled={sending}
							className="flex items-center gap-1.5 bg-white text-orange-600 hover:bg-orange-50 font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all active:scale-95 disabled:opacity-60 whitespace-nowrap"
						>
							{sending ? (
								<Loader2 className="w-3 h-3 animate-spin" />
							) : (
								<Mail className="w-3 h-3" />
							)}
							{sending ? "Envoi..." : "Renvoyer l'email"}
						</button>
					)}

					<button
						onClick={() => setDismissed(true)}
						className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
						title="Fermer"
					>
						<X className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>

			{/* Barre de progression animée (décorative) */}
			<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/20">
				<div className="h-full w-1/3 bg-white/40 animate-pulse" />
			</div>
		</div>
	);
};

export default EmailVerificationBanner;
