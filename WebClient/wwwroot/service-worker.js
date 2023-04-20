// In development, always fetch from the network and do not enable offline support.
// This is because caching would make development more difficult (changes would not
// be reflected on the first load after each change).
self.addEventListener('install', async event => {
    console.log('Installing service worker...');
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    // You can add custom logic here for controlling whether to use cached data if offline, etc.
    // The following line opts out, so requests go directly to the network as usual.
    return null;
});
self.addEventListener('push', event => {
    const payload = event.data.json();
    console.log("AAA: ", event);
    console.log("BBB: ", event.data);
    console.log("CCC: ", event.data.json());
    console.log("CCC: ", payload.message);
    console.log("CCC: ", payload.url);

    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.message,
            icon: 'img/icon-512.png',
            vibrate: [100, 50, 100],
            data: { url: payload.url }
        })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url));
});