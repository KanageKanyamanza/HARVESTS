import React from "react";
import {
	Layers,
	Box,
	Package,
	Truck,
	Clock,
	Plus,
	Trash2,
	Target,
	ChevronDown,
	Check,
} from "lucide-react";

const ProducerFields = ({ formData, editing, onInputChange, safeDisplay }) => {
	const FARMING_TYPES = [
		{ value: "organic", label: "Biologique" },
		{ value: "conventional", label: "Conventionnel" },
		{ value: "mixed", label: "Mixte" },
	];

	const STORAGE_UNITS = ["tons", "kg", "m³"];
	const AREA_UNITS = ["hectares", "acres", "m²"];

	return (
		<div className="space-y-12">
			{/* Production Details */}
			<div className="space-y-8">
				<div className="flex items-center gap-3 px-2">
					<Layers className="h-5 w-5 text-emerald-600/50" />
					<h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
						Détails de la production
					</h3>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Farming Type */}
					<div className="space-y-2 group/field">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Type d'agriculture
						</label>
						{editing ?
							<div className="relative">
								<select
									name="farmingType"
									value={formData.farmingType || "conventional"}
									onChange={onInputChange}
									className="w-full bg-gray-50/50 px-2 py-2 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-inner"
								>
									{FARMING_TYPES.map((type) => (
										<option key={type.value} value={type.value}>
											{type.label}
										</option>
									))}
								</select>
								<ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
							</div>
						:	<div className="bg-gray-50/30 px-2 py-3 rounded-2xl border border-gray-100/50 inline-block">
								<span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
									{FARMING_TYPES.find((t) => t.value === formData.farmingType)
										?.label ||
										formData.farmingType ||
										"Non renseigné"}
								</span>
							</div>
						}
					</div>

					{/* Farm Size */}
					<div className="space-y-2 group/field">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Taille de l'exploitation
						</label>
						{editing ?
							<div className="flex gap-3">
								<input
									type="number"
									name="farmSize.value"
									value={formData.farmSize?.value || ""}
									onChange={onInputChange}
									className="flex-1 bg-gray-50/50 px-2 py-2 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-inner"
									placeholder="0"
								/>
								<div className="relative w-1/3">
									<select
										name="farmSize.unit"
										value={formData.farmSize?.unit || "hectares"}
										onChange={onInputChange}
										className="w-full bg-gray-50/50 px-2 py-2 border-2 border-transparent rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-900 focus:bg-white focus:outline-none appearance-none cursor-pointer shadow-inner"
									>
										{AREA_UNITS.map((unit) => (
											<option key={unit} value={unit}>
												{unit}
											</option>
										))}
									</select>
									<ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
								</div>
							</div>
						:	<div className="bg-gray-50/30 px-2 py-2 rounded-2xl border border-gray-100/50 flex items-center gap-3">
								<Target className="h-4 w-4 text-emerald-600/50" />
								<p className="text-sm font-bold text-gray-900">
									{formData.farmSize?.value ?
										`${formData.farmSize.value} ${formData.farmSize.unit}`
									:	"Non renseigné"}
								</p>
							</div>
						}
					</div>

					{/* Storage Capacity */}
					<div className="space-y-2 group/field">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Capacité de stockage
						</label>
						{editing ?
							<div className="flex gap-3">
								<input
									type="number"
									name="storageCapacity.value"
									value={formData.storageCapacity?.value || ""}
									onChange={onInputChange}
									className="flex-1 bg-gray-50/50 px-2 py-2 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-inner"
									placeholder="0"
								/>
								<div className="relative w-1/3">
									<select
										name="storageCapacity.unit"
										value={formData.storageCapacity?.unit || "tons"}
										onChange={onInputChange}
										className="w-full bg-gray-50/50 px-2 py-2 border-2 border-transparent rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-900 focus:bg-white focus:outline-none appearance-none cursor-pointer shadow-inner"
									>
										{STORAGE_UNITS.map((unit) => (
											<option key={unit} value={unit}>
												{unit}
											</option>
										))}
									</select>
									<ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
								</div>
							</div>
						:	<div className="bg-gray-50/30 px-2 py-2 rounded-2xl border border-gray-100/50 flex items-center gap-3">
								<Box className="h-4 w-4 text-emerald-600/50" />
								<p className="text-sm font-bold text-gray-900">
									{formData.storageCapacity?.value ?
										`${formData.storageCapacity.value} ${formData.storageCapacity.unit}`
									:	"Non renseigné"}
								</p>
							</div>
						}
					</div>

					{/* MOQ */}
					<div className="space-y-2 group/field">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Commande Minimum
						</label>
						{editing ?
							<div className="flex gap-3">
								<input
									type="number"
									name="minimumOrderQuantity.value"
									value={formData.minimumOrderQuantity?.value || ""}
									onChange={onInputChange}
									className="flex-1 bg-gray-50/50 px-2 py-2 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-inner"
									placeholder="1"
								/>
								<input
									type="text"
									name="minimumOrderQuantity.unit"
									value={formData.minimumOrderQuantity?.unit || ""}
									onChange={onInputChange}
									className="w-1/3 bg-gray-50/50 px-2 py-2 border-2 border-transparent rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-900 focus:bg-white focus:outline-none shadow-inner"
									placeholder="UNITÉ (KG)"
								/>
							</div>
						:	<div className="bg-gray-50/30 px-2 py-2 rounded-2xl border border-gray-100/50 flex items-center gap-3">
								<Package className="h-4 w-4 text-emerald-600/50" />
								<p className="text-sm font-bold text-gray-900">
									{formData.minimumOrderQuantity?.value ?
										`${formData.minimumOrderQuantity.value} ${formData.minimumOrderQuantity.unit || ""}`
									:	"Non renseigné"}
								</p>
							</div>
						}
					</div>
				</div>
			</div>

			{/* Crops Section */}
			<div className="space-y-6 pt-6 border-t border-gray-100">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3 px-2">
						<Package className="h-5 w-5 text-teal-600/50" />
						<h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
							Cultures & Produits
						</h3>
					</div>
					{editing && (
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
							className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md active:scale-95"
						>
							<Plus className="h-3.5 w-3.5" />
							Ajouter
						</button>
					)}
				</div>

				{editing ?
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{(formData.crops || []).map((crop, index) => (
							<div
								key={index}
								className="group/item relative bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex gap-3 items-center"
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
									className="flex-1 bg-white px-4 py-2.5 rounded-xl text-xs font-bold text-gray-900 border border-gray-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all placeholder-gray-300 shadow-sm"
									placeholder="Nom culture"
								/>
								<div className="relative w-32">
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
										className="w-full bg-white px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-50 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
									>
										<option value="">CAT...</option>
										<option value="cereals">Céréales</option>
										<option value="vegetables">Légumes</option>
										<option value="fruits">Fruits</option>
										<option value="legumes">Légumineuses</option>
										<option value="tubers">Tubercules</option>
									</select>
									<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-300 pointer-events-none" />
								</div>
								<button
									type="button"
									onClick={() => {
										const newCrops = (formData.crops || []).filter(
											(_, i) => i !== index,
										);
										onInputChange({
											target: {
												name: "crops",
												value: newCrops,
												type: "custom",
											},
										});
									}}
									className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
								>
									<Trash2 className="h-4 w-4" />
								</button>
							</div>
						))}
					</div>
				:	<div className="flex flex-wrap gap-3">
						{(formData.crops || []).length > 0 ?
							formData.crops.map((crop, idx) => (
								<div
									key={idx}
									className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all"
								>
									<div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
									<span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
										{crop.name}
									</span>
									<span className="text-[9px] font-bold text-gray-400 capitalize bg-gray-50 px-2 py-0.5 rounded-md">
										{crop.category}
									</span>
								</div>
							))
						:	<p className="text-xs font-medium text-gray-400 italic">
								Aucune culture renseignée
							</p>
						}
					</div>
				}
			</div>

			{/* Delivery Options */}
			<div className="space-y-6 pt-6 border-t border-gray-100">
				<div className="flex items-center gap-3 px-2">
					<Truck className="h-5 w-5 text-blue-600/50" />
					<h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
						Options de Logistique
					</h3>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div className="flex items-center">
						{editing ?
							<label className="relative flex items-center p-4 bg-gray-50/50 border border-gray-100 rounded-2xl cursor-pointer hover:bg-white hover:border-blue-200 transition-all gap-4 w-full group/check">
								<div className="relative flex items-center">
									<input
										type="checkbox"
										name="deliveryOptions.canDeliver"
										checked={formData.deliveryOptions?.canDeliver || false}
										onChange={onInputChange}
										className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-gray-200 transition-all checked:border-blue-500 checked:bg-blue-500"
									/>
									<Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100" />
								</div>
								<span className="text-xs font-bold text-gray-700">
									Service de livraison propre
								</span>
							</label>
						:	<div
								className={`flex items-center gap-3 px-2 py-3 rounded-2xl border ${formData.deliveryOptions?.canDeliver ? "bg-blue-50 border-blue-100 text-blue-700" : "bg-gray-50 border-gray-100 text-gray-400"} transition-all`}
							>
								<Truck className="h-4 w-4" />
								<span className="text-[10px] font-black uppercase tracking-widest">
									{formData.deliveryOptions?.canDeliver ?
										"Livraison propre disponible"
									:	"Pas de livraison propre"}
								</span>
							</div>
						}
					</div>

					{formData.deliveryOptions?.canDeliver && (
						<div className="space-y-2 animate-fade-in">
							<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
								Rayon d'action (km)
							</label>
							{editing ?
								<div className="relative">
									<input
										type="number"
										name="deliveryOptions.deliveryRadius"
										value={formData.deliveryOptions?.deliveryRadius || 0}
										onChange={onInputChange}
										className="w-full bg-gray-50/50 px-2 py-2 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none shadow-inner"
										min="0"
									/>
									<span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
										KMS
									</span>
								</div>
							:	<p className="text-sm font-bold text-gray-900 ml-2">
									{formData.deliveryOptions?.deliveryRadius || 0} kilomètres
								</p>
							}
						</div>
					)}
				</div>
			</div>

			{/* Operating Hours */}
			<div className="space-y-6 pt-6 border-t border-gray-100">
				<div className="flex items-center gap-3 px-2">
					<Clock className="h-5 w-5 text-amber-600/50" />
					<h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
						Disponibilités Hebdomadaires
					</h3>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
							className={`p-4 rounded-[1.5rem] border transition-all ${
								editing ?
									"bg-gray-50/50 border-gray-100 hover:bg-white hover:border-amber-200"
								: (formData.shopInfo?.openingHours?.[day.key]?.isOpen ?? true) ?
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
										name={`shopInfo.openingHours.${day.key}.isOpen`}
										checked={
											formData.shopInfo?.openingHours?.[day.key]?.isOpen ?? true
										}
										onChange={onInputChange}
										className="h-4 w-4 rounded-md border-gray-300 text-amber-500 focus:ring-amber-500"
									/>
								)}
							</div>

							{(
								editing ||
								(formData.shopInfo?.openingHours?.[day.key]?.isOpen ?? true)
							) ?
								<div className="space-y-2">
									{editing ?
										<div className="flex flex-col gap-2">
											<input
												type="time"
												name={`shopInfo.openingHours.${day.key}.open`}
												value={
													formData.shopInfo?.openingHours?.[day.key]?.open ||
													"08:00"
												}
												onChange={onInputChange}
												className="bg-white px-3 py-1.5 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
											/>
											<input
												type="time"
												name={`shopInfo.openingHours.${day.key}.close`}
												value={
													formData.shopInfo?.openingHours?.[day.key]?.close ||
													"18:00"
												}
												onChange={onInputChange}
												className="bg-white px-3 py-1.5 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
											/>
										</div>
									:	<div className="p-2 bg-white/50 rounded-xl text-xs font-black text-amber-700 text-center tracking-tight">
											{formData.shopInfo?.openingHours?.[day.key]?.open ||
												"08:00"}{" "}
											—{" "}
											{formData.shopInfo?.openingHours?.[day.key]?.close ||
												"18:00"}
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

export default ProducerFields;
