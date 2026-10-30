/**
 * Utilitaires pour les produits
 */

const CATEGORY_LABELS = {
  fr: {
    cereals: "Céréales",
    vegetables: "Légumes",
    fruits: "Fruits",
    legumes: "Légumineuses",
    tubers: "Tubercules",
    spices: "Épices",
    herbs: "Herbes",
    grains: "Grains",
    nuts: "Noix",
    seeds: "Graines",
    dairy: "Produits laitiers",
    meat: "Viande",
    poultry: "Volaille",
    fish: "Poisson",
    "processed-foods": "Aliments transformés",
    beverages: "Boissons",
    other: "Autres",
  },
  en: {
    cereals: "Grains",
    vegetables: "Vegetables",
    fruits: "Fruits",
    legumes: "Legumes",
    tubers: "Tubers",
    spices: "Spices",
    herbs: "Herbs",
    grains: "Grains",
    nuts: "Nuts",
    seeds: "Seeds",
    dairy: "Dairy",
    meat: "Meat",
    poultry: "Poultry",
    fish: "Fish",
    "processed-foods": "Processed foods",
    beverages: "Beverages",
    other: "Other",
  },
};

// Catégories proposées dans les formulaires produit vendeur, dans l'ordre
// d'affichage (libellé via getCategoryLabel). "grains" reste lisible pour les
// produits existants mais n'est pas proposé à la création (doublon de cereals).
export const PRODUCT_FORM_CATEGORIES = [
  "cereals", "vegetables", "fruits", "legumes", "tubers", "spices", "herbs",
  "nuts", "seeds", "dairy", "meat", "poultry", "fish", "processed-foods",
  "beverages", "other",
];

// lang : code i18next courant ('fr'/'en'). Optionnel — par défaut fr, pour ne
// pas casser les appels existants qui ne passent pas encore la langue.
export const getCategoryLabel = (category, lang = "fr") => {
  const categories = CATEGORY_LABELS[lang] || CATEGORY_LABELS.fr;
  return categories[category] || category;
};
