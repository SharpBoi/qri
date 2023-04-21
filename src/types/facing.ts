export const ENVIRONMENT_FACING_REGEX = /rear|back|environment/i
export const USER_FACING_REGEX = /front|user|face/i

export enum FacingMode {
  user = 'user',
  environment = 'environment',
}

export function detectFacingMode(value: string) {
  if (ENVIRONMENT_FACING_REGEX.test(value)) return FacingMode.environment
  if (USER_FACING_REGEX.test(value)) return FacingMode.user

  return null
}
