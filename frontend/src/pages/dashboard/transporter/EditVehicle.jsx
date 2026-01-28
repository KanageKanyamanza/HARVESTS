import React from "react";
import { transporterService } from "../../../services";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import { FiTruck, FiArrowLeft, FiSave, FiX } from "react-icons/fi";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { useVehicleForm } from "../../../hooks/useVehicleForm";
import {
	VehicleImageUpload,
	VehicleBasicInfo,
	VehicleCapacity,
	VehicleFeatures,
	VehicleStatus,
} from "../../../components/vehicle/VehicleFormFields";

const vehicleTypes = [
	{ value: "motorcycle", label: "Moto" },
	{ value: "van", label: "Fourgonnette" },
	{ value: "truck", label: "Camion" },
	{ value: "refrigerated-truck", label: "Camion frigorifique" },
	{ value: "trailer", label: "Remorque" },
	{ value: "container-truck", label: "Camion conteneur" },
];

const specialFeaturesOptions = [
	{ value: "refrigerated", label: "Frigorifique" },
	{ value: "insulated", label: "Isolé" },
	{ value: "ventilated", label: "Ventilé" },
	{ value: "covered", label: "Couvert" },
	{ value: "gps-tracked", label: "Suivi GPS" },
	{ value: "temperature-controlled", label: "Température contrôlée" },
];

const EditVehicle = () => {
	const {
		formData,
		errors,
		loading,
		saving,
		vehicleImage,
		uploadingImage,
		fileInputRef,
		vehicleId,
		handleChange,
		handleCapacityChange,
		handleFeatureToggle,
		handleImageUpload,
		handleImageRemove,
		handleSubmit,
		navigate,
	} = useVehicleForm(
		transporterService,
		"transporter",
		"/transporter/fleet",
		"kg",
	);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<LoadingSpinner size="lg" text="Chargement..." />
			</div>
		);
	}

	return (
		<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden bg-gray-50/30">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-100/20 rounded-full blur-[120px]"></div>
			</div>

			<div className="relative z-10 p-4 md:p-6 max-w-5xl mx-auto space-y-8">
				{/* Back Button */}
				<button
					onClick={() => navigate("/transporter/fleet")}
					className="group inline-flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 transition-colors"
				>
					<FiArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
					RETOUR À LA FLOTTE
				</button>

				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
					<div>
						<div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
							<div className="w-5 h-[2px] bg-indigo-600"></div>
							<span>Modification de l'Unité</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
							Editer&nbsp;
							<span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 italic pr-8 py-2">
								{vehicleTypes.find((t) => t.value === formData.vehicleType)
									?.label || "le véhicule"}
								&nbsp;
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">
							Mettez à jour les spécifications techniques et l'état de service
							de votre unité logistique.
						</p>
					</div>
				</div>

				<form
					onSubmit={handleSubmit}
					className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up"
				>
					{/* Left Column - Image & Status */}
					<div className="lg:col-span-1 space-y-6">
						<div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-6 shadow-xl shadow-indigo-900/5">
							<h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-2">
								Visuel du véhicule
							</h3>
							<VehicleImageUpload
								vehicleImage={vehicleImage}
								uploadingImage={uploadingImage}
								onImageUpload={handleImageUpload}
								onImageRemove={handleImageRemove}
								fileInputRef={fileInputRef}
							/>
						</div>

						<div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-6 shadow-xl shadow-indigo-900/5">
							<h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-2">
								Disponibilité & État
							</h3>
							<VehicleStatus formData={formData} onChange={handleChange} />
						</div>
					</div>

					{/* Center/Right Column - Details */}
					<div className="lg:col-span-2 space-y-6">
						<div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-xl shadow-indigo-900/5">
							<h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 px-2">
								Détails Techniques
							</h3>

							<div className="space-y-8 px-2">
								<VehicleBasicInfo
									formData={formData}
									errors={errors}
									vehicleTypes={vehicleTypes}
									onChange={handleChange}
									isExporter={false}
								/>

								<div className="pt-6 border-t border-gray-100/50">
									<VehicleCapacity
										formData={formData}
										weightUnit="kg"
										volumeUnit="m³"
										onCapacityChange={handleCapacityChange}
									/>
								</div>

								<div className="pt-6 border-t border-gray-100/50">
									<VehicleFeatures
										formData={formData}
										specialFeaturesOptions={specialFeaturesOptions}
										onFeatureToggle={handleFeatureToggle}
									/>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row justify-end gap-4 mt-12 pt-8 border-t border-gray-100/50 px-2">
								<button
									type="button"
									onClick={() => navigate("/transporter/fleet")}
									className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
								>
									Annuler les changements
								</button>
								<button
									type="submit"
									disabled={saving}
									className="group relative inline-flex items-center justify-center px-8 py-4 bg-gray-900 rounded-2xl overflow-hidden transition-all hover:bg-indigo-600 hover:ring-4 hover:ring-indigo-500/10 disabled:bg-gray-200 disabled:cursor-not-allowed"
								>
									{saving ?
										<LoadingSpinner size="sm" text="" color="text-white" />
									:	<>
											<FiSave className="w-4 h-4 mr-2 text-white/50 group-hover:text-white transition-colors" />
											<span className="text-[10px] font-black uppercase tracking-widest text-white">
												Enregistrer les modifications
											</span>
										</>
									}
								</button>
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditVehicle;
