import * as fs from 'fs/promises'
import { Plugin } from 'rollup'

type ManifestoProps = {
  /** @default 'manifest.json' */
  fileName?: string
}

export function manifesto(props?: ManifestoProps): Plugin {
  const { fileName = 'manifest.json' } = props || {}

  return {
    name: 'my-manifest',
    async writeBundle(ops, bundle) {
      const manifest: any = {
        files: Object.keys(bundle),
      }

      Object.values(bundle).forEach(b => {
        if (b.name) manifest[b.name] = b.fileName
      })

      await fs.writeFile(`${ops.dir}/${fileName}`, JSON.stringify(manifest, null, 2))
    },
  }
}
