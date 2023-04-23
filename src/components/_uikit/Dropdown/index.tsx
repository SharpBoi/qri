import React, { PropsWithChildren, ReactNode } from 'react'
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
  const [opened, setOpen] = usePriorityState<boolean>(false, toggle, onToggle)

  return (
    <Button
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
