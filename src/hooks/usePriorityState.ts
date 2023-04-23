import { useEffect, useState } from 'react'
import { useFunc } from './useFunc'

export function usePriorityState<T>(
  init: T,
  prioprity: T | undefined,
  onChange?: (s: T) => void
) {
  const [state, setState] = useState(init)

  const setter = useFunc((value: T) => {
    console.log(value, prioprity)

    onChange?.(value)

    if (prioprity === undefined) {
      setState(value)
      return
    }
    // if prioprity is NOT UNDEFINED, then we cant set state by ours
  })

  useEffect(() => {
    if (prioprity === undefined) return

    setState(prioprity)
    onChange?.(prioprity)
  }, [prioprity])

  return [state, setter] as const
}
