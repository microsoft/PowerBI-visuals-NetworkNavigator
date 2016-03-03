'use strict';

var $ = require('jquery');
var _ = require('underscore');
var template = require('../templates/readerview.handlebars');
var defaults = require('./thumbnails.defaults.js');
var Outline = require('strippets').Outline;
var mediator = require('stories.common').mediator;
var Keyboard = require('stories.common').Keyboard;

function Readerview(spec) {
    var t = this;
    t.thumbnailItems = [];
    t.iconMap = [];
    t._config = $.extend({}, defaults.config.readerview, spec.config);
    t._$parent = spec.$parent;
    t._$element = null;
    t._init();
}

Readerview.prototype._init = function () {
    var t = this;
    t._$element = $(template())
        .appendTo(t._$parent);
    t._$readerContainer = t._$element.find(defaults.classes.readerview.readerContainer);
    t._$buttonContainer = t._$element.find(defaults.classes.readerview.buttonContainer);
    t._$nextButton = t._$element.find(defaults.classes.readerview.readerNextButton);
    t._$prevButton = t._$element.find(defaults.classes.readerview.readerPrevButton);

    t._$readerContainer.width(t._config.readerWidth);
    t._$buttonContainer.width(t._config.readerWidth);
    t._registerEvents();
};

Readerview.prototype._registerEvents = function () {
    var t = this;
    var keyboard = new Keyboard(t._$element);
    keyboard.bindKeydown(function(key) {
        var LEFT_ARROW_KEY = 37;
        var RIGHT_ARROW_KEY = 39;
        if (key === LEFT_ARROW_KEY) { t._navigate(-1); }
        if (key === RIGHT_ARROW_KEY) { t._navigate(1); }
    });
    t._$element.on('click', function (event) {
        if (event.target === t._$element[0]) {
            t.close();
        }
    });
    t._$nextButton.on('click', function () {
        t._navigate(1);
    });
    t._$prevButton.on('click', function () {
        t._navigate(-1);
    });
    mediator.subscribe(defaults.events.thumbnailClicked, function (data) {
        t.loadOutline(data);
        t.open();
    });
};

Readerview.prototype._navigate = function (offset) {
    var t = this;
    var currentThumbnailIndex = _.findIndex(t.thumbnailItems, function (thumbnail) {
        return thumbnail.data.id === t._currentLoadedThumbnailData.id;
    });
    var toIndex = currentThumbnailIndex + offset;
    if (toIndex >= 0 && toIndex < t.thumbnailItems.length) {
        t.loadOutline(t.thumbnailItems[toIndex].data);
    }
};

Readerview.prototype.open = function () {
    var t = this;
    t._$element.addClass('open');
    t._$element.focus();
};

Readerview.prototype.close = function () {
    var t = this;
    t._$element.removeClass('open');
};

Readerview.prototype.updateThumbnailItems = function (thumbnailItems, iconMap) {
    this.thumbnailItems = thumbnailItems;
    this.iconMap = iconMap;
};

Readerview.prototype.loadOutline = function (data) {
    var t = this;
    var outline;
    var entityBarWidth = t._config.entityBarWidth;
    var outlineConfig = {
        reader: {
            disableAnimation: true,
            readerWidth: t._config.readerWidth - entityBarWidth,
            onLoadUrl: function (url) {
                return Promise.resolve(t._config.onLoadUrl(url)).then(function (result) {
                    outline.$outlineContainer.addClass('outline-loaded');
                    return result;
                });
            },
        },
        maincontent: {
            minimizedWidth: entityBarWidth,
        },
    };
    t._$readerContainer.html('');
    t._currentLoadedThumbnailData = data;
    outline = new Outline(t._$readerContainer, data, t.iconMap, outlineConfig);
    outline.transitionState('readingmode');
};
module.exports = Readerview;
