var uglify = require('rollup-plugin-uglify').uglify;

module.exports = {
  input: 'src/caseable.catalog.js',
  output: {
    file: 'demo/caseable.catalog.min.js',
    format: 'iife'
  },
  plugins: [
    uglify()
  ]
};
