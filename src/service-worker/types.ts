export type SWCheckUpdate = {
  type: 'check-update'
}
export type SWUpdateResult = {
  type: 'update-result'
  result: 'no' | 'updated'
}

export type SWMessage = SWCheckUpdate | SWUpdateResult
