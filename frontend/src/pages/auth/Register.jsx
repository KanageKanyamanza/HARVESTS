import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, UserPlus } from "lucide-react";
import SocialLinks from "../../components/common/SocialLinks";
import UserTypeSelector from "../../components/auth/UserTypeSelector";
import NameFields from "../../components/auth/NameFields";
import FormField from "../../components/auth/FormField";
import { useRegisterForm } from "../../hooks/useRegisterForm";
import { useRegisterSubmission } from "../../hooks/useRegisterSubmission";
import logo from "../../assets/logo.png";
import authbg from "../../assets/images/authbg.webp";

const Register = () => {
	const [rememberMe, setRememberMe] = useState(false);

	// Hooks personnalisés
	const {
		formData,
		showPassword,
		setShowPassword,
		showConfirmPassword,
		setShowConfirmPassword,
		errors,
		setErrors,
		isDropdownOpen,
		setIsDropdownOpen,
		handleChange,
		setUserType,
		resetForm,
	} = useRegisterForm();

	const { handleSubmit, isSubmitting } = useRegisterSubmission(
		formData,
		setErrors,
		resetForm
	);

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
							<UserPlus className="w-4 h-4 text-[#31BC2E]" />
							<span>Rejoignez Harvests</span>
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

						<div className="text-center mb-4">
							<h2 className="text-2xl font-extrabold text-white">Inscription</h2>
						</div>

						{errors.submit && (
							<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-semibold">
								{errors.submit}
							</div>
						)}

						<form onSubmit={handleSubmit}>
							<div className="space-y-3 px-5 pt-7 pb-5 sm:px-8 sm:pt-9 sm:pb-7 shadow-2xl shadow-black/30 rounded-3xl bg-white border border-emerald-100/80">
								{/* Type de profil */}
								<UserTypeSelector
									selectedUserType={formData.userType}
									isOpen={isDropdownOpen}
									onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
									onSelect={setUserType}
									error={errors.userType}
								/>

								{/* Nom - Conditionnel selon le type d'utilisateur */}
								<NameFields
									userType={formData.userType}
									firstName={
										formData.userType === 'consumer'     ? formData.fullName :
										formData.userType === 'producer'     ? formData.farmName :
										formData.userType === 'restaurateur' ? formData.restaurantName :
										['transformer','exporter','transporter'].includes(formData.userType) ? formData.companyName :
										formData.firstName
									}
									onFirstNameChange={handleChange}
									firstNameError={errors.firstName}
								/>

								{/* Email */}
								<FormField
									icon={Mail}
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									placeholder="Votre email"
									error={errors.email}
								/>

								{/* Mot de passe */}
								<FormField
									icon={Lock}
									type={showPassword ? "text" : "password"}
									name="password"
									value={formData.password}
									onChange={handleChange}
									placeholder="Votre mot de passe"
									error={errors.password}
									showPasswordToggle={true}
									showPassword={showPassword}
									onTogglePassword={() => setShowPassword(!showPassword)}
									helperText="Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre"
								/>

								{/* Lien de connexion */}
								<div className="text-center pt-1">
									<Link
										to="/login"
										className="text-[#1A5514] hover:text-[#31BC2E] text-xs font-bold transition-colors"
									>
										Ou connectez-vous
									</Link>
								</div>

								{/* Remember me */}
								<label className="flex items-center justify-center gap-2 pt-1 cursor-pointer select-none">
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

								{/* Bouton d'inscription */}
								<button
									type="submit"
									disabled={isSubmitting}
									className="w-full bg-gradient-to-r from-[#1A5514] to-[#31BC2E] hover:shadow-lg shadow-emerald-900/20 text-white font-bold py-3 px-4 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isSubmitting ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
											<span>Inscription en cours...</span>
										</>
									) : (
										"S'inscrire"
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

export default Register;
