import React from "react";
import { FiDollarSign } from "react-icons/fi";
import { CURRENCIES } from "../../config/currencies";
import { UNITS } from "../../config/units";

const ProductPricingStock = ({ formData, errors, onInputChange }) => {
	return (
		<div className="bg-white rounded-lg shadow p-6">
			<h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
				<FiDollarSign className="h-5 w-5 mr-2" />
				Prix et stock
			</h2>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Prix (FCFA) *
					</label>
					<input
						type="number"
						name="price"
						value={formData.price}
						onChange={onInputChange}
						min="0"
						step="0.01"
						className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green ${
							errors.price ? "border-red-300" : "border-gray-300"
						}`}
						placeholder="0.00"
					/>
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
						className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
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
						className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green ${
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
						className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
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

export default ProductPricingStock;
