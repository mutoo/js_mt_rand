import babel from 'rollup-plugin-babel';
import packageJson from './package.json';

export default {
  input: 'lib/index.js',
  output: {
    name: 'JSMTRand',
    file: 'dist/JSMTRand.js',
    format: 'umd',
    banner:
`/**
 * JSMTRand version ${packageJson.version}
 * (c) 2015-2018 Mutoo
 * Released under the MIT License.
 */`,
  },
  plugins: [
    babel(),
  ],
};