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
            this.listEle.empty();
            // If some one sets the data, then clearly we are no longer loading data
            this.loadingMoreData = false;
            if (newData && newData.length) {
                this.listEle.append(newData.map(function (item) {
                    var ele = AdvancedSlicer.listItemFactory(item.matchPrefix, item.match, item.matchSuffix);
                    var renderedValue = item.renderedValue;
                    if (renderedValue) {
                        ele.find(".value-display").css({ width: (renderedValue + "%") });
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
    AdvancedSlicer.template = "\n        <div class=\"advanced-slicer\">\n            <div class=\"slicer-options\">\n                <input class=\"searchbox\" placeholder=\"Search\" />\n                <div style=\"margin:0;padding:0;margin-top:5px;\">\n                <div class=\"selection-container\">\n                    <div class=\"selections\">\n                        <span class=\"clear-all\">Clear All</span>\n                    </div>\n                </div>\n                <!-- Disabled -->\n                <label style=\"display:none;vertical-align:middle\"><input class=\"check-all\" type=\"checkbox\" style=\"margin-right:5px;vertical-align:middle\"/>&nbsp;Select All</label>\n                </div>\n                <hr/>\n            </div>\n            <div class=\"list\" style=\"overflow:hidden;overflow-y:auto\"></div>\n            <div class='load-spinner' style='transform:scale(0.6);'><div>\n        </div>\n    ".trim().replace(/\n/g, '');
    /**
     * The template used to render list items
     */
    AdvancedSlicer.listItemFactory = function (matchPrefix, match, matchSuffix) {
        return $(("\n            <div style=\"white-space:nowrap\" class=\"item\">\n                <label style=\"cursor:pointer\">\n                    <!--<input style=\"vertical-align:middle;cursor:pointer\" type=\"checkbox\">-->\n                    <span style=\"margin-left: 5px;vertical-align:middle\" class=\"display-container\">\n                        <span style=\"display:inline-block;overflow:hidden\" class=\"category-container\">\n                            <span class=\"matchPrefix\">" + (matchPrefix || "") + "</span>\n                            <span class=\"match\">" + (match || "") + "</span>\n                            <span class=\"matchSuffix\">" + (matchSuffix || "") + "</span>\n                        </span>\n                        <span style=\"display:inline-block\" class=\"value-container\">\n                            <span style=\"display:inline-block;background-color:blue;width:0px\" class=\"value-display\">&nbsp;</span>\n                        </span>\n                    </span>\n                </label>\n            </div>\n        ").trim().replace(/\n/g, ''));
    };
    return AdvancedSlicer;
})();
exports.AdvancedSlicer = AdvancedSlicer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWR2YW5jZWRTbGljZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJBZHZhbmNlZFNsaWNlci50cyJdLCJuYW1lcyI6WyJBZHZhbmNlZFNsaWNlciIsIkFkdmFuY2VkU2xpY2VyLmNvbnN0cnVjdG9yIiwiQWR2YW5jZWRTbGljZXIuc2VydmVyU2lkZVNlYXJjaCIsIkFkdmFuY2VkU2xpY2VyLmV2ZW50cyIsIkFkdmFuY2VkU2xpY2VyLmRpbWVuc2lvbnMiLCJBZHZhbmNlZFNsaWNlci5zaG93VmFsdWVzIiwiQWR2YW5jZWRTbGljZXIuc2hvd1NlbGVjdGlvbnMiLCJBZHZhbmNlZFNsaWNlci5zaG93SGlnaGxpZ2h0IiwiQWR2YW5jZWRTbGljZXIuZGF0YSIsIkFkdmFuY2VkU2xpY2VyLnNlbGVjdGVkSXRlbXMiLCJBZHZhbmNlZFNsaWNlci5zZWFyY2hTdHJpbmciLCJBZHZhbmNlZFNsaWNlci5zb3J0IiwiQWR2YW5jZWRTbGljZXIubG9hZGluZ01vcmVEYXRhIiwiQWR2YW5jZWRTbGljZXIuc3luY0l0ZW1WaXNpYmxpdHkiLCJBZHZhbmNlZFNsaWNlci50b2dnbGVTZWxlY3RBbGwiLCJBZHZhbmNlZFNsaWNlci5jcmVhdGVTZWxlY3Rpb25Ub2tlbiIsIkFkdmFuY2VkU2xpY2VyLmNsZWFyU2VsZWN0aW9uIiwiQWR2YW5jZWRTbGljZXIudXBkYXRlU2VsZWN0QWxsQnV0dG9uU3RhdGUiLCJBZHZhbmNlZFNsaWNlci5hdHRhY2hFdmVudHMiLCJBZHZhbmNlZFNsaWNlci5jaGVja0xvYWRNb3JlRGF0YUJhc2VkT25TZWFyY2giLCJBZHZhbmNlZFNsaWNlci5jaGVja0xvYWRNb3JlRGF0YSIsIkFkdmFuY2VkU2xpY2VyLnJhaXNlTG9hZE1vcmVEYXRhIiwiQWR2YW5jZWRTbGljZXIucmFpc2VDYW5Mb2FkTW9yZURhdGEiLCJBZHZhbmNlZFNsaWNlci5yYWlzZVNlbGVjdGlvbkNoYW5nZWQiXSwibWFwcGluZ3MiOiJBQUFBLDZCQUF5Qix5QkFBeUIsQ0FBQyxDQUFBO0FBRW5ELElBQU0sQ0FBQyxHQUFrQixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDM0MsSUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFFdkQ7O0dBRUc7QUFDSDtJQWtHSUE7O09BRUdBO0lBQ0hBLHdCQUFZQSxPQUFlQTtRQXJHL0JDLGlCQTJjQ0E7UUFsWUdBOztXQUVHQTtRQUNLQSxVQUFLQSxHQUFrQkEsRUFBRUEsQ0FBQ0E7UUFFbENBOztXQUVHQTtRQUNLQSxrQkFBYUEsR0FBa0JBLElBQUlBLHNCQUFZQSxFQUFFQSxDQUFDQTtRQVkxREE7O1dBRUdBO1FBQ0tBLGtCQUFhQSxHQUFHQSxLQUFLQSxDQUFDQTtRQW9COUJBOztXQUVHQTtRQUNLQSxzQkFBaUJBLEdBQUdBLElBQUlBLENBQUNBO1FBOEZqQ0E7O1dBRUdBO1FBQ0tBLG1CQUFjQSxHQUFrQkEsRUFBRUEsQ0FBQ0E7UUE4QzNDQTs7V0FFR0E7UUFDS0EscUJBQWdCQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQSwwQkFBMEJBO1FBbkt4REEsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsT0FBT0EsQ0FBQ0E7UUFDdkJBLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLGNBQWNBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsQ0FBQ0E7UUFDekZBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBQ2hEQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxjQUFNQSxPQUFBQSxLQUFJQSxDQUFDQSxpQkFBaUJBLEVBQUVBLEVBQXhCQSxDQUF3QkEsQ0FBQ0EsQ0FBQ0E7UUFFcERBLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO1FBQ2pEQSxJQUFJQSxDQUFDQSxjQUFjQSxHQUFHQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxPQUFPQSxFQUFFQSxjQUFNQSxPQUFBQSxLQUFJQSxDQUFDQSxlQUFlQSxFQUFFQSxFQUF0QkEsQ0FBc0JBLENBQUNBLENBQUNBO1FBQzNGQSxJQUFJQSxDQUFDQSxjQUFjQSxHQUFHQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxPQUFPQSxFQUFFQSxjQUFNQSxPQUFBQSxLQUFJQSxDQUFDQSxjQUFjQSxFQUFFQSxFQUFyQkEsQ0FBcUJBLENBQUNBLENBQUNBO1FBQzFGQSxJQUFJQSxDQUFDQSxZQUFZQSxFQUFFQSxDQUFDQTtRQUVwQkEsbUVBQW1FQTtRQUNuRUEsSUFBSUEsQ0FBQ0EsZUFBZUEsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDaENBLENBQUNBO0lBTURELHNCQUFXQSw0Q0FBZ0JBO1FBSTNCQTs7V0FFR0E7YUFDSEE7WUFDSUUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQTtRQUNsQ0EsQ0FBQ0E7YUFUREYsVUFBNEJBLEtBQWNBO1lBQ3RDRSxJQUFJQSxDQUFDQSxpQkFBaUJBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ25DQSxDQUFDQTs7O09BQUFGO0lBWURBLHNCQUFXQSxrQ0FBTUE7UUFIakJBOztXQUVHQTthQUNIQTtZQUNJRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQTtRQUM5QkEsQ0FBQ0E7OztPQUFBSDtJQUtEQSxzQkFBV0Esc0NBQVVBO1FBSHJCQTs7V0FFR0E7YUFDSEEsVUFBc0JBLElBQXVDQTtZQUN6REksSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxLQUFLQSxFQUFFQSxNQUFNQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUMvREEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsS0FBS0EsRUFBRUEsTUFBTUEsRUFBRUEsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQSxNQUFNQSxFQUFFQSxHQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUNqSEEsQ0FBQ0E7OztPQUFBSjtJQUtEQSxzQkFBV0Esc0NBQVVBO1FBSHJCQTs7V0FFR0E7YUFDSEEsVUFBc0JBLElBQWFBO1lBQy9CSyxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxZQUFZQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNqREEsQ0FBQ0E7OztPQUFBTDtJQUtEQSxzQkFBV0EsMENBQWNBO1FBSHpCQTs7V0FFR0E7YUFDSEEsVUFBMEJBLElBQWFBO1lBQ25DTSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxpQkFBaUJBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1FBQ3REQSxDQUFDQTs7O09BQUFOO0lBS0RBLHNCQUFXQSx5Q0FBYUE7UUFIeEJBOztXQUVHQTthQUNIQTtZQUNJTyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxRQUFRQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBO1FBQ25EQSxDQUFDQTtRQUVEUDs7V0FFR0E7YUFDSEEsVUFBeUJBLFNBQWtCQTtZQUN2Q08sSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUM1REEsQ0FBQ0E7OztPQVBBUDtJQVlEQSxzQkFBV0EsZ0NBQUlBO1FBSGZBOztXQUVHQTthQUNIQTtZQUNJUSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUN0QkEsQ0FBQ0E7UUFFRFI7O1dBRUdBO2FBQ0hBLFVBQWdCQSxPQUFxQkE7WUFDbENRLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBO1lBRXBCQSx3RUFBd0VBO1lBQ3hFQSxJQUFJQSxDQUFDQSxlQUFlQSxHQUFHQSxLQUFLQSxDQUFDQTtZQUU3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsSUFBSUEsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzVCQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFBQSxJQUFJQTtvQkFDaENBLElBQU1BLEdBQUdBLEdBQUdBLGNBQWNBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO29CQUMzRkEsSUFBSUEsYUFBYUEsR0FBR0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0E7b0JBQ3ZDQSxFQUFFQSxDQUFDQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTt3QkFDaEJBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsS0FBS0EsRUFBRUEsQ0FBQ0EsYUFBYUEsR0FBR0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQ3JFQSxDQUFDQTtvQkFDREEsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7b0JBQy9DQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxFQUFFQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtvQkFDakRBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO29CQUN2QkEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7Z0JBQ2ZBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUVKQSxJQUFJQSxDQUFDQSxhQUFhQSxHQUFHQSxJQUFJQSxDQUFDQTtnQkFDMUJBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO2dCQUN2REEsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsS0FBS0EsQ0FBQ0E7Z0JBRTNCQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxPQUFPQSxDQUFDQTtnQkFFckJBLElBQUlBLENBQUNBLDBCQUEwQkEsRUFBRUEsQ0FBQ0E7WUFDdENBLENBQUNBO1FBQ0xBLENBQUNBOzs7T0FoQ0FSO0lBc0NEQSxzQkFBV0EseUNBQWFBO2FBQXhCQTtZQUNJUyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQTtRQUMvQkEsQ0FBQ0E7UUFFRFQ7O1dBRUdBO2FBQ0hBLFVBQTBCQSxLQUFtQkE7WUFBN0NTLGlCQW1CQ0E7WUFsQkdBLElBQUlBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQy9DQSxJQUFJQSxDQUFDQSxjQUFjQSxHQUFHQSxLQUFLQSxDQUFDQTtZQUU1QkEsc0VBQXNFQTtZQUN0RUEsSUFBSUEsVUFBVUEsR0FBR0EsS0FBS0EsSUFBSUEsS0FBS0EsQ0FBQ0EsTUFBTUEsS0FBS0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7WUFDNURBLElBQUlBLFdBQVdBLEdBQUdBLEtBQUtBLElBQUlBLEtBQUtBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBO1lBRTNEQSxJQUFJQSxDQUFDQSxpQkFBaUJBLEVBQUVBLENBQUNBO1lBRXpCQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDUkEsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7Z0JBQzNDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFDQSxDQUFDQSxJQUFLQSxPQUFBQSxLQUFJQSxDQUFDQSxvQkFBb0JBLENBQUNBLENBQUNBLENBQUNBLEVBQTVCQSxDQUE0QkEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBQUEsQ0FBQ0EsSUFBSUEsT0FBQUEsQ0FBQ0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsS0FBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsRUFBL0NBLENBQStDQSxDQUFDQSxDQUFDQTtZQUNqSEEsQ0FBQ0E7WUFFREEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0Esa0JBQWtCQSxFQUFFQSxJQUFJQSxDQUFDQSxjQUFjQSxFQUFFQSxZQUFZQSxDQUFDQSxDQUFDQTtZQUU5RUEsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDakRBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLEVBQUVBLFdBQVdBLENBQUNBLENBQUNBO1FBQzNEQSxDQUFDQTs7O09BeEJBVDtJQTZCREEsc0JBQVdBLHdDQUFZQTtRQUh2QkE7O1dBRUdBO2FBQ0hBO1lBQ0lVLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ2pEQSxDQUFDQTs7O09BQUFWO0lBRURBOztPQUVHQTtJQUNJQSw2QkFBSUEsR0FBWEEsVUFBWUEsTUFBY0EsRUFBRUEsSUFBY0E7UUFDdENXLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFVBQUNBLENBQUNBLEVBQUVBLENBQUNBO1lBQ2hCQSxJQUFNQSxPQUFPQSxHQUFHQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsREEsTUFBTUEsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsT0FBT0EsR0FBR0EsT0FBT0EsQ0FBQ0E7UUFDekNBLENBQUNBLENBQUNBLENBQUNBO0lBQ1BBLENBQUNBO0lBTURYLHNCQUFjQSwyQ0FBZUE7YUFBN0JBO1lBQ0lZLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0E7UUFDakNBLENBQUNBO1FBRURaOztXQUVHQTthQUNIQSxVQUE4QkEsS0FBY0E7WUFDeENZLElBQUlBLENBQUNBLGdCQUFnQkEsR0FBR0EsS0FBS0EsQ0FBQ0E7WUFDOUJBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFdBQVdBLENBQUNBLFNBQVNBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQy9DQSxDQUFDQTs7O09BUkFaO0lBVURBOztPQUVHQTtJQUNLQSwwQ0FBaUJBLEdBQXpCQTtRQUNJYSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQTtRQUMvQkEsSUFBSUEsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDdENBLElBQUlBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2RBLElBQU1BLE9BQU9BLEdBQUdBLFVBQUNBLElBQWdCQSxFQUFFQSxLQUFhQTtZQUM1Q0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7Z0JBQ3pDQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQTtnQkFDNUNBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLElBQUlBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3JEQSxDQUFDQSxDQUFDQTtRQUNGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQTtZQUNOLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEMsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQWQsQ0FBYyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRTNFLG9CQUFvQjtZQUNwQixFQUFFLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELFNBQVMsR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMvQyxDQUFDO1lBRUQsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5QixDQUFDLENBQUNBLENBQUNBO0lBQ1BBLENBQUNBO0lBRURiOztPQUVHQTtJQUNLQSx3Q0FBZUEsR0FBdkJBO1FBQ0ljLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQ2xEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNaQSxJQUFJQSxDQUFDQSxhQUFhQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM3Q0EsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDSkEsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDNUJBLENBQUNBO0lBQ0xBLENBQUNBO0lBRURkOztPQUVHQTtJQUNLQSw2Q0FBb0JBLEdBQTVCQSxVQUE2QkEsQ0FBYUE7UUFBMUNlLGlCQWVDQTtRQWRHQSxJQUFNQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUMzQkEsSUFBTUEsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsSUFBSUEsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDckVBLE1BQU1BO2FBQ0RBLFFBQVFBLENBQUNBLE9BQU9BLENBQUNBO2FBQ2pCQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxJQUFJQSxDQUFDQTthQUNuQkEsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7YUFDZkEsRUFBRUEsQ0FBQ0EsT0FBT0EsRUFBRUE7WUFDVEEsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7WUFDaEJBLElBQUlBLElBQUlBLEdBQUdBLEtBQUlBLENBQUNBLGFBQWFBLENBQUNBLE1BQU1BLENBQUNBLFVBQUFBLENBQUNBLElBQUlBLE9BQUFBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEVBQVhBLENBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzFEQSxLQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMvREEsS0FBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsS0FBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDckRBLENBQUNBLENBQUNBO2FBQ0RBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ2hCQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUNsQkEsQ0FBQ0E7SUFFRGY7O09BRUdBO0lBQ0tBLHVDQUFjQSxHQUF0QkE7UUFDSWdCLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLEVBQUVBLENBQUNBO0lBQzVCQSxDQUFDQTtJQUVEaEI7O09BRUdBO0lBQ0tBLG1EQUEwQkEsR0FBbENBO1FBQ0lpQixJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxFQUFFQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxLQUFLQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUM1SEEsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDdkVBLENBQUNBO0lBRURqQjs7T0FFR0E7SUFDS0EscUNBQVlBLEdBQXBCQTtRQUFBa0IsaUJBMEJDQTtRQXpCR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDbkRBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEtBQUlBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO2dCQUN0QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDeEJBLFVBQVVBLENBQUNBLGNBQU1BLE9BQUFBLEtBQUlBLENBQUNBLDhCQUE4QkEsRUFBRUEsRUFBckNBLENBQXFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtnQkFDaEVBLENBQUNBO2dCQUNEQSwrR0FBK0dBO2dCQUMvR0EsS0FBSUEsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxDQUFDQTtnQkFDekJBLEtBQUlBLENBQUNBLE9BQU9BLENBQUNBLFdBQVdBLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBLENBQUNBLEtBQUlBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO1lBQ2hFQSxDQUFDQTtRQUNMQSxDQUFDQSxFQUFFQSxjQUFjQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUVwQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsT0FBT0EsRUFBRUEsVUFBQ0EsR0FBR0E7WUFDekJBLGdDQUFnQ0E7WUFDaENBLElBQUlBLEdBQUdBLEdBQUdBLENBQUNBLENBQWVBLEdBQUdBLENBQUNBLE1BQU9BLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1lBQ3hEQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDakJBLElBQUlBLGdCQUFnQkEsR0FBR0EsS0FBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25EQSxJQUFJQSxJQUFJQSxHQUFTQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtnQkFDbENBLEtBQUlBLENBQUNBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUM5QkEsS0FBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsS0FBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2pEQSxLQUFJQSxDQUFDQSxxQkFBcUJBLENBQUNBLEtBQUlBLENBQUNBLGFBQWFBLEVBQUVBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0E7Z0JBQ2pFQSxLQUFJQSxDQUFDQSwwQkFBMEJBLEVBQUVBLENBQUNBO1lBQ3RDQSxDQUFDQTtZQUNEQSxHQUFHQSxDQUFDQSx3QkFBd0JBLEVBQUVBLENBQUNBO1lBQy9CQSxHQUFHQSxDQUFDQSxlQUFlQSxFQUFFQSxDQUFDQTtRQUMxQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDUEEsQ0FBQ0E7SUFFRGxCOzs7T0FHR0E7SUFDS0EsdURBQThCQSxHQUF0Q0E7UUFDSW1CLHdCQUF3QkE7UUFDeEJBLDZGQUE2RkE7UUFDN0ZBLEVBQUVBLENBQUNBLENBQThCQSxJQUFJQSxDQUFDQSxvQkFBb0JBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQy9EQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbkJBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1lBQ3RDQSxDQUFDQTtZQUNEQSx1REFBdURBO1lBQ3ZEQSxJQUFJQSxDQUFDQSxlQUFlQSxHQUFHQSxLQUFLQSxDQUFDQTtZQUM3QkEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNqQ0EsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFFRG5COztPQUVHQTtJQUNPQSwwQ0FBaUJBLEdBQTNCQTtRQUNJb0IsSUFBSUEsYUFBYUEsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDcENBLElBQUlBLFlBQVlBLEdBQUdBLGFBQWFBLENBQUNBLFlBQVlBLENBQUNBO1FBQzlDQSxJQUFJQSxHQUFHQSxHQUFHQSxhQUFhQSxDQUFDQSxTQUFTQSxDQUFDQTtRQUNsQ0EsSUFBSUEsZ0JBQWdCQSxHQUFHQSxZQUFZQSxHQUFHQSxDQUFDQSxHQUFHQSxHQUFHQSxhQUFhQSxDQUFDQSxZQUFZQSxDQUFDQSxHQUFHQSxHQUFHQSxJQUFJQSxZQUFZQSxJQUFJQSxHQUFHQSxDQUFDQTtRQUN0R0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQWdCQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxJQUFJQSxJQUFJQSxDQUFDQSxvQkFBb0JBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1lBQzNFQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQ2xDQSxDQUFDQTtJQUNMQSxDQUFDQTtJQUVEcEI7O09BRUdBO0lBQ09BLDBDQUFpQkEsR0FBM0JBLFVBQTRCQSxXQUFvQkE7UUFBaERxQixpQkF5QkNBO1FBeEJHQSxJQUFJQSxJQUFJQSxHQUE0Q0EsRUFBR0EsQ0FBQ0E7UUFDeERBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBLGNBQWNBLEVBQUVBLElBQUlBLEVBQUVBLFdBQVdBLEVBQUVBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO1FBQzdFQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNkQSxJQUFJQSxDQUFDQSxlQUFlQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM1QkEsSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsV0FBV0EsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBQ0EsS0FBS0E7Z0JBQ3BEQSx3Q0FBd0NBO2dCQUN4Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3JCQSxLQUFJQSxDQUFDQSxlQUFlQSxHQUFHQSxLQUFLQSxDQUFDQTtvQkFDN0JBLEtBQUlBLENBQUNBLFdBQVdBLEdBQUdBLFNBQVNBLENBQUNBO29CQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7d0JBQ2RBLEtBQUlBLENBQUNBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBO29CQUN0QkEsQ0FBQ0E7b0JBQUNBLElBQUlBLENBQUNBLENBQUNBO3dCQUNKQSxLQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxLQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtvQkFDeENBLENBQUNBO29CQUNEQSw0RkFBNEZBO29CQUM1RkEsVUFBVUEsQ0FBQ0EsY0FBTUEsT0FBQUEsS0FBSUEsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxFQUF4QkEsQ0FBd0JBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO29CQUMvQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7Z0JBQ2pCQSxDQUFDQTtZQUNMQSxDQUFDQSxFQUFFQTtnQkFDQ0EsS0FBSUEsQ0FBQ0EsSUFBSUEsR0FBR0EsRUFBRUEsQ0FBQ0E7Z0JBQ2ZBLEtBQUlBLENBQUNBLGVBQWVBLEdBQUdBLEtBQUtBLENBQUNBO1lBQ2pDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNIQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQTtRQUNuQkEsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFFRHJCOzs7T0FHR0E7SUFDT0EsNkNBQW9CQSxHQUE5QkEsVUFBK0JBLFFBQXlCQTtRQUF6QnNCLHdCQUF5QkEsR0FBekJBLGdCQUF5QkE7UUFDcERBLElBQUlBLElBQUlBLEdBQUdBO1lBQ1BBLE1BQU1BLEVBQUVBLEtBQUtBO1NBQ2hCQSxDQUFDQTtRQUNGQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxpQkFBaUJBLEVBQUVBLElBQUlBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO1FBQzFEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUN2QkEsQ0FBQ0E7SUFFRHRCOztPQUVHQTtJQUNPQSw4Q0FBcUJBLEdBQS9CQSxVQUFnQ0EsUUFBc0JBLEVBQUVBLFFBQXNCQTtRQUMxRXVCLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBLGtCQUFrQkEsRUFBRUEsUUFBUUEsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFDbkVBLENBQUNBO0lBeGNEdkI7O09BRUdBO0lBQ1lBLDhCQUFlQSxHQUFHQSxHQUFHQSxDQUFDQTtJQUVyQ0E7O09BRUdBO0lBQ1lBLHVCQUFRQSxHQUFHQSxvNUJBa0J6QkEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7SUFFNUJBOztPQUVHQTtJQUNZQSw4QkFBZUEsR0FBR0EsVUFBQ0EsV0FBV0EsRUFBRUEsS0FBS0EsRUFBRUEsV0FBV0E7UUFDN0RBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLDRlQU11Q0EsV0FBV0EsSUFBSUEsRUFBRUEscUVBQ3ZCQSxLQUFLQSxJQUFJQSxFQUFFQSwyRUFDTEEsV0FBV0EsSUFBSUEsRUFBRUEsc1lBUWhFQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxPQUFPQSxDQUFDQSxLQUFLQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNqQ0EsQ0FBQ0EsQ0FBQ0E7SUF3Wk5BLHFCQUFDQTtBQUFEQSxDQUFDQSxBQTNjRCxJQTJjQztBQTNjWSxzQkFBYyxpQkEyYzFCLENBQUEifQ==