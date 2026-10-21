const express = require("express");
const cookieParser = require("cookie-parser");
const request = require("supertest");

const {
	ensureCsrfCookie,
	csrfProtection,
	cors,
	CSRF_COOKIE_NAME,
	CSRF_HEADER_NAME,
} = require("../middleware/security");
const { apiCookieOptions } = require("../config/cookies");

const FRONT_ORIGIN = "https://harvests-six.vercel.app";

// supertest n'envoie la requête qu'au moment de l'await : l'environnement doit
// rester en place jusqu'à la réponse, d'où un helper asynchrone.
const withEnv = async (nodeEnv, callback) => {
	const previous = process.env.NODE_ENV;
	process.env.NODE_ENV = nodeEnv;
	try {
		return await callback();
	} finally {
		process.env.NODE_ENV = previous;
	}
};

// Reproduit la chaîne réelle de app.js : cookie-parser → ensureCsrfCookie →
// csrfProtection, sur des routes /api/v1 de test.
const buildApp = () => {
	const app = express();
	app.use(express.json());
	app.use(cookieParser());
	app.use(ensureCsrfCookie);
	app.use(csrfProtection);
	app.get("/api/v1/test", (req, res) => res.json({ ok: true }));
	app.post("/api/v1/test", (req, res) => res.json({ ok: true }));
	app.post("/api/v1/auth/login", (req, res) => res.json({ ok: true }));
	app.post("/api/v1/payments/webhook", (req, res) => res.json({ ok: true }));
	return app;
};

const cookieValue = (setCookie) => {
	const match = /harvests_csrf_token=([^;]+)/.exec(setCookie || "");
	return match ? match[1] : null;
};

describe("protection CSRF cross-site (Jour 63)", () => {
	test("le cookie CSRF est renvoyé par l'API en production", async () => {
		const app = buildApp();

		const response = await withEnv("production", () =>
			request(app).get("/api/v1/test"));

		const setCookie = response.headers["set-cookie"][0];
		expect(setCookie).toContain(`${CSRF_COOKIE_NAME}=`);
		// SameSite=None : le cookie doit revenir depuis un autre site (front
		// Vercel → API Render), Strict/Lax aurait bloqué toute écriture.
		expect(setCookie).toContain("SameSite=None");
		expect(setCookie).toContain("Secure");
		expect(setCookie).toContain("Path=/");
		// Lisible par le front, qui doit le renvoyer dans l'en-tête
		expect(setCookie).not.toContain("HttpOnly");
	});

	test("le jeton est aussi renvoyé dans l'en-tête X-CSRF-Token", async () => {
		const app = buildApp();

		const response = await request(app).get("/api/v1/test");

		expect(response.headers[CSRF_HEADER_NAME.toLowerCase()]).toBeTruthy();
		expect(cookieValue(response.headers["set-cookie"][0])).toBe(
			response.headers[CSRF_HEADER_NAME.toLowerCase()],
		);
	});

	test("le jeton renvoyé est celui du cookie déjà posé", async () => {
		const app = buildApp();

		const first = await request(app).get("/api/v1/test");
		const token = first.headers[CSRF_HEADER_NAME.toLowerCase()];

		const second = await request(app)
			.get("/api/v1/test")
			.set("Cookie", `${CSRF_COOKIE_NAME}=${token}`);

		expect(second.headers[CSRF_HEADER_NAME.toLowerCase()]).toBe(token);
		expect(second.headers["set-cookie"]).toBeUndefined();
	});

	test("une écriture avec le cookie et le jeton passe", async () => {
		const app = buildApp();

		const first = await request(app).get("/api/v1/test");
		const token = first.headers[CSRF_HEADER_NAME.toLowerCase()];

		const response = await request(app)
			.post("/api/v1/test")
			.set("Cookie", `${CSRF_COOKIE_NAME}=${token}`)
			.set("x-csrf-token", token);

		expect(response.status).toBe(200);
	});

	test("une écriture sans jeton est rejetée", async () => {
		const app = buildApp();

		const first = await request(app).get("/api/v1/test");
		const token = first.headers[CSRF_HEADER_NAME.toLowerCase()];

		const response = await request(app)
			.post("/api/v1/test")
			.set("Cookie", `${CSRF_COOKIE_NAME}=${token}`);

		expect(response.status).toBe(403);
		expect(response.body.message).toBe("Token CSRF invalide");
	});

	test("une écriture avec un jeton qui ne correspond pas au cookie est rejetée", async () => {
		const app = buildApp();

		const first = await request(app).get("/api/v1/test");
		const token = first.headers[CSRF_HEADER_NAME.toLowerCase()];

		const response = await request(app)
			.post("/api/v1/test")
			.set("Cookie", `${CSRF_COOKIE_NAME}=${token}`)
			.set("x-csrf-token", "jeton-fabrique");

		expect(response.status).toBe(403);
	});

	test("une écriture avec le jeton mais sans cookie est rejetée", async () => {
		const app = buildApp();

		const first = await request(app).get("/api/v1/test");
		const token = first.headers[CSRF_HEADER_NAME.toLowerCase()];

		const response = await request(app)
			.post("/api/v1/test")
			.set("x-csrf-token", token);

		expect(response.status).toBe(403);
	});

	test("les routes d'authentification et les webhooks sont exemptés", async () => {
		const app = buildApp();

		const auth = await request(app).post("/api/v1/auth/login");
		expect(auth.status).toBe(200);

		const webhook = await request(app).post("/api/v1/payments/webhook");
		expect(webhook.status).toBe(200);
	});

	test("une requête porteuse d'un jeton JWT est exemptée", async () => {
		const app = buildApp();

		const response = await request(app)
			.post("/api/v1/test")
			.set("Authorization", "Bearer un-jeton");

		expect(response.status).toBe(200);
	});

	test("en développement le cookie reste Lax (localhost est le même site)", async () => {
		const app = buildApp();

		const response = await withEnv("development", () =>
			request(app).get("/api/v1/test"),
		);

		const setCookie = response.headers["set-cookie"][0];
		expect(setCookie).toContain("SameSite=Lax");
		expect(setCookie).not.toContain("Secure");
	});
});

