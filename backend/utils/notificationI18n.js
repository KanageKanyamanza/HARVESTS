/**
 * Notifications bilingues : le texte est choisi à la lecture, dans la langue du
 * destinataire, à partir du `type` et de `data`. Les champs `title` et `message`
 * enregistrés (en français) ne servent que de repli : un type absent du
 * catalogue ou des données incomplètes affichent le texte d'origine.
 *
 * Avantage : les notifications déjà en base sont traduites sans migration.
 *
 * Le contenu destiné aux administrateurs reste en français
 * (voir docs/I18N_DECISIONS.md).
 */
const { translate } = require("./translate");

const CFA_CURRENCIES = new Set(["XOF", "XAF", "FCFA", "CFA"]);

/** Montant au format du site : « 2 000 F CFA » en français, « FCFA 2,000 » en anglais. */
const formatMoney = (amount, currency, language = "fr") => {
	const value = Number(amount);
	if (!Number.isFinite(value)) return null;
	const locale = language === "en" ? "en-GB" : "fr-FR";
	const code = String(currency || "XOF").toUpperCase();
	if (CFA_CURRENCIES.has(code)) {
		const number = value.toLocaleString(locale, { maximumFractionDigits: 0 });
		return language === "en" ? `FCFA ${number}` : `${number} F CFA`;
	}
	try {
		return value.toLocaleString(locale, { style: "currency", currency: code });
	} catch {
		return `${value.toLocaleString(locale)} ${code}`;
	}
};

/** Texte d'un champ simple ou bilingue ({ fr, en }), dans la langue demandée. */
const textIn = (value, language) => {
	if (typeof value === "string") return value.trim() || null;
	if (value && typeof value === "object") {
		return value[language] || value.fr || value.en || null;
	}
	return null;
};

// Jour 72 : le nom du plan est enregistré en français (« Gratuit ») ; il est
// traduit à la lecture pour ne pas laisser « Gratuit » dans un message anglais.
const PLAN_IDS = {
	gratuit: "gratuit",
	free: "gratuit",
	standard: "standard",
	premium: "premium",
	professionnel: "premium",
};

const planNameIn = (name, language) => {
	const id = PLAN_IDS[String(name || "").trim().toLowerCase()];
	return (id && translate(`subscription.plans.${id}`, language)) || name;
};

const orderParams = ({ data }) => (data?.orderNumber ? { orderNumber: data.orderNumber } : null);

const orderMoneyParams = ({ data, language }) => {
	const amount = formatMoney(data?.amount, data?.currency, language);
	return data?.orderNumber && amount ? { orderNumber: data.orderNumber, amount } : null;
};

const productParams = ({ data, language }) => {
	const productName = textIn(data?.productName, language);
	return productName ? { productName } : null;
};

const order = (action = "view_order") => ({ params: orderParams, action });

/** Prénom de l'auteur : `data` pour les récentes, expéditeur lié ou ancien titre sinon. */
const senderName = ({ data, sender, title }) =>
	data?.senderName ||
	sender?.firstName ||
	(typeof title === "string" && title.match(/^Message de (.+)$/)?.[1]) ||
	null;

/**
 * type -> { params(contexte) -> variables ou null, variant?(contexte) -> clé, action? }
 * Le contexte contient la notification (data, sender, title, message) et `language`.
 */
