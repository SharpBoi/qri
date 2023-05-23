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

  onWrite?: (m: Manifest) => void
}

export function manifesto(props?: ManifestoProps): Plugin {
  const { fileName = 'manifest.json', onWrite } = props || {}

  return {
    name: 'my-manifest',
    async writeBundle(ops, bundle) {
      const manifest: Manifest = {
        files: [],
        chunks: {},
      }

      manifest.files.push(...Object.keys(bundle))

      Object.values(bundle)
        .filter(b => b.type === 'chunk')
        .forEach(b => {
          const name = b.name || ''
          const content = manifest.chunks[name] || []

          manifest.chunks[name] = [...content, b.fileName]
        })

      onWrite?.(manifest)

      await fs.writeFile(`${ops.dir}/${fileName}`, JSON.stringify(manifest, null, 2))
    },
  }
}
