'use strict';
/* global $ */
/* eslint no-unused-expressions: 0 */

var proxyquire = require('proxyquireify')(require);
var MockMediator = require('./mocks/mockMediator');

describe('Readerview', function() {
    var Readerview;
    var readerview; // eslint-disable-line
    var $parent;
    var $element;
    var mediator;
    var mock = {};

    before(function () {
        mock.Outline = function ($container) {
            this.$outlineContainer = $('<div class="outlineContainer"></div>')
                .appendTo($container);
        };
        mock.Outline.prototype = {
            transitionState: sinon.stub(),
        };
        sinon.spy(mock, 'Outline');

        mock.Keyboard = function () {};
        mock.Keyboard.prototype = { bindKeydown: sinon.stub() };
        sinon.spy(mock, 'Keyboard');

        mediator = new MockMediator();

        Readerview = proxyquire('../src/thumbnails.readerview', {
            'strippets': { Outline: mock.Outline },
            'stories.common': {
                mediator: mediator,
                Keyboard: mock.Keyboard,
            },
        });
    });
    var cleanup = function () {
        $parent.remove();
        mock.Outline.reset();
        mock.Outline.prototype.transitionState.reset();
        mock.Keyboard.reset();
        mock.Keyboard.prototype.bindKeydown.reset();
        mediator.dispose();
    };
    var initNewReaderview = function (overwrite, clean) {
        if (clean) { cleanup(); }
        $parent = $('<div></div>').appendTo(document.body);
        readerview = new Readerview($.extend({
            $parent: $parent,
            config: {
                configVar: 'fakeConfigValue',
            },
        }, overwrite));
        $element = $parent.find('.readerview');
        return readerview;
    };
    beforeEach(function () { readerview = initNewReaderview(); });
    afterEach(cleanup);

    it('should have element appended to its parent element', function() {
        expect($parent.find('.readerview').length).to.equal(1);
    });
    it('shoud set width of the button container and reader container', function () {
        expect($element.find('.reader-container').width()).to.equal(500);
        expect($element.find('.button-container').width()).to.equal(500);
    });
    it('should open (show) and be focused', function () {
        readerview.open();
        expect($element[0]).to.equal(document.activeElement);
        expect($element.hasClass('open')).to.be.true;
    });
    it('should close (hide)', function () {
        readerview.open();
        readerview.close();
        expect($element.hasClass('open')).to.be.false;
    });
    describe('Events', function () {
        it('on click should close the readerview if target is outer area', function () {
            readerview.open();
            var e = new $.Event('click');

            // click reader container
            e.target = $element.find('.reader-container')[0];
            $element.trigger(e);
            expect($element.hasClass('open')).to.be.true;

            // cick outer div
            e.target = $element[0];
            $element.trigger(e);
            expect($element.hasClass('open')).to.be.false;
        });
        it('on Thumbnail Click should open readerview', function () {
            mediator.publish('[Thumbnail::ThumbnailClicked]');
            expect($element.hasClass('open')).to.be.true;
        });
        it('on Thumbnail Click should load the thumbnail story', function () {
            sinon.spy(readerview, 'loadOutline');
            mediator.publish('[Thumbnail::ThumbnailClicked]', 'storyData');
            expect(readerview.loadOutline).to.be.calledWith('storyData');
            readerview.loadOutline.restore();
        });
    });
    describe('Events on Click navigate buttons', function () {
        var thumbnailItems;
        beforeEach(function () {
            thumbnailItems = [
                { data: { id: 1 } },
                { data: { id: 2 } },
                { data: { id: 3 } },
            ];
            // set current story
            readerview.updateThumbnailItems(thumbnailItems, []);
            readerview.loadOutline(thumbnailItems[1].data);
            sinon.spy(readerview, 'loadOutline');
        });
        afterEach(function () {
            readerview.loadOutline.restore();
        });
        it('should load next story item with right button', function () {
            $element.find('.reader-next-button').click();
            expect(readerview.loadOutline).to.be.calledWith(thumbnailItems[2].data);
        });
        it('should load previous story item with right button', function () {
            $element.find('.reader-prev-button').click();
            expect(readerview.loadOutline).to.be.calledWith(thumbnailItems[0].data);
        });
        it('should handle when there is no prev thumbnail to navigate', function () {
            $element.find('.reader-prev-button').click();
            try {
                $element.find('.reader-prev-button').click();
            } catch (e) {
                expect(e).to.not.exist;
            }
        });
        it('should handle when there is no next thumbnail to navigate', function () {
            $element.find('.reader-next-button').click();
            try {
                $element.find('.reader-next-button').click();
            } catch (e) {
                expect(e).to.not.exist;
            }
        });
    });
    describe('Events on Keydown', function () {
        var triggerKeydown;
        var thumbnailItems;
        var LEFT_ARROW_KEY = 37;
        var RIGHT_ARROW_KEY = 39;
        beforeEach(function () {
            thumbnailItems = [
                { data: { id: 1 } },
                { data: { id: 2 } },
                { data: { id: 3 } },
            ];
            // set current story
            readerview.updateThumbnailItems(thumbnailItems, []);
            readerview.loadOutline(thumbnailItems[1].data);
            sinon.spy(readerview, 'loadOutline');
            triggerKeydown = mock.Keyboard.prototype.bindKeydown.getCall(0).args[0];
        });
        afterEach(function () {
            readerview.loadOutline.restore();
        });
        it('should initialize keyboard on readerview', function () {
            expect(mock.Keyboard.getCall(0).args[0][0]).to.equal($element[0]);
        });
        it('left key should navigate to previous story', function () {
            triggerKeydown(LEFT_ARROW_KEY);
            expect(readerview.loadOutline).to.be.calledWith(thumbnailItems[0].data);
        });
        it('right key should navigate to next story', function () {
            triggerKeydown(RIGHT_ARROW_KEY);
            expect(readerview.loadOutline).to.be.calledWith(thumbnailItems[2].data);
        });
    });
    describe('#updateRecordItems', function () {
        it('should load(update) thumbnail items with IconMap', function () {
            var thumbnails = [{}, {}];
            var iconMap = ['icon'];
            readerview.updateThumbnailItems(thumbnails, iconMap);
            expect(readerview.thumbnailItems).to.equal(thumbnails);
            expect(readerview.iconMap).to.equal(iconMap);
        });
    });
    describe('#loadOutline', function () {
        it('should initialize new story in readingmode with provided data', function () {
            var data = { id: 1 };
            readerview.iconMap = 'iconMap';
            readerview.loadOutline(data);

            expect(mock.Outline.getCall(0).args[0][0]).to.equal($element.find('.reader-container')[0]);
            expect(mock.Outline.getCall(0).args[1]).to.deep.equal({ id: 1});
            expect(mock.Outline.getCall(0).args[2]).to.equal('iconMap');
            expect(mock.Outline.getCall(0).args[3].reader.disableAnimation).to.equal(true);
            expect(mock.Outline.getCall(0).args[3].reader.readerWidth).to.equal(500 - 24);

            expect(mock.Outline.prototype.transitionState).to.be.calledWith('readingmode');
        });
        it('should init new story with callback that wraps onLoadUrl config and' +
            ' eventually add story loaded class to story container when resolved', function () {
            var readerviewOnLoadUrl = sinon.stub().returns(Promise.resolve({ data: 'dummy' }));
            readerview = initNewReaderview({ config: { onLoadUrl: readerviewOnLoadUrl } }, true);
            readerview.loadOutline({ id: 1});

            var storyOnLoadUrl = mock.Outline.getCall(0).args[3].reader.onLoadUrl;
            return storyOnLoadUrl('someUrl').then(function (data) {
                expect(readerviewOnLoadUrl).to.be.calledWith('someUrl');
                expect(data).to.deep.equal({ data: 'dummy' });
                expect($element.find('.outlineContainer').hasClass('outline-loaded')).to.be.true;
            });
        });
        it('should remove previous story before initialze new story', function () {
            var data = { id: 2 };
            readerview.loadOutline(data);
            readerview.loadOutline(data);
            expect($element.find('.reader-container').children().length).to.equal(1);
        });
    });
});
