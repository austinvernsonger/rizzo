//-----------------------------------------------------------------------------
//
// User Feed: Content
//
//-----------------------------------------------------------------------------

define([
  "jquery",
  "lib/core/timeago",
  "./content/activities",
  "./content/messages",
], function($, Timeago, Activities, Messages) {

  "use strict";

  var defaults = {
    item: ".js-user-feed__item",
  };

  function Content(args) {
    this.config = $.extend({}, defaults, args);

    this.$el = this.config.$el;

    this.init();
  }

  Content.prototype.init = function() {
    this.activities = new Activities({ item: this.config.item });
    this.messages = new Messages({ item: this.config.item });
    this.timeago = new Timeago({ context: this.$el });
  };

  //---------------------------------------------------------------------------
  // Functions
  //---------------------------------------------------------------------------

  Content.prototype.update = function(data) {
    this.activities.update(data);
    this.messages.update(data);
    this.timeago.refresh();

    this._handleUnread();
  };

  Content.prototype.show = function() {
    if (!this.isVisible) {
      this.$el.removeClass("is-hidden");
      this.isVisible = true;
    }
  };

  Content.prototype.hide = function() {
    if (this.isVisible) {
      this.$el.addClass("is-hidden");
      this.isVisible = false;
    }
  };

  Content.prototype.getLatest = function(maxActivityAge) {
    var $activities = this._getLatestByType("activities"),
        $messages = this._getLatestByType("messages");

    if (typeof maxActivityAge === "number") {
      $activities = this._filterByMaxAge($activities, maxActivityAge);
    }

    return $activities.add($messages);
  };

  //---------------------------------------------------------------------------
  // Private functions
  //---------------------------------------------------------------------------

  Content.prototype._handleUnread = function() {
    var unreadSelector = this.config.item + ".is-unread",
        $unreadItems = this.$el.find(unreadSelector).not(".is-author");

    if ($unreadItems.length) {
      $unreadItems.closest("ul").addClass("is-unread");
    }
  };

  Content.prototype._filterByMaxAge = function($collection, maxAge) {
    var now = new Date().getTime();

    return $collection.filter(function() {
      var timestamp = $(this).find(".js-timeago").attr("datetime"),
          itemAge = (now - new Date(timestamp).getTime()) / 1000;

      return itemAge <= maxAge;
    });
  };

  Content.prototype._getLatestByType = function(type) {
    var latestCount = this[type].latestCount;

    return this[type].$container
      .find(this.config.item)
      .slice(0, latestCount)
      .not(".is-author");
  };

  return Content;
});
