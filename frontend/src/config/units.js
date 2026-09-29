// `value` est ce qui est stocké en base (ne pas modifier). `key` pointe vers
// common:units.<key> pour le libellé traduit (Jour 48 - bascule bilingue) ;
// `label` reste le libellé français pour les écrans pas encore migrés.
export const UNITS = [
	{ value: "kg", key: "kg", label: "Kilogrammes (kg)" },
	{ value: "g", key: "g", label: "Grammes (g)" },
	{ value: "L", key: "L", label: "Litres (L)" },
	{ value: "ml", key: "ml", label: "Millilitres (ml)" },
	{ value: "sac", key: "bag", label: "Sac" },
	{ value: "carton", key: "carton", label: "Carton" },
	{ value: "caisse", key: "crate", label: "Caisse" },
	{ value: "sachet", key: "sachet", label: "Sachet" },
	{ value: "botte", key: "bunch", label: "Botte / Bouquet" },
	{ value: "panier", key: "basket", label: "Panier" },
	{ value: "pièce", key: "piece", label: "Pièce" },
	{ value: "tonne", key: "tonne", label: "Tonne" },
	{ value: "unité", key: "unit", label: "Unité" },
	{ value: "portion", key: "portion", label: "Portion" },
	{ value: "plat", key: "dish", label: "Plat" },
];

export const DEFAULT_UNIT = "unité";

export const getUnitLabel = (unitValue) => {
	const normalized = unitValue === "unit" ? "unité" : unitValue;
	const unit = UNITS.find((u) => u.value === normalized);
	return unit ? unit.label : normalized;
};
