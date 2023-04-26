import { RollupOptions, defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import del from 'rollup-plugin-delete'
import { babel } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import external from 'rollup-plugin-peer-deps-external'
import replace from '@rollup/plugin-replace'
import * as os from 'os'
import * as fs from 'fs'
import postcss from 'rollup-plugin-postcss'
import svgr from '@svgr/rollup'
import alias from '@rollup/plugin-alias'
import path from 'path'
import { manifesto } from './tools/rollup/plugins/manifest'
import { htmlGenerator } from './tools/rollup/plugins/html'

const PORT = 10001
const LOCAL_IP = os.networkInterfaces().en0?.[1].address
const DIST = './public/dist'

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

export default defineConfig(async () => {
  console.warn(`!!! you can also run at https://${LOCAL_IP}:${PORT}`)

  const https = {
    key: fs.readFileSync('./tools/https/key.pem'),
    cert: fs.readFileSync('./tools/https/cert.pem'),
  }

  const config: RollupOptions = {
    input: {
      main: './src/main.tsx',
      'sw-sw': './src/service-worker/sw.ts',
      'sw-loader': './src/service-worker/loader.ts',
    },
    output: {
      dir: DIST,
      format: 'esm',
      entryFileNames: `[name]-[hash].js`,
      sourcemap: true,
      exports: 'named',
      manualChunks: {
        'vendor/react': ['react', 'react-dom'],
        'vendor/mobx': ['mobx'],
      },
    },
    context: 'this',

    plugins: [
      alias({
        entries: {
          '@': path.resolve(__dirname, 'src'),
        },
      }),

      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
      //@ts-ignore
      external({}),
      nodeResolve({
        browser: true,
        preferBuiltins: false,
        extensions: ['.ts', '.tsx'],
      }),
      del({ targets: `${DIST}/*` }),

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
      typescript({}),
      commonjs({}),

      isProd &&
        terser({
          format: {
            comments: false,
          },
        }),

      htmlGenerator({
        template: 'src/index.html',
        chunks: {
          load: 'defer',
          entries: {
            'sw-loader': { inline: true },
          },
        },
      }),

      manifesto(),

      isDev &&
        serve({
          contentBase: DIST,
          // host: LOCAL_IP,
          port: PORT,
          // https,
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

  return config
})
