import {
  CACHE_404,
  cachePut,
  cleanCache,
  fromCache,
  open,
  swPostMessage,
  respondCacheOnly,
  swListenMessage,
} from './sw-util'
import { SWMessage, SWUpdateResult } from './types'

export {}

console.log('hllo SW 12 1231 2312 ')

const APP_MANIFEST_URL = 'manifest.app.json'

const sw = self as any as ServiceWorkerGlobalScope

async function fillCache() {
  await cleanCache()

  // TODO improve exception
  const res = await fetch(APP_MANIFEST_URL)
  await cachePut(APP_MANIFEST_URL, res.clone())
  await cachePut('/', await fetch('index.html'))

  const appMan = await res.json()

  for (const file of appMan.files) {
    await cachePut(file, await fetch(file))
  }
}

async function checkAppNeedUpdate() {
  try {
    const appMan = await fetch(APP_MANIFEST_URL).then(res => res.json())

    const cache = await open()

    for (const file of appMan.files) {
      const res = await cache.match(file)

      if (!res) return true
    }
  } catch {}

  return false
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

  const url = new URL(req.url)
  const bypassCache = url.searchParams.has('sw-bc')

  if (bypassCache) return e.respondWith(fetch(req))

  respondCacheOnly(e)
})

swListenMessage(sw, 'check-update', async msg => {
  console.log('MSG from client', msg)

  const need = await checkAppNeedUpdate()

  if (need) await fillCache()

  swPostMessage(<SWUpdateResult>{
    type: 'update-result',
    result: need ? 'updated' : 'no',
  })
})
