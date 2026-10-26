const CACHE_VERSION = '__BUILD_ID__'
const CACHE_NAME = 'maganis-' + CACHE_VERSION
const MEDIA_CACHE_NAME = 'maganis-media-v1'
const MEDIA_CACHE_MAX_ENTRIES = 400

// Use the service worker's own scope to determine the base path
const BASE = new URL('./', self.location).pathname

const APP_SHELL_ASSETS =
  typeof __APP_SHELL_ASSETS__ !== 'undefined' &&
  Array.isArray(__APP_SHELL_ASSETS__)
    ? __APP_SHELL_ASSETS__.map((a) => BASE + a)
    : []

const STATIC_ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.webmanifest',
  BASE + 'branding/app-icon.png',
  BASE + 'branding/app-icon-maskable.png',
  BASE + 'branding/app-icon-outer.png',
  BASE + 'branding/maganis-mascot-inner.png',
  // Precache 3D anatomical atlas assets for offline viewing
  BASE + 'atlas/anterior.svg',
  BASE + 'atlas/posterior.svg',
  BASE + 'atlas/atlas-meta.json',
  BASE + 'atlas/shade-anterior.webp',
  BASE + 'atlas/shade-posterior.webp',
  ...APP_SHELL_ASSETS,
]

// LRU cache trimmer for media
async function trimMediaCache() {
  try {
    const cache = await caches.open(MEDIA_CACHE_NAME)
    const keys = await cache.keys()
    if (keys.length > MEDIA_CACHE_MAX_ENTRIES) {
      await cache.delete(keys[0])
      return trimMediaCache()
    }
  } catch {
    // silent
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

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
            .filter((key) => key !== CACHE_NAME && key !== MEDIA_CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (url.origin !== location.origin) return

  // 1. Task G5-B3: Never cache video responses in the service worker
  if (
    request.destination === 'video' ||
    /\.(mp4|webm|m4v)$/i.test(url.pathname)
  ) {
    event.respondWith(fetch(request))
    return
  }

  // 2. Skip caching for development requests or live reloads
  if (
    url.pathname.includes('/@vite') ||
    url.pathname.includes('/@fs') ||
    url.pathname.includes('/src/')
  ) {
    return
  }

  // 3. Network-first with a 3s timeout for index.html and version.json, falling back to cache
  const isHtml =
    request.destination === 'document' ||
    request.mode === 'navigate' ||
    url.pathname.endsWith('index.html') ||
    url.pathname === BASE ||
    url.pathname === BASE.slice(0, -1)
  const isVersion = url.pathname.endsWith('version.json')

  if (isHtml || isVersion) {
    event.respondWith(
      new Promise((resolve) => {
        let timedOut = false
        const timer = setTimeout(() => {
          timedOut = true
          caches
            .match(isHtml ? BASE + 'index.html' : request)
            .then((cached) => {
              if (cached) resolve(cached)
              else
                resolve(
                  new Response('Offline', {
                    status: 503,
                    statusText: 'Offline',
                  }),
                )
            })
        }, 3000)

        fetch(request, { cache: isVersion ? 'no-cache' : 'default' })
          .then((networkRes) => {
            clearTimeout(timer)
            if (!timedOut) {
              if (networkRes.ok && request.method === 'GET') {
                const clone = networkRes.clone()
                caches
                  .open(CACHE_NAME)
                  .then((cache) => cache.put(request, clone))
              }
              resolve(networkRes)
            }
          })
          .catch(async () => {
            clearTimeout(timer)
            if (!timedOut) {
              const cached = await caches.match(
                isHtml ? BASE + 'index.html' : request,
              )
              if (cached) resolve(cached)
              else
                resolve(
                  new Response('Offline', {
                    status: 503,
                    statusText: 'Offline',
                  }),
                )
            }
          })
      }),
    )
    return
  }

  // 4. Cache-first for hashed assets under assets/
  if (url.pathname.includes('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((networkRes) => {
          if (networkRes.ok && request.method === 'GET') {
            const clone = networkRes.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return networkRes
        })
      }),
    )
    return
  }

  // 5. Dedicated long-lived cache maganis-media-v1 for exercise images
  const isMediaImage =
    request.destination === 'image' ||
    /\.(png|jpe?g|webp|gif|svg)$/i.test(url.pathname)

  if (
    isMediaImage &&
    (url.pathname.includes('media/') || url.pathname.includes('exercises/'))
  ) {
    event.respondWith(
      caches.match(request, { cacheName: MEDIA_CACHE_NAME }).then((cached) => {
        if (cached) return cached
        return fetch(request)
          .then((networkRes) => {
            if (networkRes.ok && request.method === 'GET') {
              const clone = networkRes.clone()
              caches.open(MEDIA_CACHE_NAME).then((cache) => {
                cache.put(request, clone)
                void trimMediaCache()
              })
            }
            return networkRes
          })
          .catch(() => {
            return new Response('Offline Image', {
              status: 503,
              statusText: 'Offline Image',
            })
          })
      }),
    )
    return
  }

  // 6. Default fallback for other GET requests
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
        return new Response('Offline', { status: 503, statusText: 'Offline' })
      }),
  )
})
