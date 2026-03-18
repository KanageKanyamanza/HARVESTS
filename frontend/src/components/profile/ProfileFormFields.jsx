import React from "react";
import {
	User,
	Mail,
	Phone,
	MapPin,
	CheckCircle2,
	AlertCircle,
	Building2,
	Globe,
	Info,
	ChevronDown,
} from "lucide-react";

const CUISINE_OPTIONS = [
	{ value: "african", label: "Africaine" },
	{ value: "french", label: "Française" },
	{ value: "italian", label: "Italienne" },
	{ value: "asian", label: "Asiatique" },
	{ value: "american", label: "Américaine" },
	{ value: "mediterranean", label: "Méditerranéenne" },
	{ value: "fusion", label: "Fusion" },
	{ value: "vegetarian", label: "Végétarienne" },
	{ value: "vegan", label: "Végane" },
];

const COUNTRIES = [
	{ code: "SN", name: "Sénégal" },
	{ code: "CM", name: "Cameroun" },
	{ code: "CI", name: "Côte d'Ivoire" },
	{ code: "BF", name: "Burkina Faso" },
	{ code: "ML", name: "Mali" },
	{ code: "GN", name: "Guinée" },
	{ code: "GM", name: "Gambie" },
	{ code: "GW", name: "Guinée-Bissau" },
	{ code: "CV", name: "Cap-Vert" },
	{ code: "MR", name: "Mauritanie" },
	{ code: "NE", name: "Niger" },
	{ code: "TD", name: "Tchad" },
	{ code: "CF", name: "République centrafricaine" },
	{ code: "GQ", name: "Guinée équatoriale" },
	{ code: "GA", name: "Gabon" },
	{ code: "CG", name: "Congo" },
	{ code: "CD", name: "République démocratique du Congo" },
	{ code: "AO", name: "Angola" },
	{ code: "ST", name: "São Tomé-et-Príncipe" },
];

import ProducerFields from "./specific/ProducerFields";
import ConsumerFields from "./specific/ConsumerFields";
import RestaurateurFields from "./specific/RestaurateurFields";
import TransporterFields from "./specific/TransporterFields";
import TransformerFields from "./specific/TransformerFields";
import ExporterFields from "./specific/ExporterFields";

