// order_id des payouts AfriBaPay (Jour 81). Doc AfriBaPay : un order_id ne doit
// JAMAIS être réutilisé, même après un échec — le premier envoi garde
// l'identifiant de base (`payout-<id>`), chaque relance reçoit le sien
// (`payout-<id>-r2`, `-r3`…). Le retry réseau d'un MÊME envoi garde
// volontairement le même order_id : c'est ce qui permet à AfriBaPay de
// dédupliquer et d'éviter un double paiement.
// Aucune connexion Mongo : fonctions pures.
const {
	payoutOrderIdFor,
	payoutReferenceFor,
	payoutAttemptNumber,
	allPayoutOrderIdsFor,
	payoutOrderIdBelongsTo,
	isSupersededPayoutOrderId,
} = require("../utils/payoutOrderId");

const ID = "682f1a2b3c4d5e6f7a8b9c0d";
const OTHER = "682f1a2b3c4d5e6f7a8b9c0e";

describe("Jour 81 — order_id des payouts (utils/payoutOrderId)", () => {
	test("OID-1 premier essai : payout-<id>, identique à la référence", () => {
		expect(payoutOrderIdFor(ID, 1)).toBe(`payout-${ID}`);
		expect(payoutOrderIdFor(ID)).toBe(`payout-${ID}`);
		expect(payoutReferenceFor(ID)).toBe(`payout-${ID}`);
		expect(payoutOrderIdFor(ID, 1)).toBe(payoutReferenceFor(ID));
	});

	test("OID-2 relances -r2, -r3, -r4 : toutes distinctes, aucune réutilisation", () => {
		const first = payoutOrderIdFor(ID, 1);
		const second = payoutOrderIdFor(ID, 2);
		const third = payoutOrderIdFor(ID, 3);
		const fourth = payoutOrderIdFor(ID, 4);
		expect(second).toBe(`payout-${ID}-r2`);
		expect(third).toBe(`payout-${ID}-r3`);
		expect(fourth).toBe(`payout-${ID}-r4`);
		const all = [first, second, third, fourth];
		expect(new Set(all).size).toBe(all.length);
	});

	test("OID-3 numéro de tentative porté par l'order_id", () => {
		expect(payoutAttemptNumber(`payout-${ID}`)).toBe(1);
		expect(payoutAttemptNumber(`payout-${ID}-r2`)).toBe(2);
		expect(payoutAttemptNumber(`payout-${ID}-r10`)).toBe(10);
		expect(payoutAttemptNumber("")).toBe(1);
	});

	test("OID-4 tous les order_ids couverts : plafond 20, plancher 1", () => {
		expect(allPayoutOrderIdsFor(ID, 3)).toEqual([
			`payout-${ID}`,
			`payout-${ID}-r2`,
			`payout-${ID}-r3`,
		]);

		const capped = allPayoutOrderIdsFor(ID, 99);
		expect(capped).toHaveLength(20);
		expect(capped[0]).toBe(`payout-${ID}`);
		expect(capped[19]).toBe(`payout-${ID}-r20`);

		expect(allPayoutOrderIdsFor(ID)).toEqual([`payout-${ID}`]);
		expect(allPayoutOrderIdsFor(ID, 0)).toEqual([`payout-${ID}`]);
	});

	test("OID-5 appartenance d'un order_id à un payout (webhook J82)", () => {
		expect(payoutOrderIdBelongsTo(`payout-${ID}-r2`, ID)).toBe(true);
		expect(payoutOrderIdBelongsTo(`payout-${ID}`, ID)).toBe(true);
		expect(payoutOrderIdBelongsTo(`payout-${ID}-r2`, OTHER)).toBe(false);
		expect(payoutOrderIdBelongsTo("", ID)).toBe(false);
		expect(payoutOrderIdBelongsTo(null, ID)).toBe(false);
	});

	test("OID-6 order_id dépassé par rapport à une référence (webhook J82)", () => {
		expect(
			isSupersededPayoutOrderId(`payout-${ID}-r1`, { confirmedOrderId: `payout-${ID}` }),
		).toBe(true);
		expect(isSupersededPayoutOrderId(`payout-${ID}-r2`, { lastAttempt: 3 })).toBe(true);
		// Non dépassés : l'essai confirmé lui-même, ou le dernier essai connu.
		expect(
			isSupersededPayoutOrderId(`payout-${ID}`, { confirmedOrderId: `payout-${ID}` }),
		).toBe(false);
		expect(isSupersededPayoutOrderId(`payout-${ID}-r3`, { lastAttempt: 3 })).toBe(false);
	});
});