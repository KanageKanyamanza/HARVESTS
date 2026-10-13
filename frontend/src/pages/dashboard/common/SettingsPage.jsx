import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../hooks/useAuth";
import { useNotifications } from "../../../hooks/useNotifications";
import FinancialInfo from "../../../components/common/FinancialInfo";
import NotificationSettings from "../../../components/common/NotificationSettings";
import {
	CreditCard,
	Bell,
	ShieldCheck,
	MapPin,
	Edit3,
	RefreshCw,
	ChevronRight,
	Mail,
	Phone,
	Trash2,
	Plus,
	Lock,
	Check,
	Eye,
	EyeOff,
	AlertTriangle,
	X,
	Download,
	Star,
} from "lucide-react";
import commonService from "../../../services/commonService";
import { consumerService } from "../../../services/consumerService";
import { authService } from "../../../services/authService";
import DashboardPageSkeleton from "../../../components/common/DashboardPageSkeleton";

// Seuls les vendeurs reçoivent des paiements : l'onglet financier ne concerne qu'eux
const VENDOR_TYPES = ["producer", "transformer", "restaurateur", "exporter", "transporter"];

// Classes écrites en entier pour que Tailwind les génère (pas de `bg-${color}-50`)
const TAB_ACTIVE_ICON = {
	financial: "bg-blue-50 text-blue-600",
	notifications: "bg-amber-50 text-amber-600",
	security: "bg-indigo-50 text-indigo-600",
	addresses: "bg-rose-50 text-rose-600",
};

const EMPTY_ADDRESS = {
	label: "",
	street: "",
	city: "",
	region: "",
	country: "",
	postalCode: "",
	instructions: "",
	isDefault: false,
};

const inputClass =
	"w-full bg-gray-50/50 px-4 py-2.5 border-2 border-transparent rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all placeholder-gray-300";

