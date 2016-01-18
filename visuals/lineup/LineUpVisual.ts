/// <reference path="../../base/references.d.ts"/>
import { ExternalCssResource, VisualBase } from "../../base/VisualBase";
import { default as Utils, Visual } from "../../base/Utils";
import { LineUp, ILineUpRow, ILineUpSettings, ILineUpColumn, ILineUpConfiguration } from "./LineUp";

import IVisual = powerbi.IVisual;
import DataViewTable = powerbi.DataViewTable;
import IVisualHostServices = powerbi.IVisualHostServices;
import VisualCapabilities = powerbi.VisualCapabilities;
import VisualInitOptions = powerbi.VisualInitOptions;
import VisualUpdateOptions = powerbi.VisualUpdateOptions;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import DataView = powerbi.DataView;
import SelectionId = powerbi.visuals.SelectionId;
import SelectionManager = powerbi.visuals.utility.SelectionManager;
import VisualDataRoleKind = powerbi.VisualDataRoleKind;

@Visual(JSON.parse(require("./build.json")).output.PowerBI)
export default class LineUpVisual extends VisualBase implements IVisual {
    private dataViewTable: DataViewTable;
    private dataView: powerbi.DataView;
    private host : IVisualHostServices;
    private lineup: LineUp;
    private selectionManager : SelectionManager;
    private loadingMoreData : boolean;
    private waitingForSort : boolean;
    private dimensions: { width: number; height: number };
    private loading : boolean;

