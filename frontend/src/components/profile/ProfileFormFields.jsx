import React from "react";
import {
	FiUser,
	FiMail,
	FiPhone,
	FiMapPin,
	FiCheckCircle,
	FiAlertCircle,
} from "react-icons/fi";

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

const inputClass =
	"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

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
		options = null
	) => (
		<div>
			<label className="block text-sm font-medium text-gray-700 mb-2">
				{icon && React.cloneElement(icon, { className: "inline mr-1" })}
				{label}
			</label>
			{editing ? (
				options ? (
					<select
						name={name}
						value={formData[name] || ""}
						onChange={onInputChange}
						className={inputClass}
					>
						<option value="">Sélectionner...</option>
						{options.map((opt) => (
							<option key={opt.code} value={opt.code}>
								{opt.name}
							</option>
						))}
					</select>
				) : (
					<input
						type={type}
						name={name}
						value={formData[name] || ""}
						onChange={onInputChange}
						className={inputClass}
					/>
				)
			) : (
				<p className="text-gray-900">{safeDisplay(value)}</p>
			)}
		</div>
	);

	return (
		<div className="bg-white rounded-lg shadow">
			<div className="p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-6">
					Informations personnelles & Contact
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{renderField("Prénom", "firstName", <FiUser />, user.firstName)}
					{renderField("Nom", "lastName", <FiUser />, user.lastName)}

					{(user?.userType === "transformer" ||
						user?.userType === "exporter" ||
						user?.userType === "transporter") &&
						renderField(
							"Nom de l'entreprise",
							"companyName",
							<FiUser />,
							user.companyName
						)}

					{user?.userType === "producer" &&
						renderField(
							"Nom de la ferme",
							"farmName",
							<FiUser />,
							user.farmName
						)}

					{user?.userType === "restaurateur" &&
						renderField(
							"Nom du restaurant",
							"restaurantName",
							<FiUser />,
							user.restaurantName
						)}

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							<FiMail className="inline mr-1" />
							Email
						</label>
						<div className="flex items-center">
							<p className="text-gray-900">{safeDisplay(user.email, "")}</p>
							{verificationStatus?.email?.verified ? (
								<FiCheckCircle className="ml-2 text-green-500" />
							) : (
								<FiAlertCircle className="ml-2 text-red-500" />
							)}
						</div>
					</div>

					{renderField("Téléphone", "phone", <FiPhone />, user.phone, "tel")}
					{renderField("Adresse", "address", <FiMapPin />, user.address)}
					{renderField("Ville", "city", <FiMapPin />, user.city)}
					{renderField("Région", "region", <FiMapPin />, user.region)}
					{renderField(
						"Pays",
						"country",
						<FiMapPin />,
						user.country,
						"select",
						COUNTRIES
					)}
				</div>

				<div className="mt-6">
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Biographie
					</label>
					{editing ? (
						<textarea
							name="bio"
							value={formData.bio || ""}
							onChange={onInputChange}
							rows={3}
							className={inputClass}
							placeholder="Parlez-nous de vous..."
						/>
					) : (
						<p className="text-gray-900">
							{safeDisplay(user.bio, "Aucune biographie renseignée")}
						</p>
					)}
				</div>

				{/* Specific Fields Section */}
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
