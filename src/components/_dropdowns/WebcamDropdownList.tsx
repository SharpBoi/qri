import { useEffect, useState } from 'react'
import { SelectList } from '../_uikit/SelectList'
import { WebCam } from '@/classes/WebCam'
import WebcamSVG from '@/assets/webcam.svg'
import { SelectProps } from '@/util/props'

type Props = SelectProps & {}

export function WebcamDropdownList({ onSelect, selectId }: Props) {
  const [cams, setCams] = useState<MediaDeviceInfo[]>([])

  useEffect(() => void WebCam.enumerate().then(setCams), [])

  return (
    <SelectList
      selectId={selectId}
      onSelect={onSelect}
      list={{
        content: cams.map(cam => [cam.deviceId, cam.label]),
      }}
      drawTitle={item => (
        <>
          <WebcamSVG />
          {item}
        </>
      )}
    ></SelectList>
  )
}
