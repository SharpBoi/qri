import * as fs from 'fs/promises'
import { Plugin } from 'rollup'

export type Manifest = {
  files: string[]
  routes: {
    [file: string]: string[]
  }
  chunks: {
    [name: string]: string[]
  }
}

type ManifestoProps = {
  /** @default 'manifest.json' */
  fileName?: string

  append?: Partial<Manifest>
}

export function manifesto(props?: ManifestoProps): Plugin {
  const { fileName = 'manifest.json', append = {} } = props || {}

  return {
    name: 'my-manifest',
    async writeBundle(ops, bundle) {
      const manifest: Manifest = {
        files: append.files || [],
        routes: append.routes || {},
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

      await fs.writeFile(`${ops.dir}/${fileName}`, JSON.stringify(manifest, null, 2))
    },
  }
}
