var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AdvancedSlicer_1 = require("../advancedslicer/AdvancedSlicer");
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
})(AdvancedSlicer_1.AdvancedSlicer);
exports.FreeTextSearch = FreeTextSearch;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnJlZVRleHRTZWFyY2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJGcmVlVGV4dFNlYXJjaC50cyJdLCJuYW1lcyI6WyJGcmVlVGV4dFNlYXJjaCIsIkZyZWVUZXh0U2VhcmNoLmNvbnN0cnVjdG9yIiwiRnJlZVRleHRTZWFyY2guc2VhcmNoUHJvdmlkZXIiLCJGcmVlVGV4dFNlYXJjaC5sb2FkRGF0YSIsIkZyZWVUZXh0U2VhcmNoLmJ1aWxkUXVlcnkiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsK0JBQTJDLGtDQUFrQyxDQUFDLENBQUE7QUFFOUU7O0dBRUc7QUFDSDtJQUFvQ0Esa0NBQWNBO0lBMEI5Q0E7O09BRUdBO0lBQ0hBLHdCQUFZQSxPQUFlQSxFQUFFQSxRQUEwQkE7UUE3QjNEQyxpQkFzSkNBO1FBeEhPQSxrQkFBTUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFuQm5CQTs7V0FFR0E7UUFDS0EsU0FBSUEsR0FBWUEsY0FBY0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQTtRQWtCdkRBLElBQUlBLENBQUNBLGdCQUFnQkEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDN0JBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBLGlCQUFpQkEsRUFBRUEsVUFBQ0EsSUFBSUEsRUFBRUEsUUFBUUE7WUFDN0NBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLFFBQVFBLElBQUlBLENBQUNBLE9BQU9BLEtBQUlBLENBQUNBLE1BQU1BLEtBQUtBLFdBQVdBLElBQUlBLE9BQU9BLEtBQUlBLENBQUNBLEtBQUtBLEtBQUtBLFdBQVdBLElBQUlBLENBQUNBLEtBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEtBQUlBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLEtBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQ2xKQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNIQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQSxjQUFjQSxFQUFFQSxVQUFDQSxJQUFJ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QUFDQSxZQUFZQSxDQUFDQTtnQkFDaENBLElBQUlBLFlBQVlBLEdBQUdBLEtBQUlBLENBQUNBLFlBQVlBLENBQUNBO2dCQUNyQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3BCQSxJQUFJQSxJQUFJQSxHQUFHQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtvQkFDdkNBLFlBQVlBLEdBQUdBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLEVBQUVBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMzQ0EsQ0FBQ0E7Z0JBQ0RBLFlBQVlBLEdBQUdBLFlBQVlBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO2dCQUMvQ0EsSUFBSUEsR0FBR0EsR0FBR0EsVUFBVUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsTUFBTUEsQ0FBQ0EsWUFBWUEsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzNEQSxJQUFJQSxLQUFLQSxHQUFHQSxVQUFVQSxDQUFDQTtnQkFDdkJBLElBQUlBLE1BQU1BLEdBQUdBLEVBQUVBLENBQUNBO2dCQUNoQkEsSUFBSUEsTUFBTUEsR0FBR0EsRUFBRUEsQ0FBQ0E7Z0JBQ2hCQSxFQUFFQSxDQUFDQSxDQUFDQSxZQUFZQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDM0JBLElBQUlBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEVBQUVBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUNyRUEsTUFBTUEsR0FBR0EsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsRUFBRUEsR0FBR0Es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