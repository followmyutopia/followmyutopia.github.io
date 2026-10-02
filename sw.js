self.addEventListener('install', () => {
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim());
});

const appUrl = (path) => new URL(path.replace(/^\//, ''), self.registration.scope).href;

self.addEventListener('push', (event) => {
	if (!event.data) return;

	let payload = {
		title: 'Nevka',
		body: 'You have a new message',
		url: 'messages',
		tag: 'message'
	};

	try {
		payload = { ...payload, ...(event.data.json() ?? {}) };
	} catch {
		const text = event.data.text();
		if (text) {
			payload = { ...payload, body: text };
		}
	}

	event.waitUntil(
		self.registration.showNotification(payload.title, {
			body: payload.body,
			icon: appUrl('pwa-192x192.png'),
			badge: appUrl('pwa-192x192.png'),
			tag: payload.tag,
			data: { url: appUrl(payload.url) }
		})
	);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const url = event.notification.data?.url || appUrl('messages');

	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
			for (const client of clients) {
				if ('focus' in client) {
					client.navigate(url);
					return client.focus();
				}
			}
			if (self.clients.openWindow) {
				return self.clients.openWindow(url);
			}
			return undefined;
		})
	);
});
