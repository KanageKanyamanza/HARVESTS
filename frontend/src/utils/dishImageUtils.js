/**
 * Fonction utilitaire pour extraire l'URL d'image d'un plat de manière exhaustive
 * Basée sur la logique utilisée dans AdminDishes.jsx
 * 
 * @param {Object} dish - L'objet plat
 * @returns {string|null} - L'URL de l'image ou null si aucune image n'est trouvée
 */
export const getDishImageUrl = (dish) => {
  if (!dish) return null;

  // 1. Vérifier d'abord si dish.image existe directement
  if (dish.image) {
    if (typeof dish.image === 'string') {
      return dish.image;
    } else if (typeof dish.image === 'object' && dish.image !== null) {
      return dish.image.url || dish.image.src || dish.image.path || dish.image.secure_url || null;
    }
  }

  // 2. Vérifier si dish.images est un tableau non vide
  if (dish.images && Array.isArray(dish.images) && dish.images.length > 0) {
    const firstImage = dish.images[0];
    if (typeof firstImage === 'object' && firstImage !== null) {
      return firstImage.url || firstImage.src || firstImage.path || firstImage.secure_url || null;
    } else if (typeof firstImage === 'string') {
      return firstImage;
    }
  }

  // 3. Fallback sur primaryImage si pas d'image dans images
  if (dish.primaryImage) {
    if (typeof dish.primaryImage === 'object' && dish.primaryImage !== null) {
      return dish.primaryImage.url || dish.primaryImage.src || dish.primaryImage.secure_url || null;
    } else if (typeof dish.primaryImage === 'string') {
      return dish.primaryImage;
    }
  }

  return null;
};

/**
 * Normalise un plat pour s'assurer que l'image est accessible
 * Ajoute une propriété dish.image normalisée si elle n'existe pas
 * 
 * @param {Object} dish - L'objet plat à normaliser
 * @returns {Object} - Le plat normalisé avec dish.image défini
 */
export const normalizeDishImage = (dish) => {
  if (!dish) return dish;

  // Si dish.image n'existe pas déjà, l'extraire
  if (!dish.image) {
    dish.image = getDishImageUrl(dish);
  }

  return dish;
};

