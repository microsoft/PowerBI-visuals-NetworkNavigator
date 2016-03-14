import EventEmitter from '../../base/EventEmitter';
const $ = require("jquery");
import * as _ from "lodash";

/**
 * Class which represents the force graph
 */
/* @Mixin(EventEmitter) */
export class ForceGraph {
    private element: JQuery;
    private svg: any;
    private vis: any;
    private force: any;
    private zoom: any;
    private graph: IForceGraphData<IForceGraphNode>;
    private _dimensions: { width: number; height: number; };
    private _selectedNode : IForceGraphNode;
    private _configuration : IForceGraphConfiguration = {
        animate: true,
        linkDistance: 10,
        linkStrength: 2,
        charge: -120,
        gravity: .1,
        labels: false,
        minZoom: .1,
        maxZoom: 100,
        defaultLabelColor: "blue"
    };

    /**
     * The event emitter for this graph
     */
    public events = new EventEmitter();

    /**
     * My template string
     */
    private template = `
        <div class="graph-container">
            <div class="button-bar">
                <ul>
                    <li class="filter-box" title="Filter Nodes">
                        <input type="text" placeholder="Enter text filter" class="search-filter-box"/>
                    </li>
                    <li class="clear-selection" title="Clear Selection">
                        <a>
                            <span class="fa-stack">
                                <i class="fa fa-check fa-stack-1x"></i>
                                <i class="fa fa-ban fa-stack-2x"></i>
                            </span>
                        </a>
                    </li>
                </ul>
            </div>
            <div class="svg-container">
            </div>
        </div>
    `.trim().replace(/\n/g, "");

    /**
     * The svg container
     */
    private svgContainer: JQuery;

    /**
     * Constructor for the force graph
     */
    constructor(element: JQuery, width = 500, height = 500) {
        this.element = $(this.template);
        element.append(this.element);
        this.svgContainer = this.element.find(".svg-container");
        this.element.find(".clear-selection").on("click", () => {
            this.updateSelection(undefined);
        });
        const filterBox = this.element.find(".search-filter-box");
        filterBox.on('input', () => {
            this.filterNodes(filterBox.val());
        });

        this.dimensions = { width: width, height: height };
        this.svg = d3.select(this.svgContainer[0]).append("svg")
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
            this.svgContainer.css({ width: this.dimensions.width, height: this.dimensions.height });
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
        newConfig = $.extend(true, {}, this._configuration, newConfig);
        if (this.force) {
            var runStart;

            /**
             * Updates the config value if necessary, and returns true if it was updated
             */
            var updateForceConfig = (name: string, defaultValue: any) => {
                if (newConfig[name] !== this._configuration[name]) {
                    this.force[name](newConfig[name] || defaultValue);
                    return true;
                }
            };

            runStart = runStart || updateForceConfig("linkDistance", 10);
            runStart = runStart || updateForceConfig("linkStrength", 2);
            runStart = runStart || updateForceConfig("charge", -120);
            runStart = runStart || updateForceConfig("gravity", .1);

            if (newConfig.minZoom !== this._configuration.minZoom ||
                newConfig.maxZoom !== this._configuration.maxZoom) {
                this.zoom.scaleExtent([newConfig.minZoom, newConfig.maxZoom]);
            }

            if (runStart && this.configuration.animate) {
                this.force.start();
            } else if (!this.configuration.animate) {
                this.force.stop();
            }

            if (newConfig.labels !== this._configuration.labels) {
                this.vis.selectAll(".node text")
                    .style("opacity", newConfig.labels ? 100 : 0);
            }
        }

        this._configuration = newConfig;
    }

    /**
     * Alias for getData
     */
    public get data() : IForceGraphData<IForceGraphNode> {
        return this.getData();
    }

    /**
     * Alias for setData
     */
    public set data(graph: IForceGraphData<IForceGraphNode>) {
        this.setData(graph);
    }

    /**
     * Redraws the force graph
     */
    public redraw() {
        if (this.vis && d3.event) {
            var zoomEvt = <any>d3.event;
            this.vis.attr("transform", `translate(${zoomEvt.translate}) scale(${zoomEvt.scale})`);
        }
    }

    /**
     * Gets the data associated with this graph
     */
    public getData() : IForceGraphData<IForceGraphNode> {
        return this.graph;
    }

