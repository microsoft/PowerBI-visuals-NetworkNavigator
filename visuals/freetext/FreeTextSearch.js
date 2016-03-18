"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AttributeSlicer_1 = require("../attributeslicer/AttributeSlicer");
/**
 * Implements a free text search
 */
var FreeTextSearch = (function (_super) {
    __extends(FreeTextSearch, _super);
    /**
     * Constructor for the free text search
     */
    function FreeTextSearch(element, provider) {
        var _this = this;
        _super.call(this, element);
        /**
         * The skip amount
         */
        this.skip = FreeTextSearch.DEFAULT_SKIP_AMOUNT;
        this.serverSideSearch = true;
        this.events.on("canLoadMoreData", function (item, isSearch) {
            item.result = isSearch || (typeof _this.offset === 'undefined' || typeof _this.total === 'undefined' || (_this.offset + _this.skip) < _this.total);
        });
        this.events.on("loadMoreData", function (item, isNewSearch) {
            if (isNewSearch) {
                _this.offset = _this.skip * -1; // Negate this so we don't add it, and start over
                _this.total = undefined;
            }
            item.result = _this.loadData((_this.offset || 0) + _this.skip);
        });
        this.searchProvider = provider;
        this.showHighlight = true;
    }
    Object.defineProperty(FreeTextSearch.prototype, "searchProvider", {
        get: function () {
            return this._searchProvider;
        },
        /**
         * Setter for the search provider
         */
        set: function (provider) {
            var _this = this;
            this._searchProvider = provider;
            this.offset = undefined;
            this.total = undefined;
            this.data = [];
            if (provider) {
                this.loadingMoreData = true;
                this.loadData(0).then(function (n) {
                    _this.data = n;
                    _this.loadingMoreData = false;
                    setTimeout(function () { return _this.checkLoadMoreData(); }, 10);
                });
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Loads the data from the services
     */
    FreeTextSearch.prototype.loadData = function (offset) {
        var _this = this;
        this.offset = undefined;
        this.total = undefined;
        var query = this.buildQuery(this.searchString);
        return this.searchProvider.query({
            offset: offset || 0,
            count: this.skip,
            query: query
        }).then(function (results) {
            _this.offset = results.offset;
            _this.total = results.total;
            return results.results.map(function (d) {
                var textResult = d.textualMatch;
                var searchString = _this.searchString;
                if (_this.searchString) {
                    var cols = Object.keys(query.where.eq);
                    searchString = query.where.eq[cols[0]];
                }
                searchString = searchString.replace(/\"/g, "");
                var idx = textResult.search(new RegExp(searchString, "i"));
                var match = textResult;
                var prefix = "";
                var suffix = "";
                if (searchString && idx >= 0) {
                    var firstIdx = Math.max(0, idx - Math.ceil(searchString.length / 2));
                    prefix = match.substring(firstIdx, idx);
                    suffix = match.substring(idx + searchString.length, idx + searchString.length + Math.ceil(searchString.length / 2));
                    match = match.substring(idx, idx + searchString.length);
                }
                else {
                    suffix = match.substring(0, 30);
                    match = "";
                }
                var item = {
                    id: d.id,
                    match: match,
                    matchPrefix: prefix,
                    matchSuffix: suffix,
                    selected: false,
                    value: 0,
                    renderedValue: undefined,
                    equals: function (b) { return d.id === b.id; }
                };
                return item;
            });
        });
    };
    /**
     * Builds the query
     */
    FreeTextSearch.prototype.buildQuery = function (searchText) {
        var column = "*";
        // If searchString looks like "emailId::5432", then use everything before it as a column search
        if (searchText) {
            var parts = searchText.split("::");
            if (parts.length === 2) {
                column = parts[0];
                searchText = parts[1];
            }
        }
        searchText = searchText || "*";
        return {
            where: {
                eq: (_a = {},
                    _a[column] = searchText,
                    _a
                )
            }
        };
        var _a;
    };
    /**
     * The default skip amount for free text search
     */
    FreeTextSearch.DEFAULT_SKIP_AMOUNT = 100;
    /**
     * A static list of providers
     */
    FreeTextSearch.DEFAULT_PROVIDERS = require('./providers');
    return FreeTextSearch;
}(AttributeSlicer_1.AttributeSlicer));
exports.FreeTextSearch = FreeTextSearch;
