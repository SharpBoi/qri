import { FacingMode } from "@/types/facing"
import { makeObservable, observable } from "mobx"

export type CamProps = {
  width: ConstrainULong
  height: ConstrainULong
}

export class WebCam {
  @observable public $mediaStream: MediaStream | null = null

  constructor() {
    makeObservable(this)
  }

  public get supported() {
    return !!(navigator?.mediaDevices?.getUserMedia)
  }

  public async start() {
    const media = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: FacingMode.environment,
        frameRate: 60,
        noiseSuppression: true,
      }
    })

    this.$mediaStream = media
  }
}