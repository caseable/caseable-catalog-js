var commonjs = require('rollup-plugin-commonjs');
var uglify = require('rollup-plugin-uglify');

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

module.exports = {
  input: 'src/caseable.ui.js',
  output: {
    name: '$caseable',
    file: 'demo/bundle.js',
    format: 'iife', // immediately-invoked function expression — suitable for <script> tags
    sourcemap: true,
  },
  plugins: [
    commonjs(),
    production && uglify() // minify, but only in production
  ]
};
