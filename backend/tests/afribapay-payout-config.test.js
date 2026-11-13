// Réglages des reversements (Jour 81) : délai de garde livraison → payout et
// taux de conversion XOF → XAF. Les deux se lisent dans l'environnement, avec
// un repli sûr : une valeur invalide ne doit jamais produire un délai ou un
// montant aberrant (un taux négatif inverserait le sens du reversement).
const {
	getPayoutHoldHours,
	getXofToXafRate,
	DEFAULT_PAYOUT_HOLD_HOURS,
	DEFAULT_XOF_TO_XAF_RATE,
} = require("../config/payout");

describe("Jour 81 — config des reversements", () => {
	describe("CFG — délai de garde et taux de change", () => {
		test("CFG-1 délai de garde : défaut 72 h, surcharge, repli sur invalide", () => {
			expect(DEFAULT_PAYOUT_HOLD_HOURS).toBe(72);
			expect(getPayoutHoldHours({})).toBe(72);
			expect(getPayoutHoldHours({ HARVESTS_PAYOUT_HOLD_HOURS: "48" })).toBe(48);
			expect(getPayoutHoldHours({ HARVESTS_PAYOUT_HOLD_HOURS: "0" })).toBe(0);
			expect(getPayoutHoldHours({ HARVESTS_PAYOUT_HOLD_HOURS: "abc" })).toBe(72);
			expect(getPayoutHoldHours({ HARVESTS_PAYOUT_HOLD_HOURS: "-1" })).toBe(72);
			expect(getPayoutHoldHours({ HARVESTS_PAYOUT_HOLD_HOURS: "" })).toBe(72);
		});

		test("CFG-1bis lit process.env par défaut", () => {
			const saved = process.env.HARVESTS_PAYOUT_HOLD_HOURS;
			try {
				delete process.env.HARVESTS_PAYOUT_HOLD_HOURS;
				expect(getPayoutHoldHours()).toBe(72);
				process.env.HARVESTS_PAYOUT_HOLD_HOURS = "12";
				expect(getPayoutHoldHours()).toBe(12);
			} finally {
				if (saved === undefined) delete process.env.HARVESTS_PAYOUT_HOLD_HOURS;
				else process.env.HARVESTS_PAYOUT_HOLD_HOURS = saved;
			}
		});

		test("CFG-2 taux XOF → XAF : défaut 1, surcharge, repli sur invalide", () => {
			expect(DEFAULT_XOF_TO_XAF_RATE).toBe(1);
			expect(getXofToXafRate({})).toBe(1);
			expect(getXofToXafRate({ HARVESTS_XOF_TO_XAF_RATE: "1.2" })).toBe(1.2);
			expect(getXofToXafRate({ HARVESTS_XOF_TO_XAF_RATE: "abc" })).toBe(1);
			expect(getXofToXafRate({ HARVESTS_XOF_TO_XAF_RATE: "-0.5" })).toBe(1);
			expect(getXofToXafRate({ HARVESTS_XOF_TO_XAF_RATE: "0" })).toBe(1);
			expect(getXofToXafRate({ HARVESTS_XOF_TO_XAF_RATE: "" })).toBe(1);
		});

		test("CFG-2bis un taux valide n'est jamais écrasé", () => {
			expect(getXofToXafRate({ HARVESTS_XOF_TO_XAF_RATE: "0.001" })).toBe(0.001);
			expect(getXofToXafRate({ HARVESTS_XOF_TO_XAF_RATE: "1" })).toBe(1);
		});

		test("CFG-2ter lit process.env par défaut", () => {
			const saved = process.env.HARVESTS_XOF_TO_XAF_RATE;
			try {
				delete process.env.HARVESTS_XOF_TO_XAF_RATE;
				expect(getXofToXafRate()).toBe(1);
				process.env.HARVESTS_XOF_TO_XAF_RATE = "1.5";
				expect(getXofToXafRate()).toBe(1.5);
			} finally {
				if (saved === undefined) delete process.env.HARVESTS_XOF_TO_XAF_RATE;
				else process.env.HARVESTS_XOF_TO_XAF_RATE = saved;
			}
		});
	});
});