const AddressFormModal = ({ initial, onClose, onSaved }) => {
	const { t } = useTranslation("settings");
	const [form, setForm] = useState({ ...EMPTY_ADDRESS, ...initial });
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);
	const isEdit = Boolean(initial?._id);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		if (![form.label, form.street, form.city, form.region].every((v) => v?.trim())) {
			setError(t("addresses.required"));
			return;
		}
		const payload = {
			label: form.label.trim(),
			street: form.street.trim(),
			city: form.city.trim(),
			region: form.region.trim(),
			isDefault: form.isDefault,
			...(form.country?.trim() && { country: form.country.trim() }),
			...(form.postalCode?.trim() && { postalCode: form.postalCode.trim() }),
			...(form.instructions?.trim() && { instructions: form.instructions.trim() }),
		};
		try {
			setSaving(true);
			if (isEdit) await consumerService.updateDeliveryAddress(initial._id, payload);
			else await consumerService.addDeliveryAddress(payload);
			onSaved();
		} catch (err) {
			setError(err.response?.data?.message || t("addresses.error"));
		} finally {
			setSaving(false);
		}
	};

	const field = (name, required = false, placeholder = null) => (
		<div className="space-y-1.5">
			<label htmlFor={`address-${name}`} className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
				{t(`addresses.${name}`)}
				{required && " *"}
			</label>
			<input
				id={`address-${name}`}
				name={name}
				value={form[name] || ""}
				onChange={handleChange}
				placeholder={placeholder ? t(`addresses.${placeholder}`) : undefined}
				required={required}
				className={inputClass}
			/>
		</div>
	);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
			<div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] p-6 md:p-8 shadow-2xl relative">
				<button
					onClick={onClose}
					title={t("addresses.cancel")}
					aria-label={t("addresses.cancel")}
					className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
				>
					<X className="h-4 w-4" />
				</button>
				<div className="p-3 bg-rose-50 text-rose-500 rounded-2xl w-fit mb-4">
					<MapPin className="h-6 w-6" />
				</div>
				<h3 className="text-lg font-[1000] text-gray-900 uppercase tracking-tight mb-6">
					{isEdit ? t("addresses.formTitleEdit") : t("addresses.formTitleAdd")}
				</h3>

				<form onSubmit={handleSubmit} className="space-y-4">
					{field("label", true, "labelPlaceholder")}
					{field("street", true, "streetPlaceholder")}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{field("city", true)}
						{field("region", true)}
						{field("country")}
						{field("postalCode")}
					</div>
					<div className="space-y-1.5">
						<label htmlFor="address-instructions" className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
							{t("addresses.instructions")}
						</label>
						<textarea
							id="address-instructions"
							name="instructions"
							rows={2}
							value={form.instructions || ""}
							onChange={handleChange}
							placeholder={t("addresses.instructionsPlaceholder")}
							className={`${inputClass} resize-none`}
						/>
					</div>
					<label className="flex items-center gap-3 cursor-pointer select-none">
						<input
							type="checkbox"
							name="isDefault"
							checked={form.isDefault}
							onChange={handleChange}
							className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
						/>
						<span className="text-xs font-bold text-gray-700">{t("addresses.isDefault")}</span>
					</label>

					{error && <p className="text-xs font-bold text-rose-600">{error}</p>}

					<div className="flex gap-3 pt-2">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-colors"
						>
							{t("addresses.cancel")}
						</button>
						<button
							type="submit"
							disabled={saving}
							className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-colors disabled:opacity-50"
						>
							{saving ? t("addresses.saving") : t("addresses.save")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

const PasswordInput = ({ name, value, visible, onChange, onToggle, placeholder, minLength }) => {
	const { t } = useTranslation("settings");
	return (
		<div className="relative">
			<input
				type={visible ? "text" : "password"}
				name={name}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				required
				minLength={minLength}
				className={`${inputClass} pr-11`}
			/>
			<button
				type="button"
				onClick={onToggle}
				title={visible ? t("security.hidePassword") : t("security.showPassword")}
				aria-label={visible ? t("security.hidePassword") : t("security.showPassword")}
				className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
				tabIndex={-1}
			>
				{visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
			</button>
		</div>
	);
};

const SettingsPage = () => {
	const { t } = useTranslation("settings");
	const { user, isAuthenticated, refreshUser, updatePassword, logout } = useAuth();
	const { showSuccess, showError } = useNotifications();
	const navigate = useNavigate();

	const isVendor = VENDOR_TYPES.includes(user?.userType);
	const isConsumer = user?.userType === "consumer";

	const tabs = useMemo(
		() =>
			[
				isVendor && { id: "financial", icon: CreditCard },
				{ id: "notifications", icon: Bell },
				{ id: "security", icon: ShieldCheck },
				isConsumer && { id: "addresses", icon: MapPin },
			].filter(Boolean),
		[isVendor, isConsumer],
	);
	const [activeTab, setActiveTab] = useState(null);
	const currentTab = tabs.some((tab) => tab.id === activeTab) ? activeTab : tabs[0]?.id;

	// États pour la suppression de compte
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteMethod, setDeleteMethod] = useState("password");
	const [deleteValue, setDeleteValue] = useState("");
	const [deleteError, setDeleteError] = useState(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	// État pour l'export de mes données
	const [exportLoading, setExportLoading] = useState(false);
	const [exportError, setExportError] = useState(null);

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
	const [deliveryAddresses, setDeliveryAddresses] = useState([]);
	const [addressForm, setAddressForm] = useState(null);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [resendingEmail, setResendingEmail] = useState(false);

	// Dérivé de l'utilisateur à jour : plus de statut figé après « Actualiser »
	const accountLevel =
		user?.isApproved ? "approved"
		: user?.isEmailVerified ? "pending"
		: "unverified";

	const loadAddresses = useCallback(async () => {
		try {
			const response = await consumerService.getDeliveryAddresses();
			setDeliveryAddresses(response.data?.data?.addresses || []);
		} catch {
			showError(t("addresses.loadError"));
		}
	}, [showError, t]);

	// Charger les données une seule fois par utilisateur
	const userId = user?._id;
	useEffect(() => {
		if (!isAuthenticated || !userId) return;

		const loadSettingsData = async () => {
			try {
				setLoading(true);
				const [financialResponse, notificationResponse] = await Promise.all([
					isVendor ?
						commonService.getFinancialInfo().catch(() => null)
					:	Promise.resolve(null),
					commonService.getNotificationPreferences().catch(() => null),
					isConsumer ? loadAddresses() : Promise.resolve(),
				]);

				// Réponses API : { status, data: {...} }
				setFinancialInfo(financialResponse?.data?.data || null);
				setNotificationSettings(notificationResponse?.data?.data?.preferences || null);
			} catch (error) {
				console.error("Erreur lors du chargement des paramètres:", error);
			} finally {
				setLoading(false);
			}
		};

		loadSettingsData();
	}, [isAuthenticated, userId, isVendor, isConsumer, loadAddresses]);

	const handleRefresh = async () => {
		try {
			setIsRefreshing(true);
			await refreshUser();
			if (isVendor) {
				const response = await commonService.getFinancialInfo();
				setFinancialInfo(response?.data?.data || null);
			}
		} catch (error) {
			console.error("Erreur lors de l'actualisation:", error);
		} finally {
			setIsRefreshing(false);
		}
	};

	const handleResendVerification = async () => {
		try {
			setResendingEmail(true);
			await authService.resendVerification(user.email);
			showSuccess(t("security.emailResent", { email: user.email }));
		} catch (error) {
			showError(error.response?.data?.message || t("security.emailResendError"));
		} finally {
			setResendingEmail(false);
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
			setPasswordError(t("security.passwordTooShort"));
			return;
		}
		if (passwordForm.password !== passwordForm.passwordConfirm) {
			setPasswordError(t("security.passwordMismatch"));
			return;
		}

		try {
			setPasswordSaving(true);
			const result = await updatePassword({
				passwordCurrent: passwordForm.passwordCurrent,
				password: passwordForm.password,
			});

			if (result?.success) {
				setPasswordSuccess(t("security.passwordSuccess"));
				setPasswordForm({ passwordCurrent: "", password: "", passwordConfirm: "" });
				setTimeout(() => {
					setShowPasswordForm(false);
					setPasswordSuccess(null);
				}, 2000);
			} else {
				setPasswordError(result?.error || t("security.passwordError"));
			}
		} catch (error) {
			setPasswordError(error.response?.data?.message || t("security.passwordError"));
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
					t("deleteAccount.emptyPassword")
				:	t("deleteAccount.emptyEmail"),
			);
			return;
		}

		try {
			setDeleteLoading(true);
			await commonService.deleteAccount({ [deleteMethod]: deleteValue });
			await logout();
			navigate("/");
		} catch (error) {
			setDeleteError(error.response?.data?.message || t("deleteAccount.error"));
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleExportData = async () => {
		setExportError(null);
		try {
			setExportLoading(true);
			const response = await commonService.exportMyData();
			const blob = new Blob([response.data], { type: "application/json" });
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${t("export.filePrefix")}-${new Date().toISOString().slice(0, 10)}.json`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			setExportError(error.response?.data?.message || t("export.error"));
		} finally {
			setExportLoading(false);
		}
	};

	const handleAddressSaved = async () => {
		setAddressForm(null);
		showSuccess(t("addresses.saved"));
		await loadAddresses();
	};

	const handleSetDefaultAddress = async (address) => {
		try {
			await consumerService.updateDeliveryAddress(address._id, { isDefault: true });
			await loadAddresses();
		} catch (error) {
			showError(error.response?.data?.message || t("addresses.error"));
		}
	};

	const handleDeleteAddress = async (address) => {
		if (!window.confirm(t("addresses.deleteConfirm", { label: address.label }))) return;
		try {
			await consumerService.removeDeliveryAddress(address._id);
			showSuccess(t("addresses.deleted"));
			await loadAddresses();
		} catch (error) {
			showError(error.response?.data?.message || t("addresses.error"));
		}
	};

	// Session en cours de restauration : gabarit grisé plutôt qu'un spinner
	if (!isAuthenticated || !user) return <DashboardPageSkeleton />;

	return (
		<div className="dashboard-page bg-harvests-light/20">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="dashboard-container">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 animate-fade-in-down">
					<div className="space-y-4">
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest mb-2">
							<div className="w-5 h-[2px] bg-emerald-600"></div>
							<span>{t("page.eyebrow")}</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
							{t("page.titleStart")}{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
								{t("page.titleHighlight")}
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">{t("page.subtitle")}</p>
					</div>

					<div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-white/60 lg:hidden">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							const isActive = currentTab === tab.id;
							return (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`relative p-3 rounded-xl transition-all duration-300 group ${
										isActive ?
											"bg-gray-900 text-white shadow-xl shadow-gray-200 -translate-y-1"
										:	"text-gray-400 hover:text-gray-900 hover:bg-white"
									}`}
									title={t(`tabs.${tab.id}`)}
									aria-label={t(`tabs.${tab.id}`)}
								>
									<Icon className="h-5 w-5" />
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
								const isActive = currentTab === tab.id;
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
														TAB_ACTIVE_ICON[tab.id]
													:	"bg-gray-50 text-gray-400 group-hover:bg-white"
												}`}
											>
												<Icon className="h-5 w-5" />
											</div>
											<span
												className={`text-[11px] font-[1000] uppercase tracking-widest ${isActive ? "translate-x-1" : ""} transition-transform`}
											>
												{t(`tabs.${tab.id}`)}
											</span>
										</div>
										{isActive && <ChevronRight className="h-4 w-4 text-emerald-500 animate-pulse" />}
									</button>
								);
							})}
						</nav>

						{/* Statut réel du compte */}
						<div className="bg-gradient-to-br from-emerald-600 to-teal-500 rounded-[2rem] p-6 text-white shadow-2xl shadow-emerald-100 relative overflow-hidden">
							<div className="absolute top-0 right-0 p-4 opacity-10">
								<ShieldCheck className="h-20 w-20" />
							</div>
							<div className="relative z-10 space-y-4">
								<p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">
									{t("sidebar.eyebrow")}
								</p>
								<h4 className="text-xl font-[1000] leading-tight">
									{t(`profile:verification.levels.${accountLevel}`)}
								</h4>
								<ul className="space-y-1.5 text-[10px] font-bold opacity-90">
									<li className="flex items-center gap-2">
										{user.isEmailVerified ?
											<Check className="h-3.5 w-3.5" />
										:	<X className="h-3.5 w-3.5" />}
										{user.isEmailVerified ? t("sidebar.emailVerified") : t("sidebar.emailNotVerified")}
									</li>
									<li className="flex items-center gap-2">
										{user.isPhoneVerified ?
											<Check className="h-3.5 w-3.5" />
										:	<X className="h-3.5 w-3.5" />}
										{user.isPhoneVerified ? t("sidebar.phoneVerified") : t("sidebar.phoneNotVerified")}
									</li>
								</ul>
							</div>
						</div>
					</div>

					{/* Main Content Area */}
					<div className="lg:col-span-3 min-h-[600px] animate-fade-in-up delay-100">
						<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 border border-white/60 shadow-sm min-h-full">
							{loading ?
								<div className="space-y-4 animate-pulse" aria-busy="true">
									{[1, 2, 3].map((i) => (
										<div key={i} className="bg-white/70 rounded-2xl border border-gray-100 p-6 space-y-3">
											<div className="h-4 bg-gray-100 rounded w-1/4" />
											<div className="h-3 bg-gray-100 rounded w-2/3" />
											<div className="h-3 bg-gray-100 rounded w-1/2" />
										</div>
									))}
								</div>
							:	<>
									{/* Tab: Financier */}
									{currentTab === "financial" && (
										<FinancialInfo
											bankAccount={financialInfo?.bankAccount}
											paymentMethods={financialInfo?.paymentMethods}
											onUpdate={handleRefresh}
										/>
									)}

									{/* Tab: Notifications */}
									{currentTab === "notifications" && (
										<NotificationSettings data={notificationSettings} />
									)}

									{/* Tab: Sécurité */}
									{currentTab === "security" && (
										<div className="space-y-12">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3 px-2">
													<ShieldCheck className="h-5 w-5 text-indigo-600/50" />
													<h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
														{t("security.title")}
													</h2>
												</div>
												<button
													onClick={handleRefresh}
													disabled={isRefreshing}
													title={t("security.refresh")}
													aria-label={t("security.refresh")}
													className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
												>
													<RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
												</button>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												{/* Email Verification */}
												<div className="p-6 bg-white border border-gray-100 rounded-3xl group hover:shadow-xl transition-all duration-500">
													<div className="flex items-start justify-between mb-4">
														<div
															className={`p-3 rounded-2xl ${user.isEmailVerified ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}
														>
															<Mail className="h-6 w-6" />
														</div>
														{user.isEmailVerified ?
															<div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-full">
																{t("security.emailVerified")}
															</div>
														:	<button
																onClick={handleResendVerification}
																disabled={resendingEmail}
																className="px-3 py-1 bg-gray-900 text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-emerald-600 transition-colors disabled:opacity-50"
															>
																{resendingEmail ? t("security.emailSending") : t("security.emailResend")}
															</button>
														}
													</div>
													<h4 className="text-sm font-[1000] text-gray-900 uppercase tracking-widest mb-1">
														{t("security.emailTitle")}
													</h4>
													<p className="text-xs text-gray-500 font-medium leading-relaxed">
														{t("security.emailText")}
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
															{showPasswordForm ? t("security.cancel") : t("security.edit")}
														</button>
													</div>
													<h4 className="text-sm font-[1000] text-gray-900 uppercase tracking-widest mb-1">
														{t("security.passwordTitle")}
													</h4>

													{!showPasswordForm ?
														<p className="text-xs text-gray-500 font-medium leading-relaxed">
															{t("security.passwordText")}
														</p>
													:	<form onSubmit={handlePasswordSubmit} className="space-y-3 mt-4">
															{[
																["passwordCurrent", "currentPassword", undefined],
																["password", "newPassword", 8],
																["passwordConfirm", "confirmPassword", 8],
															].map(([name, placeholderKey, minLength]) => (
																<PasswordInput
																	key={name}
																	name={name}
																	value={passwordForm[name]}
																	visible={passwordVisible[name]}
																	onChange={handlePasswordFieldChange}
																	onToggle={() => togglePasswordVisibility(name)}
																	placeholder={t(`security.${placeholderKey}`)}
																	minLength={minLength}
																/>
															))}

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
																{passwordSaving ? t("security.passwordSaving") : t("security.passwordSave")}
															</button>
														</form>
													}
												</div>
											</div>

											{/* Export de mes données */}
											<div className="p-6 md:p-8 bg-white border border-gray-100 rounded-3xl">
												<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
													<div className="flex items-start gap-3">
														<div className="p-3 bg-gray-50 text-gray-600 rounded-2xl flex-shrink-0">
															<Download className="h-5 w-5" />
														</div>
														<div>
															<h4 className="text-sm font-[1000] text-gray-900 uppercase tracking-widest mb-1">
																{t("export.title")}
															</h4>
															<p className="text-xs text-gray-500 font-medium leading-relaxed max-w-md">
																{t("export.text")}
															</p>
															{exportError && (
																<p className="text-xs font-bold text-rose-600 mt-2">{exportError}</p>
															)}
														</div>
													</div>
													<button
														onClick={handleExportData}
														disabled={exportLoading}
														className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
													>
														<Download className="h-4 w-4" />
														{exportLoading ? t("export.preparing") : t("export.title")}
													</button>
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
																{t("deleteAccount.title")}
															</h4>
															<p className="text-xs text-rose-700/80 font-medium leading-relaxed max-w-md">
																{t("deleteAccount.text")}
															</p>
														</div>
													</div>
													<button
														onClick={() => setShowDeleteModal(true)}
														className="flex-shrink-0 px-6 py-3 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-rose-700 transition-all active:scale-95"
													>
														{t("deleteAccount.title")}
													</button>
												</div>
											</div>
										</div>
									)}

									{/* Tab: Adresses (consommateurs) */}
									{currentTab === "addresses" && (
										<div className="space-y-12">
											<div className="flex items-center justify-between px-2">
												<div className="flex items-center gap-3">
													<MapPin className="h-5 w-5 text-rose-500/50" />
													<h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
														{t("addresses.title")}
													</h2>
												</div>
												<button
													onClick={() => setAddressForm({ isDefault: deliveryAddresses.length === 0 })}
													className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all active:scale-95"
												>
													<Plus className="h-4 w-4" />
													{t("addresses.add")}
												</button>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
												{deliveryAddresses.length > 0 ?
													deliveryAddresses.map((address) => (
														<div
															key={address._id}
															className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-gray-100 transition-all duration-500"
														>
															<div className="flex items-start justify-between mb-6">
																<div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
																	<MapPin className="h-6 w-6" />
																</div>
																{address.isDefault && (
																	<span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
																		{t("addresses.default")}
																	</span>
																)}
															</div>

															<div className="space-y-1">
																<h3 className="text-lg font-[1000] text-gray-900 tracking-tight">
																	{address.label}
																</h3>
																<p className="text-sm font-medium text-gray-700 leading-relaxed">
																	{address.street}
																</p>
																{address.instructions && (
																	<p className="text-xs text-gray-400 italic">{address.instructions}</p>
																)}
															</div>

															<div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between gap-3">
																<p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
																	{[address.city, address.region, address.country].filter(Boolean).join(", ")}
																</p>
																<div className="flex gap-1 shrink-0">
																	{!address.isDefault && (
																		<button
																			onClick={() => handleSetDefaultAddress(address)}
																			title={t("addresses.setDefault")}
																			aria-label={t("addresses.setDefault")}
																			className="p-2 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
																		>
																			<Star className="h-4 w-4" />
																		</button>
																	)}
																	<button
																		onClick={() => setAddressForm(address)}
																		title={t("addresses.edit")}
																		aria-label={t("addresses.edit")}
																		className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
																	>
																		<Edit3 className="h-4 w-4" />
																	</button>
																	<button
																		onClick={() => handleDeleteAddress(address)}
																		title={t("addresses.delete")}
																		aria-label={t("addresses.delete")}
																		className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
																	>
																		<Trash2 className="h-4 w-4" />
																	</button>
																</div>
															</div>
														</div>
													))
												:	<div className="md:col-span-2 text-center py-20 px-4 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
														<MapPin className="mx-auto h-16 w-16 text-gray-200 mb-6" />
														<p className="text-sm font-black text-gray-600 uppercase tracking-widest mb-2">
															{t("addresses.empty")}
														</p>
														<p className="text-xs text-gray-400">{t("addresses.emptyText")}</p>
													</div>
												}
											</div>
										</div>
									)}
								</>
							}
						</div>
					</div>
				</div>
			</div>

			{addressForm && (
				<AddressFormModal
					initial={addressForm}
					onClose={() => setAddressForm(null)}
					onSaved={handleAddressSaved}
				/>
			)}

			{/* Modal de confirmation de suppression de compte */}
			{showDeleteModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
					<div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl relative">
						<button
							onClick={closeDeleteModal}
							title={t("deleteAccount.close")}
							aria-label={t("deleteAccount.close")}
							className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
						>
							<X className="h-4 w-4" />
						</button>

						<div className="p-3 bg-rose-100 text-rose-600 rounded-2xl w-fit mb-4">
							<AlertTriangle className="h-6 w-6" />
						</div>
						<h3 className="text-lg font-[1000] text-gray-900 uppercase tracking-tight mb-2">
							{t("deleteAccount.modalTitle")}
						</h3>
						<p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">
							{t("deleteAccount.modalText")}
						</p>

						<form onSubmit={handleDeleteAccount} className="space-y-4">
							<div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
								{[
									["password", "byPassword"],
									["email", "byEmail"],
								].map(([method, labelKey]) => (
									<button
										key={method}
										type="button"
										onClick={() => {
											setDeleteMethod(method);
											setDeleteValue("");
										}}
										className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
											deleteMethod === method ?
												"bg-gray-900 text-white"
											:	"text-gray-500 hover:text-gray-900"
										}`}
									>
										{t(`deleteAccount.${labelKey}`)}
									</button>
								))}
							</div>

							<input
								type={deleteMethod === "password" ? "password" : "email"}
								value={deleteValue}
								onChange={(e) => setDeleteValue(e.target.value)}
								placeholder={
									deleteMethod === "password" ?
										t("deleteAccount.passwordPlaceholder")
									:	t("deleteAccount.emailPlaceholder")
								}
								required
								className="w-full bg-gray-50/50 px-4 py-3 border-2 border-transparent rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 transition-all"
							/>

							{deleteError && <p className="text-xs font-bold text-rose-600">{deleteError}</p>}

							<div className="flex gap-3 pt-2">
								<button
									type="button"
									onClick={closeDeleteModal}
									className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-colors"
								>
									{t("deleteAccount.cancel")}
								</button>
								<button
									type="submit"
									disabled={deleteLoading}
									className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-colors disabled:opacity-50"
								>
									{deleteLoading ? t("deleteAccount.deleting") : t("deleteAccount.confirm")}
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
