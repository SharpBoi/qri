import { useEffect, useState } from 'react'
import { SelectList } from '../_uikit/SelectList'
import { WebCam } from '@/classes/WebCam'
import WebcamSVG from '@/assets/webcam.svg'
import { SelectProps } from '@/util/props'
import { enumerateDevices } from '@/util/device'

type Props = SelectProps & {}

export function WebcamDropdownList({ onSelect, selectId }: Props) {
  const [cams, setCams] = useState<MediaDeviceInfo[]>([])

  useEffect(() => void enumerateDevices().then(setCams), [])

  return (
    <SelectList
      selectId={selectId}
      onSelect={onSelect}
      list={{
        content: cams.map(cam => [cam.label, cam.label]),
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
