import { RollupOptions, defineConfig } from 'rollup'
import tsPlugin from '@rollup/plugin-typescript'
import { babel } from '@rollup/plugin-babel'
import cjsPlugin from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { terser as terserPlugin } from 'rollup-plugin-terser'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import externalPlugin from 'rollup-plugin-peer-deps-external'
import replacePlugin from '@rollup/plugin-replace'
import * as os from 'os'
import * as fs from 'fs'
import postcss from 'rollup-plugin-postcss'
import svgr from '@svgr/rollup'
import aliasPlugin from '@rollup/plugin-alias'
import path from 'path'
import { manifesto } from './tools/rollup/plugins/manifest'
import { htmlGenerator } from './tools/rollup/plugins/html'
import { smartDelete } from './tools/rollup/plugins/smart-delete'

const PORT = 10001
const LOCAL_IP = os.networkInterfaces().en0?.[1].address
const DIST = './public/dist'

const https = {
  key: fs.readFileSync('./tools/https/key.pem'),
  cert: fs.readFileSync('./tools/https/cert.pem'),
}

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

fs.rmSync(DIST, { force: true, recursive: true })

const alias = aliasPlugin({
  entries: {
    '@': path.resolve(__dirname, 'src'),
  },
})

const replace = replacePlugin({
  preventAssignment: true,
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
})

const ts = tsPlugin({})
const cjs = cjsPlugin({})

const terser = terserPlugin({
  format: {
    comments: false,
  },
})

export default defineConfig(async () => {
  console.warn(`!!! you can also run at https://${LOCAL_IP}:${PORT}`)

  const swConfig: RollupOptions = {
    input: {
      'sw-sw': './src/service-worker/sw.ts',
    },
    output: {
      dir: DIST,
      format: 'cjs',
      entryFileNames: `[name]-[hash].js`,
      sourcemap: isDev ? 'inline' : true,
    },

    plugins: [
      alias,

      replace,

      smartDelete({ dir: DIST }),

      ts,
      cjs,

      isProd && terser,

      manifesto({ fileName: 'manifest.sw.json' }),
    ],
  }

  const appConfig: RollupOptions = {
    input: {
      main: './src/main.tsx',
      'sw-loader': './src/service-worker/loader.ts',
    },
    output: {
      dir: DIST,
      format: 'esm',
      entryFileNames: `[name]-[hash].js`,
      sourcemap: isDev ? 'inline' : true,
      exports: 'named',
      manualChunks: {
        'vendor/react': ['react', 'react-dom'],
        'vendor/mobx': ['mobx'],
      },
    },
    context: 'this',

    plugins: [
      alias,

      replace,

      //@ts-ignore
      externalPlugin({}),
      nodeResolve({
        browser: true,
        preferBuiltins: false,
        extensions: ['.ts', '.tsx'],
      }),
      smartDelete({ dir: `${DIST}` }),

      babel({
        exclude: 'node_modules/**',
        extensions: ['.ts', '.tsx'],
        presets: [['@babel/preset-react', { runtime: 'automatic', loose: false }]],
        plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]],
      }),

      postcss({
        extract: true,
        modules: true,
        minimize: isProd,
      }),

      svgr({}),

      ts,
      cjs,

      isProd && terser,

      htmlGenerator({
        template: 'src/index.html',
        chunks: {
          load: 'defer',
          entries: {
            'sw-loader': { inline: true },
          },
        },
      }),

      manifesto({ fileName: 'manifest.app.json' }),

      isDev &&
        serve({
          contentBase: DIST,
          // host: LOCAL_IP,
          port: PORT,
          https,
          historyApiFallback: true,
        }),
      isDev &&
        livereload({
          watch: DIST,
          port: PORT,
          https,
        }),
    ],

    watch: {
      clearScreen: false,
    },
  }

  return [appConfig, swConfig]
})
