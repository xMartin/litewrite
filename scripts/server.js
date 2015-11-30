const express = require('express')
const path = require('path')

const app = express()
const port = process.env.PORT || 8000

if (process.env.NODE_ENV !== 'production') {
  const webpack = require('webpack')
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')
  const config = require('./webpack.config')
  const compiler = webpack(config)

  app.use(webpackDevMiddleware(compiler, {
    noInfo: true
  }))

  app.use(webpackHotMiddleware(compiler))
} else {
  app.get('/litewrite.min.js', function (req, res) {
    res.sendFile(path.join(__dirname, '../litewrite.min.js'))
  })
}

function serveFile (relativePath) {
  return function (req, res) {
    res.sendFile(path.join(__dirname, '..', relativePath))
  }
}

app.get('/', serveFile('index.html'))
app.use('/img', express.static(path.join(__dirname, '../img')))
app.use('/style', express.static(path.join(__dirname, '../style')))
app.get('/cache.manifest', serveFile('cache.manifest'))

if (require.main === module) {
  app.listen(port, function (error) {
    if (error) {
      console.error(error)
    } else {
      console.info('==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.', port, port)
    }
  })
}

module.exports = app
