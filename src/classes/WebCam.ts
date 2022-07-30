import { FacingMode } from '@/types/facing'
import { autorun, makeObservable, observable } from 'mobx'

export type CamProps = {
  width?: ConstrainULong
  height?: ConstrainULong
}
export class WebCam {
  public static get supported() {
    return !!navigator?.mediaDevices?.getUserMedia
  }

  @observable public $mediaStream: MediaStream | null = null

  @observable private $props: CamProps = {}

  constructor(props?: CamProps) {
    this.$props = props || {}
    makeObservable(this)

    // RX apply size
    autorun(() => {
      if (!this.$mediaStream) return

      const { height, width } = this.$props

      const tracks = this.$mediaStream.getVideoTracks()
      tracks.forEach(track => track.applyConstraints({ width, height }))
    })
  }

  public async start() {
    const media = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: FacingMode.environment,
        frameRate: 60,
        noiseSuppression: true,
        width: this.$props?.width,
        height: this.$props?.height,
      },
    })

    this.$mediaStream = media
  }

  public setSize(props: Pick<CamProps, 'width' | 'height'>) {
    this.$props = { ...this.$props, ...props }
  }

  public async turnOnLight() {
    if (!this.$mediaStream) return

    const tracks = this.$mediaStream.getVideoTracks()
    tracks.forEach(async track => {
      const capture = new ImageCapture(track)
      const caps = await capture.getPhotoCapabilities()

      track.applyConstraints({
        advanced: [{ torch: true }],
      })
    })
  }
}
