const merge = require('webpack-merge');
const baseConfig = require('./base');

module.exports = merge(baseConfig, {
  mode: 'production',
  module: {
  },
  optimization: {
    mergeDuplicateChunks: true,
    minimize: true,
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        "vendors~a-g": {
          test: /[\\/]node_modules[\\/][a-g]/i,
          priority: -10,
          chunks: 'all',
          reuseExistingChunk: true
        },
        "vendors~h-n": {
          test: /[\\/]node_modules[\\/][h-n]/i,
          priority: -10,
          chunks: 'all',
          reuseExistingChunk: true
        },
        "vendors~o-u": {
          test: /[\\/]node_modules[\\/][o-u]/i,
          priority: -10,
          chunks: 'all',
          reuseExistingChunk: true
        },
        "vendors~v-z": {
          test: /[\\/]node_modules[\\/][v-z]/i,
          priority: -10,
          chunks: 'all',
          reuseExistingChunk: true
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [
    // new UglifyJSPlugin({
    //   sourceMap: true
    // })
  ]
});
