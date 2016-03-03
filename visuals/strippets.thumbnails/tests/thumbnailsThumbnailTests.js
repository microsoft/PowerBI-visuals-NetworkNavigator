'use strict';
/* global $ */
/* eslint no-unused-expressions: 0 */

var proxyquire = require('proxyquireify')(require);
var MockMediator = require('./mocks/mockMediator');

describe('Thumbnail', function() {
    var Thumbnail;
    var thumbnail; // eslint-disable-line
    var $element;
    var $parent;
    var mediator;
    var mockData;

    before(function () {
        mediator = new MockMediator();
        Thumbnail = proxyquire('../src/thumbnails.thumbnail', {
            'stories.common': { mediator: mediator },
        });
        mockData = {
            id: 1,
            rank: 1,
            imageUrl: 'http://mscorpnews.blob.core.windows.net/ncmedia/2015/11/000-all-future-011-1600x700.jpg',
            source: 'microsoft.com',
            sourceUrl: 'http://microsoft.com',
            sourceimage: 'https://some.com/sourceicon.jpg',
            title: 'From AI and data science to cryptography: Microsoft researchers offer 16 predictions for "16"',
            author: 'Microsoft News Center Staff',
            articledate: '2015-12-04',
            summary: 'Last month, Microsoft released...',
            entities: [],
            url: 'http://www.cnn.com/2015/09/27/politics/obama-un-general-assembly/index.html',
            readerUrl: 'http://www.cnn.com/2015/09/27/politics/obama-un-general-assembly/index.html',

        };
    });
    beforeEach(function () {
        $parent = $('<div style="height: 400px"></div>').appendTo(document.body);
        thumbnail = new Thumbnail({
            $parent: $parent,
            data: mockData,
            config: { height: 100 },
        });
        $element = $parent.find('.thumbnail');
    });
    afterEach(function () {
        $parent.remove();
    });
    it('should have thumbnail element appended to its parent element', function() {
        expect($parent.find('.thumbnail').length).to.equal(1);
    });
    it('should have thumbnail with height set from config', function() {
        expect($element.height()).to.equal(100);
    });
    it('should render thumbnail card with provided data', function() {
        var $card = $element.find('.card');
        var cardBodyHtml = $card.find('.card-body').html();

        expect($card.find('.card-icon').html()).to.have.string(mockData.sourceimage);
        expect(cardBodyHtml).to.have.string(mockData.title);
        expect(cardBodyHtml).to.have.string(mockData.author);
        expect(cardBodyHtml).to.have.string(mockData.articledate);
        expect(cardBodyHtml).to.have.string(mockData.summary);
    });
    it('should be able to load single images or multiple images', function(done) {
        var imageData = 'data:image/gif;metadata={THUMBNAILS_METADATA};base64,R0lGODlhUAAPANUAAAAAAAoKChQUFBoaGiQkJCwsLD4+PkJCQk1NTVNTU15eXmJiYmxsbHJycnt7e4ODg4iIiJZsbJqamqKioqqqqqxERLS0tL+/v8PDw8zMzNTU1Nvb2+Tk5O3t7fPz8/7+/v8AAP8ICP8WFv8cHP8jI/8yMv86Ov9CQv9KSv9VVf9lZf9ycv97e/+Dg/+Jif+Wlv+bm/+rq/+ysv+5uf/IyP/Q0P/f3//j4//19QAAAAAAAAAAAAAAAAAAAAAAA AAAACH5BAkAADkALAAAAABQAA8AAAb/wENjSCwaj8ikcskcVpSHx2dKrVqv2Kx2y52eZtmHtEsum8klEg4rnnI8007nI6/PPXDOnD7XxzlngVQkICxUNjA1H20cAApTBQMZAJSVGAMFHgAIUwYBHwMBcKFwgmciICAvKoQpU4yUCx2RkwQItwgamJqOHZ4fDQAWkwmmZjgzqcogJWuLUo2UAgGSAA4dF9keu5UB0x8YAAwPABTGXDQtJyHLqSI3VLAJDpTVDhaW3AgPAQCfoJREndsSA0U7ZTGqwFrwYYMAexscHABwKROAYhsIfOoAYAABABsGcrnBYkQ7V/GgAWD4gZa1VxS5FfvwSwIACBMAjBG5hcZBcBkpPzRi6bISpYqaZv4yAEAPAAI8uSQDYaKFyRHO2viCMGVBgg0GworVkGCBBwMOpjBA4OEASwYGAEXNEgPECHgfZKBY8Wrn3L9cYICgYQXvA66AE2txAUMLhAMQIkuWLKay5cuYM2vezNlyBM4HggAAOw==';
        var div;

        var i;
        var n;
        var imagesToLoad = 0;
        var maxImagesToLoad = 4;


        var testResult = function(images) {
            if (images) {
                var children = div.children();
                expect(children.length).equals(images.length);
                for (i = 0, n = images.length; i < n; ++i) {
                    /* make sure that the correct image data was set by checking the metadata */
                    expect(children[i].outerHTML).to.have.string(imageData.replace('{THUMBNAILS_METADATA}', i.toString()));
                }
            }

            if (imagesToLoad < maxImagesToLoad) {
                var urls = [];
                for (i = 0, n = ++imagesToLoad; i < n; ++i) {
                    /* customize metadata for each instance of the image */
                    urls.push(imageData.replace('{THUMBNAILS_METADATA}', i.toString()));
                }

                div = $('<div></div>');
                div.css('width', 300);
                div.css('height', 400);
                div.css('position', 'absolute');

                thumbnail._loadImages(urls, div).then(testResult).catch(done);
            } else {
                done();
            }
        };

        testResult(null);
    });
    it('should render updatedDate in following format: MMM. d, yyy', function () {
        expect($element.find('.card-body').html()).to.have.string('Dec. 4, 2015');
    });
    describe('On click', function () {
        beforeEach(function () {
            sinon.spy(mediator, 'publish');
        });
        afterEach(function () {
            mediator.publish.restore();
        });
        it('should fire a mediator event when thumbnail image is clicked', function () {
            $element.find('.card-image').click();
            expect(mediator.publish).to.be.calledWith('[Thumbnail::ThumbnailClicked]', mockData);
        });
        it('should fire a mediator event when thumbnail title is clicked', function () {
            $element.find('.title').click();
            expect(mediator.publish).to.be.calledWith('[Thumbnail::ThumbnailClicked]', mockData);
        });
    });
});
