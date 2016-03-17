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
     * A list of our data roles
     */
    private static DATA_ROLES = {
        source: {
            displayName: "Source Node",
            name: "SOURCE_NODE"
        },
        target: {
            displayName: "Target Node",
            name: "TARGET_NODE"
        }/*,
        edgeValue: {
            displayName: "Edge Weight",
            name: "EDGE_VALUE"
        },
        sourceGroup: {
            displayName: "Source Node Group",
            name: "SOURCE_GROUP"
        }*/,
        sourceColor: {
            displayName: "Source Node Color",
            name: "SOURCE_NODE_COLOR"
        },
        sourceLabelColor: {
            displayName: "Source Node Label Color",
            name: "SOURCE_LABEL_COLOR"
        }/*,
        targetGroup: {
            displayName: "Target Node Group",
            name: "TARGET_GROUP"
        }*/,
        targetColor: {
            displayName: "Target Node Color",
            name: "TARGET_NODE_COLOR"
        },
        targetLabelColor: {
            displayName: "Target Node Label Color",
            name: "TARGET_LABEL_COLOR"
        }
    };

    /**
     * The selection manager
     */
    private selectionManager: utility.SelectionManager;

    private static DEFAULT_SETTINGS: GraphVisualSettings = {
        layout: {
            animate: true,
            maxNodeCount: 0,
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

    public static capabilities: VisualCapabilities = $.extend(true, {}, VisualBase.capabilities, {
        dataRoles: Object.keys(GraphVisual.DATA_ROLES).map(n => ({ 
            name: GraphVisual.DATA_ROLES[n].name,
            displayName: GraphVisual.DATA_ROLES[n].displayName,
            kind: powerbi.VisualDataRoleKind.Grouping
        })),
        dataViewMappings: [{
            table: {
                rows: {
                    select: Object.keys(GraphVisual.DATA_ROLES).map(n => ({ bind: { to: GraphVisual.DATA_ROLES[n].name }}))
                }
            },
            conditions: [Object.keys(GraphVisual.DATA_ROLES).reduce((a, b) => {
                a[GraphVisual.DATA_ROLES[b].name] = { min: 0, max: 1 }; 
                return a; 
            }, {})]
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
            layout: {
                displayName: "Layout",
                properties: {
                    animate: {
                        displayName: "Animate",
                        description: "Should the graph be animated",
                        type: { bool: true }
                    },  
                    maxNodeCount: {
                        displayName: "Max nodes",
                        description: "The maximum number of nodes to render",
                        type: { numeric: true }
                    },  
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
                        type: { fill: { solid: { color: true } } }
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
            }
        }
    });

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
        let instances = super.enumerateObjectInstances(options) || [{
            selector: null, 
            objectName: options.objectName,
            properties: {}
        }];
        $.extend(true, instances[0].properties, this.settings[options.objectName]);
        return instances;
    }

    /**
     * Converts the data view into an internal data structure
     */
    public static converter(dataView: DataView, settings: GraphVisualSettings): IForceGraphData<ForceGraphSelectableNode> {
        var nodeList = [];
        var nodeMap : { [name: string] : ForceGraphSelectableNode } = {};
        var linkList : IForceGraphLink[] = [];
        var table = dataView.table;
        
        var colMap = {};
        dataView.metadata.columns.forEach((c, i) => {
            Object.keys(c.roles).forEach(role => {
                colMap[role] = i;    
            });
        });
        
        // group defines the bundle basically
        // name, user friendly name,
        // num, size of circle, probably meant to be the number of matches
        // source - array index into nodes
        // target - array index into node
        // value - The number of times that the link has been made, ie, I emailed bob@gmail.com 10 times, so value would be 10

        var roles = GraphVisual.DATA_ROLES;
        var sourceIdx = colMap[roles.source.name];
        var sourceColorIdx = colMap[roles.sourceColor.name];
        var sourceLabelColorIdx = colMap[roles.sourceLabelColor.name];
        // var sourceGroup = colMap[roles.sourceGroup.name];
        // var targetGroupIdx = colMap[roles.targetGroup.name];
        var targetColorIdx = colMap[roles.targetColor.name];
        var targetLabelColorIdx = colMap[roles.targetLabelColor.name];
        var targetIdx = colMap[roles.target.name];
        // var edgeValueIdx = colMap[roles.edgeValue.name];

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
                    source: getNode(sourceId, identity, true, row[sourceColorIdx], row[sourceLabelColorIdx]/*, row[sourceGroup]*/).index,
                    target: getNode(targetId, identity, false, row[targetColorIdx], row[targetLabelColorIdx]/*, row[targetGroupIdx]*/).index,
                    value: undefined//row[edgeValueIdx]
                };
                nodeList[edge.source].num += 1;
                nodeList[edge.target].num += 1;
                linkList.push(edge);
            }
        });
        
        const maxNodes = settings.layout.maxNodeCount;
        if (typeof maxNodes === "number" && maxNodes > 0) {
            nodeList = nodeList.slice(0, maxNodes);
            linkList = linkList.filter(n => n.source < maxNodes && n.target < maxNodes);
        }

        return {
            nodes: nodeList,
            links: linkList
        };
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
            $.extend(true, this.settings, GraphVisual.DEFAULT_SETTINGS, newObjects ? newObjects : {}, {
                layout: {
                    defaultLabelColor: newObjects &&
                        newObjects["layout"] &&
                        newObjects["layout"]["defaultLabelColor"] && 
                        newObjects["layout"]["defaultLabelColor"].solid.color
                }
            });

            // There were some changes to the layout
            if (!_.isEqual(oldSettings.layout, this.settings.layout)) {
                this.myGraph.configuration = $.extend(true, {}, this.settings.layout);
            }
            
            if (oldSettings.layout.maxNodeCount !== this.settings.layout.maxNodeCount) {
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
    layout?: {
        animate?: boolean;
        maxNodeCount?: number;
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