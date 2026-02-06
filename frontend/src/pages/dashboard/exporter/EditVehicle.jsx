import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { exporterService, uploadService } from "../../../services";
import {
	FiArrowLeft,
	FiSave,
	FiX,
	FiActivity,
	FiCpu,
	FiInfo,
	FiZap,
} from "react-icons/fi";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { useNotifications } from "../../../contexts/NotificationContext";
import VehicleImageUpload from "../../../components/vehicles/VehicleImageUpload";
import VehicleCapacity from "../../../components/vehicles/VehicleCapacity";
import {
	vehicleTypes,
	specialFeaturesOptions,
} from "../../../utils/vehicleConstants";

const EditVehicle = () => {
	const { vehicleId } = useParams();
	const navigate = useNavigate();
	const { showSuccess, showError } = useNotifications();

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [errors, setErrors] = useState({});
	const [uploadingImage, setUploadingImage] = useState(false);
	const [vehicleImage, setVehicleImage] = useState(null);
	const fileInputRef = useRef(null);

	const [formData, setFormData] = useState({
		vehicleType: "",
		registrationNumber: "",
		containerNumber: "",
		capacity: {
			weight: { value: 0, unit: "tons" },
			volume: { value: 0, unit: "m³" },
		},
		specialFeatures: [],
		condition: "excellent",
		isAvailable: true,
		lastMaintenanceDate: "",
		nextMaintenanceDate: "",
	});

	// Charger les données du véhicule
	useEffect(() => {
		const fetchVehicle = async () => {
			try {
				setLoading(true);
				const response = await exporterService.getFleet();
				const fleet = response.data?.data?.fleet || response.data?.fleet || [];
				const vehicle = fleet.find((v) => v._id === vehicleId);

				if (!vehicle) {
					showError("Véhicule non trouvé");
					navigate("/exporter/fleet");
					return;
				}

				setFormData({
					vehicleType: vehicle.vehicleType || "",
					registrationNumber: vehicle.registrationNumber || "",
					containerNumber: vehicle.containerNumber || "",
					capacity: {
						weight: {
							value: vehicle.capacity?.weight?.value || 0,
							unit: vehicle.capacity?.weight?.unit || "tons",
						},
						volume: {
							value: vehicle.capacity?.volume?.value || 0,
							unit: vehicle.capacity?.volume?.unit || "m³",
						},
					},
					specialFeatures: vehicle.specialFeatures || [],
					condition: vehicle.condition || "excellent",
					isAvailable:
						vehicle.isAvailable !== undefined ? vehicle.isAvailable : true,
					lastMaintenanceDate:
						vehicle.lastMaintenanceDate ?
							new Date(vehicle.lastMaintenanceDate).toISOString().split("T")[0]
						:	"",
					nextMaintenanceDate:
						vehicle.nextMaintenanceDate ?
							new Date(vehicle.nextMaintenanceDate).toISOString().split("T")[0]
						:	"",
				});

				if (vehicle.image) {
					setVehicleImage(
						typeof vehicle.image === "string" ?
							{ url: vehicle.image }
						:	vehicle.image,
					);
				}
			} catch (error) {
				console.error("Erreur chargement véhicule:", error);
				showError("Erreur lors du chargement des données");
			} finally {
				setLoading(false);
			}
		};

		if (vehicleId) {
			fetchVehicle();
		}
	}, [vehicleId, navigate, showError]);

	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;

		if (name.includes(".")) {
			const parts = name.split(".");
			if (parts.length === 3) {
				const [p1, p2, p3] = parts;
				setFormData((prev) => ({
					...prev,
					[p1]: {
						...prev[p1],
						[p2]: { ...prev[p1][p2], [p3]: value },
					},
				}));
			} else {
				const [p1, p2] = parts;
				setFormData((prev) => ({
					...prev,
					[p1]: { ...prev[p1], [p2]: value },
				}));
			}
		} else {
			if (type === "checkbox") {
				if (name === "specialFeatures") {
					setFormData((prev) => ({
						...prev,
						specialFeatures:
							checked ?
								[...prev.specialFeatures, value]
							:	prev.specialFeatures.filter((f) => f !== value),
					}));
				} else {
					setFormData((prev) => ({ ...prev, [name]: checked }));
				}
			} else {
				setFormData((prev) => ({ ...prev, [name]: value }));
			}
		}
	};

	const handleFileSelect = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			setUploadingImage(true);
			const imageFormData = new FormData();
			imageFormData.append("images", file);
			imageFormData.append("folder", "fleet");
			const response = await uploadService.uploadProductImages(imageFormData);
			const uploaded =
				response.data?.data?.images?.[0] || response.data?.images?.[0];

			if (uploaded) {
				setVehicleImage({
					url: uploaded.secure_url || uploaded.url,
					publicId: uploaded.public_id,
					alt: file.name,
				});
				showSuccess("Image mise à jour");
			}
		} catch (error) {
			showError("Erreur lors de l'upload");
		} finally {
			setUploadingImage(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			setSaving(true);
			const payload = { ...formData, image: vehicleImage };
			await exporterService.updateFleetVehicle(vehicleId, payload);
			showSuccess("Véhicule mis à jour avec succès");
			navigate("/exporter/fleet");
		} catch (error) {
			showError(
				error.response?.data?.message || "Erreur lors de la mise à jour",
			);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50/50">
				<LoadingSpinner size="lg" text="Chargement du véhicule..." />
			</div>
		);
	}

	return (
		<div className="min-h-screen relative bg-gray-50/30">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
				<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] right-[20%] w-[40%] h-[40%] bg-amber-50/30 rounded-full blur-[120px]"></div>
			</div>

			<div className="relative z-10 p-4 md:p-6 max-w-4xl mx-auto space-y-8">
				{/* Header */}
				<div>
					<button
						onClick={() => navigate("/exporter/fleet")}
						type="button"
						className="group inline-flex items-center text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-emerald-600 transition-colors mb-6"
					>
						<FiArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
						Retour à la flotte
					</button>

					<div className="flex items-center gap-2 text-blue-600 font-black text-[9px] uppercase tracking-widest mb-2">
						<div className="w-5 h-[2px] bg-blue-600"></div>
						<span>Modification Unité</span>
					</div>
					<h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2 pb-2">
						Editer&nbsp;
						<span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 italic pr-8 py-2">
							{vehicleTypes.find((t) => t.value === formData.vehicleType)
								?.label || "le véhicule"}
							&nbsp;
						</span>
					</h1>
					<p className="text-xs text-gray-500 font-medium max-w-xl">
						Mettez à jour les paramètres opérationnels de votre unité
						logistique.
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-10">
					{/* Image Upload Area */}
					<div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-blue-900/5">
						<div className="flex items-center gap-2 mb-6">
							<FiActivity className="text-blue-500 w-4 h-4" />
							<h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
								Visuel de l'unité
							</h3>
						</div>
						<VehicleImageUpload
							vehicleImage={vehicleImage}
							uploadingImage={uploadingImage}
							fileInputRef={fileInputRef}
							onFileSelect={handleFileSelect}
							onRemove={() => setVehicleImage(null)}
						/>
					</div>

					{/* Main Form Fields */}
					<div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-blue-900/5 space-y-10">
						{/* Basic Info */}
						<div className="space-y-6">
							<div className="flex items-center gap-2">
								<FiInfo className="text-blue-500 w-4 h-4" />
								<h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
									Données Générales
								</h3>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
										Type d'unité
									</label>
									<select
										name="vehicleType"
										value={formData.vehicleType || ""}
										onChange={handleInputChange}
										required
										className="w-full px-5 py-4 bg-white/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer"
									>
										<option value="">Sélectionnez un type</option>
										{(vehicleTypes || []).map((type) => (
											<option key={type.value} value={type.value}>
												{type.label}
											</option>
										))}
									</select>
								</div>

								<div className="space-y-2">
									<label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
										Immatriculation
									</label>
									<input
										type="text"
										name="registrationNumber"
										value={formData.registrationNumber || ""}
										onChange={handleInputChange}
										className="w-full px-5 py-4 bg-white/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
									/>
								</div>

								<div className="space-y-2">
									<label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
										N° Conteneur
									</label>
									<input
										type="text"
										name="containerNumber"
										value={formData.containerNumber || ""}
										onChange={handleInputChange}
										className="w-full px-5 py-4 bg-white/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
									/>
								</div>

								<div className="space-y-2">
									<label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
										Etat
									</label>
									<select
										name="condition"
										value={formData.condition || "excellent"}
										onChange={handleInputChange}
										className="w-full px-5 py-4 bg-white/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer"
									>
										<option value="excellent">Excellent</option>
										<option value="good">Bon</option>
										<option value="fair">Moyen</option>
										<option value="needs-maintenance">Maintenance</option>
									</select>
								</div>
							</div>
						</div>

						{/* Capacity Module */}
						<div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100/50">
							<div className="flex items-center gap-2 mb-6">
								<FiZap className="text-blue-500 w-4 h-4" />
								<h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
									Spécifications de Charge
								</h3>
							</div>
							<VehicleCapacity
								capacity={formData.capacity}
								onInputChange={handleInputChange}
							/>
						</div>

						{/* Options */}
						<div>
							<div className="flex items-center gap-2 mb-4">
								<FiCpu className="text-blue-500 w-4 h-4" />
								<h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
									Options Techniques
								</h3>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
								{(specialFeaturesOptions || []).map((feature) => (
									<label
										key={feature.value}
										className="relative group cursor-pointer"
									>
										<input
											type="checkbox"
											name="specialFeatures"
											value={feature.value}
											checked={(formData.specialFeatures || []).includes(
												feature.value,
											)}
											onChange={handleInputChange}
											className="peer sr-only"
										/>
										<div className="px-4 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-tight transition-all peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-500 peer-checked:shadow-lg peer-checked:shadow-blue-200">
											{feature.label}
										</div>
									</label>
								))}
							</div>
						</div>

						{/* Status */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-100 pt-8">
							<div className="space-y-4">
								<label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
									Disponibilité
								</label>
								<label className="flex items-center cursor-pointer group w-fit">
									<div className="relative">
										<input
											type="checkbox"
											name="isAvailable"
											checked={formData.isAvailable || false}
											onChange={handleInputChange}
											className="sr-only peer"
										/>
										<div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
									</div>
									<span className="ml-3 text-[10px] font-black text-gray-700 uppercase tracking-widest">
										Actif
									</span>
								</label>
							</div>

							<div className="space-y-2">
								<label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
									Dernière Maintenance
								</label>
								<input
									type="date"
									name="lastMaintenanceDate"
									value={formData.lastMaintenanceDate || ""}
									onChange={handleInputChange}
									className="w-full px-5 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
									Prochaine Échéance
								</label>
								<input
									type="date"
									name="nextMaintenanceDate"
									value={formData.nextMaintenanceDate || ""}
									onChange={handleInputChange}
									className="w-full px-5 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-sans"
								/>
							</div>
						</div>
					</div>

					{/* Actions Area */}
					<div className="flex flex-col sm:flex-row justify-end gap-4 border-t border-gray-100 pt-10">
						<button
							type="button"
							onClick={() => navigate("/exporter/fleet")}
							className="px-8 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:bg-gray-50 hover:text-gray-600 transition-all active:scale-95"
						>
							Annuler
						</button>
						<button
							type="submit"
							disabled={saving}
							className="group relative px-10 py-4 bg-gray-900 text-white rounded-2xl overflow-hidden disabled:bg-gray-200 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xl shadow-gray-200"
						>
							<div className="relative flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em]">
								{saving ?
									<>
										<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-3"></div>
										Mise à jour...
									</>
								:	<>
										<FiSave className="h-4 w-4 mr-2" />
										Sauvegarder
									</>
								}
							</div>
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditVehicle;
