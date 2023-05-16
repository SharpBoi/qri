import * as fs from 'fs/promises'
import { Plugin } from 'rollup'

export type Manifest = {
  files: string[]
  chunks: {
    [name: string]: string[]
  }
}

type ManifestoProps = {
  /** @default 'manifest.json' */
  fileName?: string
}

export function manifesto(props?: ManifestoProps): Plugin {
  const { fileName = 'manifest.json' } = props || {}

  return {
    name: 'my-manifest',
    async writeBundle(ops, bundle) {
      const manifest: Manifest = {
        files: [],
        chunks: {},
      }

      manifest.files = Object.keys(bundle)

      Object.values(bundle)
        .filter(b => b.type === 'chunk')
        .forEach(b => {
          manifest.chunks[b.name || ''] = [
            ...(manifest.chunks[b.name || ''] || []),
            b.fileName,
          ]
        })

      await fs.writeFile(`${ops.dir}/${fileName}`, JSON.stringify(manifest, null, 2))
    },
  }
}
