import React from "react";
import { Globe, FileText, Check, ShieldCheck, CreditCard } from "lucide-react";

const ExporterFields = ({ formData, editing, onInputChange }) => {
	const INCOTERMS = ["EXW", "FCA", "FOB", "CIF", "DDP"];
	const CURRENCIES = ["USD", "EUR", "XAF", "XOF"];

	const handleToggle = (listName, value) => {
		const current = formData.tradingTerms?.[listName] || [];
		const newVal =
			current.includes(value) ?
				current.filter((v) => v !== value)
			:	[...current, value];

		onInputChange({
			target: {
				name: `tradingTerms.${listName}`,
				value: newVal,
				type: "custom",
			},
		});
	};

	return (
		<div className="space-y-12">
			{/* Export Information */}
			<div className="space-y-8">
				<div className="flex items-center gap-3 px-2">
					<Globe className="h-5 w-5 text-blue-600/50" />
					<h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
						Informations Internationales
					</h3>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Business Registration */}
					<div className="col-span-1 md:col-span-2 space-y-2 group/field">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Numéro d'Enregistrement Commercial (RCCM)
						</label>
						{editing ?
							<div className="relative">
								<input
									type="text"
									name="businessRegistrationNumber"
									value={formData.businessRegistrationNumber || ""}
									onChange={onInputChange}
									className="w-full bg-gray-50/50 px-12 py-4 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-inner"
									placeholder="Ex: RB/ABC/2023/B/1234"
								/>
								<ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600/50" />
							</div>
						:	<div className="bg-gray-50/30 px-5 py-4 rounded-2xl border border-gray-100/50 flex items-center gap-3">
								<ShieldCheck className="h-4 w-4 text-emerald-600/50" />
								<p className="text-sm font-black text-gray-900 tracking-tight">
									{formData.businessRegistrationNumber || "Non renseigné"}
								</p>
							</div>
						}
					</div>
				</div>
			</div>

			{/* Trading Terms */}
			<div className="space-y-8 pt-10 border-t border-gray-100">
				<div className="flex items-center gap-3 px-2">
					<FileText className="h-5 w-5 text-amber-600/50" />
					<h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
						Conditions Commerciales
					</h3>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
					{/* Incoterms */}
					<div className="space-y-4">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Incoterms Acceptés (Logistique)
						</label>
						<div className="flex flex-wrap gap-3">
							{INCOTERMS.map((term) => {
								const isSelected = (
									formData.tradingTerms?.acceptedIncoterms || []
								).includes(term);
								return (
									<button
										key={term}
										type="button"
										onClick={() =>
											editing && handleToggle("acceptedIncoterms", term)
										}
										className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
											isSelected ?
												"bg-gray-900 text-white shadow-lg shadow-gray-200"
											:	"bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100"
										} ${!editing && "cursor-default opacity-80"}`}
									>
										{isSelected && (
											<Check className="inline-block h-3 w-3 mr-2 -mt-0.5" />
										)}
										{term}
									</button>
								);
							})}
						</div>
					</div>

					{/* Currencies */}
					<div className="space-y-4">
						<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Devises de Transaction
						</label>
						<div className="flex flex-wrap gap-3">
							{CURRENCIES.map((curr) => {
								const isSelected = (
									formData.tradingTerms?.currencies || []
								).includes(curr);
								return (
									<button
										key={curr}
										type="button"
										onClick={() => editing && handleToggle("currencies", curr)}
										className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
											isSelected ?
												"bg-emerald-600 text-white shadow-lg shadow-emerald-100"
											:	"bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100"
										} ${!editing && "cursor-default opacity-80"}`}
									>
										{isSelected && (
											<CreditCard className="inline-block h-3 w-3 mr-2 -mt-0.5" />
										)}
										{curr}
									</button>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ExporterFields;
