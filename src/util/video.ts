export function createVideo() {
  const video = document.createElement('video')
  video.autoplay = true
  video.muted = true
  video.disablePictureInPicture = true
  video.controls = false
  video.play()
  return video
}

export function videoFromStream(stream: MediaStream) {
  const video = createVideo()
  video.srcObject = stream
  video.play()

  const setts = stream.getVideoTracks()[0].getSettings()

  video.width = setts.width || 0
  video.height = setts.height || 0

  return video
}

export function screenshotVideo(video: HTMLVideoElement) {
  const cnv = document.createElement('canvas')
  const ctx = cnv.getContext('2d')

  const w = video.videoWidth || video.width
  const h = video.videoHeight || video.height

  cnv.width = w
  cnv.height = h

  return new Promise<string>(res => {
    function doScreenshot() {
      ctx?.drawImage(video, 0, 0, w, h)

      return res(cnv.toDataURL())
    }

    if (video.readyState === 4) doScreenshot()

    video.addEventListener('loadedmetadata', doScreenshot)
  })
}
