import * as fs from 'fs'
import * as path from 'path'
import { OutputAsset, OutputChunk } from 'rollup'
import * as util from 'util'

type ChunkName = string & {}
type ScriptLoad = 'defer' | 'async' | 'regular'

type HtmlGeneratorProps = {
  chunk?: {
    filter?: ChunkName[] //| ((c: OutputChunk) => boolean)
    load?: ScriptLoad | { [x: string]: ScriptLoad }
    //| ((c: OutputChunk) => ScriptLoad)
  }
  template?: string
}

export function htmlGenerator(props?: HtmlGeneratorProps): import('rollup').Plugin {
  const { template = '', chunk } = props || {}

  const chunkFilter = chunk?.filter
  const chunkLoad = chunk?.load
  const templateName = path.basename(template)

  return {
    name: 'html-generator',
    writeBundle(ops, bundle) {
      console.log('Generating html ...')

      let html = fs.readFileSync(template).toString()

      const files = Object.values(bundle).flat()

      const chunks = files.filter(c => c.type === 'chunk') as OutputChunk[]
      const assets = files.filter(c => c.type === 'asset') as OutputAsset[]

      html = html.replace(
        '${scripts}',
        chunks
          .filter(c => (chunkFilter ? chunkFilter.includes(c.name) : true))
          .map(c => {
            let load = typeof chunkLoad === 'string' ? chunkLoad : chunkLoad?.[c.name]

            const attr = load === 'regular' ? '' : load || ''

            return `<script ${attr} type="module" src="${c.fileName}"></script>`
          })
          .join('\n')
      )

      // chunks
      //   .filter(c => c.type === 'chunk')
      //   .forEach(c => {
      //     console.log(
      //       util.inspect(c, {
      //         colors: true,
      //         breakLength: 200,
      //         depth: 1,
      //         maxStringLength: 200,
      //       })
      //     )
      //   })

      const styles = assets.filter(c => c.fileName.endsWith('.css'))
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
