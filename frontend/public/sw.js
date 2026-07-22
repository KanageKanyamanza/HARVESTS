// Service Worker pour HARVESTS PWA
// __BUILD_ID__ est remplacé automatiquement à chaque build (voir scripts/set-sw-version.js)
const CACHE_NAME = "harvests-__BUILD_ID__";
const urlsToCache = [
	"/manifest.json",
	"/logo.png",
	"/favicon.ico",
];

// Installation du Service Worker
self.addEventListener("install", (event) => {
	// Forcer l'activation immédiate du nouveau SW
	self.skipWaiting();

	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				console.log("Cache ouvert:", CACHE_NAME);
				return cache.addAll(urlsToCache);
			})
			.catch((error) => {
				console.log("Erreur lors de la mise en cache:", error);
			})
	);
});

// Activation du Service Worker
self.addEventListener("activate", (event) => {
	// Prendre le contrôle des clients immédiatement
	event.waitUntil(
		Promise.all([
			self.clients.claim(),
			// Supprimer TOUS les anciens caches dont le nom ne correspond plus
			// au build courant, pour forcer la récupération des derniers assets
			// à chaque déploiement sur main.
			caches.keys().then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (cacheName !== CACHE_NAME) {
							console.log("Suppression de l'ancien cache:", cacheName);
							return caches.delete(cacheName);
						}
					})
				);
			}),
		])
	);
});

// Interception des requêtes
self.addEventListener("fetch", (event) => {
	// Ignorer les requêtes non-GET (POST, PUT, DELETE, etc.)
	if (event.request.method !== "GET") {
		return;
	}

	// Ignorer les requêtes vers l'API ou les uploads pour éviter de les mettre en cache
	if (
		event.request.url.includes("/api/") ||
		event.request.url.includes("/upload")
	) {
		return;
	}

	// Navigation (HTML) : toujours réseau d'abord, sinon l'utilisateur peut
	// rester bloqué sur un ancien index.html qui pointe vers d'anciens bundles
	// JS/CSS supprimés au build suivant.
	if (event.request.mode === "navigate" || event.request.destination === "document") {
		event.respondWith(
			fetch(event.request)
				.then((response) => {
					const responseToCache = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, responseToCache);
					});
					return response;
				})
				.catch(() => caches.match(event.request).then((cached) => cached || caches.match("/")))
		);
		return;
	}

	// Assets statiques (JS/CSS hashés, images) : cache d'abord, réseau en repli
	event.respondWith(
		caches
			.match(event.request)
			.then((response) => {
				// Retourner la réponse du cache si elle existe
				if (response) {
					return response;
				}

				// Sinon, faire la requête réseau
				return fetch(event.request).then((response) => {
					// Vérifier si la réponse est valide
					if (
						!response ||
						response.status !== 200 ||
						response.type !== "basic"
					) {
						return response;
					}

					// Cloner la réponse
					const responseToCache = response.clone();

					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, responseToCache);
					});

					return response;
				});
			})
			.catch((err) => {
				console.error("[Service Worker] Fetch error:", err);
				// En cas d'erreur, retourner une page offline si c'est une navigation
				if (event.request.destination === "document") {
					return caches.match("/");
				}

				// Retourner une réponse vide ou d'erreur au lieu de undefined
				// pour éviter "Failed to convert value to 'Response'"
				return new Response('', { status: 408, statusText: 'Network error or Timeout' });
			})
	);
});

// Gestion des notifications push (optionnel)
// Gestion des notifications push
self.addEventListener("push", (event) => {
	console.log("[Service Worker] Push Received", event);

	let data = {};

	if (event.data) {
		try {
			data = event.data.json();
			console.log("[Service Worker] Push Data parsed:", data);
		} catch (e) {
			console.warn("[Service Worker] Push Data parse error, try text:", e);
			const text = event.data.text();
			data = { title: "HARVESTS", body: text };
		}
	} else {
		data = { title: "HARVESTS", body: "Nouvelle notification en attente" };
	}

	// Préparer les options pour la notification
	// On s'assure que title et body existent
	const title = data.title || "HARVESTS";
	const body = data.body || "Vous avez une nouvelle notification";

	const options = {
		body: body,
		icon: data.icon || "/logo.png",
		badge: "/logo.png",
		vibrate: [100, 50, 100],
		data: data.data || { url: "/" },
		timestamp: Date.now(),
		tag: data.tag || "harvests-general",
		renotify: true,
		requireInteraction: true,
		actions: (data.actions || []).map(action => ({
			...action,
			action: action.action || 'view' // Ensure action ID is present
		})),
	};

	event.waitUntil(
		Promise.all([
			self.registration.showNotification(title, options).catch(err => {
				console.error("[Service Worker] Notification error:", err);
			}),
			// Mise à jour du badge
			"setAppBadge" in navigator
				? navigator.setAppBadge(data.unreadCount || 1).catch(() => {})
				: Promise.resolve(),
		])
	);
});

// Gestion des clics sur les notifications
self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	if (event.action === "close") return;

	let url = "/";
	if (event.notification.data && event.notification.data.url) {
		url = event.notification.data.url;
	}

	event.waitUntil(
		clients
			.matchAll({ type: "window", includeUncontrolled: true })
			.then((windowClients) => {
				// Si une fenêtre est déjà ouverte, on la met au premier plan et on navigue
				for (let i = 0; i < windowClients.length; i++) {
					const client = windowClients[i];
					if (client.url.includes(self.location.origin) && "focus" in client) {
						return client.focus().then((focusedClient) => {
							if (focusedClient && "navigate" in focusedClient) {
								return focusedClient.navigate(url);
							}
						});
					}
				}
				// Sinon on ouvre une nouvelle fenêtre
				if (clients.openWindow) {
					return clients.openWindow(url);
				}
			})
	);
});
