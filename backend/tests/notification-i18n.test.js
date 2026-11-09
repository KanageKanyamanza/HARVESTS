/**
 * Jour 72 — notifications bilingues : le texte est choisi à la lecture, à partir
 * du type et des données, avec repli sur le texte enregistré.
 */
const { CATALOG, catalogKeys, formatMoney, localizeNotification } = require("../utils/notificationI18n");
const fr = require("../locales/fr.json");
const en = require("../locales/en.json");
const Notification = require("../models/Notification");

const enumOf = (path) => Notification.schema.path(path).enumValues;

describe("catalogue des notifications", () => {
	test("chaque texte existe en français et en anglais, avec les mêmes variables", () => {
		const vars = (text) => (text.match(/\{\{\s*\w+\s*\}\}/g) || []).map((v) => v.replace(/\W/g, "")).sort();
		for (const key of catalogKeys()) {
			const a = fr.notification.texts[key];
			const b = en.notification.texts[key];
			expect(a).toBeDefined();
			expect(b).toBeDefined();
			expect(vars(b.title)).toEqual(vars(a.title));
			expect(vars(b.message)).toEqual(vars(a.message));
		}
	});

	test("chaque type du catalogue est accepté par le schéma", () => {
		const allowed = enumOf("type");
		for (const type of Object.keys(CATALOG)) expect(allowed).toContain(type);
	});

	test("les types et catégories utilisés hors catalogue sont acceptés aussi", () => {
		for (const type of ["refund_requested", "subscription_activated", "review_reply"]) {
			expect(enumOf("type")).toContain(type);
		}
		for (const category of ["subscription", "social"]) expect(enumOf("category")).toContain(category);
	});
});

describe("texte selon la langue", () => {
	const orderNotification = {
		type: "order_created_buyer",
		title: "Commande créée avec succès",
		message: "Votre commande HSN1 a été créée avec succès. Montant total : 2000 XOF",
		data: { orderNumber: "HSN1", amount: 2000, currency: "XOF" },
		actions: [{ type: "view", label: "Voir ma commande", url: "/x" }],
	};

	test("une notification ancienne, écrite en français, se lit en anglais", () => {
		const out = localizeNotification(orderNotification, "en");
		expect(out.title).toBe("Order placed successfully");
		expect(out.message).toContain("HSN1");
		expect(out.message).toContain("FCFA 2,000");
		expect(out.message).not.toContain("XOF");
		expect(out.actions[0]).toMatchObject({ label: "View my order", url: "/x" });
	});

	test("en français, le montant suit aussi le format du site", () => {
		const out = localizeNotification(orderNotification, "fr");
		expect(out.title).toBe("Commande créée avec succès");
		expect(out.message).toMatch(/2.000 F CFA/);
	});

	test("données incomplètes : repli sur le texte enregistré", () => {
		const out = localizeNotification({ type: "order_confirmed", title: "Commande confirmée", message: "ancien", data: {} }, "en");
		expect(out.title).toBe("Commande confirmée");
		expect(out.message).toBe("ancien");
	});

	test("type inconnu du catalogue : texte enregistré", () => {
		const out = localizeNotification({ type: "announcement", title: "Annonce", message: "Texte", data: {} }, "en");
		expect(out.title).toBe("Annonce");
	});

	test("un administrateur garde le texte français", () => {
		const out = localizeNotification({ ...orderNotification, recipientModel: "Admin" }, "en");
		expect(out.title).toBe("Commande créée avec succès");
	});

	test("le message d'un utilisateur n'est jamais traduit ni remplacé", () => {
		const out = localizeNotification({ type: "message_received", title: "Message de Awa", message: "Bonjour, livraison demain ?", data: {} }, "en");
		expect(out.title).toBe("Message from Awa");
		expect(out.message).toBe("Bonjour, livraison demain ?");
	});

	test("pièce jointe seule : texte fixe traduit", () => {
		const out = localizeNotification({ type: "message_received", title: "Message de Awa", message: "Pièce jointe envoyée", data: {} }, "en");
		expect(out.message).toBe("Attachment sent");
	});

	test("nom de produit bilingue : la langue du lecteur", () => {
		const data = { productName: { fr: "Mil", en: "Millet" }, currentStock: 2, threshold: 5 };
		expect(localizeNotification({ type: "product_low_stock", title: "Stock faible", message: "x", data }, "en").message).toContain("Millet");
		expect(localizeNotification({ type: "product_low_stock", title: "Stock faible", message: "x", data }, "fr").message).toContain("Mil");
	});

	test("motif de rejet d'une ancienne notification : repris du message", () => {
		const out = localizeNotification(
			{ type: "product_rejected", title: "Produit rejeté", message: 'Votre produit "Mil" a été rejeté. Raison : Photo floue', data: { productName: "Mil" } },
			"en",
		);
		expect(out.message).toContain("Photo floue");
		expect(out.title).toBe("Product rejected");
	});

	test("avis sans titre : pas de « undefined »", () => {
		const out = localizeNotification({ type: "review_received", title: "Nouvel avis reçu", message: 'avis pour "undefined"', data: { rating: 5 } }, "en");
		expect(out.message).not.toContain("undefined");
		expect(out.message).toContain("5");
	});
});

describe("montants", () => {
	test("franc CFA, quelle que soit la variante", () => {
		expect(formatMoney(2000, "XOF", "en")).toBe("FCFA 2,000");
		expect(formatMoney(2000, "XAF", "en")).toBe("FCFA 2,000");
		expect(formatMoney(2000, "XOF", "fr")).toMatch(/^2.000 F CFA$/);
	});
	test("autre devise et montant invalide", () => {
		expect(formatMoney(10, "EUR", "en")).toContain("€");
		expect(formatMoney("abc", "XOF", "en")).toBeNull();
	});
});
