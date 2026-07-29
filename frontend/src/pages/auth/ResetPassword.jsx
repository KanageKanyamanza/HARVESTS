import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Eye, EyeOff, Lock, CheckCircle, KeyRound } from "lucide-react";
import { authService } from "../../services";
import SocialLinks from "../../components/common/SocialLinks";
import logo from "../../assets/logo.png";
import authbg from "../../assets/images/authbg.webp";

const ResetPassword = () => {
	const { token } = useParams();

	const [formData, setFormData] = useState({
		password: "",
		confirmPassword: "",
	});

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.password.trim()) {
			newErrors.password = "Le mot de passe est requis";
		} else if (formData.password.length < 8) {
			newErrors.password =
				"Le mot de passe doit contenir au moins 8 caractères";
		} else if (
			!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.password)
		) {
			newErrors.password =
				"Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre";
		}

		if (!formData.confirmPassword.trim()) {
			newErrors.confirmPassword = "La confirmation du mot de passe est requise";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsLoading(true);
		setErrors({});

		try {
			const response = await authService.resetPassword(
				token,
				formData.password
			);

			if (response.data.status === "success") {
				setIsSuccess(true);
			} else {
				setErrors({ general: "Une erreur est survenue. Veuillez réessayer." });
			}
		} catch (error) {
			console.error("Erreur lors de la réinitialisation:", error);
			setErrors({ general: "Une erreur est survenue. Veuillez réessayer." });
		} finally {
			setIsLoading(false);
		}
	};

	if (isSuccess) {
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
								<KeyRound className="w-4 h-4 text-[#31BC2E]" />
								<span>Nouveau mot de passe</span>
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

					{/* Section droite - Contenu de succès */}
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
								<h2 className="text-2xl font-extrabold text-white">Succès !</h2>
							</div>

							<div className="space-y-3 px-5 pt-7 pb-5 sm:px-8 sm:pt-9 sm:pb-7 shadow-2xl shadow-black/30 rounded-3xl bg-white border border-emerald-100/80 text-center">
								<div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-4 w-14 h-14 mx-auto mb-4 flex items-center justify-center">
									<CheckCircle className="h-6 w-6 text-[#1A5514]" />
								</div>
								<p className="text-gray-600 text-sm mb-4">
									Votre mot de passe a été réinitialisé avec succès.
								</p>

								<div className="pt-2 border-t border-gray-100">
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
	}

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
							<KeyRound className="w-4 h-4 text-[#31BC2E]" />
							<span>Nouveau mot de passe</span>
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

				{/* Section droite - Formulaire */}
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
								Nouveau mot de passe
							</h2>
						</div>

						{errors.general && (
							<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">
								{errors.general}
							</div>
						)}

						<form onSubmit={handleSubmit}>
							<div className="space-y-3 px-5 pt-7 pb-5 sm:px-8 sm:pt-9 sm:pb-7 shadow-2xl shadow-black/30 rounded-3xl bg-white border border-emerald-100/80">
								{/* Nouveau mot de passe */}
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
										<Lock className="h-4.5 w-4.5 text-gray-400" />
									</div>
									<input
										type={showPassword ? "text" : "password"}
										name="password"
										value={formData.password}
										onChange={handleChange}
										placeholder="Nouveau mot de passe"
										className={`w-full pl-10 pr-12 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1A5514] outline-none transition-all text-sm ${
											errors.password ? "border-red-300" : "border-gray-200"
										}`}
									/>
									<button
										type="button"
										className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? (
											<EyeOff className="h-4.5 w-4.5" />
										) : (
											<Eye className="h-4.5 w-4.5" />
										)}
									</button>
									{errors.password && (
										<p className="mt-1 text-xs text-red-600 font-medium">
											{errors.password}
										</p>
									)}
									<p className="mt-1 text-xs text-gray-500">
										Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
									</p>
								</div>

								{/* Confirmation du mot de passe */}
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
										<Lock className="h-4.5 w-4.5 text-gray-400" />
									</div>
									<input
										type={showConfirmPassword ? "text" : "password"}
										name="confirmPassword"
										value={formData.confirmPassword}
										onChange={handleChange}
										placeholder="Confirmer le mot de passe"
										className={`w-full pl-10 pr-12 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1A5514] outline-none transition-all text-sm ${
											errors.confirmPassword
												? "border-red-300"
												: "border-gray-200"
										}`}
									/>
									<button
										type="button"
										className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									>
										{showConfirmPassword ? (
											<EyeOff className="h-4.5 w-4.5" />
										) : (
											<Eye className="h-4.5 w-4.5" />
										)}
									</button>
									{errors.confirmPassword && (
										<p className="mt-1 text-xs text-red-600 font-medium">
											{errors.confirmPassword}
										</p>
									)}
								</div>

								{/* Lien retour */}
								<div className="text-center pt-1">
									<Link
										to="/login"
										className="text-[#1A5514] hover:text-[#31BC2E] text-xs font-bold transition-colors"
									>
										Retour à la connexion
									</Link>
								</div>

								{/* Bouton de soumission */}
								<button
									type="submit"
									disabled={isLoading}
									className="w-full bg-gradient-to-r from-[#1A5514] to-[#31BC2E] hover:shadow-lg shadow-emerald-900/20 text-white font-bold py-3 px-4 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isLoading ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											<span>Réinitialisation en cours...</span>
										</>
									) : (
										"Réinitialiser le mot de passe"
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ResetPassword;
