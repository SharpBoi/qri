import { WebCam } from '@/classes/WebCam'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import { nil } from '@/util/nil'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef, useState } from 'react'
import { CameraView } from '../CameraView/CameraView'
import style from './index.scss'
import { $bar } from '@/store/url-bar'
import { $orientation, Orientation } from '@/store/orientation'
import { cn } from '@/util/cn'
import { Corner } from '../Corner'

const cam = new WebCam()

export type CodeScanViewProps = {
  cam?: WebCam
  autoPlay?: boolean
}
export const CodeScanView = observer(
  ({
    // cam = new WebCam({ width: 2000, height: 1000 }),
    autoPlay = false,
  }: CodeScanViewProps) => {
    useEffect(() => {
      if (autoPlay) cam.start()
    }, [cam])

    const flip = $orientation.$value === Orientation.landscape

    return (
      <div className={style.code_scan_box}>
        <div className={style.sight_box}>
          <Corner />
          {/* <div onClick={() => cam.turnOnLight()} className={style.sight}></div> */}
        </div>
        <div className={style.video_box}>
          {cam && (
            <CameraView className={cn(style.video, flip && style.flip)} cam={cam} />
          )}
        </div>
      </div>
    )
  }
)
