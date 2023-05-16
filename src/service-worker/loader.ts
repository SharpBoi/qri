import { swListenMessage } from './sw-util'
import { SWCheckUpdate, SWMessage } from './types'

export {}

console.log(' ad asd as')

const sw = navigator.serviceWorker

function pull(url: string, bypassCache?: boolean) {
  const u = new URL(`http://test.com/${url}`)

  if (bypassCache) u.searchParams.append('sw-bc', '')

  return fetch(u.pathname + u.search)
}

async function loadMainApp(appUrl: string) {
  return new Promise<void>(res => {
    const script = document.createElement('script')
    script.src = appUrl
    script.type = 'module'
    script.onload = () => {
      res()
    }

    document.body.appendChild(script)
  })
}

function showLoader() {
  const loader = document.body.querySelector('#loader') as HTMLDivElement
  if (!loader) return
  loader.style.display = ''
}
function hideLoader() {
  document.body.querySelector('#loader')?.remove()
}

function hasSW() {
  return sw.getRegistrations().then(regs => {
    return !!regs.length
  })
}

async function currentRegistration() {
  return navigator.serviceWorker.getRegistration()
}

async function getCurrentSW() {
  const reg = await currentRegistration()
  return reg?.installing || reg?.waiting || reg?.active || undefined
}

function register(url: string) {
  return new Promise<void>(async res => {
    const reg = await sw.register(url, { scope: '/' })
    console.log('load.ts install', reg, reg.installing, reg.waiting, reg.active)

    const instance = reg.installing || reg.waiting || reg.active
    if (!instance) throw new Error('sw INSTANCE missing')

    if (instance?.state === 'activated') return res()

    instance.onstatechange = () => {
      if (instance.state === 'activated') return res()
    }
  })
}

function appManifest() {
  return pull(`manifest.app.json`)
    .then(res => res.json())
    .then(json => json as Record<string, any>)
    .catch(() => undefined)
}
function swManifest() {
  return pull('manifest.sw.json', true)
    .then(res => res.json())
    .then(json => json as Record<string, any>)
    .catch(() => undefined)
}
async function manifestos() {
  return Promise.all([appManifest(), swManifest()]).then(
    r => r as [appManifest: typeof r[0], swManifest: typeof r[1]]
  )
}

async function checkSWneedUpdate() {
  try {
    const currentSW = await getCurrentSW()
    if (!currentSW) return false

    const swMan = await swManifest()
    if (!swMan) return false

    const currentSWfileName = new URL(currentSW.scriptURL).pathname.split('/').at(-1)

    const actualSWfileName = swMan['sw-sw']

    return currentSWfileName !== actualSWfileName
  } catch {
    return false
  }
}

async function main() {
  showLoader()

  const swNeedUpdate = await checkSWneedUpdate()
  console.log('SW UPD', swNeedUpdate)
  if (swNeedUpdate) {
    const reg = await currentRegistration()
    await reg?.unregister()
  }

  const isRegistered = await hasSW()

  try {
    if (!isRegistered) {
      console.log('sw install')

      const swMan = await swManifest()
      if (!swMan) throw new Error('')

      await register(swMan['sw-sw'])
    } else {
      console.log('sw SKIP install')
    }
  } catch {}

  swListenMessage(sw, 'update-result', async (msg, dispose) => {
    dispose()

    if (msg.result === 'updated') {
      window.location.reload()
    } else if (msg.result === 'no') {
      const man = await appManifest()

      await loadMainApp(man!['main'])
      hideLoader()
    }
  })

  await getCurrentSW().then(instance => {
    instance?.postMessage(<SWCheckUpdate>{ type: 'check-update' })
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  main()

  const man = await appManifest()
  loadMainApp(man!['main'])
})
