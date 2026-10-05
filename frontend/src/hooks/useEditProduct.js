import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { producerService } from "../services";
import { toPlainText, deriveShortDescription } from "../utils/textHelpers";
import {
	buildBilingualValue,
	getLocalizedValue,
	getOtherLang,
	getSourceLang,
	getStaleLang,
} from "../utils/bilingualField";
import { DEFAULT_CURRENCY } from "../config/currencies";
import { useBilingualSourceLang } from "./useBilingualSourceLang";

const BILINGUAL_FIELDS = ["name", "description"];

/**
 * Hook personnalisé pour gérer l'édition d'un produit
 *
 * Jour 48 (bascule bilingue) : les champs principaux nom/description sont
 * dans la langue de l'interface, les champs *Alt dans l'autre langue, chacun
 * lu explicitement (toPlainText mélangeait les langues et enregistrait un
 * texte anglais comme `fr`). Les erreurs de validation sont des clés du
 * namespace dashboard-producer, traduites à l'affichage.
 */
// Jour 51 : paramétrable pour être partagé par le producteur et le
// transformateur (useEditProductTransformer), qui avait une copie divergente
// sans les corrections du Jour 48.
export const useEditProduct = ({
	service = producerService,
	listPath = "/producer/products",
	defaultUnit = "kg",
} = {}) => {
	const { t, i18n } = useTranslation("dashboard-producer");
	const { id } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [errors, setErrors] = useState({});
	const [uploadingImages, setUploadingImages] = useState(false);
	const [productImages, setProductImages] = useState([]);
	const [product, setProduct] = useState(null);
	// Textes fr/en tels que chargés, pour détecter une traduction devenue
	// obsolète
	const [originalTexts, setOriginalTexts] = useState(null);
	// Pour chaque champ bilingue, rôle dans lequel chaque langue a été
	// modifiée : { name: { fr: "source", en: "retouch" }, ... }
	const editRoles = useRef({});

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		nameAlt: "",
		descriptionAlt: "",
		price: "",
		stock: "",
		category: "",
		unit: defaultUnit,
		currency: DEFAULT_CURRENCY,
		status: "draft",
		flashSaleIsActive: false,
		flashSaleDiscount: "",
		flashSaleEndDate: "",
	});
	// Langue des champs principaux (name/description) ; nameAlt/descriptionAlt
	// contiennent l'autre langue, échangés sur place au changement de langue
	const [sourceLang, setSourceLang] = useBilingualSourceLang(
		setFormData,
		BILINGUAL_FIELDS,
	);

	// Charger le produit à modifier
	useEffect(() => {
		const loadProduct = async () => {
			try {
				setLoading(true);
				const response = await service.getProduct(id);
				const productData =
					response.data.data?.product || response.data.product || response.data;

				if (productData) {
					const formattedProduct = {
						...productData,
						name: toPlainText(productData.name, ""),
						description: toPlainText(productData.description, ""),
						shortDescription: toPlainText(productData.shortDescription, ""),
					};

					setProduct(formattedProduct);

					const texts = {
						name: {
							fr: getLocalizedValue(productData.name, "fr"),
							en: getLocalizedValue(productData.name, "en"),
						},
						description: {
							fr: getLocalizedValue(productData.description, "fr"),
							en: getLocalizedValue(productData.description, "en"),
						},
					};
					setOriginalTexts(texts);
					editRoles.current = {};

					// Langue des champs principaux : celle de l'interface, sauf si le
					// produit n'a pas encore de texte dans cette langue (on garde
					// alors celle qui en a, plutôt qu'un champ principal vide)
					const uiLang = getSourceLang(i18n.language);
					const lang =
						texts.name[uiLang] || !texts.name[getOtherLang(uiLang)] ?
							uiLang
						:	getOtherLang(uiLang);
					const alt = getOtherLang(lang);
					setSourceLang(lang);

					setFormData({
						name: texts.name[lang],
						description: texts.description[lang],
						nameAlt: texts.name[alt],
						descriptionAlt: texts.description[alt],
						price: formattedProduct.price || "",
						stock:
							formattedProduct.inventory?.quantity ||
							formattedProduct.stock ||
							"",
						category: formattedProduct.category || "",
						unit: formattedProduct.unit || defaultUnit,
						currency: formattedProduct.currency || DEFAULT_CURRENCY,
						status: formattedProduct.status || "draft",
						flashSaleIsActive: formattedProduct.flashSale?.isActive || false,
						flashSaleDiscount: formattedProduct.flashSale?.discountPercentage || "",
						flashSaleEndDate: formattedProduct.flashSale?.endDate ? new Date(formattedProduct.flashSale.endDate).toISOString().split('T')[0] : "",
					});

					if (productData.images && productData.images.length > 0) {
						const formattedImages = productData.images.map((img, index) => ({
							url: img.url,
							alt: img.alt || `Image ${index + 1}`,
							isPrimary: img.isPrimary || index === 0,
							order: index,
						}));
						setProductImages(formattedImages);
					} else {
						setProductImages([]);
					}
				}
			} catch (error) {
				console.error("Erreur lors du chargement du produit:", error);
				setErrors({ submit: t("products.form.loadError") });
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			loadProduct();
		}
		// Pas de `t` en dépendance : un changement de langue rechargerait le
		// produit et effacerait les modifications en cours
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;
		const val = type === "checkbox" ? checked : value;
		setFormData((prev) => ({ ...prev, [name]: val }));

		// Rôle de la langue modifiée, mémorisé à la saisie (voir getStaleLang) :
		// texte principal = "source", bloc de l'autre langue = "retouche".
		// Un rôle "source" n'est jamais rétrogradé en "retouche".
		const field = name.replace(/Alt$/, "");
		if (BILINGUAL_FIELDS.includes(field)) {
			const isAlt = name !== field;
			const lang = isAlt ? getOtherLang(sourceLang) : sourceLang;
			const roles = (editRoles.current[field] ||= {});
			if (!isAlt) roles[lang] = "source";
			else if (!roles[lang]) roles[lang] = "retouch";
		}
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const handleImageAdd = async (newImageUrl) => {
		if (newImageUrl) {
			setProductImages((prev) => [
				...prev,
				{
					url: newImageUrl,
					alt: `Image ${prev.length + 1}`,
					isPrimary: prev.length === 0,
					order: prev.length,
				},
			]);
		}
	};

	const handleImageRemove = (index) => {
		const newImages = productImages.filter((_, i) => i !== index);
		const updatedImages = newImages.map((img, i) => ({
			...img,
			order: i,
			isPrimary: i === 0,
		}));
		setProductImages(updatedImages);
	};

	const handleImageReorder = (fromIndex, toIndex) => {
		const newImages = [...productImages];
		const [removed] = newImages.splice(fromIndex, 1);
		newImages.splice(toIndex, 0, removed);

		const updatedImages = newImages.map((img, index) => ({
			...img,
			order: index,
			isPrimary: index === 0,
		}));

		setProductImages(updatedImages);
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = "products.validation.nameRequired";
		}

		if (!formData.description.trim()) {
			newErrors.description = "products.validation.descriptionRequired";
		}

		if (!formData.price || parseFloat(formData.price) <= 0) {
			newErrors.price = "products.validation.priceRequired";
		}

		if (!formData.stock || parseInt(formData.stock) < 0) {
			newErrors.stock = "products.validation.stockRequired";
		}

		if (!formData.category) {
			newErrors.category = "products.validation.categoryRequired";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) return;

		try {
			setSaving(true);

			const bilingual = (field) => {
				const other = getOtherLang(sourceLang);
				const current = {
					[sourceLang]: formData[field],
					[other]: formData[`${field}Alt`],
				};
				return buildBilingualValue(
					formData[field],
					formData[`${field}Alt`],
					sourceLang,
					getStaleLang(current, originalTexts?.[field], editRoles.current[field]),
				);
			};
			const description = bilingual("description");
			const productData = {
				name: bilingual("name"),
				description,
				// Mêmes langues que la description : celle qui manque est
				// traduite par le backend
				shortDescription: Object.fromEntries(
					Object.entries(description).map(([lang, text]) => [
						lang,
						deriveShortDescription(text, ""),
					]),
				),
				price: parseFloat(formData.price),
				category: formData.category,
				subcategory: formData.category,
				inventory: {
					quantity: parseInt(formData.stock),
				},
				status: formData.status || "draft",
				unit: formData.unit || "unité",
				currency: formData.currency || DEFAULT_CURRENCY,
				images: productImages,
				flashSale: {
					isActive: formData.flashSaleIsActive,
					discountPercentage: formData.flashSaleDiscount ? parseInt(formData.flashSaleDiscount) : 0,
					endDate: formData.flashSaleEndDate || null
				}
			};

			await service.updateProduct(id, productData);
			navigate(listPath);
		} catch (error) {
			console.error("Erreur lors de la modification du produit:", error);

			let errorMessage = t("products.form.updateError");

			if (error.response?.data?.message) {
				const serverMessage = error.response.data.message;

				if (
					serverMessage.includes("duplicate key error") &&
					serverMessage.includes("slug")
				) {
					errorMessage = t("products.form.duplicateName");
				} else if (serverMessage.includes("validation failed")) {
					errorMessage = t("products.form.validationError");
				} else {
					errorMessage = serverMessage;
				}
			}

			setErrors({ submit: errorMessage });
		} finally {
			setSaving(false);
		}
	};

	return {
		product,
		loading,
		saving,
		errors,
		formData,
		sourceLang,
		productImages,
		uploadingImages,
		setUploadingImages,
		handleInputChange,
		handleImageAdd,
		handleImageRemove,
		handleImageReorder,
		handleSubmit,
		navigate,
	};
};
