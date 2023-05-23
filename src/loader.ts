import { Manifest } from 'tools/rollup/plugins/manifest'
import {
  getSW,
  swListenMessage,
  swPostMessage,
  safeFetch,
  registerSW,
  getSWFileName,
} from './service-worker/sw-util'

export {}

const sw = navigator.serviceWorker

const MAX_FETCH_TIME = 700

function loadApp() {
  return import('./main')
}

function loadSWManifest() {
  return safeFetch('manifest.sw.json', MAX_FETCH_TIME)
    .then(r => JSON.parse(r || '') as Manifest)
    .catch(() => undefined)
}

async function checkSWneedUpdate(swMan: Manifest) {
  try {
    const currentSWfileName = await getSWFileName()

    const actualSWfileName = swMan.chunks['sw'][0]

    return currentSWfileName !== actualSWfileName
  } catch {
    return false
  }
}

async function swFlow(swMan: Manifest) {
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

  const swMan = await loadSWManifest()

  console.log({ swMan })

  if (swMan) await swFlow(swMan)

  await loadApp()
}

main()
