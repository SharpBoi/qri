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
    async writeBundle(ops, b) {
      const manifest = {
        files: Object.keys(b),
      }

      await fs.writeFile(`${ops.dir}/${fileName}`, JSON.stringify(manifest, null, 2))
    },
  }
}
