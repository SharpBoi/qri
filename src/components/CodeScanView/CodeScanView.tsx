import { WebCam } from '@/classes/WebCam'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { WebCamRender } from '../WebCamRender/WebCamRender'
import style from './index.scss'
import { $orientation, Orientation } from '@/store/orientation'
import { cn } from '@/util/cn'
import { Button } from '../_uikit/Button'
import { CornersFrame } from '../_uikit/CornersFrame'
import { WebcamDropdownList } from '../_dropdowns/WebcamDropdownList'
import { openFileDialog } from '@/util/file-dialog'
import FolderSVG from '@/assets/folder.svg'
import HistorySVG from '@/assets/history.svg'
import InstallSVG from '@/assets/install.svg'
import { useNavigate } from 'react-router'
import { PATHS } from '@/routing/paths'
import { Link } from 'react-router-dom'
import { BarcodeScan } from '@/classes/BarcodeScan'
import { historyStore } from '@/store/history'
import { settingsStore } from '@/store/settings'
import { useMount, useUnmount } from '@/hooks/useMount'
import { installStore } from '@/store/install'

export type CodeScanViewProps = {}
export const CodeScanView = observer(({}: CodeScanViewProps) => {
  const nav = useNavigate()

  const { $settings } = settingsStore

  const [cam] = useState(() => new WebCam())
  const [scan] = useState(() => new BarcodeScan())

  const flip = $orientation.$value === Orientation.landscape

  // Start cam
  useMount(() => {
    cam.stop()

    cam.start($settings.camId)
  })
  useUnmount(() => {
    scan.stop()
    cam.stop()
  })

  // Start scan
  useEffect(() => {
    if (!cam.$stream) return

    scan.stop()

    scan.start(cam.$stream)
  }, [scan, cam.$stream])

  // Scan detected
  useEffect(() => {
    if (!scan.$result) return

    // TODO notify that scanned code is empty
    if (scan.$result.text === '') return

    scan.stop()

    historyStore.add(scan.$result)

    nav(PATHS.scanResult, {
      state: scan.$result,
    })
  }, [scan.$result])

  function handleCamSelect(id: string) {
    cam.stop()

    settingsStore.set({ camId: id })

    cam.start(id)
  }

  async function handleFiles() {
    const [file] = await openFileDialog()
    if (!file) return

    nav(PATHS.imageScan, {
      state: file,
    })
  }

  const showInstall = installStore.$isInstallable && installStore.$isInstalled === false

  return (
    <div className={style.code_scan_box}>
      <div className={style.video_box}>
        {cam && (
          <WebCamRender className={cn(style.video, flip && style.flip)} cam={cam} />
        )}
      </div>

      <CornersFrame />

      <div className={style.top_controls}>
        {showInstall ? (
          <Button onClick={() => installStore.askInstallPWA()}>
            <InstallSVG />
          </Button>
        ) : (
          <div />
        )}
      </div>

      <div className={style.controls}>
        <Button onClick={() => cam.turnOnLight()} className={style.flash}>
          Light
        </Button>
        <Button className={style.file} onClick={handleFiles}>
          <FolderSVG />
        </Button>
        <WebcamDropdownList
          selectId={cam.$capabilities?.deviceId}
          onSelect={handleCamSelect}
        />
        <Button className={style.settings}>
          <HistorySVG />
        </Button>
        <Link to={PATHS.history} className={style.settings}></Link>
      </div>
    </div>
  )
})
