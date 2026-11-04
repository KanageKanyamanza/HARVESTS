import { uploadService } from "../services";

export const DISH_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** Clé de traduction de l'erreur (espace `form`), ou null si le fichier est acceptable. */
export const getDishImageError = (file) => {
	if (!ACCEPTED_TYPES.includes(file.type)) return "form.invalidImage";
	if (file.size > DISH_IMAGE_MAX_SIZE) return "form.imageTooLarge";
	return null;
};

/**
 * Envoie la photo d'un plat sur Cloudinary et renvoie son URL : le produit ne
 * stocke qu'un lien, jamais l'image en base64 (elle gonflerait le document
 * MongoDB et chaque réponse de liste).
 */
export const uploadDishImage = async (file) => {
	const formData = new FormData();
	formData.append("file", file);
	formData.append("folder", "harvests/dishes");

	const response = await uploadService.uploadToCloudinary(formData);
	const uploaded = response.data?.data || response.data;
	const url = uploaded?.secure_url || uploaded?.url;
	if (!url) throw new Error("missing_url");
	return url;
};
