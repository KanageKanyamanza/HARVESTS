// Tests du catalogue d'opérateurs mobile money (Jour 79) : la table par pays
// est la seule source de la liste proposée au checkout, et le nom affiché doit
// rester la source du code envoyé à AfriBaPay (utils/afribapayOperator.js).
const {
	COUNTRIES,
	normalizeCountry,
	listOperatorsForCountry,
	operatorLabel,
} = require("../config/afribapayOperators");
const { toAfribapayOperator } = require("../utils/afribapayOperator");

describe("Catalogue opérateurs AfriBaPay", () => {
	it("propose les quatre opérateurs sénégalais avec leurs codes AfriBaPay", () => {
		const result = listOperatorsForCountry("SN");

		expect(result.country).toBe("SN");
		expect(result.phoneCode).toBe("+221");
		expect(result.phoneLength).toBe(9);
		expect(result.operators.map((o) => o.name)).toEqual([
			"Wave",
			"Orange Money",
			"Free Money",
			"E-money",
		]);
		expect(result.operators.map((o) => o.code)).toEqual([
			"wave",
			"orange",
			"free",
			"emoney",
		]);
	});

	it("accepte un code pays en minuscules et avec espaces", () => {
		expect(normalizeCountry(" ci ")).toBe("CI");
		expect(listOperatorsForCountry("ci").operators.length).toBe(4);
	});

	it("renvoie une liste vide (et non le Sénégal) pour un pays non couvert", () => {
		const result = listOperatorsForCountry("GH");

		expect(result.country).toBe("GH");
		expect(result.phoneCode).toBeNull();
		expect(result.operators).toEqual([]);
	});

	it("ne produit aucun code vide : chaque nom est mappé par toAfribapayOperator", () => {
		for (const entry of Object.values(COUNTRIES)) {
			for (const name of entry.operators) {
				expect(toAfribapayOperator(name)).toBeTruthy();
			}
		}
	});

	it("réaffiche un nom lisible à partir du code stocké sur le Payment", () => {
		expect(operatorLabel("mpesa")).toBe("M-Pesa");
		expect(operatorLabel("orange")).toBe("Orange Money");
		expect(operatorLabel("wligdicash")).toBe("Wallet LigdiCash");
		// Code inconnu : on ne perd pas l'information, on l'affiche brut.
		expect(operatorLabel("inconnu")).toBe("inconnu");
		expect(operatorLabel(undefined)).toBe("");
	});
});
