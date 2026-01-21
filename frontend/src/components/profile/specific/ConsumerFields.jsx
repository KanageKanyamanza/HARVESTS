import React from "react";
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
						Préférences Alimentaires
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
									Aucune préférence renseignée
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
						Habitudes d'achat
					</h3>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Preferred Delivery Time */}
					<div className="space-y-2 group/field">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Moment de livraison préféré
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
									className="w-full bg-gray-50/50 pl-12 pr-10 py-4 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-inner"
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
						:	<div className="bg-gray-50/30 px-5 py-4 rounded-2xl border border-gray-100/50 flex items-center gap-3">
								<Clock className="h-4 w-4 text-emerald-600/50" />
								<p className="text-sm font-bold text-gray-900">
									{DELIVERY_TIMES.find(
										(t) =>
											t.value ===
											formData.shoppingPreferences?.preferredDeliveryTime,
									)?.label || "Flexible"}
								</p>
							</div>
						}
					</div>

					{/* Max Distance */}
					<div className="space-y-2 group/field">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Distance max. souhaitée
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
									className="w-full bg-gray-50/50 px-12 py-4 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-inner"
									min="1"
									max="100"
								/>
								<MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600/50" />
								<span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
									KMS
								</span>
							</div>
						:	<div className="bg-gray-50/30 px-5 py-4 rounded-2xl border border-gray-100/50 flex items-center gap-3">
								<MapPin className="h-4 w-4 text-blue-600/50" />
								<p className="text-sm font-bold text-gray-900">
									{formData.shoppingPreferences?.maxDeliveryDistance || 25}{" "}
									kilomètres
								</p>
							</div>
						}
					</div>

					{/* Budget Max */}
					<div className="space-y-2 group/field">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Budget moyen par commande
						</label>
						{editing ?
							<div className="relative">
								<input
									type="number"
									name="shoppingPreferences.budgetRange.max"
									value={formData.shoppingPreferences?.budgetRange?.max || ""}
									onChange={onInputChange}
									className="w-full bg-gray-50/50 px-12 py-4 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-inner"
									min="0"
									placeholder="0"
								/>
								<Wallet className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600/50" />
								<span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
									XAF
								</span>
							</div>
						:	<div className="bg-gray-50/30 px-5 py-4 rounded-2xl border border-gray-100/50 flex items-center gap-3">
								<Wallet className="h-4 w-4 text-amber-600/50" />
								<p className="text-sm font-bold text-gray-900">
									{formData.shoppingPreferences?.budgetRange?.max ?
										`${formData.shoppingPreferences.budgetRange.max} XAF`
									:	"Non défini"}
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
