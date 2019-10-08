import babel from 'rollup-plugin-babel';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

export default {
  input: 'src/index.js',
  output: {
    file: 'index.js',
    format: 'esm'
  },
  plugins: [
    peerDepsExternal({ includeDependencies: true }),
    babel({ runtimeHelpers: true })
  ]
};
