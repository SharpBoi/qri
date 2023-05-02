import { Button } from '@/components/_uikit/Button'
import { openLinkOrText } from '@/util/link'
import BrowserSVG from '@/assets/browser.svg'

type Props = {
  data: string
}

export function BrowserButton({ data }: Props) {
  return (
    <Button onClick={() => openLinkOrText(data)}>
      <BrowserSVG />
    </Button>
  )
}
