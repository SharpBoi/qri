export {}

const MANIFEST_URL = 'manifest.json'

const sw = navigator.serviceWorker

function loadMainApp(manifest: any) {
  const script = document.createElement('script')
  script.src = manifest.main
  script.type = 'module'
  script.onload = () => {
    document.body.querySelector('#loader')?.remove()
  }

  document.body.appendChild(script)
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

function fetchManifest() {
  return fetch(MANIFEST_URL)
    .then(res => res.json())
    .then(json => json as Record<string, string>)
}

async function main() {
  const manifest = await fetchManifest()

  const isRegistered = await hasSW()

  if (!isRegistered) {
    await register(manifest['sw-sw'])
  }

  await loadMainApp(manifest)
}

document.addEventListener('DOMContentLoaded', () => {
  main()
})
