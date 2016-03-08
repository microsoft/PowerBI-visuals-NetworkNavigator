var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VisualBase_1 = require("../../base/VisualBase");
var Utils_1 = require("../../base/Utils");
var VisualDataRoleKind = powerbi.VisualDataRoleKind;
var Thumbnails = require("./lib/strippets_thumbnails/uncharted_thumbnails");
var StrippetsThumbnailsVisual = (function (_super) {
    __extends(StrippetsThumbnailsVisual, _super);
    function StrippetsThumbnailsVisual() {
        _super.apply(this, arguments);
        /**
         * The font awesome resource
         */
        this.fontAwesome = {
            url: '//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css',
            integrity: 'sha256-3dkvEK0WLHRJ7/Csr0BZjAWxERc5WH7bdeUya2aXxdU= sha512-+L4yy6FRcDGbXJ9mPG8MT' +
                '/3UCDzwR9gPeyFNMCtInsol++5m3bk2bXWKdZjvybmohrAsn3Ua5x8gfLnbE1YkOg==',
            crossorigin: "anonymous"
        };
    }
    /**
     * Initializes an instance of the IVisual.
     *
        * @param options Initialization options for the visual.
        */
    StrippetsThumbnailsVisual.prototype.init = function (options) {
        var _this = this;
        _super.prototype.init.call(this, options, '<div id="thumbnails-panel"></div>');
        this.host = options.host;
        this.thumbnailEle = this.element.find("#thumbnails-panel");
        Thumbnails.asJQueryPlugin();
        this.thumbnailEle['thumbnails']({
            readerview: {
                onLoadUrl: function () {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(require("./temp.js"));
                        }, 500);
                    });
                },
            },
            thumbnail: {
                height: '400px'
            },
        });
        this.thumbnailEle['thumbnails']("onInfinite", function () {
            // Do we have more data?
            if (_this.dataView && _this.dataView.metadata.segment) {
                return new Promise(function (resolve) {
                    _this.dataResolver = resolve;
                    _this.loadingMoreData = true;
                    _this.host.loadMoreData();
                });
            }
        });
    };
    /**
     * Notifies the IVisual of an update (data, viewmode, size change).
     */
    StrippetsThumbnailsVisual.prototype.update = function (options) {
        _super.prototype.update.call(this, options);
        if (options.dataViews && options.dataViews.length > 0) {
            var table = options.dataViews[0].table;
            var data = StrippetsThumbnailsVisual.converter(options.dataViews[0]);
            if (data && data.length) {
                this.thumbnailEle['thumbnails']("loaddata", data);
            }
        }
    };
    /**
     * Gets the inline css used for this element
     */
    StrippetsThumbnailsVisual.prototype.getCss = function () {
        return _super.prototype.getCss.call(this).concat([
            require("!css!sass!./lib/strippets_thumbnails/strippets.css"),
            require("!css!sass!./lib/strippets_thumbnails/thumbnails.css")
        ]);
    };
    /**
    * Gets the external css paths used for this visualization
    */
    StrippetsThumbnailsVisual.prototype.getExternalCssResources = function () {
        return _super.prototype.getExternalCssResources.call(this).concat(this.fontAwesome);
    };
    /**
     * Converts the dataview into our own model
     */
    StrippetsThumbnailsVisual.converter = function (dataView) {
        var table = dataView.table;
        var docColumnMapping = {};
        var entityColumnMapping = {};
        var entityFields = [
            'id',
            'name',
            'type',
            'description',
            'firstPosition'
        ];
        var docFields = [
            'id',
            'rank',
            'imageUrl',
            'source',
            'sourceUrl',
            'sourceimage',
            'title',
            'author',
            'articledate',
            'summary',
            'url',
            'readerUrl'
        ];
        if (dataView.metadata.columns.length < docFields.length + entityFields.length) {
            return [];
        }
        dataView.metadata.columns.forEach(function (n, i) {
            if (n.roles['DocumentFields']) {
                docColumnMapping[n.displayName] = i;
            }
            if (n.roles['EntityFields']) {
                entityColumnMapping[n.displayName] = i;
            }
        });
        var docMap = {};
        table.rows.forEach(function (rowValues) {
            var docId = rowValues[docColumnMapping["id"]];
            var doc = docMap[docId];
            if (!doc) {
                doc = docMap[docId] = {
                    entities: []
                };
            }
            docFields.forEach(function (field) {
                var value = rowValues[docColumnMapping[field]];
                if (field === "imageUrl") {
                    var urls = value.split(",");
                    for (var i = 0, n = urls.length; i < n; ++i) {
                        urls[i] = decodeURIComponent(urls[i]);
                    }
                    value = urls;
                }
                else {
                    value = decodeURIComponent(value);
                }
                doc[field] = value;
            });
            var entity = {};
            entityFields.forEach(function (field) {
                entity[field] = rowValues[entityColumnMapping[field]];
            });
            doc.entities.push(entity);
        });
        return Object.keys(docMap).map(function (n) { return docMap[n]; });
    };
    /**
     * Represents the capabilities for this visual
     */
    StrippetsThumbnailsVisual.capabilities = {
        dataRoles: [{
                name: "EntityFields",
                displayName: "Entity Fields",
                kind: VisualDataRoleKind.Grouping
            }, {
                name: "DocumentFields",
                displayName: "Documents Fields",
                kind: VisualDataRoleKind.Grouping
            }],
        dataViewMappings: [{
                table: {
                    rows: {
                        select: [
                            { bind: { to: 'EntityFields' } },
                            { bind: { to: 'DocumentFields' } },
                        ]
                    },
                    rowCount: 1
                }
            }],
        objects: {}
    };
    StrippetsThumbnailsVisual = __decorate([
        Utils_1.Visual(require("./build.js").output.PowerBI)
    ], StrippetsThumbnailsVisual);
    return StrippetsThumbnailsVisual;
})(VisualBase_1.VisualBase);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StrippetsThumbnailsVisual;
