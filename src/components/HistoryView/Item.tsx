import { HistoryItem } from '@/store/history'
import style from './index.scss'
import { memo } from 'react'

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
    .replace(',', '  ')

  return (
    <div className={style.item}>
      <div>{data.result.data}</div>
      <div className={style.date}>{date}</div>
    </div>
  )
})
