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
var TimeScale_1 = require("./TimeScale");
var VisualBase_1 = require("../../base/VisualBase");
var Utils_1 = require("../../base/Utils");
var SelectionId = powerbi.visuals.SelectionId;
var VisualDataRoleKind = powerbi.VisualDataRoleKind;
var TimeScaleVisual = (function (_super) {
    __extends(TimeScaleVisual, _super);
    function TimeScaleVisual() {
        _super.apply(this, arguments);
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
    TimeScaleVisual.prototype.init = function (options) {
        var _this = this;
        _super.prototype.init.call(this, options);
        this.element.append($(this.template));
        this.host = options.host;
        this.timeScale = new TimeScale_1.TimeScale(this.element.find(".timescale"), { width: options.viewport.width, height: options.viewport.height });
        this.timeScale.events.on("rangeSelected", function (range) { return _this.onTimeRangeSelected(range); });
    };
    /** Update is called for data updates, resizes & formatting changes */
    TimeScaleVisual.prototype.update = function (options) {
        _super.prototype.update.call(this, options);
        var startDate;
        var endDate;
        var dataView = options.dataViews && options.dataViews[0];
        if (dataView) {
            var dataViewCategorical = dataView.categorical;
            var data = TimeScaleVisual.converter(dataView);
            // Stash this bad boy for later, so we can filter the time column
            this.timeColumnIdentity = dataViewCategorical.categories[0].identityFields[0];
            var item = dataView.metadata.objects;
            if (dataView.metadata.objects && item.general && item.general.filter
                && item.general.filter.whereItems && item.general.filter.whereItems[0]
                && item.general.filter.whereItems && item.general.filter.whereItems[0].condition) {
                var filterStartDate = item.general.filter.whereItems[0].condition.lower.value;
                var filterEndDate = item.general.filter.whereItems[0].condition.upper.value;
                startDate = new Date(filterStartDate.getTime());
                endDate = new Date(filterEndDate.getTime());
                // If the selection has changed at all, then set it
                var currentSelection = this.timeScale.selectedRange;
                if (!currentSelection ||
                    currentSelection.length !== 2 ||
                    startDate !== currentSelection[0] ||
                    endDate !== currentSelection[1]) {
                    this.timeScale.selectedRange = [startDate, endDate];
                }
            }
            // If the data has changed at all, then update the timeScale
            if (Utils_1.default.hasDataChanged(data, this.timeScale.data, this.idCompare)) {
                this.timeScale.data = data;
            }
            // If the dimensions changed
            if (!_.isEqual(this.timeScale.dimensions, options.viewport)) {
                this.timeScale.dimensions = { width: options.viewport.width, height: options.viewport.height };
            }
        }
    };
    /**
     * Converts the data view into a time scale
     */
    TimeScaleVisual.converter = function (dataView) {
        var items;
        var dataViewCategorical = dataView && dataView.categorical;
        // Must be two columns: times and values
        if (dataViewCategorical &&
            dataViewCategorical.categories.length === 1 &&
            dataViewCategorical.values && dataViewCategorical.values.length) {
            items = dataViewCategorical.categories[0].values.map(function (val, i) { return ({
                date: val,
                value: dataViewCategorical.values[0].values[i],
                identity: SelectionId.createWithId(dataViewCategorical.categories[0].identity[i])
            }); });
        }
        return items;
    };
    /**
     * Raised when the time range is selected
     * @param range undefined means no range, otherwise should be [startDate, endDate]
     */
    TimeScaleVisual.prototype.onTimeRangeSelected = function (range) {
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
    TimeScaleVisual.prototype.getCss = function () {
        return _super.prototype.getCss.call(this).concat([require("!css!sass!./css/TimeScaleVisual.scss")]);
    };
    /**
     * The set of capabilities for the visual
     */
    TimeScaleVisual.capabilities = $.extend(true, {}, VisualBase_1.VisualBase.capabilities, {
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
    TimeScaleVisual = __decorate([
        Utils_1.Visual(JSON.parse(require("./build.json")).output.PowerBI)
    ], TimeScaleVisual);
    return TimeScaleVisual;
}(VisualBase_1.VisualBase));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TimeScaleVisual;
