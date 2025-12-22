import React from "react";
import { FiMinimize2, FiLayers, FiPackage, FiBox } from "react-icons/fi";

const ProducerFields = ({ formData, editing, onInputChange, safeDisplay }) => {
	const inputClass =
		"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

	const FARMING_TYPES = [
		{ value: "organic", label: "Biologique" },
		{ value: "conventional", label: "Conventionnel" },
		{ value: "mixed", label: "Mixte" },
	];

	const STORAGE_UNITS = ["tons", "kg", "m³"];
	const AREA_UNITS = ["hectares", "acres", "m²"];

	return (
		<div className="space-y-6 mt-6 pt-6 border-t border-gray-100">
			<h3 className="text-lg font-semibold text-gray-900 flex items-center">
				<FiLayers className="mr-2" />
				Détails de la production
			</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Farming Type */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Type d'agriculture
					</label>
					{editing ? (
						<select
							name="farmingType"
							value={formData.farmingType || "conventional"}
							onChange={onInputChange}
							className={inputClass}
						>
							{FARMING_TYPES.map((type) => (
								<option key={type.value} value={type.value}>
									{type.label}
								</option>
							))}
						</select>
					) : (
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
							{FARMING_TYPES.find((t) => t.value === formData.farmingType)
								?.label ||
								formData.farmingType ||
								"Non renseigné"}
						</span>
					)}
				</div>

				{/* Farm Size */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Taille de l'exploitation
					</label>
					{editing ? (
						<div className="flex space-x-2">
							<input
								type="number"
								name="farmSize.value"
								value={formData.farmSize?.value || ""}
								onChange={onInputChange}
								className={inputClass}
								placeholder="0"
								min="0"
							/>
							<select
								name="farmSize.unit"
								value={formData.farmSize?.unit || "hectares"}
								onChange={onInputChange}
								className="w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								{AREA_UNITS.map((unit) => (
									<option key={unit} value={unit}>
										{unit}
									</option>
								))}
							</select>
						</div>
					) : (
						<p className="text-gray-900">
							{formData.farmSize?.value
								? `${formData.farmSize.value} ${formData.farmSize.unit}`
								: "Non renseigné"}
						</p>
					)}
				</div>

				{/* Storage Capacity */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						<FiBox className="inline mr-1" />
						Capacité de stockage
					</label>
					{editing ? (
						<div className="flex space-x-2">
							<input
								type="number"
								name="storageCapacity.value"
								value={formData.storageCapacity?.value || ""}
								onChange={onInputChange}
								className={inputClass}
								placeholder="0"
								min="0"
							/>
							<select
								name="storageCapacity.unit"
								value={formData.storageCapacity?.unit || "tons"}
								onChange={onInputChange}
								className="w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								{STORAGE_UNITS.map((unit) => (
									<option key={unit} value={unit}>
										{unit}
									</option>
								))}
							</select>
						</div>
					) : (
						<p className="text-gray-900">
							{formData.storageCapacity?.value
								? `${formData.storageCapacity.value} ${formData.storageCapacity.unit}`
								: "Non renseigné"}
						</p>
					)}
				</div>

				{/* Minimum Order Quantity */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						<FiPackage className="inline mr-1" />
						Commande minimum
					</label>
					{editing ? (
						<div className="flex space-x-2">
							<input
								type="number"
								name="minimumOrderQuantity.value"
								value={formData.minimumOrderQuantity?.value || ""}
								onChange={onInputChange}
								className={inputClass}
								placeholder="1"
								min="1"
							/>
							<input
								type="text"
								name="minimumOrderQuantity.unit"
								value={formData.minimumOrderQuantity?.unit || ""}
								onChange={onInputChange}
								className={inputClass}
								placeholder="Unité (ex: kg)"
							/>
						</div>
					) : (
						<p className="text-gray-900">
							{formData.minimumOrderQuantity?.value
								? `${formData.minimumOrderQuantity.value} ${
										formData.minimumOrderQuantity.unit || ""
								  }`
								: "Non renseigné"}
						</p>
					)}
				</div>
			</div>

			{/* Crops Section */}
			<div className="mt-6 border-t border-gray-100 pt-6">
				<h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
					<FiPackage className="mr-2" />
					Cultures & Produits
				</h4>

				{editing ? (
					<div className="space-y-4">
						{(formData.crops || []).map((crop, index) => (
							<div
								key={index}
								className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md"
							>
								<input
									type="text"
									value={crop.name || ""}
									onChange={(e) => {
										const newCrops = [...(formData.crops || [])];
										newCrops[index] = {
											...newCrops[index],
											name: e.target.value,
										};
										onInputChange({
											target: {
												name: "crops",
												value: newCrops,
												type: "custom",
											},
										});
									}}
									className={`${inputClass} text-sm py-1`}
									placeholder="Nom de la culture (ex: Tomates)"
								/>
								<select
									value={crop.category || ""}
									onChange={(e) => {
										const newCrops = [...(formData.crops || [])];
										newCrops[index] = {
											...newCrops[index],
											category: e.target.value,
										};
										onInputChange({
											target: {
												name: "crops",
												value: newCrops,
												type: "custom",
											},
										});
									}}
									className={`${inputClass} text-sm py-1 w-40`}
								>
									<option value="">Catégorie...</option>
									<option value="cereals">Céréales</option>
									<option value="vegetables">Légumes</option>
									<option value="fruits">Fruits</option>
									<option value="legumes">Légumineuses</option>
									<option value="tubers">Tubercules</option>
								</select>
								<button
									type="button"
									onClick={() => {
										const newCrops = (formData.crops || []).filter(
											(_, i) => i !== index
										);
										onInputChange({
											target: {
												name: "crops",
												value: newCrops,
												type: "custom",
											},
										});
									}}
									className="text-red-500 hover:text-red-700 p-1"
								>
									<FiMinimize2 />
								</button>
							</div>
						))}
						<button
							type="button"
							onClick={() => {
								const newCrops = [
									...(formData.crops || []),
									{ name: "", category: "" },
								];
								onInputChange({
									target: { name: "crops", value: newCrops, type: "custom" },
								});
							}}
							className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
						>
							+ Ajouter une culture
						</button>
					</div>
				) : (
					<div className="flex flex-wrap gap-2">
						{(formData.crops || []).length > 0 ? (
							formData.crops.map((crop, idx) => (
								<span
									key={idx}
									className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100"
								>
									{crop.name} ({crop.category})
								</span>
							))
						) : (
							<span className="text-gray-500 italic text-sm">
								Aucune culture renseignée
							</span>
						)}
					</div>
				)}
			</div>

			{/* Delivery Options */}
			<div className="mt-4 border-t border-gray-100 pt-4">
				<h4 className="text-md font-medium text-gray-800 mb-3">
					Options de livraison
				</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Can Deliver */}
					<div className="flex items-center">
						{editing ? (
							<label className="flex items-center space-x-2 cursor-pointer">
								<input
									type="checkbox"
									name="deliveryOptions.canDeliver"
									checked={formData.deliveryOptions?.canDeliver || false}
									onChange={onInputChange}
									className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
								/>
								<span className="text-sm font-medium text-gray-700">
									Je peux effectuer des livraisons
								</span>
							</label>
						) : (
							<div className="flex items-center space-x-2">
								<div
									className={`h-2 w-2 rounded-full ${
										formData.deliveryOptions?.canDeliver
											? "bg-green-500"
											: "bg-gray-300"
									}`}
								></div>
								<span className="text-sm text-gray-700">
									{formData.deliveryOptions?.canDeliver
										? "Livraison possible"
										: "Pas de livraison"}
								</span>
							</div>
						)}
					</div>

					{/* Delivery Radius - Only show if canDeliver */}
					{(editing
						? formData.deliveryOptions?.canDeliver
						: formData.deliveryOptions?.canDeliver) && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Rayon de livraison (km)
							</label>
							{editing ? (
								<input
									type="number"
									name="deliveryOptions.deliveryRadius"
									value={formData.deliveryOptions?.deliveryRadius || 0}
									onChange={onInputChange}
									className={inputClass}
									min="0"
								/>
							) : (
								<p className="text-gray-900">
									{formData.deliveryOptions?.deliveryRadius || 0} km
								</p>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Operating Hours */}
			<div className="mt-6 pt-6 border-t border-gray-100">
				<h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
					<FiLayers className="mr-2" />
					Horaires d'ouverture
				</h4>

				<div className="grid grid-cols-1 gap-2">
					{[
						{ key: "monday", label: "Lundi" },
						{ key: "tuesday", label: "Mardi" },
						{ key: "wednesday", label: "Mercredi" },
						{ key: "thursday", label: "Jeudi" },
						{ key: "friday", label: "Vendredi" },
						{ key: "saturday", label: "Samedi" },
						{ key: "sunday", label: "Dimanche" },
					].map((day) => (
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
										name={`shopInfo.openingHours.${day.key}.isOpen`}
										checked={
											formData.shopInfo?.openingHours?.[day.key]?.isOpen ?? true
										}
										onChange={onInputChange}
										className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
									{(formData.shopInfo?.openingHours?.[day.key]?.isOpen ??
										true) && (
										<>
											<input
												type="time"
												name={`shopInfo.openingHours.${day.key}.open`}
												value={
													formData.shopInfo?.openingHours?.[day.key]?.open ||
													"08:00"
												}
												onChange={onInputChange}
												className="px-2 py-1 border border-gray-300 rounded text-sm w-24"
											/>
											<span className="text-gray-500">-</span>
											<input
												type="time"
												name={`shopInfo.openingHours.${day.key}.close`}
												value={
													formData.shopInfo?.openingHours?.[day.key]?.close ||
													"18:00"
												}
												onChange={onInputChange}
												className="px-2 py-1 border border-gray-300 rounded text-sm w-24"
											/>
										</>
									)}
									{!(
										formData.shopInfo?.openingHours?.[day.key]?.isOpen ?? true
									) && (
										<span className="text-sm text-gray-400 italic ml-2">
											Fermé
										</span>
									)}
								</div>
							) : (
								<div className="flex-1 text-right">
									{formData.shopInfo?.openingHours?.[day.key]?.isOpen ===
									false ? (
										<span className="text-gray-400 italic text-sm">Fermé</span>
									) : (
										<span className="text-gray-900 text-sm">
											{formData.shopInfo?.openingHours?.[day.key]?.open ||
												"08:00"}{" "}
											-{" "}
											{formData.shopInfo?.openingHours?.[day.key]?.close ||
												"18:00"}
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

export default ProducerFields;
