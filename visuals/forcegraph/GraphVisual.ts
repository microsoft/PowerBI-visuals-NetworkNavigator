/// <reference path="../../base/references.d.ts"/>
/// <reference path="../../base/VisualBase.ts"/>

declare var _;

module powerbi.visuals {
    export class GraphVisual extends VisualBase implements IVisual {
        private dataViewTable: DataViewTable;
        private myGraph: ForceGraph;
        private _selectedNode : IForceGraphNode;
        private host : IVisualHostServices;

        private static DEFAULT_SETTINGS: GraphVisualSettings = {
            columnMappings: {
                source: "source",
                target: "target",
                edgeValue: "value",
                sourceColor: "sourceColor",
                targetColor: "targetColor",
                sourceGroup: "sourceGroup",
                targetGroup: "targetGroup"
            },
            layout: {
                linkDistance: 10,
                linkStrength: 2,
                gravity: .1,
                charge: -120,
                labels: false
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
                        targetColor: {
                            displayName: "Target Node Color Column",
                            type: { text: true }
                        }
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
                        }
                    }
                }
            }
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
            this.myGraph.addEventListener("nodeClicked", (node) => this.onNodeSelected(node));
            this.host = options.host;
        }

        /** Update is called for data updates, resizes & formatting changes */
        public update(options: VisualUpdateOptions) {
            super.update(options);

            var dataView = options.dataViews && options.dataViews.length && options.dataViews[0];
            var dataViewTable = dataView && dataView.table;
            var forceDataReload = this.updateSettings(options);

            if (dataViewTable && (forceDataReload || this.hasDataChanged(this.dataViewTable, dataViewTable))) {
                this.myGraph.setData(GraphVisual.converter(dataView, this.settings));
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
        public static converter(dataView: DataView, settings: GraphVisualSettings): IForceGraphData {
            var nodeList = [];
            var nodeMap = {};
            var nodeList = [];
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
            var sourceGroup = colMap[settings.columnMappings.sourceGroup.toLocaleLowerCase()];
            var targetGroupIdx = colMap[settings.columnMappings.targetGroup.toLocaleLowerCase()];
            var targetColorIdx = colMap[settings.columnMappings.targetColor.toLocaleLowerCase()];
            var targetIdx = colMap[settings.columnMappings.target.toLocaleLowerCase()];
            var edgeValueIdx = colMap[settings.columnMappings.edgeValue.toLocaleLowerCase()];

            function getNode(id: string, identity: DataViewScopeIdentity, color: string = "gray", group: number = 0) {
                var node = nodeMap[id];
                if (!nodeMap[id]) {
                    node = nodeMap[id] = {
                        name: id,
                        color: color || "gray",
                        // group: group || 0,
                        index: nodeList.length,
                        filterExpr: identity.expr,
                        num: 1
                    };
                    nodeList.push(node);
                }
                return node;
            }

            table.rows.forEach((row, idx) => {
                var identity = table.identity[idx];
                var edge = {
                    source: getNode(row[sourceIdx], identity, row[sourceColorIdx], row[sourceGroup]).index,
                    target: getNode(row[targetIdx], identity, row[targetColorIdx], row[targetGroupIdx]).index,
                    value: row[edgeValueIdx]
                };
                nodeList[edge.source].num += 1;
                nodeList[edge.target].num += 1;
                linkList.push(edge);
            });

            return {
                nodes: nodeList,
                links: linkList
            };
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
         * Gets called when a node is selected
         */
        private onNodeSelected(node: { filterExpr: data.SQExpr }) {
            var filter;
            if (node && node !== this._selectedNode) {
                filter = powerbi.data.SemanticFilter.fromSQExpr(node.filterExpr);
            } else {
                node = undefined;
            }
            this._selectedNode = <IForceGraphNode>node;

            var objects: VisualObjectInstancesToPersist = {
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
            targetColor?: string;
            sourceGroup?: string;
            targetGroup?: string;
        };
        layout?: {
            linkDistance?: number;
            linkStrength?: number;
            gravity?: number;
            charge?: number;
            labels?: boolean;
        }
    }

    /**
     * Class which represents the force graph
     */
    class ForceGraph {
        private element: JQuery;
        private svg: D3.Selection;
        private vis: D3.Selection;
        private force: D3.Layout.ForceLayout;
        private _dimensions: { width: number; height: number; };
        private _configuration: any = {
            linkDistance: 10,
            linkStrength: 2,
            charge: -120,
            gravity: .1,
            labels: false
        };
        private listeners : { [id: string] : Function[]; } = { };

        /**
         * Constructor for the force graph
         */
        constructor(element: JQuery, width = 500, height = 500) {
            this.element = element;
            this.dimensions = { width: width, height: height };
            this.svg = d3.select(this.element[0]).append("svg")
                .attr("width", width)
                .attr("height", height);
            this.force = d3.layout.force()
                .linkDistance(10)
                .linkStrength(2)
                .gravity(.1)
                .charge(-120)
                .size([width, height]);
            this.vis = this.svg.append('svg:g');
        }

        /**
         * Returns the dimensions of this graph
         */
        public get dimensions() {
            return this._dimensions;
        }

        /**
         * Setter for the dimensions
         */
        public set dimensions(newDimensions) {
            this._dimensions = {
                width: newDimensions.width || this.dimensions.width,
                height: newDimensions.height || this.dimensions.height
            };
            if (this.force) {
                this.force.size([this.dimensions.width, this.dimensions.height]);
                this.force.resume();
                this.element.css({ width: this.dimensions.width, height: this.dimensions.height });
                this.svg.attr({ width: this.dimensions.width, height: this.dimensions.height });
            }
        }

        /**
         * Returns the configuration of this graph
         */
        public get configuration() {
            return this._configuration;
        }

        /**
         * Setter for the configuration
         */
        public set configuration(newConfig) {
            var newConfig = $.extend(true, {}, this._configuration, newConfig);
            if (this.force) {
                var runStart;

                /**
                 * Updates the config value if necessary, and returns true if it was updated
                 */
                var updateForceConfig = (name : string, defaultValue : any) => {
                    if (newConfig[name] !== this._configuration[name]) {
                        this.force[name](newConfig[name] || defaultValue);
                        return true;
                    }
                };

                runStart = runStart || updateForceConfig("linkDistance", 10);
                runStart = runStart || updateForceConfig("linkStrength", 2);
                runStart = runStart || updateForceConfig("charge", -120);
                runStart = runStart || updateForceConfig("gravity", .1);

                if (runStart) {
                    this.force.start();
                }

                if (newConfig.labels !== this._configuration.labels) {
                    this.vis.selectAll(".node text")
                        .style("opacity", newConfig.labels ? 100 : 0);
                }
            }

            this._configuration = newConfig;
        }

        /**
         * Redraws the force graph
         */
        public redraw() {
            if (this.vis && d3.event) {
                this.vis.attr("transform", `translate(${d3.event.translate}) scale(${d3.event.scale})`);
            }
        }

        /**
         * Sets the data for this force graph
         */
        public setData(graph: IForceGraphData) {
            var me = this;

            var zoom = d3.behavior.zoom()
                .scaleExtent([1, 10])
                .on("zoom", () => this.redraw());

            var drag = d3.behavior.drag()
                .origin(function(d) { return d; })
                // Function is important here
                .on("dragstart", function (d) {
                    d3.event.sourceEvent.stopPropagation();
                    d3.select(this).classed("dragging", true);
                    me.force.start();
                })
                .on("drag", function(d) {
                    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y)
                })
                .on("dragend", function(d) {
                    d3.select(this).classed("dragging", false);
                });

            this.svg.remove();

            this.svg = d3.select(this.element[0]).append("svg")
                .attr("width", this.dimensions.width)
                .attr("height", this.dimensions.height)
            //  .attr("viewBox", "0 0 " + width + " " + height )
                .attr("preserveAspectRatio", "xMidYMid meet")
                .attr("pointer-events", "all")
                // Function is important here
                .call(zoom);
            this.vis = this.svg.append('svg:g');

            var nodes = graph.nodes.slice();
            var links = [];
            var bilinks = [];

            graph.links.forEach(function(link) {
                var s = nodes[link.source];
                var t = nodes[link.target];
                var w = link.value;
                var i = {}; // intermediate node
                nodes.push(i);
                links.push({ source: s, target: i }, { source: i, target: t });
                bilinks.push([s, i, t, w]);
            });

            this.force.nodes(nodes).links(links).start();

            this.vis.append("svg:defs").selectAll("marker")
                .data(["end"])
                .enter()
                .append("svg:marker")
                .attr("id", String)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 15)
                .attr("refY", 0)
                .attr("markerWidth", 7)
                .attr("markerHeight", 7)
                .attr("orient", "auto")
                .append("svg:path")
                .attr("d", "M0,-5L10,0L0,5");

            var link = this.vis.selectAll(".link")
                .data(bilinks)
                .enter().append("line")
                .attr("class", "link")
                .style("stroke", "gray")
                .style("stroke-width", function(d) {
                    var w = 0.15 + (d[3] / 500);
                    return (w > 3) ? 3 : w;
                })
                .attr("id", function(d) {
                    return d[0].name.replace(/\./g, '_').replace(/@/g, '_') + '_' +
                        d[2].name.replace(/\./g, '_').replace(/@/g, '_');
                });

            var node = this.vis.selectAll(".node")
                .data(graph.nodes)
                .enter().append("g")
                .call(drag)
                .attr("class", "node");

            node.append("svg:circle")
                .attr("r", (d) => Math.log((d.num * 100)))
                .style("fill", (d) => d.color)
                .style("opacity", 1);

            node.on("click", (n) => {
                this.raiseEvent("nodeClicked", n);
            });

            node.on("mouseover", () => {
                console.log("mouseover");
                d3.select(this.element.find("svg text")[0]).style("opacity", "100");
            });
            node.on("mouseout", () => {
                if (!this._configuration.labels) {
                    d3.select(this.element.find("svg text")[0]).style("opacity", "0");
                }
            });

            link.append("svg:text")
                .text(function(d) { return 'yes'; })
                .attr("fill", "black")
                .attr("stroke", "black")
                .attr("font-size", "5pt")
                .attr("stroke-width", "0.5px")
                .attr("class", "linklabel")
                .attr("text-anchor", "middle")
                .style("opacity", function() {
                    return 100;
                });

            link.on("click", function(n) { console.log(n); });

            node.append("svg:text")
                .text(function(d) { return d.name; })
                .attr("fill", "blue")
                .attr("stroke", "blue")
                .attr("font-size", "5pt")
                .attr("stroke-width", "0.5px")
                .style("opacity", this._configuration.labels ? 100 : 0);

            this.force.on("tick", function() {
                link.attr("x1", (d) => d[0].x)
                    .attr("y1", (d) => d[0].y)
                    .attr("x2", (d) => d[2].x)
                    .attr("y2", (d) => d[2].y);
                node.attr("transform", (d) => `translate(${d.x},${d.y})`);
            });
        }

        /**
         * Adds an event listener for the given event
         */
        public addEventListener(name: string, handler: Function) {
            var listeners = this.listeners[name] = this.listeners[name] || [];
            listeners.push(handler);
        }

        /**
         * Removes an event listener for the given event
         */
        public removeEventListener(name: string, handler: Function) {
            var listeners = this.listeners[name];
            if (listeners) {
                var idx = listeners.indexOf(handler);
                if (idx >= 0) {
                    listeners.splice(idx, 1);
                }
            }
        }

        /**
         * Raises the given event
         */
        private raiseEvent(name: string, ...args: any[]) {
            var listeners = this.listeners[name];
            if (listeners) {
                listeners.forEach((l) => {
                   l.apply(this, args);
                });
            }
        }
    }

    /**
     * The node in a force graph
     */
    interface IForceGraphNode {
        /**
         * The name of the node
         */
        name?: string;

        /**
         * The color of the node
         */
        color?: string;
    }

    /**
     * Represents a link in the force graph
     */
    interface IForceGraphLink {
        /**
         * The source node, index into the nodes list
         */
        source?: number;

        /**
         * The target node, index into the nodes list
         */
        target?: number;

        /**
         * The value of the link, basically the weight of the edge
         */
        value?: number;
    }

    /**
     * The data for the force graph
     */
    interface IForceGraphData {

        /**
         * The list of the nodes in the force graph
         */
        nodes?: IForceGraphNode[];

        /**
         * The links in the force graph
         */
        links?: IForceGraphLink[];
    }
}