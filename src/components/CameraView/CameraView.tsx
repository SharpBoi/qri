import { WebCam } from '@/classes/WebCam'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import { cn } from '@/util/cn'
import { noop } from '@/util/noop'
import { WithClass } from '@/util/props'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import style from './index.scss'

export type CameraViewProps = WithClass & {
  cam?: WebCam
  onCam?: (cam: WebCam) => void
  domControlsStreamSize?: boolean
}
export const CameraView = observer(
  ({
    cam = new WebCam(),
    onCam = noop,
    className,
    domControlsStreamSize = false,
  }: CameraViewProps) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const { contentRect } = useResizeObserver(videoRef.current) || {}

    useEffect(() => void onCam(cam), [cam])

    useEffect(() => {
      const video = videoRef.current
      if (!video) return

      video.srcObject = cam.$mediaStream

      return () => void (video.srcObject = null)
    }, [cam.$mediaStream])

    useEffect(() => {
      if (!domControlsStreamSize) return
      if (!contentRect) return

      const { width, height } = contentRect

      cam.setSize({
        width: width,
        height: height,
      })
    }, [contentRect])

    return (
      <video className={cn(style.video_view, className)} autoPlay ref={videoRef}></video>
    )
  }
)
