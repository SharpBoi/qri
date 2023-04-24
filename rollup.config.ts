import { RollupOptions, defineConfig } from 'rollup'
import html from '@rollup/plugin-html'
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

const BUNDLE_NAME = 'mainbundle'

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

export default defineConfig(async () => {
  console.warn(`!!! you can also run at https://${LOCAL_IP}:${PORT}`)

  const https = {
    key: fs.readFileSync('./tools/https/key.pem'),
    cert: fs.readFileSync('./tools/https/cert.pem'),
  }

  const config: RollupOptions = {
    input: './src/main.tsx',
    output: {
      dir: DIST,
      format: 'esm',
      entryFileNames: `${BUNDLE_NAME}-[hash].js`,
      sourcemap: true,
      exports: 'named',
      manualChunks: {
        react: ['react'],
        'react-dom': ['react-dom'],
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
      external(),
      nodeResolve({ extensions: ['.ts', '.tsx'] }),
      del({ targets: `${DIST}/*` }),
      babel({
        exclude: 'node_modules/**',
        extensions: ['.html'],
        presets: [['@babel/preset-react', { runtime: 'automatic', loose: false }]],
        plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]],
      }),
      typescript(),
      commonjs({}),

      isProd &&
        terser({
          format: {
            comments: false,
          },
        }),

      svgr({}),

      postcss({
        extract: true,
        modules: true,
        minimize: isProd,
      }),

      htmlGenerator({
        template: 'src/index.html',
      }),

      manifesto(),

      serve({
        contentBase: DIST,
        host: LOCAL_IP,
        port: PORT,
        https,
      }),
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
