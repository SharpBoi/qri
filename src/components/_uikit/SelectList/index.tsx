import { PropsWithChildren, ReactNode } from 'react'
import { Dropdown, DropdownProps } from '../Dropdown'
import { List, ListProps } from '../List'
import { usePriorityState } from '@/hooks/usePriorityState'
import { SelectProps } from '@/util/props'

type Props = {
  dropdown?: Omit<DropdownProps, 'content'>
  list?: ListProps

  drawTitle?: (itemBody: ReactNode) => ReactNode
} & SelectProps

export function SelectList({ dropdown, list, selectId, onSelect, drawTitle }: Props) {
  const [opened, setOpened] = usePriorityState(
    false,
    dropdown?.toggle,
    dropdown?.onToggle
  )

  // TODO optimize
  const item = list?.content?.find(([id]) => id === selectId)
  const [, body] = item || []

  function handleSelect(id: string) {
    onSelect?.(id)
    setOpened(false)
  }

  return (
    <Dropdown
      {...dropdown}
      toggle={opened}
      onToggle={setOpened}
      content={<List {...list} onClick={handleSelect} />}
    >
      {drawTitle ? drawTitle(body) : body || '---'}
    </Dropdown>
  )
}
