import React, { useState, useEffect } from "react";
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
import { FiUser } from "react-icons/fi";
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
		// Filter out fields that shouldn't be edited directly or are handled otherwise
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
				const dataToSend = {
					firstName: formData.firstName,
					lastName: formData.lastName,
					restaurantName: formData.restaurantName,
					restaurantType: formData.restaurantType,
					cuisineTypes: formData.cuisineTypes || [],
					seatingCapacity: formData.seatingCapacity,
					address: formData.address,
					city: formData.city,
					region: formData.region,
					country: formData.country,
					additionalServices: formData.additionalServices,
					operatingHours: formData.operatingHours,
				};
				Object.keys(dataToSend).forEach((key) => {
					if (
						dataToSend[key] === undefined ||
						dataToSend[key] === null ||
						dataToSend[key] === ""
					) {
						delete dataToSend[key];
					}
				});
				response = await restaurateurService.updateMyProfile(dataToSend);
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
			alert("Profil mis à jour avec succès !");
		} catch (error) {
			console.error("Erreur sauvegarde:", error);
			alert(
				error.response?.data?.message ||
					"Erreur lors de la sauvegarde du profil"
			);
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
			cuisineTypes: checked
				? [...(prev.cuisineTypes || []), value]
				: (prev.cuisineTypes || []).filter((type) => type !== value),
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
			<ModularDashboardLayout>
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">
							Accès non autorisé
						</h2>
						<p className="text-gray-600">
							Vous devez être connecté pour accéder à cette page.
						</p>
					</div>
				</div>
			</ModularDashboardLayout>
		);
	}

	if (loading) {
		return (
			<ModularDashboardLayout>
				<div className="p-6 max-w-4xl mx-auto">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
						<div className="bg-white rounded-lg shadow p-6">
							<div className="flex items-center space-x-6">
								<div className="w-24 h-24 bg-gray-200 rounded-full"></div>
								<div className="flex-1">
									<div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
									<div className="h-4 bg-gray-200 rounded w-1/2"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</ModularDashboardLayout>
		);
	}

	return (
		<ModularDashboardLayout>
			<div className="p-3 max-w-4xl mx-auto">
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-gray-900 flex items-center">
						<FiUser className="mr-3" />
						Mon Profil
					</h1>
					<p className="text-gray-600 mt-1">
						Gérez vos informations personnelles et votre image de profil
					</p>
				</div>

				<div className="space-y-6">
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

					<VerificationStatus
						verificationStatus={verificationStatus}
						onRefresh={refreshUser}
					/>

					<ShopSection
						user={user}
						shopBanner={shopBanner}
						shopLogo={shopLogo}
						onBannerChange={(url) => handleImageChange("banner", url)}
						onBannerRemove={() => handleImageRemove("banner")}
						onLogoChange={(url) => handleImageChange("logo", url)}
						onLogoRemove={() => handleImageRemove("logo")}
					/>
				</div>
			</div>
		</ModularDashboardLayout>
	);
};

export default ProfilePage;
