import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNotifications } from "../../../hooks/useNotifications";
import { restaurateurService } from "../../../services";
import { FiArrowLeft, FiSave, FiUpload, FiX } from "react-icons/fi";
import { CURRENCIES, DEFAULT_CURRENCY } from "../../../config/currencies";
import { UNITS, DEFAULT_UNIT } from "../../../config/units";
import { DISH_CATEGORIES, DISH_ALLERGENS } from "../../../utils/dishHelpers";
import {
	buildBilingualValue,
	getOtherLang,
} from "../../../utils/bilingualField";
import { deriveShortDescription } from "../../../utils/textHelpers";
import { useBilingualSourceLang } from "../../../hooks/useBilingualSourceLang";

// Champs saisis dans la langue de l'interface ; <champ>Alt = l'autre langue
const BILINGUAL_FIELDS = ["name", "description"];

const inputClass =
	"w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all";
const labelClass =
	"block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2";
const cardClass =
	"bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-white/60 shadow-sm p-5 md:p-6 space-y-5";
const sectionTitleClass = "text-base font-[900] text-gray-900 tracking-tight";

const AddDish = () => {
	const { t } = useTranslation(["dashboard-restaurateur", "dashboard-producer", "common"]);
	const navigate = useNavigate();
	const { showError, showSuccess } = useNotifications();
	const fileInputRef = useRef(null);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		nameAlt: "",
		descriptionAlt: "",
		price: "",
		currency: DEFAULT_CURRENCY,
		image: "",
		category: "plat",
		preparationTime: 30,
		allergens: [],
		stock: 10,
		unit: DEFAULT_UNIT,
	});
	const [sourceLang] = useBilingualSourceLang(setFormData, BILINGUAL_FIELDS);
	const otherLang = getOtherLang(sourceLang);

	const [loading, setLoading] = useState(false);
	const [imagePreview, setImagePreview] = useState("");

	const handleChange = (event) => {
		const { name, value, type } = event.target;
		setFormData((prev) => ({
			...prev,
			[name]:
				type === "number" ?
					value === "" ?
						""
					:	Number(value)
				:	value,
		}));
	};

	const handleAllergenToggle = (allergen) => {
		setFormData((prev) => ({
			...prev,
			allergens:
				prev.allergens.includes(allergen) ?
					prev.allergens.filter((item) => item !== allergen)
				:	[...prev.allergens, allergen],
		}));
	};

	const handleImageSelect = (event) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			showError(t("form.invalidImage"));
			return;
		}

		const reader = new FileReader();
		reader.onload = (loadEvent) => {
			const base64 = loadEvent.target?.result;
			if (typeof base64 === "string") {
				setFormData((prev) => ({
					...prev,
					image: base64,
				}));
				setImagePreview(base64);
			}
		};
		reader.readAsDataURL(file);
	};

	const removeImage = () => {
		setFormData((prev) => ({
			...prev,
			image: "",
		}));
		setImagePreview("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!formData.name.trim()) {
			showError(t("form.nameRequired"));
			return;
		}

		if (!formData.price || Number(formData.price) <= 0) {
			showError(t("form.priceRequired"));
			return;
		}

		const { nameAlt, descriptionAlt, ...fields } = formData;
		// Langue absente ou vide : traduite automatiquement par le backend
		const description =
			formData.description.trim() || descriptionAlt.trim() ?
				buildBilingualValue(formData.description, descriptionAlt, sourceLang)
			:	undefined;
		const payload = {
			...fields,
			name: buildBilingualValue(formData.name, nameAlt, sourceLang),
			description,
			...(description && {
				shortDescription: Object.fromEntries(
					Object.entries(description).map(([lang, text]) => [
						lang,
						deriveShortDescription(text, ""),
					]),
				),
			}),
			price: Number(formData.price),
			preparationTime: Number(formData.preparationTime) || 0,
			stock: Number(formData.stock) || 0,
		};

		try {
			setLoading(true);
			await restaurateurService.createDish(payload);
			showSuccess(t("form.created"));
			navigate("/restaurateur/dishes");
		} catch (error) {
			console.error("Erreur lors de la création du plat :", error);
			showError(error.response?.data?.message || t("form.createError"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="dashboard-page bg-harvests-light/20">
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] bg-amber-50/30 rounded-full blur-[120px]"></div>
			</div>

			<div className="dashboard-container space-y-6">
				<button
					onClick={() => navigate(-1)}
					className="group inline-flex items-center text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-orange-600 transition-colors"
				>
					<FiArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
					{t("form.back")}
				</button>

				<div className="animate-fade-in-down">
					<div className="flex items-center gap-2 text-orange-600 font-black text-[9px] uppercase tracking-widest mb-2">
						<div className="w-5 h-[2px] bg-orange-600"></div>
						<span>{t("form.addEyebrow")}</span>
					</div>
					<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
						{t("form.addTitleStart")}{" "}
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
							{t("form.addTitleHighlight")}
						</span>
					</h1>
					<p className="text-xs text-gray-500 font-medium max-w-xl">{t("form.addSubtitle")}</p>
				</div>

				<form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
					<div className="lg:col-span-2 space-y-6">
						{/* Informations du plat */}
						<div className={cardClass}>
							<h2 className={sectionTitleClass}>{t("form.infoSection")}</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className={labelClass}>{t("form.name")} *</label>
									<input
										type="text"
										name="name"
										lang={sourceLang}
										value={formData.name}
										onChange={handleChange}
										required
										className={inputClass}
									/>
								</div>
								<div>
									<label className={labelClass}>{t("form.category")}</label>
									<select
										name="category"
										value={formData.category}
										onChange={handleChange}
										className={inputClass}
									>
										{DISH_CATEGORIES.map((category) => (
											<option key={category} value={category}>
												{t(`dish.categories.${category}`)}
											</option>
										))}
									</select>
								</div>
							</div>
							<div>
								<label className={labelClass}>{t("form.description")}</label>
								<textarea
									name="description"
									lang={sourceLang}
									value={formData.description}
									onChange={handleChange}
									rows={4}
									className={inputClass}
								/>
							</div>

							{/* Retouche facultative dans l'autre langue (sinon traduction automatique côté backend) */}
							<div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
								<div>
									<p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
										{t(`dashboard-producer:products.form.otherLang.title.${otherLang}`)}
									</p>
									<p className="text-[10px] text-blue-600/80 font-medium mt-0.5">
										{t("dashboard-producer:products.form.otherLang.hint")}
									</p>
								</div>
								<div>
									<label className={labelClass}>
										{t(`dashboard-producer:products.form.otherLang.name.${otherLang}`)}
									</label>
									<input
										type="text"
										name="nameAlt"
										lang={otherLang}
										value={formData.nameAlt}
										onChange={handleChange}
										className={inputClass}
									/>
								</div>
								<div>
									<label className={labelClass}>
										{t(`dashboard-producer:products.form.otherLang.description.${otherLang}`)}
									</label>
									<textarea
										name="descriptionAlt"
										lang={otherLang}
										value={formData.descriptionAlt}
										onChange={handleChange}
										rows={2}
										placeholder={t("dashboard-producer:products.form.otherLang.descriptionPlaceholder")}
										className={inputClass}
									/>
								</div>
							</div>
						</div>

						{/* Photo et allergènes */}
						<div className={cardClass}>
							<h2 className={sectionTitleClass}>{t("form.mediaSection")}</h2>
							<div>
								<label className={labelClass}>{t("form.image")}</label>
								<div className="flex flex-col sm:flex-row sm:items-center gap-4">
									<label className="flex items-center justify-center px-4 py-4 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/40 transition-colors">
										<FiUpload className="h-5 w-5 text-gray-400 mr-2" />
										<span className="text-sm text-gray-600">{t("form.selectImage")}</span>
										<input
											ref={fileInputRef}
											type="file"
											accept="image/*"
											onChange={handleImageSelect}
											className="hidden"
										/>
									</label>
									{imagePreview && (
										<div className="relative">
											<img
												src={imagePreview}
												alt={t("form.imageAlt")}
												className="w-24 h-24 rounded-2xl object-cover border border-gray-100 shadow-sm"
											/>
											<button
												type="button"
												onClick={removeImage}
												title={t("form.removeImage")}
												aria-label={t("form.removeImage")}
												className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
											>
												<FiX className="h-3 w-3" />
											</button>
										</div>
									)}
								</div>
								<p className="mt-2 text-xs text-gray-500">{t("form.imageHint")}</p>
							</div>
							<div>
								<label className={labelClass}>{t("form.allergens")}</label>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
									{DISH_ALLERGENS.map((allergen) => {
										const checked = formData.allergens.includes(allergen);
										return (
											<label
												key={allergen}
												className={`flex items-center px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
													checked ?
														"bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200"
													:	"bg-gray-50 border-gray-100 text-gray-600 hover:border-orange-200"
												}`}
											>
												<input
													type="checkbox"
													checked={checked}
													onChange={() => handleAllergenToggle(allergen)}
													className="sr-only"
												/>
												{t(`dish.allergens.${allergen}`)}
											</label>
										);
									})}
								</div>
							</div>
						</div>
					</div>

					{/* Prix et disponibilité */}
					<div className="space-y-6">
						<div className={cardClass}>
							<h2 className={sectionTitleClass}>{t("form.priceSection")}</h2>
							<div className="grid grid-cols-3 gap-3">
								<div className="col-span-2">
									<label className={labelClass}>{t("form.price")} *</label>
									<input
										type="number"
										name="price"
										min="0"
										value={formData.price}
										onChange={handleChange}
										required
										className={inputClass}
									/>
								</div>
								<div>
									<label className={labelClass}>{t("form.currency")}</label>
									<select
										name="currency"
										value={formData.currency}
										onChange={handleChange}
										className={inputClass}
									>
										{CURRENCIES.map((currency) => (
											<option key={currency.code} value={currency.code}>
												{currency.code}
											</option>
										))}
									</select>
								</div>
							</div>
							<div>
								<label className={labelClass}>{t("form.preparationTime")}</label>
								<input
									type="number"
									name="preparationTime"
									min="0"
									value={formData.preparationTime}
									onChange={handleChange}
									className={inputClass}
								/>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className={labelClass}>{t("form.stock")}</label>
									<input
										type="number"
										name="stock"
										min="0"
										value={formData.stock}
										onChange={handleChange}
										className={inputClass}
									/>
								</div>
								<div>
									<label className={labelClass}>{t("form.unit")}</label>
									<select
										name="unit"
										value={formData.unit}
										onChange={handleChange}
										className={inputClass}
									>
										{UNITS.map((unit) => (
											<option key={unit.value} value={unit.value}>
												{t(`common:units.${unit.key}`)}
											</option>
										))}
									</select>
								</div>
							</div>
							<p className="text-xs text-gray-500">{t("form.stockHint")}</p>
						</div>

						<div className="flex flex-col gap-3">
							<button
								type="submit"
								disabled={loading}
								className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-gray-900 hover:bg-orange-600 transition-all shadow-sm disabled:opacity-50"
							>
								<FiSave className="h-4 w-4 mr-2" />
								{loading ? t("form.saving") : t("form.save")}
							</button>
							<button
								type="button"
								onClick={() => navigate("/restaurateur/dishes")}
								className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-600 hover:text-gray-900 hover:bg-white/70 transition-colors"
							>
								{t("form.cancel")}
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddDish;
