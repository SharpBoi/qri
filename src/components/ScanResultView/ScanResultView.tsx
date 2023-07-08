import { useLocation, useNavigate } from 'react-router'
import { Button } from '../_uikit/Button'
import style from './index.scss'
import { ScanResult } from '@/types/img-scan-result'
import { RichText } from '../_uikit/RichText'
import { BrowserButton } from '../_buttons/BrowserButton'
import { ClipboardButton } from '../_buttons/ClipboardButton'
import { ShareButton } from '../_buttons/ShareButton'

export function ScanResultView() {
  const loc = useLocation()
  const nav = useNavigate()

  const result = loc.state as ScanResult

  return (
    <div className={style.view}>
      <div className={style.img_box}>
        <img src={result.imgUrl} />
      </div>
      <footer className={style.footer}>
        <RichText maxHeight="75px" wide value={result.text}></RichText>

        <div className={style.actions}>
          <ShareButton data={result.text} />
          <BrowserButton data={result.text} />
          <ClipboardButton data={result.text} />
        </div>
        <Button wide onClick={() => nav(-1)}>
          Back
        </Button>
      </footer>
    </div>
  )
}
