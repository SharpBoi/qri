import { InputOption, ModuleFormat, RollupOptions, defineConfig, rollup } from 'rollup'
import tsPlugin from '@rollup/plugin-typescript'
import { babel } from '@rollup/plugin-babel'
import cjsPlugin from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import terserPlugin from '@rollup/plugin-terser'
import serve, { RollupServeOptions } from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import replacePlugin from '@rollup/plugin-replace'
import * as os from 'os'
import * as fs from 'fs'
import * as fsp from 'fs/promises'
import postcss from 'rollup-plugin-postcss'
import svgr from '@svgr/rollup'
import aliasPlugin from '@rollup/plugin-alias'
import path from 'path'
import { Manifesto, manifesto } from './tools/rollup/plugins/manifest'
import { htmlGenerator } from './tools/rollup/plugins/html'
import { smartDelete } from './tools/rollup/plugins/smart-delete'
import copyPlugin from 'rollup-plugin-copy'
import { asyncReplace } from './tools/rollup/plugins/async-replace'

const PORT = 10001
const LOCAL_IP = os.networkInterfaces().en0?.[1].address || ''
const DIST = './dist'
const APP_MANIFEST_NAME = 'manifest.app.json'
const SW_MANIFEST_NAME = 'manifest.sw.json'

const APP_FMT = 'esm' as ModuleFormat

const https = (): RollupServeOptions['https'] => ({
  key: fs.readFileSync('localhost.key').toString(),
  cert: fs.readFileSync('localhost.crt').toString(),
})

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

fs.rmSync(DIST, { force: true, recursive: true })

const alias = () =>
  aliasPlugin({
    entries: {
      '@': path.resolve(__dirname, 'src'),
    },
  })

const replace = () =>
  replacePlugin({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  })

const ts = () => tsPlugin({})
const cjs = () => cjsPlugin({})

const terser = () =>
  terserPlugin({
    format: {
      comments: false,
    },
  })

const server = (host: string, port: number, secure: boolean) =>
  isDev &&
  serve({
    contentBase: DIST,
    host,
    port,
    https: secure ? https() : undefined,
    historyApiFallback: true,
  })

const livereloader = (port: number, secure: boolean) =>
  isDev &&
  livereload({
    watch: DIST,
    port,
    https: secure ? https() : undefined,
  })

export default defineConfig(async () => {
  console.warn(`!!! you can also run at https://${LOCAL_IP}:${PORT}`)

  // sw config must define first, cuz of rollup bug
  const swConfig: RollupOptions = {
    input: {
      sw: './src/service-worker/sw.ts',
    },
    output: {
      dir: DIST,
      format: 'cjs',
      entryFileNames: `[name]-[hash].js`,
      sourcemap: isDev ? 'inline' : true,
    },

    plugins: [
      alias(),

      replace(),

      asyncReplace({
        entries: [
          [
            'process.env.APP_MANIFEST',
            ctx => {
              // rollup bug
              // ctx.addWatchFile(DIST + `/${APP_MANIFEST_NAME}`)
              // ctx.addWatchFile(DIST + `/${APP_MANIFEST_NAME}`)
              return fsp.readFile(DIST + `/${APP_MANIFEST_NAME}`).then(b => b.toString())
            },
          ],
        ],
      }),

      smartDelete({ dir: DIST }),

      ts(),
      cjs(),

      isProd && terser(),

      manifesto({
        fileName: SW_MANIFEST_NAME,
      }),
    ],
  }

  const appConfig: RollupOptions = {
    input: {
      loader: './src/loader.ts',
    },
    output: {
      dir: DIST,
      format: APP_FMT,
      entryFileNames: `[name]-[hash].js`,
      sourcemap: isDev ? 'inline' : true,
      exports: 'named',
      manualChunks: {
        'vendor/react': ['react', 'react-dom'],
        'vendor/react-router': ['react-router', 'react-router-dom'],
        'vendor/mobx': ['mobx'],
      },
    },
    context: 'this',

    plugins: [
      alias(),

      replace(),

      nodeResolve({
        browser: true,
        preferBuiltins: false,
        extensions: ['.ts', '.tsx'],
      }),
      smartDelete({ dir: `${DIST}` }),

      babel({
        exclude: 'node_modules/**',
        extensions: ['.ts', '.tsx'],
        presets: [
          [
            '@babel/preset-env',
            {
              // useBuiltIns: 'usage',
            },
          ],
          ['@babel/preset-react', { runtime: 'automatic', loose: false }],
        ],
        plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]],
      }),

      postcss({
        extract: true,
        modules: true,
        minimize: isProd,
      }),

      svgr({}),

      ts(),
      cjs(),

      isProd && terser(),

      htmlGenerator({
        template: 'src/index.html',
        inline: () => [APP_FMT === 'amd' && `<script src="require.js"></script>`],
        chunks: {
          load: 'defer',
          entries: {
            loader: { inline: false },
          },
        },
      }),

      copyPlugin({
        targets: [{ src: 'public/*', dest: DIST }],
      }),

      manifesto({
        fileName: APP_MANIFEST_NAME,
        append() {
          return {
            files: ['require.js'],
          }
        },
      }),

      server('localhost', PORT, false),
      server('localhost', PORT + 1, true),

      server(LOCAL_IP, PORT, false),
      server(LOCAL_IP, PORT + 1, true),

      livereloader(PORT, false),
      livereloader(PORT + 1, true),
    ],

    watch: {
      clearScreen: false,
    },
  }

  return [appConfig, swConfig]
})
