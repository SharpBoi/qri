import { nil } from './nil'

export type ClassProp = {
  className?: string | nil
}

export type ToggleProp = {
  toggle?: boolean
  onToggle?: (t: boolean) => void
}

export type SelectProps = {
  selectId?: string
  onSelect?: (id: string) => void
}
