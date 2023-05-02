import { action, makeObservable, observable } from 'mobx'
import QrScanner from 'qr-scanner'

const HISTORY_KEY = 'history'

export type HistoryItem = {
  result: QrScanner.ScanResult
  date: string
}

export type HistoryDataframe = {
  [id: number]: HistoryItem
}

class HistoryStore {
  @observable public $history: HistoryDataframe = {}

  constructor() {
    makeObservable(this)

    this.read()
  }

  @action public add(result: QrScanner.ScanResult) {
    const lastKey = Object.keys(this.$history).map(Number).sort().at(-1) || 0

    const newKey = lastKey + 1

    this.$history = {
      ...this.$history,
      [newKey]: {
        date: new Date().toISOString(),
        result,
      },
    }

    this.write(this.$history)
  }

  private write(data: HistoryDataframe) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(data))
  }

  private read() {
    try {
      const value = localStorage.getItem(HISTORY_KEY) || ''

      if (!value) return

      this.$history = JSON.parse(value) as HistoryDataframe
    } catch {}
  }
}

export const $history = new HistoryStore()
