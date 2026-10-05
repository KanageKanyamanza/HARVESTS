import React from "react";
import { useTranslation } from "react-i18next";
import { FiUpload, FiTrash2 } from "react-icons/fi";
import CloudinaryImage from "../common/CloudinaryImage";

// Jour 52 : libellés traduits par valeur (namespace dashboard-transporter),
// le label français des listes d'options ne sert plus que de repli.
const VEHICLE_CONDITIONS = ["excellent", "good", "fair", "needs-maintenance"];

export const VehicleImageUpload = ({
	vehicleImage,
	uploadingImage,
	onImageUpload,
	onImageRemove,
	fileInputRef,
}) => {
	const { t } = useTranslation("dashboard-transporter");

	return (
		<div className="flex flex-col items-center space-y-6">
			<div className="relative group">
				<div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
				<div className="relative h-48 w-48 bg-gray-50 rounded-[1.8rem] overflow-hidden flex items-center justify-center border-4 border-white shadow-inner">
					{vehicleImage?.url ?
						<CloudinaryImage
							src={vehicleImage.url}
							alt={t("vehicle.imageUpload.alt")}
							className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
						/>
					:	<div className="flex flex-col items-center">
							<FiUpload className="w-8 h-8 text-indigo-200 mb-2" />
							<span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center px-4">
								{t("vehicle.imageUpload.noPreview")}
							</span>
						</div>
					}
				</div>
			</div>

			<div className="flex flex-col w-full gap-3 px-2">
				<input
					type="file"
					ref={fileInputRef}
					onChange={onImageUpload}
					accept="image/*"
					className="hidden"
				/>
				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					disabled={uploadingImage}
					className="group relative inline-flex items-center justify-center px-6 py-3.5 bg-gray-900 rounded-xl overflow-hidden transition-all hover:bg-indigo-600 hover:ring-4 hover:ring-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<FiUpload className="h-4 w-4 mr-2 text-white/50 group-hover:text-white transition-colors" />
					<span className="text-[10px] font-black uppercase tracking-widest text-white">
						{uploadingImage ?
							t("vehicle.imageUpload.uploading")
						:	t("vehicle.imageUpload.change")}
					</span>
				</button>

				{vehicleImage?.url && (
					<button
						type="button"
						onClick={onImageRemove}
						className="inline-flex items-center justify-center px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-red-100 hover:border-red-600"
					>
						<FiTrash2 className="h-4 w-4 mr-2" />
						{t("vehicle.imageUpload.remove")}
					</button>
				)}
			</div>
		</div>
	);
};

export const VehicleBasicInfo = ({
	formData,
	errors,
	vehicleTypes,
	onChange,
	isExporter,
}) => {
	const { t } = useTranslation("dashboard-transporter");

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<h3 className="text-lg font-medium text-gray-900 mb-4">
				{t("vehicle.form.basicInfo")}
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						{t("vehicle.form.vehicleType")} *
					</label>
					<select
						name="vehicleType"
						value={formData.vehicleType}
						onChange={onChange}
						className={`w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${errors.vehicleType ? "border-red-300" : "border-gray-300"}`}
					>
						<option value="">{t("vehicle.form.selectType")}</option>
						{vehicleTypes.map((type) => (
							<option key={type.value} value={type.value}>
								{t(`vehicle.types.${type.value}`, { defaultValue: type.label })}
							</option>
						))}
					</select>
					{errors.vehicleType && (
						<p className="mt-1 text-sm text-red-600">{errors.vehicleType}</p>
					)}
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						{t("vehicle.form.registration")} *
					</label>
					<input
						type="text"
						name="registrationNumber"
						value={formData.registrationNumber}
						onChange={onChange}
						placeholder={t("vehicle.form.registrationPlaceholder")}
						className={`w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${errors.registrationNumber ? "border-red-300" : "border-gray-300"}`}
					/>
					{errors.registrationNumber && (
						<p className="mt-1 text-sm text-red-600">
							{errors.registrationNumber}
						</p>
					)}
				</div>
				{isExporter && (
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							{t("vehicle.form.containerNumber")}
						</label>
						<input
							type="text"
							name="containerNumber"
							value={formData.containerNumber || ""}
							onChange={onChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export const VehicleCapacity = ({
	formData,
	weightUnit,
	volumeUnit,
	onCapacityChange,
}) => {
	const { t } = useTranslation("dashboard-transporter");
	const unitLabel = (unit) => t(`vehicle.units.${unit}`, { defaultValue: unit });

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<h3 className="text-lg font-medium text-gray-900 mb-4">
				{t("vehicle.form.capacity")}
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						{t("vehicle.form.maxWeight", { unit: unitLabel(weightUnit) })}
					</label>
					<input
						type="number"
						name="capacity.weight.value"
						value={formData.capacity?.weight?.value || ""}
						onChange={onCapacityChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						{t("vehicle.form.maxVolume", { unit: unitLabel(volumeUnit) })}
					</label>
					<input
						type="number"
						name="capacity.volume.value"
						value={formData.capacity?.volume?.value || ""}
						onChange={onCapacityChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
					/>
				</div>
			</div>
		</div>
	);
};

export const VehicleFeatures = ({
	formData,
	specialFeaturesOptions,
	onFeatureToggle,
}) => {
	const { t } = useTranslation("dashboard-transporter");

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<h3 className="text-lg font-medium text-gray-900 mb-4">
				{t("vehicle.form.equipment")}
			</h3>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
				{specialFeaturesOptions.map((feature) => (
					<label
						key={feature.value}
						className="flex items-center space-x-2 cursor-pointer"
					>
						<input
							type="checkbox"
							checked={formData.specialFeatures?.includes(feature.value)}
							onChange={() => onFeatureToggle(feature.value)}
							className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
						/>
						<span className="text-sm text-gray-700">
							{t(`vehicle.features.${feature.value}`, {
								defaultValue: feature.label,
							})}
						</span>
					</label>
				))}
			</div>
		</div>
	);
};

export const VehicleStatus = ({ formData, onChange }) => {
	const { t } = useTranslation("dashboard-transporter");

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<h3 className="text-lg font-medium text-gray-900 mb-4">
				{t("vehicle.form.statusAndMaintenance")}
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						{t("vehicle.form.generalCondition")}
					</label>
					<select
						name="condition"
						value={formData.condition}
						onChange={onChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
					>
						{VEHICLE_CONDITIONS.map((condition) => (
							<option key={condition} value={condition}>
								{t(`vehicle.conditions.${condition}`)}
							</option>
						))}
					</select>
				</div>
				<div>
					<label className="flex items-center space-x-2 cursor-pointer mt-6">
						<input
							type="checkbox"
							name="isAvailable"
							checked={formData.isAvailable}
							onChange={onChange}
							className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
						/>
						<span className="text-sm text-gray-700">
							{t("vehicle.form.available")}
						</span>
					</label>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						{t("vehicle.form.lastMaintenance")}
					</label>
					<input
						type="date"
						name="lastMaintenanceDate"
						value={formData.lastMaintenanceDate || ""}
						onChange={onChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						{t("vehicle.form.nextMaintenance")}
					</label>
					<input
						type="date"
						name="nextMaintenanceDate"
						value={formData.nextMaintenanceDate || ""}
						onChange={onChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
					/>
				</div>
			</div>
		</div>
	);
};
