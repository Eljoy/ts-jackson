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
        // Node's ESM resolver requires the .js extension for lodash
        // deep imports since lodash ships without an exports map
        paths: {
          'lodash/get': 'lodash/get.js',
          'lodash/set': 'lodash/set.js',
        },
      },
    ],
    plugins: [
      resolve(),
      // declarations are emitted by the tsc-release step, not rollup
      typescript({ sourceMap: true, declaration: false }),
      commonjs({
        exclude: 'node_modules',
        ignoreGlobal: true,
      }),
      terser(),
    ],
    // /^lodash/ also externalizes deep imports such as lodash/get
    external: [/^lodash/, 'reflect-metadata', 'tslib'],
  },
]
