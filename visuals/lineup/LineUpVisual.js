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
/// <reference path="../../base/references.d.ts"/>
var VisualBase_1 = require("../../base/VisualBase");
var Utils_1 = require("../../base/Utils");
var LineUp_1 = require("./LineUp");
var JSONDataProvider_1 = require("./providers/JSONDataProvider");
var SelectionId = powerbi.visuals.SelectionId;
var SelectionManager = powerbi.visuals.utility.SelectionManager;
var VisualDataRoleKind = powerbi.VisualDataRoleKind;
var LineUpVisual = (function (_super) {
    __extends(LineUpVisual, _super);
    /**
     * The constructor for the visual
     */
    function LineUpVisual(noCss) {
        if (noCss === void 0) { noCss = false; }
        _super.call(this);
        /**
         * The font awesome resource
         */
        this.fontAwesome = {
            url: '//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css',
            integrity: 'sha256-3dkvEK0WLHRJ7/Csr0BZjAWxERc5WH7bdeUya2aXxdU= sha512-+L4yy6FRcDGbXJ9mPG8MT' +
                '/3UCDzwR9gPeyFNMCtInsol++5m3bk2bXWKdZjvybmohrAsn3Ua5x8gfLnbE1YkOg==',
            crossorigin: "anonymous"
        };
        this.template = "\n        <div>\n            <div class=\"lineup\"></div>\n        </div>\n    ".trim().replace(/\n/g, '');
        /**
         * If css should be loaded or not
         */
        this.noCss = false;
        this.noCss = noCss;
    }
    /** This is called once when the visual is initialially created */
    LineUpVisual.prototype.init = function (options) {
        var _this = this;
        _super.prototype.init.call(this, options, this.template, true);
        this.host = options.host;
        // Temporary, because the popups will load outside of the iframe for some reason
        this.buildExternalCssLink(this.fontAwesome).then(function (ele) {
            _this.container.append($(ele));
        });
        this.selectionManager = new SelectionManager({
            hostServices: options.host
        });
        this.lineup = new LineUp_1.LineUp(this.element.find(".lineup"));
        this.lineup.events.on("selectionChanged", function (rows) { return _this.onSelectionChanged(rows); });
        this.lineup.events.on(LineUp_1.LineUp.EVENTS.FILTER_CHANGED, function (filter) { return _this.onFilterChanged(filter); });
        this.lineup.events.on(LineUp_1.LineUp.EVENTS.CLEAR_SELECTION, function () { return _this.onSelectionChanged(); });
        this.lineup.events.on("configurationChanged", function (config) {
            if (!_this.loadingData) {
                var objects = {
                    merge: [
                        {
                            objectName: "layout",
                            properties: {
                                "layout": JSON.stringify(config)
                            },
                            selector: undefined,
                        }
                    ]
                };
                _this.host.persistProperties(objects);
            }
        });
        this.dimensions = { width: options.viewport.width, height: options.viewport.height };
    };
    /** Update is called for data updates, resizes & formatting changes */
    LineUpVisual.prototype.update = function (options) {
        this.loadingData = true;
        _super.prototype.update.call(this, options);
        // Assume that data updates won't happen when resizing
        var newDims = { width: options.viewport.width, height: options.viewport.height };
        if (!_.isEqual(newDims, this.dimensions)) {
            this.dimensions = newDims;
        }
        else {
            // If we explicitly are loading more data OR If we had no data before, then data has been loaded
            this.waitingForMoreData = false;
            this.waitingForSort = false;
            this.dataView = options.dataViews[0];
            this.dataViewTable = this.dataView && this.dataView.table;
            this.checkSettingsChanged();
            this.checkDataChanged();
        }
        this.loadingData = false;
    };
    /**
     * Enumerates the instances for the objects that appear in the power bi panel
     */
    LineUpVisual.prototype.enumerateObjectInstances = function (options) {
        if (options.objectName === 'layout') {
            return [{
                    selector: null,
                    objectName: 'layout',
                    properties: {
                        layout: JSON.stringify(this.lineup.configuration)
                    }
                }];
        }
        return [{
                selector: null,
                objectName: options.objectName,
                properties: $.extend(true, {}, this.lineup.settings[options.objectName])
            }];
    };
    /**
     * Gets the css used for this element
     */
    LineUpVisual.prototype.getCss = function () {
        return this.noCss ? [] : _super.prototype.getCss.call(this).concat([require("!css!sass!./css/LineUp.scss"), require("!css!sass!./css/LineUpVisual.scss")]);
    };
    /**
    * Gets the external css paths used for this visualization
    */
    LineUpVisual.prototype.getExternalCssResources = function () {
        return _super.prototype.getExternalCssResources.call(this).concat(this.fontAwesome);
    };
    /**
     * Gets a lineup config from the data view
     */
    LineUpVisual.prototype.getConfigFromDataView = function () {
        var newColArr = this.dataViewTable.columns.slice(0).map(function (c) {
            return {
                label: c.displayName,
                column: c.displayName,
                type: c.type.numeric ? "number" : "string",
            };
        });
        var config = null;
        if (this.dataView.metadata && this.dataView.metadata.objects && this.dataView.metadata.objects['layout']) {
            var configStr = this.dataView.metadata.objects['layout']['layout'];
            if (configStr) {
                config = JSON.parse(configStr);
            }
        }
        if (!config) {
            config = {
                primaryKey: newColArr[0].label,
                columns: newColArr
            };
        }
        else {
            var newColNames = newColArr.map(function (c) { return c.column; });
            // Filter out any columns that don't exist anymore
            config.columns = config.columns.filter(function (c) {
                return newColNames.indexOf(c.column) >= 0;
            });
            // Sort contains a missing column
            if (config.sort && newColNames.indexOf(config.sort.column) < 0 && !config.sort.stack) {
                config.sort = undefined;
            }
            if (config.layout && config.layout['primary']) {
                var removedColumnFilter = function (c) {
                    if (newColNames.indexOf(c.column) >= 0) {
                        return true;
                    }
                    if (c.children) {
                        c.children = c.children.filter(removedColumnFilter);
                        return c.children.length > 0;
                    }
                    return false;
                };
                config.layout['primary'] = config.layout['primary'].filter(removedColumnFilter);
            }
            Utils_1.default.listDiff(config.columns.slice(0), newColArr, {
                /**
                 * Returns true if item one equals item two
                 */
                equals: function (one, two) { return one.label === two.label; },
                /**
                 * Gets called when the given item was removed
                 */
                onRemove: function (item) {
                    for (var i = 0; i < config.columns.length; i++) {
                        if (config.columns[i].label === item.label) {
                            config.columns.splice(i, 1);
                            break;
                        }
                    }
                },
                /**
                 * Gets called when the given item was added
                 */
                onAdd: function (item) {
                    config.columns.push(item);
                    config.layout['primary'].push({
                        width: 100,
                        column: item.column,
                        type: item.type
                    });
                }
            });
        }
        return config;
    };
    /**
     * Converts the data from power bi to a data we can use
     */
    LineUpVisual.converter = function (view, config, selectedIds) {
        var data = [];
        if (view && view.table) {
            var table = view.table;
            table.rows.forEach(function (row, rowIndex) {
                var identity;
                var newId;
                if (view.categorical && view.categorical.categories.length) {
                    identity = view.categorical.categories[0].identity[rowIndex];
                    newId = SelectionId.createWithId(identity);
                }
                else {
                    newId = SelectionId.createNull();
                }
                // The below is busted > 100
                //var identity = SelectionId.createWithId(this.dataViewTable.identity[rowIndex]);
                var result = {
                    identity: newId,
                    equals: function (b) { return b.identity.equals(newId); },
                    filterExpr: identity && identity.expr,
                    selected: !!_.find(selectedIds, function (id) { return id.equals(newId); })
                };
                row.forEach(function (colInRow, i) {
                    result[table.columns[i].displayName] = colInRow;
                });
                data.push(result);
            });
        }
        return data;
    };
    /**
     * Event listener for when the visual data's changes
     */
    LineUpVisual.prototype.checkDataChanged = function () {
        var _this = this;
        if (this.dataViewTable) {
            var config = this.getConfigFromDataView();
            var newData = LineUpVisual.converter(this.dataView, config, this.selectionManager.getSelectionIds());
            var selectedRows = newData.filter(function (n) { return n.selected; });
            this.lineup.configuration = config;
            if (Utils_1.default.hasDataChanged(newData, this._data, function (a, b) { return a.identity.equals(b.identity); })) {
                this._data = newData;
                this.lineup.count = this._data.length;
                this.lineup.dataProvider = new MyDataProvider(newData, function () { return !!_this.dataView.metadata.segment; }, function () {
                    _this.waitingForMoreData = true;
                    _this.host.loadMoreData();
                }, function (sort) { return _this.onSorted(sort); }, function (filter) { return _this.onFilterChanged(filter); });
            }
            this.lineup.selection = selectedRows;
        }
    };
    /**
     * Listener for when the visual settings changed
     */
    LineUpVisual.prototype.checkSettingsChanged = function () {
        if (this.dataView) {
            // Store this to compare
            var oldSettings = $.extend(true, {}, this.lineup.settings);
            // Make sure we have the default values
            var updatedSettings = $.extend(true, {}, this.lineup.settings, LineUpVisual.VISUAL_DEFAULT_SETTINGS);
            // Copy over new values
            var newObjs = $.extend(true, {}, this.dataView.metadata.objects);
            if (newObjs) {
                for (var section in newObjs) {
                    var values = newObjs[section];
                    for (var prop in values) {
                        if (updatedSettings[section] && typeof (updatedSettings[section][prop]) !== "undefined") {
                            updatedSettings[section][prop] = values[prop];
                        }
                    }
                }
            }
            this.lineup.settings = updatedSettings;
        }
    };
    /**
     * Gets called when a filter is changed.
     */
    LineUpVisual.prototype.onFilterChanged = function (filter) {
        var mySettings = this.lineup.settings;
        if (mySettings.experimental && mySettings.experimental.serverSideFiltering) {
            return true;
        }
    };
    /**
     * Listens for lineup to be sorted
     */
    LineUpVisual.prototype.onSorted = function (sort) {
        var mySettings = this.lineup.settings;
        if (mySettings.experimental && mySettings.experimental.serverSideSorting) {
            var args = null;
            if (sort) {
                var pbiCol = this.dataViewTable.columns.filter(function (c) { return c.displayName === sort.column; })[0];
                var sortDescriptors = [{
                        queryName: pbiCol.queryName,
                        sortDirection: sort.asc ? 1 /* Ascending */ : 2 /* Descending */
                    }];
                args = {
                    sortDescriptors: sortDescriptors
                };
            }
            this.waitingForSort = true;
            this.host.onCustomSort(args);
            return true;
        }
    };
    /**
     * Selects the given rows
     */
    LineUpVisual.prototype.onSelectionChanged = function (rows) {
        var _this = this;
        var filter;
        var _a = this.lineup.settings.selection, singleSelect = _a.singleSelect, multiSelect = _a.multiSelect;
        if (singleSelect || multiSelect) {
            if (rows && rows.length) {
                var expr = rows[0].filterExpr;
                // If we are allowing multiSelect
                if (rows.length > 0 && multiSelect) {
                    rows.slice(1).forEach(function (r) {
                        expr = powerbi.data.SQExprBuilder.or(expr, r.filterExpr);
                    });
                }
                filter = powerbi.data.SemanticFilter.fromSQExpr(expr);
            }
            var objects = {
                merge: [
                    {
                        objectName: "general",
                        selector: undefined,
                        properties: {
                            "filter": filter
                        }
                    }
                ]
            };
            // rows are what are currently selected in lineup
            if (rows && rows.length) {
                var smSelectedIds = this.selectionManager.getSelectionIds();
                var unselectedRows = smSelectedIds.filter(function (n) {
                    return rows.filter(function (m) { return m.identity.equals(n); }).length === 0;
                });
                var newSelectedRows = rows.filter(function (n) {
                    return smSelectedIds.filter(function (m) { return m.equals(n.identity); }).length === 0;
                });
                // This should work, but there is a bug with selectionManager
                // newSelectedRows.concat(unselectedRows).forEach((r) => this.selectionManager.select(r.identity, true));
                // HACK
                this.selectionManager.clear();
                rows.forEach(function (r) { return _this.selectionManager.select(r.identity, true); });
            }
            else {
                this.selectionManager.clear();
            }
            this.host.persistProperties(objects);
        }
    };
    /**
     * The default settings for the visual
     */
    LineUpVisual.VISUAL_DEFAULT_SETTINGS = $.extend(true, {}, LineUp_1.LineUp.DEFAULT_SETTINGS, {
        experimental: {
            serverSideSorting: false,
            serverSideFiltering: false
        }
    });
    /**
     * The set of capabilities for the visual
     */
    LineUpVisual.capabilities = {
        dataRoles: [{
                name: 'Values',
                kind: VisualDataRoleKind.Grouping
            }],
        dataViewMappings: [{
                table: {
                    rows: {
                        for: { in: 'Values' },
                        dataReductionAlgorithm: { window: { count: 100 } }
                    },
                    rowCount: { preferred: { min: 1 } }
                }
            }],
        objects: {
            general: {
                displayName: powerbi.data.createDisplayNameGetter('Visual_General'),
                properties: {
                    // formatString: {
                    //     type: {
                    //         formatting: {
                    //             formatString: true
                    //         }
                    //     },
                    // },
                    // selected: {
                    //     type: { bool: true }
                    // },
                    filter: {
                        type: { filter: {} },
                        rule: {
                            output: {
                                property: 'selected',
                                selector: ['Values'],
                            }
                        }
                    },
                },
            },
            layout: {
                displayName: "Layout",
                properties: {
                    // formatString: {
                    //     type: {
                    //         formatting: {
                    //             formatString: true
                    //         }
                    //     },
                    // },
                    // selected: {
                    //     type: { bool: true }
                    // },
                    layout: {
                        displayName: "JSON Configuration",
                        type: { text: {} }
                    }
                }
            },
            selection: {
                displayName: "Selection",
                properties: {
                    singleSelect: {
                        displayName: "Single Select",
                        description: "If true, when a row is selected, other data is filtered",
                        type: { bool: true }
                    },
                    multiSelect: {
                        displayName: "Multi Select",
                        description: "If true, multiple rows can be selected",
                        type: { bool: true }
                    }
                }
            },
            presentation: {
                displayName: "Presentation",
                properties: {
                    stacked: {
                        displayName: "Stacked",
                        description: "If true, when columns are combined, the all columns will be displayed stacked",
                        type: { bool: true }
                    },
                    values: {
                        displayName: "Values",
                        description: "If the actual values should be displayed under the bars",
                        type: { bool: true }
                    },
                    histograms: {
                        displayName: "Histograms",
                        description: "Show histograms in the column headers",
                        type: { bool: true }
                    },
                    animation: {
                        displayName: "Animation",
                        description: "Should the grid be animated when sorting",
                        type: { bool: true }
                    }
                },
            },
            experimental: {
                displayName: "Experimental",
                properties: {
                    serverSideSorting: {
                        displayName: "Server Side Sorting",
                        description: "If true, lineup will use PowerBI services to sort the data, rather than doing it client side",
                        type: { bool: true }
                    } /*,
                    serverSideFiltering: {
                        displayName: "Server Side Filtering",
                        description: "If true, lineup will use PowerBI services to filter the data, rather than doing it client side",
                        type: { bool: true }
                    }*/
                }
            }
        },
        sorting: {
            custom: {}
        }
    };
    LineUpVisual = __decorate([
        Utils_1.Visual(require("./build.js").output.PowerBI)
    ], LineUpVisual);
    return LineUpVisual;
})(VisualBase_1.VisualBase);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LineUpVisual;
/**
 * The data provider for our lineup instance
 */
