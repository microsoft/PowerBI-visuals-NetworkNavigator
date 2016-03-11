/// <reference path="../../base/references.d.ts"/>
import { ForceGraph, IForceGraphData, IForceGraphLink, IForceGraphNode } from "./ForceGraph";
import { ExternalCssResource, VisualBase } from "../../base/VisualBase";
import { default as Utils, Visual } from "../../base/Utils";
import IVisual = powerbi.IVisual;
import DataViewTable = powerbi.DataViewTable;
import IVisualHostServices = powerbi.IVisualHostServices;
import VisualCapabilities = powerbi.VisualCapabilities;
import VisualInitOptions = powerbi.VisualInitOptions;
import VisualUpdateOptions = powerbi.VisualUpdateOptions;
import IInteractivityService = powerbi.visuals.IInteractivityService;
import InteractivityService = powerbi.visuals.InteractivityService;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import DataView = powerbi.DataView;
import SelectionId = powerbi.visuals.SelectionId;
import SelectionManager = powerbi.visuals.utility.SelectionManager;
import VisualDataRoleKind = powerbi.VisualDataRoleKind;
import utility = powerbi.visuals.utility;
const colors = require("../../base/powerbi/colors");
declare var _;

@Visual(JSON.parse(require("./build.json")).output.PowerBI)
export default class GraphVisual extends VisualBase implements IVisual {
    private dataViewTable: DataViewTable;
    private myGraph: ForceGraph;
    private host : IVisualHostServices;
    private interactivityService : IInteractivityService;

    private listener : { destroy: Function; };

    /**
     * The selection manager
     */
    private selectionManager: utility.SelectionManager;

    private static DEFAULT_SETTINGS: GraphVisualSettings = {
        columnMappings: {
            source: "source",
            target: "target",
            edgeValue: "value",
            sourceColor: "sourceColor",
            sourceLabelColor: "sourceLabelColor",
            targetColor: "targetColor",
            targetLabelColor: "targetLabelColor",
            sourceGroup: "sourceGroup",
            targetGroup: "targetGroup"
        },
        experimental: {
            sandboxed: false  
        },
        layout: {
            linkDistance: 10,
            linkStrength: 2,
            gravity: .1,
            charge: -120,
            labels: false,
            minZoom: .1,
            maxZoom: 100,
            defaultLabelColor: colors[0]
        }
    };

