// Service worker de Alaria. Sube VERSION al cambiar PRECACHE para invalidar cachés viejas.
const VERSION = 'v4';
const BASE = '/alaria-landing/';
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const IMAGES = `images-${VERSION}`;
const OFFLINE_URL = `${BASE}offline/`;
const PRECACHE = [BASE, OFFLINE_URL, `${BASE}manifest.webmanifest`, `${BASE}icon-192.png`];
const MAX_IMAGES = 40;
const MAX_ASSETS = 30; // los de despliegues anteriores se van descartando

// Se activa sin esperar a cerrar pestañas: el HTML va por red primero y CSS/JS llevan hash,
// así que una página abierta no queda apuntando a recursos de otra versión.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  const keep = new Set([PAGES, ASSETS, IMAGES]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((k) => cache.delete(k)));
}

async function networkFirst(request) {
  const cache = await caches.open(PAGES);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || (await cache.match(OFFLINE_URL)) || Response.error();
  }
}

async function cacheFirst(request, cacheName, max) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
    if (max) trimCache(cacheName, max);
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // Solo GET del propio sitio: nunca el POST a Web3Forms ni enlaces externos (wa.me, mapas).
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;

  // El ClientRouter pide las páginas con fetch() sin `Accept: text/html`, así que se reconocen
  // por la ruta: con trailingSlash 'always' toda página termina en "/" y ningún asset lo hace.
  const isPage =
    request.mode === 'navigate' ||
    (request.destination === '' && (url.pathname.endsWith('/') || url.pathname.endsWith('.html')));

  if (isPage) {
    event.respondWith(networkFirst(request));
  } else if (request.destination === 'image' || request.destination === 'font') {
    // Antes que la regla de /_astro/: las imágenes optimizadas viven ahí y deben respetar el límite.
    event.respondWith(cacheFirst(request, IMAGES, MAX_IMAGES));
  } else if (url.pathname.startsWith(`${BASE}_astro/`)) {
    event.respondWith(cacheFirst(request, ASSETS, MAX_ASSETS)); // CSS/JS con hash: inmutables
  }
});
