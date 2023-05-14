import * as fs from 'fs'
import * as path from 'path'
import { OutputAsset, OutputChunk } from 'rollup'
import * as util from 'util'

type ChunkName = string & {}
type ScriptLoad = 'defer' | 'async' | 'regular'

function log(...params: any[]) {
  console.log(
    util.inspect(params, {
      colors: true,
      breakLength: 200,
      depth: 1,
      maxStringLength: 200,
    })
  )
}

type HtmlGeneratorProps = {
  chunks?: {
    load?: ScriptLoad

    entries?: {
      [x: string]: {
        load?: ScriptLoad
        inline?: boolean
      }
    }
  }
  template?: string
}

export function htmlGenerator(props?: HtmlGeneratorProps): import('rollup').Plugin {
  const { template = '', chunks } = props || {}

  const chunksEntries = chunks?.entries
  const templateName = path.basename(template)

  return {
    name: 'html-generator',
    buildStart() {
      this.addWatchFile(template)
    },
    generateBundle(ops, bundle) {
      console.log('Generating html ...')

      let html = fs.readFileSync(template).toString()

      const files = Object.values(bundle).flat()

      const bundleChunks = files.filter(c => c.type === 'chunk') as OutputChunk[]
      const bundleAssets = files.filter(c => c.type === 'asset') as OutputAsset[]

      html = html.replace(
        '${scripts}',
        bundleChunks
          .filter(c =>
            chunksEntries ? Object.keys(chunksEntries).includes(c.name) : true
          )
          .map(c => {
            const entry = chunksEntries?.[c.name]

            if (entry?.inline) {
              delete bundle[c.fileName]

              return `<script type="module" data-name="${c.name}" data-filename="${c.fileName}">${c.code}</script>`
            }

            const load = chunks?.load || entry?.load || ''
            const attr = load === 'regular' ? '' : load

            return `<script ${attr} ${ops.format === 'es' ? 'type="module"' : ''} src="${
              c.fileName
            }"></script>`
          })
          .join('\n')
      )

      const styles = bundleAssets.filter(c => c.fileName.endsWith('.css'))
      html = html.replace(
        '${styles}',
        styles.map(s => `<link rel="stylesheet" href="${s.fileName}" />`).join('\n')
      )

      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
        source: html,
      })
    },
  }
}
