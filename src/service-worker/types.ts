import { Manifesto } from 'tools/rollup/plugins/manifest'

export type SWCheckUpdate = {
  type: 'check-update'
  appManifest: Manifesto
}
export type SWUpdateResult = {
  type: 'update-result'
  result: 'no' | 'updated'
}

export type SWMessage = SWCheckUpdate | SWUpdateResult
