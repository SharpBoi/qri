import { Manifest } from 'tools/rollup/plugins/manifest'
import { cleanCache, open, swPostMessage, swListenMessage } from './sw-util'

export {}

const sw = self as any as ServiceWorkerGlobalScope

async function fillCache(appMan: Manifest) {
  // TODO optimize: caches intersection
  await cleanCache()

  const cache = await open()

  return Promise.all(
    appMan.files
      .map(file => {
        const routes = appMan.routes[file] || [file]

        return routes.map(route => cache.add(route))
      })
      .flat()
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

sw.addEventListener('install', e => {
  console.log('sw install', e)
  return sw.skipWaiting()
})

sw.addEventListener('activate', e => {
  console.log('sw activate', e)
  return sw.clients.claim()
})

sw.addEventListener('fetch', async e => {
  e.respondWith(
    (async () => {
      const cache = await open()

      const res = await cache.match(e.request)

      if (res) return res

      return fetch(e.request)
    })()
  )
})

swListenMessage(sw, 'check-update', async msg => {
  console.log('SW v 1')

  console.log('SW: msg from client', msg)

  const need = await checkAppNeedUpdate(msg.appManifest)

  if (need) await fillCache(msg.appManifest)

  swPostMessage(sw, {
    type: 'update-result',
    result: need ? 'updated' : 'no',
  })
})
