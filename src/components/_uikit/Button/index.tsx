import { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import style from './index.scss'
import { cn } from '@/util/cn'
import { ToggleProp } from '@/util/props'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {} & ToggleProp

export function Button({
  children,
  className,
  toggle,
  onToggle,
  onClick,
}: PropsWithChildren<Props>) {
  function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    onToggle?.(!toggle)
    onClick?.(event)
  }

  return (
    <button className={cn(style.button, className)} onClick={handleClick}>
      {children}
    </button>
  )
}
