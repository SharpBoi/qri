import { HistoryItem } from '@/store/history'
import style from './index.scss'
import { memo } from 'react'
import { ShareButton } from '../_buttons/ShareButton'
import { ClipboardButton } from '../_buttons/ClipboardButton'
import { openLinkOrText } from '@/util/link'
import { Button } from '../_uikit/Button'
import EyeSVG from '@/assets/eye.svg'

type Props = {
  data: HistoryItem
}

export const Item = memo(({ data }: Props) => {
  const date = new Date(data.date)
    .toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',

      hour: '2-digit',
      minute: '2-digit',
    })
    .toLowerCase()
    .replace(',', ' ')

  function handleClick() {
    openLinkOrText(data.result.data)
  }

  return (
    <div className={style.item} onClick={handleClick}>
      <div>{data.result.data}</div>
      <div className={style.controls}>
        <div className={style.date}>{date}</div>

        <ShareButton data={data.result.data} />
        <Button>
          <EyeSVG />
        </Button>
        <ClipboardButton data={data.result.data} />
      </div>
    </div>
  )
})
