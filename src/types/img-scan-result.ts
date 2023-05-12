import type QrScanner from 'qr-scanner'

export type ImgScanResult = QrScanner.ScanResult & {
  imgUrl: string
}
