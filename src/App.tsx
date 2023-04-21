import { useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { CodeScanView } from './components/CodeScanView/CodeScanView'
import { configure } from 'mobx'

configure({
  enforceActions: 'never',
})

screen.orientation.lock('portrait')

console.re ||= console

export const App = observer(() => {
  useEffect(() => {}, [])

  return (
    <>
      <CodeScanView autoPlay />
    </>
  )
})
