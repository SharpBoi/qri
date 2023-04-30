import { WebCam } from '@/classes/WebCam'
import { observer } from 'mobx-react-lite'
import { Suspense, useContext, useEffect, useRef, useState } from 'react'
import { WebCamView } from '../WebCamView/WebCamView'
import style from './index.scss'
import { $orientation, Orientation } from '@/store/orientation'
import { cn } from '@/util/cn'
import QrScanner from 'qr-scanner'
import { Button } from '../_uikit/Button'
import { CornersFrame } from '../_uikit/CornersFrame'
import { WebcamDropdownList } from '../_dropdowns/WebcamDropdownList'
import { openFileDialog } from '@/util/file-dialog'
import FolderSVG from '@/assets/folder.svg'
import { useNavigate } from 'react-router'
import { PATHS } from '@/routing/paths'

const cam = new WebCam()

export type CodeScanViewProps = {
  autoPlay?: boolean
}
export const CodeScanView = observer(({ autoPlay = false }: CodeScanViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  const nav = useNavigate()

  useEffect(() => {
    if (autoPlay) cam.startDefault()
  }, [cam])

  function handleCamSelect(id: string) {
    cam.stop()
    cam.start(id)
  }

  async function handleFiles() {
    const [file] = await openFileDialog()
    if (!file) return

    nav(PATHS.imageScan, {
      state: file,
    })
  }

  const flip = $orientation.$value === Orientation.landscape

  // TEST Handle qr
  // useEffect(() => {
  //   ;(async () => {
  //     if (!cam.$stream) return
  //     if (!videoRef.current) return

  //     const qr = new QrScanner(
  //       videoRef.current,
  //       r => {
  //         console.log(r)
  //       },
  //       {
  //         // highlightScanRegion: true,
  //         // highlightCodeOutline: true,
  //       }
  //     )
  //     await qr.start()
  //   })()
  // }, [cam.$stream])

  return (
    <div className={style.code_scan_box}>
      <div className={style.video_box}>
        {cam && (
          <WebCamView
            ref={videoRef}
            className={cn(style.video, flip && style.flip)}
            cam={cam}
          />
        )}
      </div>

      <CornersFrame />

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
        <Button className={style.settings}>S</Button>
      </div>
    </div>
  )
})
