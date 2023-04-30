export async function fileToDataurl(file: File) {
  return new Promise<string>(res => {
    const fr = new FileReader()
    fr.readAsDataURL(file)
    fr.onload = () => res(fr.result as string)
  })
}
