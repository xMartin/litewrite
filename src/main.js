require('es6-promise').polyfill()
require('match-media')
require('window.requestanimationframe')
var Backbone = require('backbone')
var nc = require('./nc')
var Litewrite = require('./litewrite')
var Router = require('./router')
var utils = require('./utils')

// this way we can prevent remotestorage from stealing the url hash
var originalHash = window.location.hash

utils.handleAppcacheUpdates()

var litewrite = new Litewrite()
startHistory();

nc()
.then(function(results) {
  results.forEach(function(result) {
    litewrite.docs.addNew({title: result.title, content: result.text})
  })
})
.catch(console.error.bind(console))

litewrite.router = new Router({ litewrite: litewrite })

function startHistory () {
  window.location.hash = originalHash
  Backbone.history.start()
}
