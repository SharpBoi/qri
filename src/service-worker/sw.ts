export {}

console.log('hllo SW')

const CACHE = 'cache-v1'

const sw = self as any as ServiceWorkerGlobalScope

const open = () => sw.caches.open(CACHE)

sw.addEventListener('install', e => {
  console.log('sw.ts install', e)

  return sw.skipWaiting()
})

sw.addEventListener('activate', e => {
  console.log('sw activate', e)
  return sw.clients.claim()
})

sw.addEventListener('fetch', e => {
  const req = e.request
  if (!req.url.startsWith('http')) return
  console.log('sw fet', req.url, req)

  e.respondWith(
    (async () => {
      try {
        const cache = await open()

        const cacheResp = await cache.match(req)
        if (cacheResp) return cacheResp

        const res = await fetch(req)

        cache.put(req, res.clone())

        return res
      } catch (err: any) {
        console.error(req, err)
        throw new err()
      }
    })()
  )
})
