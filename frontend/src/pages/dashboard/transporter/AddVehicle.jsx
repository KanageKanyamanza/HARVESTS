import React from "react";
import { useNavigate } from "react-router-dom";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import VehicleImageUpload from "../../../components/vehicles/VehicleImageUpload";
import VehicleCapacity from "../../../components/vehicles/VehicleCapacity";
import { FiTruck, FiArrowLeft, FiSave } from "react-icons/fi";
import { useAddVehicle } from "../../../hooks/useAddVehicle";
import {
	transporterVehicleTypes,
	specialFeaturesOptions,
} from "../../../utils/vehicleConstants";

const AddVehicle = () => {
	const navigate = useNavigate();
	const {
		loading,
		errors,
		formData,
		vehicleImage,
		uploadingImage,
		fileInputRef,
		handleInputChange,
		handleFileSelect,
		handleDrop,
		removeImage,
		handleSubmit,
	} = useAddVehicle("transporter");

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
					onClick={() => navigate(-1)}
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
							<span>Unités Logistiques</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
							Ajouter un{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 italic">
								Véhicule.
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">
							Enregistrez une nouvelle unité pour étendre vos capacités de
							livraison locale.
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
								fileInputRef={fileInputRef}
								onFileSelect={handleFileSelect}
								onDrop={handleDrop}
								onRemove={removeImage}
							/>
						</div>

						<div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-6 shadow-xl shadow-indigo-900/5">
							<h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-2">
								Disponibilité & État
							</h3>
							<div className="space-y-4 px-2">
								<div>
									<label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
										État Général
									</label>
									<select
										name="condition"
										value={formData.condition}
										onChange={handleInputChange}
										className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
									>
										<option value="excellent">Excellent</option>
										<option value="good">Bon</option>
										<option value="fair">Moyen</option>
										<option value="needs-maintenance">Entretien requis</option>
									</select>
								</div>
								<div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
									<input
										type="checkbox"
										name="isAvailable"
										id="isAvailable"
										checked={formData.isAvailable}
										onChange={handleInputChange}
										className="w-5 h-5 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500"
									/>
									<label
										htmlFor="isAvailable"
										className="text-xs font-bold text-indigo-900"
									>
										Prêt pour le service
									</label>
								</div>
							</div>
						</div>
					</div>

					{/* Center/Right Column - Details */}
					<div className="lg:col-span-2 space-y-6">
						<div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-xl shadow-indigo-900/5">
							<h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 px-2">
								Informations Techniques
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
								<div className="space-y-2">
									<label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
										Type de Véhicule <span className="text-red-500">*</span>
									</label>
									<select
										name="vehicleType"
										value={formData.vehicleType}
										onChange={handleInputChange}
										required
										className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
									>
										<option value="">Sélectionnez un type</option>
										{transporterVehicleTypes.map((type) => (
											<option key={type.value} value={type.value}>
												{type.label}
											</option>
										))}
									</select>
									{errors.vehicleType && (
										<p className="text-red-500 text-[10px] font-bold uppercase tracking-tight">
											{errors.vehicleType}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
										ID / Immatriculation
									</label>
									<input
										type="text"
										name="registrationNumber"
										value={formData.registrationNumber}
										onChange={handleInputChange}
										placeholder="EX: LT-2024-X"
										className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
									/>
								</div>

								<div className="md:col-span-2 py-4">
									<VehicleCapacity
										capacity={formData.capacity}
										onInputChange={handleInputChange}
									/>
								</div>

								<div className="md:col-span-2 pt-4 border-t border-gray-100/50">
									<label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
										Équipements & Spécificités
									</label>
									<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
										{specialFeaturesOptions.map((feature) => (
											<label
												key={feature.value}
												className={`flex items-center p-3 rounded-xl border transition-all cursor-pointer ${
													formData.specialFeatures.includes(feature.value) ?
														"bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
													:	"bg-gray-50 border-gray-100 text-gray-600 hover:border-indigo-200"
												}`}
											>
												<input
													type="checkbox"
													name="specialFeatures"
													value={feature.value}
													checked={formData.specialFeatures.includes(
														feature.value,
													)}
													onChange={handleInputChange}
													className="sr-only"
												/>
												<span className="text-[10px] font-black uppercase tracking-tight">
													{feature.label}
												</span>
											</label>
										))}
									</div>
								</div>

								<div className="md:col-span-2 pt-6 border-t border-gray-100/50 flex flex-col md:flex-row gap-4">
									<div className="flex-1 space-y-2">
										<label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest text-center md:text-left">
											Dernière Maintenance
										</label>
										<input
											type="date"
											name="lastMaintenanceDate"
											value={formData.lastMaintenanceDate}
											onChange={handleInputChange}
											className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
										/>
									</div>
									<div className="flex-1 space-y-2">
										<label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest text-center md:text-left">
											Prochain RDV
										</label>
										<input
											type="date"
											name="nextMaintenanceDate"
											value={formData.nextMaintenanceDate}
											onChange={handleInputChange}
											className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
										/>
									</div>
								</div>
							</div>

							{errors.submit && (
								<div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
									<div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
									<p className="text-[10px] font-black uppercase tracking-widest">
										{errors.submit}
									</p>
								</div>
							)}

							<div className="flex flex-col sm:flex-row justify-end gap-4 mt-12 pt-8 border-t border-gray-100/50 px-2">
								<button
									type="button"
									onClick={() => navigate(-1)}
									className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
								>
									Annuler
								</button>
								<button
									type="submit"
									disabled={loading || !formData.vehicleType}
									className="group relative inline-flex items-center justify-center px-8 py-4 bg-gray-900 rounded-2xl overflow-hidden transition-all hover:bg-indigo-600 hover:ring-4 hover:ring-indigo-500/10 disabled:bg-gray-200 disabled:cursor-not-allowed"
								>
									{loading ?
										<LoadingSpinner size="sm" text="" color="text-white" />
									:	<>
											<FiSave className="w-4 h-4 mr-2 text-white/50 group-hover:text-white transition-colors" />
											<span className="text-[10px] font-black uppercase tracking-widest text-white">
												Enregistrer le véhicule
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

export default AddVehicle;
