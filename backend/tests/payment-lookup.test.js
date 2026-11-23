// Recherche d'un Payment par paymentId métier ou _id Mongo (recette navigateur).
const { findPaymentByIdentifier } = require("../utils/paymentLookup");

const HEX_ID = "6b03eceadee669a4532a0ad5";

describe("findPaymentByIdentifier", () => {
	test("un paymentId de 24 hexadécimaux est cherché d'abord par paymentId", async () => {
		const payment = { paymentId: HEX_ID };
		const findOne = jest.fn().mockResolvedValue(payment);
		const findById = jest.fn();
		await expect(
			findPaymentByIdentifier(HEX_ID, { findOne, findById }),
		).resolves.toBe(payment);
		expect(findOne).toHaveBeenCalledWith({ paymentId: HEX_ID });
		expect(findById).not.toHaveBeenCalled();
	});

	test("un _id Mongo (aucun paymentId correspondant) tombe sur findById", async () => {
		const payment = { _id: "abc" };
		const findOne = jest.fn().mockResolvedValue(null);
		const findById = jest.fn().mockResolvedValue(payment);
		await expect(
			findPaymentByIdentifier("abc", { findOne, findById, isValidObjectId: () => true }),
		).resolves.toBe(payment);
		expect(findById).toHaveBeenCalledWith("abc");
	});

	test("un identifiant non-ObjectId sans paymentId ne tente pas findById", async () => {
		const findOne = jest.fn().mockResolvedValue(null);
		const findById = jest.fn();
		await expect(
			findPaymentByIdentifier("pas-un-id", { findOne, findById }),
		).resolves.toBeNull();
		expect(findById).not.toHaveBeenCalled();
	});
});
