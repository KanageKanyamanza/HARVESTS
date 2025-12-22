// Service Worker pour HARVESTS PWA
const CACHE_NAME = "harvests-v1.0.0";
const urlsToCache = [
	"/",
	"/manifest.json",
	"/logo.png",
	"/static/js/bundle.js",
	"/static/css/main.css",
];

// Installation du Service Worker
self.addEventListener("install", (event) => {
	// Forcer l'activation immédiate du nouveau SW
	self.skipWaiting();

	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				console.log("Cache ouvert");
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
			.catch(() => {
				// En cas d'erreur, retourner une page offline si c'est une navigation
				if (event.request.destination === "document") {
					return caches.match("/");
				}
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
			console.log("[Service Worker] Push Data parse error, using text:", e);
			data = { title: "HARVESTS", body: event.data.text() };
		}
	} else {
		data = { title: "HARVESTS", body: "Nouvelle notification" };
	}

	const options = {
		body: data.body,
		icon: "/logo.png", // Force logo.png pour test
		badge: "/logo.png",
		vibrate: [100, 50, 100],
		data: data.data || { url: "/" },
		tag: "harvests-notification-" + Date.now(), // Unique tag pour forcer l'affichage
		renotify: true,
		requireInteraction: true, // Garder la notification visible
	};

	event.waitUntil(self.registration.showNotification(data.title, options));
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
