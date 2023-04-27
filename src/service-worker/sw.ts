export {}

console.log('hllo SW    ')

const CACHE = 'cache-v1'

const sw = self as any as ServiceWorkerGlobalScope

const emptyRes = new Response(undefined, { status: 400 })

const open = () => sw.caches.open(CACHE)

async function cachePut(req: RequestInfo | URL, res: Response) {
  const cache = await open()
  return cache.put(req, res)
}

async function fromNet(input: RequestInfo | URL, saveCache = false) {
  const res = await fetch(input)

  if (saveCache) cachePut(input, res.clone())

  return res
}
async function fromCache(input: RequestInfo | URL) {
  const cache = await open()
  const res = await cache.match(input)

  return res
}

async function netFirst(e: FetchEvent) {
  e.respondWith(
    (async () => {
      try {
        const res = await fromNet(e.request, true)
        return res
      } catch {
        const res = await fromCache(e.request)
        return res || emptyRes.clone()
      }
    })()
  )
}

async function cacheFirst(e: FetchEvent) {
  e.respondWith(
    (async () => {
      try {
        return (await fromCache(e.request)) || (await fromNet(e.request, true))
      } catch {
        return emptyRes.clone()
      }
    })()
  )
}

async function handleIndexHtml(e: FetchEvent) {
  const path = new URL(e.request.url).pathname

  const isIndex = path === '' || path === '/' || path === '/index.html'
  if (!isIndex) return

  await netFirst(e)
}

async function handleManifest(e: FetchEvent) {
  const path = new URL(e.request.url).pathname

  const isManifest = path.startsWith('/manifest') && path.endsWith('.json')
  if (!isManifest) return

  await netFirst(e)
}

sw.addEventListener('install', e => {
  console.log('sw.ts install', e)
  return sw.skipWaiting()
})

sw.addEventListener('activate', e => {
  console.log('sw activate', e)
  return sw.clients.claim()
})

sw.addEventListener('fetch', async e => {
  const req = e.request
  if (!req.url.startsWith('http')) return

  await handleIndexHtml(e)

  await handleManifest(e)

  await cacheFirst(e)
})
