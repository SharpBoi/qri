import { Manifest } from 'tools/rollup/plugins/manifest'
import { open, netFirst, cacheFirst, APP_CACHE_NAME } from './sw-util'

export {}

const appManifest = process.env.APP_MANIFEST as Manifest | undefined
console.log(appManifest)

const sw = self as any as ServiceWorkerGlobalScope

async function fillCache(appMan: Manifest) {
  const cache = await open(APP_CACHE_NAME)

  const manifestFiles = appMan.files.map(f => '/' + f)
  const cacheFiles = await cache.keys().then(ks => ks.map(k => new URL(k.url).pathname))

  const toDelete = cacheFiles.filter(cf => !manifestFiles.includes(cf))

  const toAdd = manifestFiles.filter(mf => !cacheFiles.includes(mf))

  await Promise.all(
    toDelete.map(async f => {
      await cache.delete(f)
    })
  )

  await Promise.all(
    toAdd.map(async f => {
      await cache.add(f)
    })
  )
}

async function handleIndex(req: Request) {
  const path = new URL(req.url).pathname

  const variants = ['/index.html', '/']

  if (variants.includes(path)) {
    const resp = await netFirst(req, true)

    const cac = await open(APP_CACHE_NAME)
    await cac.put(req, resp.clone())
    await cac.put('/', resp.clone())

    return resp
  }

  return undefined
}

sw.addEventListener('install', e => {
  console.log('sw install', e)

  e.waitUntil(
    (async () => {
      if (appManifest) await fillCache(appManifest)

      await sw.skipWaiting()
    })()
  )
})

sw.addEventListener('activate', e => {
  console.log('sw activate', e)
  return sw.clients.claim()
})

sw.addEventListener('fetch', async e => {
  e.respondWith(
    (async () => {
      const index = await handleIndex(e.request)
      if (index) return index

      return cacheFirst(e.request)
    })()
  )
})
