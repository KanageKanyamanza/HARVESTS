import React, { useState, useEffect } from "react";
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
	User,
	Edit3,
	RefreshCw,
	ChevronRight,
	Mail,
	Phone,
	Globe,
	Trash2,
	Plus,
	Sparkles,
	Lock,
	ArrowRight,
	Check,
} from "lucide-react";
import commonService from "../../../services/commonService";

const SettingsPage = () => {
	const { user, isAuthenticated, refreshUser } = useAuth();
	const [activeTab, setActiveTab] = useState("profile");
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

	const tabs = [
		{ id: "profile", label: "Profil", icon: User, color: "emerald" },
		{ id: "financial", label: "Financier", icon: CreditCard, color: "blue" },
		{ id: "notifications", label: "Alertes", icon: Bell, color: "amber" },
		{ id: "security", label: "Sécurité", icon: ShieldCheck, color: "indigo" },
		{ id: "addresses", label: "Adresses", icon: MapPin, color: "rose" },
	];

	if (!isAuthenticated || !user) {
		return (
			<ModularDashboardLayout>
				<div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
					<div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
					<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
						Identification en cours...
					</p>
				</div>
			</ModularDashboardLayout>
		);
	}

	return (
		<ModularDashboardLayout>
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
										Harvests protège vos données grâce à un chiffrement de
										niveau bancaire.
									</p>
								</div>
							</div>
						</div>

						{/* Main Content Area */}
						<div className="lg:col-span-3 min-h-[600px] animate-fade-in-up delay-100">
							<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 border border-white/60 shadow-sm min-h-full">
								{/* Tab: Profil */}
								{activeTab === "profile" && (
									<div className="space-y-12">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3 px-2">
												<User className="h-5 w-5 text-emerald-600/50" />
												<h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
													Informations de base
												</h2>
											</div>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
											<div className="space-y-2">
												<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
													Identité
												</label>
												<div className="bg-gray-50/50 px-6 py-4 rounded-2xl border border-gray-100/50 flex items-center gap-4">
													<div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400">
														<User className="h-5 w-5" />
													</div>
													<div>
														<p className="text-sm font-black text-gray-900 uppercase tracking-tighter">
															{user.firstName} {user.lastName}
														</p>
														<p className="text-[10px] font-bold text-gray-400">
															Nom officiel
														</p>
													</div>
												</div>
											</div>

											<div className="space-y-2">
												<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
													Contact
												</label>
												<div className="bg-gray-50/50 px-6 py-4 rounded-2xl border border-gray-100/50 flex items-center gap-4">
													<div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400">
														<Mail className="h-5 w-5" />
													</div>
													<div>
														<p className="text-sm font-black text-gray-900">
															{user.email}
														</p>
														<p className="text-[10px] font-bold text-gray-400">
															Email académique / Pro
														</p>
													</div>
												</div>
											</div>

											<div className="space-y-2">
												<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
													Mobile
												</label>
												<div className="bg-gray-50/50 px-6 py-4 rounded-2xl border border-gray-100/50 flex items-center gap-4">
													<div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400">
														<Phone className="h-5 w-5" />
													</div>
													<div>
														<p className="text-sm font-black text-gray-900">
															{user.phone || "Non renseigné"}
														</p>
														<p className="text-[10px] font-bold text-gray-400">
															Contact d'urgence
														</p>
													</div>
												</div>
											</div>

											<div className="space-y-2">
												<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
													Région
												</label>
												<div className="bg-gray-50/50 px-6 py-4 rounded-2xl border border-gray-100/50 flex items-center gap-4">
													<div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400">
														<Globe className="h-5 w-5" />
													</div>
													<div>
														<p className="text-sm font-black text-gray-900">
															{user.country || "Non renseigné"}
														</p>
														<p className="text-[10px] font-bold text-gray-400">
															Pays d'opération
														</p>
													</div>
												</div>
											</div>
										</div>

										<div className="pt-8 border-t border-gray-100/50">
											<div className="bg-blue-50/50 p-6 rounded-[2rem] flex items-center justify-between gap-6 border border-blue-100">
												<div className="flex items-center gap-4">
													<div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
														<Edit3 className="h-6 w-6" />
													</div>
													<div>
														<h4 className="text-sm font-[1000] text-gray-900 uppercase tracking-widest">
															Informations publiques
														</h4>
														<p className="text-xs text-gray-500 font-medium">
															Pour modifier vos informations publiques et votre
															image de marque, rendez-vous sur votre profil.
														</p>
													</div>
												</div>
												<button className="hidden md:flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95">
													Gérer le Profil
													<ArrowRight className="h-4 w-4" />
												</button>
											</div>
										</div>
									</div>
								)}

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
													<button className="px-3 py-1 bg-gray-100 text-gray-600 text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-gray-200 transition-colors">
														Modifier
													</button>
												</div>
												<h4 className="text-sm font-[1000] text-gray-900 uppercase tracking-widest mb-1">
													Mot de Passe
												</h4>
												<p className="text-xs text-gray-500 font-medium leading-relaxed">
													Dernière modification :{" "}
													{new Date().toLocaleDateString("fr-FR")}
												</p>
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
															<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
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
													<p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">
														Aucune adresse enregistrée
													</p>
													<p className="text-xs text-gray-400">
														Ajouter une adresse pour simplifier vos futurs
														achats.
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
			</div>
		</ModularDashboardLayout>
	);
};

export default SettingsPage;
