import React, { useState } from "react";
import {
	CreditCard,
	ShieldCheck,
	AlertCircle,
	Edit3,
	Check,
	X,
	Building2,
	User,
	Hash,
	Info,
	ChevronDown,
	Save,
	Wallet,
} from "lucide-react";
import { commonService } from "../../services";
import { useNotifications } from "../../contexts/NotificationContext";

const FinancialInfo = ({
	bankAccount,
	paymentMethods,
	onUpdate,
	loading = false,
}) => {
	const { showSuccess, showError } = useNotifications();
	const [isEditing, setIsEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [formData, setFormData] = useState({
		accountName: bankAccount?.accountName || "",
		accountNumber: bankAccount?.accountNumber || "",
		bankName: bankAccount?.bankName || "",
		bankCode: bankAccount?.bankCode || "",
		swiftCode: bankAccount?.swiftCode || "",
		paymentMethods: paymentMethods || ["cash", "paypal"],
	});

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handlePaymentMethodChange = (method) => {
		setFormData((prev) => ({
			...prev,
			paymentMethods:
				prev.paymentMethods.includes(method) ?
					prev.paymentMethods.filter((m) => m !== method)
				:	[...prev.paymentMethods, method],
		}));
	};

	const handleSave = async () => {
		try {
			setSaving(true);
			if (formData.accountName || formData.accountNumber) {
				await commonService.updateBankAccount({
					accountName: formData.accountName,
					accountNumber: formData.accountNumber,
					bankName: formData.bankName,
					bankCode: formData.bankCode,
					swiftCode: formData.swiftCode,
				});
			}
			await commonService.updatePaymentMethods(formData.paymentMethods);
			showSuccess("Informations financières mises à jour avec succès");
			setIsEditing(false);
			onUpdate && onUpdate();
		} catch (error) {
			console.error("Erreur lors de la mise à jour:", error);
			showError("Erreur lors de la mise à jour");
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		setFormData({
			accountName: bankAccount?.accountName || "",
			accountNumber: bankAccount?.accountNumber || "",
			bankName: bankAccount?.bankName || "",
			bankCode: bankAccount?.bankCode || "",
			swiftCode: bankAccount?.swiftCode || "",
			paymentMethods: paymentMethods || ["cash", "paypal"],
		});
		setIsEditing(false);
	};

	const paymentMethodOptions = [
		{
			value: "cash",
			label: "Paiement Espèces (Livraison)",
			icon: <Wallet className="h-4 w-4" />,
		},
		{
			value: "paypal",
			label: "Compte PayPal Pro",
			icon: <CreditCard className="h-4 w-4" />,
		},
	];

	if (loading) {
		return (
			<div className="space-y-6 animate-pulse">
				<div className="h-10 bg-gray-100 rounded-2xl w-1/3"></div>
				<div className="h-64 bg-gray-100 rounded-[3rem]"></div>
			</div>
		);
	}

	const renderInputField = (label, name, icon, placeholder, type = "text") => (
		<div className="space-y-2 group/field">
			<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
				{label}
			</label>
			<div className="relative">
				<div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-blue-500 transition-colors">
					{icon}
				</div>
				<input
					type={type}
					name={name}
					value={formData[name]}
					onChange={handleInputChange}
					className="w-full bg-gray-50/50 pl-12 pr-6 py-4 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder-gray-300 shadow-inner"
					placeholder={placeholder}
				/>
			</div>
		</div>
	);

	return (
		<div className="space-y-12">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3 px-2">
					<CreditCard className="h-5 w-5 text-blue-600/50" />
					<h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
						Informations Financières
					</h3>
				</div>
				{!isEditing ?
					<button
						onClick={() => setIsEditing(true)}
						className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-95"
					>
						<Edit3 className="h-4 w-4" />
						Modifier
					</button>
				:	<div className="flex items-center gap-3">
						<button
							onClick={handleCancel}
							className="px-6 py-3 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-900"
						>
							Annuler
						</button>
						<button
							onClick={handleSave}
							disabled={saving}
							className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95 disabled:bg-gray-400"
						>
							{saving ?
								<div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
							:	<Save className="h-4 w-4" />}
							{saving ? "..." : "Enregistrer"}
						</button>
					</div>
				}
			</div>

			{isEditing ?
				<div className="space-y-12">
					{/* Bank Info */}
					<div className="space-y-8">
						<div className="flex items-center gap-2 px-2">
							<Building2 className="h-4 w-4 text-emerald-500" />
							<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
								Compte Bancaire Principal
							</span>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{renderInputField(
								"Titulaire du compte",
								"accountName",
								<User className="h-4 w-4" />,
								"Nom complet",
							)}
							{renderInputField(
								"Numéro de compte / IBAN",
								"accountNumber",
								<Hash className="h-4 w-4" />,
								"Numéro de compte",
							)}
							{renderInputField(
								"Institution bancaire",
								"bankName",
								<Building2 className="h-4 w-4" />,
								"Ex: Ecobank, Société Générale...",
							)}
							{renderInputField(
								"Code guichet / Banque",
								"bankCode",
								<Info className="h-4 w-4" />,
								"Code banque",
							)}
							<div className="md:col-span-2">
								{renderInputField(
									"Code SWIFT / BIC (Optionnel)",
									"swiftCode",
									<Globe className="h-4 w-4" />,
									"Code SWIFT",
								)}
							</div>
						</div>
					</div>

					{/* Payment Methods */}
					<div className="space-y-6 pt-10 border-t border-gray-100">
						<div className="flex items-center gap-2 px-2">
							<CreditCard className="h-4 w-4 text-amber-500" />
							<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
								Modalités de Paiement Accessibles
							</span>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{paymentMethodOptions.map((option) => (
								<label
									key={option.value}
									className="relative flex items-center p-5 bg-gray-50/50 border border-gray-100 rounded-[2rem] cursor-pointer hover:bg-white hover:border-blue-200 transition-all gap-5 group/check"
								>
									<div className="relative flex items-center">
										<input
											type="checkbox"
											checked={formData.paymentMethods.includes(option.value)}
											onChange={() => handlePaymentMethodChange(option.value)}
											className="peer h-6 w-6 cursor-pointer appearance-none rounded-xl border-2 border-gray-200 transition-all checked:border-blue-500 checked:bg-blue-500"
										/>
										<Check className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-white opacity-0 peer-checked:opacity-100" />
									</div>
									<div className="flex items-center gap-3">
										<div className="p-2 bg-white rounded-xl shadow-sm border border-gray-50 text-gray-400 group-hover/check:text-blue-500 group-hover/check:border-blue-100 transition-all">
											{option.icon}
										</div>
										<span className="text-xs font-black text-gray-700 uppercase tracking-widest">
											{option.label}
										</span>
									</div>
								</label>
							))}
						</div>
					</div>
				</div>
			:	<div className="space-y-12 animate-fade-in">
					{bankAccount?.accountName ?
						<div className="space-y-6">
							<div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-5 py-3 rounded-2xl w-fit border border-emerald-100">
								<ShieldCheck className="h-4 w-4" />
								<span className="text-[10px] font-black uppercase tracking-widest">
									{bankAccount.isVerified ?
										"Compte Bancaire Vérifié"
									:	"Compte en attente de vérification"}
								</span>
							</div>

							<div className="bg-gray-50/50 border border-gray-100 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group">
								<div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
									<Building2 className="h-40 w-40" />
								</div>
								<div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
									<div className="space-y-1">
										<p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
											Titulaire du compte
										</p>
										<p className="text-lg font-[1000] text-gray-900 tracking-tight">
											{bankAccount.accountName}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
											IBAN / Numéro
										</p>
										<p className="text-lg font-[1000] text-gray-900 tracking-tight">
											{bankAccount.accountNumber}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
											Banque
										</p>
										<p className="text-sm font-black text-gray-700 tracking-widest uppercase">
											{bankAccount.bankName}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
											Code SWIFT
										</p>
										<p className="text-sm font-black text-gray-700 tracking-widest uppercase">
											{bankAccount.swiftCode || "N/A"}
										</p>
									</div>
								</div>
							</div>
						</div>
					:	<div className="text-center py-20 bg-gray-50/30 rounded-[3rem] border-2 border-dashed border-gray-100">
							<div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl shadow-gray-100 flex items-center justify-center mx-auto mb-6 text-gray-300 border border-gray-50">
								<CreditCard className="h-10 w-10" />
							</div>
							<p className="text-xs font-[1000] text-gray-900 uppercase tracking-widest mb-2">
								Aucun compte bancaire
							</p>
							<p className="text-xs text-gray-400 max-w-xs mx-auto font-medium">
								Configurez vos informations de virement pour recevoir vos
								paiements directement sur votre compte.
							</p>
						</div>
					}

					<div className="space-y-6 pt-10 border-t border-gray-100">
						<h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
							Méthodes de paiement actives
						</h4>
						<div className="flex flex-wrap gap-4">
							{paymentMethods?.map((method) => {
								const option = paymentMethodOptions.find(
									(opt) => opt.value === method,
								);
								return option ?
										<div
											key={method}
											className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group"
										>
											<div className="text-blue-500 group-hover:scale-110 transition-transform">
												{option.icon}
											</div>
											<span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
												{option.label}
											</span>
										</div>
									:	null;
							})}
							{(!paymentMethods || paymentMethods.length === 0) && (
								<p className="text-xs font-medium text-gray-400 italic">
									Aucune méthode sélectionnée
								</p>
							)}
						</div>
					</div>
				</div>
			}
		</div>
	);
};

export default FinancialInfo;
