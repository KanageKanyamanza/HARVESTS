/**
 * Jour 65 — e-mails bilingues (2/2).
 * Gabarits rendus sans envoi : commande, profil incomplet, abonnements,
 * mailing, rejet de compte, notification de livraison et notification générique.
 */
const Email = require("../utils/email/emailClass");
const fr = require("../locales/fr.json");
const en = require("../locales/en.json");

const URL_TEST = "https://www.harvests.site";
const user = (preferredLanguage) => ({
	email: "a@b.c",
	firstName: "Awa",
	preferredLanguage,
});

const make = (lang, url = URL_TEST) => new Email(user(lang), url);
const render = (lang, template, data = {}) =>
	make(lang).renderTemplate(template, "Sujet", data);

const ORDER = {
	orderNumber: "CMD-2026-001",
	currency: "XAF",
	total: 3000,
	items: [
		{
			productSnapshot: { name: "Okra" },
			quantity: 2,
			totalPrice: 2000,
			currency: "XAF",
		},
		{ productSnapshot: { name: "Jute mallow" }, quantity: 1, unitPrice: 1000 },
	],
};

const DELIVERY = {
	orderNumber: "CMD-2026-001",
	status: "in-transit",
	trackingNumber: "TRK-42",
	estimatedDeliveryDate: "2026-10-25T10:00:00.000Z",
	deliveryAddress: {
		street: "12 rue des Manguiers",
		city: "Dakar",
		region: "Dakar",
		country: "Sénégal",
	},
};

