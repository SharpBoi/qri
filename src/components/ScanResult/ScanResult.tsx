import { useLocation, useNavigate } from 'react-router'
import { Button } from '../_uikit/Button'
import style from './index.scss'
import { ImgScanResult } from '@/types/img-scan-result'
import { RichText } from '../_uikit/RichText'
import { BrowserButton } from '../_buttons/BrowserButton'
import { ClipboardButton } from '../_buttons/ClipboardButton'
import { ShareButton } from '../_buttons/ShareButton'

export function ScanResult() {
  const loc = useLocation()
  const nav = useNavigate()

  const result = loc.state as ImgScanResult

  return (
    <div className={style.view}>
      <div className={style.img_box}>
        <img src={result.imgUrl} />
      </div>
      <footer className={style.footer}>
        <RichText maxHeight="75px" wide value={result.data}></RichText>

        <div className={style.actions}>
          <ShareButton data={result.data} />
          <BrowserButton data={result.data} />
          <ClipboardButton data={result.data} />
        </div>
        <Button wide onClick={() => nav(-1)}>
          Back
        </Button>
      </footer>
    </div>
  )
}
