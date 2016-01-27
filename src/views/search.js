var Backbone = require('backbone')
var lang = require('../translations')

var SearchView = Backbone.View.extend({
  el: '#search',

  initialize: function () {
    this.render()
    this.setPlaceholder()
  },

  events: {
    'search': 'search',
    'keyup': 'handleKey',
    'focus': 'triggerFocus'
  },

  render: function () {
    this.$el.val(this.model.get('query'))
  },

  search: function () {
    var query = this.$el.val()
    this.model.save('query', query)
    this.trigger('search')
  },

  handleKey: function (e) {
    if (e.which === 13) { // ENTER
      e.preventDefault()
      return this.trigger('blur')
    }
    this.search()
  },

  focus: function () {
    if (!this.$el.hasClass('hide')) this.$el.focus()
  },

  triggerFocus: function () {
    this.trigger('focus')
  },

  isFocused: function () {
    return this.$el.is(':focus')
  },

  show: function () {
    this.$el.removeClass('hide')
  },

  hide: function () {
    this.$el.addClass('hide')
    this.clear()
  },

  clear: function () {
    this.model.save('query', '')
    this.render()
  },

  setPlaceholder: function () {
    this.$el.attr('placeholder', lang.search)
  }

})

module.exports = SearchView
