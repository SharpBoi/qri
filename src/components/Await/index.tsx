import { useEffect, useRef, useState } from 'react'

type JSXFunc = () => React.ReactNode
type AsyncJSXFunc = () => Promise<React.ReactNode>

type Props = {
  children?: React.ReactNode | Promise<React.ReactNode> | JSXFunc | AsyncJSXFunc
}

export function Await({ children }: Props) {
  const refIsMounted = useRef(true)

  const [s, ss] = useState<any>()

  useEffect(() => {
    refIsMounted.current = true

    return () => {
      refIsMounted.current = false
    }
  }, [])

  if (typeof children === 'function') {
    Promise.resolve(children()).then(ss)
  } else {
    Promise.resolve(children).then(ss)
  }

  return <>{s}</>
}
