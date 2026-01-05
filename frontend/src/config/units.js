export const UNITS = [
	{ value: "kg", label: "Kilogrammes (kg)" },
	{ value: "g", label: "Grammes (g)" },
	{ value: "L", label: "Litre (L)" },
	{ value: "ml", label: "Millilitre (ml)" },
	{ value: "pièces", label: "Pièces" },
	{ value: "sachet", label: "Sachet" },
	{ value: "bunch", label: "Botte/Bouquet" },
	{ value: "bag", label: "Sac" },
	{ value: "box", label: "Caisse/Boîte" },
	{ value: "tonnes", label: "Tonnes" },
	{ value: "unit", label: "Unité" },
	{ value: "portion", label: "Portion" },
	{ value: "plat", label: "Plat" },
];

export const DEFAULT_UNIT = "unit";

export const getUnitLabel = (unitValue) => {
	const unit = UNITS.find((u) => u.value === unitValue);
	return unit ? unit.label : unitValue;
};