const CATALOG = {
	order_created: {
		params: ({ data, language }) => {
			const base = orderMoneyParams({ data, language });
			return base && { ...base, buyerName: data.buyer?.fullName };
		},
		variant: ({ data }) => (data?.buyer?.fullName ? "order_created" : "order_created_no_buyer"),
		action: "view_order",
	},
	order_created_buyer: { params: orderMoneyParams, action: "view_my_order" },
	order_created_transporter: { params: orderMoneyParams, action: "view_order" },

	order_confirmed: order(),
	order_preparing: order(),
	order_ready_for_pickup: order(),
	order_in_transit: order(),
	order_delivered: order(),
	order_completed: order(),
	order_cancelled: order(),
	order_refunded: order(),
	order_disputed: order(),

	order_confirmed_seller: order(),
	order_preparing_seller: order(),
	order_ready_for_pickup_seller: order(),
	order_in_transit_seller: order(),
	order_delivered_seller: order(),
	order_completed_seller: order(),
	order_cancelled_seller: order(),
	order_refunded_seller: order(),
	order_disputed_seller: order(),

	order_confirmed_transporter: order(),
	order_preparing_transporter: order(),
	order_ready_for_pickup_transporter: order(),
	order_in_transit_transporter: order(),
	order_delivered_transporter: order(),
	order_completed_transporter: order(),
	order_cancelled_transporter: order(),
	order_disputed_transporter: order(),

	product_approved: { params: productParams, action: "view_product" },
	product_rejected: {
		params: ({ data, message, language }) => {
			const base = productParams({ data, language });
			if (!base) return null;
			// Les anciennes notifications n'ont le motif que dans leur message
			const reason = data?.reason || (typeof message === "string" && message.match(/Raison : (.+)$/)?.[1]);
			return reason ? { ...base, reason } : null;
		},
	},
	product_low_stock: {
		params: ({ data, language }) => {
			const base = productParams({ data, language });
			return base && data.currentStock !== undefined && data.threshold !== undefined
				? { ...base, currentStock: data.currentStock, threshold: data.threshold }
				: null;
		},
		action: "manage_stock",
	},
	wishlist_item_available: { params: productParams, action: "view_product" },

	review_received: {
		params: ({ data }) => (data?.rating ? { rating: data.rating, reviewTitle: data.reviewTitle } : null),
		variant: ({ data }) => (data?.reviewTitle ? "review_received" : "review_received_no_title"),
		action: "view_review",
	},
	review_response_received: {
		params: ({ data }) => ({ reviewTitle: data?.reviewTitle }),
		variant: ({ data }) => (data?.reviewTitle ? "review_response_received" : "review_response_received_no_title"),
		action: "view_response",
	},
	review_reply: {
		params: (context) => {
			const name = senderName(context);
			return name ? { senderName: name } : null;
		},
		action: "view_comment",
	},

	// Le corps est le message de l'utilisateur : seul le titre se traduit, sauf
	// « pièce jointe seule », texte fixe.
	message_received: {
		params: (context) => {
			const name = senderName(context);
			return name ? { senderName: name } : null;
		},
		keepMessage: ({ data, message }) => !(data?.attachmentOnly || message === "Pièce jointe envoyée"),
		action: "reply",
	},

	subscription_activated: {
		params: ({ data, language }) =>
			data?.planName ? { planName: planNameIn(data.planName, language) } : null,
	},
	quota_reached: {
		params: ({ data, language }) =>
			data?.limit !== undefined && data?.planName
				? { limit: data.limit, planName: planNameIn(data.planName, language) }
				: null,
		action: "change_plan",
	},
	payment_received: {
		params: ({ data, language }) => {
			const amount = formatMoney(data?.amount, data?.currency, language);
			return amount ? { amount, paymentId: data.paymentId } : null;
		},
		variant: ({ data }) => (data?.provider === "paypal" ? "payment_received_paypal" : "payment_received_cash"),
	},
	payout_processed: { params: orderMoneyParams },
};

/** Types du catalogue, pour les tests. */
const catalogKeys = () => {
	const keys = new Set();
	const samples = [{ data: { buyer: { fullName: "x" }, reviewTitle: "x" } }, { data: {} }, { data: { provider: "paypal" } }];
	for (const [type, entry] of Object.entries(CATALOG)) {
		if (!entry.variant) keys.add(type);
		else samples.forEach((sample) => keys.add(entry.variant(sample)));
	}
	return [...keys];
};

/** Titre, message et libellés d'action dans la langue voulue ; repli sur le texte enregistré. */
const localizedTexts = (notification, language = "fr") => {
	const lang = language === "en" ? "en" : "fr";
	const stored = { title: notification?.title, message: notification?.message, actions: notification?.actions };
	const entry = CATALOG[notification?.type];
	if (!entry || notification?.recipientModel === "Admin") return stored;

	const context = {
		data: notification.data || {},
		sender: notification.sender,
		title: notification.title,
		message: notification.message,
		language: lang,
	};
	const params = entry.params(context);
	if (!params) return stored;

	const key = entry.variant ? entry.variant(context) : notification.type;
	const title = translate(`notification.texts.${key}.title`, lang, params);
	const message = entry.keepMessage?.(context) ? stored.message : translate(`notification.texts.${key}.message`, lang, params);
	const label = entry.action ? translate(`notification.actions.${entry.action}`, lang) : null;
	const actions = Array.isArray(stored.actions)
		? stored.actions.map((action) => {
				const plain = typeof action?.toObject === "function" ? action.toObject() : action;
				return label && plain?.type === "view" ? { ...plain, label } : plain;
		  })
		: stored.actions;

	return { title: title ?? stored.title, message: message ?? stored.message, actions };
};

/** Copie simple d'une notification, prête à renvoyer à l'interface. */
const localizeNotification = (notification, language = "fr") => {
	if (!notification) return notification;
	const plain = typeof notification.toJSON === "function" ? notification.toJSON() : { ...notification };
	return { ...plain, ...localizedTexts(plain, language) };
};

const localizeNotifications = (notifications, language = "fr") =>
	(notifications || []).map((notification) => localizeNotification(notification, language));

module.exports = {
	CATALOG,
	catalogKeys,
	formatMoney,
	localizedTexts,
	localizeNotification,
	localizeNotifications,
};
