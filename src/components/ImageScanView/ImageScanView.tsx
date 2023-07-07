import { fileToDataurl } from '@/util/file-dataurl'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useNavigation } from 'react-router'
import { Button } from '../_uikit/Button'
import style from './index.scss'
import { PATHS } from '@/routing/paths'
import { ScanResult } from '@/types/img-scan-result'
import { historyStore } from '@/store/history'
import { observer } from 'mobx-react-lite'
import { BarcodeScan } from '@/classes/BarcodeScan'

export const ImageScanView = observer(() => {
  const loc = useLocation()
  const nav = useNavigate()

  const [url, setUrl] = useState('')
  const [scan, setScan] = useState<ScanResult | null | 'err'>(null)

  const file = loc.state

  if (!(file instanceof File)) {
    return <span>This is not a file</span>
  }

  useEffect(() => {
    ;(async () => {
      const url = await fileToDataurl(file)

      setUrl(url)

      try {
        const scanner = new BarcodeScan()

        const result: ScanResult = {
          text: await scanner.scanImage(url),
          imgUrl: url,
        }

        historyStore.add(result)

        nav(PATHS.scanResult, {
          replace: true,
          state: result,
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
})
