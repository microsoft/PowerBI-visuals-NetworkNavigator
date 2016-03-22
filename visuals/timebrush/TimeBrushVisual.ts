/// <reference path="../../base/references.d.ts"/>
declare var _;

import { TimeBrush as TimeBrushImpl, TimeBrushDataItem } from "./TimeBrush";

import { VisualBase } from "../../base/VisualBase";
import { default as Utils, Visual } from "../../base/Utils";
import IVisual = powerbi.IVisual;
import DataViewTable = powerbi.DataViewTable;
import IVisualHostServices = powerbi.IVisualHostServices;
import VisualCapabilities = powerbi.VisualCapabilities;
import VisualInitOptions = powerbi.VisualInitOptions;
import VisualUpdateOptions = powerbi.VisualUpdateOptions;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import SelectionId = powerbi.visuals.SelectionId;
import SelectionManager = powerbi.visuals.utility.SelectionManager;
import VisualDataRoleKind = powerbi.VisualDataRoleKind;
import SQExpr = powerbi.data.SQExpr;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;

const moment = require("moment");

@Visual(require("./build.js").output.PowerBI)
export default class TimeBrush extends VisualBase implements IVisual {

    private host : IVisualHostServices;
    private timeColumn: DataViewCategoryColumn;
    private timeBrush: TimeBrushImpl;

