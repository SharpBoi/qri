import * as fs from 'fs/promises'
import { MaybePromise, Plugin } from 'rollup'

export type Manifesto = {
  files: string[]
  chunks: {
    [name: string]: string[]
  }
}

type ManifestoProps = {
  /** @default 'manifest.json' */
  fileName?: string

  append?: () => MaybePromise<Partial<Manifesto>>

  beforeWrite?: (m: Manifesto) => void
}

export function manifesto(props?: ManifestoProps): Plugin {
  const { fileName = 'manifest.json', beforeWrite: onWrite } = props || {}

  return {
    name: 'my-manifest',
    async writeBundle(ops, bundle) {
      const manifest: Manifesto = {
        files: [],
        chunks: {},
      }

      manifest.files.push(...Object.keys(bundle))

      const append = await props?.append?.()

      manifest.files.push(...(append?.files || []))

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
