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
var TimeBrush_1 = require("./TimeBrush");
var VisualBase_1 = require("../../base/VisualBase");
var Utils_1 = require("../../base/Utils");
var SelectionId = powerbi.visuals.SelectionId;
var VisualDataRoleKind = powerbi.VisualDataRoleKind;
var TimeBrush = (function (_super) {
    __extends(TimeBrush, _super);
    /**
     * Constructor for the timescale visual
     */
    function TimeBrush(noCss) {
        if (noCss === void 0) { noCss = false; }
        _super.call(this);
        this.noCss = noCss;
        /**
         * The template for the grid
         */
        this.template = "\n        <div>\n            <div class=\"timescale\"></div>\n        </div>\n    ";
        /**
         * Compares the ids of the two given items
         */
        this.idCompare = function (a, b) { return a.identity.equals(b.identity); };
    }
    /** This is called once when the visual is initialially created */
    TimeBrush.prototype.init = function (options) {
        var _this = this;
        _super.prototype.init.call(this, options);
        this.element.append($(this.template));
        this.host = options.host;
        this.timeBrush = new TimeBrush_1.TimeBrush(this.element.find(".timescale"), { width: options.viewport.width, height: options.viewport.height });
        this.timeBrush.events.on("rangeSelected", function (range) { return _this.onTimeRangeSelected(range); });
    };
    /** Update is called for data updates, resizes & formatting changes */
    TimeBrush.prototype.update = function (options) {
        _super.prototype.update.call(this, options);
        // If the dimensions changed
        if (!_.isEqual(this.timeBrush.dimensions, options.viewport)) {
            this.timeBrush.dimensions = { width: options.viewport.width, height: options.viewport.height };
        }
        else {
            var startDate;
            var endDate;
            var dataView = options.dataViews && options.dataViews[0];
            if (dataView) {
                var dataViewCategorical = dataView.categorical;
                var data = TimeBrush.converter(dataView);
                // Stash this bad boy for later, so we can filter the time column
                if (dataViewCategorical && dataViewCategorical.categories) {
                    this.timeColumnIdentity = dataViewCategorical.categories[0].identityFields[0];
                }
                var item = dataView.metadata.objects;
                if (dataView.metadata.objects && item.general && item.general.filter
                    && item.general.filter.whereItems && item.general.filter.whereItems[0]
                    && item.general.filter.whereItems && item.general.filter.whereItems[0].condition) {
                    var filterStartDate = item.general.filter.whereItems[0].condition.lower.value;
                    var filterEndDate = item.general.filter.whereItems[0].condition.upper.value;
                    startDate = new Date(filterStartDate.getTime());
                    endDate = new Date(filterEndDate.getTime());
                    // If the selection has changed at all, then set it
                    var currentSelection = this.timeBrush.selectedRange;
                    if (!currentSelection ||
                        currentSelection.length !== 2 ||
                        startDate !== currentSelection[0] ||
                        endDate !== currentSelection[1]) {
                        this.timeBrush.selectedRange = [startDate, endDate];
                    }
                }
                this.timeBrush.data = data;
            }
        }
    };
    /**
     * Converts the data view into a time scale
     */
    TimeBrush.converter = function (dataView) {
        var items;
        var dataViewCategorical = dataView && dataView.categorical;
        // Must be two columns: times and values
        if (dataViewCategorical && dataViewCategorical.categories && dataViewCategorical.values && dataViewCategorical.values.length) {
            if (dataViewCategorical.categories.length === 1) {
                items = dataViewCategorical.categories[0].values.map(function (date, i) {
                    return {
                        date: TimeBrush.coerceDate(date),
                        value: dataViewCategorical.values[0].values[i],
                        identity: SelectionId.createWithId(dataViewCategorical.categories[0].identity[i])
                    };
                });
            } /* else if (dataViewCategorical.categories.length > 1) {
                let yearCategory;
                let monthCategory;
                let dayCategory;
                dataViewCategorical.categories.forEach(cat => {
                    let categoryName = cat.source.displayName;
                    if (categoryName === "Year") {
                        yearCategory = cat;
                    } else if (categoryName === "Month") {
                        monthCategory = cat;
                    } else if (categoryName === "Day") {
                        dayCategory = cat;
                    }
                });
                
                items = [];
                let numValues = dataViewCategorical.categories[0].values.length;
                let date = new Date();
                for (let i = 0; i < numValues; i++) {
                    items.push({
                        date: new Date(
                            yearCategory ? yearCategory.values[i] : date.getFullYear(),
                            monthCategory ? TimeBrushVisual.getMonthFromString(monthCategory.values[i]) - 1 : 0,
                            dayCategory ? dayCategory.values[i] : 1
                        ),
                        value: dataViewCategorical.values[0].values[i],
                        identity: SelectionId.createWithId(dataViewCategorical.categories[0].identity[i])
                    });
                }
            }*/
        }
        return items;
    };
    /**
     * Returns a numerical value for a month
     */
    TimeBrush.getMonthFromString = function (mon) {
        return new Date(Date.parse(mon + " 1, 2012")).getMonth() + 1;
    };
    /**
     * Coerces the given date value into a date object
     */
    TimeBrush.coerceDate = function (dateValue) {
        if (!dateValue) {
            dateValue = new Date();
        }
        if (typeof dateValue === "string") {
            dateValue = new Date((Date.parse(dateValue) + ((new Date().getTimezoneOffset() + 60) * 60 * 1000)));
        }
        // Assume it is just a year
        if (dateValue > 31 && dateValue <= 10000) {
            dateValue = new Date(dateValue, 0);
        }
        else if (dateValue >= 0 && dateValue <= 31) {
            dateValue = new Date(new Date().getFullYear(), 1, dateValue);
        }
        else if (typeof dateValue === "number" && dateValue > 10000) {
            // Assume epoch
            dateValue = new Date(dateValue);
        }
        return dateValue;
    };
    /**
     * Raised when the time range is selected
     * @param range undefined means no range, otherwise should be [startDate, endDate]
     */
    TimeBrush.prototype.onTimeRangeSelected = function (range) {
        var filter;
        if (range && range.length === 2) {
            var filterExpr = powerbi.data.SQExprBuilder.between(this.timeColumnIdentity, powerbi.data.SQExprBuilder.dateTime(range[0]), powerbi.data.SQExprBuilder.dateTime(range[1]));
            filter = powerbi.data.SemanticFilter.fromSQExpr(filterExpr);
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
        // Hack from timeline.ts
        this.host.onSelect({ data: [] });
    };
    /**
     * Gets the inline css used for this element
     */
    TimeBrush.prototype.getCss = function () {
        return this.noCss ? [] : _super.prototype.getCss.call(this).concat([require("!css!sass!./css/TimeBrushVisual.scss")]);
    };
    /**
     * The set of capabilities for the visual
     */
    TimeBrush.capabilities = $.extend(true, {}, VisualBase_1.VisualBase.capabilities, {
        dataRoles: [{
                name: 'Times',
                kind: VisualDataRoleKind.Grouping,
                displayName: "Time"
            }, {
                name: 'Values',
                kind: VisualDataRoleKind.Measure,
                displayName: "Values"
            }],
        dataViewMappings: [{
                categorical: {
                    categories: {
                        for: { in: 'Times' },
                        dataReductionAlgorithm: { top: {} }
                    },
                    values: {
                        select: [{ bind: { to: 'Values' } }]
                    }
                },
                conditions: [{ 'Times': { max: 1, min: 0 }, 'Values': { max: 1, min: 0 } }],
            }],
        objects: {
            general: {
                displayName: powerbi.data.createDisplayNameGetter('Visual_General'),
                properties: {
                    filter: {
                        type: { filter: {} },
                        rule: {
                            output: {
                                property: 'selected',
                                selector: ['Time'],
                            }
                        }
                    },
                },
            }
        }
    });
    TimeBrush = __decorate([
        Utils_1.Visual(require("./build.js").output.PowerBI)
    ], TimeBrush);
    return TimeBrush;
}(VisualBase_1.VisualBase));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TimeBrush;
