import React from "react";
import { FiUpload, FiTrash2 } from "react-icons/fi";
import CloudinaryImage from "../common/CloudinaryImage";

export const VehicleImageUpload = ({
	vehicleImage,
	uploadingImage,
	onImageUpload,
	onImageRemove,
	fileInputRef,
}) => (
	<div className="flex flex-col items-center space-y-6">
		<div className="relative group">
			<div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
			<div className="relative h-48 w-48 bg-gray-50 rounded-[1.8rem] overflow-hidden flex items-center justify-center border-4 border-white shadow-inner">
				{vehicleImage?.url ?
					<CloudinaryImage
						src={vehicleImage.url}
						alt="Véhicule"
						className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
					/>
				:	<div className="flex flex-col items-center">
						<FiUpload className="w-8 h-8 text-indigo-200 mb-2" />
						<span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center px-4">
							Aperçu indisponible
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
					{uploadingImage ? "Traitement..." : "Changer l'image"}
				</span>
			</button>

			{vehicleImage?.url && (
				<button
					type="button"
					onClick={onImageRemove}
					className="inline-flex items-center justify-center px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-red-100 hover:border-red-600"
				>
					<FiTrash2 className="h-4 w-4 mr-2" />
					Supprimer
				</button>
			)}
		</div>
	</div>
);

export const VehicleBasicInfo = ({
	formData,
	errors,
	vehicleTypes,
	onChange,
	isExporter,
}) => (
	<div className="bg-white rounded-lg shadow p-6">
		<h3 className="text-lg font-medium text-gray-900 mb-4">
			Informations de base
		</h3>
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					Type de véhicule *
				</label>
				<select
					name="vehicleType"
					value={formData.vehicleType}
					onChange={onChange}
					className={`w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${errors.vehicleType ? "border-red-300" : "border-gray-300"}`}
				>
					<option value="">Sélectionner...</option>
					{vehicleTypes.map((t) => (
						<option key={t.value} value={t.value}>
							{t.label}
						</option>
					))}
				</select>
				{errors.vehicleType && (
					<p className="mt-1 text-sm text-red-600">{errors.vehicleType}</p>
				)}
			</div>
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					Numéro d'immatriculation *
				</label>
				<input
					type="text"
					name="registrationNumber"
					value={formData.registrationNumber}
					onChange={onChange}
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
						Numéro de conteneur
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

export const VehicleCapacity = ({
	formData,
	weightUnit,
	volumeUnit,
	onCapacityChange,
}) => (
	<div className="bg-white rounded-lg shadow p-6">
		<h3 className="text-lg font-medium text-gray-900 mb-4">Capacité</h3>
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					Poids max ({weightUnit})
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
					Volume max ({volumeUnit})
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

export const VehicleFeatures = ({
	formData,
	specialFeaturesOptions,
	onFeatureToggle,
}) => (
	<div className="bg-white rounded-lg shadow p-6">
		<h3 className="text-lg font-medium text-gray-900 mb-4">
			Caractéristiques spéciales
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
					<span className="text-sm text-gray-700">{feature.label}</span>
				</label>
			))}
		</div>
	</div>
);

export const VehicleStatus = ({ formData, onChange }) => (
	<div className="bg-white rounded-lg shadow p-6">
		<h3 className="text-lg font-medium text-gray-900 mb-4">
			Statut et maintenance
		</h3>
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					État
				</label>
				<select
					name="condition"
					value={formData.condition}
					onChange={onChange}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
				>
					<option value="excellent">Excellent</option>
					<option value="good">Bon</option>
					<option value="fair">Correct</option>
					<option value="needs-maintenance">Maintenance nécessaire</option>
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
					<span className="text-sm text-gray-700">Disponible</span>
				</label>
			</div>
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					Dernière maintenance
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
					Prochaine maintenance
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
