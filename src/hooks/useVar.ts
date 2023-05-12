import { useCallback, useMemo, useState } from 'react'

type tt = {
  (): void
  kek: 123
}

export function useVar<T>(initial: T | (() => T)) {
  const [v, sv] = useState(initial)

  function setter(): T
  function setter(v: T): void
  function setter(...params: [T] | []) {
    if (params.length === 0) return v

    const [arg] = params

    sv(arg)
  }

  const memSetter = useCallback(setter, [v])

  return memSetter
}