    /**
     * The set of capabilities for the visual
     */
    public static capabilities: VisualCapabilities = $.extend(true, {}, VisualBase.capabilities, {
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

    /**
     * The template for the grid
     */
    private template: string = `
        <div>
            <div class="timebrush"></div>
        </div>
    `;
    
    /**
     * Compares the ids of the two given items
     */
    private idCompare = (a : TimeBrushVisualDataItem, b: TimeBrushVisualDataItem) => a.identity.equals(b.identity);
    
    /**
     * Constructor for the timebrush visual
     */
    constructor(private noCss = false) {
        super();
    }

    /** This is called once when the visual is initialially created */
    public init(options: VisualInitOptions): void {
        super.init(options);
        this.element.append($(this.template));
        this.host = options.host;
        this.timeBrush = new TimeBrushImpl(this.element.find(".timebrush"), { width: options.viewport.width, height: options.viewport.height });
        this.timeBrush.events.on("rangeSelected", (range, items) => this.onTimeRangeSelected(range, items));
    }

    /** Update is called for data updates, resizes & formatting changes */
    public update(options: VisualUpdateOptions) {
        super.update(options);

        // If the dimensions changed
        if (!_.isEqual(this.timeBrush.dimensions, options.viewport)) {
            this.timeBrush.dimensions = { width: options.viewport.width, height: options.viewport.height };
        } else {
            var startDate;
            var endDate;
            var dataView = options.dataViews && options.dataViews[0];
            if (dataView) {
                var dataViewCategorical = dataView.categorical;
                var data = TimeBrush.converter(dataView);

                // Stash this bad boy for later, so we can filter the time column
                if (dataViewCategorical && dataViewCategorical.categories) {
                    this.timeColumn = dataViewCategorical.categories[0];
                }

                var item: any = dataView.metadata.objects;
                if (dataView.metadata.objects && item.general && item.general.filter
                    && item.general.filter.whereItems && item.general.filter.whereItems[0]
                    && item.general.filter.whereItems && item.general.filter.whereItems[0].condition) {
                    var filterStartDate = item.general.filter.whereItems[0].condition.lower.value;
                    var filterEndDate = item.general.filter.whereItems[0].condition.upper.value;
                    startDate = TimeBrush.coerceDate(filterStartDate);
                    endDate = TimeBrush.coerceDate(filterEndDate);

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
    }
    
    /**
     * Enumerates the instances for the objects that appear in the power bi panel
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
        let instances = super.enumerateObjectInstances(options) || [{
            selector: null, 
            objectName: options.objectName,
            properties: {}
        }];
        return instances;
    }

    /**
     * Converts the data view into a time scale
     */
    public static converter(dataView : DataView) : TimeBrushVisualDataItem[] {
        var items : TimeBrushVisualDataItem[];
        var dataViewCategorical = dataView && dataView.categorical;

        // Must be two columns: times and values
        if (dataViewCategorical && dataViewCategorical.categories && dataViewCategorical.values && dataViewCategorical.values.length) {
            if (dataViewCategorical.categories.length === 1) {
                items = dataViewCategorical.categories[0].values.map((date, i) => {
                    let coercedDate = TimeBrush.coerceDate(date);
                    return coercedDate ? {
                        date: coercedDate,
                        rawDate: date,
                        value: dataViewCategorical.values[0].values[i],
                        identity: SelectionId.createWithId(dataViewCategorical.categories[0].identity[i])
                    } : null;
                }).filter(n => !!n);
            }/* else if (dataViewCategorical.categories.length > 1) {
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
    }
    
    /**
     * Returns a numerical value for a month
     */
    public static getMonthFromString(mon: string){
        return new Date(Date.parse(mon +" 1, 2012")).getMonth()+1
    }
    
    /**
     * The formats for moment to test
     */
    public static MOMENT_FORMATS = [
        moment.ISO_8601,
        "MM/DD/YYYY HH:mm:ss",
        "MM/DD/YYYY HH:mm",
        "MM/DD/YYYY",
        "YYYY/MM/DD HH:mm:ss",
        "YYYY/MM/DD HH:mm",
        "YYYY/MM/DD",
        "YYYY",
        "HH:mm:ss",
        "HH:mm",
        "MM",
        "DD"
    ];
    
    /**
     * Coerces the given date value into a date object
     */
    public static coerceDate(dateValue: any) : Date {
        if (!dateValue) {
            return;
        }
            
        if (typeof dateValue === "string" && dateValue) {
            dateValue = dateValue.replace(/-/g, "/");
            const parsedDate = moment(dateValue, TimeBrush.MOMENT_FORMATS);
            dateValue = parsedDate.toDate();
        }
        
        // Assume it is just a year
        if (dateValue > 31 && dateValue <= 10000) {
            dateValue = new Date(dateValue, 0);
        } else if (dateValue >= 0 && dateValue <= 31) {
            dateValue = new Date(new Date().getFullYear(), 1, dateValue);
        } else if (typeof dateValue === "number" && dateValue > 10000) {
            // Assume epoch
            dateValue = new Date(dateValue);
        }
        return dateValue;
    }

    /**
     * Raised when the time range is selected
     * @param range undefined means no range, otherwise should be [startDate, endDate]
     */
    private onTimeRangeSelected(range: Date[], items: TimeBrushVisualDataItem[]) {
        var filter;
        if (range && range.length === 2) {
            const sourceType = this.timeColumn.source.type;
            let filterExpr;
            let builderType = "text";
            if (sourceType === powerbi.ValueType.fromDescriptor({ integer: true })) {
                builderType = "integer";
            } else if (sourceType === powerbi.ValueType.fromDescriptor({ numeric: true })) {
                builderType = "decimal";
            } else if (sourceType === powerbi.ValueType.fromDescriptor({ dateTime: true })) {
                builderType = "dateTime";
            }
            
            filter = powerbi.data.SemanticFilter.fromSQExpr(
                powerbi.data.SQExprBuilder.between(
                    this.timeColumn.identityFields[0],
                    powerbi.data.SQExprBuilder[builderType](items[0].rawDate),
                    powerbi.data.SQExprBuilder[builderType](items[1].rawDate))
            );
        }
        var objects: powerbi.VisualObjectInstancesToPersist = {
            merge: [
                <VisualObjectInstance>{
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
    }

    /**
     * Gets the inline css used for this element
     */
    protected getCss() : string[] {
        return this.noCss ? [] : super.getCss().concat([require("!css!sass!./css/TimeBrushVisual.scss")]);
    }
}

/**
 * The data item used by the TimeBrushVisual
 */
interface TimeBrushVisualDataItem extends TimeBrushDataItem {

    /**
     * The identity for this individual selection item
     */
    identity: SelectionId;
    
    /**
     * The raw unparsed date for this item
     */
    rawDate: any;
}