var _ = require('underscore')
var Backbone = require('backbone')
var Doc = require('../models/doc')
// var rsSync = require('rs-adapter')
var lang = require('../translations')
//var remoteStorage = require('remotestorage')
//var remoteStorageDocuments = require('remotestorage-documents')

var Docs = Backbone.Collection.extend({
  model: Doc,

  // sync: rsSync,

  initialize: function (models, options) {
    _.bindAll(this, 'sort', 'save', 'welcome', 'rsChange')

    this
      .on('change:lastEdited', this.sort)
      .on('change:lastEdited', this.save)

    //this.once('sync', this.welcome)
    //this.initRemotestorage()
  },

  addNew: _.throttle(function (options) {
    return this.add(_.defaults(options || {}, {
      id: ('' + Math.random()).substring(2),
      lastEdited: Date.now()
    }))
  }, 1000, { leading: true }),

  // Sort by 'lastEdited'
  comparator: function (first, second) {
    return first.get('lastEdited') > second.get('lastEdited') ? -1 : 1
  },

  save: function (doc) {
    doc.throttledSave()
  },

  welcome: function () {
    if (this.isEmpty()) this.addNew({ content: lang.welcome })
  },

  remote: null,

  initRemotestorage: function () {
    var docs = this

    var origHash = document.location.hash

    remoteStorage.on('disconnected', function () {
      docs.reset()
      docs.welcome()
    })

    remoteStorage.access.claim('documents', 'rw')

    docs.remote = remoteStorageDocuments.privateList('notes')
    docs.remote.on('change', docs.rsChange)

    setTimeout(function () {
      var md = origHash.match(/access_token=([^&]+)/)
      if (md && !remoteStorage.getBearerToken()) {
        // backbone stole our access token
        remoteStorage.setBearerToken(md[1])
      }
    }, 0)
  },

  events: [],

  rsChange: function (event) {
    this.events.push(event)
    this.handleEvents()
  },

  handleEvents: _.debounce(function () {
    _.each(this.events, function (event) {
      if (event.origin === 'window') return
      // remove
      if (event.oldValue && !event.newValue) return this.remove(event.oldValue)
      var existingDoc = this.get(event.newValue.id)
      // add
      if (!existingDoc) return this.add(event.newValue)
      var isLatest = event.newValue.lastEdited > existingDoc.get('lastEdited')
      // update
      if (!isLatest) return
      this.set(event.newValue, { remove: false })
      this.trigger('remoteUpdate', event.newValue.id)
    }, this)
    this.events = []
  }, 400)

})

module.exports = Docs
