const CACHE_NAME = 'week-chain-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/logo-wc.png',
  '/favicon.jpg',
  '/icon-192.jpg',
  '/icon-512.jpg',
]

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching assets')
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[Service Worker] Failed to cache some assets:', err)
        // Continue anyway - some assets might not exist
      })
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return
  }

  // API requests - network first with cache fallback
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            return response || new Response('Offline - Content not available', { status: 503 })
          })
        })
    )
    return
  }

  // Static assets - cache first with network fallback
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response
        }

        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone)
        })

        return response
      })
    })
  )
})

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync event:', event.tag)

  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings())
  }

  if (event.tag === 'sync-payments') {
    event.waitUntil(syncPayments())
  }
})

async function syncBookings() {
  try {
    const db = await openIndexedDB()
    const pendingBookings = await getPendingBookings(db)

    for (const booking of pendingBookings) {
      const response = await fetch('/api/bookings/sync', {
        method: 'POST',
        body: JSON.stringify(booking),
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        await removePendingBooking(db, booking.id)
      }
    }
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error)
    throw error
  }
}

async function syncPayments() {
  try {
    const db = await openIndexedDB()
    const pendingPayments = await getPendingPayments(db)

    for (const payment of pendingPayments) {
      const response = await fetch('/api/payments/sync', {
        method: 'POST',
        body: JSON.stringify(payment),
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        await removePendingPayment(db, payment.id)
      }
    }
  } catch (error) {
    console.error('[Service Worker] Payment sync failed:', error)
    throw error
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('week-chain', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('pending-bookings')) {
        db.createObjectStore('pending-bookings', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('pending-payments')) {
        db.createObjectStore('pending-payments', { keyPath: 'id' })
      }
    }
  })
}

function getPendingBookings(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending-bookings', 'readonly')
    const store = tx.objectStore('pending-bookings')
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

function getPendingPayments(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending-payments', 'readonly')
    const store = tx.objectStore('pending-payments')
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

function removePendingBooking(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending-bookings', 'readwrite')
    const store = tx.objectStore('pending-bookings')
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

function removePendingPayment(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending-payments', 'readwrite')
    const store = tx.objectStore('pending-payments')
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icon-192.jpg',
    badge: '/icon-192.jpg',
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
    actions: [
      {
        action: 'open',
        title: 'Abrir'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'close') return

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Check if there's already a window open
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i]
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data?.url || '/')
      }
    })
  )
})
