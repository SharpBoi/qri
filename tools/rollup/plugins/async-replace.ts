import {
  MaybePromise,
  OutputAsset,
  OutputChunk,
  Plugin,
  TransformPluginContext,
} from 'rollup'
import * as fs from 'fs/promises'

type Entry = [
  key: string,
  getValue: (ctx: TransformPluginContext) => MaybePromise<string>
]

type AsyncReplaceProps = {
  entries: Entry[]
}

async function replace(src: string, entries: Entry[], ctx: TransformPluginContext) {
  for (const [k, getValue] of entries) {
    const value = await getValue(ctx)

    src = src.replaceAll(k, value)
  }

  return src
}

export function asyncReplace(props?: AsyncReplaceProps): Plugin {
  const {} = props || {}

  return {
    name: 'my-async-replace',
    async transform(code, id) {
      return replace(code, props?.entries || [], this)
    },
  }
}
