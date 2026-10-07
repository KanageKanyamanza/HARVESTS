import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDishImageUrl } from "../../utils/dishImageUtils";
import { DISH_CATEGORIES, DISH_ALLERGENS, getDishInfo } from "../../utils/dishHelpers";
import { deriveShortDescription } from "../../utils/textHelpers";
import {
	buildBilingualValue,
	getLocalizedValue,
	getOtherLang,
	getSourceLang,
	getStaleLang,
} from "../../utils/bilingualField";
import { useBilingualSourceLang } from "../../hooks/useBilingualSourceLang";
import { UNITS, DEFAULT_UNIT } from "../../config/units";
import { CURRENCIES, DEFAULT_CURRENCY } from "../../config/currencies";

// Champs bilingues : le champ principal est dans la langue « source »,
// <champ>Alt dans l'autre langue (voir utils/bilingualField.js)
const BILINGUAL_FIELDS = ["name", "description"];

const inputClass =
	"w-full px-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all";

// Jour 53 : textes du plat lus langue par langue (getLocalizedValue), jamais
// via toPlainText qui suit la langue de l'interface : sinon un nom anglais
// était renvoyé comme texte français à l'enregistrement.
const readTexts = (dish) => ({
	name: {
		fr: getLocalizedValue(dish?.name, "fr"),
		en: getLocalizedValue(dish?.name, "en"),
	},
	description: {
		fr: getLocalizedValue(dish?.description, "fr"),
		en: getLocalizedValue(dish?.description, "en"),
	},
});

// Langue des champs principaux : celle de l'interface, sauf si le plat n'a
// encore aucun nom dans cette langue (on garde alors celle qui en a un)
const pickSourceLang = (texts, uiLang) =>
	texts.name[uiLang] || !texts.name[getOtherLang(uiLang)] ? uiLang : getOtherLang(uiLang);