describe("gabarits bilingues du Jour 65", () => {
	test("commande : articles, total et textes dans chaque langue", () => {
		const htmlEn = render("en", "orderConfirmation", { order: ORDER });
		expect(htmlEn).toContain('<html lang="en">');
		expect(htmlEn).toContain(en.email.order_confirmation.title);
		expect(htmlEn).toContain("Okra x 2");
		expect(htmlEn).toContain(`2000 XAF`);
		expect(htmlEn).toContain(en.email.order_confirmation.total);
		expect(htmlEn).toContain("3000 XAF");
		expect(htmlEn).not.toMatch(/Tous droits|Bonjour|Commande confirmée/);

		const htmlFr = render("fr", "orderConfirmation", { order: ORDER });
		expect(htmlFr).toContain('<html lang="fr">');
		expect(htmlFr).toContain(fr.email.order_confirmation.title);
		expect(htmlFr).toContain(fr.email.order_confirmation.total);
		expect(htmlFr).not.toMatch(/email\.order_confirmation\./);
	});

	test("commande : ancien format (products) et commande absente", () => {
		const legacy = render("en", "orderConfirmation", {
			order: { products: [{ name: "Mango", quantity: 3, price: 500 }] },
		});
		expect(legacy).toContain("Mango x 3");
		expect(legacy).toContain("500");

		const empty = render("fr", "orderConfirmation", {});
		expect(empty).toContain(fr.email.order_confirmation.details_unavailable);
	});

	test("profil incomplet : libellés de champs traduits", () => {
		const missing = ["farmInfo", "address", "avatar"];
		const htmlEn = render("en", "incompleteProfile", {
			missingFields: missing.map(
				(field) => en.email.incomplete_profile.fields[field],
			),
		});
		missing.forEach((field) =>
			expect(htmlEn).toContain(en.email.incomplete_profile.fields[field]),
		);
		expect(htmlEn).not.toContain(fr.email.incomplete_profile.fields.farmInfo);
		expect(htmlEn).toContain(en.email.incomplete_profile.benefits[0]);

		const htmlFr = render("fr", "incompleteProfile", {
			missingFields: missing.map(
				(field) => fr.email.incomplete_profile.fields[field],
			),
		});
		missing.forEach((field) =>
			expect(htmlFr).toContain(fr.email.incomplete_profile.fields[field]),
		);
		expect(htmlFr).toContain(fr.email.incomplete_profile.cta);
	});

	test("profil incomplet : un champ inconnu reste affiché tel quel", async () => {
		const email = make("en");
		email.send = jest.fn().mockResolvedValue(undefined);

		await email.sendIncompleteProfileReminder(["farmInfo", "customField"]);

		expect(email.send).toHaveBeenCalledWith(
			"incompleteProfile",
			en.email.subjects.incomplete_profile,
			{
				missingFields: [
					en.email.incomplete_profile.fields.farmInfo,
					"customField",
				],
			},
		);
	});

	test("abonnement expiré : plan, date et avantages", () => {
		const data = {
			planName: "Premium",
			endDate: new Date("2026-10-01T12:00:00.000Z"),
			actionUrl: `${URL_TEST}/pricing`,
		};
		const htmlEn = render("en", "subscriptionExpired", {
			...data,
			endDate: "1 October 2026",
		});
		expect(htmlEn).toContain('<html lang="en">');
		expect(htmlEn).toContain("Premium");
		expect(htmlEn).toContain("1 October 2026");
		expect(htmlEn).toContain(`${URL_TEST}/pricing`);
		en.email.subscription_expired.benefits.forEach((item) =>
			expect(htmlEn).toContain(item),
		);
		expect(htmlEn).not.toMatch(/Tous droits|Bonjour/);

		const htmlFr = render("fr", "subscriptionExpired", {
			...data,
			endDate: "1 octobre 2026",
		});
		expect(htmlFr).toContain(fr.email.subscription_expired.title);
		expect(htmlFr).toContain("1 octobre 2026");
		expect(htmlFr).not.toMatch(/email\.subscription_expired\./);
	});

	test("abonnement expirant : jours restants au singulier et au pluriel", () => {
		const base = {
			planName: "Standard",
			endDate: "1 octobre 2026",
			actionUrl: `${URL_TEST}/pricing`,
		};
		const oneEn = render("en", "subscriptionExpiring", { ...base, daysLeft: 1 });
		expect(oneEn).toContain(en.email.subscription_expiring.days_left_one);

		const threeEn = render("en", "subscriptionExpiring", { ...base, daysLeft: 3 });
		expect(threeEn).toContain(
			en.email.subscription_expiring.days_left.replace(
				"{{daysLeft}}",
				"3",
			),
		);
		expect(threeEn).toContain(en.email.subscription_expiring.expiry_label);
		expect(threeEn).toContain(en.email.subscription_expiring.status_active);

		const oneFr = render("fr", "subscriptionExpiring", { ...base, daysLeft: 1 });
		expect(oneFr).toContain(fr.email.subscription_expiring.days_left_one);
	});

	test("mailing : habillage traduit, contenu HTML conservé", () => {
		const content = "<p>Bonjour chers abonnés, voici les nouveautés.</p>";
		const htmlEn = render("en", "mailing", { content });
		expect(htmlEn).toContain('<html lang="en">');
		expect(htmlEn).toContain(en.email.mailing.greeting.split("{{firstName}}")[0].trim());
		expect(htmlEn).toContain(en.email.mailing.signature_name);
		expect(htmlEn).toContain(content);
		expect(htmlEn).not.toContain("L'équipe Harvests");
		expect(htmlEn).not.toContain("CONFIDENTIALITÉ");

		const htmlFr = render("fr", "mailing", { content });
		expect(htmlFr).toContain(fr.email.mailing.signature_name);
		expect(htmlFr).toContain(fr.email.mailing.footer_privacy);
	});

	test("rejet de compte : motif et lien de contact", () => {
		const htmlFr = render("fr", "accountRejection", {
			reason: "Documents d'exploitation manquants.",
		});
		expect(htmlFr).toContain('<html lang="fr">');
		expect(htmlFr).toContain(fr.email.account_rejection.title);
		expect(htmlFr).toContain("Documents d'exploitation manquants.");
		expect(htmlFr).toContain(`${URL_TEST}/contact`);

		const htmlEn = render("en", "accountRejection", {});
		expect(htmlEn).toContain(en.email.account_rejection.reason_fallback);
		expect(htmlEn).not.toMatch(/Bonjour|Tous droits|Merci de votre intérêt/);
	});

	test("notification de livraison : statut, suivi et adresse", () => {
		const htmlEn = render("en", "deliveryNotification", {
			delivery: DELIVERY,
		});
		expect(htmlEn).toContain('<html lang="en">');
		expect(htmlEn).toContain(en.email.delivery_notification.statuses.in_transit);
		expect(htmlEn).toContain("TRK-42");
		expect(htmlEn).toContain("12 rue des Manguiers");
		expect(htmlEn).toContain("October 2026");
		expect(htmlEn).not.toMatch(/Bonjour|Tous droits/);

		const htmlFr = render("fr", "deliveryNotification", {
			delivery: { ...DELIVERY, status: "delivered" },
		});
		expect(htmlFr).toContain(
			fr.email.delivery_notification.statuses.delivered,
		);
		expect(htmlFr).toContain(fr.email.delivery_notification.title);
	});

	test("notification générique : titre, message et bouton", () => {
		const htmlEn = render("en", "notification", {
			title: "New order",
			body: "You have a new order.",
			actionUrl: `${URL_TEST}/orders`,
			actionText: "View order",
		});
		expect(htmlEn).toContain("New order");
		expect(htmlEn).toContain("You have a new order.");
		expect(htmlEn).toContain(`${URL_TEST}/orders`);
		expect(htmlEn).toContain("View order");
		expect(htmlEn).toContain(en.email.notification.closing);
	});

	test("envoi des abonnements : bon gabarit, bon sujet, bons liens", async () => {
		const email = make("en");
		email.send = jest.fn().mockResolvedValue(undefined);

		await email.sendSubscriptionExpired({
			planName: "Premium",
			endDate: "2026-10-01T12:00:00.000Z",
		});
		expect(email.send).toHaveBeenCalledWith(
			"subscriptionExpired",
			en.email.subjects.subscription_expired,
			expect.objectContaining({
				planName: "Premium",
				endDate: "1 October 2026",
				actionUrl: `${URL_TEST}/pricing`,
			}),
		);

		await email.sendSubscriptionExpiring({
			planName: "Standard",
			daysLeft: 3,
			endDate: "2026-10-01T12:00:00.000Z",
		});
		expect(email.send).toHaveBeenCalledWith(
			"subscriptionExpiring",
			en.email.subjects.subscription_expiring,
			expect.objectContaining({
				planName: "Standard",
				daysLeft: 3,
				actionUrl: `${URL_TEST}/pricing`,
			}),
		);

		await email.sendAccountRejection("Documents manquants");
		expect(email.send).toHaveBeenCalledWith(
			"accountRejection",
			en.email.subjects.account_rejection,
			{ reason: "Documents manquants" },
		);
	});

	test("notification : le chemin d'action est converti en lien absolu", async () => {
		const email = make("fr");
		email.send = jest.fn().mockResolvedValue(undefined);

		await email.sendGenericNotification({
			title: "Nouvelle commande",
			body: "Une commande vous attend.",
			clickAction: "/orders/123",
			actionText: "Voir la commande",
		});

		expect(email.send).toHaveBeenCalledWith(
			"notification",
			"Nouvelle commande",
			expect.objectContaining({
				title: "Nouvelle commande",
				body: "Une commande vous attend.",
				actionUrl: `${URL_TEST}/orders/123`,
				actionText: "Voir la commande",
			}),
		);
	});

	test("un e-mail sans lien explicite utilise l'adresse du site", () => {
		const email = new Email(user("fr"));
		expect(email.url).toBe(
			process.env.FRONTEND_URL || "https://www.harvests.site",
		);
	});
});
