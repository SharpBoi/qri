export function readLocalStorage<T>(key: string) {
  try {
    const value = localStorage.getItem(key) || ''

    return JSON.parse(value) as T
  } catch {}
}

export function writeLocalStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data))
}
