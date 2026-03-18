import React from "react";
import { Truck, DollarSign, Map, Check, ChevronDown } from "lucide-react";

const TransporterFields = ({ formData, editing, onInputChange }) => {
	const TRANSPORT_TYPES = [
		{ value: "road", label: "Routier" },
		{ value: "rail", label: "Ferroviaire" },
		{ value: "air", label: "Aérien" },
		{ value: "sea", label: "Maritime" },
		{ value: "multimodal", label: "Multimodal" },
	];

	return (
		<div className="space-y-12">
			{/* Transport Services */}
			<div className="space-y-8">
				<div className="flex items-center gap-3 px-2">
					<Truck className="h-5 w-5 text-indigo-600/50" />
					<h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
						Services de Transport
					</h3>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Transport Types */}
					<div className="col-span-1 md:col-span-2 space-y-4">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Modes de Transport Proposés
						</label>
						{editing ?
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								{TRANSPORT_TYPES.map((type) => (
									<label
										key={type.value}
										className="relative flex items-center p-4 bg-gray-50/50 border border-gray-100 rounded-2xl cursor-pointer hover:bg-white hover:border-indigo-200 transition-all gap-4 group/check"
									>
										<div className="relative flex items-center">
											<input
												type="checkbox"
												value={type.value}
												checked={(formData.transportType || []).includes(
													type.value,
												)}
												onChange={(e) => {
													const val = e.target.value;
													const current = formData.transportType || [];
													const newVal =
														e.target.checked ?
															[...current, val]
														:	current.filter((x) => x !== val);
													onInputChange({
														target: {
															name: "transportType",
															value: newVal,
															type: "custom",
														},
													});
												}}
												className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-gray-200 transition-all checked:border-indigo-500 checked:bg-indigo-500"
											/>
											<Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100" />
										</div>
										<span className="text-xs font-bold text-gray-700">
											{type.label}
										</span>
									</label>
								))}
							</div>
						:	<div className="flex flex-wrap gap-3">
								{(formData.transportType || []).length > 0 ?
									formData.transportType.map((t) => (
										<div
											key={t}
											className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl"
										>
											<div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
											<span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">
												{TRANSPORT_TYPES.find((types) => types.value === t)
													?.label || t}
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

					{/* Pricing Model */}
					<div className="space-y-2 group/field">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Modèle de Tarification
						</label>
						{editing ?
							<div className="relative">
								<select
									name="pricingStructure.model"
									value={formData.pricingStructure?.model || "per-km"}
									onChange={onInputChange}
									className="w-full bg-gray-50/50 pl-12 pr-10 py-2 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-inner"
								>
									<option value="per-km">Par kilomètre</option>
									<option value="per-kg">Par kilogramme</option>
									<option value="flat-rate">Forfait</option>
									<option value="custom">Sur devis</option>
								</select>
								<DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600/50" />
								<ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
							</div>
						:	<div className="bg-gray-50/30 px-2 py-2 rounded-2xl border border-gray-100/50 flex items-center gap-3">
								<DollarSign className="h-4 w-4 text-emerald-600/50" />
								<p className="text-sm font-bold text-gray-900">
									{{
										"per-km": "Par kilomètre",
										"per-kg": "Par kilogramme",
										"flat-rate": "Forfait",
										custom: "Sur devis",
									}[formData.pricingStructure?.model] ||
										formData.pricingStructure?.model ||
										"Non renseigné"}
								</p>
							</div>
						}
					</div>

					{/* Base Rate */}
					<div className="space-y-2 group/field">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Tarif de Base
						</label>
						{editing ?
							<div className="relative">
								<input
									type="number"
									name="pricingStructure.baseRate"
									value={formData.pricingStructure?.baseRate || ""}
									onChange={onInputChange}
									className="w-full bg-gray-50/50 px-2 py-2 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-inner"
									min="0"
									placeholder="0"
								/>
								<span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
									XAF
								</span>
							</div>
						:	<div className="bg-gray-50/30 px-2 py-2 rounded-2xl border border-gray-100/50 flex items-center gap-3">
								<div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-[10px]">
									XAF
								</div>
								<p className="text-sm font-bold text-gray-900">
									{formData.pricingStructure?.baseRate ?
										`${formData.pricingStructure.baseRate} XAF`
									:	"Non renseigné"}
								</p>
							</div>
						}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TransporterFields;
