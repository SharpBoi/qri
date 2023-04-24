import * as fs from 'fs'
import * as path from 'path'

type HtmlGeneratorProps = {
  template?: string
}

export function htmlGenerator(props?: HtmlGeneratorProps): import('rollup').Plugin {
  const { template = '' } = props || {}

  const templateName = path.basename(template)

  return {
    name: 'html-generator',
    writeBundle(ops, bundle) {
      let html = fs.readFileSync('src/index.html').toString()

      const chunks = Object.values(bundle).flat()

      const entry = chunks.find(c => c.type === 'chunk' && c.isEntry)
      html = html.replace(
        '${scripts}',
        `<script type="module" src="${entry?.fileName}"></script>`
      )

      const styles = chunks.filter(c => c.fileName.endsWith('.css'))
      html = html.replace(
        '${styles}',
        styles.map(s => `<link rel="stylesheet" href="${s.fileName}" />`).join('\n')
      )

      fs.writeFileSync(`${ops.dir}/${templateName}`, html)
    },
    buildStart() {
      this.addWatchFile(template)
    },
  }
}
