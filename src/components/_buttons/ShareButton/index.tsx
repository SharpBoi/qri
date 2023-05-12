import { Button, ButtonProps } from '@/components/_uikit/Button'
import ShareSVG from '@/assets/share.svg'

type Props = ButtonProps & {
  data: string
  keepIfAPIrestricted?: boolean
}

export function ShareButton({ data, keepIfAPIrestricted = false }: Props) {
  if (keepIfAPIrestricted) {
    return (
      <Button onClick={() => navigator.share({ text: data })}>
        <ShareSVG />
      </Button>
    )
  }

  if (navigator.share) {
    return (
      <Button onClick={() => navigator.share({ text: data })}>
        <ShareSVG />
      </Button>
    )
  }

  return null
}
