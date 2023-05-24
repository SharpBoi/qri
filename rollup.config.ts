import { InputOption, ModuleFormat, RollupOptions, defineConfig } from 'rollup'
import tsPlugin from '@rollup/plugin-typescript'
import { babel } from '@rollup/plugin-babel'
import cjsPlugin from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { terser as terserPlugin } from 'rollup-plugin-terser'
import serve from 'rollup-plugin-serve'
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
import { smartReplace } from './tools/rollup/plugins/smart-replace'

const PORT = 10001
const LOCAL_IP = os.networkInterfaces().en0?.[1].address
const DIST = './dist'
const APP_MANIFEST_NAME = 'manifest.app.json'
const SW_MANIFEST_NAME = 'manifest.sw.json'

const REQUIREJS_PATH = 'require.js'

const APP_FMT = 'esm' as ModuleFormat

const https = {
  key: fs.readFileSync('./tools/https/key.pem'),
  cert: fs.readFileSync('./tools/https/cert.pem'),
}

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

export default defineConfig(async () => {
  console.warn(`!!! you can also run at https://${LOCAL_IP}:${PORT}`)

  const input: InputOption = {
    main: './src/main.tsx',
    loader: './src/loader.ts',
  }
  if (APP_FMT === 'amd') input.requirejs = './src/assets/js/require.js'

  const appConfig: RollupOptions = {
    input,
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
        inline: [APP_FMT === 'amd' && `<script src="${REQUIREJS_PATH}"></script>`],
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

      manifesto({ fileName: APP_MANIFEST_NAME }),

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
      smartReplace({
        entries: [
          [
            'process.env.APP_MANIFEST',
            ctx => {
              ctx.addWatchFile(DIST + `/${APP_MANIFEST_NAME}`)
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

  return [appConfig, swConfig]
})
