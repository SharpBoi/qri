import { cn } from '@/util/cn'
import style from './index.scss'

type Props = {
  className?: string
}
export function Corner({ className }: Props) {
  return (
    <div className={cn(style.box, className)}>
      <div className={cn(style.stick, style.top)}></div>
      <div className={cn(style.stick, style.left)}></div>
    </div>
  )
}
