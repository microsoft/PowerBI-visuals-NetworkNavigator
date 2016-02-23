var EventEmitter_1 = require("../../base/EventEmitter");
var JSONDataProvider_1 = require("./providers/JSONDataProvider");
var _ = require("lodash");
var $ = require("jquery");
var LineUpLib = require("./lib/lineup");
/**
 * Thin wrapper around the lineup library
 */
var LineUp = (function () {
    /**
     * Constructor for the lineups
     */
    function LineUp(element) {
        var _this = this;
        /**
         * The set of options used to query for new data
         */
        this.queryOptions = {
            offset: 0,
            count: LineUp.DEFAULT_COUNT
        };
        /**
         * The template for the grid
         */
        this.template = "\n        <div class=\"lineup-component\">\n            <div class=\"nav\">\n                <ul>\n                    <li class=\"clear-selection\" title=\"Clear Selection\">\n                        <a>\n                            <span class=\"fa-stack\">\n                                <i class=\"fa fa-check fa-stack-1x\"></i>\n                                <i class=\"fa fa-ban fa-stack-2x\"></i>\n                            </span>\n                        </a>\n                    </li>\n                    <li class=\"add-column\" title=\"Add Column\">\n                        <a>\n                            <span class=\"fa-stack\">\n                                <i class=\"fa fa-columns fa-stack-2x\"></i>\n                                <i class=\"fa fa-plus-circle fa-stack-1x\"></i>\n                            </span>\n                        </a>\n                    </li>\n                    <li class=\"add-stacked-column\" title=\"Add Stacked Column\">\n                        <a>\n                            <span class=\"fa-stack\">\n                                <i class=\"fa fa-bars fa-stack-2x\"></i>\n                                <i class=\"fa fa-plus-circle fa-stack-1x\"></i>\n                            </span>\n                        </a>\n                    </li>\n                </ul>\n            </div>\n            <hr/>\n            <div style=\"position:relative\">\n                <div class=\"grid\"></div>\n                <div class='load-spinner'><div>\n            </div>\n        </div>\n    ".trim();
        /**
         * A boolean indicating whehter or not we are currently loading more data
         */
        this._loadingData = false;
        this._selectedRows = [];
        this._settings = $.extend(true, {}, LineUp.DEFAULT_SETTINGS);
        /**
         * The configuration for the lineup viewer
         */
        this.lineUpConfig = {
            svgLayout: {
                mode: 'separate'
            },
            interaction: {
                multiselect: function () { return _this.settings.selection.multiSelect; }
            },
            sorting: {
                external: true
            },
            filtering: {
                external: true
            },
            histograms: {
                generator: function (columnImpl, callback) { return _this.generateHistogram(columnImpl, callback); }
            }
        };
        this.element = $(this.template);
        this.element.find('.clear-selection').on('click', function () {
            _this.lineupImpl.clearSelection();
            _this.raiseClearSelection();
        });
        this.element.find('.add-column').on('click', function () {
            _this.lineupImpl.addNewSingleColumnDialog();
        });
        this.element.find('.add-stacked-column').on('click', function () {
            _this.lineupImpl.addNewStackedColumnDialog();
        });
        this._eventEmitter = new EventEmitter_1.default();
        element.append(this.element);
        this.loadingData = true;
    }
    Object.defineProperty(LineUp.prototype, "loadingData", {
        get: function () {
            return this._loadingData;
        },
        /**
         * Setter for if we are loading data
         */
        set: function (value) {
            this.element.toggleClass("loading", !!value);
            this._loadingData = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineUp.prototype, "count", {
        /**
         * The number of the results to return
         */
        get: function () { return this.queryOptions.count || LineUp.DEFAULT_COUNT; },
        set: function (value) {
            this.queryOptions.count = value || LineUp.DEFAULT_COUNT;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(LineUp.prototype, "dataProvider", {
        get: function () {
            return this._dataProvider;
        },
        /**
         * Sets the data provider to use
         */
        set: function (dataProvider) {
            // Reset query vars
            this.queryOptions.offset = 0;
            this.loadingData = false;
            this.lastQuery = undefined;
            this._dataProvider = dataProvider;
            if (this._dataProvider) {
                this.runQuery(true);
            }
            else if (this.lineupImpl) {
                this.lineupImpl.destroy();
                delete this.lineupImpl;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineUp.prototype, "events", {
        /**
         * Gets the events object
         */
        get: function () {
            return this._eventEmitter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineUp.prototype, "settings", {
        /**
         * Gets the settings
         */
        get: function () {
            return this._settings;
        },
        /**
         * Sets the settings
         */
        set: function (value) {
            var newSettings = $.extend(true, {}, LineUp.DEFAULT_SETTINGS, value);
            var singleSelect = newSettings.selection.singleSelect;
            var multiSelect = newSettings.selection.multiSelect;
            /** Apply the settings to lineup */
            if (this.lineupImpl) {
                var presProps = newSettings.presentation;
                for (var key in presProps) {
                    if (presProps.hasOwnProperty(key)) {
                        this.lineupImpl.changeRenderingOption(key, presProps[key]);
                    }
                }
            }
            this._settings = newSettings;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineUp.prototype, "selection", {
        /**
         * Gets the current selection
         */
        get: function () {
            return this._selectedRows;
        },
        /**
         * Sets the selection of lineup
         */
        set: function (value) {
            this._selectedRows = this.updateRowSelection(value);
            if (this.lineupImpl) {
                this.lineupImpl.select(value);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LineUp.prototype, "configuration", {
        /**
         * Gets this configuration
         */
        get: function () {
            return this._configuration;
        },
        /**
         * Sets the column configuration that is used
         */
        set: function (value) {
            this._configuration = value;
            this.applyConfigurationToLineup();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Derives the desciption for the given column
     */
    LineUp.createConfigurationFromData = function (data) {
        var EXCLUDED_DATA_COLS = {
            selected: true,
            equals: true,
        };
        function getDataColumnNames() {
            if (data && data.length) {
                return Object.keys(data[0]).filter(function (k) { return !EXCLUDED_DATA_COLS[k]; });
            }
            return [];
        }
        function updateMinMax(minMax, value) {
            if (+value > minMax.max) {
                minMax.max = value;
            }
            else if (+value < minMax.min) {
                minMax.min = +value;
            }
        }
        function isNumeric(v) {
            // Assume that if null or undefined, it is numeric
            return v === 0 || v === null || v === undefined || LineUp.isNumeric(v);
        }
        function analyzeColumn(columnName) {
            var minMax = { min: Number.MAX_VALUE, max: 0 };
            var allNumeric = data.every(function (row) { return isNumeric(row[columnName]); });
            if (allNumeric) {
                data.forEach(function (row) { return updateMinMax(minMax, row[columnName]); });
            }
            return { allNumeric: allNumeric, minMax: minMax };
        }
        function createLineUpColumn(colName) {
            var result = { column: colName, type: 'string' };
            var _a = analyzeColumn(colName), allNumeric = _a.allNumeric, minMax = _a.minMax;
            if (allNumeric) {
                result.type = 'number';
                result.domain = [minMax.min, minMax.max];
            }
            // If is a string, try to see if it is a category
            if (result.type === 'string') {
                var sset = d3.set(data.map(function (row) { return row[colName]; }));
                if (sset.size() <= Math.max(20, data.length * 0.2)) {
                    result.type = 'categorical';
                    result.categories = sset.values().sort();
                }
            }
            return result;
        }
        var dataColNames = getDataColumnNames();
        var columns = getDataColumnNames().map(createLineUpColumn);
        return {
            primaryKey: dataColNames[0],
            columns: columns
        };
    };
    /**
     * Gets the sort from lineup
     */
    LineUp.prototype.getSortFromLineUp = function () {
        if (this.lineupImpl && this.lineupImpl.storage) {
            var primary = this.lineupImpl.storage.config.columnBundles.primary;
            var col = primary.sortedColumn;
            if (col) {
                if (col.column) {
                    return {
                        column: col.column.column,
                        asc: primary.sortingOrderAsc
                    };
                }
                var totalWidth = d3.sum(col.childrenWidths);
                return {
                    stack: {
                        name: col.label,
                        columns: col.children.map(function (a, i) {
                            return {
                                column: a.column.column,
                                weight: col.childrenWidths[i] / totalWidth
                            };
                        })
                    },
                    asc: primary.sortingOrderAsc
                };
            }
        }
    };
    /**
     * Runs the current query against the data provider
     */
    LineUp.prototype.runQuery = function (newQuery) {
        var _this = this;
        if (newQuery) {
            this.queryOptions.offset = 0;
        }
        if (!this.dataProvider) {
            return;
        }
        // No need to requery, if we have already performed this query
        if (_.isEqual(this.queryOptions, this.lastQuery)) {
            return;
        }
        this.lastQuery = _.assign({}, this.queryOptions);
        // Let everyone know we are loading more data
        this.raiseLoadMoreData();
        // We should only attempt to load more data, if we don't already have data loaded, or there is more to be loaded
        this.dataProvider.canQuery(this.queryOptions).then(function (value) {
            if (value) {
                _this.loadingData = true;
                return _this.dataProvider.query(_this.queryOptions).then(function (r) {
                    _this._data = _this._data || [];
                    _this._data = newQuery ? r.results : _this._data.concat(r.results);
                    // We've moved the offset
                    _this.queryOptions.offset += r.count;
                    //derive a description file
                    var desc = _this.configuration || LineUp.createConfigurationFromData(_this._data);
                    var spec = {};
                    // spec.name = name;
                    spec.dataspec = desc;
                    delete spec.dataspec.file;
                    delete spec.dataspec.separator;
                    spec.dataspec.data = _this._data;
                    spec.storage = LineUpLib.createLocalStorage(_this._data, desc.columns, desc.layout, desc.primaryKey);
                    if (_this.lineupImpl) {
                        _this.lineupImpl.changeDataStorage(spec);
                    }
                    else {
                        var finalOptions = $.extend(true, _this.lineUpConfig, { renderingOptions: $.extend(true, {}, _this.settings.presentation) });
                        _this.lineupImpl = LineUpLib.create(spec, d3.select(_this.element.find('.grid')[0]), finalOptions);
                        _this.lineupImpl.listeners.on('change-sortcriteria.lineup', function (ele, column, asc) {
                            // This only works for single columns and not grouped columns
                            _this.onLineUpSorted(column && column.column && column.column.id, asc);
                        });
                        _this.lineupImpl.listeners.on("multiselected.lineup", function (rows) {
                            if (_this.settings.selection.multiSelect) {
                                _this._selectedRows = _this.updateRowSelection(rows);
                                _this.raiseSelectionChanged(rows);
                            }
                        });
                        _this.lineupImpl.listeners.on("selected.lineup", function (row) {
                            if (_this.settings.selection.singleSelect && !_this.settings.selection.multiSelect) {
                                _this._selectedRows = _this.updateRowSelection(row ? [row] : []);
                                _this.raiseSelectionChanged(_this.selection);
                            }
                        });
                        _this.lineupImpl.listeners.on('columns-changed.lineup', function () { return _this.onLineUpColumnsChanged(); });
                        _this.lineupImpl.listeners.on('change-filter.lineup', function (x, column) { return _this.onLineUpFiltered(column); });
                        var scrolled = _this.lineupImpl.scrolled;
                        var me = _this;
                        // The use of `function` here is intentional, we need to pass along the correct scope
                        _this.lineupImpl.scrolled = function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i - 0] = arguments[_i];
                            }
                            me.checkLoadMoreData(true);
                            return scrolled.apply(this, args);
                        };
                        _this.settings = _this.settings;
                    }
                    _this.selection = _this._data.filter(function (n) { return n.selected; });
                    _this.applyConfigurationToLineup();
                    // Store the configuration after it was possibly changed by load data
                    _this.saveConfiguration();
                    _this.loadingData = false;
                    setTimeout(function () { return _this.checkLoadMoreData(false); }, 10);
                }, function () { return _this.loadingData = false; });
            }
        });
    };
    /**
     * Generates the histogram for lineup
     */
    LineUp.prototype.generateHistogram = function (columnImpl, callback) {
        var column = this.getColumnByName(columnImpl.column.id);
        this.dataProvider.generateHistogram(column, this.queryOptions).then(function (h) {
            var perc = 1 / h.length;
            var values = h.map(function (v, i) { return ({
                x: perc * i,
                y: v,
                dx: perc
            }); });
            callback(values);
        });
    };
    /**
     * Retrieves our columns by name
     */
    LineUp.prototype.getColumnByName = function (colName) {
        return this.configuration && this.configuration.columns && this.configuration.columns.filter(function (c) { return c.column === colName; })[0];
    };
    /**
     * Updates the selected state of each row, and returns all the selected rows
     */
    LineUp.prototype.updateRowSelection = function (sels) {
        if (this._data) {
            this._data.forEach(function (d) { return d.selected = false; });
        }
        return sels && sels.length ? sels.filter(function (d) { return d.selected = true; }) : [];
    };
    /**
     * Saves the current layout
     */
    LineUp.prototype.saveConfiguration = function () {
        if (!this.savingConfiguration) {
            this.savingConfiguration = true;
            //full spec
            var s = $.extend({}, {}, this.lineupImpl.spec.dataspec);
            //create current layout
            var descs = this.lineupImpl.storage.getColumnLayout()
                .map((function (d) { return d.description(); }));
            s.layout = _.groupBy(descs, function (d) { return d.columnBundle || "primary"; });
            s.sort = this.getSortFromLineUp();
            this.configuration = s;
            delete s['data'];
            this.raiseConfigurationChanged(this.configuration);
            this.savingConfiguration = false;
        }
    };
    /**
     * Applies our external config to lineup
     */
    LineUp.prototype.applyConfigurationToLineup = function () {
        if (this.lineupImpl) {
            var currentSort = this.getSortFromLineUp();
            if (this.configuration && this.configuration.sort && (!currentSort || !_.isEqual(currentSort, this.configuration.sort))) {
                this.sortingFromConfig = true;
                var sort = this.configuration.sort;
                this.lineupImpl.sortBy(sort.stack ? sort.stack.name : sort.column, sort.asc);
                this.sortingFromConfig = false;
            }
        }
    };
    /**
     * Checks to see if more data should be loaded based on the viewport
     */
    LineUp.prototype.checkLoadMoreData = function (scroll) {
        // truthy this.dataView.metadata.segment means there is more data to be loaded
        var scrollElement = $(this.lineupImpl.$container.node()).find('div.lu-wrapper')[0];
        var scrollHeight = scrollElement.scrollHeight;
        var top = scrollElement.scrollTop;
        if (!scroll || this.lastScrollPos !== top) {
            this.lastScrollPos = top;
            var shouldScrollLoad = scrollHeight - (top + scrollElement.clientHeight) < 200 && scrollHeight >= 200;
            if (shouldScrollLoad && !this.loadingData) {
                this.runQuery(false);
            }
        }
    };
    /**
     * Listener for when the lineup columns are changed.
     */
    LineUp.prototype.onLineUpColumnsChanged = function () {
        this.saveConfiguration();
    };
    /**
     * Listener for line up being sorted
     */
    LineUp.prototype.onLineUpSorted = function (column, asc) {
        if (!this.sortingFromConfig) {
            this.saveConfiguration();
            this.raiseSortChanged(column, asc);
            var newSort = this.getSortFromLineUp();
            // Set the new sort value
            this.queryOptions.sort = newSort ? [newSort] : undefined;
            if (this.dataProvider && this.dataProvider.sort) {
                this.dataProvider.sort(newSort);
            }
            // We are starting over since we sorted
            this.runQuery(true);
        }
    };
    /**
     * Listener for lineup being filtered
     */
    LineUp.prototype.onLineUpFiltered = function (column) {
        var colName = column.column && column.column.column;
        var ourColumn = this.configuration.columns.filter(function (n) { return n.column === colName; })[0];
        var filter;
        if (ourColumn.type === "number") {
            filter = {
                column: colName,
                value: {
                    domain: column.scale.domain(),
                    range: column.scale.range()
                }
            };
        }
        else {
            filter = {
                column: colName,
                value: column.filter
            };
        }
        this.saveConfiguration();
        this.raiseFilterChanged(filter);
        // Set the new filter value
        console.error("This should support multiple filters");
        this.queryOptions.query = filter ? [filter] : undefined;
        if (this.dataProvider && this.dataProvider.filter) {
            this.dataProvider.filter(filter);
        }
        // We are starting over since we filtered
        this.runQuery(true);
    };
    /**
     * Raises the configuration changed event
     */
    LineUp.prototype.raiseConfigurationChanged = function (configuration) {
        this.events.raiseEvent(LineUp.EVENTS.CONFIG_CHANGED, configuration);
    };
    /**
     * Raises the filter changed event
     */
    LineUp.prototype.raiseSortChanged = function (column, asc) {
        this.events.raiseEvent(LineUp.EVENTS.SORT_CHANGED, column, asc);
    };
    /**
     * Raises the filter changed event
     */
    LineUp.prototype.raiseFilterChanged = function (filter) {
        this.events.raiseEvent(LineUp.EVENTS.FILTER_CHANGED, filter);
    };
    /**
     * Raises the selection changed event
     */
    LineUp.prototype.raiseSelectionChanged = function (rows) {
        this.events.raiseEvent(LineUp.EVENTS.SELECTION_CHANGED, rows);
    };
    /**
     * Raises the load more data event
     */
    LineUp.prototype.raiseLoadMoreData = function () {
        this.events.raiseEvent(LineUp.EVENTS.LOAD_MORE_DATA);
    };
    /**
     * Raises the load more data event
     */
    LineUp.prototype.raiseClearSelection = function () {
        this.events.raiseEvent(LineUp.EVENTS.CLEAR_SELECTION);
    };
    /**
     * A quick reference for the providers
     */
    LineUp.PROVIDERS = {
        JSON: JSONDataProvider_1.JSONDataProvider
    };
    /**
     * The default count amount
     */
    LineUp.DEFAULT_COUNT = 100;
    /**
     * The list of events that we expose
     */
    LineUp.EVENTS = {
        SORT_CHANGED: "sortChanged",
        FILTER_CHANGED: "filterChanged",
        CONFIG_CHANGED: "configurationChanged",
        SELECTION_CHANGED: "selectionChanged",
        LOAD_MORE_DATA: "loadMoreData",
        CLEAR_SELECTION: "clearSelection"
    };
    /**
     * Represents the settings
     */
    LineUp.DEFAULT_SETTINGS = {
        selection: {
            singleSelect: false,
            multiSelect: true
        },
        presentation: {
            stacked: true,
            values: false,
            histograms: true,
            animation: true
        }
    };
    /**
     * Returns true if the given object is numeric
     */
    LineUp.isNumeric = function (obj) { return (obj - parseFloat(obj) + 1) >= 0; };
    return LineUp;
})();
exports.LineUp = LineUp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGluZVVwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTGluZVVwLnRzIl0sIm5hbWVzIjpbIkxpbmVVcCIsIkxpbmVVcC5jb25zdHJ1Y3RvciIsIkxpbmVVcC5sb2FkaW5nRGF0YSIsIkxpbmVVcC5jb3VudCIsIkxpbmVVcC5kYXRhUHJvdmlkZXIiLCJMaW5lVXAuZXZlbnRzIiwiTGluZVVwLnNldHRpbmdzIiwiTGluZVVwLnNlbGVjdGlvbiIsIkxpbmVVcC5jb25maWd1cmF0aW9uIiwiTGluZVVwLmNyZWF0ZUNvbmZpZ3VyYXRpb25Gcm9tRGF0YSIsIkxpbmVVcC5jcmVhdGVDb25maWd1cmF0aW9uRnJvbURhdGEuZ2V0RGF0YUNvbHVtbk5hbWVzIiwiTGluZVVwLmNyZWF0ZUNvbmZpZ3VyYXRpb25Gcm9tRGF0YS51cGRhdGVNaW5NYXgiLCJMaW5lVXAuY3JlYXRlQ29uZmlndXJhdGlvbkZyb21EYXRhLmlzTnVtZXJpYyIsIkxpbmVVcC5jcmVhdGVDb25maWd1cmF0aW9uRnJvbURhdGEuYW5hbHl6ZUNvbHVtbiIsIkxpbmVVcC5jcmVhdGVDb25maWd1cmF0aW9uRnJvbURhdGEuY3JlYXRlTGluZVVwQ29sdW1uIiwiTGluZVVwLmdldFNvcnRGcm9tTGluZVVwIiwiTGluZVVwLnJ1blF1ZXJ5IiwiTGluZVVwLmdlbmVyYXRlSGlzdG9ncmFtIiwiTGluZVVwLmdldENvbHVtbkJ5TmFtZSIsIkxpbmVVcC51cGRhdGVSb3dTZWxlY3Rpb24iLCJMaW5lVXAuc2F2ZUNvbmZpZ3VyYXRpb24iLCJMaW5lVXAuYXBwbHlDb25maWd1cmF0aW9uVG9MaW5ldXAiLCJMaW5lVXAuY2hlY2tMb2FkTW9yZURhdGEiLCJMaW5lVXAub25MaW5lVXBDb2x1bW5zQ2hhbmdlZCIsIkxpbmVVcC5vbkxpbmVVcFNvcnRlZCIsIkxpbmVVcC5vbkxpbmVVcEZpbHRlcmVkIiwiTGluZVVwLnJhaXNlQ29uZmlndXJhdGlvbkNoYW5nZWQiLCJMaW5lVXAucmFpc2VTb3J0Q2hhbmdlZCIsIkxpbmVVcC5yYWlzZUZpbHRlckNoYW5nZWQiLCJMaW5lVXAucmFpc2VTZWxlY3Rpb25DaGFuZ2VkIiwiTGluZVVwLnJhaXNlTG9hZE1vcmVEYXRhIiwiTGluZVVwLnJhaXNlQ2xlYXJTZWxlY3Rpb24iXSwibWFwcGluZ3MiOiJBQUFBLDZCQUF3Qyx5QkFBeUIsQ0FBQyxDQUFBO0FBRWxFLGlDQUFpQyw4QkFBOEIsQ0FBQyxDQUFBO0FBQ2hFLElBQVksQ0FBQyxXQUFPLFFBQVEsQ0FBQyxDQUFBO0FBRTdCLElBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM1QixJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFFMUM7O0dBRUc7QUFDSDtJQXNMSUE7O09BRUdBO0lBQ0hBLGdCQUFZQSxPQUFlQTtRQXpML0JDLGlCQXNyQkNBO1FBdnBCR0E7O1dBRUdBO1FBQ0tBLGlCQUFZQSxHQUFtQkE7WUFDbkNBLE1BQU1BLEVBQUVBLENBQUNBO1lBQ1RBLEtBQUtBLEVBQUVBLE1BQU1BLENBQUNBLGFBQWFBO1NBQzlCQSxDQUFDQTtRQStERkE7O1dBRUdBO1FBQ0tBLGFBQVFBLEdBQVdBLGdpREFvQzFCQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtRQUVUQTs7V0FFR0E7UUFDS0EsaUJBQVlBLEdBQUdBLEtBQUtBLENBQUNBO1FBYXJCQSxrQkFBYUEsR0FBaUJBLEVBQUVBLENBQUNBO1FBRWpDQSxjQUFTQSxHQUFvQkEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsRUFBRUEsRUFBRUEsRUFBRUEsTUFBTUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQTtRQUVqRkE7O1dBRUdBO1FBQ0tBLGlCQUFZQSxHQUEwQkE7WUFDMUNBLFNBQVNBLEVBQUVBO2dCQUNQQSxJQUFJQSxFQUFFQSxVQUFVQTthQUNuQkE7WUFDREEsV0FBV0EsRUFBRUE7Z0JBQ1RBLFdBQVdBLEVBQUVBLGNBQU1BLE9BQUFBLEtBQUlBLENBQUNBLFFBQVFBLENBQUNBLFNBQVNBLENB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a0JBQUVBLE1BQU1BLFlBQTJCQSxDQUFDQTtZQUVwREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2JBLE1BQU1BLENBQUNBLElBQUlBLEdBQUdBLFFBQVFBLENBQUNBO2dCQUN2QkEsTUFBTUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsRUFBRUEsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDN0NBLENBQUNBO1lBRURBLGlEQUFpREE7WUFDakRBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLEtBQUtBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO2dCQUMzQkEsSUFBSUEsSUFBSUEsR0FBR0EsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBQ0EsR0FBR0EsSUFBS0EsT0FBQUEsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsRUFBWkEsQ0FBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25EQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDakRBLE1BQU1BLENBQUNBLElBQUlBLEdBQUdBLGFBQWFBLENBQUNBO29CQUM1QkEsTUFBTUEsQ0FBQ0EsVUFBVUEsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7Z0JBQzdDQSxDQUFDQTtZQUNMQSxDQUFDQTtZQUNEQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUNsQkEsQ0FBQ0E7UUFFREwsSUFBTUEsWUFBWUEsR0FBR0Esa0JBQWtCQSxFQUFFQSxDQUFDQTtRQUMxQ0EsSUFBTUEsT0FBT0EsR0FBb0JBLGtCQUFrQkEsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FB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