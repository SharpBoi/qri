export function copyToClipboard(s: string) {
  return navigator.clipboard.writeText(s)
}
