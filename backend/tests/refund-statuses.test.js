// Source unique des statuts de remboursement réservés (limite documentée Jour 83).
const { RESERVED_REFUND_STATUSES } = require("../utils/refundStatuses");
const service = require("../services/payment/paymentRefundAfribapayService");
const Payment = require("../models/Payment");

describe("statuts de remboursement réservés — source unique", () => {
	test("valeurs figées", () => {
		expect(RESERVED_REFUND_STATUSES).toEqual([
			"pending",
			"ambiguous",
			"succeeded",
		]);
	});

	test("le service AfriBaPay réutilise la constante partagée", () => {
		expect(service.RESERVED_REFUND_STATUSES).toBe(RESERVED_REFUND_STATUSES);
	});

	test("le virtuel Payment.reservedRefunded réserve les mêmes statuts", () => {
		const payment = new Payment({
			amount: 10000,
			refunds: [
				{ status: "pending", amount: 1000 },
				{ status: "ambiguous", amount: 2000 },
				{ status: "succeeded", amount: 3000 },
				{ status: "failed", amount: 4000 },
			],
		});
		expect(payment.reservedRefunded).toBe(6000);
	});
});
