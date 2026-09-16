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

// lang : code i18next courant ('fr'/'en'). Optionnel — par défaut fr, pour ne
// pas casser les appels existants qui ne passent pas encore la langue.
export const getCategoryLabel = (category, lang = "fr") => {
  const categories = CATEGORY_LABELS[lang] || CATEGORY_LABELS.fr;
  return categories[category] || category;
};

export const getSortOptions = (lang = "fr") => {
  const options = {
    fr: [
      { value: "newest", label: "Plus récents" },
      { value: "createdAt", label: "Plus anciens" },
      { value: "price", label: "Prix croissant" },
      { value: "-price", label: "Prix décroissant" },
      { value: "name", label: "Nom A-Z" },
      { value: "-name", label: "Nom Z-A" },
    ],
    en: [
      { value: "newest", label: "Newest" },
      { value: "createdAt", label: "Oldest" },
      { value: "price", label: "Price: Low to High" },
      { value: "-price", label: "Price: High to Low" },
      { value: "name", label: "Name A-Z" },
      { value: "-name", label: "Name Z-A" },
    ],
  };
  return options[lang] || options.fr;
};

