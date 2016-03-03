'use strict';

var $ = require('jquery');
var thumbnailTemplate = require('../templates/thumbnail.handlebars');
var defaults = require('./thumbnails.defaults.js');
var mediator = require('stories.common').mediator;

function Thumbnail(spec) {
    var t = this;

    t.data = spec.data;
    t._$parent = spec.$parent;
    t._config = spec.config;
    t._$element = null;
    t._init();
}

Thumbnail.prototype._init = function() {
    var t = this;
    t.data.formattedDate = t._formatDate(t.data.articledate);
    t._$element = $(thumbnailTemplate(t.data))
        .height(t._config.height)
        .appendTo(t._$parent);

    /* initialize the image */
    if (t.data.imageUrl) {
        t._loadImages(t.data.imageUrl, t._$element.find('.card-image'));
    }

    t._registerEvents();
};

Thumbnail.prototype._registerEvents = function() {
    var t = this;
    t._$element.on('click', defaults.classes.thumbnail.cardImage, function() {
        mediator.publish(defaults.events.thumbnailClicked, t.data);
    });
    t._$element.on('click', defaults.classes.thumbnail.title, function() {
        mediator.publish(defaults.events.thumbnailClicked, t.data);
    });
};

Thumbnail.prototype._formatDate = function(date) {
    var d = new Date(date);
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[d.getUTCMonth()] + '. ' + d.getUTCDate() + ', ' + d.getUTCFullYear();
};

Thumbnail.prototype._loadImages = function(imageUrls, imageContainer) {
    var t = this;
    var i;
    var n;
    var promises = [];

    var urls;
    if (imageUrls instanceof Array) {
        urls = imageUrls;
    } else {
        urls = [imageUrls];
    }

    for (i = 0, n = urls.length; i < n; ++i) {
        promises.push(t._loadImage(urls[i]));
    }

    return Promise.all(promises).then(function(loadedImages) {
        var image;
        var containerWidth = imageContainer.width();
        var containerHeight = imageContainer.height();
        var width = containerWidth / urls.length;
        var cssWidth = ((1.0 / urls.length) * 100) + '%';
        var height = containerHeight;

        for (i = 0, n = loadedImages.length; i < n; ++i) {
            image = loadedImages[i];
            var imageHeight = loadedImages[i].height;
            if (image.width > containerWidth) {
                imageHeight *= (containerWidth / image.width);
            }
            height = Math.max(height, imageHeight);
        }

        if (height > containerHeight && height > imageContainer.parent().height() * 0.5) {
            height = imageContainer.parent().height() * 0.5;
        }

        if (height !== containerHeight) {
            imageContainer.css('height', height);
        }

        var subdivided = (urls.length > 1);

        for (i = 0, n = urls.length; i < n; ++i) {
            image = loadedImages[i];
            var div = $('<div></div>');
            var scale = Math.max(width / image.width, height / image.height);
            var scaledWidth = Math.round(image.width * scale);
            var sizeType;

            if ((subdivided && scaledWidth < width) || (!subdivided && scaledWidth > width)) {
                sizeType = 'contain';
            } else if (scale > 1) {
                sizeType = 'auto';
            } else {
                sizeType = 'cover';
            }

            div.css('background-image', 'url("' + urls[i] + '")');
            div.css('background-size', sizeType);
            div.css('width', cssWidth);
            div.css('height', imageContainer.height());

            imageContainer.append(div);
        }

        return Promise.resolve(loadedImages);
    }, function(reason) {
        throw reason;
    });
};

Thumbnail.prototype._loadImage = function(url) {
    return new Promise(function(resolve) {
        var img = $('<img />').on('load', function() {
            resolve(img[0]);
        }).attr('src', url);
    });
};

module.exports = Thumbnail;
