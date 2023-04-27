export {}

const sw = navigator.serviceWorker

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

function register(url: string) {
  return new Promise<void>(res => {
    sw.register(url, { scope: '/' }).then(reg => {
      console.log('load.ts install', reg, reg.installing, reg.waiting, reg.active)

      const instance = reg.installing || reg.waiting || reg.active
      if (!instance) throw new Error('sw INSTANCE missing')

      if (instance?.state === 'activated') return res()

      instance.onstatechange = () => {
        if (instance.state === 'activated') return res()
      }
    })
  })
}

function appManifest() {
  return fetch('manifest.app.json')
    .then(res => res.json())
    .then(json => json as Record<string, string>)
}
function swManifest() {
  return fetch('manifest.sw.json')
    .then(res => res.json())
    .then(json => json as Record<string, string>)
}

async function main() {
  const isRegistered = await hasSW()

  if (!isRegistered) {
    console.log('sw install')

    showLoader()

    const swMan = await swManifest()

    await register(swMan['sw-sw'])
    window.location.reload()
    return
  }

  console.log('sw SKIP install')

  const appMan = await appManifest()

  await loadMainApp(appMan['main'])

  hideLoader()
}

document.addEventListener('DOMContentLoaded', () => {
  main()
})
