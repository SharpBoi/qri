import { ClassProp } from '@/util/props'
import style from './index.scss'
import { cn } from '@/util/cn'

type Props = ClassProp &
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    value?: string
    onChangeText?: (text: string) => void

    maxHeight?: string
    wide?: boolean
  }

export function RichText({
  value,
  onChange,
  onChangeText,
  maxHeight,
  className,
  wide,
}: Props) {
  function handleChange(e: React.FormEvent<HTMLDivElement>) {
    onChange?.(e)
    onChangeText?.(e.currentTarget.textContent || '')
  }

  return (
    <div
      contentEditable
      onChange={handleChange}
      className={cn(style.rich, wide && style.wide, className)}
      style={{ maxHeight }}
    >
      {value}
    </div>
  )
}
