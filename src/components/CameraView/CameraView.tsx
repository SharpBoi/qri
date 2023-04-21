import { WebCam } from '@/classes/WebCam'
import { cn } from '@/util/cn'
import { noop } from '@/util/noop'
import { WithClass } from '@/util/props'
import { observer } from 'mobx-react-lite'
import QrScanner from 'qr-scanner'
import {
  CSSProperties,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import style from './index.scss'

export type CameraViewProps = WithClass & {
  cam?: WebCam
  onCam?: (cam: WebCam) => void
}
export const CameraView = observer(
  forwardRef<HTMLVideoElement | null, CameraViewProps>(
    ({ cam: camProp, onCam = noop, className }, fref) => {
      const ref = useRef<HTMLVideoElement>(null)

      const [cam] = useState(() => camProp || new WebCam())

      useEffect(() => onCam(cam), [cam])

      // Handle passing stream to video node
      useEffect(() => {
        const video = ref.current
        if (!video) return

        video.srcObject = cam.$stream || null

        return () => {
          video.srcObject = null
        }
      }, [cam.$stream])

      useImperativeHandle<HTMLVideoElement | null, HTMLVideoElement | null>(
        fref,
        () => ref.current
      )

      // TEST Handle qr
      useEffect(() => {
        const video = ref.current
        if (!video) return

        // const qr = new QrScanner(
        //   video,
        //   r => {
        //     console.log(r)
        //   },
        //   {
        //     // highlightScanRegion: true,
        //     // highlightCodeOutline: true,
        //   }
        // )
        // qr.start()
      }, [])

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
    }
  )
)
