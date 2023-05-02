import { useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { CodeScanView } from './components/CodeScanView/CodeScanView'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PATHS } from './routing/paths'
import { ImageScan } from './components/ImageScan/ImageScan'
import { ScanResult } from './components/ScanResult/ScanResult'
import { HistoryView } from './components/HistoryView/HistoryView'

screen.orientation.lock('portrait')

export const App = observer(() => {
  useEffect(() => {}, [])

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path={PATHS.root} element={<CodeScanView autoPlay />} />

          <Route path={PATHS.imageScan} element={<ImageScan />} />

          <Route path={PATHS.scanResult} element={<ScanResult />} />

          <Route path={PATHS.history} element={<HistoryView />} />
        </Routes>
      </BrowserRouter>
    </>
  )
})
