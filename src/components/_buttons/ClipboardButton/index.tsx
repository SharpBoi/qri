import { Button } from '@/components/_uikit/Button'
import { openLinkOrText } from '@/util/link'
import CopySVG from '@/assets/copy.svg'
import { copyToClipboard } from '@/util/clipboard'

type Props = {
  data: string
}

export function ClipboardButton({ data }: Props) {
  return (
    <Button onClick={() => copyToClipboard(data)}>
      <CopySVG />
    </Button>
  )
}
