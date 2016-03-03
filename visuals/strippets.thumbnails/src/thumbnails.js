'use strict';

var $ = require('jquery');
var Thumbnail = require('./thumbnails.thumbnail');
var Readerview = require('./thumbnails.readerview');
var defaults = require('./thumbnails.defaults');
var util = require('./thumbnails.util');
var InfiniteScroll = require('stories.common').InfiniteScroll;
var thumbnailsTemplate = require('../templates/thumbnails.handlebars');
var dummyThumbnailTemplate = require('../templates/dummythumbnail.handlebars');

function Thumbnails(spec) {
    var t = this;

    t.iconMap = null;
    t._config = $.extend({}, defaults.config.thumbnails, spec.config);
    t._$parent = $(spec.container);
    t._$element = null;
    t._readerview = null;
    t._thumbnailItems = [];
    t._init();
}

Thumbnails.prototype._init = function() {
    var t = this;

    t.iconMap = t._config.entityIcons || util.flattenIconMap(t._config.autoGenerateIconMappings);
    t._readerview = new Readerview({
        $parent: t._$parent,
        config: t._config.readerview,
    });
    t._$element = $(thumbnailsTemplate())
        .appendTo(t._$parent);
    t._$thumbnailsContainer = t._$element.find(defaults.classes.thumbnails.thumbnailsContainer);

    t._infiniteScroll = new InfiniteScroll(t._$element, t._config.infiniteScrollDistance);

    /* add 20 dummy thumbnails to the panel to force the flexbox to left align the last row */
    for (var i = 0; i < 20; ++i) {
        t._$thumbnailsContainer.append($(dummyThumbnailTemplate()));
    }
};

Thumbnails.prototype._render = function(data) {
    var t = this;
    data.forEach(function (d) {
        var thumbnail = new Thumbnail({
            $parent: t._$thumbnailsContainer,
            data: d,
            config: t._config.thumbnail,
        });
        t._thumbnailItems.push(thumbnail);
    });
    /* move dummy thumbnails to the end of the list */
    t._$thumbnailsContainer.find('.dummyThumbnail').appendTo(t._$thumbnailsContainer);
};

Thumbnails.prototype._resetThumbnailsContainer = function() {
    var t = this;
    t._thumbnailItems = [];
    t._$thumbnailsContainer.empty();
    /* add 20 dummy thumbnails to the panel to force the flexbox to left align the last row */
    for (var i = 0; i < 20; ++i) {
        t._$thumbnailsContainer.append($(dummyThumbnailTemplate()));
    }
};

Thumbnails.prototype.loadData = function(data, append) {
    var t = this;
    if (!append) {
        t._resetThumbnailsContainer();
    }
    if (!t._config.entityIcons) {
        t.iconMap = util.mapEntitiesToIconMap(data, t.iconMap);
    }
    t._render(data);
    t._readerview.updateThumbnailItems(t._thumbnailItems, t.iconMap);
};

Thumbnails.prototype.onInfinite = function (handler) {
    var t = this;
    t._infiniteScroll.onInfinite(function () {
        handler().then(function (data) {
            t.loadData(data, true);
            t._infiniteScroll.infiniteScrollDone();
        });
    });
};

module.exports = Thumbnails;
module.exports.asJQueryPlugin = /* istanbul ignore next: Jquery Plugin Registration */ function () {
    $.fn.thumbnails = function (command) {
        var selector = this;
        var commands = {
            initialize: function (options) {
                this._thumbnails = new Thumbnails({
                    container: this,
                    config: options,
                });
            },
            loaddata: function (data, append) {
                this._thumbnails.loadData(data, append);
            },
            onInfinite: function (fn) {
                this._thumbnails.onInfinite(fn);
            },
            dispose: function () {
                selector.each(function (index, element) {
                    element._thumbnails = null;
                    element.remove();
                });
            },
        };
        // define argument variable here as arguments get overloaded in the each call below.
        var args = arguments;
        return selector.each(function (index, element) {
            // assume no command == initialization.
            if (command === undefined) {
                commands.initialize.apply(element, null);
            } else if (commands[command]) {
                commands[command].apply(element, Array.prototype.slice.call(args, 1));
            } else if (typeof command === 'object' || !command) {
                commands.initialize.apply(element, args);
            } else {
                $.error('Command: ' + command + 'does not exist.');
            }
        });
    };
};
