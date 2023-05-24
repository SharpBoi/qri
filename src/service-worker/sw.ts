import { Manifesto } from 'tools/rollup/plugins/manifest'
import { open, netFirst, cacheFirst, APP_CACHE_NAME, OK } from './sw-util'

export {}

const appManifest = process.env.APP_MANIFEST as Manifesto | undefined
console.log(appManifest)

const sw = self as any as ServiceWorkerGlobalScope

async function fillCache() {
  if (!appManifest) return

  const cache = await open(APP_CACHE_NAME)

  const manifestFiles = appManifest.files.map(f => '/' + f)
  const cacheFiles = await cache.keys().then(ks => ks.map(k => new URL(k.url).pathname))

  const toDelete = cacheFiles.filter(cf => !manifestFiles.includes(cf))

  const toAdd = manifestFiles.filter(mf => !cacheFiles.includes(mf))

  await Promise.all(toDelete.map(f => cache.delete(f)))

  await Promise.all(toAdd.map(f => cache.add(f)))
}

async function handleIndex(req: Request) {
  const path = new URL(req.url).pathname

  const variants = ['/index.html', '/']

  if (variants.includes(path)) {
    const resp = await netFirst(req, true)

    if (resp?.status === OK) {
      const cac = await open(APP_CACHE_NAME)
      await cac.put(req, resp.clone())
      await cac.put('/', resp.clone())
    }

    return resp
  }

  return undefined
}

async function handleManifest(req: Request) {
  const MANIFEST_NAME = '/manifest.json'

  if (req.url.includes(MANIFEST_NAME)) {
    const manifest = await netFirst(req, true)

    return manifest
  }

  const cac = await open(APP_CACHE_NAME)
  const manifest = await cac.match(MANIFEST_NAME).then(r => r?.json())
  if (!manifest) return

  const isIcon = !!(manifest.icons as []).find((icon: any) => req.url.includes(icon.src))

  if (isIcon) return netFirst(req, true)
}

sw.addEventListener('install', e => {
  console.log('sw install', e)

  e.waitUntil(
    (async () => {
      if (appManifest) await fillCache()

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
      let resp = await handleIndex(e.request)
      if (resp) return resp

      resp = await handleManifest(e.request)
      if (resp) return resp

      return cacheFirst(e.request)
    })()
  )
})
