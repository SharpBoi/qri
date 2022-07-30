import { useEffect, useRef } from 'react'
import { FacingMode } from './types/facing'
import { observer } from 'mobx-react-lite'
import { CameraView } from './components/CameraView/CameraView'
import { CodeScanView } from './components/CodeScanView/CodeScanView'

export const App = observer(() => {
  useEffect(() => {}, [])

  return (
    <>
      <CodeScanView autoPlay />
    </>
  )
})
