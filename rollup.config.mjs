import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')

export default [
  {
    input: './index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true,
        paths: {
          'lodash/get': 'lodash/get.js',
          'lodash/set': 'lodash/set.js',
        },
      },
    ],
    plugins: [
      resolve(),
      typescript({ sourceMap: true, declaration: false }),
      commonjs({
        exclude: 'node_modules',
        ignoreGlobal: true,
      }),
      terser(),
    ],
    external: [/^lodash/, 'reflect-metadata', 'tslib'],
  },
]
