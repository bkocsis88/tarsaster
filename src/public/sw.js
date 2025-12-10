// TársasApp Service Worker, ez felel PWA mobil alkalmazás telepítéséért
const CACHE_NAME = 'tarsasapp-v1';
const RUNTIME_CACHE = 'tarsasapp-runtime-v1';

// Statikus fájlok, amiket azonnal cache-elünk (telefonra letölti)
const STATIC_CACHE_URLS = [
  '/',
  '/css/style.css',
  '/js/tarsasjatekok.js',
  '/js/aikereso.js',
  '/js/login.js',
  '/js/registration.js',
  '/manifest.json',
  '/images/tarsasapp-logo1.png'
];

// Külső CDN források
const CDN_CACHE_URLS = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css'
];

// Service Worker telepítése
self.addEventListener('install', (event) => {
  console.log('[SW] Telepítés...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache megnyitva');
        // Statikus fájlok cache-elése
        return Promise.all([
          cache.addAll(STATIC_CACHE_URLS).catch(err => {
            console.warn('[SW] Néhány statikus fájl cache-elése sikertelen:', err);
          }),
          cache.addAll(CDN_CACHE_URLS).catch(err => {
            console.warn('[SW] CDN fájlok cache-elése sikertelen:', err);
          })
        ]);
      })
      .then(() => self.skipWaiting())
  );
});

// Service Worker aktiválása
self.addEventListener('activate', (event) => {
  console.log('[SW] Aktiválás...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Régi cache törlése:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Értesítések kezelése (későbbi bővítéshez)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification érkezett');
  // Itt lehetne értesítéseket kezelni
});

// Sync event (offline műveletek szinkronizálása)
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);
  // Itt lehetne offline műveletek szinkronizálása
});
