import React from "react";
import { Settings } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import SettingsTabs from "../../components/admin/settings/SettingsTabs";
import ProfileTab from "../../components/admin/settings/ProfileTab";
import NotificationsTab from "../../components/admin/settings/NotificationsTab";
import PasswordTab from "../../components/admin/settings/PasswordTab";
import { useAdminSettings } from "../../hooks/useAdminSettings";

const AdminSettings = () => {
	const {
		user,
		loading,
		saving,
		activeTab,
		setActiveTab,
		formData,
		avatarPreview,
		passwordData,
		setPasswordData,
		errors,
		successMessage,
		handleInputChange,
		handleAvatarChange,
		handleUpdateProfile,
		handleChangePassword,
		handleUpdateNotificationEmail,
		resetProfileForm,
		resetPasswordForm,
		resetNotificationForm,
	} = useAdminSettings();

	const handlePasswordChange = (field, value) => {
		setPasswordData((prev) => ({ ...prev, [field]: value }));
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<LoadingSpinner size="lg" text="Chargement..." />
			</div>
		);
	}

	return (
		<div className="min-h-screen pb-20 relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="max-w-[1400px] mx-auto px-4 py-12 relative z-10">
				{/* Header */}
				<div className="mb-12 animate-fade-in-down">
					<div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-3">
						<div className="w-8 h-[2px] bg-emerald-600"></div>
						<span>System Core</span>
					</div>
					<h1 className="text-5xl font-[1000] text-gray-900 tracking-tighter leading-none mb-4">
						Paramètres <span className="text-green-600">Système</span>
					</h1>
					<p className="text-gray-500 font-medium">
						Gérez vos informations personnelles et vos préférences Harvests
					</p>
				</div>

				{/* Message de succès */}
				{successMessage && (
					<div className="mb-8 bg-emerald-50/80 backdrop-blur-md border border-emerald-100/50 text-emerald-700 px-6 py-4 rounded-[2rem] shadow-sm flex items-center animate-fade-in">
						<div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
						<span className="text-sm font-black uppercase tracking-widest">
							{successMessage}
						</span>
					</div>
				)}

				{/* Message d'erreur général */}
				{errors.general && (
					<div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
						{errors.general}
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Sidebar avec onglets */}
					<div className="lg:col-span-1">
						<SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
					</div>

					{/* Contenu principal */}
					<div className="lg:col-span-3">
						<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 overflow-hidden relative">
							{/* Onglet Profil */}
							{activeTab === "profile" && (
								<ProfileTab
									user={user}
									formData={formData}
									avatarPreview={avatarPreview}
									errors={errors}
									saving={saving}
									onInputChange={handleInputChange}
									onAvatarChange={handleAvatarChange}
									onSubmit={handleUpdateProfile}
									onReset={resetProfileForm}
								/>
							)}

							{/* Onglet Notifications */}
							{activeTab === "notifications" && (
								<NotificationsTab
									user={user}
									formData={formData}
									saving={saving}
									onInputChange={handleInputChange}
									onSubmit={handleUpdateNotificationEmail}
									onReset={resetNotificationForm}
								/>
							)}

							{/* Onglet Mot de passe */}
							{activeTab === "password" && (
								<PasswordTab
									passwordData={passwordData}
									errors={errors}
									saving={saving}
									onPasswordChange={handlePasswordChange}
									onSubmit={handleChangePassword}
									onReset={resetPasswordForm}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminSettings;
