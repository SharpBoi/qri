export function screenshotVideo(video: HTMLVideoElement) {
  const cnv = document.createElement('canvas')
  const ctx = cnv.getContext('2d')

  const w = video.videoWidth || video.width
  const h = video.videoHeight || video.height

  cnv.width = w
  cnv.height = h

  ctx?.drawImage(video, 0, 0, w, h)

  return cnv.toDataURL()
}