var MyDataProvider = (function (_super) {
    __extends(MyDataProvider, _super);
    function MyDataProvider(data, hasMoreData, onLoadMoreData, onSorted, onFiltered) {
        _super.call(this, data);
        this.sortChanged = false;
        this.filterChanged = false;
        this.onLoadMoreData = onLoadMoreData;
        this.onSorted = onSorted;
        this.onFiltered = onFiltered;
        this.hasMoreData = hasMoreData;
    }
    /**
     * Determines if the dataset can be queried again
     */
    MyDataProvider.prototype.canQuery = function (options) {
        // We are either loading our initial set, which of course you can query it, otherwise, see if there is more data available
        var canLoad = options.offset === 0 || this.hasMoreData();
        return new Promise(function (resolve) { return resolve(canLoad); });
    };
    /**
     * Runs a query against the server
     */
    MyDataProvider.prototype.query = function (options) {
        // If the sort/filter changes, don't do anything, allow our users to respond
        if (options.offset > 0 || this.sortChanged || this.filterChanged) {
            if (this.onLoadMoreData && options.offset > 0) {
                this.onLoadMoreData();
            }
            this.sortChanged = false;
            this.filterChanged = false;
            return new Promise(function (resolve) {
                // Leave those guys hanging
            });
        }
        return _super.prototype.query.call(this, options);
    };
    ;
    /**
     * Called when the data should be sorted
     */
    MyDataProvider.prototype.sort = function (sort) {
        this.sortChanged = this.onSorted(sort);
    };
    /**
     * Called when the data is filtered
     */
    MyDataProvider.prototype.filter = function (filter) {
        this.filterChanged = this.onFiltered(filter);
    };
    return MyDataProvider;
})(JSONDataProvider_1.JSONDataProvider);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGluZVVwVmlzdWFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTGluZVVwVmlzdWFsLnRzIl0sIm5hbWVzIjpbIkxpbmVVcFZpc3VhbCIsIkxpbmVVcFZpc3VhbC5jb25zdHJ1Y3RvciIsIkxpbmVVcFZpc3VhbC5pbml0IiwiTGluZVVwVmlzdWFsLnVwZGF0ZSIsIkxpbmVVcFZpc3VhbC5lbnVtZXJhdGVPYmplY3RJbnN0YW5jZXMiLCJMaW5lVXBWaXN1YWwuZ2V0Q3NzIiwiTGluZVVwVmlzdWFsLmdldEV4dGVybmFsQ3NzUmVzb3VyY2VzIiwiTGluZVVwVmlzdWFsLmdldENvbmZpZ0Zyb21EYXRhVmlldyIsIkxpbmVVcFZpc3VhbC5jb252ZXJ0ZXIiLCJMaW5lVXBWaXN1YWwuY2hlY2tEYXRhQ2hhbmdlZCIsIkxpbmVVcFZpc3VhbC5jaGVja1NldHRpbmdzQ2hhbmdlZCIsIkxpbmVVcFZpc3VhbC5vbkZpbHRlckNoYW5nZWQiLCJMaW5lVXBWaXN1YWwub25Tb3J0ZWQiLCJMaW5lVXBWaXN1YWwub25TZWxlY3Rpb25DaGFuZ2VkIiwiTXlEYXRhUHJvdmlkZXIiLCJNeURhdGFQcm92aWRlci5jb25zdHJ1Y3RvciIsIk15RGF0YVByb3ZpZGVyLmNhblF1ZXJ5IiwiTXlEYXRhUHJvdmlkZXIucXVlcnkiLCJNeURhdGFQcm92aWRlci5zb3J0IiwiTXlEYXRhUHJvdmlkZXIuZmlsdGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLGtEQUFrRDtBQUNsRCwyQkFBZ0QsdUJBQXVCLENBQUMsQ0FBQTtBQUN4RSxzQkFBeUMsa0JBQWtCLENBQUMsQ0FBQTtBQUM1RCx1QkFBd0IsVUFBVSxDQUFDLENBQUE7QUFFbkMsaUNBQWlDLDhCQUE4QixDQUFDLENBQUE7QUFhaEUsSUFBTyxXQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUM7QUFDakQsSUFBTyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxnQkFB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