import { detectFacingMode, FacingMode } from '@/types/facing'
import { Orientation, $orientation } from '@/store/orientation'
import isMobile from 'is-mobile'
import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  reaction,
  trace,
} from 'mobx'

export type CamProps = {
  width?: number
  height?: number
}

const MAX_CAM_SIZE = 5000

export class WebCam {
  public static get supported() {
    return !!navigator?.mediaDevices?.getUserMedia
  }

  public static async enumerate() {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter(d => d.kind === 'videoinput')
  }

  @observable.ref public $stream?: MediaStream
  @observable.ref public $capabilities?: MediaTrackCapabilities

  @observable.ref private $track: MediaStreamTrack | null = null

  @observable private $isSizeNormalized = false
  @observable private $props: CamProps = {}

  constructor(props?: CamProps) {
    this.$props = props || {}
    makeObservable(this)

    reaction(
      () => this.$track,
      track => {
        if (!track) return

        console.re.log('getConstraints', track.getConstraints?.())
        console.re.log('getSettings', track.getSettings?.())
        console.re.log('getCapabilities', track.getCapabilities?.())
      }
    )

    this.normalizeSizeRX()
    this.applySizeRX()
  }

  @computed public get $flip() {
    return this.$facingMode === FacingMode.user ? -1 : 1
  }
  @computed public get $facingMode() {
    return detectFacingMode(this.$track?.label || '')
  }
  @computed public get $isReady() {
    return !!this.$track
  }

  @action
  public async start() {
    this.$stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: [FacingMode.environment],
        frameRate: { ideal: 60 },
        noiseSuppression: true,
        autoGainControl: true,
        zoom: 0,
        width: { ideal: MAX_CAM_SIZE },
        height: { ideal: MAX_CAM_SIZE },
        // aspectRatio: 16 / 9,
      },
    })

    this.$track = this.$stream.getVideoTracks()[0]

    this.$capabilities = this.$track.getCapabilities()
  }

  @action
  public setSize({ width, height }: Pick<CamProps, 'width' | 'height'>) {
    this.$props.width = width
    this.$props.height = height
  }

  public async turnOnLight() {
    if (!this.$track) return

    const capture = new ImageCapture(this.$track)
    capture.getPhotoCapabilities().then(() => {
      this.$track!.applyConstraints({
        advanced: [{ torch: true }],
      })
    })
  }

  private applySizeRX() {
    autorun(() => {
      if (!this.$isSizeNormalized) return
      if (!this.$track) return

      const { height, width } = this.$props

      this.$track.applyConstraints({
        width,
        height,
      })

      console.re.log('size rx')
    })
  }

  private normalizeSizeRX() {
    const dispose = autorun(() => {
      if (!this.$capabilities) return
      if (!this.$track) return

      this.$track.applyConstraints({
        width: this.$capabilities.width,
        height: this.$capabilities.height,
      })

      console.re.log('norm size rx')
      this.$isSizeNormalized = true
      dispose()
    })
  }
}
