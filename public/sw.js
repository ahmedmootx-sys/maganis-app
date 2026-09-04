const CACHE_NAME = 'maganis-v3'

// Use the service worker's own scope to determine the base path
// This makes it work on both localhost (/) and GitHub Pages (/maganis-app/)
const BASE = new URL('./', self.location).pathname

const STATIC_ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.webmanifest',
  BASE + 'branding/app-icon-outer.png',
  BASE + 'branding/maganis-mascot-inner.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

// Network-First Strategy: always try to fetch fresh from network first, fall back to cache if offline
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (url.origin !== location.origin) return

  // Skip caching for development requests or live reloads
  if (
    url.pathname.includes('/@vite') ||
    url.pathname.includes('/@fs') ||
    url.pathname.includes('/src/')
  ) {
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.method === 'GET') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(async () => {
        const cached = await caches.match(request)
        if (cached) return cached
        if (request.destination === 'document' || request.mode === 'navigate') {
          return caches.match(BASE + 'index.html')
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' })
      }),
  )
})
