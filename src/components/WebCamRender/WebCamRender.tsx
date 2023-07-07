import { WebCam } from '@/classes/WebCam'
import { cn } from '@/util/cn'
import { noop } from '@/util/noop'
import { ClassProp } from '@/util/props'
import { observer } from 'mobx-react-lite'
import {
  CSSProperties,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import style from './index.scss'

export type WebCamRenderProps = ClassProp & {
  cam: WebCam
}
export const WebCamRender = observer(
  forwardRef<HTMLVideoElement | null, WebCamRenderProps>(({ cam, className }, fref) => {
    const ref = useRef<HTMLVideoElement>(null)

    // Handle passing stream to video node
    useEffect(() => {
      const video = ref.current
      if (!video) return
      if (!cam.$stream) return

      video.srcObject = cam.$stream || null

      return () => {
        video.srcObject = null
      }
    }, [cam.$stream])

    useImperativeHandle<HTMLVideoElement | null, HTMLVideoElement | null>(
      fref,
      () => ref.current
    )

    const flipStyle: CSSProperties = { transform: `scaleX(${cam.$flip})` }

    return (
      <video
        style={flipStyle}
        className={cn(style.video_view, className)}
        autoPlay
        disablePictureInPicture
        playsInline
        controls={false}
        ref={ref}
      ></video>
    )
  })
)
