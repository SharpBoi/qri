import { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import style from './index.scss'
import { cn } from '@/util/cn'
import { ToggleProp } from '@/util/props'

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  ToggleProp & {
    wide?: boolean
  }

export function Button({
  children,
  className,

  toggle,
  onToggle,

  onClick,

  wide,

  ...rest
}: PropsWithChildren<Props>) {
  function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    onToggle?.(!toggle)
    onClick?.(event)
  }

  return (
    <button
      {...rest}
      className={cn(style.button, wide && style.wide, className)}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}
