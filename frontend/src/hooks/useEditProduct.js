import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { producerService } from "../services";
import { toPlainText, deriveShortDescription } from "../utils/textHelpers";

/**
 * Hook personnalisé pour gérer l'édition d'un produit
 */
export const useEditProduct = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [errors, setErrors] = useState({});
	const [uploadingImages, setUploadingImages] = useState(false);
	const [productImages, setProductImages] = useState([]);
	const [product, setProduct] = useState(null);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		price: "",
		stock: "",
		category: "",
		unit: "kg",
		status: "draft",
	});

	// Charger le produit à modifier
	useEffect(() => {
		const loadProduct = async () => {
			try {
				setLoading(true);
				const response = await producerService.getProduct(id);
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

					setFormData({
						name: formattedProduct.name,
						description: formattedProduct.description,
						price: formattedProduct.price || "",
						stock: formattedProduct.inventory?.quantity || "",
						category: formattedProduct.category || "",
						unit: formattedProduct.unit || "kg",
						status: formattedProduct.status || "draft",
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
				setErrors({ submit: "Erreur lors du chargement du produit" });
			} finally {
				setLoading(false);
			}
		};

		if (id) {
			loadProduct();
		}
	}, [id]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
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
			newErrors.name = "Le nom du produit est requis";
		}

		if (!formData.description.trim()) {
			newErrors.description = "La description est requise";
		}

		if (!formData.price || parseFloat(formData.price) <= 0) {
			newErrors.price = "Le prix est requis";
		}

		if (!formData.stock || parseInt(formData.stock) < 0) {
			newErrors.stock = "Le stock est requis";
		}

		if (!formData.category) {
			newErrors.category = "La catégorie est requise";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) return;

		try {
			setSaving(true);

			const productData = {
				name: toPlainText(formData.name, ""),
				description: toPlainText(formData.description, ""),
				shortDescription: deriveShortDescription(formData.description, ""),
				price: parseFloat(formData.price),
				category: formData.category,
				subcategory: formData.category,
				inventory: {
					quantity: parseInt(formData.stock),
				},
				status: formData.status || "draft",
				unit: formData.unit || "unité",
				images: productImages,
			};

			await producerService.updateProduct(id, productData);
			navigate("/producer/products");
		} catch (error) {
			console.error("Erreur lors de la modification du produit:", error);

			let errorMessage = "Erreur lors de la mise à jour du produit";

			if (error.response?.data?.message) {
				const serverMessage = error.response.data.message;

				if (
					serverMessage.includes("duplicate key error") &&
					serverMessage.includes("slug")
				) {
					errorMessage = "Un produit avec ce nom existe déjà";
				} else if (serverMessage.includes("validation failed")) {
					errorMessage = "Erreur de validation";
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
