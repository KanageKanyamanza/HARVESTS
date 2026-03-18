import React, { useState, useEffect } from "react";
import {
	User,
	Sparkles,
	ShieldCheck,
	ShoppingBag,
	Save,
	X,
	Edit3,
	ArrowRight,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import {
	ProfileHeader,
	VerificationStatus,
	ShopSection,
} from "../../../components/profile";
import ProfileFormFields from "../../../components/profile/ProfileFormFields";
import {
	useVendorStats,
	useVerificationStatus,
} from "../../../hooks/useProfileData";
import commonService from "../../../services/commonService";
import {
	producerService,
	transformerService,
	restaurateurService,
	exporterService,
	transporterService,
} from "../../../services";

const ProfilePage = () => {
	const { user, isAuthenticated, refreshUser, updateProfile, setUser } =
		useAuth();
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [editing, setEditing] = useState(false);
	const [formData, setFormData] = useState({});
	const [shopBanner, setShopBanner] = useState(user?.shopBanner || "");
	const [shopLogo, setShopLogo] = useState(user?.shopLogo || "");
	const [avatar, setAvatar] = useState(user?.avatar || "");

	const { vendorStats, loading: vendorStatsLoading } = useVendorStats(user);
	const verificationStatus = useVerificationStatus(user);

	useEffect(() => {
		if (user) {
			setShopBanner(user.shopBanner || "");
			setShopLogo(user.shopLogo || "");
			setAvatar(user.avatar || "");
		}
	}, [user]);

	const safeDisplay = (value, fallback = "Non renseigné") => {
		if (value === null || value === undefined) return fallback;
		if (typeof value === "object") {
			return (
				value.value ||
				value.name ||
				value.code ||
				value.street ||
				value.address ||
				JSON.stringify(value) ||
				fallback
			);
		}
		return value || fallback;
	};

	const handleEdit = () => {
		setEditing(true);
		const excludedFields = [
			"_id",
			"id",
			"password",
			"createdAt",
			"updatedAt",
			"__v",
			"role",
			"emailVerified",
			"isEmailVerified",
			"verificationStatus",
		];

		const editableData = Object.keys(user).reduce((acc, key) => {
			if (!excludedFields.includes(key)) {
				acc[key] = user[key];
			}
			return acc;
		}, {});

		setFormData(editableData);
	};

	const handleCancel = () => {
		setEditing(false);
		setFormData({});
	};

	const handleSave = async () => {
		try {
			setSaving(true);
			let response;

			if (user?.userType === "restaurateur") {
				response = await restaurateurService.updateMyProfile(formData);
			} else if (user?.userType === "producer") {
				response = await producerService.updateProfile(formData);
			} else if (user?.userType === "transformer") {
				response = await transformerService.updateProfile(formData);
			} else if (user?.userType === "exporter") {
				response = await exporterService.updateProfile(formData);
			} else if (user?.userType === "transporter") {
				response = await transporterService.updateProfile({
					...formData,
					serviceAreas: formData.serviceAreas || [],
				});
			} else {
				response = await commonService.updateCommonProfile(formData);
			}

			const updatedUser =
				response.data?.data?.restaurateur ||
				response.data?.data?.transformer ||
				response.data?.data?.producer ||
				response.data?.data?.consumer ||
				response.data?.data?.exporter ||
				response.data?.data?.transporter ||
				response.data?.data?.user ||
				response.data?.user;

			if (updatedUser) {
				if (setUser) setUser(updatedUser);
				else if (updateProfile) await updateProfile(updatedUser);
				else if (refreshUser) await refreshUser();
			} else if (refreshUser) {
				await refreshUser();
			}

			setEditing(false);
			setFormData({});
			// Success feedback could be improved with a toast
		} catch (error) {
			console.error("Erreur sauvegarde:", error);
		} finally {
			setSaving(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;
		const inputValue = type === "checkbox" ? checked : value;

		if (name.includes(".")) {
			const parts = name.split(".");
			setFormData((prev) => {
				const newData = { ...prev };
				let current = newData;
				for (let i = 0; i < parts.length - 1; i++) {
					if (!current[parts[i]]) current[parts[i]] = {};
					current[parts[i]] = { ...current[parts[i]] };
					current = current[parts[i]];
				}
				current[parts[parts.length - 1]] = inputValue;
				return newData;
			});
		} else {
			setFormData((prev) => ({ ...prev, [name]: inputValue }));
		}
	};

	const handleCuisineTypeChange = (e) => {
		const { value, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			cuisineTypes:
				checked ?
					[...(prev.cuisineTypes || []), value]
				:	(prev.cuisineTypes || []).filter((type) => type !== value),
		}));
	};

	const handleImageChange = async (type, imageUrl) => {
		const setters = {
			banner: setShopBanner,
			logo: setShopLogo,
			avatar: setAvatar,
		};
		setters[type]?.(imageUrl);
		await refreshUser();
	};

	const handleImageRemove = async (type) => {
		const setters = {
			banner: setShopBanner,
			logo: setShopLogo,
			avatar: setAvatar,
		};
		const fields = { banner: "shopBanner", logo: "shopLogo", avatar: "avatar" };
		setters[type]?.("");
		await commonService.updateCommonProfile({ [fields[type]]: null });
		await refreshUser();
	};

	if (!isAuthenticated || !user) {
		return (
			<div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
				<div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
				<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
					Identification en cours...
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

			<div className="relative z-10 max-w-5xl mx-auto px-4 py-4 md:py-6 space-y-12">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fade-in-down">
					<div className="space-y-4">
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest mb-2">
							<div className="w-5 h-[2px] bg-emerald-600"></div>
							<span>Mon Compte</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
							Profil{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
								Utilisateur.
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">
							Gérez vos informations personnelles, votre image de marque et
							suivez vos statistiques de performance.
						</p>
					</div>

					{!editing && (
						<button
							onClick={handleEdit}
							className="group relative inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl overflow-hidden transition-all duration-300 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-1"
						>
							<Edit3 className="w-4 h-4 mr-2" />
							Modifier le profil
						</button>
					)}
				</div>

				<div className="space-y-10">
					<div className="animate-fade-in-up delay-100">
						<ProfileHeader
							user={user}
							avatar={avatar}
							editing={editing}
							saving={saving}
							vendorStats={vendorStats}
							vendorStatsLoading={vendorStatsLoading}
							onAvatarChange={(url) => handleImageChange("avatar", url)}
							onAvatarRemove={() => handleImageRemove("avatar")}
							onEdit={handleEdit}
							onSave={handleSave}
							onCancel={handleCancel}
							safeDisplay={safeDisplay}
						/>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
						<div className="lg:col-span-2 space-y-10">
							<div className="animate-fade-in-up delay-200">
								<div className="flex items-center gap-3 px-1 mb-6">
									<div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
									<h2 className="text-xl font-[1000] text-gray-900 tracking-tight uppercase tracking-[0.1em]">
										Informations Générales
									</h2>
								</div>
								<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-3 md:p-6  border border-white/60 shadow-sm">
									<ProfileFormFields
										user={user}
										editing={editing}
										formData={formData}
										verificationStatus={verificationStatus}
										onInputChange={handleInputChange}
										onCuisineTypeChange={handleCuisineTypeChange}
										onFormDataChange={setFormData}
										safeDisplay={safeDisplay}
									/>
								</div>
							</div>
						</div>

						<div className="space-y-10">
							<div className="animate-fade-in-up delay-300">
								<div className="flex items-center gap-3 px-2 mb-6">
									<div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
									<h2 className="text-xl font-[1000] text-gray-900 tracking-tight uppercase tracking-[0.1em]">
										Statut
									</h2>
								</div>
								<VerificationStatus
									verificationStatus={verificationStatus}
									onRefresh={refreshUser}
								/>
							</div>
						</div>
					</div>

					{user.userType !== "consumer" && (
						<div className="animate-fade-in-up delay-400 pt-10">
							<div className="h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-16"></div>
							<div className="flex items-center gap-3 px-2 mb-6">
								<div className="w-1.5 h-6 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)]"></div>
								<h2 className="text-xl font-[1000] text-gray-900 tracking-tight uppercase tracking-[0.1em]">
									Ma Boutique & Identité Visuelle
								</h2>
							</div>
							<ShopSection
								user={user}
								shopBanner={shopBanner}
								shopLogo={shopLogo}
								onBannerChange={(url) => handleImageChange("banner", url)}
								onBannerRemove={() => handleImageRemove("banner")}
								onLogoChange={(url) => handleImageChange("logo", url)}
								onLogoRemove={() => handleImageRemove("logo")}
								editing={editing}
							/>
						</div>
					)}
				</div>

				{editing && (
					<div className="fixed bottom-8 left-0 right-0 z-50 px-4 pointer-events-none lg:pl-72">
						<div className="max-w-5xl mx-auto flex justify-center md:justify-end gap-4">
							<button
								onClick={handleCancel}
								className="pointer-events-auto flex items-center gap-2 px-8 py-4 bg-white/90 backdrop-blur-md border border-gray-100 rounded-[2rem] text-gray-900 font-[1000] text-[10px] uppercase tracking-widest shadow-xl hover:bg-gray-50 transition-all active:scale-95"
							>
								<X className="h-4 w-4" />
								Annuler
							</button>
							<button
								onClick={handleSave}
								disabled={saving}
								className="pointer-events-auto group flex items-center gap-3 px-10 py-4 bg-gray-900 text-white rounded-[2rem] font-[1000] text-[10px] uppercase tracking-widest shadow-2xl transition-all hover:bg-emerald-600 active:scale-95 disabled:bg-gray-400"
							>
								{saving ?
									<div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
								:	<Save className="h-4 w-4" />}
								{saving ? "Sauvegarde..." : "Enregistrer les modifications"}
								<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ProfilePage;
