import React from "react";
import { Info, Users, Clock, Utensils, ChevronDown, Check } from "lucide-react";

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
		<div className="space-y-12">
			{/* Establishment Details */}
			<div className="space-y-8">
				<div className="flex items-center gap-3 px-2">
					<Info className="h-5 w-5 text-emerald-600/50" />
					<h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
						Informations sur l'établissement
					</h3>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Restaurant Type */}
					<div className="space-y-2 group/field">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Type d'établissement
						</label>
						{editing ?
							<div className="relative">
								<select
									name="restaurantType"
									value={formData.restaurantType || "casual"}
									onChange={onInputChange}
									className="w-full bg-gray-50/50 px-2 py-2 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-inner"
								>
									{RESTAURANT_TYPES.map((type) => (
										<option key={type.value} value={type.value}>
											{type.label}
										</option>
									))}
								</select>
								<ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
							</div>
						:	<div className="bg-gray-50/30 px-2 py-3 rounded-2xl border border-gray-100/50 inline-block">
								<span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
									{RESTAURANT_TYPES.find(
										(t) => t.value === formData.restaurantType,
									)?.label || formData.restaurantType}
								</span>
							</div>
						}
					</div>

					{/* Seating Capacity */}
					<div className="space-y-2 group/field">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Capacité d'accueil
						</label>
						{editing ?
							<div className="relative">
								<input
									type="number"
									name="seatingCapacity"
									value={formData.seatingCapacity || ""}
									onChange={onInputChange}
									className="w-full bg-gray-50/50 px-12 py-2 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-inner"
									min="0"
									placeholder="0"
								/>
								<Users className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600/50" />
								<span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
									PLACES
								</span>
							</div>
						:	<div className="bg-gray-50/30 px-2 py-2 rounded-2xl border border-gray-100/50 flex items-center gap-3">
								<Users className="h-4 w-4 text-blue-600/50" />
								<p className="text-sm font-bold text-gray-900">
									{formData.seatingCapacity ?
										`${formData.seatingCapacity} couverts`
									:	"Non renseigné"}
								</p>
							</div>
						}
					</div>

					{/* Cuisine Types */}
					<div className="col-span-1 md:col-span-2 space-y-4">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Spécialités Culinaires
						</label>
						{editing ?
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								{CUISINE_OPTIONS.map((cuisine) => (
									<label
										key={cuisine.value}
										className="relative flex items-center p-4 bg-gray-50/50 border border-gray-100 rounded-2xl cursor-pointer hover:bg-white hover:border-orange-200 transition-all gap-4 group/check"
									>
										<div className="relative flex items-center">
											<input
												type="checkbox"
												value={cuisine.value}
												checked={(formData.cuisineTypes || []).includes(
													cuisine.value,
												)}
												onChange={handleCuisineTypeChange}
												className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-gray-200 transition-all checked:border-orange-500 checked:bg-orange-500"
											/>
											<Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100" />
										</div>
										<span className="text-xs font-bold text-gray-700">
											{cuisine.label}
										</span>
									</label>
								))}
							</div>
						:	<div className="flex flex-wrap gap-3">
								{(formData.cuisineTypes || []).length > 0 ?
									formData.cuisineTypes.map((type, idx) => (
										<div
											key={idx}
											className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-xl"
										>
											<Utensils className="h-3.5 w-3.5 text-orange-500" />
											<span className="text-[10px] font-black text-orange-700 uppercase tracking-widest">
												{CUISINE_OPTIONS.find((c) => c.value === type)?.label ||
													type}
											</span>
										</div>
									))
								:	<p className="text-xs font-medium text-gray-400 italic">
										Non renseigné
									</p>
								}
							</div>
						}
					</div>
				</div>
			</div>

			{/* Operating Hours */}
			<div className="space-y-8 pt-10 border-t border-gray-100">
				<div className="flex items-center gap-3 px-2">
					<Clock className="h-5 w-5 text-amber-600/50" />
					<h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
						Horaires d'Ouverture
					</h3>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{DAYS.map((day) => (
						<div
							key={day.key}
							className={`p-4 rounded-[1.5rem] border transition-all ${
								editing ?
									"bg-gray-50/50 border-gray-100 hover:bg-white hover:border-amber-200"
								: (formData.operatingHours?.[day.key]?.isOpen ?? true) ?
									"bg-amber-50/30 border-amber-100/50"
								:	"bg-gray-50/30 border-gray-100 opacity-60"
							}`}
						>
							<div className="flex items-center justify-between mb-3 px-1">
								<span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
									{day.label}
								</span>
								{editing && (
									<input
										type="checkbox"
										name={`operatingHours.${day.key}.isOpen`}
										checked={formData.operatingHours?.[day.key]?.isOpen ?? true}
										onChange={onInputChange}
										className="h-4 w-4 rounded-md border-gray-300 text-amber-500 focus:ring-amber-500"
									/>
								)}
							</div>

							{editing || (formData.operatingHours?.[day.key]?.isOpen ?? true) ?
								<div className="space-y-2">
									{editing ?
										<div className="flex flex-col gap-2">
											<input
												type="time"
												name={`operatingHours.${day.key}.open`}
												value={
													formData.operatingHours?.[day.key]?.open || "09:00"
												}
												onChange={onInputChange}
												className="bg-white px-3 py-1.5 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
											/>
											<input
												type="time"
												name={`operatingHours.${day.key}.close`}
												value={
													formData.operatingHours?.[day.key]?.close || "22:00"
												}
												onChange={onInputChange}
												className="bg-white px-3 py-1.5 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
											/>
										</div>
									:	<div className="px-3 py-2 bg-white/50 rounded-xl text-xs font-black text-amber-700 text-center tracking-tight">
											{formData.operatingHours?.[day.key]?.open || "09:00"} —{" "}
											{formData.operatingHours?.[day.key]?.close || "22:00"}
										</div>
									}
								</div>
							:	<div className="px-3 py-2 bg-gray-100/50 rounded-xl text-[10px] font-black text-gray-400 text-center uppercase tracking-widest">
									Fermé
								</div>
							}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default RestaurateurFields;
