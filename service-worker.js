const CACHE_NAME = 'band-advisory-v1';
const urlsToCache = [
    '/',
    '/admin.html',
    '/manifest.json'
];

// Install service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});

// Push notification event
self.addEventListener('push', event => {
    let data = {};
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: 'New Request', body: event.data.text() };
        }
    }

    const options = {
        body: data.body || `New band advisory request from ${data.studentName || 'a student'}`,
        icon: '/icon-192x192.png', // Add your icon
        badge: '/icon-72x72.png',   // Add your badge icon
        tag: 'band-advisory-request',
        requireInteraction: true,
        actions: [
            {
                action: 'view',
                title: 'View Request'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ],
        data: data
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'New Band Advisory Request', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/admin.html')
        );
    }
});

// Handle messages from main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'NEW_REQUEST') {
        // Trigger local notification (for testing without backend)
        self.registration.showNotification('New Band Advisory Request', {
            body: `${event.data.data.studentName} has requested to join band advisory`,
            icon: '/icon-192x192.png',
            tag: 'band-advisory-request',
            requireInteraction: true
        });
    }
});
