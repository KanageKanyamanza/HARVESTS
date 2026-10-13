import React from "react";
import { DEFAULT_CURRENCY } from "../../../config/currencies";
import { useTranslation } from "react-i18next";
import {
	Heart,
	ShoppingCart,
	Clock,
	MapPin,
	Wallet,
	Check,
	ChevronDown,
} from "lucide-react";

const ConsumerFields = ({ formData, editing, onInputChange }) => {
	const { t } = useTranslation("profile");
	const DIETARY_PREFERENCES = [
		{ value: "organic", label: t("consumer.dietary.organic") },
		{ value: "vegetarian", label: t("consumer.dietary.vegetarian") },
		{ value: "vegan", label: t("consumer.dietary.vegan") },
		{ value: "gluten-free", label: t("consumer.dietary.gluten-free") },
		{ value: "halal", label: t("consumer.dietary.halal") },
		{ value: "local", label: t("consumer.dietary.local") },
	];

	const DELIVERY_TIMES = [
		{ value: "morning", label: t("consumer.deliveryTimes.morning") },
		{ value: "afternoon", label: t("consumer.deliveryTimes.afternoon") },
		{ value: "evening", label: t("consumer.deliveryTimes.evening") },
		{ value: "weekend", label: t("consumer.deliveryTimes.weekend") },
		{ value: "flexible", label: t("consumer.deliveryTimes.flexible") },
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

		onInputChange({
			target: {
				name: "dietaryPreferences",
				value: newPrefs,
				type: "custom",
			},
		});
	};

	return (
		<div className="space-y-12">
			{/* Bio Section */}
			<div className="space-y-8">
				<div className="flex items-center gap-3 px-2">
					<Heart className="h-5 w-5 text-rose-500/50" />
					<h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
						{t("consumer.dietaryTitle")}
					</h3>
				</div>

				<div className="space-y-4">
					{editing ?
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							{DIETARY_PREFERENCES.map((pref) => (
								<label
									key={pref.value}
									className="relative flex items-center p-4 bg-gray-50/50 border border-gray-100 rounded-2xl cursor-pointer hover:bg-white hover:border-emerald-200 transition-all gap-4 group/check"
								>
									<div className="relative flex items-center">
										<input
											type="checkbox"
											value={pref.value}
											checked={(formData.dietaryPreferences || []).includes(
												pref.value,
											)}
											onChange={handleDietaryChange}
											className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-gray-200 transition-all checked:border-emerald-500 checked:bg-emerald-500"
										/>
										<Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100" />
									</div>
									<span className="text-xs font-bold text-gray-700">
										{pref.label}
									</span>
								</label>
							))}
						</div>
					:	<div className="flex flex-wrap gap-3">
							{(formData.dietaryPreferences || []).length > 0 ?
								formData.dietaryPreferences.map((pref) => (
									<div
										key={pref}
										className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl"
									>
										<div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
										<span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">
											{DIETARY_PREFERENCES.find((p) => p.value === pref)
												?.label || pref}
										</span>
									</div>
								))
							:	<p className="text-xs font-medium text-gray-400 italic">
									{t("consumer.noDietary")}
								</p>
							}
						</div>
					}
				</div>
			</div>

			{/* Shopping habits */}
			<div className="space-y-8 pt-10 border-t border-gray-100">
				<div className="flex items-center gap-3 px-2">
					<ShoppingCart className="h-5 w-5 text-blue-600/50" />
					<h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
						{t("consumer.habitsTitle")}
					</h3>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Preferred Delivery Time */}
					<div className="space-y-2 group/field">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							{t("consumer.deliveryTime")}
						</label>
						{editing ?
							<div className="relative">
								<select
									name="shoppingPreferences.preferredDeliveryTime"
									value={
										formData.shoppingPreferences?.preferredDeliveryTime ||
										"flexible"
									}
									onChange={onInputChange}
									className="w-full bg-gray-50/50 pl-12 pr-10 py-2 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-inner"
								>
									{DELIVERY_TIMES.map((time) => (
										<option key={time.value} value={time.value}>
											{time.label}
										</option>
									))}
								</select>
								<Clock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600/50" />
								<ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
							</div>
						:	<div className="bg-gray-50/30 px-2 py-2 rounded-2xl border border-gray-100/50 flex items-center gap-3">
								<Clock className="h-4 w-4 text-emerald-600/50" />
								<p className="text-sm font-bold text-gray-900">
									{DELIVERY_TIMES.find(
										(t) =>
											t.value ===
											formData.shoppingPreferences?.preferredDeliveryTime,
									)?.label || t("consumer.deliveryTimes.flexible")}
								</p>
							</div>
						}
					</div>

					{/* Max Distance */}
					<div className="space-y-2 group/field">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							{t("consumer.maxDistance")}
						</label>
						{editing ?
							<div className="relative">
								<input
									type="number"
									name="shoppingPreferences.maxDeliveryDistance"
									value={
										formData.shoppingPreferences?.maxDeliveryDistance || 25
									}
									onChange={onInputChange}
									className="w-full bg-gray-50/50 px-12 py-2 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-inner"
									min="1"
									max="100"
								/>
								<MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600/50" />
								<span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
									{t("units.km")}
								</span>
							</div>
						:	<div className="bg-gray-50/30 px-2 py-2 rounded-2xl border border-gray-100/50 flex items-center gap-3">
								<MapPin className="h-4 w-4 text-blue-600/50" />
								<p className="text-sm font-bold text-gray-900">
									{t("units.distanceKm", { value: formData.shoppingPreferences?.maxDeliveryDistance || 25 })}
								</p>
							</div>
						}
					</div>

					{/* Budget Max */}
					<div className="space-y-2 group/field">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							{t("consumer.budget")}
						</label>
						{editing ?
							<div className="relative">
								<input
									type="number"
									name="shoppingPreferences.budgetRange.max"
									value={formData.shoppingPreferences?.budgetRange?.max || ""}
									onChange={onInputChange}
									className="w-full bg-gray-50/50 px-12 py-2 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-inner"
									min="0"
									placeholder="0"
								/>
								<Wallet className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600/50" />
								<span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
									{DEFAULT_CURRENCY}
								</span>
							</div>
						:	<div className="bg-gray-50/30 px-2 py-2 rounded-2xl border border-gray-100/50 flex items-center gap-3">
								<Wallet className="h-4 w-4 text-amber-600/50" />
								<p className="text-sm font-bold text-gray-900">
									{formData.shoppingPreferences?.budgetRange?.max ?
										`${formData.shoppingPreferences.budgetRange.max} ${DEFAULT_CURRENCY}`
									:	t("notDefined")}
								</p>
							</div>
						}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ConsumerFields;
