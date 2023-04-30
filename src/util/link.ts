export function openLink(href: string) {
  const w = window.open(href, '_blank')
}

export function searchText(t: string) {
  openLink(`https://www.google.com/search?q=${t}`)
}

export function openLinkOrText(value: string) {
  let isUrl = false
  try {
    new URL(value)
    isUrl = true
  } catch {
    isUrl = false
  }

  if (isUrl) openLink(value)
  else searchText(value)
}
