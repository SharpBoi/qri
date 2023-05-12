import { readLocalStorage, writeLocalStorage } from '@/util/local-storage'
import { action, makeObservable, observable } from 'mobx'

const SETTINGS_KEY = 'settings'

type Settings = {
  camId?: string
}

class SettingsStore {
  @observable.ref public $settings: Settings = {}

  constructor() {
    makeObservable(this)

    this.$settings = readLocalStorage(SETTINGS_KEY) || {}
  }

  @action public set(settings: Partial<Settings>) {
    this.$settings = {
      ...this.$settings,
      ...settings,
    }

    writeLocalStorage(SETTINGS_KEY, this.$settings)
  }
}

export const settingsStore = new SettingsStore()
