var _ = require('underscore')
var Backbone = require('backbone')
// var rsSync = require('rs-adapter')
var timeAgo = require('../utils').timeAgo

var Doc = Backbone.Model.extend({
  defaults: {
    title: '',
    content: '',
    lastEdited: null,
    public: null
  },

  // sync: rsSync,

  isEmpty: function () {
    return this.get('content').trim() === ''
  },

  updateLastEdited: function (doc) {
    // only update lastEdited if you didn't switch the document
    if (!doc.changed.id) doc.set('lastEdited', new Date().getTime())
  },

  updateTitle: function (doc) {
    // Title consists of the first 40 characters of the first not empty line
    var matchTitle = doc.get('content').match(/[^\s].{0,40}/)
    doc.set('title', matchTitle ? matchTitle[0] : '')
  },

  getUrl: function () {
    var title = this.get('title')
      .toLowerCase()
      .replace(/\s|&nbsp;/g, '-')
      .replace(/"|’|'|,|\//g, '')
    return title ? '!' + '(' + this.id + ')-' + encodeURI(title) : ''
  },

  getOpacity: function () {
    // Time passed since this document was edited the last time in milliseconds
    var diff = new Date().getTime() - this.get('lastEdited')
    // The older the document the smaller the opacity
    // but the opacity is allway between 0.4 and 1
    // For documents older than 2 weeks the opacity won't change anymore
    var limit = 14 * 86400000
    var opacity = diff > limit ? 0.4 : Math.round((0.4 + ((limit - diff) / limit) * 0.6) * 100) / 100
    return opacity
  },

  // send updates at most once per second to remotestorage
  throttledSave: _.throttle(function () {
    this.save()
  }, 1000),

  formatDate: function () {
    return timeAgo(this.get('lastEdited'))
  }

})

module.exports = Doc
