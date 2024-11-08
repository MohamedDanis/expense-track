/// <reference lib="webworker" />

export type {};
declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'expense-tracker-cache-v1';

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll([
				'/',
				'/manifest.json',
				'/icons/icon-192x192.png',
				'/icons/icon-512x512.png'
			]);
		})
	);
});

self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			return response || fetch(event.request);
		})
	);
});