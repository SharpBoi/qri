import { OutputAsset, OutputChunk, Plugin } from 'rollup'
import * as fs from 'fs/promises'

type Outs = (OutputAsset | OutputChunk)[]

type smartDeleteProps = {
  dir?: string
}

export function smartDelete(props?: smartDeleteProps): Plugin {
  const { dir } = props || {}

  let prevOuts: Outs = []

  return {
    name: 'my-smart-delete',
    async writeBundle(ops, bundle) {
      const outs = Object.values(bundle)

      for (const prevOut of prevOuts) {
        if (outs.find(o => o.fileName === prevOut.fileName)) continue

        await fs.rm(`${dir}/${prevOut.fileName}`, { recursive: true, force: true })
      }

      prevOuts = [...outs]
    },
  }
}
