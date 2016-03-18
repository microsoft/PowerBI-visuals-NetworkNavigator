"use strict";
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
var AttributeSlicer_1 = require("./AttributeSlicer");
var VisualBase_1 = require("../../base/VisualBase");
var Utils_1 = require("../../base/Utils");
var SelectionId = powerbi.visuals.SelectionId;
var VisualDataRoleKind = powerbi.VisualDataRoleKind;
var data = powerbi.data;
var SelectionManager = powerbi.visuals.utility.SelectionManager;
var AttributeSlicer = (function (_super) {
    __extends(AttributeSlicer, _super);
    function AttributeSlicer() {
        var _this = this;
        _super.apply(this, arguments);
        /**
         * Updates the data filter based on the selection
         */
        this.onSelectionChanged = _.debounce(function (selectedItems) {
            var filter;
            _this.selectionManager.clear();
            selectedItems.forEach(function (item) {
                _this.selectionManager.select(item.identity, true);
            });
            _this.updateSelectionFilter();
        }, 100);
    }
    /**
     * Called when the visual is being initialized
     */
    AttributeSlicer.prototype.init = function (options) {
        var _this = this;
        _super.prototype.init.call(this, options, '<div></div>');
        this.host = options.host;
        this.mySlicer = new AttributeSlicer_1.AttributeSlicer(this.element);
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
    AttributeSlicer.prototype.update = function (options) {
        _super.prototype.update.call(this, options);
        this.mySlicer.dimensions = options.viewport;
        this.dataView = options.dataViews && options.dataViews[0];
        if (this.dataView) {
            var categorical = this.dataView && this.dataView.categorical;
            var newData = AttributeSlicer.converter(this.dataView, this.selectionManager);
            if (this.loadDeferred && this.mySlicer.data) {
                var added_1 = [];
                var anyRemoved = false;
                Utils_1.default.listDiff(this.mySlicer.data.slice(0), newData, {
                    /**
                     * Returns true if item one equals item two
                     */
                    equals: function (one, two) { return one.match === two.match; },
                    /**
                     * Gets called when the given item was added
                     */
                    onAdd: function (item) { return added_1.push(item); }
                });
                // We only need to give it the new items
                this.loadDeferred.resolve(added_1);
                delete this.loadDeferred;
            }
            else if (newData && Utils_1.default.hasDataChanged(newData.slice(0), this.mySlicer.data, function (a, b) { return a.match === b.match && a.renderedValue === b.renderedValue; })) {
                this.mySlicer.data = newData;
            }
            else if (!newData) {
                this.mySlicer.data = [];
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
    AttributeSlicer.converter = function (dataView, selectionManager) {
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
     * Enumerates the instances for the objects that appear in the power bi panel
     */
    AttributeSlicer.prototype.enumerateObjectInstances = function (options) {
        var instances = _super.prototype.enumerateObjectInstances.call(this, options) || [{
                selector: null,
                objectName: options.objectName,
                properties: {}
            }];
        return instances;
    };
    /**
     * Gets the inline css used for this element
     */
    AttributeSlicer.prototype.getCss = function () {
        return _super.prototype.getCss.call(this).concat([require("!css!sass!./css/AttributeSlicerVisual.scss")]);
    };
    /**
     * Listener for when loading more data
     */
    AttributeSlicer.prototype.onLoadMoreData = function (item) {
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
    AttributeSlicer.prototype.updateSelectionFilter = function () {
        var filter;
        if (this.selectionManager.hasSelection()) {
            var selectors = this.selectionManager.getSelectionIds().map(function (id) { return id.getSelector(); });
            filter = data.Selector.filterFromSelector(selectors);
        }
        var objects = {};
        if (filter) {
            $.extend(objects, {
                merge: [
                    {
                        objectName: "general",
                        selector: undefined,
                        properties: {
                            "filter": filter
                        }
                    }
                ]
            });
        }
        else {
            $.extend(objects, {
                remove: [
                    {
                        objectName: "general",
                        selector: undefined,
                        properties: {
                            "filter": filter
                        }
                    }
                ]
            });
        }
        this.host.persistProperties(objects);
    };
    /**
     * The set of capabilities for the visual
     */
    AttributeSlicer.capabilities = $.extend(true, {}, VisualBase_1.VisualBase.capabilities, {
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
                conditions: [{ 'Category': { max: 1, min: 0 }, 'Values': { max: 1, min: 0 } }],
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
            }
        }
    });
    AttributeSlicer = __decorate([
        Utils_1.Visual(require("./build").output.PowerBI)
    ], AttributeSlicer);
    return AttributeSlicer;
}(VisualBase_1.VisualBase));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AttributeSlicer;
