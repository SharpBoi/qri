import { ReadableVar, WritableVar } from '@/classes/RxVar'
import { autorun, reaction } from 'mobx'

export enum Orientation {
  landscape = 'landscape',
  portrait = 'portrait',
}

const _orientation = new WritableVar<Orientation>(Orientation.portrait)
const orientationMedia = window.matchMedia('(orientation: portrait)')

function setOrient(portrait: boolean) {
  if (portrait) {
    _orientation.set(Orientation.portrait)
  } else {
    _orientation.set(Orientation.landscape)
  }
}

setOrient(orientationMedia.matches)

orientationMedia.addEventListener('change', e => setOrient(e.matches))

export const $orientation = new ReadableVar(_orientation)
