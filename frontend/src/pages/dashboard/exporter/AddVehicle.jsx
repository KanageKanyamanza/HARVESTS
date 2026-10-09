import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import VehicleImageUpload from "../../../components/vehicles/VehicleImageUpload";
import VehicleCapacity from "../../../components/vehicles/VehicleCapacity";
import { FiArrowLeft, FiSave, FiInfo, FiZap } from "react-icons/fi";
import { useAddVehicle } from "../../../hooks/useAddVehicle";
import {
	vehicleTypes,
	specialFeaturesOptions,
} from "../../../utils/vehicleConstants";

const AddVehicle = () => {
	const { t } = useTranslation("dashboard-transporter");
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
	} = useAddVehicle();

	return (
		<div className="dashboard-page">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-amber-50/30 rounded-full blur-[120px]"></div>
			</div>

			<div className="dashboard-container space-y-8">
				{/* Header Section */}
				<div>
					<button
						onClick={() => navigate(-1)}
						type="button"
						className="group inline-flex items-center text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-emerald-600 transition-colors mb-6"
					>
						<FiArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
						{t("vehicle.form.backToFleet")}
					</button>

					<div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest mb-2">
						<div className="w-5 h-[2px] bg-emerald-600"></div>
						<span>{t("exporter.vehicleForm.addEyebrow")}</span>
					</div>
					<h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-2">
						{t("exporter.vehicleForm.addTitleStart")}{" "}
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 italic">
							{t("exporter.vehicleForm.addTitleHighlight")}
						</span>
					</h1>
					<p className="text-xs text-gray-500 font-medium max-w-xl">
						{t("exporter.vehicleForm.addSubtitle")}
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-xl shadow-emerald-900/5 p-8 md:p-10 space-y-10"
				>
					{/* Upload d'image */}
					<div className="relative group">
						<div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
						<div className="relative">
							<VehicleImageUpload
								vehicleImage={vehicleImage}
								uploadingImage={uploadingImage}
								fileInputRef={fileInputRef}
								onFileSelect={handleFileSelect}
								onDrop={handleDrop}
								onRemove={removeImage}
							/>
						</div>
					</div>

					<div className="space-y-8">
						{/* Basic Info */}
						<div>
							<div className="flex items-center gap-2 mb-4">
								<FiInfo className="text-emerald-500 w-4 h-4" />
								<h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
									{t("exporter.vehicleForm.generalInfo")}
								</h3>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
										{t("exporter.vehicleForm.unitType")}
									</label>
									<select
										name="vehicleType"
										value={formData.vehicleType || ""}
										onChange={handleInputChange}
										required
										className="w-full px-5 py-4 bg-white/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all cursor-pointer"
									>
										<option value="">{t("vehicle.form.selectType")}</option>
										{(vehicleTypes || []).map((type) => (
											<option key={type.value} value={type.value}>
												{t(`vehicle.types.${type.value}`, { defaultValue: type.label })}
											</option>
										))}
									</select>
									{errors.vehicleType && (
										<p className="text-red-500 text-[10px] font-bold uppercase tracking-tight ml-1">
											{errors.vehicleType}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
										{t("exporter.vehicleForm.registrationId")}
									</label>
									<input
										type="text"
										name="registrationNumber"
										value={formData.registrationNumber || ""}
										onChange={handleInputChange}
										placeholder={t("exporter.vehicleForm.registrationPlaceholder")}
										className="w-full px-5 py-4 bg-white/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
									/>
								</div>

								<div className="space-y-2">
									<label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
										{t("exporter.vehicleForm.containerOptional")}
									</label>
									<input
										type="text"
										name="containerNumber"
										value={formData.containerNumber || ""}
										onChange={handleInputChange}
										placeholder={t("exporter.vehicleForm.containerPlaceholder")}
										className="w-full px-5 py-4 bg-white/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
									/>
								</div>

								<div className="space-y-2">
									<label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
										{t("exporter.vehicleForm.currentCondition")}
									</label>
									<select
										name="condition"
										value={formData.condition || "excellent"}
										onChange={handleInputChange}
										className="w-full px-5 py-4 bg-white/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all cursor-pointer"
									>
										{["excellent", "good", "fair", "needs-maintenance"].map((condition) => (
											<option key={condition} value={condition}>
												{t(`vehicle.conditions.${condition}`)}
											</option>
										))}
									</select>
								</div>
							</div>
						</div>

						{/* Capacité Section */}
						<div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100/50">
							<div className="flex items-center gap-2 mb-6">
								<FiZap className="text-emerald-500 w-4 h-4" />
								<h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
									{t("exporter.vehicleForm.loadSpecs")}
								</h3>
							</div>
							<VehicleCapacity
								capacity={
									formData.capacity || {
										weight: { value: 0, unit: "kg" },
										volume: { value: 0, unit: "m³" },
									}
								}
								onInputChange={handleInputChange}
							/>
						</div>

						{/* Features */}
						<div>
							<div className="flex items-center gap-2 mb-4">
								<div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
								<h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
									{t("exporter.vehicleForm.options")}
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
										<div className="px-4 py-3 bg-white/50 border border-gray-100 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-tight transition-all peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-500 peer-checked:shadow-lg peer-checked:shadow-emerald-200 group-hover:border-emerald-200">
											{t(`vehicle.features.${feature.value}`, { defaultValue: feature.label })}
										</div>
									</label>
								))}
							</div>
						</div>

						{/* Availability & Maintenance */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-100 pt-8">
							<div className="space-y-4">
								<label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
									{t("exporter.vehicleForm.availability")}
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
										<div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
									</div>
									<span className="ml-3 text-[10px] font-black text-gray-700 uppercase tracking-widest">
										{t("exporter.vehicleForm.availableForMissions")}
									</span>
								</label>
							</div>

							<div className="space-y-2">
								<label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
									{t("vehicle.form.lastMaintenance")}
								</label>
								<input
									type="date"
									name="lastMaintenanceDate"
									value={formData.lastMaintenanceDate || ""}
									onChange={handleInputChange}
									className="w-full px-5 py-3 bg-white/50 border border-gray-100 rounded-2xl text-[10px] font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-sans"
								/>
							</div>

							<div className="space-y-2">
								<label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
									{t("vehicle.form.nextMaintenance")}
								</label>
								<input
									type="date"
									name="nextMaintenanceDate"
									value={formData.nextMaintenanceDate || ""}
									onChange={handleInputChange}
									className="w-full px-5 py-3 bg-white/50 border border-gray-100 rounded-2xl text-[10px] font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-sans"
								/>
							</div>
						</div>
					</div>

					{errors.submit && (
						<div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">
							{errors.submit}
						</div>
					)}

					<div className="flex flex-col sm:flex-row justify-end gap-4 border-t border-gray-100 pt-10">
						<button
							type="button"
							onClick={() => navigate(-1)}
							className="px-8 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] hover:bg-gray-50 hover:text-gray-600 transition-all active:scale-95"
						>
							{t("vehicle.form.cancel")}
						</button>
						<button
							type="submit"
							disabled={loading || !formData.vehicleType}
							className="group relative px-10 py-4 bg-gray-900 text-white rounded-2xl overflow-hidden disabled:bg-gray-200 disabled:cursor-not-allowed transition-all active:scale-95 shadow-xl shadow-gray-200"
						>
							<div className="relative flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em]">
								{loading ?
									<>
										<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-3"></div>
										{t("exporter.vehicleForm.processing")}
									</>
								:	<>
										<FiSave className="h-4 w-4 mr-2" />
										{t("vehicle.form.save")}
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

export default AddVehicle;
