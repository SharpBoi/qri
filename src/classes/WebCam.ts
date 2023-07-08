import { detectFacingMode, FacingMode } from '@/types/facing'
import { enumerateDevices, getDeviceById, getDeviceByName } from '@/util/device'
import { action, computed, makeObservable, observable } from 'mobx'

const MAX_CAM_WIDTH = 500 //window.innerWidth * 2
const MAX_CAM_HEIGHT = 500

export class WebCam {
  public static get supported() {
    return !!navigator?.mediaDevices?.getUserMedia
  }

  @observable.ref public $stream?: MediaStream
  @observable.ref public $video?: HTMLVideoElement
  @observable.ref public $capabilities?: MediaTrackSettings
  @observable public $deviceName?: string

  @observable.ref private $track?: MediaStreamTrack | null

  constructor() {
    makeObservable(this)
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
  public async start(name?: string) {
    const deviceId = await getDeviceByName(name || '').then(d => d?.deviceId)

    const videoCfg: MediaTrackConstraints = {
      frameRate: { ideal: 60 },
      noiseSuppression: { ideal: true },
      autoGainControl: { ideal: true },
      zoom: 0,
      width: { ideal: MAX_CAM_WIDTH },
      height: { ideal: MAX_CAM_HEIGHT },
    }

    if (deviceId) {
      videoCfg.deviceId = { ideal: deviceId }
    } else {
      videoCfg.facingMode = [FacingMode.environment]
    }

    await this._start({
      audio: false,
      video: videoCfg,
    })
  }

  public stop() {
    this.$track?.stop()
    this.$stream?.stop?.()
  }

  /** @deprecated */
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

    const devices = await enumerateDevices()
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

    this.$capabilities = this.$track.getSettings()

    this.$deviceName = await getDeviceById(this.$capabilities.deviceId || '').then(
      d => d?.label
    )

    await this.normalizeSize()

    this.$video = document.createElement('video')
    this.$video.autoplay = true
    this.$video.disablePictureInPicture = true
    this.$video.playsInline = true
    this.$video.controls = false
    this.$video.srcObject = this.$stream
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
