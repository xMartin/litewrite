var _ = require('underscore')
var $ = require('jquery')
var Backbone = require('backbone')
var utils = require('../utils')
var Snap = require('snap')
var lang = require('../translations')

var AsideView = Backbone.View.extend({
  el: 'body',

  initialize: function () {
    _.bindAll(this, 'show', 'hide', 'toggle', 'desktopShow', 'desktopHide', 'handleSnapper')

    this.$sidebar = this.$('aside')

    this.collection
      .on('add', this.desktopShow)
      .on('remove', this.desktopShow)
      .on('change:title', this.desktopShow)

    this.initSnapper()
    this.setFooter()
  },

  initSnapper: function () {
    this.snapper = new Snap({
      element: this.$('#snap-content')[0],
      disable: 'right',
      maxPosition: 265
    })

    this.handleSnapper()
    $(window).on('resize', this.handleSnapper)
  },

  show: function () {
    if (utils.isDesktop) return this.$el.addClass('show-aside')
    this.snapper.open('left')
  },

  hide: function () {
    if (utils.isMobile) return this.snapper.close()
    // hide sidebar when 3 or more docs and the open doc is not empty
    if (this.collection.length > 2 && !this.model.isEmpty()) {
      this.$el.removeClass('show-aside')
    }
  },

  toggle: function () {
    if (utils.isDesktop) return this.$el.toggleClass('show-aside')
    if (this.snapper.state().state === 'closed') return this.show()
    this.hide()
  },

  desktopShow: function () {
    if (utils.isDesktop) this.show()
  },

  desktopHide: _.debounce(function () {
    if (utils.isDesktop) this.hide()
  }, 3000),

  handleSnapper: _.debounce(function () {
    if (utils.isMobile) return this.snapper.enable()
    this.snapper.close()
    this.snapper.disable()
  }, 700),

  hasScrollbar: function () {
    // thanks to http://stackoverflow.com/questions/4814398/how-can-i-check-if-a-scrollbar-is-visible
    return this.$sidebar.get(0).scrollHeight > this.$sidebar.height()
  },

  setFooter: function () {
    this.$sidebar.find('footer a').text(lang.footer)
  }

})

module.exports = AsideView