    /**
     * The set of capabilities for the visual
     */
    public static capabilities: VisualCapabilities = {
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
            data: {
                displayName: "Data",
                properties: {
                    inferColumnTypes: {
                        displayName: "Infer Column Types",
                        description: "Infer the coulmn types from the data, vs using the PowerBI defined column types",
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
            }
        },
        sorting: {
            custom:{}
        }
    };

    /**
     * The font awesome resource
     */
    private fontAwesome: ExternalCssResource = {
        url: '//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css',
        integrity: 'sha256-3dkvEK0WLHRJ7/Csr0BZjAWxERc5WH7bdeUya2aXxdU= sha512-+L4yy6FRcDGbXJ9mPG8MT' +
                    '/3UCDzwR9gPeyFNMCtInsol++5m3bk2bXWKdZjvybmohrAsn3Ua5x8gfLnbE1YkOg==',
        crossorigin: "anonymous"
    };

    /** This is called once when the visual is initialially created */
    public init(options: VisualInitOptions): void {
        super.init(options, '<div></div>', true);
        this.host = options.host;

        // Temporary, because the popups will load outside of the iframe for some reason
        this.buildExternalCssLink(this.fontAwesome).then((ele) => {
            this.container.append($(ele));
        });
        this.selectionManager = new SelectionManager({
            hostServices: options.host
        });
        this.lineup = new LineUp(this.element);
        this.lineup.events.on("selectionChanged", (rows) => this.onSelectionChanged(rows));
        this.lineup.events.on("canLoadMoreData", (info) => info.result = !!this.dataView && !!this.dataView.metadata.segment);
        this.lineup.events.on("sortChanged", (column, asc) => this.onSorted(column, asc));
        this.lineup.events.on("loadMoreData", (info) => {
            this.loadingMoreData = true;
            this.host.loadMoreData();
        });
        this.lineup.events.on("configurationChanged", (config) => {
            if (!this.loading) {

                var objects: powerbi.VisualObjectInstancesToPersist = {
                    merge: [
                        <VisualObjectInstance>{
                            objectName: "layout",
                            properties: {
                                "layout": JSON.stringify(config)
                            },
                            selector: undefined,
                        }
                    ]
                };
                this.host.persistProperties(objects);
            }
        });
    }

    /** Update is called for data updates, resizes & formatting changes */
    public update(options: VisualUpdateOptions) {
        this.loading = true;
        super.update(options);

        // Assume that data updates won't happen when resizing
        var newDims = { width: options.viewport.width, height: options.viewport.height };
        if (!_.isEqual(newDims, this.dimensions)) {
            this.dimensions = newDims;
        } else {

            // If we explicitly are loading more data OR If we had no data before, then data has been loaded
            this.loadingMoreData = false;
            this.waitingForSort = false;

            this.dataView = options.dataViews[0];
            this.dataViewTable = this.dataView && this.dataView.table;

            this.checkSettingsChanged();
            this.checkDataChanged();

        }

        this.loading = false;
    }

    /**
     * Enumerates the instances for the objects that appear in the power bi panel
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
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
    }

    /**
     * Gets the css used for this element
     */
    protected getCss() : string[] {
        return super.getCss().concat([require("!css!sass!./css/LineUp.scss"), require("!css!sass!./css/LineUpVisual.scss")]);
    }

    /**
    * Gets the external css paths used for this visualization
    */
    protected getExternalCssResources() : ExternalCssResource[] {
        return super.getExternalCssResources().concat(this.fontAwesome);
    }

    /**
     * Gets a lineup config from the data view
     */
    private getConfigFromDataView() : ILineUpConfiguration {
        var colArr : ILineUpColumn[] = this.dataViewTable.columns.slice(0).map((c) => {
            return {
                label: c.displayName,
                column: c.displayName,
                type: c.type.numeric ? "number" : "string",
            };
        });
        let config : ILineUpConfiguration = null;
        if (this.dataView.metadata && this.dataView.metadata.objects && this.dataView.metadata.objects['layout']) {
            let configStr = this.dataView.metadata.objects['layout']['layout'];
            if (configStr) {
                config = JSON.parse(configStr);
            }
        }
        if (!config) {
            config = {
                primaryKey: colArr[0].label,
                columns: colArr
            };
        } else {
            Utils.listDiff<ILineUpColumn>(config.columns, colArr, {
                /**
                 * Returns true if item one equals item two
                 */
                equals: (one, two) => one.label === two.label,

                /**
                 * Gets called when the given item was removed
                 */
                onRemove: (item) => {
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
                onAdd: (item) => {
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
    }

    /**
     * Converts the data from power bi to a data we can use
     */
    private static converter(view: DataView, config: ILineUpConfiguration, selectedIds: any) {
        var data : ILineUpVisualRow[] = [];
        if (view && view.table) {
            var table = view.table;
            table.rows.forEach((row, rowIndex) => {
                var identity = view.categorical.categories[0].identity[rowIndex];
                var newId = SelectionId.createWithId(identity);
                // The below is busted > 100
                //var identity = SelectionId.createWithId(this.dataViewTable.identity[rowIndex]);
                var result : ILineUpVisualRow = {
                    identity: newId,
                    equals: (b) => (<ILineUpVisualRow>b).identity.equals(newId),
                    filterExpr: identity.expr,
                    selected: !!_.find(selectedIds, (id : SelectionId) => id.equals(newId))
                };
                row.forEach((colInRow, i) => {
                    result[config.columns[i].label] = colInRow;
                });
                data.push(result);
            });
        }
        return data;
    }

    /**
     * Event listener for when the visual data's changes
     */
    private checkDataChanged() {
        if (this.dataViewTable) {
            let config = this.getConfigFromDataView();
            var append = true;
            var finalData = [];
            var selectedRows = [];
            var addedRemoved = false;
            var newData = LineUpVisual.converter(this.dataView, config, this.selectionManager.getSelectionIds());
            Utils.listDiff<ILineUpRow>((this.lineup.getData() || []).slice(0), newData, {
                equals: (a, b) => a.equals(b),
                onAdd: (item) => {
                    addedRemoved = true;
                    finalData.push(item);
                    if (item.selected) {
                        selectedRows.push(item);
                    }
                },
                onRemove: (item) => {
                    addedRemoved = true;
                    // If any were removed, we're dealing with a different set of data, just set the data
                    append = false;
                },
                onUpdate(existing, newitem) {
                    existing.selected = newitem.selected;
                    if (existing.selected) {
                        selectedRows.push(existing);
                    }
                }
            });
            this.lineup.configuration = config;
            if (addedRemoved) {
                // appendData/setData will deal with selection
                if (append) {
                    this.lineup.appendData(finalData);
                } else {
                    this.lineup.setData(finalData);
                }
            } else {
                this.lineup.selection = selectedRows;
            }
        }
    }

    /**
     * Listener for when the visual settings changed
     */
    private checkSettingsChanged() {
        if (this.dataView) {
            // Store this to compare
            var oldSettings : ILineUpSettings = $.extend(true, {}, this.lineup.settings);

            // Make sure we have the default values
            var updatedSettings : ILineUpSettings = $.extend(true, this.lineup.settings, LineUp.DEFAULT_SETTINGS);

            // Copy over new values
            var newObjs = this.dataView.metadata.objects;
            if (newObjs) {
                for (var section in newObjs) {
                    var values = newObjs[section];
                    for (var prop in values) {
                        if (updatedSettings[section] && typeof(updatedSettings[section][prop]) !== "undefined") {
                            updatedSettings[section][prop] = values[prop];
                        }
                    }
                }
            }
            this.lineup.settings = newObjs;
        }
    }

    /**
     * Listens for lineup to be sorted
     */
    private onSorted(column: string, asc: boolean) {
        // let pbiCol = this.dataViewTable.columns.filter((c) => c.displayName === column)[0];
        // let sortDescriptors: powerbi.SortableFieldDescriptor[] = [{
        //     queryName: pbiCol.queryName,
        //     sortDirection: asc ? powerbi.SortDirection.Ascending : powerbi.SortDirection.Descending
        // }];
        // let args: powerbi.CustomSortEventArgs = {
        //     sortDescriptors: sortDescriptors
        // };
        // this.waitingForSort = true;
        // this.host.onCustomSort(args);
    }

    /**
     * Selects the given rows
     */
    private onSelectionChanged(rows : ILineUpVisualRow[]) {
        var filter;
        if (this.lineup.selectionEnabled) {
            if (rows && rows.length) {
                var expr = rows[0].filterExpr;

                // If we are allowing multiSelect
                if (rows.length > 0 && this.lineup.isMultiSelect) {
                    rows.slice(1).forEach((r) => {
                    expr = powerbi.data.SQExprBuilder.or(expr, r.filterExpr);
                    });
                }
                filter = powerbi.data.SemanticFilter.fromSQExpr(expr);
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

            // rows are what are currently selected in lineup
            if (rows && rows.length) {
                var smSelectedIds = this.selectionManager.getSelectionIds();
                var unselectedRows = smSelectedIds.filter((n) => {
                    return rows.filter((m) => m.identity.equals(n)).length === 0;
                });
                var newSelectedRows = rows.filter((n) => {
                    return smSelectedIds.filter((m) => m.equals(n.identity)).length === 0;
                });

                // This should work, but there is a bug with selectionManager
                // newSelectedRows.concat(unselectedRows).forEach((r) => this.selectionManager.select(r.identity, true));

                // HACK
                this.selectionManager.clear();
                rows.forEach((r) => this.selectionManager.select(r.identity, true));
            } else {
                this.selectionManager.clear();
            }

            this.host.persistProperties(objects);
        }
    }
}

/**
 * Represents a setting with a value
 */
interface IVisualBaseSettingWithValue<T> extends powerbi.data.DataViewObjectPropertyDescriptor {
    value?: T;
}

/**
 * The lineup data
 */
interface ILineUpVisualRow extends ILineUpRow, powerbi.visuals.SelectableDataPoint {

    /**
     * The expression that will exactly match this row
     */
    filterExpr: powerbi.data.SQExpr;
}