/// <reference path="../../base/references.d.ts"/>
import { default as AdvancedSlicer, SlicerItem } from "./AdvancedSlicer";
import { VisualBase } from "../../base/VisualBase";
import { default as Utils, Visual } from "../../base/Utils";
import IVisual = powerbi.IVisual;
import IVisualHostServices = powerbi.IVisualHostServices;
import VisualCapabilities = powerbi.VisualCapabilities;
import DataView = powerbi.DataView;
import SelectionId = powerbi.visuals.SelectionId;
import VisualDataRoleKind = powerbi.VisualDataRoleKind;
import data = powerbi.data;
import SelectableDataPoint = powerbi.visuals.SelectableDataPoint;
import SelectionManager = powerbi.visuals.utility.SelectionManager;

@Visual(JSON.parse(require("./visualconfig.json")))
export default class AdvancedSlicerVisual extends VisualBase implements IVisual {

    /**
     * The current dataView
     */
    private dataView: DataView;

    /**
     * The host of the visual
     */
    private host: IVisualHostServices;

    /**
     * A reference to the loading element
     */
    private loadingElement: JQuery;

    /**
     * The selection manager
     */
    private selectionManager: SelectionManager;

    /**
     * My AdvancedSlicer
     */
    private mySlicer : AdvancedSlicer;

    /**
     * The set of capabilities for the visual
     */
    public static capabilities: VisualCapabilities = {
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
            conditions: [{ 'Category': { max: 1, min: 1 }, 'Values': { max: 1, min: 0 }}],
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
            default:{}
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
            }/*,
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

    /**
     * Called when the visual is being initialized
     */
    public init(options: powerbi.VisualInitOptions): void {
        super.init(options, '<div></div>');
        this.host = options.host;
        this.mySlicer = new AdvancedSlicer(this.element);
        this.selectionManager = new SelectionManager({ hostServices: this.host });
        this.mySlicer.events.on("loadMoreData", (item) => this.onLoadMoreData(item));
        this.mySlicer.events.on("canLoadMoreData", (item) => item.result = !!this.dataView.metadata.segment);
        this.mySlicer.events.on("selectionChanged", (newItems, oldItems) => this.onSelectionChanged(newItems));
    }

    /**
     * Called when the visual is being updated
     */
    public update(options: powerbi.VisualUpdateOptions) {
        super.update(options);

        this.mySlicer.dimensions = options.viewport;

        this.dataView = options.dataViews && options.dataViews[0];
        if (this.dataView) {
            var categorical = this.dataView && this.dataView.categorical;
            this.element.toggleClass("has-values", !!categorical && !!categorical.values && categorical.values.length > 0);
            var newData = AdvancedSlicerVisual.converter(this.dataView, this.selectionManager);
            this.mySlicer.data = newData;

            var sortedColumns = this.dataView.metadata.columns.filter((c) => !!c.sort);
            if (sortedColumns.length) {
                var lastColumn = sortedColumns[sortedColumns.length - 1];
                this.mySlicer.sort(sortedColumns[sortedColumns.length - 1].roles['Category'] ? 'category' : 'value', lastColumn.sort != 1);
            }
        } else {
            this.mySlicer.data = [];
        }
    }

    /**
     * Converts the given dataview into a list of listitems
     */
    public static converter(dataView: DataView, selectionManager: SelectionManager): ListItem[] {
        var converted: ListItem[];
        var selectedIds = selectionManager.getSelectionIds() || [];
        var categorical = dataView && dataView.categorical;
        var values = [];
        if (categorical && categorical.values && categorical.values.length) {
            values = categorical.values[0].values;
        }
        var maxValue = 0;
        if (categorical && categorical.categories && categorical.categories.length > 0) {
            converted = categorical.categories[0].values.map((category, i) => {
                var id = SelectionId.createWithId(categorical.categories[0].identity[i]);
                var item = {
                    category: category,
                    identity: id,
                    selected: !!_.find(selectedIds, (oId) => oId.equals(id)),
                    value: values[i] || 0,
                    renderedValue: undefined
                };
                if (item.value > maxValue) {
                    maxValue = item.value;
                }
                return item;
            });
            var percentage = maxValue < 100 ? true: false;
            converted.forEach((c) => {
                c.renderedValue = c.value ? (c.value / maxValue) * 100 : undefined;
            });
        }
        return converted;
    }

    /**
     * Gets the inline css used for this element
     */
    protected getCss() : string[] {
        return super.getCss().concat([require("!css!sass!./css/AdvancedSlicer.scss")]);
    }

    /**
     * Listener for when loading more data
     */
    private onLoadMoreData(item: any) {
        if (this.dataView.metadata.segment) {
            item.result = true;
            this.host.loadMoreData();
        }
    }

    /**
     * Updates the data filter based on the selection
     */
    private onSelectionChanged(selectedItems: ListItem[]) {
        var filter;
        this.selectionManager.clear();
        selectedItems.forEach((item) => {
            this.selectionManager.select(item.identity, true);
        });
        this.updateSelectionFilter();
    }

    /**
     * Updates the data filter based on the selection
     */
    private updateSelectionFilter() {
        var filter;
        if (this.selectionManager.hasSelection()) {
            var selectors = this.selectionManager.getSelectionIds().map((id) => id.getSelector());
            filter = data.Selector.filterFromSelector(selectors);
        }
        var objects: powerbi.VisualObjectInstancesToPersist = {
            merge: [
                <powerbi.VisualObjectInstance>{
                    objectName: "general",
                    selector: undefined,
                    properties: {
                        "filter": filter
                    }
                }
            ]
        };
        this.host.persistProperties(objects);
    }
}

/**
 * Represents a list item
 */
interface ListItem extends SlicerItem, SelectableDataPoint {}