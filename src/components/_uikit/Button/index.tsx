import { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import style from './index.scss'
import { cn } from '@/util/cn'
import { ToggleProp } from '@/util/props'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ToggleProp & {
    wide?: boolean
    allowPropogation?: boolean
  }

export function Button({
  children,
  className,

  toggle,
  onToggle,

  onClick,

  wide,
  allowPropogation,

  ...rest
}: PropsWithChildren<ButtonProps>) {
  function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (!allowPropogation) e.stopPropagation()

    onToggle?.(!toggle)
    onClick?.(e)
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
