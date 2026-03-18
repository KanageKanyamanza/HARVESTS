import React from "react";
import {
	Activity,
	Settings,
	Clock,
	Check,
	ChevronDown,
	Tag,
	Box,
	Layers,
	ShieldCheck,
	LifeBuoy,
} from "lucide-react";

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
		<div className="space-y-12">
			{/* Transformation Activities */}
			<div className="space-y-8">
				<div className="flex items-center gap-3 px-2">
					<Activity className="h-5 w-5 text-purple-600/50" />
					<h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
						Activités de Transformation
					</h3>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Transformation Type */}
					<div className="space-y-2 group/field">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Type d'Activité Principal
						</label>
						{editing ?
							<div className="relative">
								<select
									name="transformationType"
									value={formData.transformationType || "processing"}
									onChange={onInputChange}
									className="w-full bg-gray-50/50 px-2 py-2 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-inner"
								>
									{TRANSFORMATION_TYPES.map((type) => (
										<option key={type.value} value={type.value}>
											{type.label}
										</option>
									))}
								</select>
								<ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
							</div>
						:	<div className="bg-gray-50/30 px-2 py-3 rounded-2xl border border-gray-100/50 inline-block">
								<span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">
									{TRANSFORMATION_TYPES.find(
										(t) => t.value === formData.transformationType,
									)?.label || formData.transformationType}
								</span>
							</div>
						}
					</div>

					{/* Pricing Model */}
					<div className="space-y-2 group/field">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Modèle de Facturation
						</label>
						{editing ?
							<div className="relative">
								<select
									name="pricing.model"
									value={formData.pricing?.model || "per-unit"}
									onChange={onInputChange}
									className="w-full bg-gray-50/50 px-2 py-2 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-inner"
								>
									{PRICING_MODELS.map((model) => (
										<option key={model.value} value={model.value}>
											{model.label}
										</option>
									))}
								</select>
								<ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
							</div>
						:	<div className="bg-gray-50/30 px-2 py-2 rounded-2xl border border-gray-100/50 flex items-center gap-3">
								<Tag className="h-4 w-4 text-emerald-600/50" />
								<p className="text-sm font-bold text-gray-900 text-sm">
									{PRICING_MODELS.find(
										(m) => m.value === formData.pricing?.model,
									)?.label ||
										formData.pricing?.model ||
										"Non renseigné"}
								</p>
							</div>
						}
					</div>

					{/* Services */}
					<div className="col-span-1 md:col-span-2 space-y-4">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Catalogue de Services
						</label>
						{editing ?
							<div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
								{[
									{
										key: "packaging",
										label: "Emballage",
										icon: <Box className="h-4 w-4" />,
									},
									{
										key: "customProcessing",
										label: "Sur mesure",
										icon: <Layers className="h-4 w-4" />,
									},
									{
										key: "privateLabeling",
										label: "Marque blanche",
										icon: <Tag className="h-4 w-4" />,
									},
									{
										key: "qualityTesting",
										label: "Contrôle qualité",
										icon: <ShieldCheck className="h-4 w-4" />,
									},
									{
										key: "consultation",
										label: "Conseils techniques",
										icon: <LifeBuoy className="h-4 w-4" />,
									},
								].map((service) => (
									<label
										key={service.key}
										className="relative flex items-center p-4 bg-gray-50/50 border border-gray-100 rounded-2xl cursor-pointer hover:bg-white hover:border-purple-200 transition-all gap-4 group/check"
									>
										<div className="relative flex items-center">
											<input
												type="checkbox"
												name={`services.${service.key}`}
												checked={formData.services?.[service.key] || false}
												onChange={onInputChange}
												className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-gray-200 transition-all checked:border-purple-500 checked:bg-purple-500"
											/>
											<Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100" />
										</div>
										<span className="text-xs font-bold text-gray-700">
											{service.label}
										</span>
									</label>
								))}
							</div>
						:	<div className="flex flex-wrap gap-3">
								{[
									{ key: "packaging", label: "Emballage" },
									{
										key: "customProcessing",
										label: "Transformation sur mesure",
									},
									{ key: "privateLabeling", label: "Marque blanche" },
									{ key: "qualityTesting", label: "Tests qualité" },
									{ key: "consultation", label: "Conseil" },
								].map(
									(service, idx) =>
										formData.services?.[service.key] && (
											<div
												key={idx}
												className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-100 rounded-xl"
											>
												<Check className="h-3.5 w-3.5 text-purple-600" />
												<span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">
													{service.label}
												</span>
											</div>
										),
								)}
								{!Object.values(formData.services || {}).some(Boolean) && (
									<p className="text-xs font-medium text-gray-400 italic">
										Aucun service renseigné
									</p>
								)}
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
													formData.operatingHours?.[day.key]?.close || "18:00"
												}
												onChange={onInputChange}
												className="bg-white px-3 py-1.5 rounded-xl border border-gray-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
											/>
										</div>
									:	<div className="px-3 py-2 bg-white/50 rounded-xl text-xs font-black text-amber-700 text-center tracking-tight">
											{formData.operatingHours?.[day.key]?.open || "09:00"} —{" "}
											{formData.operatingHours?.[day.key]?.close || "18:00"}
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

export default TransformerFields;
