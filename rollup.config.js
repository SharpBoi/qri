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
import * as dns from 'dns/promises'
import * as os from 'os'
import { readFileSync } from "fs";
const { defineConfig } = require("rollup");

const PORT = 10001

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

export default defineConfig(async () => {
  console.warn(
    `!!! you can also run at ${os.networkInterfaces().en0[1].address}:${PORT}`
  );

  const https = {
    key: readFileSync('./tools/https/key.pem'),
    cert: readFileSync('./tools/https/cert.pem'),
  }

  /** @type {import("rollup").RollupOptions} */
  const config = {
    input: "./src/main.tsx",
    output: {
      dir: 'dist',
      format: 'iife',
      entryFileNames: 'bundle-[hash].js'
    },
  
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
      external(),
      nodeResolve({extensions: ['.ts', '.tsx']}),
      isProd && del({targets: './dist'}),
      babel({
        presets: [
          ['@babel/preset-react', { runtime: "automatic", "loose": false }],
        ],
        plugins: [
          ["@babel/plugin-proposal-decorators", { "legacy": true }],
          // ["@babel/plugin-proposal-class-properties", { "loose": false }]
        ]
      }),
      typescript(),
      commonjs(),
      isProd && terser({
        format: {
          comments: false
        }
      }),
      html2({
        template: 'src/index.html',
      }),
      serve({
        contentBase: 'dist',
        historyApiFallback: true,
        port: PORT,
        https
      }),
      livereload({
        watch: 'dist',
        port: PORT,
        https
      })
    ],

    watch: {
      clearScreen: false
    }
  }

  return config
})