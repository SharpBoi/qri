import { Manifesto } from 'tools/rollup/plugins/manifest'
import { getSW, safeFetch, registerSW, getSWFileName } from './service-worker/sw-util'
import { Capacitor } from '@capacitor/core'

export {}

const sw = navigator.serviceWorker

const MAX_FETCH_TIME = 700

function loadApp() {
  return import('./main')
}

function loadSWManifest() {
  return safeFetch('manifest.sw.json', MAX_FETCH_TIME)
    .then(r => r?.json())
    .then(j => j as Manifesto | undefined)
}

async function checkSWneedUpdate(swMan: Manifesto) {
  try {
    const currentSWfileName = await getSWFileName()

    const actualSWfileName = swMan.chunks['sw'][0]

    return currentSWfileName !== actualSWfileName
  } catch {
    return false
  }
}

async function swFlow(swMan: Manifesto) {
  const swNeedUpdate = await checkSWneedUpdate(swMan)
  const hasSW = !!(await getSW())

  console.log({ swNeedUpdate })

  if (swNeedUpdate || !hasSW) {
    await registerSW(swMan.chunks['sw'][0])
    window.location.reload()
  }
}

async function main() {
  console.log('Loader v 6')

  console.log(Capacitor.getPlatform())

  if (Capacitor.getPlatform() === 'web') {
    const swMan = await loadSWManifest()

    console.log({ swMan })

    if (swMan) await swFlow(swMan)
  }

  await loadApp()
}

main()