    /**
     * Sets the data for this force graph
     */
    public setData(graph: IForceGraphData<IForceGraphNode>) {
        var me = this;
        this.graph = graph;

        this.zoom = d3.behavior.zoom()
            .scaleExtent([this._configuration.minZoom, this._configuration.maxZoom])
            .on("zoom", () => this.redraw());

        var drag = d3.behavior.drag()
            .origin(function(d) { return <any>d; })
        // Function is important here
            .on("dragstart", function(d) {
                (<any>d3.event).sourceEvent.stopPropagation();
                d3.select(this).classed("dragging", true);
                me.force.start();
            })
            .on("drag", function(d : any) {
                var evt = <any>d3.event;
                d3.select(this).attr("cx", d.x = evt.x).attr("cy", d.y = evt.y);
            })
            .on("dragend", function(d) {
                d3.select(this).classed("dragging", false);
            });

        this.svg.remove();

        this.svg = d3.select(this.svgContainer[0]).append("svg")
            .attr("width", this.dimensions.width)
            .attr("height", this.dimensions.height)
        //  .attr("viewBox", "0 0 " + width + " " + height )
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("pointer-events", "all")
        // Function is important here
            .call(this.zoom);
        this.vis = this.svg.append('svg:g');

        var nodes = graph.nodes.slice();
        var links = [];
        var bilinks = [];

        graph.links.forEach(function(link) {
            var s = nodes[link.source];
            var t = nodes[link.target];
            var w = link.value;
            var i = {}; // intermediate node
            nodes.push(<any>i);
            links.push({ source: s, target: i }, { source: i, target: t });
            bilinks.push([s, i, t, w]);
        });

        this.force.nodes(nodes).links(links);
        
        // If we have animation on, then start that beast
        if (this.configuration.animate) {
            this.force.start();
        }

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
            .attr("r", (d) => Math.log(((d.num || 1) * 100)))
            .style("fill", (d) => d.color)
            .style("stroke", "red")
            .style("stroke-width", (d) => d.selected ? 1 : 0)
            .style("opacity", 1);

        node.on("click", (n) => {
            this.events.raiseEvent("nodeClicked", n);
            this.updateSelection(n);
        });

        node.on("mouseover", () => {
            d3.select(this.svgContainer.find("svg text")[0]).style("opacity", "100");
        });
        node.on("mouseout", () => {
            if (!this._configuration.labels) {
                d3.select(this.svgContainer.find("svg text")[0]).style("opacity", "0");
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
            .attr("class", "node-label")
            .text(function(d) { return d.name; })
            .attr("fill", (d) => d.labelColor || this.configuration.defaultLabelColor)
            .attr("stroke", (d) => d.labelColor || this.configuration.defaultLabelColor)
            .attr("font-size", "5pt")
            .attr("stroke-width", "0.5px")
            .style("opacity", this._configuration.labels ? 100 : 0);
           
        // If we are not animating, then play the force quickly
        if (!this.configuration.animate) {
            let k = 0;
            // Alpha measures the amount of movement
            while ((this.force.alpha() > 1e-2) && (k < 150)) {
                this.force.tick();
                k = k + 1;
            }
            this.force.stop();
        }

        this.force.on("tick", () => {
            if (this.configuration.animate) {
                link.attr("x1", (d) => d[0].x)
                    .attr("y1", (d) => d[0].y)
                    .attr("x2", (d) => d[2].x)
                    .attr("y2", (d) => d[2].y);
                node.attr("transform", (d) => `translate(${d.x},${d.y})`);
            }
        });
    }

    /**
     * Redraws the selections on the nodes
     */
    public redrawSelection() {
        this.vis.selectAll(".node circle")
            .style("stroke-width", (d) => d.selected ? 1 : 0);
    }
    
    /**
     * Redraws the node labels
     */
    public redrawLabels() {
        this.vis.selectAll(".node .node-label")
            .attr("fill", (d) => d.labelColor || this.configuration.defaultLabelColor)
            .attr("stroke", (d) => d.labelColor || this.configuration.defaultLabelColor);
    }

    /**
     * Filters the nodes to the given string
     */
    public filterNodes(text: string, animate = true) {
        let test = "";
        let temp = this.vis.selectAll(".node circle");
        if (animate) {
            temp = temp
                .transition()
                .duration(500)
                .delay(100);
        }
        temp.attr("transform", (d) => {
            let scale = 1;
            if (text && d.name.indexOf(text) >= 0) {
                scale = 3;
            }
            return `scale(${scale})`;
        });
    }

    /**
     * Updates the selection based on the given node
     */
    private updateSelection(n? : IForceGraphNode) {
        if (n !== this._selectedNode) {
            if (this._selectedNode) {
                this._selectedNode.selected = false;
            }
            if (n) {
                n.selected = true;
            }
            this._selectedNode = n;
        } else {
            if (this._selectedNode) {
                this._selectedNode.selected = false;
            }
            this._selectedNode = undefined;
        }
        this.events.raiseEvent('selectionChanged', this._selectedNode);
        this.redrawSelection();
    }
}

/**
 * The node in a force graph
 */
export interface IForceGraphNode {
    /**
     * The name of the node
     */
    name?: string;

    /**
     * The color of the node
     */
    color?: string;
    
    /**
     * The color of the label of the node
     */
    labelColor?: string;

    /**
     * The size of the node
     */
    num?: number;

    /**
     * Whether or not the given node is selected
     */
    selected: boolean;
}

/**
 * Represents a link in the force graph
 */
export interface IForceGraphLink {
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
export interface IForceGraphData<NodeType> {

    /**
     * The list of the nodes in the force graph
     */
    nodes?: NodeType[];

    /**
     * The links in the force graph
     */
    links?: IForceGraphLink[];
}

/**
 * Represents the configuration for the force graph
 */
export interface IForceGraphConfiguration {
    animate?: boolean;
    linkDistance?: number;
    linkStrength?: number;
    charge?: number;
    gravity?: number;
    labels?: boolean;
    minZoom?: number;
    maxZoom?: number;
    defaultLabelColor?: string;
}