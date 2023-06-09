import * as fs from 'fs'
import * as path from 'path'
import { MaybePromise, OutputAsset, OutputChunk } from 'rollup'
import * as util from 'util'

function log(...params: any[]) {
  console.log(
    util.inspect(params, {
      colors: true,
      breakLength: 200,
      depth: 3,
      maxStringLength: 200,
    })
  )
}

type ChunkName = string & {}
type ScriptLoad = 'defer' | 'async' | 'regular'

type HtmlGeneratorProps = {
  template?: string
  inline?: (
    chunks: OutputChunk[],
    assets: OutputAsset[]
  ) => MaybePromise<string | false>[]
  chunks?: {
    load?: ScriptLoad

    entries?: {
      [x: string]: {
        load?: ScriptLoad
        inline?: boolean
      }
    }
  }
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
    async generateBundle(ops, bundle) {
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
          .filter(c => c.isEntry)
          .map(c => {
            const entry = chunksEntries?.[c.name]

            const load = chunks?.load || entry?.load || ''
            const loadAttr = load === 'regular' ? '' : load
            const type = ops.format === 'es' ? 'type="module"' : ''
            const dataName = `data-name="${c.name}"`
            const dataFileName = `data-filename="${c.fileName}"`

            if (ops.format === 'amd') {
              return `<script data-main="${c.fileName}"></script>`
            }

            if (entry?.inline) {
              delete bundle[c.fileName]

              return `<script ${type} ${dataName} ${dataFileName}>${c.code}</script>`
            }

            return `<script ${loadAttr} ${type} src="${c.fileName}"></script>`
          })
          .join('\n')
      )

      const styles = bundleAssets.filter(c => c.fileName.endsWith('.css'))
      html = html.replace(
        '${styles}',
        styles.map(s => `<link rel="stylesheet" href="${s.fileName}" />`).join('\n')
      )

      const inlines = await Promise.all(props?.inline?.(bundleChunks, bundleAssets) || [])
      html = html.replace('${inline}', inlines.filter(i => !!i).join('\n'))

      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
        source: html,
      })
    },
  }
}
