var _ = require('underscore')
var Backbone = require('backbone')
var template = require('../templates/share.html')
var lang = require('../translations')
var remoteStorage = require('remotestorage')
var remoteStorageDocuments = require('remotestorage-documents')

var ShareView = Backbone.View.extend({
  el: '#sharing',

  initialize: function () {
    _.bindAll(this, 'setLink', 'updatePublic', 'show', 'hide')
    this.remote = remoteStorageDocuments.publicList('notes')
    this.template = _.template(template)

    this.$shareButton = this.$('.share')
    this.$link = this.$('.link')
    this.$unshareButton = this.$('.unshare')

    this.model.on('change:public', this.setLink)
    this.collection.on('sync', this.updatePublic)

    this.render()
  },

  events: {
    'click .share': 'share',
    'click .unshare': 'unshare'
  },

  render: function () {
    this.$shareButton.text(lang.share)
    this.$link.text(lang.open)
    this.$unshareButton.text(lang.unshare)
    this.setLink()
  },

  share: function () {
    var html = this.renderDocument(this.model)
    this.remote.addRaw('text/html', html).then(_.bind(function (url) {
      remoteStorage.sync.sync().then(_.bind(function () {
        this.model.set('public', url)
      }, this))
    }, this))
  },

  unshare: function () {
    var publicId = this.model.get('public').split('/').slice(-2).join('/')
    this.remote.remove(publicId).then(_.bind(function (url) {
      remoteStorage.sync.sync().then(_.bind(function () {
        this.model.set('public', null)
      }, this))
    }, this))
  },

  setLink: function () {
    var link = this.model.get('public')
    if (link) this.$link.attr('href', link)
    this.$el.toggleClass('is-shared', !!link)
  },

  updatePublic: function (doc) {
    if (!doc.get('public')) return
    var id = doc.get('public').match(/.+\/(.+?)$/)[1]
    var html = this.renderDocument(doc)
    this.remote.setRaw(id, 'text/html', html)
  },

  renderDocument: function (doc) {
    var data = doc.toJSON()
    data.date = new Date(data.lastEdited).toDateString()
    return this.template(data)
  },

  show: function () {
    this.$el.removeClass('hide-sharing')
  },

  hide: function () {
    this.$el.addClass('hide-sharing')
  }

})

module.exports = ShareView
