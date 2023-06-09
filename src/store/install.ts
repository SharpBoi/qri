import { getInstalledRelatedApps } from '@/util/getInstalledRelatedApps'
import { computed, makeObservable, observable } from 'mobx'

/**
 * The BeforeInstallPromptEvent is fired at the Window.onbeforeinstallprompt handler
 * before a user is prompted to "install" a web site to a home screen on mobile.
 *
 * @deprecated Only supported on Chrome and Android Webview.
 */
interface BeforeInstallPromptEvent extends Event {
  /**
   * Returns an array of DOMString items containing the platforms on which the event was dispatched.
   * This is provided for user agents that want to present a choice of versions to the user such as,
   * for example, "web" or "play" which would allow the user to chose between a web version or
   * an Android version.
   */
  readonly platforms: Array<string>

  /**
   * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
   */
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>

  /**
   * Allows a developer to show the install prompt at a time of their own choosing.
   * This method returns a Promise.
   */
  prompt(): Promise<void>
}

class InstallStore {
  @observable public $isInstalled?: boolean

  @observable.ref private $event: BeforeInstallPromptEvent | null = null

  constructor() {
    makeObservable(this)

    getInstalledRelatedApps().then(apps => (this.$isInstalled = apps && apps.length > 0))
  }

  @computed public get $isInstallable() {
    return !!this.$event
  }

  public initPWAInstaller() {
    return new Promise<void>(res => {
      window.addEventListener('beforeinstallprompt', e => {
        this.$event = e as BeforeInstallPromptEvent
        console.log('BEFORE INSTALL', e)
        res()
      })
    })
  }

  public async askInstallPWA() {
    const e = await this.$event

    if (!e) return false

    // await ?
    e.prompt()

    const result = await e.userChoice

    return result
  }
}

export const installStore = new InstallStore()
