import React from "react";
import { FiGlobe, FiTruck, FiFileText } from "react-icons/fi";

const ExporterFields = ({ formData, editing, onInputChange }) => {
	const INCOTERMS = ["EXW", "FCA", "FOB", "CIF", "DDP"];
	const CURRENCIES = ["USD", "EUR", "XAF", "XOF"];

	const handleToggle = (listName, value) => {
		const current = formData.tradingTerms?.[listName] || [];
		const newVal = current.includes(value)
			? current.filter((v) => v !== value)
			: [...current, value];

		onInputChange({
			target: {
				name: `tradingTerms.${listName}`,
				value: newVal,
				type: "custom",
			},
		});
	};

	return (
		<div className="space-y-6 mt-6 pt-6 border-t border-gray-100">
			<h3 className="text-lg font-semibold text-gray-900 flex items-center">
				<FiGlobe className="mr-2" />
				Informations d'exportation
			</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Business Registration */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Numéro d'enregistrement
					</label>
					{editing ? (
						<input
							type="text"
							name="businessRegistrationNumber"
							value={formData.businessRegistrationNumber || ""}
							onChange={onInputChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="RCCM / NINEA"
						/>
					) : (
						<p className="text-gray-900">
							{formData.businessRegistrationNumber || "Non renseigné"}
						</p>
					)}
				</div>
			</div>

			{/* Trading Terms */}
			<div className="mt-6 border-t border-gray-100 pt-6">
				<h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
					<FiFileText className="mr-2" />
					Conditions commerciales
				</h4>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Incoterms */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Incoterms acceptés
						</label>
						<div className="flex flex-wrap gap-2">
							{INCOTERMS.map((term) => (
								<button
									key={term}
									type="button"
									onClick={() =>
										editing && handleToggle("acceptedIncoterms", term)
									}
									className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
										(formData.tradingTerms?.acceptedIncoterms || []).includes(
											term
										)
											? "bg-blue-600 text-white"
											: "bg-gray-100 text-gray-600 hover:bg-gray-200"
									} ${!editing && "cursor-default"}`}
								>
									{term}
								</button>
							))}
						</div>
					</div>

					{/* Currencies */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Devises acceptées
						</label>
						<div className="flex flex-wrap gap-2">
							{CURRENCIES.map((curr) => (
								<button
									key={curr}
									type="button"
									onClick={() => editing && handleToggle("currencies", curr)}
									className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
										(formData.tradingTerms?.currencies || []).includes(curr)
											? "bg-green-600 text-white"
											: "bg-gray-100 text-gray-600 hover:bg-gray-200"
									} ${!editing && "cursor-default"}`}
								>
									{curr}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ExporterFields;
