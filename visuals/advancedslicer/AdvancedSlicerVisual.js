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
var AdvancedSlicer_1 = require("./AdvancedSlicer");
var VisualBase_1 = require("../../base/VisualBase");
var Utils_1 = require("../../base/Utils");
var SelectionId = powerbi.visuals.SelectionId;
var VisualDataRoleKind = powerbi.VisualDataRoleKind;
var data = powerbi.data;
var SelectionManager = powerbi.visuals.utility.SelectionManager;
var AdvancedSlicerVisual = (function (_super) {
    __extends(AdvancedSlicerVisual, _super);
    function AdvancedSlicerVisual() {
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
     * Called when the visual is being initialized
     */
    AdvancedSlicerVisual.prototype.init = function (options) {
        var _this = this;
        _super.prototype.init.call(this, options, '<div></div>');
        this.host = options.host;
        this.mySlicer = new AdvancedSlicer_1.AdvancedSlicer(this.element);
        this.mySlicer.serverSideSearch = false;
        this.mySlicer.showSelections = true;
        this.selectionManager = new SelectionManager({ hostServices: this.host });
        this.mySlicer.events.on("loadMoreData", function (item) { return _this.onLoadMoreData(item); });
        this.mySlicer.events.on("canLoadMoreData", function (item, isSearch) { return item.result = isSearch || !!_this.dataView.metadata.segment; });
        this.mySlicer.events.on("selectionChanged", function (newItems, oldItems) { return _this.onSelectionChanged(newItems); });
    };
    /**
     * Called when the visual is being updated
     */
    AdvancedSlicerVisual.prototype.update = function (options) {
        _super.prototype.update.call(this, options);
        this.mySlicer.dimensions = options.viewport;
        this.dataView = options.dataViews && options.dataViews[0];
        if (this.dataView) {
            var categorical = this.dataView && this.dataView.categorical;
            var newData = AdvancedSlicerVisual.converter(this.dataView, this.selectionManager);
            if (this.loadDeferred) {
                var added = [];
                var anyRemoved = false;
                Utils_1.default.listDiff(this.mySlicer.data.slice(0), newData, {
                    /**
                     * Returns true if item one equals item two
                     */
                    equals: function (one, two) { return one.match === two.match; },
                    /**
                     * Gets called when the given item was added
                     */
                    onAdd: function (item) { return added.push(item); }
                });
                // We only need to give it the new items
                this.loadDeferred.resolve(added);
                delete this.loadDeferred;
            }
            else if (Utils_1.default.hasDataChanged(newData.slice(0), this.mySlicer.data, function (a, b) { return a.match === b.match; })) {
                this.mySlicer.data = newData;
            }
            this.mySlicer.showValues = !!categorical && !!categorical.values && categorical.values.length > 0;
            var sortedColumns = this.dataView.metadata.columns.filter(function (c) { return !!c.sort; });
            if (sortedColumns.length) {
                var lastColumn = sortedColumns[sortedColumns.length - 1];
                this.mySlicer.sort(sortedColumns[sortedColumns.length - 1].roles['Category'] ? 'match' : 'value', lastColumn.sort != 1);
            }
        }
        else {
            this.mySlicer.data = [];
        }
    };
    /**
     * Converts the given dataview into a list of listitems
     */
    AdvancedSlicerVisual.converter = function (dataView, selectionManager) {
        var converted;
        var selectedIds = selectionManager.getSelectionIds() || [];
        var categorical = dataView && dataView.categorical;
        var values = [];
        if (categorical && categorical.values && categorical.values.length) {
            values = categorical.values[0].values;
        }
        var maxValue = 0;
        if (categorical && categorical.categories && categorical.categories.length > 0) {
            converted = categorical.categories[0].values.map(function (category, i) {
                var id = SelectionId.createWithId(categorical.categories[0].identity[i]);
                var item = {
                    match: category,
                    identity: id,
                    selected: !!_.find(selectedIds, function (oId) { return oId.equals(id); }),
                    value: values[i] || 0,
                    renderedValue: undefined,
                    equals: function (b) { return id.equals(b.identity); }
                };
                if (item.value > maxValue) {
                    maxValue = item.value;
                }
                return item;
            });
            var percentage = maxValue < 100 ? true : false;
            converted.forEach(function (c) {
                c.renderedValue = c.value ? (c.value / maxValue) * 100 : undefined;
            });
        }
        return converted;
    };
    /**
     * Gets the inline css used for this element
     */
    AdvancedSlicerVisual.prototype.getCss = function () {
        return _super.prototype.getCss.call(this).concat([require("!css!sass!./css/AdvancedSlicer.scss")]);
    };
    /**
    * Gets the external css paths used for this visualization
    */
    AdvancedSlicerVisual.prototype.getExternalCssResources = function () {
        return _super.prototype.getExternalCssResources.call(this).concat(this.fontAwesome);
    };
    /**
     * Listener for when loading more data
     */
    AdvancedSlicerVisual.prototype.onLoadMoreData = function (item) {
        if (this.dataView.metadata.segment) {
            if (this.loadDeferred) {
                this.loadDeferred.reject();
            }
            this.loadDeferred = $.Deferred();
            item.result = this.loadDeferred.promise();
            this.host.loadMoreData();
        }
    };
    /**
     * Updates the data filter based on the selection
     */
    AdvancedSlicerVisual.prototype.onSelectionChanged = function (selectedItems) {
        var _this = this;
        var filter;
        this.selectionManager.clear();
        selectedItems.forEach(function (item) {
            _this.selectionManager.select(item.identity, true);
        });
        this.updateSelectionFilter();
    };
    /**
     * Updates the data filter based on the selection
     */
    AdvancedSlicerVisual.prototype.updateSelectionFilter = function () {
        var filter;
        if (this.selectionManager.hasSelection()) {
            var selectors = this.selectionManager.getSelectionIds().map(function (id) { return id.getSelector(); });
            filter = data.Selector.filterFromSelector(selectors);
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
        this.host.persistProperties(objects);
    };
    /**
     * The set of capabilities for the visual
     */
    AdvancedSlicerVisual.capabilities = {
        dataRoles: [
            {
                name: 'Category',
                kind: VisualDataRoleKind.Grouping,
                displayName: powerbi.data.createDisplayNameGetter('Role_DisplayName_Field'),
                description: data.createDisplayNameGetter('Role_DisplayName_FieldDescription')
            }, {
                name: 'Values',
                kind: VisualDataRoleKind.Measure
            },
        ],
        dataViewMappings: [{
                conditions: [{ 'Category': { max: 1, min: 1 }, 'Values': { max: 1, min: 0 } }],
                categorical: {
                    categories: {
                        for: { in: 'Category' },
                        dataReductionAlgorithm: { window: {} }
                    },
                    values: {
                        select: [{ bind: { to: "Values" } }]
                    },
                    includeEmptyGroups: true,
                }
            }],
        // Sort this crap by default
        sorting: {
            default: {}
        },
        objects: {
            general: {
                displayName: data.createDisplayNameGetter('Visual_General'),
                properties: {
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
            } /*,
            sorting: {
                displayName: "Sorting",
                properties: {
                    byHistogram: {
                        type: { bool: true }
                    },
                    byName: {
                        type: { bool: true }
                    }
                }
            }*/
        }
    };
    AdvancedSlicerVisual = __decorate([
        Utils_1.Visual(require("./build").output.PowerBI)
    ], AdvancedSlicerVisual);
    return AdvancedSlicerVisual;
})(VisualBase_1.VisualBase);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdvancedSlicerVisual;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWR2YW5jZWRTbGljZXJWaXN1YWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJBZHZhbmNlZFNsaWNlclZpc3VhbC50cyJdLCJuYW1lcyI6WyJBZHZhbmNlZFNsaWNlclZpc3VhbCIsIkFkdmFuY2VkU2xpY2VyVmlzdWFsLmNvbnN0cnVjdG9yIiwiQWR2YW5jZWRTbGljZXJWaXN1YWwuaW5pdCIsIkFkdmFuY2VkU2xpY2VyVmlzdWFsLnVwZGF0ZSIsIkFkdmFuY2VkU2xpY2VyVmlzdWFsLmNvbnZlcnRlciIsIkFkdmFuY2VkU2xpY2VyVmlzdWFsLmdldENzcyIsIkFkdmFuY2VkU2xpY2VyVmlzdWFsLmdldEV4dGVybmFsQ3NzUmVzb3VyY2VzIiwiQWR2YW5jZWRTbGljZXJWaXN1YWwub25Mb2FkTW9yZURhdGEiLCJBZHZhbmNlZFNsaWNlclZpc3VhbC5vblNlbGVjdGlvbkNoYW5nZWQiLCJBZHZhbmNlZFNsaWNlclZpc3VhbC51cGRhdGVTZWxlY3Rpb25GaWx0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsa0RBQWtEO0FBQ2xELCtCQUEyQyxrQkFBa0IsQ0FBQyxDQUFBO0FBQzlELDJCQUFnRCx1QkFBdUIsQ0FBQyxDQUFBO0FBQ3hFLHNCQUF5QyxrQkFBa0IsQ0FBQyxDQUFBO0FBSzVELElBQU8sV0FBVyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO0FBQ2pELElBQU8sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDO0FBQ3ZELElBQU8sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFFM0IsSUFBTyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztBQUVuRTtJQUNrREEsd0NBQVVBO0lBRDVEQTtRQUNrREMsOEJBQVVBO1FBMEZ4REE7O1dBRUdBO1FBQ0tBLGdCQUFXQSxHQUF3QkE7WUFDdkNBLEdBQUdBLEVBQUVBLHVFQUF1RUE7WUFDNUVBLFNB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