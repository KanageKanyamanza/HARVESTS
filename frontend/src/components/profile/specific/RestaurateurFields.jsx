import React from "react";
import { FiClock, FiUsers, FiShoppingBag, FiInfo } from "react-icons/fi";

const RESTAURANT_TYPES = [
	{ value: "fine-dining", label: "Restaurant gastronomique" },
	{ value: "casual", label: "Restaurant décontracté" },
	{ value: "fast-food", label: "Restaurant rapide" },
	{ value: "cafe", label: "Café" },
	{ value: "bar", label: "Bar" },
	{ value: "catering", label: "Traiteur" },
	{ value: "food-truck", label: "Food truck" },
	{ value: "bakery", label: "Boulangerie" },
];

const RestaurateurFields = ({ formData, editing, onInputChange }) => {
	const DAYS = [
		{ key: "monday", label: "Lundi" },
		{ key: "tuesday", label: "Mardi" },
		{ key: "wednesday", label: "Mercredi" },
		{ key: "thursday", label: "Jeudi" },
		{ key: "friday", label: "Vendredi" },
		{ key: "saturday", label: "Samedi" },
		{ key: "sunday", label: "Dimanche" },
	];

	const CUISINE_OPTIONS = [
		{ value: "african", label: "Africaine" },
		{ value: "french", label: "Française" },
		{ value: "italian", label: "Italienne" },
		{ value: "asian", label: "Asiatique" },
		{ value: "american", label: "Américaine" },
		{ value: "mediterranean", label: "Méditerranéenne" },
		{ value: "fusion", label: "Fusion" },
		{ value: "vegetarian", label: "Végétarienne" },
		{ value: "vegan", label: "Végane" },
	];

	const handleCuisineTypeChange = (e) => {
		const { value, checked } = e.target;
		const current = formData.cuisineTypes || [];
		let newVal;
		if (checked) {
			newVal = [...current, value];
		} else {
			newVal = current.filter((t) => t !== value);
		}
		onInputChange({
			target: { name: "cuisineTypes", value: newVal, type: "custom" },
		});
	};

	return (
		<div className="space-y-6 mt-6 pt-6 border-t border-gray-100">
			<h3 className="text-lg font-semibold text-gray-900 flex items-center">
				<FiInfo className="mr-2" />
				Informations sur l'établissement
			</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Restaurant Type */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Type d'établissement
					</label>
					{editing ? (
						<select
							name="restaurantType"
							value={formData.restaurantType || "casual"}
							onChange={onInputChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							{RESTAURANT_TYPES.map((type) => (
								<option key={type.value} value={type.value}>
									{type.label}
								</option>
							))}
						</select>
					) : (
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
							{RESTAURANT_TYPES.find((t) => t.value === formData.restaurantType)
								?.label || formData.restaurantType}
						</span>
					)}
				</div>

				{/* Cuisine Types */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Types de cuisine
					</label>
					{editing ? (
						<div className="grid grid-cols-2 gap-2">
							{CUISINE_OPTIONS.map((cuisine) => (
								<label key={cuisine.value} className="flex items-center">
									<input
										type="checkbox"
										value={cuisine.value}
										checked={(formData.cuisineTypes || []).includes(
											cuisine.value
										)}
										onChange={handleCuisineTypeChange}
										className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
									<span className="text-sm text-gray-700">{cuisine.label}</span>
								</label>
							))}
						</div>
					) : (
						<div className="flex flex-wrap gap-2">
							{(formData.cuisineTypes || []).length > 0 ? (
								formData.cuisineTypes.map((type, idx) => (
									<span
										key={idx}
										className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
									>
										{CUISINE_OPTIONS.find((c) => c.value === type)?.label ||
											type}
									</span>
								))
							) : (
								<span className="text-gray-500 text-sm">Non renseigné</span>
							)}
						</div>
					)}
				</div>

				{/* Seating Capacity */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						<FiUsers className="inline mr-1" />
						Capacité d'accueil
					</label>
					{editing ? (
						<div className="flex items-center space-x-2">
							<input
								type="number"
								name="seatingCapacity"
								value={formData.seatingCapacity || ""}
								onChange={onInputChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								min="0"
							/>
							<span className="text-gray-500">places</span>
						</div>
					) : (
						<p className="text-gray-900">
							{formData.seatingCapacity
								? `${formData.seatingCapacity} places`
								: "Non renseigné"}
						</p>
					)}
				</div>
			</div>

			{/* Operating Hours */}
			<div className="mt-6 border-t border-gray-100 pt-6">
				<h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
					<FiClock className="mr-2" />
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
									{/* Checkbox for Open/Closed */}
									<input
										type="checkbox"
										name={`operatingHours.${day.key}.isOpen`}
										checked={formData.operatingHours?.[day.key]?.isOpen ?? true}
										onChange={onInputChange}
										className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>

									{/* Hours inputs if open */}
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
													formData.operatingHours?.[day.key]?.close || "22:00"
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
											{formData.operatingHours?.[day.key]?.close || "22:00"}
										</span>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default RestaurateurFields;
