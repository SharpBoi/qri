import QrScanner from '@/modules/qr-scanner/src/qr-scanner'
import { ImgScanResult } from '@/types/img-scan-result'
import { screenshotVideo } from '@/util/video'
import { action, makeObservable, observable } from 'mobx'

function createVideo() {
  const video = document.createElement('video')
  video.autoplay = true
  video.muted = true
  video.play()
  return video
}

export class BarcodeScan {
  @observable.ref public $result?: ImgScanResult

  private qr?: QrScanner

  constructor() {
    makeObservable(this)
  }

  @action
  public async start(videoStream: MediaStream) {
    this.$result = undefined

    const video = createVideo()
    video.srcObject = videoStream

    this.qr = new QrScanner(
      video,
      result => {
        this.$result = {
          ...result,
          imgUrl: screenshotVideo(video),
        }
      },
      {
        returnDetailedScanResult: true,
        calculateScanRegion(video) {
          return {
            x: 0,
            y: 0,
            width: video.videoWidth,
            height: video.videoHeight,
          }
        },
      }
    )

    await this.qr.start()
  }

  public stop() {
    // order is correct
    this.qr?.$video && (this.qr.$video.srcObject = null)
    this.qr?.$video.remove()

    this.qr?.stop()
    this.qr?.destroy()
  }
}
