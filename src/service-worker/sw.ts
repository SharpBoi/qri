console.log('hllo SW')

const sw = self as any as ServiceWorkerGlobalScope

sw.addEventListener('install', e => {
  console.log('sw.ts install', e)

  return sw.skipWaiting()
})

sw.addEventListener('activate', e => {
  console.log('sw activate', e)
  return sw.clients.claim()
})

sw.addEventListener('fetch', e => {
  console.log('sw fet', e.request.url, e.request)
})
