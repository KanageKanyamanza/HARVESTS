const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const AppError = require("../utils/appError");
const errorHandler = require("../middleware/errorHandler");
const fr = require("../locales/fr.json");
const en = require("../locales/en.json");

const fakeResponse = () => {
	const res = {
		headersSent: false,
		statusCode: 200,
		body: null,
		status(code) {
			res.statusCode = code;
			return res;
		},
		json(payload) {
			res.body = payload;
			return res;
		},
	};
	return res;
};

const handle = (err, language) => {
	const req = { language, originalUrl: "/api/v1/test" };
	const res = fakeResponse();
	errorHandler(err, req, res, () => {});
	return res;
};

const invalidUser = async () => {
	const user = new User({});
	try {
		await user.validate();
	} catch (error) {
		return error;
	}
	throw new Error("La validation de l'utilisateur vide aurait dû échouer");
};

describe("validation i18n (Jour 62)", () => {
	test("fr et en exposent les mêmes clés de validation", () => {
		expect(Object.keys(fr.validation).sort()).toEqual(Object.keys(en.validation).sort());
	});

	test("traduit les erreurs Mongoose dans la langue de la requête", async () => {
		const error = await invalidUser();

		const frResponse = handle(error, "fr");
		expect(frResponse.statusCode).toBe(400);
		expect(frResponse.body.message).toContain("Prénom requis");
		expect(frResponse.body.message).not.toContain("validation.");

		const enResponse = handle(error, "en");
		expect(enResponse.statusCode).toBe(400);
		expect(enResponse.body.message).toContain("First name is required");
		expect(enResponse.body.message).not.toContain("validation.");
	});

	test("traduit les required Mongoose sans message personnalisé", async () => {
		const log = new AuditLog({});
		let error;
		try {
			await log.validate();
		} catch (validationError) {
			error = validationError;
		}
		expect(error).toBeDefined();

		const frResponse = handle(error, "fr");
		expect(frResponse.body.message).toContain("Ce champ est requis");
		expect(frResponse.body.message).not.toContain("is required");

		const enResponse = handle(error, "en");
		expect(enResponse.body.message).toContain("This field is required");
		expect(enResponse.body.message).not.toContain("Path `");
	});

	test("conserve les détails de validation après relais par AppError.from", async () => {
		const error = await invalidUser();
		const wrapped = AppError.from(error, 404);

		const response = handle(wrapped, "en");
		expect(response.statusCode).toBe(400);
		expect(response.body.message).toContain("First name is required");
	});
});
