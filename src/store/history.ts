import { readLocalStorage, writeLocalStorage } from '@/util/local-storage'
import { action, makeObservable, observable } from 'mobx'
import type QrScanner from 'qr-scanner'

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

    this.$history = readLocalStorage(HISTORY_KEY) || {}
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

    writeLocalStorage(HISTORY_KEY, this.$history)
  }
}

export const historyStore = new HistoryStore()