    public static capabilities: VisualCapabilities = {
        dataRoles: [{
            name: "Edges",
            displayName: "Edges",
            kind: powerbi.VisualDataRoleKind.GroupingOrMeasure,
        }],
        dataViewMappings: [{
            table: {
                rows: {
                    for: { in: "Edges" }
                }
            }
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
                                selector: ['Values'],
                            }
                        }
                    },
                },
            },
            columnMappings: {
                displayName: "Column Bindings",
                properties: {
                    source: {
                        displayName: "Source Column",
                        type: { text: true }
                    },
                    target: {
                        displayName: "Target Column",
                        type: { text: true }
                    },
                    edgeValue: {
                        displayName: "Edge Weight Column",
                        type: { text: true }
                    },
                    sourceColor: {
                        displayName: "Source Node Color Column",
                        type: { text: true }
                    },
                    sourceLabelColor: {
                        displayName: "Source Node Label Color Column",
                        type: { text: true }
                    },
                    targetColor: {
                        displayName: "Target Node Color Column",
                        type: { text: true }
                    },
                    targetLabelColor: {
                        displayName: "Target Node Label Color Column",
                        type: { text: true }
                    },
                },
            },
            layout: {
                displayName: "Layout",
                properties: {
                    linkDistance: {
                        displayName: "Link Distance",
                        type: { numeric: true }
                    },
                    linkStrength: {
                        displayName: "Link Strength",
                        type: { numeric: true }
                    },
                    gravity: {
                        displayName: "Gravity",
                        type: { numeric: true }
                    },
                    charge: {
                        displayName: "Charge",
                        type: { numeric: true }
                    },
                    labels: {
                        displayName: "Labels",
                        description: "If labels on the nodes should be shown",
                        type: { bool: true }
                    },
                    defaultLabelColor: {
                        displayName: "Default Label Color",
                        description: "The default color to use for labels",
                        type: { text: true }  
                    },
                    minZoom: {
                        displayName: "Min Zoom",
                        type: { numeric: true }
                    },
                    maxZoom: {
                        displayName: "Max Zoom",
                        type: { numeric: true }
                    }
                }
            },
            experimental: {
                displayName: "Experimental",
                properties: {
                    sandboxed: {
                        type: { bool: true },
                        displayName: "Enable to sandbox the visual into an IFrame"
                    }
                }
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

    private settings: GraphVisualSettings = $.extend(true, {}, GraphVisual.DEFAULT_SETTINGS);

    // private template : string = `
    //     <div class="load-container load5">
    //         <div class="loader">Loading...</div>
    //     </div>`;
    private template: string = `
        <div id="node_graph" style= "height: 100%;"> </div>
    `;

    /** This is called once when the visual is initialially created */
    public init(options: VisualInitOptions): void {
        super.init(options, this.template);
        this.element.append(this.template);
        this.myGraph = new ForceGraph(this.element.find("#node_graph"), 500, 500);
        this.host = options.host;
        this.interactivityService = new InteractivityService(this.host);
        this.attachEvents();
        this.selectionManager = new utility.SelectionManager({ hostServices: this.host });
    }

    /** Update is called for data updates, resizes & formatting changes */
    public update(options: VisualUpdateOptions) {
        super.update(options);

        var dataView = options.dataViews && options.dataViews.length && options.dataViews[0];
        var dataViewTable = dataView && dataView.table;
        var forceDataReload = this.updateSettings(options);

        if (dataViewTable) {
            
            const objs = dataView.metadata.objects;
            const experimental = objs && objs['experimental'];
            const sandboxed = !!(experimental && experimental['sandboxed']);
            if (this.sandboxed !== sandboxed) {
                this.sandboxed = sandboxed;
            }
            
            if ((forceDataReload || this.hasDataChanged(this.dataViewTable, dataViewTable))) {
                var parsedData = GraphVisual.converter(dataView, this.settings);
                this.myGraph.setData(parsedData);
            }
            var selectedIds = this.selectionManager.getSelectionIds();
            var data = this.myGraph.getData();
            if (data && data.nodes && data.nodes.length) {
                var updated = false;
                data.nodes.forEach((n) => {
                    var isSelected = !!_.find(selectedIds, (id : SelectionId) => id.equals((<ForceGraphSelectableNode>n).identity));
                    if (isSelected !== n.selected) {
                        n.selected = isSelected;
                        updated = true;
                    }
                });

                if (updated) {
                    this.myGraph.redrawSelection();
                }
                
                this.myGraph.redrawLabels();
            }
        }


        this.dataViewTable = dataViewTable;

        var currentDimensions = this.myGraph.dimensions;
        if (currentDimensions.width !== options.viewport.width ||
            currentDimensions.height !== options.viewport.height) {
            this.myGraph.dimensions = { width: options.viewport.width, height: options.viewport.height };
            this.element.css({ width: options.viewport.width, height: options.viewport.height });
        }
    }

    /**
     * Enumerates the instances for the objects that appear in the power bi panel
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] {
        return [{
            selector: null,
            objectName: options.objectName,
            properties: $.extend(true, {}, this.settings[options.objectName])
        }];
    }

    /**
     * Converts the data view into an internal data structure
     */
    public static converter(dataView: DataView, settings: GraphVisualSettings): IForceGraphData<ForceGraphSelectableNode> {
        var nodeList = [];
        var nodeMap : { [name: string] : ForceGraphSelectableNode } = {};
        var linkList = [];
        var table = dataView.table;

        var colMap = {};
        table.columns.forEach((n, i) => {
            colMap[n.displayName.toLocaleLowerCase()] = i;
        });

        // group defines the bundle basically
        // name, user friendly name,
        // num, size of circle, probably meant to be the number of matches
        // source - array index into nodes
        // target - array index into node
        // value - The number of times that the link has been made, ie, I emailed bob@gmail.com 10 times, so value would be 10

        var sourceIdx = colMap[settings.columnMappings.source.toLocaleLowerCase()];
        var sourceColorIdx = colMap[settings.columnMappings.sourceColor.toLocaleLowerCase()];
        var sourceLabelColorIdx = colMap[settings.columnMappings.sourceLabelColor.toLocaleLowerCase()];
        var sourceGroup = colMap[settings.columnMappings.sourceGroup.toLocaleLowerCase()];
        var targetGroupIdx = colMap[settings.columnMappings.targetGroup.toLocaleLowerCase()];
        var targetColorIdx = colMap[settings.columnMappings.targetColor.toLocaleLowerCase()];
        var targetLabelColorIdx = colMap[settings.columnMappings.targetLabelColor.toLocaleLowerCase()];
        var targetIdx = colMap[settings.columnMappings.target.toLocaleLowerCase()];
        var edgeValueIdx = colMap[settings.columnMappings.edgeValue.toLocaleLowerCase()];

        var sourceField = dataView.categorical.categories[0].identityFields[sourceIdx];
        var targetField = dataView.categorical.categories[0].identityFields[targetIdx];

        function getNode(id: string, identity: powerbi.DataViewScopeIdentity, isSource: boolean, color: string = "gray", labelColor = undefined, group: number = 0) : ForceGraphSelectableNode {
            var node = nodeMap[id];
            // var expr = identity.expr;
            var expr = powerbi.data.SQExprBuilder.equal(isSource ? sourceField : targetField, powerbi.data.SQExprBuilder.text(id));

            if (!nodeMap[id]) {
                node = nodeMap[id] = {
                    name: id,
                    color: color || "gray",
                    labelColor: labelColor,
                    index: nodeList.length,
                    filterExpr: expr,
                    num: 1,
                    selected: false,
                    identity: SelectionId.createWithId(powerbi.data.createDataViewScopeIdentity(expr))
                };
                nodeList.push(node);
            }
            return node;
        }

        table.rows.forEach((row, idx) => {
            var identity = table.identity[idx];
            if (row[sourceIdx] && row[targetIdx]) {
                /** These need to be strings to work properly */
                var sourceId = row[sourceIdx] + "";
                var targetId = row[targetIdx] + "";
                var edge = {
                    source: getNode(sourceId, identity, true, row[sourceColorIdx], row[sourceLabelColorIdx], row[sourceGroup]).index,
                    target: getNode(targetId, identity, false, row[targetColorIdx], row[targetLabelColorIdx], row[targetGroupIdx]).index,
                    value: row[edgeValueIdx]
                };
                nodeList[edge.source].num += 1;
                nodeList[edge.target].num += 1;
                linkList.push(edge);
            }
        });

        return {
            nodes: nodeList,
            links: linkList
        };
    }

    /**
    * Gets the external css paths used for this visualization
    */
    protected getExternalCssResources() : ExternalCssResource[] {
        return super.getExternalCssResources().concat(this.fontAwesome);
    }

    /**
     * Gets the inline css used for this element
     */
    protected getCss() : string[] {
        return super.getCss().concat([require("!css!sass!./css/GraphVisual.scss")]);
    }

    /**
     * Handles updating of the settings
     */
    private updateSettings (options: VisualUpdateOptions) : boolean {
        // There are some changes to the options
        var dataView = options.dataViews && options.dataViews.length && options.dataViews[0];
        if (dataView && dataView.metadata) {
            var oldSettings = $.extend(true, {}, this.settings);
            var newObjects = dataView.metadata.objects;

            // Merge in the settings
            $.extend(true, this.settings, newObjects ? newObjects : GraphVisual.DEFAULT_SETTINGS);

            // There were some changes to the layout
            if (!_.isEqual(oldSettings.layout, this.settings.layout)) {
                this.myGraph.configuration = $.extend(true, {}, this.settings.layout);
            }
           
            if (!_.isEqual(oldSettings.columnMappings, this.settings.columnMappings)) {
                // This is necessary because some of the settings affect how the data is loaded
                return true;
            }
        }
        return false;
    }

    /**
     * Returns if all the properties in the first object are present and equal to the ones in the super set
     */
    private objectIsSubset(set, superSet) {
        if (_.isObject(set)) {
            return _.any(_.keys(set), (key) => !this.objectIsSubset(set[key], superSet[key]));
        }
        return set === superSet;
    }

    /**
     * Determines if the old data is different from the new data.
     */
    private hasDataChanged(oldData: DataViewTable, newData: DataViewTable): boolean {
        if (!oldData || !newData || oldData.rows.length !== newData.rows.length) {
            return true;
        }

        // If there are any elements in newdata that arent in the old data
        return _.any(newData.identity, n => !_.any(oldData.identity, m => m.key.indexOf(n.key) === 0));
    }

    /**
     * Attaches the line up events to lineup
     */
    private attachEvents() {
        if (this.myGraph) {
            // Cleans up events
            if (this.listener) {
                this.listener.destroy();
            }
            this.listener = this.myGraph.events.on("selectionChanged", (node) => this.onNodeSelected(node));
        }
    }

    /**
     * Gets called when a node is selected
     */
    private onNodeSelected(node: ForceGraphSelectableNode) {
        var filter;
        if (node) {
            filter = powerbi.data.SemanticFilter.fromSQExpr(node.filterExpr);
            this.selectionManager.select(node.identity, false);
        } else {
            this.selectionManager.clear();
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
    }
}

/**
 * Represents the settings for this visual
 */
interface GraphVisualSettings {
    columnMappings?: {
        source?: string;
        target?: string;
        edgeValue?: string;
        sourceColor?: string;
        sourceLabelColor?: string;
        targetColor?: string;
        targetLabelColor?: string;
        sourceGroup?: string;
        targetGroup?: string;
    };
    experimental?: {
        sandboxed?: boolean;  
    };
    layout?: {
        linkDistance?: number;
        linkStrength?: number;
        gravity?: number;
        charge?: number;
        labels?: boolean;
        minZoom?: number;
        maxZoom?: number;
        defaultLabelColor?: string;
    };
};

/**
 * The lineup data
 */
interface ForceGraphSelectableNode extends powerbi.visuals.SelectableDataPoint, IForceGraphNode {

    /**
     * The nodes index into the node list
     */
    index: number;

    /**
     * Represents the number of edges that this node is connected to
     */
    num: number;

    /**
     * The expression that will exactly match this row
     */
    filterExpr : powerbi.data.SQExpr;
}