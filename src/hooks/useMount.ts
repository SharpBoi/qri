import { EffectCallback, useEffect, useRef } from 'react'
import { useFunc } from './useFunc'

export function useMount(fn: VoidFunction) {
  useEffect(() => fn(), [])
}
export function useUnmount(fn: VoidFunction) {
  const ref = useRef(fn)
  ref.current = fn

  useEffect(() => {
    return () => ref.current()
  }, [ref])
}
