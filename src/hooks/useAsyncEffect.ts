import { DependencyList, useEffect, useMemo, useRef } from 'react'
import { useFunc } from './useFunc'

type F = () => void | VoidFunction | Promise<void | VoidFunction>

export function useAsyncEffect(f: F, deps: DependencyList) {
  const memf = useMemo(() => f, deps)

  useEffect(() => {
    let disposed = false
    let cb: VoidFunction | void

    Promise.resolve(memf()).then(result => {
      if (disposed) return result?.()

      cb = result
    })

    return () => {
      disposed = true
      cb?.()
    }
  }, deps)
}
