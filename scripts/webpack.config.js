const webpack = require('webpack')
const path = require('path')

var config = {
  entry: [
    './src/main'
  ],
  output: {
    path: path.join(__dirname, '..'),
    filename: 'litewrite.min.js'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.IgnorePlugin(new RegExp('^(xmlhttprequest|./lang)$'))
  ],
  module: {
    loaders: [
      {
        test: [/\.txt$/, /\.html$/],
        loader: 'raw'
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loader: 'style!css'
      },
      {
        test: [/\.png$/, /\.svg$/],
        exclude: /node_modules/,
        loader: 'url'
      },
      {
        test: [/\.ttf$/, /\.otf$/],
        loader: 'file?name=[path][name].[ext]' // keep files in same location
      }
    ]
  },
  resolve: {
    alias: {
      remotestorage: path.join(__dirname, '../lib/remotestorage'),
      'remotestorage-documents': path.join(__dirname, '../lib/remotestorage-documents'),
      'rs-adapter': path.join(__dirname, '../lib/backbone.remoteStorage-documents'),
      snap: path.join(__dirname, '../lib/snap')
    }
  },
  cssnext: {
    browsers: 'last 2 versions'
  }
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  )
} else {
  config.devtool = 'cheap-module-eval-source-map'
  config.entry.unshift('webpack-hot-middleware/client')
  config.plugins.push(new webpack.HotModuleReplacementPlugin())
  config.module.loaders[1].loader = 'style!css?sourceMap'
}

module.exports = config
