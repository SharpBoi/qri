import { SWMessage } from './types'

export const selfSW = self as any as ServiceWorkerGlobalScope

export const CACHE = 'cache-v1'

export const CACHE_404 = new Response(undefined, {
  status: 404,
  statusText: 'Not found in cache',
})

export const open = () => selfSW.caches.open(CACHE)

export async function safeFetch(url: string, timeout = 0) {
  return new Promise<string | undefined>(res => {
    const abort = new AbortController()

    if (timeout > 0) {
      setTimeout(() => {
        console.log('timeout req ', url)

        abort.abort()
      }, timeout)
    }

    fetch(url, { signal: abort.signal })
      .then(res => res.text())
      .then(res)
      .catch(() => res(undefined))
  })
}

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

export async function cleanCache() {
  return selfSW.caches.delete(CACHE)
}

export async function getSWFileName() {
  const currentSW = await getSW()
  if (!currentSW) return

  return new URL(currentSW.scriptURL).pathname.split('/').at(-1)
}
