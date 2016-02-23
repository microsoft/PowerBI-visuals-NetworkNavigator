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
        return _super.prototype.getCss.call(this).concat([require("!css!sass!./css/TimeScale.scss")]);
    };
    /**
     * The set of capabilities for the visual
     */
    TimeScaleVisual.capabilities = {
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
                // conditions: [
                //     { 'Times': { max: 1, min: 1 }, 'Values': { max: 1, min: 1 } },
                // ],
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
            },
        }
    };
    TimeScaleVisual = __decorate([
        Utils_1.Visual(JSON.parse(require("./build.json")).output.PowerBI)
    ], TimeScaleVisual);
    return TimeScaleVisual;
})(VisualBase_1.VisualBase);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TimeScaleVisual;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGltZVNjYWxlVmlzdWFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVGltZVNjYWxlVmlzdWFsLnRzIl0sIm5hbWVzIjpbIlRpbWVTY2FsZVZpc3VhbCIsIlRpbWVTY2FsZVZpc3VhbC5jb25zdHJ1Y3RvciIsIlRpbWVTY2FsZVZpc3VhbC5pbml0IiwiVGltZVNjYWxlVmlzdWFsLnVwZGF0ZSIsIlRpbWVTY2FsZVZpc3VhbC5jb252ZXJ0ZXIiLCJUaW1lU2NhbGVWaXN1YWwub25UaW1lUmFuZ2VTZWxlY3RlZCIsIlRpbWVTY2FsZVZpc3VhbC5nZXRDc3MiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsa0RBQWtEO0FBR2xELDBCQUE2QyxhQUFhLENBQUMsQ0FBQTtBQUUzRCwyQkFBMkIsdUJBQXVCLENBQUMsQ0FBQTtBQUNuRCxzQkFBeUMsa0JBQWtCLENBQUMsQ0FBQTtBQVc1RCxJQUFPLFdBQVcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztBQUVqRCxJQUFPLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQztBQUd2RDtJQUM2Q0EsbUNBQVVBO0lBRHZEQTtRQUM2Q0MsOEJBQVVBO1FBbURuREE7O1dBRUdBO1FBQ0tBLGFBQVFBLEdBQVdBLG9GQUkxQkEsQ0FBQ0E7UUFFRkE7O1dBRUdBO1FBQ0tBLGNBQVNBLEdBQUdBLFVBQUNBLENBQTJCQSxFQUFFQSxDQUEwQkEsSUFBS0EsT0FBQUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBN0JBLENBQTZCQSxDQUFDQTtJQWtIbkhBLENBQUNBO0lBaEhHRCxrRUFBa0VBO0lBQzNEQSw4QkFBSUEsR0FBWEEsVUFBWUEsT0FBMEJBO1FBQXRDRSxpQkFNQ0E7UUFMR0EsZ0JBQUtBLENBQUNBLElBQUlBLFlBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBQ3BCQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxN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