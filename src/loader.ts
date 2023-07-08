import { Manifesto } from 'tools/rollup/plugins/manifest'
import { getSW, safeFetch, registerSW, getSWFileName } from './service-worker/sw-util'
import { Capacitor } from '@capacitor/core'

export {}

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
  console.log('Loader v 7')

  const isHttps = window.location.protocol.startsWith('https')
  const isWeb = Capacitor.getPlatform() === 'web'

  const isSWAllowed = isWeb && isHttps

  if (isSWAllowed) {
    const swMan = await loadSWManifest()

    if (swMan) await swFlow(swMan)
  }

  await loadApp()
}

main()
