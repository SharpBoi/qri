import { ScanResult } from '@/types/img-scan-result'
import { readLocalStorage, writeLocalStorage } from '@/util/local-storage'
import { action, makeObservable, observable } from 'mobx'

const HISTORY_KEY = 'history'

export type HistoryItem = {
  result: {
    text: string
  }
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

  @action public add(result: ScanResult) {
    const lastKey = Object.keys(this.$history).map(Number).sort().at(-1) || 0

    const newKey = lastKey + 1

    this.$history = {
      ...this.$history,
      [newKey]: {
        date: new Date().toISOString(),
        result: {
          text: result.text,
        },
      },
    }

    writeLocalStorage(HISTORY_KEY, this.$history)
  }
}

export const historyStore = new HistoryStore()
