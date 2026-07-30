import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, LogIn as LogInIcon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import SocialLinks from "../../components/common/SocialLinks";
import { useModal } from "../../hooks/useModal";
import logo from "../../assets/logo.png";
import authbg from "../../assets/images/authbg.webp";

const Login = () => {
	const { login, getDefaultRoute } = useAuth();
	const { openEmailVerificationModal } = useModal();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.email.trim()) {
			newErrors.email = "L'email est requis";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Format d'email invalide";
		}

		if (!formData.password) {
			newErrors.password = "Le mot de passe est requis";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);
		setErrors({}); // Effacer les erreurs précédentes

		try {
			// Utiliser l'AuthContext pour gérer la connexion
			const result = await login(formData);

			if (result.success) {
				navigate(getDefaultRoute());
			} else {
				// Vérifier si l'erreur est liée à un email non vérifié
				const errorMessage = result.error.toLowerCase();

				if (
					errorMessage.includes("vérifier") &&
					errorMessage.includes("email")
				) {
					// Utiliser le gestionnaire de modales global
					openEmailVerificationModal(formData.email, false);
					setErrors({}); // Effacer les erreurs du formulaire
				} else {
					setErrors({ submit: result.error });
				}
			}
		} catch {
			setErrors({ submit: "Erreur de connexion" });
		} finally {
			setIsSubmitting(false);
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
							<LogInIcon className="w-4 h-4 text-[#31BC2E]" />
							<span>Bon retour</span>
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
							<h2 className="text-2xl font-extrabold text-white">Connexion</h2>
						</div>

						{errors.submit && (
							<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">
								{errors.submit}
							</div>
						)}

						<form onSubmit={handleSubmit}>
							<div className="space-y-3 px-5 pt-7 pb-5 sm:px-8 sm:pt-9 sm:pb-7 shadow-2xl shadow-black/30 rounded-3xl bg-white border border-emerald-100/80">
								{/* Email */}
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
										<Mail className="h-4.5 w-4.5 text-gray-400" />
									</div>
									<input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										placeholder="Votre email"
										className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1A5514] outline-none transition-all text-sm ${
											errors.email ? "border-red-300" : "border-gray-200"
										}`}
									/>
									{errors.email && (
										<p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>
									)}
								</div>

								{/* Mot de passe */}
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
										<Lock className="h-4.5 w-4.5 text-gray-400" />
									</div>
									<input
										type={showPassword ? "text" : "password"}
										name="password"
										value={formData.password}
										onChange={handleChange}
										placeholder="Votre mot de passe"
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
								</div>

								{/* Liens */}
								<div className="flex items-center justify-between text-xs pt-1">
									<Link
										to="/register"
										className="text-[#1A5514] hover:text-[#31BC2E] font-bold transition-colors"
									>
										Ou inscrivez-vous
									</Link>
									<Link
										to="/forgot-password"
										className="text-[#1A5514] hover:text-[#31BC2E] font-bold transition-colors"
									>
										Mot de passe oublié ?
									</Link>
								</div>

								{/* Remember me */}
								<label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
									<input
										id="remember-me"
										name="remember-me"
										type="checkbox"
										checked={rememberMe}
										onChange={(e) => setRememberMe(e.target.checked)}
										className="h-4 w-4 rounded border-gray-300 text-[#1A5514] focus:ring-[#1A5514]"
									/>
									<span className="text-xs text-gray-600 font-medium">
										Se souvenir de moi
									</span>
								</label>

								{/* Bouton de connexion */}
								<button
									type="submit"
									disabled={isSubmitting}
									className="w-full bg-gradient-to-r from-[#1A5514] to-[#31BC2E] hover:shadow-lg shadow-emerald-900/20 text-white font-bold py-3 px-4 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isSubmitting ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											<span>Connexion en cours...</span>
										</>
									) : (
										"Se connecter"
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

export default Login;
