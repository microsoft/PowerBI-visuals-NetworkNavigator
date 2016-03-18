"use strict";
var EventEmitter_1 = require("../../base/EventEmitter");
var JSONDataProvider_1 = require("./providers/JSONDataProvider");
var _ = require("lodash");
var d3 = require("d3");
var $ = require("jquery");
var LineUpLib = require("./lib/lineup");
/**
 * Thin wrapper around the lineup library
 */
var TableSorter = (function () {
    /**
     * Constructor for the lineups
     */
    function TableSorter(element) {
        var _this = this;
        /**
         * The set of options used to query for new data
         */
        this.queryOptions = {
            offset: 0,
            count: TableSorter.DEFAULT_COUNT
        };
        /**
         * The template for the grid
         */
        this.template = "\n        <div class=\"lineup-component\">\n            <div class=\"nav\">\n                <ul>\n                    <li class=\"clear-selection\" title=\"Clear Selection\">\n                        <a>\n                            <span class=\"fa-stack\">\n                                <i class=\"fa fa-check fa-stack-1x\"></i>\n                                <i class=\"fa fa-ban fa-stack-2x\"></i>\n                            </span>\n                        </a>\n                    </li>\n                    <li class=\"add-column\" title=\"Add Column\">\n                        <a>\n                            <span class=\"fa-stack\">\n                                <i class=\"fa fa-columns fa-stack-2x\"></i>\n                                <i class=\"fa fa-plus-circle fa-stack-1x\"></i>\n                            </span>\n                        </a>\n                    </li>\n                    <li class=\"add-stacked-column\" title=\"Add Stacked Column\">\n                        <a>\n                            <span class=\"fa-stack\">\n                                <i class=\"fa fa-bars fa-stack-2x\"></i>\n                                <i class=\"fa fa-plus-circle fa-stack-1x\"></i>\n                            </span>\n                        </a>\n                    </li>\n                </ul>\n                <hr/>       \n            </div>\n            <div style=\"position:relative\">\n                <div class=\"grid\"></div>\n                <div class='load-spinner'><div>\n            </div>\n        </div>\n    ".trim();
        /**
         * A boolean indicating whehter or not we are currently loading more data
         */
        this._loadingData = false;
        this._selectedRows = [];
        this._settings = $.extend(true, {}, TableSorter.DEFAULT_SETTINGS);
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
        /**
         * Resizer function to update lineups rendering
         */
        this.bodyUpdater = _.debounce(function () {
            if (_this.lineupImpl) {
                _this.lineupImpl.updateBody();
            }
        }, 100);
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
    Object.defineProperty(TableSorter.prototype, "loadingData", {
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
    Object.defineProperty(TableSorter.prototype, "dimensions", {
        /**
         * getter for the dimensions
         */
        get: function () {
            return this._dimensions;
        },
        /**
         * setter for the dimensions
         */
        set: function (value) {
            this._dimensions = value;
            var wrapper = this.element.find(".lu-wrapper");
            var header = this.element.find(".lu-header");
            var nav = this.element.find(".nav");
            this.bodyUpdater();
            wrapper.css({
                width: value ? value.width : null,
                height: value ? value.height - header.height() - nav.height() : null });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableSorter.prototype, "count", {
        /**
         * The number of the results to return
         */
        get: function () { return this.queryOptions.count || TableSorter.DEFAULT_COUNT; },
        set: function (value) {
            this.queryOptions.count = value || TableSorter.DEFAULT_COUNT;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TableSorter.prototype, "dataProvider", {
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
    Object.defineProperty(TableSorter.prototype, "events", {
        /**
         * Gets the events object
         */
        get: function () {
            return this._eventEmitter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableSorter.prototype, "settings", {
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
            var newSettings = $.extend(true, {}, TableSorter.DEFAULT_SETTINGS, value);
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
                this.lineupImpl.changeInteractionOption("tooltips", newSettings.presentation.tooltips);
            }
            this.lineUpConfig['columnColors'] = newSettings.presentation.columnColors;
            // Sets the tooltips configuration
            this.lineUpConfig['interaction'].tooltips = newSettings.presentation.tooltips;
            this._settings = newSettings;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableSorter.prototype, "selection", {
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
    Object.defineProperty(TableSorter.prototype, "configuration", {
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
    TableSorter.createConfigurationFromData = function (data) {
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
            return v === 0 || v === null || v === undefined || TableSorter.isNumeric(v);
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
            primaryKey: "id",
            columns: columns
        };
    };
    /**
     * Gets the sort from lineup
     */
    TableSorter.prototype.getSortFromLineUp = function () {
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
                var totalWidth_1 = d3.sum(col.childrenWidths);
                return {
                    stack: {
                        name: col.label,
                        columns: col.children.map(function (a, i) {
                            return {
                                column: a.column.column,
                                weight: col.childrenWidths[i] / totalWidth_1
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
    TableSorter.prototype.runQuery = function (newQuery) {
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
                    var desc = _this.configuration || TableSorter.createConfigurationFromData(_this._data);
                    // Primary Key needs to always be ID
                    desc.primaryKey = "id";
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
                        _this.dimensions = _this.dimensions;
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
    TableSorter.prototype.generateHistogram = function (columnImpl, callback) {
        var column = this.getColumnByName(columnImpl.column.column);
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
    TableSorter.prototype.getColumnByName = function (colName) {
        return this.configuration && this.configuration.columns && this.configuration.columns.filter(function (c) { return c.column === colName; })[0];
    };
    /**
     * Updates the selected state of each row, and returns all the selected rows
     */
    TableSorter.prototype.updateRowSelection = function (sels) {
        if (this._data) {
            this._data.forEach(function (d) { return d.selected = false; });
        }
        return sels && sels.length ? sels.filter(function (d) { return d.selected = true; }) : [];
    };
    /**
     * Saves the current layout
     */
    TableSorter.prototype.saveConfiguration = function () {
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
    TableSorter.prototype.applyConfigurationToLineup = function () {
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
    TableSorter.prototype.checkLoadMoreData = function (scroll) {
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
    TableSorter.prototype.onLineUpColumnsChanged = function () {
        this.saveConfiguration();
    };
    /**
     * Listener for line up being sorted
     */
    TableSorter.prototype.onLineUpSorted = function (column, asc) {
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
    TableSorter.prototype.onLineUpFiltered = function (column) {
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
    TableSorter.prototype.raiseConfigurationChanged = function (configuration) {
        this.events.raiseEvent(TableSorter.EVENTS.CONFIG_CHANGED, configuration);
    };
    /**
     * Raises the filter changed event
     */
    TableSorter.prototype.raiseSortChanged = function (column, asc) {
        this.events.raiseEvent(TableSorter.EVENTS.SORT_CHANGED, column, asc);
    };
    /**
     * Raises the filter changed event
     */
    TableSorter.prototype.raiseFilterChanged = function (filter) {
        this.events.raiseEvent(TableSorter.EVENTS.FILTER_CHANGED, filter);
    };
    /**
     * Raises the selection changed event
     */
    TableSorter.prototype.raiseSelectionChanged = function (rows) {
        this.events.raiseEvent(TableSorter.EVENTS.SELECTION_CHANGED, rows);
    };
    /**
     * Raises the load more data event
     */
    TableSorter.prototype.raiseLoadMoreData = function () {
        this.events.raiseEvent(TableSorter.EVENTS.LOAD_MORE_DATA);
    };
    /**
     * Raises the load more data event
     */
    TableSorter.prototype.raiseClearSelection = function () {
        this.events.raiseEvent(TableSorter.EVENTS.CLEAR_SELECTION);
    };
    /**
     * A quick reference for the providers
     */
    TableSorter.PROVIDERS = {
        JSON: JSONDataProvider_1.JSONDataProvider
    };
    /**
     * The default count amount
     */
    TableSorter.DEFAULT_COUNT = 100;
    /**
     * The list of events that we expose
     */
    TableSorter.EVENTS = {
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
    TableSorter.DEFAULT_SETTINGS = {
        selection: {
            singleSelect: false,
            multiSelect: true
        },
        presentation: {
            columnColors: d3.scale.category20(),
            stacked: true,
            values: false,
            histograms: true,
            animation: true,
            tooltips: false
        }
    };
    /**
     * Returns true if the given object is numeric
     */
    TableSorter.isNumeric = function (obj) { return (obj - parseFloat(obj) + 1) >= 0; };
    return TableSorter;
}());
exports.TableSorter = TableSorter;
