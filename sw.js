// RetroChat Service Worker
const CACHE_NAME = 'retro-chat-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // External dependencies - will be cached when first loaded
  'https://cdn.jsdelivr.net/npm/protobufjs@7.5.3/dist/protobuf.min.js',
  'https://unpkg.com/@waku/sdk@0.0.35-67a7287.0/bundle/index.js',
  'https://fonts.googleapis.com/css2?family=Share+Tech+Mono:wght@400&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('http')));
    }).then(() => {
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Ensure the service worker takes control immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip WebSocket and other non-HTTP requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Skip Waku network requests
  if (event.request.url.includes('waku') && event.request.url.includes('wss://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[SW] Serving from cache:', event.request.url);
        return cachedResponse;
      }

      console.log('[SW] Fetching from network:', event.request.url);
      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response before caching
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          console.log('[SW] Caching new resource:', event.request.url);
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch((error) => {
        console.log('[SW] Fetch failed, trying cache:', error);
        
        // If it's the main page and we're offline, serve from cache
        if (event.request.url.endsWith('/') || event.request.url.endsWith('index.html')) {
          return caches.match('/index.html');
        }
        
        throw error;
      });
    })
  );
});

// Handle background sync for offline message queuing (future enhancement)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // This could be used to queue messages when offline
      console.log('[SW] Handling background sync')
    );
  }
});

// Handle push notifications (future enhancement)
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received');
  
  const options = {
    body: 'New message in RetroChat',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5NiIgaGVpZ2h0PSI5NiIgdmlld0JveD0iMCAwIDk2IDk2Ij4KICA8cmVjdCB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIGZpbGw9IiMwMDAiLz4KICA8dGV4dCB4PSI0OCIgeT0iNTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMGZmMDAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMzIiIGZvbnQtd2VpZ2h0PSJib2xkIj5SQzwvdGV4dD4KPC9zdmc+',
    badge: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3MiIgaGVpZ2h0PSI3MiIgdmlld0JveD0iMCAwIDcyIDcyIj4KICA8cmVjdCB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIGZpbGw9IiMwMGZmMDAiLz4KICA8dGV4dCB4PSIzNiIgeT0iNDUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMwMDAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIj5SQzwvdGV4dD4KPC9zdmc+',
    tag: 'retro-chat-message',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('RetroChat', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('[SW] Service worker loaded');