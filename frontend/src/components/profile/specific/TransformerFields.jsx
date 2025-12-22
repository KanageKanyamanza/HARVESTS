import React from "react";
import { FiSettings, FiActivity } from "react-icons/fi";

const TransformerFields = ({ formData, editing, onInputChange }) => {
	const TRANSFORMATION_TYPES = [
		{ value: "processing", label: "Transformation" },
		{ value: "packaging", label: "Emballage" },
		{ value: "preservation", label: "Conservation" },
		{ value: "manufacturing", label: "Fabrication" },
		{ value: "mixed", label: "Mixte" },
	];

	const PRICING_MODELS = [
		{ value: "per-unit", label: "Par unité" },
		{ value: "per-kg", label: "Par kg" },
		{ value: "per-batch", label: "Par lot" },
		{ value: "hourly", label: "Horaire" },
	];

	const DAYS = [
		{ key: "monday", label: "Lundi" },
		{ key: "tuesday", label: "Mardi" },
		{ key: "wednesday", label: "Mercredi" },
		{ key: "thursday", label: "Jeudi" },
		{ key: "friday", label: "Vendredi" },
		{ key: "saturday", label: "Samedi" },
		{ key: "sunday", label: "Dimanche" },
	];

	return (
		<div className="space-y-6 mt-6 pt-6 border-t border-gray-100">
			<h3 className="text-lg font-semibold text-gray-900 flex items-center">
				<FiActivity className="mr-2" />
				Activités de transformation
			</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 pb-6">
				{/* Transformation Type */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Type d'activité
					</label>
					{editing ? (
						<select
							name="transformationType"
							value={formData.transformationType || "processing"}
							onChange={onInputChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							{TRANSFORMATION_TYPES.map((type) => (
								<option key={type.value} value={type.value}>
									{type.label}
								</option>
							))}
						</select>
					) : (
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
							{TRANSFORMATION_TYPES.find(
								(t) => t.value === formData.transformationType
							)?.label || formData.transformationType}
						</span>
					)}
				</div>

				{/* Pricing Model */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Modèle de tarification
					</label>
					{editing ? (
						<select
							name="pricing.model"
							value={formData.pricing?.model || "per-unit"}
							onChange={onInputChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							{PRICING_MODELS.map((model) => (
								<option key={model.value} value={model.value}>
									{model.label}
								</option>
							))}
						</select>
					) : (
						<span className="text-gray-900">
							{PRICING_MODELS.find((m) => m.value === formData.pricing?.model)
								?.label ||
								formData.pricing?.model ||
								"Non renseigné"}
						</span>
					)}
				</div>

				{/* Services */}
				<div className="col-span-1 md:col-span-2 mt-4">
					<label className="block text-sm font-medium text-gray-700 mb-3">
						Services proposés
					</label>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
						{[
							{ key: "packaging", label: "Emballage" },
							{ key: "customProcessing", label: "Transformation sur mesure" },
							{ key: "privateLabeling", label: "Marque blanche" },
							{ key: "qualityTesting", label: "Tests qualité" },
							{ key: "consultation", label: "Conseil" },
						].map((service) => (
							<div key={service.key} className="flex items-center">
								{editing ? (
									<label className="flex items-center space-x-2 cursor-pointer">
										<input
											type="checkbox"
											name={`services.${service.key}`}
											checked={formData.services?.[service.key] || false}
											onChange={onInputChange}
											className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
										<span className="text-sm text-gray-700">
											{service.label}
										</span>
									</label>
								) : (
									<div className="flex items-center text-sm">
										<span
											className={`w-2 h-2 rounded-full mr-2 ${
												formData.services?.[service.key]
													? "bg-green-500"
													: "bg-gray-300"
											}`}
										></span>
										<span
											className={
												formData.services?.[service.key]
													? "text-gray-900"
													: "text-gray-400"
											}
										>
											{service.label}
										</span>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Operating Hours */}
			<div className="mt-6 pt-6">
				<h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
					<FiSettings className="mr-2" />
					Horaires d'ouverture
				</h4>

				<div className="grid grid-cols-1 gap-2">
					{DAYS.map((day) => (
						<div
							key={day.key}
							className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
						>
							<span className="w-24 font-medium text-sm text-gray-700">
								{day.label}
							</span>
							{editing ? (
								<div className="flex items-center space-x-2 flex-1">
									<input
										type="checkbox"
										name={`operatingHours.${day.key}.isOpen`}
										checked={formData.operatingHours?.[day.key]?.isOpen ?? true}
										onChange={onInputChange}
										className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
									{(formData.operatingHours?.[day.key]?.isOpen ?? true) && (
										<>
											<input
												type="time"
												name={`operatingHours.${day.key}.open`}
												value={
													formData.operatingHours?.[day.key]?.open || "09:00"
												}
												onChange={onInputChange}
												className="px-2 py-1 border border-gray-300 rounded text-sm w-24"
											/>
											<span className="text-gray-500">-</span>
											<input
												type="time"
												name={`operatingHours.${day.key}.close`}
												value={
													formData.operatingHours?.[day.key]?.close || "18:00"
												}
												onChange={onInputChange}
												className="px-2 py-1 border border-gray-300 rounded text-sm w-24"
											/>
										</>
									)}
									{!(formData.operatingHours?.[day.key]?.isOpen ?? true) && (
										<span className="text-sm text-gray-400 italic ml-2">
											Fermé
										</span>
									)}
								</div>
							) : (
								<div className="flex-1 text-right">
									{formData.operatingHours?.[day.key]?.isOpen === false ? (
										<span className="text-gray-400 italic text-sm">Fermé</span>
									) : (
										<span className="text-gray-900 text-sm">
											{formData.operatingHours?.[day.key]?.open || "09:00"} -{" "}
											{formData.operatingHours?.[day.key]?.close || "18:00"}
										</span>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Documents Section */}
		</div>
	);
};

export default TransformerFields;
