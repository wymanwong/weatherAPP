// This is a simple service worker for the PWA
// In a real app, you would use next-pwa to generate this

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("weather-pwa-v1").then((cache) => {
      return cache.addAll(["/", "/index.html", "/manifest.json", "/icons/icon-192x192.png", "/icons/icon-512x512.png"])
    }),
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    }),
  )
})

