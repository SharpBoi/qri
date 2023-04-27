export {}

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

function appManifest(noCache?: boolean) {
  return pull(`manifest.app.json`, noCache)
    .then(res => res.json())
    .then(json => json as Record<string, any>)
}
function swManifest(noCache?: boolean) {
  return pull('manifest.sw.json', noCache)
    .then(res => res.json())
    .then(json => json as Record<string, any>)
}

async function checkSWneedUpdate() {
  try {
    const currentSW = await getCurrentSW()
    if (!currentSW) return false

    const swMan = await swManifest(true)

    const currentSWfileName = new URL(currentSW.scriptURL).pathname.split('/').at(-1)

    const actualSWfileName = swMan['sw-sw']

    return currentSWfileName !== actualSWfileName
  } catch {
    return false
  }
}

async function main() {
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

      showLoader()

      const swMan = await swManifest(true)

      await register(swMan['sw-sw'])
      window.location.reload()
      return
    }
  } catch {}

  console.log('sw SKIP install')

  const appMan = await appManifest()

  await loadMainApp(appMan['main'])

  hideLoader()
}

document.addEventListener('DOMContentLoaded', () => {
  main()
})
