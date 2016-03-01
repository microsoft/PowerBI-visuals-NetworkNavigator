var EventEmitter_1 = require('../../base/EventEmitter');
var $ = require("jquery");
var List = require('./List');
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
        this.listContainer = element.append($(AdvancedSlicer.template)).find("#slicer-list");
        this.listEle = this.listContainer.find(".list");
        this.listEle.scroll(function () { return _this.checkLoadMoreData(); });
        this.myList = new List(this.listContainer[0], {
            valueName: ['match', 'matchPrefix', 'matchSuffix'],
            item: AdvancedSlicer.listItemTemplate,
            page: 20000 // Hack
        });
        this.selectionsEle = element.find(".selections");
        this.checkAllButton = element.find(".check-all").on("click", function () { return _this.toggleSelectAll(); });
        this.checkAllButton = element.find(".clear-all").on("click", function () { return _this.clearSelection(); });
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
            this.myList.clear();
            // If some one sets the data, then clearly we are no longer loading data
            this.loadingMoreData = false;
            if (newData && newData.length) {
                this.myList.add(newData, function (addedItems) {
                    addedItems.forEach(function (n) {
                        var ele = $(n.elm);
                        var item = n.values();
                        var renderedValue = item.renderedValue;
                        if (renderedValue) {
                            ele.find(".value-display").css({ width: (renderedValue + "%") });
                        }
                        ele[item.selected ? "hide" : "show"].call(ele);
                        ele.find("input").prop('checked', item.selected);
                        ele.data("item", item);
                    });
                });
                this.loadingSearch = true;
                this.myList.search(this.searchString);
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
            this.syncItemStateWithSelectedItems();
            if (value) {
                this.selectionsEle.find(".token").remove();
                value.map(function (v) { return _this.createSelectionToken(v); }).forEach(function (n) { return n.insertBefore(_this.element.find(".clear-all")); });
            }
            this.events.raiseEvent("selectionChanged", this._selectedItems, oldSelection);
            this.checkAllButton.prop("checked", someChecked);
            this.checkAllButton.prop('indeterminate', someChecked);
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
        this.myList.sort(toSort, {
            order: desc ? "desc" : "asc"
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
     * Syncs the item elements state with the current set of selected items
     */
    AdvancedSlicer.prototype.syncItemStateWithSelectedItems = function () {
        var value = this.selectedItems;
        var eles = this.element.find(".item");
        eles.each(function () {
            var item = $(this).data("item");
            $(this).toggle(!(!!value && value.filter(function (b) { return b.equals(item); }).length > 0));
        });
    };
    /**
     * Toggle the select all state
     */
    AdvancedSlicer.prototype.toggleSelectAll = function () {
        var checked = this.checkAllButton.prop('checked');
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
        this.checkAllButton.prop('indeterminate', this.selectedItems.length > 0 && this._data.length !== this.selectedItems.length);
        this.checkAllButton.prop('checked', this.selectedItems.length > 0);
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
                else {
                    _this.myList.search(_this.searchString);
                }
                // this is required because when the list is done searching it adds back in cached elements with selected flags
                _this.syncItemStateWithSelectedItems();
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
            var promise = this.loadPromise = item.result.then(function (items) {
                // If this promise hasn't been cancelled
                if (!promise['cancel']) {
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
            return promise;
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
    AdvancedSlicer.template = "\n        <div id='slicer-list'>\n            <div class=\"slicer-options\">\n                <input class=\"searchbox\" placeholder=\"Search\" />\n                <div style=\"margin:0;padding:0;margin-top:5px;\">\n                <div class=\"selection-container\">\n                    <div class=\"selections\">\n                        <span class=\"clear-all\">Clear All</span>\n                    </div>\n                </div>\n                <!-- Disabled -->\n                <label style=\"display:none;vertical-align:middle\"><input class=\"check-all\" type=\"checkbox\" style=\"margin-right:5px;vertical-align:middle\"/>&nbsp;Select All</label>\n                </div>\n                <hr/>\n            </div>\n            <div class=\"list\" style=\"overflow:hidden;overflow-y:auto\"></div>\n            <div class='load-spinner' style='transform:scale(0.6);'><div>\n        </div>\n    ".trim().replace(/\n/g, '');
    /**
     * The template used to render list items
     */
    AdvancedSlicer.listItemTemplate = "\n        <div style=\"white-space:nowrap\" class=\"item\">\n            <label style=\"cursor:pointer\">\n                <!--<input style=\"vertical-align:middle;cursor:pointer\" type=\"checkbox\">-->\n                <span style=\"margin-left: 5px;vertical-align:middle\" class=\"display-container\">\n                    <span style=\"display:inline-block;overflow:hidden\" class=\"category-container\">\n                        <span class=\"matchPrefix\"></span><span class=\"match\"></span><span class=\"matchSuffix\"></span>\n                    </span>\n                    <span style=\"display:inline-block\" class=\"value-container\">\n                        <span style=\"display:inline-block;background-color:blue;width:0px\" class=\"value-display\">&nbsp;</span>\n                    </span>\n                </span>\n            </label>\n        </div>\n    ".trim().replace(/\n/g, '');
    return AdvancedSlicer;
})();
exports.AdvancedSlicer = AdvancedSlicer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWR2YW5jZWRTbGljZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJBZHZhbmNlZFNsaWNlci50cyJdLCJuYW1lcyI6WyJBZHZhbmNlZFNsaWNlciIsIkFkdmFuY2VkU2xpY2VyLmNvbnN0cnVjdG9yIiwiQWR2YW5jZWRTbGljZXIuc2VydmVyU2lkZVNlYXJjaCIsIkFkdmFuY2VkU2xpY2VyLmV2ZW50cyIsIkFkdmFuY2VkU2xpY2VyLmRpbWVuc2lvbnMiLCJBZHZhbmNlZFNsaWNlci5zaG93VmFsdWVzIiwiQWR2YW5jZWRTbGljZXIuc2hvd1NlbGVjdGlvbnMiLCJBZHZhbmNlZFNsaWNlci5zaG93SGlnaGxpZ2h0IiwiQWR2YW5jZWRTbGljZXIuZGF0YSIsIkFkdmFuY2VkU2xpY2VyLnNlbGVjdGVkSXRlbXMiLCJBZHZhbmNlZFNsaWNlci5zZWFyY2hTdHJpbmciLCJBZHZhbmNlZFNsaWNlci5zb3J0IiwiQWR2YW5jZWRTbGljZXIubG9hZGluZ01vcmVEYXRhIiwiQWR2YW5jZWRTbGljZXIuc3luY0l0ZW1TdGF0ZVdpdGhTZWxlY3RlZEl0ZW1zIiwiQWR2YW5jZWRTbGljZXIudG9nZ2xlU2VsZWN0QWxsIiwiQWR2YW5jZWRTbGljZXIuY3JlYXRlU2VsZWN0aW9uVG9rZW4iLCJBZHZhbmNlZFNsaWNlci5jbGVhclNlbGVjdGlvbiIsIkFkdmFuY2VkU2xpY2VyLnVwZGF0ZVNlbGVjdEFsbEJ1dHRvblN0YXRlIiwiQWR2YW5jZWRTbGljZXIuYXR0YWNoRXZlbnRzIiwiQWR2YW5jZWRTbGljZXIuY2hlY2tMb2FkTW9yZURhdGFCYXNlZE9uU2VhcmNoIiwiQWR2YW5jZWRTbGljZXIuY2hlY2tMb2FkTW9yZURhdGEiLCJBZHZhbmNlZFNsaWNlci5yYWlzZUxvYWRNb3JlRGF0YSIsIkFkdmFuY2VkU2xpY2VyLnJhaXNlQ2FuTG9hZE1vcmVEYXRhIiwiQWR2YW5jZWRTbGljZXIucmFpc2VTZWxlY3Rpb25DaGFuZ2VkIl0sIm1hcHBpbmdzIjoiQUFBQSw2QkFB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