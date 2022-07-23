import { useEffect, useRef } from 'react'
import { FacingMode } from './types/facing'
import { observer } from 'mobx-react-lite'

async function test(video: HTMLVideoElement) {
  // Hint: getUserMedia may be missing if not HTTPS
  const media = await navigator.mediaDevices.getUserMedia({
    video: {
      frameRate: 60,
      noiseSuppression: true,
      facingMode: FacingMode.environment,
      // width: 1100,
      // height: 1100,
    },
    audio: false,
  })

  video.srcObject = media

  const devs = await navigator.mediaDevices.enumerateDevices()
  return devs
}

export const App = observer(() => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current) return

    console.log(videoRef.current)

    test(videoRef.current)
  }, [])

  return <video width={'100%'} autoPlay ref={videoRef}></video>
})