describe("en-têtes CORS (Jour 63)", () => {
	const buildCorsApp = () => {
		const app = express();
		app.use(cors);
		app.use(ensureCsrfCookie);
		app.get("/api/v1/test", (req, res) => res.json({ ok: true }));
		return app;
	};

	test("le jeton CSRF est lisible par le front (en-tête exposé)", async () => {
		const app = buildCorsApp();

		const response = await request(app)
			.get("/api/v1/test")
			.set("Origin", FRONT_ORIGIN);

		expect(response.status).toBe(200);
		expect(response.headers["access-control-allow-origin"]).toBe(FRONT_ORIGIN);
		expect(response.headers["access-control-allow-credentials"]).toBe("true");
		expect(response.headers["access-control-expose-headers"]).toContain(
			"X-CSRF-Token",
		);
	});

	test("le préflight d'une écriture avec x-csrf-token est accepté", async () => {
		const app = buildCorsApp();

		const response = await request(app)
			.options("/api/v1/test")
			.set("Origin", FRONT_ORIGIN)
			.set("Access-Control-Request-Method", "POST")
			.set("Access-Control-Request-Headers", "x-csrf-token");

		expect(response.status).toBe(204);
		expect(response.headers["access-control-allow-headers"].toLowerCase()).toContain(
			"x-csrf-token",
		);
	});

	test("une origine non autorisée est refusée", async () => {
		const app = buildCorsApp();

		const response = await request(app)
			.get("/api/v1/test")
			.set("Origin", "https://site-pirate.example");

		expect(response.headers["access-control-allow-origin"]).toBeUndefined();
	});
});

describe("politique commune des cookies (Jour 63)", () => {
	test("en production les cookies de l'API sont SameSite=None; Secure", async () => {
		const options = await withEnv("production", () =>
			apiCookieOptions(null, { httpOnly: true }),
		);

		expect(options.sameSite).toBe("none");
		expect(options.secure).toBe(true);
		expect(options.httpOnly).toBe(true);
	});

	test("en développement, sans HTTPS, les cookies restent Lax", async () => {
		const options = await withEnv("development", () =>
			apiCookieOptions({ secure: false, headers: {} }, {}),
		);

		expect(options.sameSite).toBe("lax");
		expect(options.secure).toBe(false);
	});

	test("une requête HTTPS (proxy TLS) donne SameSite=None", async () => {
		const options = await withEnv("development", () =>
			apiCookieOptions(
				{ secure: false, headers: { "x-forwarded-proto": "https" } },
				{},
			),
		);

		expect(options.sameSite).toBe("none");
		expect(options.secure).toBe(true);
	});

	test("les attributs propres au cookie sont conservés", async () => {
		const options = await withEnv("development", () =>
			apiCookieOptions(
				{ secure: false, headers: {} },
				{
					httpOnly: false,
					path: "/api/v1/auth/refresh",
					maxAge: 1000,
				},
			),
		);

		expect(options.httpOnly).toBe(false);
		expect(options.path).toBe("/api/v1/auth/refresh");
		expect(options.maxAge).toBe(1000);
	});
});
