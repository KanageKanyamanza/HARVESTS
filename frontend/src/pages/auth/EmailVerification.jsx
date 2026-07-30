import React, { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Mail, CheckCircle, AlertCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { authService } from "../../services";
import SocialLinks from "../../components/common/SocialLinks";
import logo from "../../assets/logo.png";
import authbg from "../../assets/images/authbg.webp";

const EmailVerification = () => {
	const { token: tokenFromParams } = useParams();
	const [searchParams] = useSearchParams();

	// Récupérer le token depuis les paramètres de route OU depuis les query parameters
	const token = tokenFromParams || searchParams.get("token");

	const [verificationStatus, setVerificationStatus] = useState("loading"); // 'loading', 'success', 'error', 'already-verified'
	const [isResending, setIsResending] = useState(false);
	const [message, setMessage] = useState("");
	const [email, setEmail] = useState("");
	const [lastResendTime, setLastResendTime] = useState(0);
	const [hasAttemptedVerification, setHasAttemptedVerification] =
		useState(false);

	useEffect(() => {
		// Vérifier si la vérification a été faite via redirection du backend
		const verified = searchParams.get("verified");
		const error = searchParams.get("error");
		const status = searchParams.get("status");

		// Si le backend a déjà vérifié l'email et redirigé
		if (verified === "true") {
			setVerificationStatus("success");
			setMessage(
				"Votre email a été vérifié avec succès ! Vous pouvez maintenant vous connecter."
			);
			return;
		}

		// Si le backend indique que l'email est déjà vérifié
		if (status === "already-verified") {
			setVerificationStatus("already-verified");
			setMessage("Votre email est déjà vérifié ! Vous pouvez vous connecter.");
			return;
		}

		// Si le backend indique une erreur
		if (error === "invalid_token") {
			setVerificationStatus("error");
			setMessage(
				"Token de vérification invalide ou expiré. Veuillez demander un nouveau lien de vérification."
			);
			return;
		}

		// Si on a un token et qu'aucune vérification n'a été tentée, déclencher automatiquement la vérification
		// (pour les cas où l'utilisateur accède directement à la page sans passer par le backend)
		if (token && !hasAttemptedVerification && !verified && !error && !status) {
			setHasAttemptedVerification(true);
			verifyEmailToken(token);
		}
	}, [token, searchParams, hasAttemptedVerification]);

	const verifyEmailToken = async (tokenToVerify) => {
		setVerificationStatus("loading");
		setMessage("Vérification en cours...");

		try {
			await authService.verifyEmail(tokenToVerify);
			setVerificationStatus("success");
			setMessage("Votre email a été vérifié avec succès !");
		} catch (error) {
			console.error("Erreur de vérification:", error);
			setVerificationStatus("error");
			setMessage("Token de vérification invalide ou expiré.");
		}
	};

	const handleResendVerification = async () => {
		if (!email) {
			setMessage("Veuillez entrer votre adresse email.");
			return;
		}

		// Protection contre les clics trop rapides (30 secondes minimum entre les envois)
		const now = Date.now();
		const timeSinceLastResend = now - lastResendTime;
		const minInterval = 30 * 1000; // 30 secondes

		if (timeSinceLastResend < minInterval && lastResendTime > 0) {
			const remainingTime = Math.ceil(
				(minInterval - timeSinceLastResend) / 1000
			);
			setMessage(
				`⏳ Veuillez attendre ${remainingTime} seconde(s) avant de renvoyer l'email.`
			);
			return;
		}

		setIsResending(true);
		setMessage(""); // Effacer les messages précédents
		setLastResendTime(now);

		try {
			const response = await authService.resendVerification(email);

			if (response.data.status === "success") {
				setMessage(
					"✅ Un nouvel email de vérification a été envoyé ! Vérifiez votre boîte de réception."
				);
			}
		} catch (error) {
			console.error("Erreur lors du renvoi:", error);

			if (error.response?.status === 404) {
				setMessage("❌ Aucun compte trouvé avec cette adresse email.");
			} else if (error.response?.status === 400) {
				setMessage("❌ Cet email est déjà vérifié.");
			} else if (error.response?.status === 429) {
				setMessage(
					"⏳ Trop de tentatives. Veuillez attendre quelques minutes avant de réessayer."
				);
			} else {
				setMessage("❌ Erreur lors de l'envoi de l'email. Veuillez réessayer.");
			}
		} finally {
			setIsResending(false);
		}
	};

	const getStatusIcon = () => {
		switch (verificationStatus) {
			case "success":
			case "already-verified":
				return <CheckCircle className="h-6 w-6 text-[#1A5514]" />;
			case "error":
				return <AlertCircle className="h-6 w-6 text-red-600" />;
			default:
				return <Mail className="h-6 w-6 text-[#1A5514]" />;
		}
	};

	const getStatusTitle = () => {
		switch (verificationStatus) {
			case "success":
				return "Email vérifié !";
			case "already-verified":
				return "Email déjà vérifié";
			case "error":
				return "Erreur de vérification";
			case "pending":
				return "Vérification requise";
			default:
				return "Vérification en cours...";
		}
	};

	return (
		<div
			className="flex items-center justify-center min-h-screen"
			style={{
				backgroundImage: `url(${authbg})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
		>
			<div className="relative w-full flex">
				{/* Section gauche - Logo et informations */}
				<div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center items-center text-white relative">
					<div className="relative z-10 text-center">
						<img
							src={logo}
							alt="Harvests Logo"
							className="w-[400px] h-[190px] mx-auto mb-6 drop-shadow-lg"
						/>
						<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D330A] shadow-md text-white text-xs font-bold uppercase tracking-wider mb-6">
							<ShieldCheck className="w-4 h-4 text-[#31BC2E]" />
							<span>Vérification du compte</span>
						</div>

						{/* Réseaux sociaux */}
						<div className="mt-8">
							<SocialLinks
								variant="glass"
								size="md"
								className="justify-center"
							/>
						</div>
					</div>
				</div>

				{/* Section droite - Contenu */}
				<div className="w-full lg:w-1/2 p-4 sm:p-8 lg:p-12">
					<div className="max-w-md mx-auto">
						{/* Header mobile */}
						<div className="lg:hidden text-center mb-8">
							<img
								src={logo}
								alt="Harvests Logo"
								className="sm:w-[300px] sm:h-[140px] w-[200px] h-[90px] mx-auto mb-4"
							/>
						</div>

						<div className="text-center mb-5">
							<h2 className="text-2xl font-extrabold text-white">
								{getStatusTitle()}
							</h2>
						</div>

						<div className="space-y-4 px-5 pt-7 pb-5 sm:px-8 sm:pt-9 sm:pb-7 shadow-2xl shadow-black/30 rounded-3xl bg-white border border-emerald-100/80">
							{/* Icône de statut */}
							<div className="flex justify-center">
								<div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-4 w-14 h-14 flex items-center justify-center">
									{getStatusIcon()}
								</div>
							</div>

							{/* Message */}
							{message && (
								<div
									className={`p-3.5 rounded-xl text-xs font-semibold ${
										verificationStatus === "success" ||
										verificationStatus === "already-verified"
											? "bg-emerald-50 border border-emerald-200 text-[#1A5514]"
											: verificationStatus === "error"
											? "bg-red-50 border border-red-200 text-red-700"
											: "bg-blue-50 border border-blue-200 text-blue-700"
									}`}
								>
									{message}
								</div>
							)}

							{/* Actions selon le statut */}
							{(verificationStatus === "success" ||
								verificationStatus === "already-verified") && (
								<Link
									to="/login"
									className="w-full bg-gradient-to-r from-[#1A5514] to-[#31BC2E] hover:shadow-lg shadow-emerald-900/20 text-white font-bold py-3 px-4 rounded-full transition-all flex items-center justify-center"
								>
									Se connecter
								</Link>
							)}

							{/* Section pour renvoyer l'email - toujours visible sauf si succès ou déjà vérifié */}
							{(verificationStatus === "error" ||
								verificationStatus === "loading") && (
								<div className="space-y-3">
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
											<Mail className="h-4.5 w-4.5 text-gray-400" />
										</div>
										<input
											type="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											placeholder="Votre adresse email"
											className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1A5514] outline-none transition-all text-sm"
										/>
									</div>

									<button
										onClick={handleResendVerification}
										disabled={isResending || !email}
										className="w-full bg-gradient-to-r from-[#1A5514] to-[#31BC2E] hover:shadow-lg shadow-emerald-900/20 text-white font-bold py-3 px-4 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isResending ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												<span>Envoi en cours...</span>
											</>
										) : (
											<>
												<RefreshCw className="h-4 w-4" />
												Renvoyer l'email de vérification
											</>
										)}
									</button>
								</div>
							)}

							{/* Lien de navigation */}
							<div className="text-center pt-1">
								<Link
									to="/login"
									className="text-[#1A5514] hover:text-[#31BC2E] text-xs font-bold transition-colors"
								>
									Retour à la connexion
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EmailVerification;
