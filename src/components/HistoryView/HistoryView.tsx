import { observer } from 'mobx-react-lite'
import style from './index.scss'
import { Button } from '../_uikit/Button'
import { $history } from '@/store/history'
import { Item } from './Item'
import { useNavigate } from 'react-router'

export const HistoryView = observer(() => {
  const nav = useNavigate()

  const items = Object.entries($history.$history)

  return (
    <div className={style.history}>
      <header className={style.header}>History</header>

      <div className={style.list}>
        {items.map(([id, data]) => (
          <Item key={id} data={data} />
        ))}
      </div>

      <footer className={style.footer}>
        <Button wide onClick={() => nav(-1)}>
          Back
        </Button>
      </footer>
    </div>
  )
})
