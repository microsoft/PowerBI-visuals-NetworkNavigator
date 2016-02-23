var EventEmitter_1 = require('../../base/EventEmitter');
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
        this.events.raiseEvent("loadMoreData", item, isNewSearch);
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
     * Raises the event 'canLoadMoreData'
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