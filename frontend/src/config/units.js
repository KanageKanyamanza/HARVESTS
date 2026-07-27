export const UNITS = [
	{ value: "kg", label: "Kilogrammes (kg)" },
	{ value: "g", label: "Grammes (g)" },
	{ value: "L", label: "Litres (L)" },
	{ value: "ml", label: "Millilitres (ml)" },
	{ value: "sac", label: "Sac" },
	{ value: "carton", label: "Carton" },
	{ value: "caisse", label: "Caisse" },
	{ value: "sachet", label: "Sachet" },
	{ value: "botte", label: "Botte / Bouquet" },
	{ value: "panier", label: "Panier" },
	{ value: "pièce", label: "Pièce" },
	{ value: "tonne", label: "Tonne" },
	{ value: "unité", label: "Unité" },
	{ value: "portion", label: "Portion" },
	{ value: "plat", label: "Plat" },
];

export const DEFAULT_UNIT = "unité";

export const getUnitLabel = (unitValue) => {
	const normalized = unitValue === "unit" ? "unité" : unitValue;
	const unit = UNITS.find((u) => u.value === normalized);
	return unit ? unit.label : normalized;
};
