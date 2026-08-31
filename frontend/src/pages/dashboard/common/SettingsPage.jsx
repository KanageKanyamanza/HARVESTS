import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import FinancialInfo from "../../../components/common/FinancialInfo";
import NotificationSettings from "../../../components/common/NotificationSettings";
import {
	Settings,
	CreditCard,
	Bell,
	ShieldCheck,
	MapPin,
	Edit3,
	RefreshCw,
	ChevronRight,
	Mail,
	Trash2,
	Plus,
	Sparkles,
	Lock,
	Check,
	Eye,
	EyeOff,
	AlertTriangle,
	X,
} from "lucide-react";
import commonService from "../../../services/commonService";

const SettingsPage = () => {
	const { user, isAuthenticated, refreshUser, updatePassword, logout } = useAuth();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("financial");

	// États pour la suppression de compte
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteMethod, setDeleteMethod] = useState("password");
	const [deleteValue, setDeleteValue] = useState("");
	const [deleteError, setDeleteError] = useState(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	// États pour le changement de mot de passe
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [passwordForm, setPasswordForm] = useState({
		passwordCurrent: "",
		password: "",
		passwordConfirm: "",
	});
	const [passwordVisible, setPasswordVisible] = useState({
		passwordCurrent: false,
		password: false,
		passwordConfirm: false,
	});
	const [passwordSaving, setPasswordSaving] = useState(false);
	const [passwordError, setPasswordError] = useState(null);
	const [passwordSuccess, setPasswordSuccess] = useState(null);
	const [loading, setLoading] = useState(true);

	// États pour les données
	const [financialInfo, setFinancialInfo] = useState(null);
	const [notificationSettings, setNotificationSettings] = useState(null);
	const [verificationStatus, setVerificationStatus] = useState(null);
	const [deliveryAddresses, setDeliveryAddresses] = useState([]);
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Charger les données une seule fois
	useEffect(() => {
		if (!isAuthenticated || !user) return;

		const loadSettingsData = async () => {
			try {
				setLoading(true);

				const [financialResponse, notificationResponse, addressesResponse] =
					await Promise.all([
						commonService.getFinancialInfo().catch(() => ({ data: null })),
						commonService
							.getNotificationPreferences()
							.catch(() => ({ data: null })),
						commonService.getDeliveryAddresses().catch(() => ({ data: [] })),
					]);

				setFinancialInfo(financialResponse.data);
				setNotificationSettings(
					notificationResponse.data?.data?.preferences ||
						notificationResponse.data,
				);
				setDeliveryAddresses(addressesResponse.data || []);

				const verificationData = {
					email: {
						verified: user.isEmailVerified,
						verifiedAt: user.emailVerifiedAt,
						pending: !user.isEmailVerified,
					},
					phone: {
						verified: user.isPhoneVerified,
						verifiedAt: user.phoneVerifiedAt,
						pending: !user.isPhoneVerified,
					},
					overall: {
						verified: user.isEmailVerified && user.isPhoneVerified,
						level: user.isEmailVerified ? "Profil Vérifié" : "En attente",
					},
				};

				setVerificationStatus(verificationData);
			} catch (error) {
				console.error("Erreur lours du chargement des paramètres:", error);
			} finally {
				setLoading(false);
			}
		};

		loadSettingsData();
	}, [isAuthenticated, user]);

	const handleRefresh = async () => {
		try {
			setIsRefreshing(true);
			await refreshUser();
			const verificationData = {
				email: {
					verified: user.isEmailVerified,
					verifiedAt: user.emailVerifiedAt,
					pending: !user.isEmailVerified,
				},
				phone: {
					verified: user.isPhoneVerified,
					verifiedAt: user.phoneVerifiedAt,
					pending: !user.isPhoneVerified,
				},
				overall: {
					verified: user.isEmailVerified && user.isPhoneVerified,
					level: user.isEmailVerified ? "Vérifié" : "Non vérifié",
				},
			};
			setVerificationStatus(verificationData);
		} catch (error) {
			console.error("Erreur lors de l'actualisation:", error);
		} finally {
			setIsRefreshing(false);
		}
	};

	const handlePasswordFieldChange = (e) => {
		const { name, value } = e.target;
		setPasswordForm((prev) => ({ ...prev, [name]: value }));
	};

	const togglePasswordForm = () => {
		setShowPasswordForm((prev) => !prev);
		setPasswordError(null);
		setPasswordSuccess(null);
		setPasswordForm({ passwordCurrent: "", password: "", passwordConfirm: "" });
		setPasswordVisible({ passwordCurrent: false, password: false, passwordConfirm: false });
	};

	const togglePasswordVisibility = (field) => {
		setPasswordVisible((prev) => ({ ...prev, [field]: !prev[field] }));
	};

	const handlePasswordSubmit = async (e) => {
		e.preventDefault();
		setPasswordError(null);
		setPasswordSuccess(null);

		if (passwordForm.password.length < 8) {
			setPasswordError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
			return;
		}
		if (passwordForm.password !== passwordForm.passwordConfirm) {
			setPasswordError("Les mots de passe ne correspondent pas.");
			return;
		}

		try {
			setPasswordSaving(true);
			const result = await updatePassword({
				passwordCurrent: passwordForm.passwordCurrent,
				password: passwordForm.password,
			});

			if (result?.success) {
				setPasswordSuccess("Mot de passe mis à jour avec succès.");
				setPasswordForm({ passwordCurrent: "", password: "", passwordConfirm: "" });
				setTimeout(() => {
					setShowPasswordForm(false);
					setPasswordSuccess(null);
				}, 2000);
			} else {
				setPasswordError(result?.error || "Erreur lors de la mise à jour du mot de passe.");
			}
		} catch (error) {
			setPasswordError(
				error.response?.data?.message || "Erreur lors de la mise à jour du mot de passe."
			);
		} finally {
			setPasswordSaving(false);
		}
	};

	const closeDeleteModal = () => {
		setShowDeleteModal(false);
		setDeleteMethod("password");
		setDeleteValue("");
		setDeleteError(null);
	};

	const handleDeleteAccount = async (e) => {
		e.preventDefault();
		setDeleteError(null);

		if (!deleteValue.trim()) {
			setDeleteError(
				deleteMethod === "password" ?
					"Veuillez saisir votre mot de passe."
				:	"Veuillez saisir votre email.",
			);
			return;
		}

		try {
			setDeleteLoading(true);
			await commonService.deleteAccount({ [deleteMethod]: deleteValue });
			await logout();
			navigate("/");
		} catch (error) {
			setDeleteError(
				error.response?.data?.message || "Erreur lors de la suppression du compte.",
			);
		} finally {
			setDeleteLoading(false);
		}
	};

	const tabs = [
		{ id: "financial", label: "Financier", icon: CreditCard, color: "blue" },
		{ id: "notifications", label: "Alertes", icon: Bell, color: "amber" },
		{ id: "security", label: "Sécurité", icon: ShieldCheck, color: "indigo" },
		{ id: "addresses", label: "Adresses", icon: MapPin, color: "rose" },
	];

	if (!isAuthenticated || !user || loading) {
		return (
			<div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
				<div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
				<p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
					{!isAuthenticated || !user ?
						"Identification en cours..."
					:	"Chargement des paramètres..."}
				</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen relative overflow-hidden pb-24 bg-harvests-light/20">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 animate-fade-in-down">
					<div className="space-y-4">
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest mb-2">
							<div className="w-5 h-[2px] bg-emerald-600"></div>
							<span>Configuration</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
							Paramètres de{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
								Compte.
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">
							Personnalisez votre expérience Harvests, gérez votre sécurité et
							vos préférences de paiement.
						</p>
					</div>

					<div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-white/60">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							const isActive = activeTab === tab.id;
							return (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`relative p-3 rounded-xl transition-all duration-300 group ${
										isActive ?
											"bg-gray-900 text-white shadow-xl shadow-gray-200 -translate-y-1"
										:	"text-gray-400 hover:text-gray-900 hover:bg-white"
									}`}
									title={tab.label}
								>
									<Icon className="h-5 w-5" />
									{isActive && (
										<span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
									)}
								</button>
							);
						})}
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
					{/* Desktop Sidebar */}
					<div className="hidden lg:block space-y-6 animate-fade-in-up">
						<nav className="space-y-2">
							{tabs.map((tab) => {
								const Icon = tab.icon;
								const isActive = activeTab === tab.id;
								return (
									<button
										key={tab.id}
										onClick={() => setActiveTab(tab.id)}
										className={`w-full group flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${
											isActive ?
												"bg-white shadow-xl shadow-gray-100 text-gray-900 border border-gray-50"
											:	"text-gray-400 hover:text-gray-900 hover:bg-white/50"
										}`}
									>
										<div className="flex items-center gap-4">
											<div
												className={`p-2 rounded-xl transition-colors ${
													isActive ?
														`bg-${tab.color}-50 text-${tab.color}-600`
													:	"bg-gray-50 text-gray-400 group-hover:bg-white"
												}`}
											>
												<Icon className="h-5 w-5" />
											</div>
											<span
												className={`text-[11px] font-[1000] uppercase tracking-widest ${isActive ? "translate-x-1" : ""} transition-transform`}
											>
												{tab.label}
											</span>
										</div>
										{isActive && (
											<ChevronRight className="h-4 w-4 text-emerald-500 animate-pulse" />
										)}
									</button>
								);
							})}
						</nav>

						{/* Status Card in Sidebar */}
						<div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-[2rem] p-6 text-white shadow-2xl shadow-emerald-100 relative overflow-hidden">
							<div className="absolute top-0 right-0 p-4 opacity-10">
								<Sparkles className="h-20 w-20" />
							</div>
							<div className="relative z-10 space-y-4">
								<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">
									Protection active
								</p>
								<h4 className="text-xl font-[1000] leading-tight">
									Compte 100% sécurisé
								</h4>
								<p className="text-[10px] font-bold leading-relaxed opacity-90">
									Harvests protège vos données grâce à un chiffrement de niveau
									bancaire.
								</p>
							</div>
						</div>
					</div>

					{/* Main Content Area */}
					<div className="lg:col-span-3 min-h-[600px] animate-fade-in-up delay-100">
						<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 border border-white/60 shadow-sm min-h-full">
							{/* Tab: Financier */}
							{activeTab === "financial" && (
								<FinancialInfo
									bankAccount={financialInfo?.bankAccount}
									paymentMethods={financialInfo?.paymentMethods}
									onUpdate={handleRefresh}
								/>
							)}

							{/* Tab: Notifications */}
							{activeTab === "notifications" && (
								<NotificationSettings data={notificationSettings} />
							)}

							{/* Tab: Sécurité */}
							{activeTab === "security" && (
								<div className="space-y-12">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3 px-2">
											<ShieldCheck className="h-5 w-5 text-indigo-600/50" />
											<h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
												Sécurité du compte
											</h2>
										</div>
										<button
											onClick={handleRefresh}
											disabled={isRefreshing}
											className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
										>
											<RefreshCw
												className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
											/>
										</button>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{/* Email Verification */}
										<div className="p-6 bg-white border border-gray-100 rounded-3xl group hover:shadow-xl transition-all duration-500">
											<div className="flex items-start justify-between mb-4">
												<div
													className={`p-3 rounded-2xl ${verificationStatus?.email?.verified ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}
												>
													<Mail className="h-6 w-6" />
												</div>
												{verificationStatus?.email?.verified ?
													<div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-full">
														Validé
													</div>
												:	<button className="px-3 py-1 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-emerald-600 transition-colors">
														Vérifier
													</button>
												}
											</div>
											<h4 className="text-sm font-[1000] text-gray-900 uppercase tracking-widest mb-1">
												Validation Email
											</h4>
											<p className="text-xs text-gray-500 font-medium leading-relaxed">
												Essentiel pour recevoir vos factures et alertes
												critiques.
											</p>
										</div>

										{/* Password Change */}
										<div className="p-6 bg-white border border-gray-100 rounded-3xl group hover:shadow-xl transition-all duration-500">
											<div className="flex items-start justify-between mb-4">
												<div className="p-3 bg-gray-50 text-gray-600 rounded-2xl group-hover:bg-gray-900 group-hover:text-white transition-colors">
													<Lock className="h-6 w-6" />
												</div>
												<button
													onClick={togglePasswordForm}
													className="px-3 py-1 bg-gray-100 text-gray-600 text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-gray-200 transition-colors"
												>
													{showPasswordForm ? "Annuler" : "Modifier"}
												</button>
											</div>
											<h4 className="text-sm font-[1000] text-gray-900 uppercase tracking-widest mb-1">
												Mot de Passe
											</h4>

											{!showPasswordForm ? (
												<p className="text-xs text-gray-500 font-medium leading-relaxed">
													Modifiez votre mot de passe régulièrement pour
													sécuriser votre compte.
												</p>
											) : (
												<form onSubmit={handlePasswordSubmit} className="space-y-3 mt-4">
													<div className="relative">
														<input
															type={passwordVisible.passwordCurrent ? "text" : "password"}
															name="passwordCurrent"
															value={passwordForm.passwordCurrent}
															onChange={handlePasswordFieldChange}
															placeholder="Mot de passe actuel"
															required
															className="w-full bg-gray-50/50 px-4 py-2.5 pr-11 border-2 border-transparent rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
														/>
														<button
															type="button"
															onClick={() => togglePasswordVisibility("passwordCurrent")}
															className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
															tabIndex={-1}
														>
															{passwordVisible.passwordCurrent ? (
																<EyeOff className="h-4 w-4" />
															) : (
																<Eye className="h-4 w-4" />
															)}
														</button>
													</div>
													<div className="relative">
														<input
															type={passwordVisible.password ? "text" : "password"}
															name="password"
															value={passwordForm.password}
															onChange={handlePasswordFieldChange}
															placeholder="Nouveau mot de passe (maj., min., chiffre, 8+ car.)"
															required
															minLength={8}
															className="w-full bg-gray-50/50 px-4 py-2.5 pr-11 border-2 border-transparent rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
														/>
														<button
															type="button"
															onClick={() => togglePasswordVisibility("password")}
															className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
															tabIndex={-1}
														>
															{passwordVisible.password ? (
																<EyeOff className="h-4 w-4" />
															) : (
																<Eye className="h-4 w-4" />
															)}
														</button>
													</div>
													<div className="relative">
														<input
															type={passwordVisible.passwordConfirm ? "text" : "password"}
															name="passwordConfirm"
															value={passwordForm.passwordConfirm}
															onChange={handlePasswordFieldChange}
															placeholder="Confirmer le nouveau mot de passe"
															required
															minLength={8}
															className="w-full bg-gray-50/50 px-4 py-2.5 pr-11 border-2 border-transparent rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
														/>
														<button
															type="button"
															onClick={() => togglePasswordVisibility("passwordConfirm")}
															className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
															tabIndex={-1}
														>
															{passwordVisible.passwordConfirm ? (
																<EyeOff className="h-4 w-4" />
															) : (
																<Eye className="h-4 w-4" />
															)}
														</button>
													</div>

													{passwordError && (
														<p className="text-xs font-bold text-rose-600">{passwordError}</p>
													)}
													{passwordSuccess && (
														<p className="text-xs font-bold text-emerald-600">{passwordSuccess}</p>
													)}

													<button
														type="submit"
														disabled={passwordSaving}
														className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-colors disabled:opacity-50"
													>
														{passwordSaving ? "Enregistrement..." : "Enregistrer le nouveau mot de passe"}
													</button>
												</form>
											)}
										</div>
									</div>

									<div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
										<div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
											<div className="w-24 h-24 rounded-full border-4 border-emerald-500/30 flex items-center justify-center p-2">
												<div className="w-full h-full bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]">
													<ShieldCheck className="h-10 w-10 text-white" />
												</div>
											</div>
											<div className="flex-1 text-center md:text-left">
												<h4 className="text-xl font-[1000] mb-2 uppercase tracking-tight">
													Niveau de Sécurité : Global
												</h4>
												<p className="text-xs text-gray-400 font-medium mb-6">
													Votre compte bénéficie de la protection standard
													Harvests.
												</p>
												<div className="flex flex-wrap justify-center md:justify-start gap-4">
													<div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md">
														<Check className="h-3 w-3 text-emerald-500" />
														<span className="text-[9px] font-black uppercase tracking-widest">
															2FA Active
														</span>
													</div>
													<div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md">
														<Check className="h-3 w-3 text-emerald-500" />
														<span className="text-[9px] font-black uppercase tracking-widest">
															SSL Certifié
														</span>
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* Zone dangereuse */}
									<div className="p-6 md:p-8 bg-rose-50/50 border-2 border-dashed border-rose-200 rounded-3xl">
										<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
											<div className="flex items-start gap-3">
												<div className="p-3 bg-rose-100 text-rose-600 rounded-2xl flex-shrink-0">
													<AlertTriangle className="h-5 w-5" />
												</div>
												<div>
													<h4 className="text-sm font-[1000] text-rose-900 uppercase tracking-widest mb-1">
														Supprimer mon compte
													</h4>
													<p className="text-xs text-rose-700/80 font-medium leading-relaxed max-w-md">
														Action définitive : vos données personnelles seront
														anonymisées et votre compte désactivé. Vos commandes
														existantes sont conservées pour des raisons légales.
													</p>
												</div>
											</div>
											<button
												onClick={() => setShowDeleteModal(true)}
												className="flex-shrink-0 px-6 py-3 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-rose-700 transition-all active:scale-95"
											>
												Supprimer mon compte
											</button>
										</div>
									</div>
								</div>
							)}

							{/* Tab: Adresses */}
							{activeTab === "addresses" && (
								<div className="space-y-12">
									<div className="flex items-center justify-between px-2">
										<div className="flex items-center gap-3">
											<MapPin className="h-5 w-5 text-rose-500/50" />
											<h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
												Adresses de livraison
											</h2>
										</div>
										<button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all active:scale-95">
											<Plus className="h-4 w-4" />
											Ajouter
										</button>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{deliveryAddresses.length > 0 ?
											deliveryAddresses.map((address, index) => (
												<div
													key={index}
													className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-gray-100 transition-all duration-500"
												>
													<div className="flex items-start justify-between mb-6">
														<div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
															<MapPin className="h-6 w-6" />
														</div>
														{address.isDefault && (
															<span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
																Par défaut
															</span>
														)}
													</div>

													<div className="space-y-1">
														<h3 className="text-lg font-[1000] text-gray-900 tracking-tight">
															{address.name}
														</h3>
														<p className="text-sm font-medium text-gray-700 leading-relaxed italic opacity-80">
															{address.address}
														</p>
													</div>

													<div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
														<p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
															{address.city}, {address.country}
														</p>
														<div className="flex gap-2">
															<button className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
																<Edit3 className="h-4 w-4" />
															</button>
															<button className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
																<Trash2 className="h-4 w-4" />
															</button>
														</div>
													</div>
												</div>
											))
										:	<div className="md:col-span-2 text-center py-20 px-4 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
												<MapPin className="mx-auto h-16 w-16 text-gray-200 mb-6" />
												<p className="text-sm font-black text-gray-600 uppercase tracking-widest mb-2">
													Aucune adresse enregistrée
												</p>
												<p className="text-xs text-gray-400">
													Ajouter une adresse pour simplifier vos futurs achats.
												</p>
											</div>
										}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Modal de confirmation de suppression de compte */}
			{showDeleteModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
					<div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl relative">
						<button
							onClick={closeDeleteModal}
							className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
						>
							<X className="h-4 w-4" />
						</button>

						<div className="p-3 bg-rose-100 text-rose-600 rounded-2xl w-fit mb-4">
							<AlertTriangle className="h-6 w-6" />
						</div>
						<h3 className="text-lg font-[1000] text-gray-900 uppercase tracking-tight mb-2">
							Confirmer la suppression
						</h3>
						<p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">
							Cette action est irréversible. Confirmez votre identité avec votre
							mot de passe ou l'email de votre compte pour continuer.
						</p>

						<form onSubmit={handleDeleteAccount} className="space-y-4">
							<div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
								<button
									type="button"
									onClick={() => {
										setDeleteMethod("password");
										setDeleteValue("");
									}}
									className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
										deleteMethod === "password" ?
											"bg-gray-900 text-white"
										:	"text-gray-500 hover:text-gray-900"
									}`}
								>
									Mot de passe
								</button>
								<button
									type="button"
									onClick={() => {
										setDeleteMethod("email");
										setDeleteValue("");
									}}
									className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
										deleteMethod === "email" ?
											"bg-gray-900 text-white"
										:	"text-gray-500 hover:text-gray-900"
									}`}
								>
									Email
								</button>
							</div>

							<input
								type={deleteMethod === "password" ? "password" : "email"}
								value={deleteValue}
								onChange={(e) => setDeleteValue(e.target.value)}
								placeholder={deleteMethod === "password" ? "Votre mot de passe" : "Votre email"}
								required
								className="w-full bg-gray-50/50 px-4 py-3 border-2 border-transparent rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 transition-all"
							/>

							{deleteError && (
								<p className="text-xs font-bold text-rose-600">{deleteError}</p>
							)}

							<div className="flex gap-3 pt-2">
								<button
									type="button"
									onClick={closeDeleteModal}
									className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-colors"
								>
									Annuler
								</button>
								<button
									type="submit"
									disabled={deleteLoading}
									className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-colors disabled:opacity-50"
								>
									{deleteLoading ? "Suppression..." : "Supprimer définitivement"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default SettingsPage;
