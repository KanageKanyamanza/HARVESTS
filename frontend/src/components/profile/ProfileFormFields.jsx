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
import { useTranslation } from "react-i18next";
import { getCountryName } from "../../utils/i18n";

// Codes ISO des pays proposés ; le nom affiché suit la langue de l'interface
const COUNTRY_CODES = [
	"SN", "CM", "CI", "BF", "ML", "GN", "GM", "GW", "CV", "MR",
	"NE", "TD", "CF", "GQ", "GA", "CG", "CD", "AO", "ST",
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
	safeDisplay,
}) => {
	const { t, i18n } = useTranslation("profile");
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
								<option value="">{t("fields.select")}</option>
								{options.map((opt) => (
									<option key={opt} value={opt}>
										{getCountryName(opt, i18n.language)}
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
				{renderField(t("fields.firstName"), "firstName", <User />, user.firstName)}
				{renderField(t("fields.lastName"), "lastName", <User />, user.lastName)}

				{(user?.userType === "transformer" ||
					user?.userType === "exporter" ||
					user?.userType === "transporter") &&
					renderField(
						t("fields.companyName"),
						"companyName",
						<Building2 />,
						user.companyName,
					)}

				{user?.userType === "producer" &&
					renderField(
						t("fields.farmName"),
						"farmName",
						<Building2 />,
						user.farmName,
					)}

				{user?.userType === "restaurateur" &&
					renderField(
						t("fields.restaurantName"),
						"restaurantName",
						<Building2 />,
						user.restaurantName,
					)}

				<div className="space-y-2 group/field">
					<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
						{t("fields.email")}
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

				{renderField(t("fields.phone"), "phone", <Phone />, user.phone, "tel")}

				{user?.userType !== "consumer" && (
					<>
						{renderField(
							t("fields.address"),
							"address",
							<MapPin />,
							user.address,
						)}
						{renderField(t("fields.city"), "city", <MapPin />, user.city)}
						{renderField(t("fields.region"), "region", <MapPin />, user.region)}
					</>
				)}
				{renderField(
					t("fields.country"),
					"country",
					<Globe />,
					user.country && getCountryName(user.country, i18n.language),
					"select",
					COUNTRY_CODES,
				)}
			</div>

			{user?.userType === "consumer" && (
				<div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
					<Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
					<p className="text-xs text-gray-600 font-medium">
						{t("fields.addressInfoStart")}{" "}
						<span className="font-bold text-blue-700">
							{t("fields.addressInfoLink")}
						</span>
						{t("fields.addressInfoEnd")}
					</p>
				</div>
			)}

			<div className="space-y-4">
				<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
					{t("fields.bio")}
				</label>
				{editing ?
					<textarea
						name="bio"
						value={formData.bio || ""}
						onChange={onInputChange}
						rows={4}
						className="w-full bg-gray-50/50 px-2 py-2 border-2 border-transparent rounded-3xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all placeholder-gray-300 shadow-inner resize-none"
						placeholder={t("fields.bioPlaceholder")}
					/>
				:	<div className="bg-gray-50/30 p-2 rounded-3xl border border-gray-100/50">
						<p className="text-sm font-medium text-gray-600 leading-relaxed italic">
							{safeDisplay(
								user.bio,
								t("fields.bioEmpty"),
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
						onCuisineTypeChange={onCuisineTypeChange}
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
