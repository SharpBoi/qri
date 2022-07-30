import { nil } from '@/util/nil'
import { useEffect, useState } from 'react'

type ResizeCallback = (entry: ResizeObserverEntry) => void
const element_cb = new Map<Element, ResizeCallback>()

// TOdo replace with polyfill
const resize = new ResizeObserver(entries => {
  entries.forEach(entry => {
    const cb = element_cb.get(entry.target)
    if (!cb) return

    cb(entry)
  })
})

export function useResizeObserver(element?: HTMLElement | nil) {
  const [entry, setEntry] = useState<ResizeObserverEntry>()

  useEffect(() => {
    const el = element

    if (!el) return
    if (element_cb.has(el)) return

    const callback: ResizeCallback = entry => {
      setEntry(entry)
    }

    element_cb.set(el, callback)
    resize.observe(el)

    return () => {
      resize.unobserve(el)
      element_cb.delete(el)
    }
  }, [element])

  return entry
}
