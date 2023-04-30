import { Navigate, useLocation, useNavigate } from 'react-router'
import { Button } from '../_uikit/Button'
import style from './index.scss'
import { ImgScanResult } from '@/types/img-scan-result'
import { RichText } from '../_uikit/RichText'
import BrowserSVG from '@/assets/browser.svg'
import ShareSVG from '@/assets/share.svg'
import CopySVG from '@/assets/copy.svg'
import { copyToClipboard } from '@/util/clipboard'
import { openLinkOrText } from '@/util/link'

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
          {navigator.share && (
            <Button onClick={() => navigator.share({ text: result.data })}>
              <ShareSVG />
            </Button>
          )}
          <Button onClick={() => openLinkOrText(result.data)}>
            <BrowserSVG />
          </Button>
          <Button onClick={() => copyToClipboard(result.data)}>
            <CopySVG />
          </Button>
        </div>
        <Button wide onClick={() => nav(-1)}>
          Back
        </Button>
      </footer>
    </div>
  )
}
