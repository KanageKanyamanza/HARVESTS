// Jour 53 : constantes et lecture des plats du restaurateur.
// Les libellés sont traduits par valeur (namespace dashboard-restaurateur,
// clés dish.categories.* et dish.allergens.*).

export const DISH_CATEGORIES = [
	"entree",
	"plat",
	"dessert",
	"boisson",
	"accompagnement",
];

export const DISH_ALLERGENS = [
	"gluten",
	"lactose",
	"nuts",
	"eggs",
	"soy",
	"fish",
	"shellfish",
	"sesame",
];

/**
 * Catégorie, temps de préparation et allergènes d'un plat. L'API les range
 * dans `dishInfo` ; les champs à plat restent lus en repli.
 */
export const getDishInfo = (dish) => ({
	category: dish?.dishInfo?.category || dish?.category || "plat",
	preparationTime: dish?.dishInfo?.preparationTime ?? dish?.preparationTime ?? null,
	allergens: dish?.dishInfo?.allergens || dish?.allergens || [],
});
