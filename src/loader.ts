import { Manifest } from 'tools/rollup/plugins/manifest'

export {}

const sw = navigator.serviceWorker

function loadApp() {
  return import('./main')
}

async function safeFetch(url: string) {
  try {
    const res = await fetch(url)
    return res.text()
  } catch {
    return undefined
  }
}

function loadAppManifest() {
  return safeFetch('manifest.app.json')
    .then(r => JSON.parse(r || '') as Manifest)
    .catch(() => undefined)
}
function loadSWManifest() {
  return safeFetch('manifest.sw.json')
    .then(r => JSON.parse(r || '') as Manifest)
    .catch(() => undefined)
}

async function currentRegistration() {
  return navigator.serviceWorker.getRegistration()
}

async function getCurrentSW() {
  const reg = await currentRegistration()
  return reg?.installing || reg?.waiting || reg?.active || undefined
}

async function checkSWneedUpdate(swMan: any) {
  try {
    const currentSW = await getCurrentSW()
    if (!currentSW) return false

    const currentSWfileName = new URL(currentSW.scriptURL).pathname.split('/').at(-1)

    const actualSWfileName = swMan['sw-sw']

    return currentSWfileName !== actualSWfileName
  } catch {
    return false
  }
}

function registerSW(url: string) {
  return new Promise<void>(async res => {
    const reg = await sw.register(url, { scope: '/' })
    console.log('loader.ts install', reg, reg.installing, reg.waiting, reg.active)

    const instance = reg.installing || reg.waiting || reg.active
    if (!instance) throw new Error('sw INSTANCE missing')

    if (instance?.state === 'activated') return res()

    instance.onstatechange = () => {
      if (instance.state === 'activated') return res()
    }
  })
}

async function swFlow(swMan: Manifest) {
  const swNeedUpdate = await checkSWneedUpdate(swMan)

  if (swNeedUpdate) {
    const reg = await currentRegistration()
    await reg?.unregister()
  }

  const hasSW = !!(await getCurrentSW())

  if (!hasSW) {
    await registerSW(swMan.chunks['sw-sw'][0])

    window.location.reload()
  }
}

async function main() {
  const [appMan, swMan] = await Promise.all([loadAppManifest(), loadSWManifest()])

  // if (swMan) await swFlow(swMan)

  console.log('swFlow done')

  loadApp()
}

main()
