import { ReadableVar, WritableVar } from '@/classes/RxVar'

const probe = document.createElement('div')

probe.id = 'probe'
probe.style.position = 'absolute'
probe.style.width = '0'
probe.style.height = '100vh'

document.body.appendChild(probe)

const _$bar = new WritableVar(0)
export const $bar = new ReadableVar(_$bar)

setTimeout(() => {
  const actualHeight = window.outerHeight

  const barHeight = probe.clientHeight - actualHeight

  _$bar.set(barHeight)
}, 10)
