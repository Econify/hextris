const typescript = require('rollup-plugin-typescript');
const commonjs = require('rollup-plugin-commonjs');

module.exports = {
  input: 'src/Main.ts',

  plugins: [
    typescript(),
    commonjs({extensions: ['.js', '.ts']})
  ],

  output: {
    file: 'hextris.js',
    name: 'Hextris',
    format: 'umd',
  }
};
