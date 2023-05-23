import { Manifest } from 'tools/rollup/plugins/manifest'
import {
  cleanCache,
  open,
  swPostMessage,
  swListenMessage,
  storeSet,
  storeGet,
  netFirst,
  cacheFirst,
} from './sw-util'

export {}

const appManifest = process.env.APP_MANIFEST as Manifest | undefined
console.log(appManifest)

const sw = self as any as ServiceWorkerGlobalScope

async function fillCache(appMan: Manifest) {
  // TODO optimize: caches intersection
  await cleanCache()

  const cache = await open()

  return Promise.all(
    appMan.files.map(file => {
      return cache.add(file)
    })
  )
}

async function checkAppNeedUpdate(appMan: Manifest) {
  try {
    const cache = await open()

    for (const file of appMan.files) {
      const res = await cache.match(file)

      if (!res) return true
    }
  } catch {}

  return false
}

function handleIndex(e: FetchEvent) {
  const req = e.request
  const path = new URL(req.url).pathname

  const variants = ['/index.html', '/']

  if (variants.includes(path)) {
    e.respondWith(netFirst(req, true))

    return true
  }

  return false
}

sw.addEventListener('install', e => {
  console.log('sw install', e)
  return sw.skipWaiting()
})

sw.addEventListener('activate', e => {
  console.log('sw activate', e)
  return sw.clients.claim()
})

sw.addEventListener('fetch', async e => {
  if (handleIndex(e)) return

  e.respondWith(cacheFirst(e.request))
})

swListenMessage(sw, 'check-update', async msg => {
  console.log('SW v 1')
  console.log('SW: msg from client', msg)

  await storeSet('app_manifest', JSON.stringify(msg.appManifest))

  const need = await checkAppNeedUpdate(msg.appManifest)

  if (need) await fillCache(msg.appManifest)

  swPostMessage(sw, {
    type: 'update-result',
    result: need ? 'updated' : 'no',
  })
})
