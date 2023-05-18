import { Manifest } from 'tools/rollup/plugins/manifest'

export type SWCheckUpdate = {
  type: 'check-update'
  appManifest: Manifest
}
export type SWUpdateResult = {
  type: 'update-result'
  result: 'no' | 'updated'
}

export type SWMessage = SWCheckUpdate | SWUpdateResult
