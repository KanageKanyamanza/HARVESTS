/* eslint-disable no-console */
import api from "./api";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
	if (!base64String) return new Uint8Array(0);

	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

const pushService = {
	// Enregistrer le Service Worker et s'abonner
	async registerAndSubscribe(isAdmin = false) {
		if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
			console.warn("Web Push not supported");
			return;
		}

		if (!VAPID_PUBLIC_KEY) {
			console.warn("VAPID Public Key key not found in environment");
			return;
		}

		try {
			console.log("[pushService] Registering Service Worker...");
			// 1. Register Service Worker
			const registration = await navigator.serviceWorker.register("/sw.js");

			// Wait for the service worker to be active
			await navigator.serviceWorker.ready;
			console.log("[pushService] Service Worker ready");

			// 2. Check permission
			let permission = Notification.permission;
			console.log("[pushService] Current notification permission:", permission);
			if (permission === "default") {
				permission = await Notification.requestPermission();
				console.log("[pushService] New notification permission:", permission);
			}

			if (permission !== "granted") {
				console.warn("[pushService] Notification permission not granted");
				return;
			}

			// 3. Subscribe
			console.log("[pushService] Getting push subscription...");
			let subscription = await registration.pushManager.getSubscription();
			if (!subscription) {
				console.log("[pushService] No existing subscription, subscribing...");
				subscription = await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
				});
				console.log("[pushService] New subscription created");
			} else {
				console.log("[pushService] Existing subscription found");
			}

			// 4. Send subscription to backend
			await this.sendSubscriptionToBackend(subscription, isAdmin);
			console.log(
				`[pushService] Web Push Subscribed (${
					isAdmin ? "Admin" : "User"
				}) successfully`
			);
		} catch (error) {
			console.error("[pushService] Web Push Subscription Error:", error);
		}
	},

	// Envoyer l'abonnement au backend
	async sendSubscriptionToBackend(subscription, isAdmin = false) {
		try {
			// Adapter l'URL selon le type d'utilisateur
			// Pour les utilisateurs: /notifications/subscribe
			// Pour les admins: /notifications/admin/subscribe (selon notificationRoutes.js)
			const endpoint = isAdmin
				? "/notifications/admin/subscribe"
				: "/notifications/subscribe";

			console.log(`[pushService] Sending subscription to ${endpoint}...`);
			const response = await api.post(endpoint, {
				subscription,
			});
			console.log(
				"[pushService] Subscription sent successfully:",
				response.data
			);
		} catch (error) {
			console.error(
				"[pushService] Error sending subscription to backend:",
				error.response?.data || error.message
			);
		}
	},
};

export default pushService;
