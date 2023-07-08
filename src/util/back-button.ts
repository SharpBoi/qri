import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

export function handleBackButtonRouting() {
  App.addListener('backButton', () => {
    if (Capacitor.getPlatform() === 'web') return

    window.history.back()
  })
}
