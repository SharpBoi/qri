export async function enumerateDevices() {
  // fix empty labels API bug
  await navigator.mediaDevices.enumerateDevices()

  const devices = await navigator.mediaDevices.enumerateDevices()
  return devices.filter(d => d.kind === 'videoinput')
}

export async function getDeviceById(id: string) {
  const ds = await enumerateDevices()

  return ds.find(d => d.deviceId === id)
}

export async function getDeviceByName(name: string) {
  const ds = await enumerateDevices()

  return ds.find(d => d.label === name)
}
