const AWAIT = 400

export function openFileDialog() {
  return new Promise<File[]>(res => {
    const inp = document.createElement('input')
    inp.type = 'file'

    function onCloseDialog() {
      window.removeEventListener('focus', onCloseDialog)

      setTimeout(() => {
        const list = inp.files || new FileList()
        const files: File[] = []

        for (let i = 0; i < list.length; i++) {
          const file = list.item(i)
          if (file) files.push(file)
        }

        res(files)

        inp.remove()
      }, AWAIT)
    }

    window.addEventListener('focus', onCloseDialog)

    document.body.focus()
    window.focus()
    inp.click()
  })
}
