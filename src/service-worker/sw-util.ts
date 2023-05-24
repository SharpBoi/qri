import { SWMessage } from './types'

export const selfSW = self as any as ServiceWorkerGlobalScope

export const OK = 200
export const APP_CACHE_NAME = 'app-cache:1'

export const open = (name: string) => selfSW.caches.open(name)

const STORE_PREFIX = '@@-STORE-'

// FETCHES

export async function safeFetch(url: RequestInfo | URL, timeout = 0) {
  return new Promise<Response | undefined>(res => {
    const abort = new AbortController()

    if (timeout > 0) {
      setTimeout(() => {
        console.log('timeout req ', url)

        abort.abort()
      }, timeout)
    }

    fetch(url, { signal: abort.signal })
      .then(res)
      .catch(() => res(undefined))
  })
}

export async function netFirst(req: RequestInfo | URL, cacheResponse = false) {
  const cac = await open(APP_CACHE_NAME)
  const cacheResp = await cac.match(req)
  const netResp = await fetch(req).catch(() => undefined)

  if (netResp?.status === OK && cacheResponse) {
    await cac.put(req, netResp.clone())
    return netResp
  }

  return cacheResp
}

export async function cacheFirst(req: RequestInfo | URL, cacheResponse = false) {
  const cache = await open(APP_CACHE_NAME)

  let res = await cache.match(req)
  if (res) return res

  res = await fetch(req)

  if (res.status === OK && cacheResponse) {
    await cache.put(req, res.clone())
  }

  return res
}

// SW

export function registerSW(url: string) {
  return new Promise<void>(async res => {
    const reg = await navigator.serviceWorker.register(url, { scope: '/' })
    console.log('loader.ts install', reg, reg.installing, reg.waiting, reg.active)

    const instance = reg.installing || reg.waiting || reg.active
    if (!instance) throw new Error('sw INSTANCE missing')

    if (instance?.state === 'activated') return res()

    instance.onstatechange = () => {
      if (instance.state === 'activated') return res()
    }
  })
}

export async function getRegistration() {
  return navigator.serviceWorker.getRegistration()
}

export async function getSW() {
  const reg = await getRegistration()
  return reg?.installing || reg?.waiting || reg?.active || undefined
}

export async function getSWFileName() {
  const currentSW = await getSW()
  if (!currentSW) return

  return new URL(currentSW.scriptURL).pathname.split('/').at(-1)
}

// EVENTS

export function swListenMessage<E extends SWMessage['type']>(
  sw: ServiceWorkerGlobalScope | ServiceWorkerContainer,
  eventName: E,
  cb: (msg: Extract<SWMessage, { type: E }>, dispose: VoidFunction) => void
) {
  const dispose = () => {
    sw.removeEventListener('message', listener)
  }

  const listener = (e: Event) => {
    const msg = (e as MessageEvent).data as SWMessage

    if (msg.type === eventName) {
      cb(msg as any, dispose)
    }
  }

  sw.addEventListener('message', listener)

  return dispose
}

export async function swPostMessage(
  sw: ServiceWorkerContainer | ServiceWorkerGlobalScope,
  msg: SWMessage
) {
  if (sw.constructor.name === 'ServiceWorkerContainer') {
    await getSW().then(instance => {
      instance?.postMessage(msg)
    })

    return
  }

  if (sw.constructor.name === 'ServiceWorkerGlobalScope') {
    const swScope = sw as ServiceWorkerGlobalScope

    await swScope.clients.matchAll().then(cs => {
      cs.forEach(c => {
        c.postMessage(msg)
      })
    })

    return
  }
}

// CACHES

export async function cleanCache() {
  return selfSW.caches.delete(APP_CACHE_NAME)
}

export async function storeSet(key: string, value: string) {
  const c = await open(APP_CACHE_NAME)

  await c.put(STORE_PREFIX + key, new Response(value))
}

export async function storeGet(key: string) {
  const c = await open(APP_CACHE_NAME)

  const res = await c.match(STORE_PREFIX + key)

  return res?.text()
}
