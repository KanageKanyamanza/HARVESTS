import React from "react";
import { FiDollarSign } from "react-icons/fi";
import { CURRENCIES } from "../../config/currencies";
import { UNITS } from "../../config/units";

const ProductPricingStockTransformer = ({
	formData,
	errors,
	onInputChange,
}) => {
	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
				<FiDollarSign className="h-5 w-5 mr-2" />
				Prix et stock
			</h2>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Prix *
					</label>
					<div className="relative">
						<FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
						<input
							type="number"
							name="price"
							value={formData.price}
							onChange={onInputChange}
							min="0"
							step="0.01"
							className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
								errors.price ? "border-red-300" : "border-gray-300"
							}`}
							placeholder="0.00"
						/>
					</div>
					{errors.price && (
						<p className="mt-1 text-sm text-red-600">{errors.price}</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Devise
					</label>
					<select
						name="currency"
						value={formData.currency}
						onChange={onInputChange}
						className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
					>
						{CURRENCIES.map((currency) => (
							<option key={currency.code} value={currency.code}>
								{currency.code}
							</option>
						))}
					</select>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Stock disponible *
					</label>
					<input
						type="number"
						name="stock"
						value={formData.stock}
						onChange={onInputChange}
						min="0"
						className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
							errors.stock ? "border-red-300" : "border-gray-300"
						}`}
						placeholder="0"
					/>
					{errors.stock && (
						<p className="mt-1 text-sm text-red-600">{errors.stock}</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Unité
					</label>
					<select
						name="unit"
						value={formData.unit}
						onChange={onInputChange}
						className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
					>
						{UNITS.map((unit) => (
							<option key={unit.value} value={unit.value}>
								{unit.label}
							</option>
						))}
					</select>
				</div>
			</div>
		</div>
	);
};

export default ProductPricingStockTransformer;
