import { WebCam } from '@/classes/WebCam'
import { observer } from 'mobx-react-lite'
import { Suspense, useEffect, useRef, useState } from 'react'
import { WebCamView } from '../WebCamView/WebCamView'
import style from './index.scss'
import { $orientation, Orientation } from '@/store/orientation'
import { cn } from '@/util/cn'
import QrScanner from 'qr-scanner'
import { Await } from '../Await'
import { Button } from '../_uikit/Button'
import { CornersFrame } from '../_uikit/CornersFrame'
import { SelectList } from '../_uikit/SelectList'
import WebcamSVG from '@/assets/webcam.svg'
import { WebcamDropdownList } from '../_dropdowns/WebcamDropdownList'

const cam = new WebCam()

export type CodeScanViewProps = {
  autoPlay?: boolean
}
export const CodeScanView = observer(({ autoPlay = false }: CodeScanViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // if (autoPlay) cam.startDefault()
  }, [cam])

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

  function handleCamSelect(id: string) {
    cam.stop()
    cam.start(id)
  }

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
        <Button className={style.file}>F</Button>
        <WebcamDropdownList
          selectId={cam.$capabilities?.deviceId}
          onSelect={handleCamSelect}
        />
        <Button className={style.settings}>S</Button>
      </div>
    </div>
  )
})
