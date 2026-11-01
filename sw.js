/**
 * Service worker — El Mundo de Felipe (PWA)
 *
 * Cachea la portada y los archivos estáticos propios del sitio.
 * NO toca: los mundos A-Frame (/a-frame/), Firebase, Apps Script
 * ni ninguna otra petición a dominios externos.
 *
 * Para publicar cambios a quienes ya instalaron la app,
 * sube el número de CACHE_VERSION: al activarse se borran las cachés viejas.
 */
const CACHE_VERSION = 'v21';
const CACHE_NAME = `mundo-felipe-${CACHE_VERSION}`;

// Portada y piezas mínimas para abrir la app sin conexión.
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './install.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// Rutas propias que nunca se cachean.
const EXCLUDED_PATHS = [
  /\/a-frame\//,           // mundos A-Frame
  /\/__\//,                // rutas reservadas de Firebase Hosting
  /\.(mp4|webm|mov|rar|zip)$/i, // videos y archivos comprimidos pesados
];

// Archivos estáticos propios que sí se cachean al visitarlos.
const STATIC_EXT = /\.(html|css|js|mjs|json|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|pdf)$/i;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith('mundo-felipe-') && k !== CACHE_NAME)
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

function shouldHandle(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  // Solo el propio sitio: Firebase, Apps Script (script.google.com),
  // CDNs y demás dominios externos van directo a la red.
  if (url.origin !== self.location.origin) return false;
  // Solo dentro del alcance de la app (la carpeta donde está sw.js: /dondefelipe/ en GitHub Pages, / en Vercel).
  if (!url.pathname.startsWith(new URL(self.registration.scope).pathname)) return false;
  if (EXCLUDED_PATHS.some(re => re.test(url.pathname))) return false;
  return request.mode === 'navigate' || url.pathname.endsWith('/') || STATIC_EXT.test(url.pathname);
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (!shouldHandle(request)) return;

  if (request.mode === 'navigate') {
    // Páginas: primero la red (contenido al día); sin conexión, la copia
    // guardada o, en último caso, la portada.
    event.respondWith(
      fetch(request)
        .then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, copy));
          }
          return res;
        })
        .catch(() => caches.match(request, { ignoreSearch: true })
          .then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  // Estáticos: responde desde caché al tiro y actualiza en segundo plano.
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(request).then(hit => {
        const net = fetch(request)
          .then(res => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => hit || Response.error());
        if (hit) {
          event.waitUntil(net);
          return hit;
        }
        return net;
      })
    )
  );
});
