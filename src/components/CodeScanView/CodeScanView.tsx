import { WebCam } from '@/classes/WebCam'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import { nil } from '@/util/nil'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef, useState } from 'react'
import { CameraView } from '../CameraView/CameraView'
import style from './index.scss'

export type CodeScanViewProps = {
  cam?: WebCam
  autoPlay?: boolean
}
export const CodeScanView = observer(
  ({ cam = new WebCam(), autoPlay = false }: CodeScanViewProps) => {
    useEffect(() => {
      if (autoPlay) cam.start()
    }, [cam])

    return (
      <div onClick={() => cam.turnOnLight()} className={style.code_scan_box}>
        <div className={style.sight_box}>
          <div className={style.sight}></div>
        </div>
        {cam && <CameraView domControlsStreamSize cam={cam} />}
      </div>
    )
  }
)
