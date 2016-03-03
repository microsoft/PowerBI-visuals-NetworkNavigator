'use strict';
/* global $ */
/* eslint no-unused-expressions: 0 */

var proxyquire = require('proxyquireify')(require);

describe('Thumbnails', function() {
    var Thumbnails;
    var $container;
    var thumbnails;
    var mock = {};

    before(function () {
        mock.Thumbnail = function (spec) {
            this.data = spec.data;
            $('<div class="thumbnail">' + spec.data.id + '</div>').appendTo(spec.$parent);
        };
        mock.Thumbnail.prototype = {};
        sinon.spy(mock, 'Thumbnail');

        mock.Readerview = function () {};
        mock.Readerview.prototype = { updateThumbnailItems: sinon.stub() };
        sinon.spy(mock, 'Readerview');

        mock.InfiniteScroll = function () {};
        mock.InfiniteScroll.prototype = {
            onInfinite: sinon.stub(),
            infiniteScrollDone: sinon.stub(),
        };
        sinon.spy(mock, 'InfiniteScroll');

        mock.util = {
            flattenIconMap: sinon.stub().returns(['fakeIconMapGenerated']),
            mapEntitiesToIconMap: sinon.stub().returns(['fakeMappedIconMap']),
        };

        Thumbnails = proxyquire('../src/thumbnails', {
            './thumbnails.thumbnail': mock.Thumbnail,
            './thumbnails.readerview': mock.Readerview,
            './thumbnails.util': mock.util,
            'stories.common': { InfiniteScroll: mock.InfiniteScroll },
        });
    });
    var cleanup = function () {
        $container.remove();
        mock.Thumbnail.reset();
        mock.Readerview.reset();
        mock.Readerview.prototype.updateThumbnailItems.reset();
        mock.InfiniteScroll.reset();
        mock.InfiniteScroll.prototype.onInfinite.reset();
        mock.InfiniteScroll.prototype.infiniteScrollDone.reset();
        mock.util.flattenIconMap.reset();
        mock.util.mapEntitiesToIconMap.reset();
    };
    var initNewThumbnails = function (overwrite, clean) {
        if (clean) { cleanup(); }
        $container = $('<div></div>').appendTo(document.body);
        thumbnails = new Thumbnails($.extend({
            container: $container,
            config: {
                userConfig: 'fakeThumbnailsConfig',
                readerview: { config: 'fakeReaderviewUserConfig' },
                thumbnail: { config: 'fakeThumbnailUserConfig' },
            },
        }, overwrite));
        return thumbnails;
    };
    beforeEach(function () { initNewThumbnails(); });
    afterEach(cleanup);

    it('should have thumbnails container appended to the viewport', function() {
        var $thumbnailsContainer = $container.find('.thumbnails.viewport').children(':first');
        expect($thumbnailsContainer[0].className).to.equal('thumbnails-container');
    });
    it('should generate icon map', function () {
        thumbnails = initNewThumbnails({}, true);
        expect(thumbnails.iconMap).to.deep.equal(['fakeIconMapGenerated']);
        expect(mock.util.flattenIconMap.getCall(0).args[0].person).to.be.an('array');
    });
    it('should set icon map with provided entityIcons from config', function () {
        thumbnails = initNewThumbnails({config: { entityIcons: ['iconFromConfig']}}, true);
        expect(thumbnails.iconMap).to.deep.equal(['iconFromConfig']);
    });
    it('should initialize new readerview with user config', function () {
        var spec = mock.Readerview.getCall(0).args[0];
        expect(spec.$parent[0]).to.equal($container[0]);
        expect(spec.config).to.deep.equal({ config: 'fakeReaderviewUserConfig' });
    });
    it('should initialize the infinite scroll', function () {
        var $viewport = $container.find('.viewport');
        expect(mock.InfiniteScroll).to.be.calledOnce;
        expect(mock.InfiniteScroll.getCall(0).args[0][0]).to.equal($viewport[0]);
        expect(mock.InfiniteScroll.getCall(0).args[1]).to.equal(10);
    });
    describe('#loadData', function () {
        it('should map entities to icon map', function () {
            thumbnails.iconMap = ['someIconMap'];
            thumbnails.loadData(['someData']);
            expect(mock.util.mapEntitiesToIconMap).to.be.calledWith(['someData'], ['someIconMap']);
        });
        it('should not map entities if entityIcons are provided from config', function () {
            thumbnails = initNewThumbnails({config: { entityIcons: ['iconFromConfig']}}, true);
            thumbnails.loadData(['someData']);
            expect(mock.util.mapEntitiesToIconMap).to.be.not.called;
        });
        it('should load data and initialize/render new thumbnail for each data', function () {
            var $thumbnailContainer = $container.find('.thumbnails-container');
            thumbnails.loadData([{summary: 1}, {summary: 2}]);

            expect(mock.Thumbnail.getCall(0).args[0].$parent[0]).to.equal($thumbnailContainer[0]);
            expect(mock.Thumbnail.getCall(0).args[0].data).to.deep.equal({ summary: 1 });
            expect(mock.Thumbnail.getCall(0).args[0].config).to.deep.equal({ config: 'fakeThumbnailUserConfig' });

            expect(mock.Thumbnail.getCall(1).args[0].data).to.deep.equal({ summary: 2 });
        });
        it('should update thumbnails to readerview', function () {
            thumbnails.loadData([{summary: 3}, {summary: 7}]);
            var thumbnailItems = mock.Readerview.prototype.updateThumbnailItems.getCall(0).args[0];
            expect(thumbnailItems[0].data.summary).to.equal(3);
            expect(thumbnailItems[1].data.summary).to.equal(7);
        });
        it('should clear previous thumbnails with new load', function () {
            thumbnails.loadData([{summary: 1}, {summary: 2}]);
            thumbnails.loadData([{summary: 3}, {summary: 4}]);
            expect($container.find('.thumbnail').length).to.equal(2);
        });
        it('should append new thumbnails when append flag is provided', function () {
            thumbnails.loadData([{summary: 1}, {summary: 2}]);
            thumbnails.loadData([{summary: 3}, {summary: 4}], true);
            expect($container.find('.thumbnail').length).to.equal(4);
        });
    });
    describe('#onInfinite', function () {
        it('register infinite scroll handler that will execute provided function', function () {
            var fn = sinon.stub().returns(Promise.resolve('data'));
            var infiniteHandler;
            thumbnails.onInfinite(fn);
            infiniteHandler = mock.InfiniteScroll.prototype.onInfinite.getCall(0).args[0];
            infiniteHandler();
            expect(fn).to.be.calledOnce;
        });
        it('registerd infinite scroll handler eventually load data and call infinite scroll done', function (done) {
            var fn = sinon.stub().returns(Promise.resolve('data'));
            var stubLoadData = sinon.stub(Thumbnails.prototype, 'loadData');
            var infiniteHandler;
            thumbnails.onInfinite(fn);
            infiniteHandler = mock.InfiniteScroll.prototype.onInfinite.getCall(0).args[0];
            infiniteHandler();
            setTimeout(function() {
                expect(stubLoadData).to.be.calledWith('data', true);
                expect(mock.InfiniteScroll.prototype.infiniteScrollDone).to.be.called;
                stubLoadData.restore();
                done();
            });
        });
    });
});