const ProfileFormFields = ({
	user,
	editing,
	formData,
	verificationStatus,
	onInputChange,
	onCuisineTypeChange,
	onFormDataChange,
	safeDisplay,
}) => {
	const renderField = (
		label,
		name,
		icon,
		value,
		type = "text",
		options = null,
	) => (
		<div className="space-y-2 group/field">
			<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
				{label}
			</label>
			{editing ?
				<div className="relative">
					{icon && (
						<div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-emerald-500 transition-colors">
							{React.cloneElement(icon, { size: 16 })}
						</div>
					)}
					{options ?
						<div className="relative">
							<select
								name={name}
								value={formData[name] || ""}
								onChange={onInputChange}
								className="w-full bg-gray-50/50 pl-8 pr-8 p-2 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-inner"
							>
								<option value="">Sélectionner...</option>
								{options.map((opt) => (
									<option key={opt.code} value={opt.code}>
										{opt.name}
									</option>
								))}
							</select>
							<ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
						</div>
					:	<input
							type={type}
							name={name}
							value={formData[name] || ""}
							onChange={onInputChange}
							className={`w-full bg-gray-50/50 ${icon ? "pl-8" : "px-2"} p-2 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all placeholder-gray-300 shadow-inner`}
						/>
					}
				</div>
			:	<div className="bg-gray-50/30 p-2 rounded-2xl border border-gray-100/50 flex items-center justify-between">
					<div className="flex items-center gap-3">
						{icon && (
							<div className="text-emerald-600/50 group-hover/field:text-emerald-600 transition-colors">
								{React.cloneElement(icon, { size: 16 })}
							</div>
						)}
						<p className="text-sm font-bold text-gray-900 tracking-tight">
							{safeDisplay(value)}
						</p>
					</div>
				</div>
			}
		</div>
	);

	return (
		<div className="space-y-10">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{renderField("Prénom", "firstName", <User />, user.firstName)}
				{renderField("Nom", "lastName", <User />, user.lastName)}

				{(user?.userType === "transformer" ||
					user?.userType === "exporter" ||
					user?.userType === "transporter") &&
					renderField(
						"Nom de l'entreprise",
						"companyName",
						<Building2 />,
						user.companyName,
					)}

				{user?.userType === "producer" &&
					renderField(
						"Nom de la ferme",
						"farmName",
						<Building2 />,
						user.farmName,
					)}

				{user?.userType === "restaurateur" &&
					renderField(
						"Nom du restaurant",
						"restaurantName",
						<Building2 />,
						user.restaurantName,
					)}

				<div className="space-y-2 group/field">
					<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
						Email personnel / Pro
					</label>
					<div className="bg-gray-50/30 p-2 rounded-2xl border border-gray-100/50 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Mail className="h-4 w-4 text-emerald-600/50" />
							<p className="text-sm font-bold text-gray-900">
								{safeDisplay(user.email, "")}
							</p>
						</div>
						{verificationStatus?.email?.verified ?
							<CheckCircle2 className="h-4 w-4 text-emerald-500" />
						:	<AlertCircle className="h-4 w-4 text-rose-500" />}
					</div>
				</div>

				{renderField("Téléphone Mobile", "phone", <Phone />, user.phone, "tel")}
				{renderField(
					"Adresse de résidence",
					"address",
					<MapPin />,
					user.address,
				)}
				{renderField("Ville / Commune", "city", <MapPin />, user.city)}
				{renderField("Région / État", "region", <MapPin />, user.region)}
				{renderField(
					"Pays d'origine",
					"country",
					<Globe />,
					user.country,
					"select",
					COUNTRIES,
				)}
			</div>

			<div className="space-y-4">
				<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
					Biographie & Présentation
				</label>
				{editing ?
					<textarea
						name="bio"
						value={formData.bio || ""}
						onChange={onInputChange}
						rows={4}
						className="w-full bg-gray-50/50 px-2 py-2 border-2 border-transparent rounded-3xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all placeholder-gray-300 shadow-inner resize-none"
						placeholder="Partagez votre histoire, vos valeurs et votre passion..."
					/>
				:	<div className="bg-gray-50/30 p-2 rounded-3xl border border-gray-100/50">
						<p className="text-sm font-medium text-gray-600 leading-relaxed italic">
							{safeDisplay(
								user.bio,
								"Aucune biographie renseignée pour le moment. Cliquez sur modifier pour ajouter une présentation.",
							)}
						</p>
					</div>
				}
			</div>

			{/* Sub-fields Section with separator */}
			{user?.userType !== "consumer" && (
				<div className="h-[2px] bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>
			)}

			<div className="space-y-8">
				{user?.userType === "producer" && (
					<ProducerFields
						formData={editing ? formData : user}
						editing={editing}
						onInputChange={onInputChange}
						safeDisplay={safeDisplay}
					/>
				)}

				{user?.userType === "consumer" && (
					<ConsumerFields
						formData={editing ? formData : user}
						editing={editing}
						onInputChange={onInputChange}
					/>
				)}

				{user?.userType === "restaurateur" && (
					<RestaurateurFields
						formData={editing ? formData : user}
						editing={editing}
						onInputChange={onInputChange}
					/>
				)}

				{user?.userType === "transporter" && (
					<TransporterFields
						formData={editing ? formData : user}
						editing={editing}
						onInputChange={onInputChange}
					/>
				)}

				{user?.userType === "transformer" && (
					<TransformerFields
						formData={editing ? formData : user}
						editing={editing}
						onInputChange={onInputChange}
					/>
				)}

				{user?.userType === "exporter" && (
					<ExporterFields
						formData={editing ? formData : user}
						editing={editing}
						onInputChange={onInputChange}
					/>
				)}
			</div>
		</div>
	);
};

export default ProfileFormFields;
