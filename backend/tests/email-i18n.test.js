/**
 * Jour 64 — e-mails bilingues (welcome, passwordReset, accountApproval).
 * On rend les gabarits pug (sans envoi) dans chaque langue et on vérifie la
 * langue du document, du sujet et du texte, ainsi que la résolution de la langue.
 */
const Email = require("../utils/email/emailClass");
const fr = require("../locales/fr.json");
const en = require("../locales/en.json");

const URL_TEST = "https://www.harvests.site/verify/abc";
const user = (preferredLanguage) => ({ email: "a@b.c", firstName: "Awa", preferredLanguage });

const render = (email, template, subject = "Sujet") => email.renderTemplate(template, subject);

describe("langue d'un e-mail (Jour 64)", () => {
	test("utilise la langue préférée du compte quand aucune n'est demandée", () => {
		expect(new Email(user("en"), URL_TEST).language).toBe("en");
		expect(new Email(user("fr"), URL_TEST).language).toBe("fr");
	});

	test("la langue explicitement demandée l'emporte sur la préférence du compte", () => {
		expect(new Email(user("fr"), URL_TEST, "en").language).toBe("en");
		expect(new Email(user("en"), URL_TEST, "fr").language).toBe("fr");
	});

	test("repli sur le français pour une langue absente ou non gérée", () => {
		expect(new Email(user(undefined), URL_TEST).language).toBe("fr");
		expect(new Email(user("pt"), URL_TEST).language).toBe("fr");
		expect(new Email(user("EN-us"), URL_TEST).language).toBe("en");
	});

	test("le sujet suit la langue", () => {
		expect(new Email(user("en"), URL_TEST).t("email.subjects.account_approval")).toBe(
			en.email.subjects.account_approval,
		);
		expect(new Email(user("fr"), URL_TEST).t("email.subjects.password_reset")).toBe(
			fr.email.subjects.password_reset,
		);
	});
});

describe.each(["welcome", "passwordReset", "accountApproval"])("gabarit %s", (template) => {
	test("anglais : lang=en, texte anglais, aucun gabarit français résiduel", () => {
		const html = render(new Email(user("en"), URL_TEST), template);
		expect(html).toContain('<html lang="en">');
		expect(html).toContain("Hello Awa,");
		expect(html).not.toMatch(/Bonjour|Tous droits|Sénégal|Cordialement/);
		expect(html).toContain("All rights reserved");
	});

	test("français : lang=fr, texte français, aucune clé brute affichée", () => {
		const html = render(new Email(user("fr"), URL_TEST), template);
		expect(html).toContain('<html lang="fr">');
		expect(html).toContain("Bonjour Awa,");
		expect(html).toContain("Tous droits réservés");
		expect(html).not.toMatch(/email\.(common|welcome|password_reset|account_approval)\./);
	});

	test("le lien et l'année courante sont injectés", () => {
		const html = render(new Email(user("en"), URL_TEST), template);
		expect(html).toContain(String(new Date().getFullYear()));
		expect(html).toContain("harvests.site");
	});
});

describe("bouton et listes traduits", () => {
	test("welcome en anglais : bouton et listes", () => {
		const html = render(new Email(user("en"), URL_TEST), "welcome");
		expect(html).toContain(en.email.welcome.cta);
		en.email.welcome.features.forEach((item) => expect(html).toContain(item));
		expect(html).toContain(URL_TEST);
	});

	test("passwordReset en français : conseils de sécurité", () => {
		const html = render(new Email(user("fr"), URL_TEST), "passwordReset");
		fr.email.password_reset.tips.forEach((item) => expect(html).toContain(item));
	});

	test("accountApproval : le lien pointe vers /login", () => {
		const html = render(new Email(user("en"), "https://www.harvests.site"), "accountApproval");
		expect(html).toContain("https://www.harvests.site/login");
	});
});

describe("parité des clés email.* fr/en", () => {
	const flatten = (obj, prefix = "") =>
		Object.entries(obj).flatMap(([k, v]) =>
			v && typeof v === "object" && !Array.isArray(v)
				? flatten(v, `${prefix}${k}.`)
				: [`${prefix}${k}${Array.isArray(v) ? `[${v.length}]` : ""}`],
		);

	test("mêmes clés (et mêmes longueurs de listes) dans les deux langues", () => {
		expect(flatten(en.email).sort()).toEqual(flatten(fr.email).sort());
	});
});
