const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

process.env.BABEL_ENV = 'production';

module.exports = {
  mode: 'production',
  output: {
    filename: 'drizzle-react-components.js',
    library: 'drizzle-react-components',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    loaders: [{
      test: /\.(js)$/,
      include: path.resolve(__dirname, 'src'),
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-react'],
        plugins: [require('babel-plugin-transform-class-properties'), require('babel-plugin-transform-object-rest-spread')]
      }
    }]
  },
  plugins: [
    new UglifyJSPlugin({
      sourceMap: true
    })
  ],
  externals: [
    'drizzle',
    'drizzle-react',
    'prop-types',
    '@babel/preset-react',
    'redux'
  ]
};
