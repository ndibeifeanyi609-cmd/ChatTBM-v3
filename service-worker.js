/* ChatTBM service worker
 * Network-only while debugging the frontend.
 * Remove obsolete ChatTBM caches so old files are not served.
 */

self.addEventListener("install", event => {
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(names =>
            Promise.all(
                names
                    .filter(name => name.startsWith("chattbm-cache-"))
                    .map(name => caches.delete(name))
            )
        ).then(() => self.clients.claim())
    );
});

// Intentionally no fetch handler: requests use the network normally.
