import { fileToDataurl } from '@/util/file-dataurl'
import QrScanner from 'qr-scanner'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useNavigation } from 'react-router'
import { Button } from '../_uikit/Button'
import style from './index.scss'
import { PATHS } from '@/routing/paths'
import { ImgScanResult } from '@/types/img-scan-result'
import { $history } from '@/store/history'

export function ImageScan() {
  const loc = useLocation()
  const nav = useNavigate()

  const [url, setUrl] = useState('')
  const [scan, setScan] = useState<QrScanner.ScanResult | 'err' | null>(null)

  const file = loc.state

  if (!(file instanceof File)) {
    return <span>This is not a file</span>
  }

  useEffect(() => {
    ;(async () => {
      const url = await fileToDataurl(file)

      setUrl(url)

      try {
        const scan = await QrScanner.scanImage(file, { returnDetailedScanResult: true })
        setScan(scan)

        $history.add(scan)

        nav(PATHS.scanResult, {
          replace: true,
          state: {
            ...scan,
            imgUrl: url,
          } as ImgScanResult,
        })
      } catch {
        setScan('err')
      }
    })()
  }, [file])

  return (
    <div className={style.view}>
      <div className={style.img_box}>
        <img src={url} />
      </div>
      <footer className={style.footer}>
        {!scan && 'Scaning...'}
        {scan === 'err' && 'Nothing detected'}

        <Button wide onClick={() => nav(-1)}>
          Back
        </Button>
      </footer>
    </div>
  )
}
