import { ScanResult } from '@/types/img-scan-result'
import { createVideo, screenshotVideo, videoFromStream } from '@/util/video'
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import { action, makeObservable, observable } from 'mobx'

const HINTS = new Map([[DecodeHintType.POSSIBLE_FORMATS, BarcodeFormat.QR_CODE]])

export class BarcodeScan {
  @observable.ref public $result?: ScanResult

  private decoder?: IScannerControls
  private video?: HTMLVideoElement

  constructor() {
    makeObservable(this)
  }

  public async scanImage(imgUrl: string) {
    const reader = new BrowserQRCodeReader(HINTS)

    const r = await reader.decodeFromImageUrl(imgUrl)

    return r.getText()
  }

  @action
  public async start(videoStream: MediaStream) {
    this.$result = undefined

    this.video = videoFromStream(videoStream)

    const reader = new BrowserQRCodeReader(HINTS)

    this.decoder = await reader.decodeFromStream(videoStream, undefined, async result => {
      if (!result) return (this.$result = undefined)

      this.$result = {
        text: result.getText(),
        imgUrl: await screenshotVideo(this.video!),
      }
    })
  }

  public stop() {
    this.decoder?.stop()
    this.video && (this.video.srcObject = null)
    this.video?.remove()
  }
}
