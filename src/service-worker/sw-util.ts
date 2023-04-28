import { SWMessage } from './types'

export const sw = self as any as ServiceWorkerGlobalScope

export const CACHE = 'cache-v1'

export const CACHE_404 = new Response(undefined, {
  status: 404,
  statusText: 'Not found in cache',
})

export function swMsg<E extends SWMessage['type']>(
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

export const open = () => sw.caches.open(CACHE)

export function postMessage(...args: Parameters<Client['postMessage']>) {
  sw.clients.matchAll().then(cs => {
    cs.forEach(c => {
      c.postMessage(...args)
    })
  })
}

export async function fromCache(input: RequestInfo | URL) {
  const cache = await open()
  const res = await cache.match(input)

  return res
}

export async function cachePut(req: RequestInfo | URL, res: Response) {
  const cache = await open()
  return cache.put(req, res)
}

export async function cleanCache() {
  return sw.caches.delete(CACHE)
}

export function respondCacheOnly(e: FetchEvent) {
  return e.respondWith(
    (async () => {
      const res = await fromCache(e.request)

      return res || CACHE_404.clone()
    })()
  )
}
