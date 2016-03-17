"use strict";
var EventEmitter_1 = require('../../base/EventEmitter');
var $ = require("jquery");
var naturalSort = require("javascript-natural-sort");
/**
 * Represents an advanced slicer to help slice through data
 */
var AdvancedSlicer = (function () {
    /**
     * Constructor for the advanced slicer
     */
    function AdvancedSlicer(element) {
        var _this = this;
        /**
         * The data contained in this slicer
         */
        this._data = [];
        /**
         * Our event emitter
         */
        this._eventEmitter = new EventEmitter_1.default();
        /**
         * Whether or not we are loading the search box
         */
        this.loadingSearch = false;
        /**
         * Setter for server side search
         */
        this._serverSideSearch = true;
        /**
         * The list of selected items
         */
        this._selectedItems = [];
        /**
         * A boolean indicating whether or not the list is loading more data
         */
        this._loadingMoreData = false; // Don't use this directly
        this.element = element;
        this.listContainer = element.append($(AdvancedSlicer.template)).find(".advanced-slicer");
        this.listEle = this.listContainer.find(".list");
        this.listEle.scroll(function () { return _this.checkLoadMoreData(); });
        this.selectionsEle = element.find(".selections");
        this.checkAllEle = element.find(".check-all").on("click", function () { return _this.toggleSelectAll(); });
        this.clearAllEle = element.find(".clear-all").on("click", function () { return _this.clearSelection(); });
        this.attachEvents();
        // These two are here because the devtools call init more than once
        this.loadingMoreData = true;
    }
    Object.defineProperty(AdvancedSlicer.prototype, "serverSideSearch", {
        /**
         * Getter for server side search
         */
        get: function () {
            return this._serverSideSearch;
        },
        set: function (value) {
            this._serverSideSearch = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AdvancedSlicer.prototype, "events", {
        /**
         * Gets our event emitter
         */
        get: function () {
            return this._eventEmitter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AdvancedSlicer.prototype, "dimensions", {
        /**
         * Sets the dimension of the slicer
         */
        set: function (dims) {
            this.listEle.find(".display-container").css({ width: "100%" });
            this.listEle.css({ width: "100%", height: dims.height - this.element.find(".slicer-options").height() - 10 });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AdvancedSlicer.prototype, "showValues", {
        /**
         * Setter for showing the values column
         */
        set: function (show) {
            this.element.toggleClass("has-values", show);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AdvancedSlicer.prototype, "showSelections", {
        /**
         * Setter for showing the selections area
         */
        set: function (show) {
            this.element.toggleClass("show-selections", show);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AdvancedSlicer.prototype, "showHighlight", {
        /**
         * Gets whether or not we are showing the highlights
         */
        get: function () {
            return this.element.hasClass("show-highlight");
        },
        /**
         * Toggles whether or not to show highlights
         */
        set: function (highlight) {
            this.element.toggleClass("show-highlight", !!highlight);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AdvancedSlicer.prototype, "data", {
        /**
         * Gets the data behind the slicer
         */
        get: function () {
            return this._data;
        },
        /**
         * Sets the slicer data
         */
        set: function (newData) {
            this.listEle.empty();
            // If some one sets the data, then clearly we are no longer loading data
            this.loadingMoreData = false;
            if (newData && newData.length) {
                this.listEle.append(newData.map(function (item) {
                    var ele = AdvancedSlicer.listItemFactory(item.matchPrefix, item.match, item.matchSuffix);
                    var renderedValue = item.renderedValue;
                    if (renderedValue) {
                        var valueDisplayEle = ele.find(".value-display");
                        valueDisplayEle.css({ width: (renderedValue + "%") });
                        valueDisplayEle.find(".value").html('' + item.value);
                    }
                    ele[item.selected ? "hide" : "show"].call(ele);
                    ele.find("input").prop('checked', item.selected);
                    ele.data("item", item);
                    return ele;
                }));
                this.loadingSearch = true;
                this.element.find(".searchbox").val(this.searchString);
                this.loadingSearch = false;
                this._data = newData;
                this.updateSelectAllButtonState();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AdvancedSlicer.prototype, "selectedItems", {
        get: function () {
            return this._selectedItems;
        },
        /**
         * Sets the set of selected items
         */
        set: function (value) {
            var _this = this;
            var oldSelection = this.selectedItems.slice(0);
            this._selectedItems = value;
            // HACK: They are all selected if it is the same length as our dataset
            var allChecked = value && value.length === this.data.length;
            var someChecked = value && value.length > 0 && !allChecked;
            this.syncItemVisiblity();
            if (value) {
                this.selectionsEle.find(".token").remove();
                value.map(function (v) { return _this.createSelectionToken(v); }).forEach(function (n) { return n.insertBefore(_this.element.find(".clear-all")); });
            }
            this.events.raiseEvent("selectionChanged", this._selectedItems, oldSelection);
            this.checkAllEle.prop("checked", someChecked);
            this.checkAllEle.prop('indeterminate', someChecked);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AdvancedSlicer.prototype, "searchString", {
        /**
         * Gets the current serch value
         */
        get: function () {
            return this.element.find(".searchbox").val();
        },
        enumerable: true,
        configurable: true
    });
    /**j
     * Sorts the slicer
     */
    AdvancedSlicer.prototype.sort = function (toSort, desc) {
        this.data.sort(function (a, b) {
            var sortVal = naturalSort(a[toSort], b[toSort]);
            return desc ? -1 * sortVal : sortVal;
        });
    };
    Object.defineProperty(AdvancedSlicer.prototype, "loadingMoreData", {
        get: function () {
            return this._loadingMoreData;
        },
        /**
         * Setter for loadingMoreData
         */
        set: function (value) {
            this._loadingMoreData = value;
            this.element.toggleClass("loading", value);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Syncs the item elements state with the current set of selected items and the search
     */
    AdvancedSlicer.prototype.syncItemVisiblity = function () {
        var value = this.selectedItems;
        var eles = this.element.find(".item");
        var me = this;
        var isMatch = function (item, value) {
            return (item.match || "").indexOf(value) >= 0 ||
                (item.matchPrefix || "").indexOf(value) >= 0 ||
                (item.matchSuffix || "").indexOf(value) >= 0;
        };
        eles.each(function () {
            var item = $(this).data("item");
            var isVisible = !(!!value && value.filter(function (b) { return b.equals(item); }).length > 0);
            // Update the search
            if (isVisible && !me.serverSideSearch && me.searchString) {
                isVisible = isMatch(item, me.searchString);
            }
            $(this).toggle(isVisible);
        });
    };
    /**
     * Toggle the select all state
     */
    AdvancedSlicer.prototype.toggleSelectAll = function () {
        var checked = this.checkAllEle.prop('checked');
        if (!!checked) {
            this.selectedItems = this._data.slice(0);
        }
        else {
            this.selectedItems = [];
        }
    };
    /**
     * Creates a new selection token element
     */
    AdvancedSlicer.prototype.createSelectionToken = function (v) {
        var _this = this;
        var newEle = $('<div/>');
        var text = (v.matchPrefix || "") + v.match + (v.matchSuffix || "");
        newEle
            .addClass("token")
            .attr("title", text)
            .data("item", v)
            .on("click", function () {
            newEle.remove();
            var item = _this.selectedItems.filter(function (n) { return n.equals(v); })[0];
            _this.selectedItems.splice(_this.selectedItems.indexOf(item), 1);
            _this.selectedItems = _this.selectedItems.slice(0);
        })
            .text(text);
        return newEle;
    };
    /**
     * Clears the selection
     */
    AdvancedSlicer.prototype.clearSelection = function () {
        this.selectedItems = [];
    };
    /**
     * Updates the select all button state to match the data
     */
    AdvancedSlicer.prototype.updateSelectAllButtonState = function () {
        this.checkAllEle.prop('indeterminate', this.selectedItems.length > 0 && this._data.length !== this.selectedItems.length);
        this.checkAllEle.prop('checked', this.selectedItems.length > 0);
    };
    /**
     * Attaches all the necessary events
     */
    AdvancedSlicer.prototype.attachEvents = function () {
        var _this = this;
        this.element.find(".searchbox").on("input", _.debounce(function () {
            if (!_this.loadingSearch) {
                if (_this.serverSideSearch) {
                    setTimeout(function () { return _this.checkLoadMoreDataBasedOnSearch(); }, 10);
                }
                // this is required because when the list is done searching it adds back in cached elements with selected flags
                _this.syncItemVisiblity();
                _this.element.toggleClass("has-search", !!_this.searchString);
            }
        }, AdvancedSlicer.SEARCH_DEBOUNCE));
        this.listEle.on("click", function (evt) {
            // var checkbox = $(evt.target);
            var ele = $(evt.target).parents(".item");
            if (ele.length > 0) {
                var oldSelectedItems = _this.selectedItems.slice(0);
                var item = ele.data("item");
                _this.selectedItems.push(item);
                _this.selectedItems = _this.selectedItems.slice(0);
                _this.raiseSelectionChanged(_this.selectedItems, oldSelectedItems);
                _this.updateSelectAllButtonState();
            }
            evt.stopImmediatePropagation();
            evt.stopPropagation();
        });
    };
    /**
     * Loads more data based on search
     * @param force Force the loading of new data, if it can
     */
    AdvancedSlicer.prototype.checkLoadMoreDataBasedOnSearch = function () {
        // Only need to load if:
        // 1. There is more data. 2. There is not too much stuff on the screen (not causing a scroll)
        if (this.raiseCanLoadMoreData(true)) {
            if (this.loadPromise) {
                this.loadPromise['cancel'] = true;
            }
            // We're not currently loading data, cause we cancelled
            this.loadingMoreData = false;
            this.raiseLoadMoreData(true);
        }
    };
    /**
     * Listener for the list scrolling
     */
    AdvancedSlicer.prototype.checkLoadMoreData = function () {
        var scrollElement = this.listEle[0];
        var scrollHeight = scrollElement.scrollHeight;
        var top = scrollElement.scrollTop;
        var shouldScrollLoad = scrollHeight - (top + scrollElement.clientHeight) < 200 && scrollHeight >= 200;
        if (shouldScrollLoad && !this.loadingMoreData && this.raiseCanLoadMoreData()) {
            this.raiseLoadMoreData(false);
        }
    };
    /**
     * Raises the event to load more data
     */
    AdvancedSlicer.prototype.raiseLoadMoreData = function (isNewSearch) {
        var _this = this;
        var item = {};
        this.events.raiseEvent("loadMoreData", item, isNewSearch, this.searchString);
        if (item.result) {
            this.loadingMoreData = true;
            var promise_1 = this.loadPromise = item.result.then(function (items) {
                // If this promise hasn't been cancelled
                if (!promise_1['cancel']) {
                    _this.loadingMoreData = false;
                    _this.loadPromise = undefined;
                    if (isNewSearch) {
                        _this.data = items;
                    }
                    else {
                        _this.data = _this.data.concat(items);
                    }
                    // Make sure we don't need to load more after this, in case it doesn't all fit on the screen
                    setTimeout(function () { return _this.checkLoadMoreData(); }, 10);
                    return items;
                }
            }, function () {
                _this.data = [];
                _this.loadingMoreData = false;
            });
            return promise_1;
        }
    };
    /**
     * Raises the event 'can
     * '
     */
    AdvancedSlicer.prototype.raiseCanLoadMoreData = function (isSearch) {
        if (isSearch === void 0) { isSearch = false; }
        var item = {
            result: false
        };
        this.events.raiseEvent('canLoadMoreData', item, isSearch);
        return item.result;
    };
    /**
     * Raises the selectionChanged event
     */
    AdvancedSlicer.prototype.raiseSelectionChanged = function (newItems, oldItems) {
        this.events.raiseEvent('selectionChanged', newItems, oldItems);
    };
    /**
     * The number of milliseconds before running the search, after a user stops typing.
     */
    AdvancedSlicer.SEARCH_DEBOUNCE = 500;
    /**
     * The template for this visual
     */
    AdvancedSlicer.template = "\n        <div class=\"advanced-slicer\">\n            <div class=\"slicer-options\">\n                <input class=\"searchbox\" placeholder=\"Search\" />\n                <div style=\"margin:0;padding:0;margin-top:5px;\">\n                <div class=\"selection-container\">\n                    <div class=\"selections\">\n                        <span class=\"clear-all\">Clear All</span>\n                    </div>\n                </div>\n                <!-- Disabled -->\n                <label style=\"display:none;vertical-align:middle\"><input class=\"check-all\" type=\"checkbox\" style=\"margin-right:5px;vertical-align:middle\"/>&nbsp;Select All</label>\n                </div>\n                <hr/>\n            </div>\n            <div class=\"list\" style=\"overflow:hidden;overflow-y:auto\"></div>\n            <div class='load-spinner' style='transform:scale(0.6);'><div>\n        </div>\n    ".trim().replace(/\n/g, '');
    /**
     * The template used to render list items
     */
    AdvancedSlicer.listItemFactory = function (matchPrefix, match, matchSuffix) {
        return $(("\n            <div style=\"white-space:nowrap\" class=\"item\">\n                <label style=\"cursor:pointer\">\n                    <!--<input style=\"vertical-align:middle;cursor:pointer\" type=\"checkbox\">-->\n                    <span style=\"margin-left: 5px;vertical-align:middle\" class=\"display-container\">\n                        <span style=\"display:inline-block;overflow:hidden\" class=\"category-container\">\n                            <span class=\"matchPrefix\">" + (matchPrefix || "") + "</span>\n                            <span class=\"match\">" + (match || "") + "</span>\n                            <span class=\"matchSuffix\">" + (matchSuffix || "") + "</span>\n                        </span>\n                        <span style=\"display:inline-block\" class=\"value-container\">\n                            <span style=\"display:inline-block;width:0px\" class=\"value-display\">&nbsp;<span class=\"value\"></span></span>\n                        </span>\n                    </span>\n                </label>\n            </div>\n        ").trim().replace(/\n/g, ''));
    };
    return AdvancedSlicer;
}());
exports.AdvancedSlicer = AdvancedSlicer;
