/**
 * Utilitaires pour les produits
 */

export const getCategoryLabel = (category) => {
  const categories = {
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
  };
  return categories[category] || category;
};

export const getSortOptions = () => [
  { value: "newest", label: "Plus récents" },
  { value: "createdAt", label: "Plus anciens" },
  { value: "price", label: "Prix croissant" },
  { value: "-price", label: "Prix décroissant" },
  { value: "name", label: "Nom A-Z" },
  { value: "-name", label: "Nom Z-A" },
];

