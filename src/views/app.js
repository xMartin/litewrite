var Backbone = require('backbone')
var _ = require('underscore')
var EntriesView = require('./entries')
var EditorView = require('./editor')
var DateView = require('./date')
var AsideView = require('./aside')
var SearchView = require('./search')
var ShareView = require('./share')
var utils = require('../utils')

var AppView = Backbone.View.extend({
  el: 'body',

  initialize: function (options) {
    _.bindAll(this, 'toggleSearch')

    this.litewrite = options.litewrite

    this.editor = new EditorView({ model: this.model })
    this.search = new SearchView({ model: this.litewrite.state })
    this.aside = new AsideView({ model: this.model, collection: this.collection })
    this.entries = new EntriesView({ litewrite: this.litewrite, collection: this.collection })
    this.date = new DateView({ model: this.model })
    var share = new ShareView({ model: this.model, collection: this.collection })

    this.litewrite
      .on('ready', this.editor.render)
      .on('ready', this.editor.desktopFocus)
      .on('ready', this.aside.desktopHide)
      .on('connected', share.show)
      .on('disconnected', share.hide)

    this.collection
      .on('add', this.toggleSearch)
      .on('remove', this.toggleSearch)

    this.search
      .on('focus', this.aside.show)
      .on('blur', this.editor.desktopFocus)
      .on('blur', this.aside.desktopHide)

    // this way we don't hide the sidebar while search is focusesd
    this.editor
      .on('typing', this.aside.desktopHide)

    this.entries
      .on('open', this.editor.desktopFocus)
      .on('open', this.aside.hide)
  },

  events: {
    'click #add': 'newDoc',
    'touchend #add': 'newDoc',
    'click #menu-button': 'toggleAside',
    'touchend #menu-button': 'toggleAside',
    'keydown': 'handleKey',
    'keyup': 'closeAside'
  },

  newDoc: function () {
    if (utils.isMobile) this.aside.hide()
    if (!this.model.isEmpty()) this.collection.addNew()
    this.editor.focus()
    this.search.clear()
    return false
  },

  toggleAside: function () {
    this.aside.toggle()
    return false
  },

  toggleSearch: function () {
    this.aside.hasScrollbar() ? this.search.show() : this.search.hide()
  },

  // global key handler for shortcuts
  handleKey: function (e) {
    var tabKey = e.keyCode === 9

    var sKey = e.keyCode === 83
    var saveShortcut = sKey && e[utils.metaKey]

    if (tabKey || saveShortcut) return e.preventDefault()
    if (!e[utils.modKey.name]) return
    this.aside.show()
    var shortcut = this.shortcuts[e.keyCode]
    if (shortcut) return shortcut.call(this, e)
  },

  shortcuts: {
    78: function n () {
      this.newDoc()
    },
    38: function up () {
      this.previous()
      return false
    },
    40: function down () {
      this.next()
      return false
    },
    74: function j () {
      this.search.focus()
    }
  },

  previous: function () {
    var id = this.entries.previous(this.model.id)
    if (id) this.litewrite.open(id)
  },

  next: function () {
    var id = this.entries.next(this.model.id)
    if (id) this.litewrite.open(id)
  },

  closeAside: function (e) {
    var isModKey = e.keyCode === utils.modKey.code
    if (!isModKey) return
    if (this.search.isFocused()) return
    this.aside.hide()
  }

})

module.exports = AppView
