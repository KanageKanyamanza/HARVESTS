import React from "react";
import { FiTruck, FiMap, FiDollarSign } from "react-icons/fi";

const TransporterFields = ({ formData, editing, onInputChange }) => {
	const TRANSPORT_TYPES = [
		{ value: "road", label: "Routier" },
		{ value: "rail", label: "Ferroviaire" },
		{ value: "air", label: "Aérien" },
		{ value: "sea", label: "Maritime" },
		{ value: "multimodal", label: "Multimodal" },
	];

	const VEHICLE_TYPES = [
		{ value: "motorcycle", label: "Moto" },
		{ value: "van", label: "Fourgonnette" },
		{ value: "truck", label: "Camion" },
		{ value: "refrigerated-truck", label: "Camion frigorifique" },
	];

	return (
		<div className="space-y-6 mt-6 pt-6 border-t border-gray-100">
			<h3 className="text-lg font-semibold text-gray-900 flex items-center">
				<FiTruck className="mr-2" />
				Services de transport
			</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Transport Type */}
				<div className="col-span-1 md:col-span-2">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Types de transport
					</label>
					{editing ? (
						<div className="flex flex-wrap gap-3">
							{TRANSPORT_TYPES.map((type) => (
								<label key={type.value} className="flex items-center space-x-2">
									<input
										type="checkbox"
										value={type.value}
										checked={(formData.transportType || []).includes(
											type.value
										)}
										onChange={(e) => {
											const val = e.target.value;
											const current = formData.transportType || [];
											const newVal = e.target.checked
												? [...current, val]
												: current.filter((x) => x !== val);
											onInputChange({
												target: {
													name: "transportType",
													value: newVal,
													type: "custom",
												},
											});
										}}
										className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
									<span className="text-sm text-gray-700">{type.label}</span>
								</label>
							))}
						</div>
					) : (
						<div className="flex flex-wrap gap-2">
							{(formData.transportType || []).length > 0 ? (
								formData.transportType.map((t) => (
									<span
										key={t}
										className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
									>
										{TRANSPORT_TYPES.find((types) => types.value === t)
											?.label || t}
									</span>
								))
							) : (
								<span className="text-gray-500 italic">Non renseigné</span>
							)}
						</div>
					)}
				</div>

				{/* Pricing Model */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						<FiDollarSign className="inline mr-1" />
						Modèle de tarification
					</label>
					{editing ? (
						<select
							name="pricingStructure.model"
							value={formData.pricingStructure?.model || "per-km"}
							onChange={onInputChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="per-km">Par kilomètre</option>
							<option value="per-kg">Par kilogramme</option>
							<option value="flat-rate">Forfait</option>
							<option value="custom">Sur devis</option>
						</select>
					) : (
						<p className="text-gray-900">
							{{
								"per-km": "Par kilomètre",
								"per-kg": "Par kilogramme",
								"flat-rate": "Forfait",
								custom: "Sur devis",
							}[formData.pricingStructure?.model] ||
								formData.pricingStructure?.model ||
								"Non renseigné"}
						</p>
					)}
				</div>

				{/* Base Rate */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Tarif de base
					</label>
					{editing ? (
						<div className="flex space-x-2">
							<input
								type="number"
								name="pricingStructure.baseRate"
								value={formData.pricingStructure?.baseRate || ""}
								onChange={onInputChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								min="0"
							/>
							<span className="self-center text-gray-500">XAF</span>
						</div>
					) : (
						<p className="text-gray-900">
							{formData.pricingStructure?.baseRate
								? `${formData.pricingStructure.baseRate} XAF`
								: "Non renseigné"}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default TransporterFields;
