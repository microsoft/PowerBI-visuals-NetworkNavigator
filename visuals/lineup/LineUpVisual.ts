/// <reference path="../../base/references.d.ts"/>
import { ExternalCssResource, VisualBase } from "../../base/VisualBase";
import { default as Utils, Visual } from "../../base/Utils";
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
import { LineUp, ILineUpRow, ILineUpSettings } from "./LineUp";

@Visual(JSON.parse(require("./build.json")).output.PowerBI)
export default class LineUpVisual extends VisualBase implements IVisual {
    private dataViewTable: DataViewTable;
    private dataView: powerbi.DataView;
    private host : IVisualHostServices;
    private lineup: LineUp;
    private selectionManager : SelectionManager;

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
        this.lineup.events.on("loadMoreData", (info) => this.host.loadMoreData());
    }

    /** Update is called for data updates, resizes & formatting changes */
    public update(options: VisualUpdateOptions) {
        super.update(options);

        this.dataView = options.dataViews[0];
        this.dataViewTable = this.dataView && this.dataView.table;
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

        if (this.dataViewTable) {
            var colArr = this.dataViewTable.columns.slice(0).map((c) => {
                return {
                    displayName: c.displayName,
                    type: c.type
                };
            });
            var data : ILineUpVisualRow[] = [];
            var selectedIds = this.selectionManager.getSelectionIds();
            this.dataViewTable.rows.forEach((row, rowIndex) => {
                var identity = this.dataView.categorical.categories[0].identity[rowIndex];
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
                    result[colArr[i].displayName] = colInRow;
                });
                data.push(result);
            });

            this.lineup.loadData(colArr, data);
        }
    }

    /**
     * Enumerates the instances for the objects that appear in the power bi panel
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
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