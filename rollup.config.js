var resolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');
var uglify = require('rollup-plugin-uglify');
var postCss = require('rollup-plugin-postcss');

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

module.exports = {
  input: 'src/ui/caseable.ui.js',
  external: ['jquery'],
  output: {
    name: '$caseable',
    file: 'demo/caseable.js',
    format: 'iife', // immediately-invoked function expression — suitable for <script> tags
    sourcemap: true,
    globals: {
      jquery: 'jQuery'
    }
  },
  plugins: [
    resolve(), // tells Rollup how to find date-fns in node_modules
    commonjs(),
    production && uglify(), // minify, but only in production
    postCss({
      plugins: []
    })
  ]
};
