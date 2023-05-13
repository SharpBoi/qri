import React, { PropsWithChildren, ReactNode, useEffect, useRef } from 'react'
import { Button } from '../Button'
import { ClassProp, ToggleProp } from '@/util/props'
import { cn } from '@/util/cn'
import style from './index.scss'
import { usePriorityState } from '@/hooks/usePriorityState'

export type DropdownProps = {
  content?: React.ReactNode
} & ClassProp &
  ToggleProp

export function Dropdown({
  children,
  content,

  className,

  onToggle,
  toggle,
}: PropsWithChildren & DropdownProps) {
  const ref = useRef<HTMLButtonElement>(null)

  const [opened, setOpen] = usePriorityState(false, toggle, onToggle)

  useEffect(() => {
    const cb = (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node)) return

      setOpen(false)
    }

    document.addEventListener('click', cb)

    return () => document.removeEventListener('click', cb)
  })

  return (
    <Button
      ref={ref}
      className={cn(style.dropdown, opened && style.opened, className)}
      toggle={opened}
      onToggle={setOpen}
    >
      <div className={style.child}>{children}</div>
      <div className={style.pivot}>
        {opened && (
          <div className={style.content} onClick={e => e.stopPropagation()}>
            {content}
          </div>
        )}
      </div>
    </Button>
  )
}

const cnv = document.createElement('canvas')

const br = cnv.getContext('bitmaprenderer')

cnv.captureStream()
