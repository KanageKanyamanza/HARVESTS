// Délai de garde livraison → reversement (Jour 81, décision utilisateur :
// 72 h). Une commande livrée ne devient payable qu'à l'expiration du délai :
// cela laisse le temps d'un litige ou d'un remboursement (Jour 83) avant que
// les fonds ne quittent le float HARVESTS.
// Fonction pure : aucune base, aucune horloge réelle (now injecté).
const { getPayoutHoldHours } = require("../config/payout");
const { isOrderPayableNow } = require("../services/payment/paymentPayoutService");

const HOUR = 60 * 60 * 1000;
const NOW = new Date("2026-11-13T12:00:00.000Z").getTime();

const at = (msBeforeNow) => new Date(NOW - msBeforeNow);

describe("Jour 81 — délai de garde de 72 h", () => {
	describe("HLD — isOrderPayableNow", () => {
		test("HLD-1 limite exacte : livrée il y a 72 h → payable", () => {
			expect(isOrderPayableNow({ deliveredAt: at(72 * HOUR), status: "delivered" }, { now: NOW })).toEqual({
				payable: true,
			});
		});

		test("HLD-2 1 ms avant la limite → pas payable, avec la date d'exigibilité", () => {
			const result = isOrderPayableNow({ deliveredAt: at(72 * HOUR - 1), status: "delivered" }, { now: NOW });
			expect(result.payable).toBe(false);
			expect(result.reason).toBe("payout_hold_not_eligible");
			expect(result.eligibleAt).toBeInstanceOf(Date);
			expect(result.eligibleAt.getTime()).toBe(at(72 * HOUR - 1).getTime() + 72 * HOUR);
		});

		test("HLD-3 1 ms après la limite → payable", () => {
			expect(isOrderPayableNow({ deliveredAt: at(72 * HOUR + 1), status: "delivered" }, { now: NOW })).toEqual({
				payable: true,
			});
		});

		test("HLD-4 sans deliveredAt (même completed) → non payable, motif explicite", () => {
			expect(isOrderPayableNow({ status: "completed" }, { now: NOW })).toEqual({
				payable: false,
				reason: "payout_delivery_date_missing",
			});
			expect(isOrderPayableNow({ status: "delivered", deliveredAt: null }, { now: NOW })).toEqual({
				payable: false,
				reason: "payout_delivery_date_missing",
			});
			expect(isOrderPayableNow({ deliveredAt: "pas une date", status: "delivered" }, { now: NOW })).toEqual({
				payable: false,
				reason: "payout_delivery_date_missing",
			});
		});

		test("HLD-5 completed avec deliveredAt ancien → payable", () => {
			expect(isOrderPayableNow({ status: "completed", deliveredAt: at(5 * 24 * HOUR) }, { now: NOW })).toEqual({
				payable: true,
			});
		});

		test("HLD-6 délai configurable : 24 h", () => {
			expect(
				isOrderPayableNow({ deliveredAt: at(24 * HOUR - 1), status: "delivered" }, { now: NOW, holdHours: 24 })
					.payable,
			).toBe(false);
			expect(
				isOrderPayableNow({ deliveredAt: at(24 * HOUR + 1), status: "delivered" }, { now: NOW, holdHours: 24 })
					.payable,
			).toBe(true);
			// Sans délai (0), la livraison suffit.
			expect(
				isOrderPayableNow({ deliveredAt: at(1), status: "delivered" }, { now: NOW, holdHours: 0 }).payable,
			).toBe(true);
		});

		test("HLD-6bis délai par défaut : 72 h lues dans l'environnement", () => {
			const saved = process.env.HARVESTS_PAYOUT_HOLD_HOURS;
			try {
				delete process.env.HARVESTS_PAYOUT_HOLD_HOURS;
				expect(getPayoutHoldHours()).toBe(72);
				expect(
					isOrderPayableNow({ deliveredAt: at(72 * HOUR - 1), status: "delivered" }, { now: NOW }).payable,
				).toBe(false);
				expect(
					isOrderPayableNow({ deliveredAt: at(72 * HOUR + 1), status: "delivered" }, { now: NOW }).payable,
				).toBe(true);
			} finally {
				if (saved === undefined) delete process.env.HARVESTS_PAYOUT_HOLD_HOURS;
				else process.env.HARVESTS_PAYOUT_HOLD_HOURS = saved;
			}
		});
	});
});