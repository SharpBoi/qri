import { noop } from '@/util/noop'
import { useCallback, useRef } from 'react'

export function useFunc<F extends typeof noop>(f: F) {
  const ref = useRef<F>(f)
  ref.current = f

  const func = useCallback(
    (...p: Parameters<F>) => {
      return ref.current(...p) as ReturnType<F>
    },
    [ref]
  )

  return func
}
