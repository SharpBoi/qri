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

function loadAppManifest() {
  return safeFetch('manifest.app.json', MAX_FETCH_TIME)
    .then(r => JSON.parse(r || '') as Manifest)
    .catch(() => undefined)
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

async function appFlow(appMan: Manifest) {
  return new Promise<void>(res => {
    swPostMessage(sw, { type: 'check-update', appManifest: appMan })

    swListenMessage(sw, 'update-result', (msg, dispose) => {
      dispose()

      console.log(msg)

      if (msg.result === 'no') {
        return res()
      }

      if (msg.result === 'updated') {
        window.location.reload()
      }
    })
  })
}

async function main() {
  console.log('Loader v 3')

  const [appMan, swMan] = await Promise.all([loadAppManifest(), loadSWManifest()])

  console.log(appMan, swMan)

  if (swMan) await swFlow(swMan)

  if (appMan) await appFlow(appMan)

  await loadApp()
}

main()
