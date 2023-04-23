import style from './index.scss'
import { Corner } from '../Corner'

type Props = {
  className?: string
}
export function CornersFrame({ className }: Props) {
  return (
    <div className={style.corners}>
      <Corner />
      <Corner className={style.rt} />
      <Corner className={style.rb} />
      <Corner className={style.lb} />
    </div>
  )
}
