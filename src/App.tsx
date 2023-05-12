import { useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { CodeScanView } from './components/CodeScanView/CodeScanView'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PATHS } from './routing/paths'
import { ImageScanView } from './components/ImageScanView/ImageScanView'
import { ScanResultView } from './components/ScanResultView/ScanResultView'
import { HistoryView } from './components/HistoryView/HistoryView'

screen.orientation.lock('portrait')

export const App = observer(() => {
  useEffect(() => {}, [])

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path={PATHS.root} element={<CodeScanView />} />

          <Route path={PATHS.imageScan} element={<ImageScanView />} />

          <Route path={PATHS.scanResult} element={<ScanResultView />} />

          <Route path={PATHS.history} element={<HistoryView />} />
        </Routes>
      </BrowserRouter>
    </>
  )
})
