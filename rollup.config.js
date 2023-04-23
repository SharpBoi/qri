const { defineConfig } = require("rollup");
import html2 from "rollup-plugin-html2";
import typescript from "@rollup/plugin-typescript";
import del from "rollup-plugin-delete";
import babel from '@rollup/plugin-babel';
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import external from "rollup-plugin-peer-deps-external";
import replace from "@rollup/plugin-replace";
import * as os from 'os'
import * as fs from "fs";
import postcss from 'rollup-plugin-postcss';
import svgr from '@svgr/rollup'
import alias from '@rollup/plugin-alias';
import path, { dirname } from "path";

const PORT = 10001
const LOCAL_IP = os.networkInterfaces().en0[1].address
const DIST = './public/dist'

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

export default defineConfig(async () => {
  console.warn(
    `!!! you can also run at https://${LOCAL_IP}:${PORT}`
  );

  const https = {
    key: fs.readFileSync('./tools/https/key.pem'),
    cert: fs.readFileSync('./tools/https/cert.pem'),
  }

  /** @type {import("rollup").RollupOptions} */
  const config = {
    input: "./src/main.tsx",
    output: {
      dir: DIST,
      format: 'cjs',
      entryFileNames: 'bundle-[hash].js',
      sourcemap: true
    },
    context: 'this',
  
    plugins: [
      alias({
        entries: {
          '@': path.resolve(__dirname, 'src')
        }
      }),
      
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
      external(),
      nodeResolve({extensions: ['.ts', '.tsx']}),
      del({targets: `${DIST}/*`,}),
      babel({
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-react', { runtime: "automatic", "loose": false }],
        ],
        plugins: [
          ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ]
      }),
      typescript(),
      commonjs(),
      isProd && terser({
        format: {
          comments: false
        }
      }),

      svgr({}),

      postcss({
        extract: true,
        modules: true,
        minimize: isProd
      }),
      
      html2({
        template: 'src/index.html',
      }),
      serve({
        contentBase: DIST,
        host: LOCAL_IP,
        port: PORT,
        https
      }),
      livereload({
        watch: DIST,
        port: PORT,
        https,
      })
    ],

    watch: {
      clearScreen: false
    }
  }

  return config
})