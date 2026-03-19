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

		if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY === "undefined" || VAPID_PUBLIC_KEY === "") {
			console.error("❌ ERREUR CRITIQUE: VAPID_PUBLIC_KEY introuvable dans import.meta.env !");
			alert("Erreur Serveur (Prod) : La clé VITE_VAPID_PUBLIC_KEY manque dans les variables d'environnement du Frontend (Vercel/Render).");
			return;
		}

		try {
			// 1. Register Service Worker
			const registration = await navigator.serviceWorker.register("/sw.js");

			// Wait for the service worker to be active
			await navigator.serviceWorker.ready;

			// 2. Check permission
			let permission = Notification.permission;

			if (permission === "default") {
				permission = await Notification.requestPermission();
			}

			if (permission !== "granted") {
				console.warn("[pushService] Notification permission not granted");
				return;
			}

			// 3. Subscribe

			let subscription = await registration.pushManager.getSubscription();
			if (!subscription) {
				subscription = await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
				});
			} else {
			}

			// 4. Send subscription to backend
			await this.sendSubscriptionToBackend(subscription, isAdmin);
		} catch (error) {
			console.error("❌ [pushService] Web Push Subscription Error:", error);
			alert("Échec de l'abonnement Web Push en Prod : " + (error.message || "Erreur inconnue") + "\n(Vérifiez que vous êtes sur HTTPS ou vos clés Backend)");
		}
	},

	// Envoyer l'abonnement au backend
	async sendSubscriptionToBackend(subscription, isAdmin = false) {
		try {
			// Adapter l'URL selon le type d'utilisateur
			// Pour les utilisateurs: /notifications/subscribe
			// Pour les admins: /notifications/admin/subscribe (selon notificationRoutes.js)
			const subscribeEndpoint = isAdmin
				? "/notifications/admin/subscribe"
				: "/notifications/subscribe";

			await api.post(subscribeEndpoint, {
				subscription,
			});
		} catch (error) {
			console.error(
				"[pushService] Error sending subscription to backend:",
				error.response?.data || error.message
			);
		}
	},

	// Désinscrire côté navigateur (PushManager) et backend
	async unsubscribeLocally(subscription) {
		try {
			if (subscription) {
				await subscription.unsubscribe();
			}
		} catch (error) {
			console.error("[pushService] Erreur lors de la désinscription locale:", error);
		}
	},

	// Envoyer la désinscription au backend
	async sendUnsubscribeToBackend(endpoint, isAdmin = false) {
		try {
			const unsubscribeEndpoint = isAdmin
				? "/notifications/admin/unsubscribe"
				: "/notifications/unsubscribe";

			await api.post(unsubscribeEndpoint, { endpoint });
		} catch (error) {
			console.error(
				"[pushService] Error sending unsubscription to backend:",
				error.response?.data || error.message
			);
		}
	},
};

export default pushService;