const DishForm = ({ dish, onSubmit, onCancel, loading }) => {
	const { t, i18n } = useTranslation(["dashboard-restaurateur", "dashboard-producer", "common"]);
	const info = getDishInfo(dish);

	const [originalTexts] = useState(() => readTexts(dish));
	const [initialLang] = useState(() =>
		pickSourceLang(originalTexts, getSourceLang(i18n.language)),
	);
	const editRoles = useRef({});

	const [formData, setFormData] = useState(() => {
		const alt = getOtherLang(initialLang);
		return {
			name: originalTexts.name[initialLang],
			description: originalTexts.description[initialLang],
			nameAlt: originalTexts.name[alt],
			descriptionAlt: originalTexts.description[alt],
			price: dish?.price || "",
			image: getDishImageUrl(dish) || "",
			category: info.category,
			preparationTime: info.preparationTime ?? 30,
			allergens: info.allergens,
			stock: dish?.inventory?.quantity ?? dish?.stock ?? 10,
			unit: dish?.unit || DEFAULT_UNIT,
			currency: dish?.currency || DEFAULT_CURRENCY,
		};
	});
	const [sourceLang, setSourceLang] = useBilingualSourceLang(
		setFormData,
		BILINGUAL_FIELDS,
	);
	const otherLang = getOtherLang(sourceLang);

	// Aligne la langue source sur celle choisie au chargement du plat
	useEffect(() => {
		setSourceLang(initialLang);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));

		// Rôle de la langue modifiée (voir getStaleLang) : texte principal =
		// "source", bloc de l'autre langue = "retouche"
		const field = name.replace(/Alt$/, "");
		if (BILINGUAL_FIELDS.includes(field)) {
			const isAlt = name !== field;
			const lang = isAlt ? otherLang : sourceLang;
			const roles = (editRoles.current[field] ||= {});
			if (!isAlt) roles[lang] = "source";
			else if (!roles[lang]) roles[lang] = "retouch";
		}
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) =>
				setFormData((prev) => ({ ...prev, image: e.target.result }));
			reader.readAsDataURL(file);
		}
	};

	const handleAllergenChange = (allergen) => {
		setFormData((prev) => ({
			...prev,
			allergens: prev.allergens.includes(allergen)
				? prev.allergens.filter((a) => a !== allergen)
				: [...prev.allergens, allergen],
		}));
	};

	const bilingual = (field) => {
		const current = {
			[sourceLang]: formData[field],
			[otherLang]: formData[`${field}Alt`],
		};
		return buildBilingualValue(
			formData[field],
			formData[`${field}Alt`],
			sourceLang,
			getStaleLang(current, originalTexts[field], editRoles.current[field]),
		);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const { nameAlt: _nameAlt, descriptionAlt, ...fields } = formData;
		const description =
			formData.description.trim() || descriptionAlt.trim() ?
				bilingual("description")
			:	undefined;
		onSubmit({
			...fields,
			name: bilingual("name"),
			...(description && {
				description,
				// Mêmes langues que la description : celle qui manque est
				// traduite par le backend
				shortDescription: Object.fromEntries(
					Object.entries(description).map(([lang, text]) => [
						lang,
						deriveShortDescription(text, ""),
					]),
				),
			}),
		});
	};

	return (
		<div className="p-6 md:p-8">
			<div className="flex items-center gap-2 text-orange-600 font-black text-[9px] uppercase tracking-widest mb-2">
				<div className="w-5 h-[2px] bg-orange-600"></div>
				<span>{t("dishes.eyebrow")}</span>
			</div>
			<h4 className="text-2xl font-[1000] text-gray-900 tracking-tighter mb-1">{t("form.editTitle")}</h4>
			<p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-6">
				{t("form.reviewNotice")}
			</p>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">
							{t("form.name")} *
						</label>
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
						<label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">
							{t("form.category")}
						</label>
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
					<label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">
						{t("form.description")}
					</label>
					<textarea
						name="description"
						lang={sourceLang}
						value={formData.description}
						onChange={handleChange}
						rows={3}
						className={inputClass}
					/>
				</div>

				{/* Retouche de l'autre langue (sinon retraduite automatiquement) */}
				<div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
					<div>
						<p className="text-sm font-semibold text-blue-800">
							{t(`dashboard-producer:products.form.otherLang.title.${otherLang}`)}
						</p>
						<p className="text-xs text-blue-700/80 mt-0.5">
							{t("dashboard-producer:products.form.otherLang.editHint")}
						</p>
					</div>
					<div>
						<label className="block text-xs font-medium text-gray-600 mb-1">
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
						<label className="block text-xs font-medium text-gray-600 mb-1">
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

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">
							{t("form.price")} *
						</label>
						<div className="flex gap-2">
							<input
								type="number"
								name="price"
								value={formData.price}
								onChange={handleChange}
								required
								min="0"
								className={inputClass}
							/>
							<select
								name="currency"
								value={formData.currency}
								onChange={handleChange}
								aria-label={t("form.currency")}
								className="w-28 px-3 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
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
						<label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">
							{t("form.preparationTime")}
						</label>
						<input
							type="number"
							name="preparationTime"
							value={formData.preparationTime}
							onChange={handleChange}
							min="0"
							className={inputClass}
						/>
					</div>
					<div>
						<label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">
							{t("form.stock")}
						</label>
						<input
							type="number"
							name="stock"
							value={formData.stock}
							onChange={handleChange}
							min="0"
							className={inputClass}
							placeholder="10"
						/>
					</div>
					<div>
						<label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">
							{t("form.unit")}
						</label>
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

				<div>
					<label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">
						{t("form.image")}
					</label>
					<input
						type="file"
						name="image"
						accept="image/*"
						onChange={handleImageChange}
						className={inputClass}
					/>
					{formData.image && (
						<div className="mt-2">
							<img
								src={formData.image}
								alt={t("form.imageAlt")}
								className="w-20 h-20 object-cover rounded-xl border border-gray-100"
							/>
						</div>
					)}
				</div>

				<div>
					<label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">
						{t("form.allergens")}
					</label>
					<div className="grid grid-cols-3 md:grid-cols-4 gap-2">
						{DISH_ALLERGENS.map((allergen) => (
							<label key={allergen} className="flex items-center text-sm">
								<input
									type="checkbox"
									checked={formData.allergens.includes(allergen)}
									onChange={() => handleAllergenChange(allergen)}
									className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
								/>
								<span className="ml-2 text-xs text-gray-700">
									{t(`dish.allergens.${allergen}`)}
								</span>
							</label>
						))}
					</div>
				</div>

				<div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
					<button
						type="button"
						onClick={onCancel}
						className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
					>
						{t("form.cancel")}
					</button>
					<button
						type="submit"
						disabled={loading}
						className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-gray-900 hover:bg-orange-600 transition-colors disabled:opacity-50"
					>
						{loading ? t("form.saving") : t("form.saveChanges")}
					</button>
				</div>
			</form>
		</div>
	);
};

export default DishForm;
