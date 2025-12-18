import React from "react";
import { FiShoppingCart, FiHeart } from "react-icons/fi";

const ConsumerFields = ({ formData, editing, onInputChange }) => {
	const DIETARY_PREFERENCES = [
		{ value: "organic", label: "Bio" },
		{ value: "vegetarian", label: "Végétarien" },
		{ value: "vegan", label: "Végane" },
		{ value: "gluten-free", label: "Sans gluten" },
		{ value: "halal", label: "Halal" },
		{ value: "local", label: "Produits locaux" },
	];

	const DELIVERY_TIMES = [
		{ value: "morning", label: "Matin (8h-12h)" },
		{ value: "afternoon", label: "Après-midi (12h-18h)" },
		{ value: "evening", label: "Soir (18h-21h)" },
		{ value: "weekend", label: "Weekend" },
		{ value: "flexible", label: "Flexible" },
	];

	const handleDietaryChange = (e) => {
		const { value, checked } = e.target;
		const currentPrefs = formData.dietaryPreferences || [];
		let newPrefs;
		if (checked) {
			newPrefs = [...currentPrefs, value];
		} else {
			newPrefs = currentPrefs.filter((p) => p !== value);
		}

		// Simulate event for parent handler
		onInputChange({
			target: {
				name: "dietaryPreferences",
				value: newPrefs,
				type: "custom", // Generic type for direct assignment if supported or rely on parent fallback
			},
		});
	};

	return (
		<div className="space-y-6 mt-6 pt-6 border-t border-gray-100">
			<h3 className="text-lg font-semibold text-gray-900 flex items-center">
				<FiHeart className="mr-2" />
				Préférences de consommation
			</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Dietary Preferences */}
				<div className="col-span-1 md:col-span-2">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Préférences alimentaires
					</label>
					{editing ? (
						<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
							{DIETARY_PREFERENCES.map((pref) => (
								<label key={pref.value} className="flex items-center space-x-2">
									<input
										type="checkbox"
										value={pref.value}
										checked={(formData.dietaryPreferences || []).includes(
											pref.value
										)}
										onChange={handleDietaryChange}
										className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
									<span className="text-sm text-gray-700">{pref.label}</span>
								</label>
							))}
						</div>
					) : (
						<div className="flex flex-wrap gap-2">
							{(formData.dietaryPreferences || []).length > 0 ? (
								formData.dietaryPreferences.map((pref) => (
									<span
										key={pref}
										className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
									>
										{DIETARY_PREFERENCES.find((p) => p.value === pref)?.label ||
											pref}
									</span>
								))
							) : (
								<span className="text-gray-500 italic">
									Aucune préférence renseignée
								</span>
							)}
						</div>
					)}
				</div>

				{/* Shopping Preferences */}
				<div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-4">
					<h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
						<FiShoppingCart className="mr-2" />
						Habitudes d'achat
					</h4>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Preferred Delivery Time */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Moment de livraison préféré
							</label>
							{editing ? (
								<select
									name="shoppingPreferences.preferredDeliveryTime"
									value={
										formData.shoppingPreferences?.preferredDeliveryTime ||
										"flexible"
									}
									onChange={onInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									{DELIVERY_TIMES.map((time) => (
										<option key={time.value} value={time.value}>
											{time.label}
										</option>
									))}
								</select>
							) : (
								<p className="text-gray-900">
									{DELIVERY_TIMES.find(
										(t) =>
											t.value ===
											formData.shoppingPreferences?.preferredDeliveryTime
									)?.label || "Flexible"}
								</p>
							)}
						</div>

						{/* Max Distance */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Distance max. des producteurs (km)
							</label>
							{editing ? (
								<input
									type="number"
									name="shoppingPreferences.maxDeliveryDistance"
									value={
										formData.shoppingPreferences?.maxDeliveryDistance || 25
									}
									onChange={onInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									min="1"
									max="100"
								/>
							) : (
								<p className="text-gray-900">
									{formData.shoppingPreferences?.maxDeliveryDistance || 25} km
								</p>
							)}
						</div>

						{/* Budget Max */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Budget max par commande
							</label>
							{editing ? (
								<div className="flex space-x-2">
									<input
										type="number"
										name="shoppingPreferences.budgetRange.max"
										value={formData.shoppingPreferences?.budgetRange?.max || ""}
										onChange={onInputChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										min="0"
									/>
									<span className="self-center text-gray-500">XAF</span>
								</div>
							) : (
								<p className="text-gray-900">
									{formData.shoppingPreferences?.budgetRange?.max
										? `${formData.shoppingPreferences.budgetRange.max} XAF`
										: "Non défini"}
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ConsumerFields;
