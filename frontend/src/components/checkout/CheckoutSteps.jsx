import React from "react";
import {
	FiMapPin,
	FiCreditCard,
	FiCheck,
	FiDollarSign,
	FiTruck,
	FiInfo,
	FiShield,
} from "react-icons/fi";
import { useCartCalculations } from "../../hooks/useCartCalculations";
import { convertPrice, formatPrice } from "../../utils/currencyUtils";
import { useCurrency } from "../../contexts/CurrencyContext.jsx";
import { DEFAULT_CURRENCY } from "../../config/currencies";

export const ProgressSteps = ({ currentStep }) => (
	<div className="mb-6 sm:mb-8 bg-white rounded-2xl shadow-agri-card border border-emerald-100/80 p-4 sm:p-5">
		<div className="flex items-center justify-between">
			{[
				{ step: 1, title: "Adresse", Icon: FiMapPin },
				{ step: 2, title: "Paiement", Icon: FiCreditCard },
				{ step: 3, title: "Confirmation", Icon: FiCheck },
			].map(({ step, title, Icon }, idx) => (
				<React.Fragment key={step}>
					<div className="flex items-center">
						<div
							className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all ${
								currentStep >= step
									? "bg-gradient-to-r from-[#1A5514] to-[#31BC2E] text-white shadow-md shadow-emerald-900/20"
									: "bg-gray-100 text-gray-400"
							}`}
						>
							<Icon className="h-4 w-4 sm:h-5 sm:w-5" />
						</div>
						<span
							className={`ml-2 text-xs sm:text-sm font-bold hidden sm:inline ${
								currentStep >= step ? "text-[#1A5514]" : "text-gray-400"
							}`}
						>
							{title}
						</span>
					</div>
					{idx < 2 && (
						<div
							className={`flex-1 h-0.5 mx-2 sm:mx-4 rounded-full transition-all ${
								currentStep > step ? "bg-gradient-to-r from-[#1A5514] to-[#31BC2E]" : "bg-gray-100"
							}`}
						/>
					)}
				</React.Fragment>
			))}
		</div>
	</div>
);

export const AddressStep = ({ orderData, handleInputChange }) => (
	<div className="bg-white rounded-2xl shadow-agri-card border border-emerald-100/80 p-5 sm:p-6">
		<h2 className="font-extrabold text-[#161D14] mb-6 flex items-center">
			<span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mr-2.5">
				<FiMapPin className="h-4 w-4 text-[#1A5514]" />
			</span>
			Adresse de livraison
		</h2>

		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			<InputField
				label="Prénom *"
				value={orderData.deliveryAddress.firstName}
				onChange={(v) => handleInputChange("deliveryAddress", "firstName", v)}
				required
			/>
			<InputField
				label="Nom *"
				value={orderData.deliveryAddress.lastName}
				onChange={(v) => handleInputChange("deliveryAddress", "lastName", v)}
				required
			/>
			<InputField
				label="Adresse *"
				value={orderData.deliveryAddress.street}
				onChange={(v) => handleInputChange("deliveryAddress", "street", v)}
				placeholder="Rue, numéro, quartier"
				className="md:col-span-2"
				required
			/>
			<InputField
				label="Ville *"
				value={orderData.deliveryAddress.city}
				onChange={(v) => handleInputChange("deliveryAddress", "city", v)}
				required
			/>
			<InputField
				label="Région/État/Province *"
				value={orderData.deliveryAddress.region}
				onChange={(v) => handleInputChange("deliveryAddress", "region", v)}
				placeholder="Ex: Centre, Dakar..."
				required
			/>
			<InputField
				label="Code postal"
				value={orderData.deliveryAddress.postalCode}
				onChange={(v) => handleInputChange("deliveryAddress", "postalCode", v)}
			/>
			<InputField
				label="Pays *"
				value={orderData.deliveryAddress.country}
				onChange={(v) => handleInputChange("deliveryAddress", "country", v)}
				placeholder="Ex: Cameroun, Sénégal..."
				required
			/>
			<InputField
				label="Téléphone *"
				value={orderData.deliveryAddress.phone}
				onChange={(v) => handleInputChange("deliveryAddress", "phone", v)}
				type="tel"
				placeholder="+237 6XX XXX XXX"
				required
			/>
			<div className="md:col-span-2">
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Instructions de livraison
				</label>
				<textarea
					value={orderData.deliveryAddress.deliveryInstructions}
					onChange={(e) =>
						handleInputChange(
							"deliveryAddress",
							"deliveryInstructions",
							e.target.value
						)
					}
					placeholder="Informations supplémentaires pour le livreur..."
					rows={3}
					className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#31BC2E]/40 focus:border-[#31BC2E]"
				/>
			</div>
		</div>
	</div>
);

export const PaymentStep = ({ orderData, handleInputChange }) => {
	const { currency } = useCurrency();

	return (
		<div className="space-y-5">
			<div className="bg-white rounded-2xl shadow-agri-card border border-emerald-100/80 p-5 sm:p-6">
				<h2 className="font-extrabold text-[#161D14] mb-6 flex items-center">
					<span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mr-2.5">
						<FiCreditCard className="h-4 w-4 text-[#1A5514]" />
					</span>
					Méthode de paiement
				</h2>

				<div className="space-y-3">
					{[
						{
							value: "cash",
							label: "Paiement à la livraison",
							description: "Réglez en espèces auprès du livreur.",
							Icon: FiDollarSign,
						},
						{
							value: "paypal",
							label: "Paypal ou Carte bancaire",
							description: "Payer en ligne via PayPal ou Carte bancaire.",
							Icon: FiCreditCard,
						},
					].map(({ value, label, description, Icon }) => (
						<label
							key={value}
							className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${
								orderData.paymentMethod === value
									? "border-[#31BC2E] bg-emerald-50/60 ring-1 ring-[#31BC2E]/30"
									: "border-gray-200 hover:border-emerald-200"
							}`}
						>
							<input
								type="radio"
								name="paymentMethod"
								value={value}
								checked={orderData.paymentMethod === value}
								onChange={(e) =>
									handleInputChange("", "paymentMethod", e.target.value)
								}
								className="h-4 w-4 text-[#1A5514] mt-1 accent-[#1A5514]"
							/>
							<div className="ml-3">
								<div className="flex items-center gap-2">
									<Icon className="h-5 w-5 text-[#1A5514]" />
									<span className="text-sm font-bold text-[#161D14]">
										{label}
									</span>
								</div>
								<p className="text-sm text-gray-500 mt-1.5">{description}</p>
							</div>
						</label>
					))}
				</div>

				{orderData.paymentMethod === "cash" && (
					<div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start">
						<FiInfo className="h-5 w-5 text-[#1A5514] mr-2 mt-0.5 flex-shrink-0" />
						<div>
							<h3 className="text-sm font-bold text-[#1A5514]">
								Paiement à la livraison
							</h3>
							<p className="text-sm text-emerald-800/80 mt-1">
								Préparez le montant exact pour le livreur.
							</p>
						</div>
					</div>
				)}

				{orderData.paymentMethod === "paypal" && (
					<div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start">
						<FiShield className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
						<div>
							<h3 className="text-sm font-bold text-blue-800">
								Paiement sécurisé via PayPal
							</h3>
							<p className="text-sm text-blue-700/80 mt-1">
								Vous serez redirigé vers PayPal pour autoriser le paiement.
							</p>
						</div>
					</div>
				)}
			</div>

			<div className="bg-white rounded-2xl shadow-agri-card border border-emerald-100/80 p-5 sm:p-6">
				<h2 className="font-extrabold text-[#161D14] mb-6 flex items-center">
					<span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mr-2.5">
						<FiTruck className="h-4 w-4 text-[#1A5514]" />
					</span>
					Mode de livraison
				</h2>

				<div className="space-y-3">
					{[
						{
							value: "standard-delivery",
							label: "Livraison standard",
							description: "2-3 jours ouvrables",
							basePrice: 2000,
						},
						{
							value: "express-delivery",
							label: "Livraison express",
							description: "24 heures",
							basePrice: 5000,
						},
					].map((method) => (
						<label
							key={method.value}
							className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
								orderData.deliveryMethod === method.value
									? "border-[#31BC2E] bg-emerald-50/60 ring-1 ring-[#31BC2E]/30"
									: "border-gray-200 hover:border-emerald-200"
							}`}
						>
							<div className="flex items-center">
								<input
									type="radio"
									name="deliveryMethod"
									value={method.value}
									checked={orderData.deliveryMethod === method.value}
									onChange={(e) =>
										handleInputChange("", "deliveryMethod", e.target.value)
									}
									className="h-4 w-4 text-[#1A5514] accent-[#1A5514]"
								/>
								<div className="ml-3">
									<div className="text-sm font-bold text-[#161D14]">
										{method.label}
									</div>
									<div className="text-sm text-gray-500">
										{method.description}
									</div>
								</div>
							</div>
							<div className="text-sm font-extrabold text-[#1A5514]">
								{formatPrice(
									convertPrice(method.basePrice, DEFAULT_CURRENCY, currency),
									currency
								)}
							</div>
						</label>
					))}
				</div>
			</div>

			<div className="bg-white rounded-2xl shadow-agri-card border border-emerald-100/80 p-5 sm:p-6">
				<h2 className="font-extrabold text-[#161D14] mb-4">
					Notes de commande
				</h2>
				<textarea
					value={orderData.notes}
					onChange={(e) => handleInputChange("", "notes", e.target.value)}
					placeholder="Instructions spéciales..."
					rows={3}
					className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#31BC2E]/40 focus:border-[#31BC2E]"
				/>
			</div>
		</div>
	);
};

export const ConfirmationStep = ({ orderData, cartItems }) => {
	const { currency } = useCurrency();

	return (
		<div className="bg-white rounded-2xl shadow-agri-card border border-emerald-100/80 p-5 sm:p-6">
			<h2 className="font-extrabold text-[#161D14] mb-6 flex items-center">
				<span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mr-2.5">
					<FiCheck className="h-4 w-4 text-[#1A5514]" />
				</span>
				Confirmation de commande
			</h2>

			<div className="space-y-5">
				<div className="pb-5 border-b border-gray-100">
					<h3 className="text-sm font-bold text-[#161D14] mb-3">
						Résumé de la commande
					</h3>
					<div className="space-y-2">
						{cartItems.map((item, i) => (
							<div
								key={item.productId || item.id || `item-${i}`}
								className="flex justify-between text-sm text-gray-600"
							>
								<span>
									{item.name} x {item.quantity}
								</span>
								<span className="font-bold text-[#161D14]">
									{formatPrice(
										convertPrice(
											item.price * item.quantity,
											item.currency || DEFAULT_CURRENCY,
											currency
										),
										currency
									)}
								</span>
							</div>
						))}
					</div>
				</div>

				<div className="pb-5 border-b border-gray-100">
					<h3 className="text-sm font-bold text-[#161D14] mb-3">
						Adresse de livraison
					</h3>
					<div className="text-sm text-gray-500 space-y-0.5">
						<p>
							{orderData.deliveryAddress.firstName}{" "}
							{orderData.deliveryAddress.lastName}
						</p>
						<p>{orderData.deliveryAddress.street}</p>
						<p>
							{orderData.deliveryAddress.city},{" "}
							{orderData.deliveryAddress.region}
						</p>
						<p>{orderData.deliveryAddress.phone}</p>
					</div>
				</div>

				<div>
					<h3 className="text-sm font-bold text-[#161D14] mb-3">Paiement</h3>
					<div className="text-sm text-gray-500">
						<p>
							Méthode:{" "}
							{orderData.paymentMethod === "paypal"
								? "PayPal"
								: "Paiement à la livraison"}
						</p>
						{orderData.paymentMethod === "paypal" && (
							<p className="text-blue-600 mt-1">Vous serez redirigé vers PayPal.</p>
						)}
						{orderData.paymentMethod === "cash" && (
							<p className="text-[#1A5514] font-bold flex items-center mt-1">
								<FiCheck className="w-4 h-4 mr-1" /> Paiement en espèces à la livraison
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

const InputField = ({
	label,
	value,
	onChange,
	type = "text",
	placeholder,
	className = "",
	required,
}) => (
	<div className={className}>
		<label className="block text-sm font-medium text-gray-700 mb-2">
			{label}
		</label>
		<input
			type={type}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#31BC2E]/40 focus:border-[#31BC2E]"
			required={required}
		/>
	</div>
);
