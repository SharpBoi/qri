export function getInstalledRelatedApps() {
  if (!('getInstalledRelatedApps' in navigator)) return Promise.resolve(undefined)

  //@ts-ignore
  return navigator.getInstalledRelatedApps() as Promise<unknown[]>
}
