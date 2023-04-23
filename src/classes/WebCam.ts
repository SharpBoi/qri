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
  @observable.ref public $video?: HTMLVideoElement
  @observable.ref public $capabilities?: MediaTrackCapabilities

  @observable.ref private $track?: MediaStreamTrack | null
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
  public async start(deviceId: string) {
    await this._start({
      audio: false,
      video: {
        deviceId: { exact: deviceId },
        frameRate: { ideal: 60 },
        noiseSuppression: { ideal: true },
        autoGainControl: { ideal: true },
        zoom: 0,
        width: { ideal: MAX_CAM_SIZE },
        height: { ideal: MAX_CAM_SIZE },
      },
    })
  }

  @action
  public async startDefault() {
    await this._start({
      audio: false,
      video: {
        facingMode: [FacingMode.environment],
        frameRate: { ideal: 60 },
        noiseSuppression: { ideal: true },
        autoGainControl: { ideal: true },
        zoom: 0,
        width: { ideal: MAX_CAM_SIZE },
        height: { ideal: MAX_CAM_SIZE },

        torch: true,
        advanced: [
          {
            torch: true,
          },
        ],
      },
    })
  }

  public stop() {
    this.$track?.stop()
    this.$stream?.stop?.()
  }

  @action
  public setSize({ width, height }: Pick<CamProps, 'width' | 'height'>) {
    this.$props.width = width
    this.$props.height = height
  }

  public async turnOnLight() {
    /////////////////
    // const media = await navigator.mediaDevices.getUserMedia({
    //   video: {
    //     torch: true,
    //     advanced: [
    //       {
    //         torch: true,
    //       },
    //     ],
    //   },
    // })

    const devices = await WebCam.enumerate()
    const last = devices.at(-1)

    const media = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: last?.deviceId },
    })

    const track = media.getVideoTracks()[0]

    await track.applyConstraints({
      advanced: [{ torch: true }],
    })

    // ------------------
    // if (!this.$track) return

    // this.$track!.applyConstraints({
    //   advanced: [{ torch: true }],
    // })
  }

  @action
  private async _start(constraints: MediaStreamConstraints) {
    this.$stream = await navigator.mediaDevices.getUserMedia(constraints)

    this.$track = this.$stream.getVideoTracks()[0]

    this.$capabilities = this.$track.getCapabilities()

    await this.normalizeSize()

    this.$video = document.createElement('video')
    this.$video.autoplay = true
    this.$video.disablePictureInPicture = true
    this.$video.playsInline = true
    this.$video.controls = false
    this.$video.srcObject = this.$stream
  }

  private applySizeRX() {
    autorun(() => {
      if (!this.$track) return

      const { height, width } = this.$props

      this.$track.applyConstraints({
        width,
        height,
      })
    })
  }

  private async normalizeSize() {
    if (!this.$capabilities) return
    if (!this.$track) return

    await this.$track.applyConstraints({
      width: this.$capabilities.width,
      height: this.$capabilities.height,
    })
  }
}
